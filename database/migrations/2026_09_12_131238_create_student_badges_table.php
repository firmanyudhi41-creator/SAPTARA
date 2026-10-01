<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_badges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students', 'id', 'fk_student_badges_student_id')->cascadeOnDelete();
            $table->foreignId('habit_id')->constrained('habits', 'id', 'fk_student_badges_habit_id')->cascadeOnDelete();
            $table->foreignId('awarded_by_teacher_id')->nullable()->constrained('teachers', 'id', 'fk_student_badges_awarded_by_teacher_id')->nullOnDelete();
            $table->timestamp('awarded_at')->useCurrent();

            $table->unique(['student_id', 'habit_id'], 'idx_student_badges_student_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_badges');
    }
};
