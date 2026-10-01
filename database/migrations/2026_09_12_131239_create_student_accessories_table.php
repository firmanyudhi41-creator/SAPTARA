<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_accessories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students', 'id', 'fk_student_accessories_student_id')->cascadeOnDelete();
            $table->string('accessory_id', 50);
            $table->timestamp('purchased_at')->useCurrent();

            $table->unique(['student_id', 'accessory_id'], 'idx_student_accessories_student_id_accessory_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_accessories');
    }
};
