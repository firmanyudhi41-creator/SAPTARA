<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('logbook_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students', 'id', 'fk_logbook_entries_student_id')->cascadeOnDelete();
            $table->foreignId('habit_id')->constrained('habits', 'id', 'fk_logbook_entries_habit_id')->cascadeOnDelete();
            $table->date('date');
            $table->time('time');
            $table->string('photo_url')->nullable();
            $table->text('caption');
            $table->enum('status', ['pending', 'verified', 'needs_revision'])->default('pending');
            $table->foreignId('reviewed_by_teacher_id')->nullable()->constrained('teachers', 'id', 'fk_logbook_entries_reviewed_by_teacher_id')->nullOnDelete();
            $table->text('teacher_comment')->nullable();
            $table->string('teacher_sticker')->nullable();
            $table->text('parent_comment')->nullable();
            $table->integer('xp_earned')->default(0);
            $table->timestamps();

            $table->index('student_id', 'idx_logbook_entries_student_id');
            $table->index('status', 'idx_logbook_entries_status');
            $table->index('date', 'idx_logbook_entries_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('logbook_entries');
    }
};
