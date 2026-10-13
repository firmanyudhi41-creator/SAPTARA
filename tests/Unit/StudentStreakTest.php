<?php

namespace Tests\Unit;

use App\Models\Student;
use Carbon\Carbon;
use Tests\TestCase;

class StudentStreakTest extends TestCase
{
    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_new_student_activity_sets_streak_to_one(): void
    {
        $today = Carbon::parse('2026-10-10 10:00:00', 'Asia/Jakarta');
        Carbon::setTestNow($today);

        $student = new Student([
            'streak' => 0,
            'last_active_date' => null,
            'xp' => 0,
            'coins' => 0,
        ]);

        $milestone = $student->recordDailyActivity($today->toDateString());

        $this->assertEquals(1, $student->streak);
        $this->assertEquals('2026-10-10', substr((string) $student->last_active_date, 0, 10));
        $this->assertNull($milestone);
    }

    public function test_activity_on_consecutive_day_increments_streak(): void
    {
        $yesterday = Carbon::parse('2026-10-09', 'Asia/Jakarta');
        $today = Carbon::parse('2026-10-10 09:00:00', 'Asia/Jakarta');
        Carbon::setTestNow($today);

        // Siswa aktif kemarin dengan streak 3
        $student = new Student([
            'streak' => 3,
            'last_active_date' => $yesterday->toDateString(),
            'xp' => 50,
            'coins' => 20,
        ]);

        $milestone = $student->recordDailyActivity($today->toDateString());

        $this->assertEquals(4, $student->streak);
        $this->assertEquals('2026-10-10', substr((string) $student->last_active_date, 0, 10));
        $this->assertNull($milestone);
    }

    public function test_same_day_multiple_activities_do_not_double_count_streak(): void
    {
        $today = Carbon::parse('2026-10-10 10:00:00', 'Asia/Jakarta');
        Carbon::setTestNow($today);

        $student = new Student([
            'streak' => 2,
            'last_active_date' => '2026-10-10',
        ]);

        $milestone = $student->recordDailyActivity($today->toDateString());

        $this->assertEquals(2, $student->streak);
        $this->assertNull($milestone);
    }

    public function test_broken_streak_resets_to_one_when_resuming(): void
    {
        $threeDaysAgo = Carbon::parse('2026-10-07', 'Asia/Jakarta');
        $today = Carbon::parse('2026-10-10 10:00:00', 'Asia/Jakarta');
        Carbon::setTestNow($today);

        $student = new Student([
            'streak' => 10,
            'last_active_date' => $threeDaysAgo->toDateString(),
        ]);

        $milestone = $student->recordDailyActivity($today->toDateString());

        $this->assertEquals(1, $student->streak);
        $this->assertEquals('2026-10-10', substr((string) $student->last_active_date, 0, 10));
        $this->assertNull($milestone);
    }

    public function test_effective_streak_evaluates_to_zero_when_inactive(): void
    {
        $today = Carbon::parse('2026-10-10 12:00:00', 'Asia/Jakarta');
        Carbon::setTestNow($today);

        // Terakhir aktif 3 hari lalu, DB masih menyimpan streak 8
        $student = new Student([
            'streak' => 8,
            'last_active_date' => '2026-10-07',
        ]);

        // Accessor harus mengembalikan 0 secara dinamis
        $this->assertEquals(0, $student->streak);
    }

    public function test_effective_streak_intact_if_active_yesterday(): void
    {
        $today = Carbon::parse('2026-10-10 12:00:00', 'Asia/Jakarta');
        Carbon::setTestNow($today);

        // Siswa aktif kemarin, belum aktivitas hari ini
        $student = new Student([
            'streak' => 5,
            'last_active_date' => '2026-10-09',
        ]);

        // Streak tetap 5 karena hari ini masih berjalan dan bisa dilanjutkan
        $this->assertEquals(5, $student->streak);
    }

    public function test_seventh_day_streak_awards_milestone_reward(): void
    {
        $yesterday = Carbon::parse('2026-10-09', 'Asia/Jakarta');
        $today = Carbon::parse('2026-10-10 08:00:00', 'Asia/Jakarta');
        Carbon::setTestNow($today);

        $student = new Student([
            'streak' => 6,
            'last_active_date' => $yesterday->toDateString(),
            'xp' => 100,
            'coins' => 40,
        ]);

        $milestone = $student->recordDailyActivity($today->toDateString());

        $this->assertEquals(7, $student->streak);
        $this->assertNotNull($milestone);
        $this->assertEquals(7, $milestone['days']);
        $this->assertEquals(50, $milestone['bonus_xp']);
        $this->assertEquals(20, $milestone['bonus_coins']);
        $this->assertEquals(150, $student->xp);
        $this->assertEquals(60, $student->coins);
    }
}
