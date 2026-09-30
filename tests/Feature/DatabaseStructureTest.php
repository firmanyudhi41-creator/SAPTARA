<?php

namespace Tests\Feature;

use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DatabaseStructureTest extends TestCase
{
    use RefreshDatabase;

    public function test_redundant_database_columns_and_unused_table_are_removed(): void
    {
        $this->assertFalse(Schema::hasColumn('classes', 'school_name'));
        $this->assertFalse(Schema::hasColumn('habits', 'is_custom'));
        $this->assertFalse(Schema::hasTable('weekly_snapshots'));
    }

    public function test_teacher_created_class_inherits_school_relation(): void
    {
        $school = School::create([
            'npsn' => '87654321',
            'name' => 'SD Samudra',
        ]);

        $user = User::create([
            'name' => 'Guru Bahari',
            'email' => 'guru@samudra.test',
            'password' => 'password123',
            'role' => 'teacher',
            'school_id' => $school->id,
        ]);

        $teacher = Teacher::create([
            'user_id' => $user->id,
            'school_id' => $school->id,
            'display_name' => 'Guru Bahari',
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/classes', [
            'class_code' => '6A',
            'ship_name' => 'KRI Samudra',
        ]);

        $response->assertCreated()
            ->assertJsonPath('school_id', $school->id)
            ->assertJsonPath('teacher_id', $teacher->id)
            ->assertJsonPath('schoolName', $school->name);

        $this->assertDatabaseHas('classes', [
            'school_id' => $school->id,
            'class_code' => '6A',
        ]);

        $this->assertNotNull(SchoolClass::first()?->school);
    }

    public function test_student_school_must_match_class_school(): void
    {
        $schoolA = School::create(['npsn' => '11111111', 'name' => 'Sekolah A']);
        $schoolB = School::create(['npsn' => '22222222', 'name' => 'Sekolah B']);
        $user = User::create([
            'name' => 'Guru A',
            'email' => 'guru-a@example.test',
            'password' => 'password123',
            'role' => 'teacher',
            'school_id' => $schoolA->id,
        ]);
        $teacher = Teacher::create([
            'user_id' => $user->id,
            'school_id' => $schoolA->id,
            'display_name' => 'Guru A',
        ]);
        $class = SchoolClass::create([
            'teacher_id' => $teacher->id,
            'school_id' => $schoolA->id,
            'class_code' => '1A',
            'ship_name' => 'KRI A',
        ]);

        $this->expectException(QueryException::class);

        Student::create([
            'school_id' => $schoolB->id,
            'class_id' => $class->id,
            'name' => 'Siswa Tidak Konsisten',
        ]);
    }
}
