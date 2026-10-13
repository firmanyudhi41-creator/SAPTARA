<?php

namespace Tests\Feature;

use App\Models\Habit;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Database\Seeders\HabitSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class LogbookPhotoTest extends TestCase
{
    use RefreshDatabase;

    private School $school;

    private SchoolClass $class;

    private Student $student;

    private Habit $habit;

    private string $studentToken;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $this->seed(HabitSeeder::class);
        $this->habit = Habit::first();

        $this->school = School::create([
            'npsn' => '12345678',
            'name' => 'SD Negeri Bahari',
            'city' => 'Jakarta',
            'is_active' => true,
        ]);

        $teacherUser = User::create([
            'name' => 'Guru Bahari',
            'email' => 'guru@bahari.sch.id',
            'password' => bcrypt('password123'),
            'role' => 'teacher',
            'school_id' => $this->school->id,
        ]);

        $teacher = Teacher::create([
            'user_id' => $teacherUser->id,
            'school_id' => $this->school->id,
            'nip' => '1987654321',
            'display_name' => 'Guru Bahari',
        ]);

        $this->class = SchoolClass::create([
            'school_id' => $this->school->id,
            'teacher_id' => $teacher->id,
            'class_code' => 'KELAS-7A',
            'ship_name' => 'KRI Dewaruci',
            'level' => 7,
            'pin' => '1234',
        ]);

        $this->student = Student::create([
            'class_id' => $this->class->id,
            'school_id' => $this->school->id,
            'name' => 'Bintang Bahari',
            'nisn' => '0098765432',
            'avatar' => '👦',
            'xp' => 100,
            'coins' => 20,
        ]);

        $this->studentToken = JWTAuth::claims([
            'sub' => $this->student->id,
            'role' => 'student',
            'studentId' => $this->student->id,
            'classId' => $this->class->id,
        ])->fromUser($this->student);
    }

    /**
     * Membantu membuat file gambar JPEG asli dengan ukuran spesifik.
     */
    private function createRealImage(int $width, int $height, string $name = 'test.jpg'): UploadedFile
    {
        $tempPath = tempnam(sys_get_temp_dir(), 'img_').'.jpg';
        $im = imagecreatetruecolor($width, $height);
        $color = imagecolorallocate($im, 40, 140, 220);
        imagefill($im, 0, 0, $color);
        imagejpeg($im, $tempPath, 90);
        imagedestroy($im);

        return new UploadedFile($tempPath, $name, 'image/jpeg', null, true);
    }

    public function test_upload_landscape_photo_is_cropped_and_saved_to_960x1280()
    {
        // Buat gambar landscape 1920 x 1080
        $landscapeFile = $this->createRealImage(1920, 1080, 'landscape.jpg');

        $response = $this->withHeader('Authorization', 'Bearer '.$this->studentToken)
            ->post('/api/logbook', [
                'habit_id' => $this->habit->id,
                'caption' => 'Refleksi kegiatan pagi (foto mode landscape).',
                'photo' => $landscapeFile,
            ]);

        $response->assertStatus(201);
        $data = $response->json();
        $this->assertNotNull($data['photo_url']);

        // Verifikasi file yang disimpan di storage berukuran tepat 960 x 1280
        $relativePath = str_replace('/storage/', '', $data['photo_url']);
        Storage::disk('public')->assertExists($relativePath);

        $savedContent = Storage::disk('public')->get($relativePath);
        $savedImage = imagecreatefromstring($savedContent);

        $this->assertEquals(960, imagesx($savedImage), 'Lebar gambar hasil harus 960 piksel (3:4)');
        $this->assertEquals(1280, imagesy($savedImage), 'Tinggi gambar hasil harus 1280 piksel');

        imagedestroy($savedImage);
    }

    public function test_upload_portrait_photo_is_scaled_to_960x1280()
    {
        // Buat gambar portrait 1080 x 1920 (rasio 9:16)
        $portraitFile = $this->createRealImage(1080, 1920, 'portrait.jpg');

        $response = $this->withHeader('Authorization', 'Bearer '.$this->studentToken)
            ->post('/api/logbook', [
                'habit_id' => $this->habit->id,
                'caption' => 'Refleksi kegiatan sore (foto mode portrait).',
                'photo' => $portraitFile,
            ]);

        $response->assertStatus(201);
        $data = $response->json();

        $relativePath = str_replace('/storage/', '', $data['photo_url']);
        Storage::disk('public')->assertExists($relativePath);

        $savedContent = Storage::disk('public')->get($relativePath);
        $savedImage = imagecreatefromstring($savedContent);

        $this->assertEquals(960, imagesx($savedImage), 'Lebar gambar hasil harus 960 piksel (3:4)');
        $this->assertEquals(1280, imagesy($savedImage), 'Tinggi gambar hasil harus 1280 piksel');

        imagedestroy($savedImage);
    }

    public function test_upload_exact_960x1280_photo_is_stored_directly()
    {
        // Buat gambar yang sudah tepat 960 x 1280
        $exactFile = $this->createRealImage(960, 1280, 'exact_960x1280.jpg');

        $response = $this->withHeader('Authorization', 'Bearer '.$this->studentToken)
            ->post('/api/logbook', [
                'habit_id' => $this->habit->id,
                'caption' => 'Refleksi hasil crop pratinjau 3:4 (960x1280).',
                'photo' => $exactFile,
            ]);

        $response->assertStatus(201);
        $data = $response->json();

        $relativePath = str_replace('/storage/', '', $data['photo_url']);
        Storage::disk('public')->assertExists($relativePath);

        $savedContent = Storage::disk('public')->get($relativePath);
        $savedImage = imagecreatefromstring($savedContent);

        $this->assertEquals(960, imagesx($savedImage));
        $this->assertEquals(1280, imagesy($savedImage));

        imagedestroy($savedImage);
    }
}
