<?php

namespace App\Http\Controllers;

use App\Models\SchoolClass;
use Illuminate\Http\Request;

class ClassController extends Controller
{
    /** GET /api/classes — Guru: list semua kelas milik guru */
    public function index(Request $request)
    {
        $teacher = $request->_teacher;
        $classes = SchoolClass::with('school')
            ->withCount('students')
            ->where('teacher_id', $teacher->id)
            ->latest()
            ->get();

        return response()->json($classes);
    }

    /** POST /api/classes — Guru: buat kelas baru */
    public function store(Request $request)
    {
        if (! $request->has('class_code') && $request->has('classCode')) {
            $request->merge(['class_code' => $request->classCode]);
        }
        if (! $request->has('ship_name') && $request->has('shipName')) {
            $request->merge(['ship_name' => $request->shipName]);
        }

        $request->validate([
            'class_code' => 'required|string',
            'ship_name' => 'nullable|string',
        ]);

        $teacher = $request->_teacher;
        $teacher->loadMissing('school');

        if ($teacher->school_id === null || $teacher->school === null) {
            return response()->json(['error' => 'Akun guru belum terhubung dengan sekolah.'], 422);
        }

        $code = strtoupper($request->class_code);
        $shipName = $request->ship_name
            ?? 'Kapal '.last(explode(' ', $teacher->school->name)).' '.$code;

        $exists = SchoolClass::where('class_code', $code)
            ->where('school_id', $teacher->school_id)
            ->exists();

        if ($exists) {
            return response()->json(['error' => "Kelas $code di {$teacher->school->name} sudah terdaftar!"], 409);
        }

        $class = SchoolClass::create([
            'teacher_id' => $teacher->id,
            'school_id' => $teacher->school_id,
            'class_code' => $code,
            'ship_name' => $shipName,
            'semester' => $request->semester,
            'tahun_ajaran' => $request->tahun_ajaran,
        ]);

        return response()->json($class->load('school'), 201);
    }

    /** GET /api/classes/{id} — Detail kelas + daftar siswa */
    public function show(Request $request, int $id)
    {
        $class = SchoolClass::with(['school', 'students'])->findOrFail($id);

        return response()->json($class);
    }

    /** DELETE /api/classes/{id} — Guru: hapus kelas */
    public function destroy(Request $request, int $id)
    {
        $teacher = $request->_teacher;
        $class = SchoolClass::where('id', $id)
            ->where('teacher_id', $teacher->id)
            ->firstOrFail();
        $class->delete();

        return response()->json(['success' => true]);
    }
}
