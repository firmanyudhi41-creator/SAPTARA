<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add role to users
        if (! Schema::hasColumn('users', 'role')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('role', 20)->default('teacher')->after('password');
                $table->index('role', 'idx_users_role');
            });
        }

        // 2. Add school_id to teachers
        if (! Schema::hasColumn('teachers', 'school_id')) {
            Schema::table('teachers', function (Blueprint $table) {
                $table->foreignId('school_id')->nullable()->after('user_id')->constrained('schools', 'id', 'fk_teachers_school_id')->nullOnDelete();
                $table->index('school_id', 'idx_teachers_school_id');
            });
        }

        // 3. Add school_id to classes
        if (! Schema::hasColumn('classes', 'school_id')) {
            Schema::table('classes', function (Blueprint $table) {
                $table->foreignId('school_id')->nullable()->after('teacher_id')->constrained('schools', 'id', 'fk_classes_school_id')->cascadeOnDelete();
                $table->string('school_name')->nullable()->change();
                $table->index('school_id', 'idx_classes_school_id');
            });
        }

        // 4. Add school_id, nis, access_code to students
        if (! Schema::hasColumn('students', 'school_id')) {
            Schema::table('students', function (Blueprint $table) {
                $table->foreignId('school_id')->nullable()->after('id')->constrained('schools', 'id', 'fk_students_school_id')->cascadeOnDelete();
                $table->string('nis', 50)->nullable()->after('class_id');
                $table->string('access_code', 20)->nullable()->after('nis');

                $table->unique(['school_id', 'nis'], 'idx_students_school_id_nis');
                $table->index('access_code', 'idx_students_access_code');
            });
        }
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropForeign('fk_students_school_id');
        });

        Schema::table('students', function (Blueprint $table) {
            $table->dropUnique('idx_students_school_id_nis');
            $table->dropColumn(['school_id', 'nis', 'access_code']);
        });

        Schema::table('classes', function (Blueprint $table) {
            $table->dropForeign('fk_classes_school_id');
            $table->dropColumn('school_id');
        });

        Schema::table('teachers', function (Blueprint $table) {
            $table->dropForeign('fk_teachers_school_id');
            $table->dropColumn('school_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
