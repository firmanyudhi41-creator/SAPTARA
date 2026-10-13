<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Jadwal pemeliharaan streak harian siswa setiap tengah malam WIB
Schedule::command('saptara:sync-streaks')
    ->dailyAt('00:05')
    ->timezone('Asia/Jakarta')
    ->description('Reset streak kedaluwarsa siswa');

// Pengiriman rekap mingguan setiap hari Minggu pukul 18:00 WIB
Schedule::command('saptara:send-weekly-reports')
    ->weeklyOn(0, '18:00')
    ->timezone('Asia/Jakarta')
    ->description('Kirim rekap mingguan ke orang tua');
