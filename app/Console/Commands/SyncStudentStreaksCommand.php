<?php

namespace App\Console\Commands;

use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SyncStudentStreaksCommand extends Command
{
    protected $signature = 'saptara:sync-streaks {--recalculate : Hitung ulang streak seluruh siswa dari riwayat lengkap}';

    protected $description = 'Sinkronisasi streak harian siswa dan reset streak yang kedaluwarsa';

    public function handle(): int
    {
        $tz = 'Asia/Jakarta';
        $yesterday = Carbon::now($tz)->subDay()->toDateString();

        if ($this->option('recalculate')) {
            $this->info('Menghitung ulang streak seluruh siswa dari riwayat aktivitas...');
            $students = Student::all();
            $bar = $this->output->createProgressBar($students->count());

            foreach ($students as $student) {
                $student->recalculateStreak();
                $bar->advance();
            }

            $bar->finish();
            $this->newLine();
            $this->info('Perhitungan ulang streak selesai.');

            return self::SUCCESS;
        }

        // Reset streak menjadi 0 bagi siswa yang terakhir aktif sebelum kemarin
        $affected = Student::where('last_active_date', '<', $yesterday)
            ->where('streak', '>', 0)
            ->update(['streak' => 0]);

        $this->info("Sinkronisasi selesai: {$affected} siswa dengan streak kedaluwarsa telah di-reset ke 0.");

        return self::SUCCESS;
    }
}
