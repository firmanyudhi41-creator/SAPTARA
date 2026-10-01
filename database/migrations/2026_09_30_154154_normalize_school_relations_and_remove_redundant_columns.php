<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $this->backfillSchoolRelations();
        $this->ensureSchoolRelationsCanBeRequired();

        Schema::table('classes', function (Blueprint $table) {
            $table->dropUnique('classes_class_code_school_name_unique');
            $table->dropForeign(['teacher_id']);
            $table->foreign('teacher_id')->references('id')->on('teachers')->restrictOnDelete();
            $table->foreignId('school_id')->nullable(false)->change();
            $table->unique(['school_id', 'class_code']);
            $table->unique(['id', 'school_id']);
            $table->dropColumn('school_name');
        });

        Schema::table('students', function (Blueprint $table) {
            $table->foreignId('school_id')->nullable(false)->change();
            $table->foreign(['class_id', 'school_id'])
                ->references(['id', 'school_id'])
                ->on('classes')
                ->cascadeOnDelete();
        });

        $duplicateParentUserId = DB::table('parents')
            ->select('user_id')
            ->groupBy('user_id')
            ->havingRaw('COUNT(*) > 1')
            ->value('user_id');

        if ($duplicateParentUserId !== null) {
            throw new RuntimeException("User {$duplicateParentUserId} memiliki lebih dari satu profil orang tua.");
        }

        Schema::table('parents', function (Blueprint $table) {
            $table->unique('user_id');
        });

        Schema::table('habits', function (Blueprint $table) {
            $table->dropColumn('is_custom');
        });

        Schema::dropIfExists('weekly_snapshots');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('weekly_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->date('week_start_date');
            $table->tinyInteger('day_of_week');
            $table->integer('completed_count')->default(0);
            $table->timestamp('created_at')->useCurrent();

            $table->index(['student_id', 'week_start_date']);
        });

        Schema::table('habits', function (Blueprint $table) {
            $table->boolean('is_custom')->default(false)->after('position_y');
        });

        DB::table('habits')->whereNotNull('class_id')->update(['is_custom' => true]);

        Schema::table('parents', function (Blueprint $table) {
            $table->dropUnique('parents_user_id_unique');
        });

        Schema::table('students', function (Blueprint $table) {
            $table->dropForeign(['class_id', 'school_id']);
            $table->foreignId('school_id')->nullable()->change();
        });

        Schema::table('classes', function (Blueprint $table) {
            $table->string('school_name', 150)->nullable()->after('school_id');
        });

        DB::table('classes')
            ->orderBy('id')
            ->get(['id', 'school_id'])
            ->each(function (object $class): void {
                $schoolName = DB::table('schools')->where('id', $class->school_id)->value('name');

                DB::table('classes')->where('id', $class->id)->update(['school_name' => $schoolName]);
            });

        Schema::table('classes', function (Blueprint $table) {
            $table->dropUnique('classes_school_id_class_code_unique');
            $table->dropUnique('classes_id_school_id_unique');
            $table->dropForeign(['teacher_id']);
            $table->foreign('teacher_id')->references('id')->on('teachers')->cascadeOnDelete();
            $table->foreignId('school_id')->nullable()->change();
            $table->unique(['class_code', 'school_name']);
        });
    }

    private function backfillSchoolRelations(): void
    {
        DB::table('teachers')
            ->whereNull('school_id')
            ->orderBy('id')
            ->get(['id', 'user_id'])
            ->each(function (object $teacher): void {
                $schoolId = DB::table('users')->where('id', $teacher->user_id)->value('school_id');

                if ($schoolId !== null) {
                    DB::table('teachers')->where('id', $teacher->id)->update(['school_id' => $schoolId]);
                }
            });

        DB::table('users')
            ->whereNull('school_id')
            ->where('role', 'teacher')
            ->orderBy('id')
            ->get(['id'])
            ->each(function (object $user): void {
                $schoolId = DB::table('teachers')->where('user_id', $user->id)->value('school_id');

                if ($schoolId !== null) {
                    DB::table('users')->where('id', $user->id)->update(['school_id' => $schoolId]);
                }
            });

        DB::table('classes')
            ->whereNull('school_id')
            ->orderBy('id')
            ->get(['id', 'teacher_id', 'school_name'])
            ->each(function (object $class): void {
                $schoolId = DB::table('teachers')->where('id', $class->teacher_id)->value('school_id');

                if ($schoolId === null && ! empty($class->school_name)) {
                    $schoolId = DB::table('schools')->where('name', $class->school_name)->value('id');
                }

                if ($schoolId !== null) {
                    DB::table('classes')->where('id', $class->id)->update(['school_id' => $schoolId]);
                }
            });

        DB::table('students')
            ->whereNull('school_id')
            ->orderBy('id')
            ->get(['id', 'class_id'])
            ->each(function (object $student): void {
                $schoolId = DB::table('classes')->where('id', $student->class_id)->value('school_id');

                if ($schoolId !== null) {
                    DB::table('students')->where('id', $student->id)->update(['school_id' => $schoolId]);
                }
            });
    }

    private function ensureSchoolRelationsCanBeRequired(): void
    {
        $classWithoutSchool = DB::table('classes')->whereNull('school_id')->value('id');

        if ($classWithoutSchool !== null) {
            throw new RuntimeException("Kelas {$classWithoutSchool} tidak dapat dipetakan ke sekolah.");
        }

        $studentWithoutSchool = DB::table('students')->whereNull('school_id')->value('id');

        if ($studentWithoutSchool !== null) {
            throw new RuntimeException("Siswa {$studentWithoutSchool} tidak dapat dipetakan ke sekolah.");
        }

        $duplicateClass = DB::table('classes')
            ->select(['school_id', 'class_code'])
            ->groupBy(['school_id', 'class_code'])
            ->havingRaw('COUNT(*) > 1')
            ->first();

        if ($duplicateClass !== null) {
            throw new RuntimeException(
                "Kode kelas {$duplicateClass->class_code} duplikat pada sekolah {$duplicateClass->school_id}."
            );
        }
    }
};
