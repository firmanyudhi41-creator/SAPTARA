<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use Illuminate\Console\Command;
use Symfony\Component\Console\Command\Command as CommandAlias;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class BackupDatabaseCommand extends Command
{
    /**
     * Nama command yang akan dipanggil di terminal.
     */
    protected $signature = 'db:backup {--filename= : Nama kustom untuk file backup} {--only-db : Backup database saja (opsional/kompatibilitas)} {--keep-days=7 : Jumlah hari rotasi penyimpanan backup (default: 7 hari)}';

    protected $description = 'Melakukan full dump database MySQL ke file .sql.gz dengan rotasi retensi 7 hari';

    public function handle()
    {
        $database = config('database.connections.mysql.database');
        $username = config('database.connections.mysql.username');
        $password = config('database.connections.mysql.password');
        $host = config('database.connections.mysql.host');
        $port = config('database.connections.mysql.port', 3306);

        // Siapkan direktori penyimpanan (misal: storage/app/backups)
        $storageDir = storage_path('app/backups');
        if (! file_exists($storageDir)) {
            mkdir($storageDir, 0755, true);
        }

        $filename = $this->option('filename')
            ?: sprintf('backup_%s_%s.sql.gz', $database, date('Y-m-d_H-i-s'));

        $outputPath = $storageDir.'/'.$filename;

        $this->info("Memulai proses backup database: {$database}...");

        // Jalankan mysqldump dan kompres langsung dengan gzip
        // Catatan: Di shared hosting, path mysqldump biasanya '/usr/bin/mysqldump'
        $command = sprintf(
            'mysqldump --host=%s --port=%s --user=%s --password=%s %s | gzip > %s',
            escapeshellarg($host),
            escapeshellarg($port),
            escapeshellarg($username),
            escapeshellarg($password),
            escapeshellarg($database),
            escapeshellarg($outputPath)
        );

        $process = Process::fromShellCommandline($command);
        $process->setTimeout(300); // Batas waktu 5 menit jika database besar

        try {
            $process->mustRun();
            $this->info("Backup berhasil disimpan ke: {$outputPath}");

            // Jalankan rotasi penghapusan backup lama (hanya simpan 7 hari terakhir)
            $keepDays = max(1, (int) ($this->option('keep-days') ?: 7));
            $deletedCount = $this->rotateOldBackups($storageDir, $keepDays);

            if ($deletedCount > 0) {
                $this->info("Rotasi backup: {$deletedCount} file backup lama (> {$keepDays} hari) berhasil dibersihkan.");
            } else {
                $this->line("Rotasi backup: Tidak ada file backup yang melebihi batas retensi {$keepDays} hari.");
            }

            return CommandAlias::SUCCESS;
        } catch (ProcessFailedException $exception) {
            $this->error('Backup gagal: '.$exception->getMessage());

            return CommandAlias::FAILURE;
        }
    }

    /**
     * Hapus file backup yang lebih lama dari jumlah hari retensi yang ditentukan.
     */
    protected function rotateOldBackups(string $storageDir, int $days = 7): int
    {
        if (! is_dir($storageDir)) {
            return 0;
        }

        $deletedCount = 0;
        $thresholdTimestamp = Carbon::now()->subDays($days)->getTimestamp();

        // Pindai semua file backup di dalam direktori penyimpanan
        $files = glob($storageDir.'/*');

        if (! is_array($files)) {
            return 0;
        }

        foreach ($files as $file) {
            if (is_file($file)) {
                $fileMtime = filemtime($file);
                if ($fileMtime !== false && $fileMtime < $thresholdTimestamp) {
                    if (@unlink($file)) {
                        $deletedCount++;
                        $this->line(sprintf('  ↳ Menghapus backup kedaluwarsa (> %d hari): %s', $days, basename($file)));
                    }
                }
            }
        }

        return $deletedCount;
    }
}
