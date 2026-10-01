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

        // 1. Drop index unik lama classes_class_code_school_name_unique / idx_classes_school_code_school_name
        $this->dropUniqueIndexIfExists('classes', ['class_code', 'school_name'], 'idx_classes_school_code_school_name');

        // 2. Drop foreign key teacher_id lama jika ada, lalu re-create dengan restrictOnDelete
        $this->dropForeignKeyIfExists('classes', ['teacher_id'], 'fk_classes_teacher_id');

        Schema::table('classes', function (Blueprint $table) {
            $table->foreign('teacher_id', 'fk_classes_teacher_id')
                ->references('id')
                ->on('teachers')
                ->restrictOnDelete();
            $table->foreignId('school_id')->nullable(false)->change();
        });

        // 3. Tambahkan unique index baru untuk classes dengan nama pasti
        if (! $this->hasUniqueIndex('classes', ['school_id', 'class_code'], 'idx_classes_school_id_class_code')) {
            Schema::table('classes', function (Blueprint $table) {
                $table->unique(['school_id', 'class_code'], 'idx_classes_school_id_class_code');
            });
        }

        if (! $this->hasUniqueIndex('classes', ['id', 'school_id'], 'idx_classes_id_school_id')) {
            Schema::table('classes', function (Blueprint $table) {
                $table->unique(['id', 'school_id'], 'idx_classes_id_school_id');
            });
        }

        if (Schema::hasColumn('classes', 'school_name')) {
            Schema::table('classes', function (Blueprint $table) {
                $table->dropColumn('school_name');
            });
        }

        // 4. Update tabel students
        Schema::table('students', function (Blueprint $table) {
            $table->foreignId('school_id')->nullable(false)->change();
        });

        if (! $this->hasForeignKey('students', ['class_id', 'school_id'], 'fk_students_class_id_school_id')) {
            Schema::table('students', function (Blueprint $table) {
                $table->foreign(['class_id', 'school_id'], 'fk_students_class_id_school_id')
                    ->references(['id', 'school_id'])
                    ->on('classes')
                    ->cascadeOnDelete();
            });
        }

        // 5. Validasi dan tambahkan unique user_id pada parents
        $duplicateParentUserId = DB::table('parents')
            ->select('user_id')
            ->groupBy('user_id')
            ->havingRaw('COUNT(*) > 1')
            ->value('user_id');

        if ($duplicateParentUserId !== null) {
            throw new RuntimeException("User {$duplicateParentUserId} memiliki lebih dari satu profil orang tua.");
        }

        if (! $this->hasUniqueIndex('parents', ['user_id'], 'idx_parents_user_id')) {
            Schema::table('parents', function (Blueprint $table) {
                $table->unique('user_id', 'idx_parents_user_id');
            });
        }

        $this->dropIndexIfExists('parents', 'parents_user_id_index');

        // 6. Bersihkan kolom dan tabel yang sudah tidak digunakan
        if (Schema::hasColumn('habits', 'is_custom')) {
            Schema::table('habits', function (Blueprint $table) {
                $table->dropColumn('is_custom');
            });
        }

        Schema::dropIfExists('weekly_snapshots');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('weekly_snapshots')) {
            Schema::create('weekly_snapshots', function (Blueprint $table) {
                $table->id();
                $table->foreignId('student_id')->constrained('students', 'id', 'fk_weekly_snapshots_student_id')->cascadeOnDelete();
                $table->date('week_start_date');
                $table->tinyInteger('day_of_week');
                $table->integer('completed_count')->default(0);
                $table->timestamp('created_at')->useCurrent();

                $table->index(['student_id', 'week_start_date'], 'idx_weekly_snapshots_student_id_week_start_date');
            });
        }

        if (! Schema::hasColumn('habits', 'is_custom')) {
            Schema::table('habits', function (Blueprint $table) {
                $table->boolean('is_custom')->default(false)->after('position_y');
            });

            DB::table('habits')->whereNotNull('class_id')->update(['is_custom' => true]);
        }

        // MySQL membutuhkan index pada kolom yang memiliki foreign key constraint (user_id).
        // Buat index pengganti sebelum drop unique index agar tidak memicu MySQL Error 1553.
        if ($this->hasUniqueIndex('parents', ['user_id'], 'idx_parents_user_id')) {
            Schema::table('parents', function (Blueprint $table) {
                $table->index('user_id', 'parents_user_id_index');
            });
            $this->dropUniqueIndexIfExists('parents', ['user_id'], 'idx_parents_user_id');
        }

        $this->dropForeignKeyIfExists('students', ['class_id', 'school_id'], 'fk_students_class_id_school_id');

        Schema::table('students', function (Blueprint $table) {
            $table->foreignId('school_id')->nullable()->change();
        });

        if (! Schema::hasColumn('classes', 'school_name')) {
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
        }

        $this->dropUniqueIndexIfExists('classes', ['school_id', 'class_code'], 'idx_classes_school_id_class_code');
        $this->dropUniqueIndexIfExists('classes', ['id', 'school_id'], 'idx_classes_id_school_id');
        $this->dropForeignKeyIfExists('classes', ['teacher_id'], 'fk_classes_teacher_id');

        Schema::table('classes', function (Blueprint $table) {
            $table->foreign('teacher_id', 'fk_classes_teacher_id')
                ->references('id')
                ->on('teachers')
                ->cascadeOnDelete();
            $table->foreignId('school_id')->nullable()->change();
        });

        if (! $this->hasUniqueIndex('classes', ['class_code', 'school_name'], 'idx_classes_school_code_school_name')) {
            Schema::table('classes', function (Blueprint $table) {
                $table->unique(['class_code', 'school_name'], 'idx_classes_school_code_school_name');
            });
        }
    }

    private function dropUniqueIndexIfExists(string $table, array $columns, string $fallbackName): void
    {
        $indexes = Schema::getIndexes($table);
        $targetColumns = collect($columns)->sort()->values()->all();

        $foundIndexName = null;
        $hasMatching = false;

        foreach ($indexes as $index) {
            if (empty($index['unique']) || ! empty($index['primary'])) {
                continue;
            }

            $idxCols = collect($index['columns'] ?? [])->sort()->values()->all();
            if ($idxCols === $targetColumns || (! empty($index['name']) && $index['name'] === $fallbackName)) {
                $hasMatching = true;
                if (! empty($index['name'])) {
                    $foundIndexName = $index['name'];
                }
                break;
            }
        }

        if ($hasMatching) {
            Schema::table($table, function (Blueprint $table) use ($columns, $foundIndexName) {
                if ($foundIndexName !== null) {
                    $table->dropUnique($foundIndexName);
                } else {
                    $table->dropUnique($columns);
                }
            });
        }
    }

    private function dropIndexIfExists(string $table, string $indexName): void
    {
        $indexes = Schema::getIndexes($table);
        foreach ($indexes as $index) {
            if ((! empty($index['name']) && $index['name'] === $indexName) && empty($index['primary'])) {
                Schema::table($table, function (Blueprint $table) use ($indexName) {
                    $table->dropIndex($indexName);
                });
                break;
            }
        }
    }

    private function dropForeignKeyIfExists(string $table, array $columns, string $fallbackName): void
    {
        $foreignKeys = Schema::getForeignKeys($table);
        $targetColumns = collect($columns)->sort()->values()->all();

        $foundFkName = null;
        $hasMatching = false;

        foreach ($foreignKeys as $fk) {
            $fkCols = collect($fk['columns'] ?? [])->sort()->values()->all();
            if ($fkCols === $targetColumns || (! empty($fk['name']) && $fk['name'] === $fallbackName)) {
                $hasMatching = true;
                if (! empty($fk['name'])) {
                    $foundFkName = $fk['name'];
                }
                break;
            }
        }

        if ($hasMatching) {
            Schema::table($table, function (Blueprint $table) use ($columns, $foundFkName) {
                if ($foundFkName !== null) {
                    $table->dropForeign($foundFkName);
                } else {
                    $table->dropForeign($columns);
                }
            });
        }
    }

    private function hasUniqueIndex(string $table, array $columns, string $name): bool
    {
        $indexes = Schema::getIndexes($table);
        $targetColumns = collect($columns)->sort()->values()->all();

        foreach ($indexes as $index) {
            if (empty($index['unique']) || ! empty($index['primary'])) {
                continue;
            }

            $idxCols = collect($index['columns'] ?? [])->sort()->values()->all();
            if ($idxCols === $targetColumns || (! empty($index['name']) && $index['name'] === $name)) {
                return true;
            }
        }

        return false;
    }

    private function hasForeignKey(string $table, array $columns, string $name): bool
    {
        $foreignKeys = Schema::getForeignKeys($table);
        $targetColumns = collect($columns)->sort()->values()->all();

        foreach ($foreignKeys as $fk) {
            $fkCols = collect($fk['columns'] ?? [])->sort()->values()->all();
            if ($fkCols === $targetColumns || (! empty($fk['name']) && $fk['name'] === $name)) {
                return true;
            }
        }

        return false;
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
