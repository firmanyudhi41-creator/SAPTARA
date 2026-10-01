<?php

namespace Tests\Feature;

use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Database\Seeders\HabitSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReportPdfTest extends TestCase
{
    use RefreshDatabase;

    private School $school;

    private User $teacherUser;

    private Teacher $teacher;

    private SchoolClass $class;

    private Student $student;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        // Setup Habits default
        $this->seed(HabitSeeder::class);

        $this->school = School::create([
            'npsn' => '12345678',
            'name' => 'SD Negeri 1 Samudra',
            'address' => 'Jl. Bahari No. 1',
            'city' => 'Semarang',
            'province' => 'Jawa Tengah',
            'phone' => '024-123456',
            'email' => 'info@sdn1samudra.sch.id',
            'logo' => null,
            'stamp' => null,
            'is_active' => true,
        ]);

        $this->teacherUser = User::create([
            'name' => 'Budi Santoso',
            'email' => 'budi@sdn1samudra.sch.id',
            'password' => bcrypt('password123'),
            'role' => 'teacher',
            'school_id' => $this->school->id,
        ]);

        $this->teacher = Teacher::create([
            'user_id' => $this->teacherUser->id,
            'school_id' => $this->school->id,
            'display_name' => 'Budi Santoso, S.Pd.',
            'nip' => '198501012010011001',
            'title' => 'Guru Kelas 4A',
            'signature' => null,
        ]);

        $this->class = SchoolClass::create([
            'teacher_id' => $this->teacher->id,
            'school_id' => $this->school->id,
            'class_code' => '4A',
            'ship_name' => 'KRI Dewaruci',
            'semester' => 'Ganjil',
            'tahun_ajaran' => '2026/2027',
        ]);

        $this->student = Student::create([
            'school_id' => $this->school->id,
            'class_id' => $this->class->id,
            'name' => 'Arya Samudra',
            'nis' => '2026001',
            'avatar' => '👦',
            'xp' => 350,
            'coins' => 150,
            'streak' => 5,
        ]);
    }

    public function test_school_admin_can_upload_school_stamp(): void
    {
        $adminUser = User::create([
            'name' => 'Admin Sekolah',
            'email' => 'admin@sdn1samudra.sch.id',
            'password' => bcrypt('password123'),
            'role' => 'school_admin',
            'school_id' => $this->school->id,
        ]);

        Sanctum::actingAs($adminUser);

        $fakeStamp = UploadedFile::fake()->image('stamp.png', 200, 200);

        $response = $this->postJson('/api/school-admin/profile', [
            'name' => 'SD Negeri 1 Samudra Baru',
            'stamp' => $fakeStamp,
        ]);

        $response->assertOk();
        $this->school->refresh();
        $this->assertNotNull($this->school->stamp);
        $this->assertStringContainsString('.png', $this->school->stamp);
    }

    public function test_teacher_can_update_profile_and_digital_signature(): void
    {
        Sanctum::actingAs($this->teacherUser);

        $fakeSignature = UploadedFile::fake()->image('ttd_budi.png', 300, 150);

        $response = $this->postJson('/api/teacher/profile', [
            'display_name' => 'Budi Santoso, M.Pd.',
            'nip' => '198501012010011002',
            'title' => 'Wali Kelas 4A Unggulan',
            'signature' => $fakeSignature,
        ]);

        $response->assertOk();
        $this->teacher->refresh();
        $this->assertEquals('Budi Santoso, M.Pd.', $this->teacher->display_name);
        $this->assertEquals('198501012010011002', $this->teacher->nip);
        $this->assertEquals('Wali Kelas 4A Unggulan', $this->teacher->title);
        $this->assertNotNull($this->teacher->signature);
    }

    public function test_export_student_pdf_report_succeeds(): void
    {
        Sanctum::actingAs($this->teacherUser);

        $response = $this->get("/api/reports/student/{$this->student->id}/pdf");

        $response->assertOk();
        $response->assertHeader('content-type', 'application/pdf');
        $this->assertNotEmpty($response->getContent());
    }

    public function test_export_class_summary_pdf_report_succeeds(): void
    {
        Sanctum::actingAs($this->teacherUser);

        $response = $this->get("/api/reports/class/{$this->class->id}/pdf");

        $response->assertOk();
        $response->assertHeader('content-type', 'application/pdf');
        $this->assertNotEmpty($response->getContent());
    }

    public function test_export_pdf_uses_school_relationship(): void
    {
        Sanctum::actingAs($this->teacherUser);

        $secondClass = SchoolClass::create([
            'teacher_id' => $this->teacher->id,
            'school_id' => $this->school->id,
            'class_code' => '5B',
            'ship_name' => 'KRI Dewaruci 2',
            'semester' => 'Genap',
            'tahun_ajaran' => '2026/2027',
        ]);

        $secondStudent = Student::create([
            'school_id' => $this->school->id,
            'class_id' => $secondClass->id,
            'name' => 'Bambang Maritim',
            'nis' => '2026099',
            'avatar' => '👦',
            'xp' => 120,
            'coins' => 50,
            'streak' => 2,
        ]);

        // Test export class summary PDF
        $classResponse = $this->get("/api/reports/class/{$secondClass->id}/pdf");
        $classResponse->assertOk();
        $classResponse->assertHeader('content-type', 'application/pdf');
        $this->assertNotEmpty($classResponse->getContent());

        // Test export student raport PDF
        $studentResponse = $this->get("/api/reports/student/{$secondStudent->id}/pdf");
        $studentResponse->assertOk();
        $studentResponse->assertHeader('content-type', 'application/pdf');
        $this->assertNotEmpty($studentResponse->getContent());
    }
}
