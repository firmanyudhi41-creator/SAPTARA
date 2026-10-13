<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Tymon\JWTAuth\Contracts\JWTSubject;

class Student extends Model implements JWTSubject
{
    // Required by JWTSubject
    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [];
    }

    protected $fillable = [
        'school_id', 'class_id', 'name', 'nis', 'access_code',
        'avatar', 'xp', 'coins', 'streak',
        'last_active_date', 'parent_email',
    ];

    protected $casts = [
        'last_active_date' => 'date',
    ];

    protected $appends = [
        'schoolId',
        'classId',
        'accessCode',
        'lastActiveDate',
        'parentEmail',
        'ship_level',
        'nautical_miles',
    ];

    public function getSchoolIdAttribute(): ?int
    {
        return isset($this->attributes['school_id']) ? (int) $this->attributes['school_id'] : null;
    }

    public function getClassIdAttribute(): int
    {
        return (int) ($this->attributes['class_id'] ?? 0);
    }

    public function getAccessCodeAttribute(): ?string
    {
        return $this->attributes['access_code'] ?? null;
    }

    public function getLastActiveDateAttribute(): ?string
    {
        return isset($this->attributes['last_active_date']) && $this->attributes['last_active_date']
            ? substr($this->attributes['last_active_date'], 0, 10)
            : null;
    }

    public function getParentEmailAttribute(): ?string
    {
        return $this->attributes['parent_email'] ?? null;
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function class(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function habitCompletions(): HasMany
    {
        return $this->hasMany(HabitCompletion::class);
    }

    public function logbookEntries(): HasMany
    {
        return $this->hasMany(LogbookEntry::class);
    }

    public function badges(): HasMany
    {
        return $this->hasMany(StudentBadge::class);
    }

    public function accessories(): HasMany
    {
        return $this->hasMany(StudentAccessory::class);
    }

    /**
     * Get ship level based on XP (nautical miles).
     */
    public function getShipLevelAttribute(): array
    {
        $xp = $this->xp;
        if ($xp >= 600) {
            return ['level' => 4, 'name' => 'Kapten Saptara',    'emoji' => '🚢', 'minXP' => 600,  'maxXP' => 1000, 'ship' => 'saptara'];
        }
        if ($xp >= 300) {
            return ['level' => 3, 'name' => 'Kapal Pinisi',      'emoji' => '⛵', 'minXP' => 300,  'maxXP' => 600,  'ship' => 'pinisi'];
        }
        if ($xp >= 100) {
            return ['level' => 2, 'name' => 'Sampan Dayung',     'emoji' => '🚣', 'minXP' => 100,  'maxXP' => 300,  'ship' => 'rowboat'];
        }

        return ['level' => 1, 'name' => 'Rakit Bambu',      'emoji' => '🪵', 'minXP' => 0,    'maxXP' => 100,  'ship' => 'raft'];
    }

    public function getNauticalMilesAttribute(): int
    {
        return (int) $this->xp;
    }

    /**
     * Mendapatkan nilai streak aktif secara dinamis.
     * Jika siswa tidak aktif kemarin maupun hari ini, streak saat ini adalah 0.
     */
    public function getStreakAttribute(): int
    {
        $rawStreak = (int) ($this->attributes['streak'] ?? 0);
        if ($rawStreak <= 0) {
            return 0;
        }

        $lastActive = $this->last_active_date ? Carbon::parse($this->last_active_date)->toDateString() : null;
        if (! $lastActive) {
            return 0;
        }

        $today = Carbon::now('Asia/Jakarta')->toDateString();
        $yesterday = Carbon::now('Asia/Jakarta')->subDay()->toDateString();

        // Streak aktif jika terakhir aktif adalah kemarin atau hari ini
        if ($lastActive === $today || $lastActive === $yesterday) {
            return $rawStreak;
        }

        return 0;
    }

    /**
     * Catat aktivitas harian siswa, perbarui streak, dan berikan reward milestone jika tercapai.
     * Dapat dipanggil dari penyelesaian habit checklist maupun unggah logbook jurnal foto.
     *
     * @return array|null Milestone reward jika menyentuh hari ke-7, 14, atau 30
     */
    public function recordDailyActivity(?string $today = null): ?array
    {
        $today = $today ?: Carbon::now('Asia/Jakarta')->toDateString();
        $yesterday = Carbon::now('Asia/Jakarta')->subDay()->toDateString();

        $lastActive = $this->last_active_date ? Carbon::parse($this->last_active_date)->toDateString() : null;

        // Jika hari ini sudah tercatat sebagai hari aktif, tidak perlu menambah streak lagi
        if ($lastActive === $today) {
            return null;
        }

        $streakIncreased = false;

        if ($this->exists) {
            if ($lastActive === $yesterday) {
                // Aktif kemarin: lanjutkan streak (+1)
                $this->increment('streak');
                $this->refresh();
                $streakIncreased = true;
            } else {
                // Terputus (> kemarin) atau baru pertama kali aktif: mulai dari 1
                $this->streak = 1;
                $this->save();
                $this->refresh();
                $streakIncreased = true;
            }

            $this->last_active_date = $today;
            $this->save();
        } else {
            // Untuk instance dalam memori (misal: unit testing)
            if ($lastActive === $yesterday) {
                $this->attributes['streak'] = ((int) ($this->attributes['streak'] ?? 0)) + 1;
                $streakIncreased = true;
            } else {
                $this->attributes['streak'] = 1;
                $streakIncreased = true;
            }
            $this->attributes['last_active_date'] = $today;
        }

        if (! $streakIncreased) {
            return null;
        }

        // Evaluasi Milestone Streak (7, 14, 30 hari)
        $milestone = null;
        if ($this->streak === 7) {
            if ($this->exists) {
                $this->increment('xp', 50);
                $this->increment('coins', 20);
            } else {
                $this->attributes['xp'] = ((int) ($this->attributes['xp'] ?? 0)) + 50;
                $this->attributes['coins'] = ((int) ($this->attributes['coins'] ?? 0)) + 20;
            }
            $milestone = [
                'days' => 7,
                'bonus_xp' => 50,
                'bonus_coins' => 20,
                'title' => 'Pekan Bahari (7 Hari Berturut-turut)!',
            ];
        } elseif ($this->streak === 14) {
            if ($this->exists) {
                $this->increment('xp', 100);
                $this->increment('coins', 50);
            } else {
                $this->attributes['xp'] = ((int) ($this->attributes['xp'] ?? 0)) + 100;
                $this->attributes['coins'] = ((int) ($this->attributes['coins'] ?? 0)) + 50;
            }
            $milestone = [
                'days' => 14,
                'bonus_xp' => 100,
                'bonus_coins' => 50,
                'title' => 'Pelaut Tangguh (14 Hari Berturut-turut)!',
            ];
        } elseif ($this->streak === 30) {
            if ($this->exists) {
                $this->increment('xp', 250);
                $this->increment('coins', 150);
            } else {
                $this->attributes['xp'] = ((int) ($this->attributes['xp'] ?? 0)) + 250;
                $this->attributes['coins'] = ((int) ($this->attributes['coins'] ?? 0)) + 150;
            }
            $milestone = [
                'days' => 30,
                'bonus_xp' => 250,
                'bonus_coins' => 150,
                'title' => 'Nakhoda Samudra (30 Hari Berturut-turut)!',
            ];
        }

        return $milestone;
    }

    /**
     * Hitung ulang streak aktual berdasarkan riwayat tanggal aktivitas (Habit & Logbook).
     */
    public function recalculateStreak(): int
    {
        $tz = 'Asia/Jakarta';
        $today = Carbon::now($tz);

        // Ambil semua tanggal unik aktivitas siswa (HabitCompletion & LogbookEntry)
        $dates = HabitCompletion::where('student_id', $this->id)
            ->pluck('date')
            ->concat(
                LogbookEntry::where('student_id', $this->id)->pluck('date')
            )
            ->map(fn ($d) => is_string($d) ? substr($d, 0, 10) : Carbon::parse($d)->toDateString())
            ->unique()
            ->flip();

        if ($dates->isEmpty()) {
            $this->streak = 0;
            $this->last_active_date = null;
            $this->save();

            return 0;
        }

        $todayStr = $today->toDateString();
        $yesterdayStr = $today->copy()->subDay()->toDateString();

        $currentDate = null;
        if ($dates->has($todayStr)) {
            $currentDate = $today->copy();
            $this->last_active_date = $todayStr;
        } elseif ($dates->has($yesterdayStr)) {
            $currentDate = $today->copy()->subDay();
            $this->last_active_date = $yesterdayStr;
        } else {
            // Terakhir aktif sebelum kemarin -> streak putus (0)
            $latestDate = $dates->keys()->max();
            $this->streak = 0;
            $this->last_active_date = $latestDate;
            $this->save();

            return 0;
        }

        $streak = 0;
        while ($dates->has($currentDate->toDateString())) {
            $streak++;
            $currentDate->subDay();
        }

        $this->streak = $streak;
        $this->save();

        return $streak;
    }

    public function parents(): BelongsToMany
    {
        return $this->belongsToMany(ParentProfile::class, 'parent_student', 'student_id', 'parent_id')
            ->withTimestamps();
    }

    public function questClaims(): HasMany
    {
        return $this->hasMany(StudentDailyQuestClaim::class);
    }

    public function classMissionClaims(): HasMany
    {
        return $this->hasMany(ClassMissionClaim::class, 'student_id');
    }
}
