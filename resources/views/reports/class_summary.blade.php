<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Rekapitulasi Kebiasaan Kelas - {{ $class->class_code ?? $class->classCode }}</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 0.8cm 1.2cm 0.8cm 1.2cm;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #0f172a;
            line-height: 1.3;
            font-size: 8.5pt;
            margin: 0;
            padding: 0;
        }

        /* Kop Surat Resmi */
        .kop-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 3px;
        }
        .kop-table td {
            vertical-align: middle;
        }
        .kop-logo-left {
            width: 70px;
            text-align: left;
        }
        .kop-logo-right {
            width: 70px;
            text-align: right;
        }
        .kop-logo-img {
            max-height: 55px;
            max-width: 65px;
            object-fit: contain;
        }
        .kop-text {
            text-align: center;
            padding: 0 10px;
        }
        .kop-instansi {
            font-size: 8pt;
            font-weight: 600;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0;
        }
        .kop-school-name {
            font-size: 14pt;
            font-weight: bold;
            color: #0369a1;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 1px 0;
        }
        .kop-sub {
            font-size: 8pt;
            color: #334155;
        }
        .kop-divider {
            border-top: 2px solid #0369a1;
            border-bottom: 1px solid #0369a1;
            height: 2px;
            margin: 4px 0 10px 0;
        }

        /* Title & Info Bar */
        .title-bar {
            text-align: center;
            margin-bottom: 8px;
        }
        .report-title {
            font-size: 11pt;
            font-weight: bold;
            color: #0f172a;
            text-transform: uppercase;
            margin: 0;
        }
        .info-bar {
            background-color: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            padding: 4px 8px;
            margin-bottom: 10px;
            font-size: 8pt;
        }

        /* Data Table */
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        table.data-table th {
            background-color: #0369a1;
            color: #ffffff;
            font-size: 7.5pt;
            text-transform: uppercase;
            padding: 5px 3px;
            border: 1px solid #0369a1;
            text-align: center;
            letter-spacing: 0.3px;
        }
        table.data-table td {
            padding: 4px 4px;
            border: 1px solid #cbd5e1;
            font-size: 8pt;
        }
        table.data-table tr:nth-child(even) {
            background-color: #f8fafc;
        }

        /* Signature block */
        .sig-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 6px;
        }
        .sig-table td {
            width: 50%;
            text-align: center;
            vertical-align: top;
            font-size: 8pt;
        }
        .sig-container {
            position: relative;
            height: 45px;
            margin: 2px auto;
            width: 180px;
        }
        .sig-img {
            max-height: 40px;
            max-width: 120px;
            object-fit: contain;
            display: block;
            margin: 0 auto;
        }
        .stamp-img {
            position: absolute;
            top: -8px;
            left: 20px;
            max-height: 50px;
            max-width: 50px;
            opacity: 0.85;
            object-fit: contain;
            z-index: 10;
        }

        .footer {
            margin-top: 8px;
            text-align: right;
            font-size: 7pt;
            color: #94a3b8;
        }
    </style>
</head>
<body>

    <!-- KOP RESMI SEKOLAH -->
    <table class="kop-table">
        <tr>
            <td class="kop-logo-left">
                @if(!empty($schoolLogoBase64))
                    <img src="{{ $schoolLogoBase64 }}" class="kop-logo-img" alt="Logo Sekolah">
                @else
                    <div style="width: 45px; height: 45px; border-radius: 50%; background-color: #0369a1; color: #fff; text-align: center; line-height: 45px; font-size: 16pt;">
                        🏫
                    </div>
                @endif
            </td>
            <td class="kop-text">
                <div class="kop-instansi">DINAS PENDIDIKAN DAN KEBUDAYAAN</div>
                <div class="kop-school-name">{{ $school?->name ?? 'SEKOLAH SAPTARA' }}</div>
                <div class="kop-sub">
                    NPSN: {{ $school?->npsn ?? '-' }}@if(!empty($school?->address)) | {{ $school->address }}@endif @if(!empty($school?->city)), {{ $school->city }}@endif
                </div>
            </td>
            <td class="kop-logo-right">
                @if(!empty($saptaraLogoBase64))
                    <img src="{{ $saptaraLogoBase64 }}" class="kop-logo-img" alt="Lambang SAPTARA">
                @else
                    <div style="width: 45px; height: 45px; border-radius: 50%; background-color: #0284c7; color: #fff; text-align: center; line-height: 45px; font-size: 16pt;">
                        🧭
                    </div>
                @endif
            </td>
        </tr>
    </table>

    <div class="kop-divider"></div>

    <div class="title-bar">
        <h1 class="report-title">Rekapitulasi Pelayaran Pembiasaan Karakter Kelas</h1>
        <div style="font-size: 8pt; color: #64748b;">
            Armada Kapal: "{{ $class->ship_name ?? $class->shipName ?? 'Saptara' }}" &bull; Kelas {{ $class->class_code ?? $class->classCode }}
        </div>
    </div>

    <div class="info-bar">
        <strong>Guru Pembina:</strong> {{ $teacher?->display_name ?? 'Guru Kelas' }}{{ !empty($teacher?->title) ? ', ' . $teacher->title : '' }} &bull;
        <strong>Total Siswa:</strong> {{ count($students) }} awak &bull;
        <strong>Semester / TA:</strong> {{ $class->semester ?? 'Ganjil' }} {{ $class->tahun_ajaran ?? '2026/2027' }} &bull;
        <strong>Tanggal Dokumen:</strong> {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 3%;">No</th>
                <th style="width: 17%; text-align: left;">Nama Siswa</th>
                <th style="width: 8%;">NIS</th>
                <th style="width: 12%;">Tingkat Kapal</th>
                <th style="width: 8%;">Streak</th>
                <th style="width: 10%;">Mil (XP)</th>
                <th style="width: 8%;">Koin</th>
                <th style="width: 10%;">Jurnal Foto</th>
                <th style="width: 10%;">Ceklis Habit</th>
                <th style="width: 6%;">Lencana</th>
                <th style="width: 8%;">Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($students as $idx => $s)
                <tr>
                    <td style="text-align: center;">{{ $idx + 1 }}</td>
                    <td><strong>{{ $s->name }}</strong> ({{ $s->avatar ?? '👦' }})</td>
                    <td style="text-align: center; color: #475569;">{{ $s->nis ?? '-' }}</td>
                    <td style="text-align: center;">{{ $s->ship_level['name'] ?? 'Pelaut Pemula' }}</td>
                    <td style="text-align: center; font-weight: bold; color: #d97706;">{{ $s->streak ?? 0 }} hari</td>
                    <td style="text-align: center; font-weight: bold; color: #0284c7;">{{ number_format($s->xp ?? 0) }}</td>
                    <td style="text-align: center;">{{ number_format($s->coins ?? 0) }} 🪙</td>
                    <td style="text-align: center; color: #16a34a; font-weight: bold;">{{ $s->verified_logs_count ?? 0 }}</td>
                    <td style="text-align: center;">{{ $s->completions_count ?? 0 }}</td>
                    <td style="text-align: center;">{{ $s->badges_count ?? 0 }} 🎖️</td>
                    <td style="text-align: center;">
                        @if(($s->streak ?? 0) >= 3)
                            <span style="color: #16a34a; font-weight: bold;">Sangat Aktif</span>
                        @elseif(($s->streak ?? 0) >= 1)
                            <span style="color: #0284c7;">Aktif</span>
                        @else
                            <span style="color: #ef4444;">Perlu Dorongan</span>
                        @endif
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="sig-table">
        <tr>
            <td>
                Mengetahui,<br>
                Kepala Sekolah
                <div class="sig-container">
                    @if(!empty($schoolStampBase64))
                        <img src="{{ $schoolStampBase64 }}" class="stamp-img" alt="Stempel Sekolah">
                    @endif
                </div>
                <strong>( ________________________________ )</strong>
            </td>
            <td>
                {{ $school?->city ?? 'Nusantara' }}, {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}<br>
                Guru Kelas / Pembina Karakter
                <div class="sig-container">
                    @if(!empty($teacherSignatureBase64))
                        <img src="{{ $teacherSignatureBase64 }}" class="sig-img" alt="Tanda Tangan Guru">
                    @endif
                </div>
                <strong>{{ $teacher?->display_name ?? 'Bapak/Ibu Guru' }}{{ !empty($teacher?->title) ? ', ' . $teacher->title : '' }}</strong><br>
                <span style="font-size: 7.5pt; color: #475569;">NIP. {{ $teacher?->nip ?? '-' }}</span>
            </td>
        </tr>
    </table>

    <div class="footer">
        Dicetak dari Aplikasi SAPTARA Karakter Kemaritiman &bull; {{ date('d F Y, H:i') }} WIB
    </div>

</body>
</html>
