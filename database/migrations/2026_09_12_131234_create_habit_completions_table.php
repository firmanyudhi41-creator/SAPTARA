<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('habit_completions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students', 'id', 'fk_habit_completions_student_id')->cascadeOnDelete();
            $table->foreignId('habit_id')->constrained('habits', 'id', 'fk_habit_completions_habit_id')->cascadeOnDelete();
            $table->date('date');
            $table->timestamp('completed_at')->useCurrent();

            $table->unique(['student_id', 'habit_id', 'date'], 'idx_habit_completions_student_id_habit_id');
            $table->index(['student_id', 'date'], 'idx_habit_completions_student_id_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('habit_completions');
    }
};
