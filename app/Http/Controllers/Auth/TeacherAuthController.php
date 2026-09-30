<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class TeacherAuthController extends Controller
{
    /**
     * Teacher self-registration with multi-tenant school selection.
     */
    public function register(Request $request)
    {
        $request->validate([
            'school_id' => 'required|integer|exists:schools,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'teacher',
            'school_id' => $request->school_id,
        ]);

        $teacher = Teacher::create([
            'user_id' => $user->id,
            'school_id' => $request->school_id,
            'display_name' => $request->name,
        ]);

        $token = $user->createToken('teacher-auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'teacher' => [
                'id' => $teacher->id,
                'displayName' => $teacher->display_name,
                'schoolId' => $teacher->school_id,
                'school' => $teacher->school,
            ],
            'classes' => [],
        ], 201);
    }

    /**
     * Teacher login.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (! Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['error' => 'Kredensial tidak valid'], 401);
        }

        $user = Auth::user();
        $teacher = Teacher::with('school')->firstOrCreate(
            ['user_id' => $user->id],
            [
                'school_id' => $user->school_id,
                'display_name' => $user->name ?: explode('@', $user->email)[0],
            ]
        );

        if ($teacher->school_id === null && $user->school_id !== null) {
            $teacher->update(['school_id' => $user->school_id]);
        }
        if (! $teacher->relationLoaded('school')) {
            $teacher->load('school');
        }

        $token = $user->createToken('teacher-auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'teacher' => [
                'id' => $teacher->id,
                'displayName' => $teacher->display_name,
                'schoolId' => $teacher->school_id,
                'school' => $teacher->school,
            ],
            'classes' => $teacher->classes()->withCount('students')->get(),
        ]);
    }

    /**
     * Teacher logout.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Berhasil keluar']);
    }

    /**
     * Get authenticated teacher info.
     */
    public function me(Request $request)
    {
        $user = $request->user();
        $teacher = Teacher::with('school')->where('user_id', $user->id)->first();

        return response()->json([
            'user' => $user,
            'teacher' => $teacher,
        ]);
    }
}
