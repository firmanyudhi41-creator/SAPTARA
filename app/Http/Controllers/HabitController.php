<?php

namespace App\Http\Controllers;

use App\Models\Habit;
use App\Models\HabitCompletion;
use App\Models\LogbookEntry;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Http\Request;

class HabitController extends Controller
{
    /** GET /api/habits \u2014 Daftar kebiasaan untuk siswa (7 pokok + kebiasaan khusus kelas) */
    public function index(Request $request)
    {
        $studentId = $request->_student_id;
        $student = $studentId ? Student::find($studentId) : null;
        $classId = $student?->class_id ?? $request->query('class_id');

        // 7 kebiasaan pokok (class_id IS NULL) + kebiasaan kelas siswa
        $habits = Habit::whereNull('class_id')
            ->when($classId, fn ($q) => $q->orWhere('class_id', $classId))
            ->orderBy('id')
            ->get();

        $today = Carbon::now('Asia/Jakarta')->toDateString();

        $completionsToday = [];
        if ($studentId) {
            $completionsToday = HabitCompletion::where('student_id', $studentId)
                ->where('date', $today)
                ->pluck('habit_id')
                ->toArray();
        }

        $result = $habits->map(fn ($h) => [
            'id' => $h->id,
            'name' => $h->name,
            'description' => $h->description,
            'icon' => $h->icon,
            'island' => $h->island,
            'badge' => $h->badge,
            'badge_icon' => $h->badge_icon,
            'color' => $h->color,
            'position_x' => $h->position_x,
            'position_y' => $h->position_y,
            'is_custom' => $h->class_id !== null,
            'class_id' => $h->class_id,
            'completed_today' => in_array($h->id, $completionsToday),
        ]);

        return response()->json($result);
    }

    /** POST /api/habits/toggle — Toggle penyelesaian habit hari ini */
    public function toggle(Request $request)
    {
        $request->validate(['habit_id' => 'required|integer|exists:habits,id']);

        $studentId = $request->_student_id;
        $habitId = $request->habit_id;
        $today = Carbon::now('Asia/Jakarta')->toDateString();

        $existing = HabitCompletion::where('student_id', $studentId)
            ->where('habit_id', $habitId)
            ->where('date', $today)
            ->first();

        if ($existing) {
            // Batalkan penyelesaian
            $existing->delete();
            $student = Student::find($studentId);
            if ($student) {
                $student->decrement('xp', 10);
                $student->decrement('coins', 5);

                // Cek apakah masih ada aktivitas lain hari ini (habit lain atau logbook)
                $hasOtherActivityToday = HabitCompletion::where('student_id', $studentId)
                    ->where('date', $today)
                    ->exists() || LogbookEntry::where('student_id', $studentId)
                    ->where('date', $today)
                    ->exists();

                if (! $hasOtherActivityToday) {
                    $student->recalculateStreak();
                }
            }

            return response()->json([
                'action' => 'uncompleted',
                'habit_id' => $habitId,
                'streak' => $student?->streak ?? 0,
            ]);
        }

        // Catat penyelesaian
        HabitCompletion::create([
            'student_id' => $studentId,
            'habit_id' => $habitId,
            'date' => $today,
        ]);

        $student = Student::find($studentId);
        $student->increment('xp', 10);
        $student->increment('coins', 5);

        // Update streak & cek milestone reward secara terpusat
        $milestoneReward = $student->recordDailyActivity($today);

        return response()->json([
            'action' => 'completed',
            'habit_id' => $habitId,
            'streak' => $student->streak,
            'milestoneReward' => $milestoneReward,
        ]);
    }

    /** POST /api/habits — Guru membuat kebiasaan khusus kelas */
    public function store(Request $request)
    {
        if (! $request->has('class_id') && $request->has('classId')) {
            $request->merge(['class_id' => $request->classId]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:50',
            'island' => 'nullable|string|max:100',
            'class_id' => 'required|integer|exists:classes,id',
        ]);

        $teacherId = $request->_teacher?->id;

        $habit = Habit::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? 'Kebiasaan khusus kelas',
            'icon' => $validated['icon'] ?? '⭐',
            'island' => $validated['island'] ?? 'Pulau Karakter Mandiri',
            'badge' => $validated['name'],
            'badge_icon' => $validated['icon'] ?? '⭐',
            'color' => '#0284c7',
            'position_x' => rand(20, 80),
            'position_y' => rand(20, 80),
            'created_by_teacher_id' => $teacherId,
            'class_id' => $validated['class_id'],
        ]);

        return response()->json([
            'message' => 'Kebiasaan kelas berhasil ditambahkan',
            'habit' => $habit,
        ], 201);
    }

    /** PUT /api/habits/{id} — Guru mengedit kebiasaan (nama, deskripsi, ikon, pulau) */
    public function update(Request $request, int $id)
    {
        $habit = Habit::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:50',
            'island' => 'nullable|string|max:100',
        ]);

        $habit->name = $validated['name'];
        if (array_key_exists('description', $validated)) {
            $habit->description = $validated['description'] ?? '';
        }
        if (! empty($validated['icon'])) {
            $habit->icon = $validated['icon'];
            $habit->badge_icon = $validated['icon'];
        }
        if (! empty($validated['island'])) {
            $habit->island = $validated['island'];
        }
        $habit->save();

        return response()->json([
            'message' => 'Kebiasaan berhasil diperbarui',
            'habit' => $habit,
        ]);
    }

    /** DELETE /api/habits/{id} — Guru menghapus kebiasaan khusus kelas (hanya jika belum pernah diisi) */
    public function destroy(Request $request, int $id)
    {
        $habit = Habit::findOrFail($id);

        if ($habit->class_id === null) {
            return response()->json(['error' => '7 Kebiasaan pokok Sapta Tara tidak dapat dihapus.'], 403);
        }

        $completionsCount = HabitCompletion::where('habit_id', $habit->id)->count();
        $logbooksCount = LogbookEntry::where('habit_id', $habit->id)->count();

        if ($completionsCount > 0 || $logbooksCount > 0) {
            return response()->json([
                'error' => "Kebiasaan ini sudah pernah diisi oleh siswa ({$completionsCount} checklist, {$logbooksCount} jurnal foto) sehingga tidak dapat dihapus agar riwayat siswa tidak rusak. Anda dapat mengedit nama atau keterangannya.",
            ], 422);
        }

        $habit->delete();

        return response()->json(['message' => 'Kebiasaan kelas berhasil dihapus']);
    }
}
