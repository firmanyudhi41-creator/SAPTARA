<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Console\Command\Command as CommandAlias;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class BackupDatabaseCommand extends Command
{
    /**
     * Nama command yang akan dipanggil di terminal.
     */
    protected $signature = 'db:backup {--filename= : Nama kustom untuk file backup} {--only-db : Backup database saja (opsional/kompatibilitas)}';

    protected $description = 'Melakukan full dump database MySQL ke file .sql.gz';

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

            return CommandAlias::SUCCESS;
        } catch (ProcessFailedException $exception) {
            $this->error('Backup gagal: '.$exception->getMessage());

            return CommandAlias::FAILURE;
        }
    }
}
