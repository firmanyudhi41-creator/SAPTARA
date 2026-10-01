<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Raport Karakter Siswa - {{ $student->name }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 0.8cm 1.2cm 0.8cm 1.2cm;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #0f172a;
            line-height: 1.3;
            font-size: 9.5pt;
            margin: 0;
            padding: 0;
        }

        /* Kop Surat Resmi */
        .kop-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 4px;
        }
        .kop-table td {
            vertical-align: middle;
        }
        .kop-logo-left {
            width: 75px;
            text-align: left;
        }
        .kop-logo-right {
            width: 75px;
            text-align: right;
        }
        .kop-logo-img {
            max-height: 65px;
            max-width: 70px;
            object-fit: contain;
        }
        .kop-text {
            text-align: center;
            padding: 0 10px;
        }
        .kop-instansi {
            font-size: 9pt;
            font-weight: 600;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0;
        }
        .kop-school-name {
            font-size: 15pt;
            font-weight: bold;
            color: #0369a1;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 2px 0;
        }
        .kop-sub {
            font-size: 8.5pt;
            color: #334155;
            margin: 1px 0;
        }
        .kop-contact {
            font-size: 7.5pt;
            color: #64748b;
            margin-top: 2px;
        }
        .kop-divider {
            border-top: 2.5px solid #0369a1;
            border-bottom: 1px solid #0369a1;
            height: 2px;
            margin: 6px 0 12px 0;
        }

        /* Judul Raport */
        .report-title-box {
            text-align: center;
            margin-bottom: 12px;
        }
        .report-title {
            font-size: 12pt;
            font-weight: 800;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin: 0;
        }
        .report-subtitle {
            font-size: 8.5pt;
            color: #0284c7;
            font-weight: 700;
            text-transform: uppercase;
            margin: 2px 0 0 0;
            letter-spacing: 0.5px;
        }
        .report-period {
            font-size: 8pt;
            color: #64748b;
            font-weight: normal;
        }

        /* Kartu Identitas Siswa */
        .identity-box {
            width: 100%;
            border-collapse: collapse;
            background-color: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            margin-bottom: 12px;
        }
        .identity-box td {
            padding: 5px 8px;
            font-size: 8.5pt;
        }
        .identity-box .label {
            width: 20%;
            color: #64748b;
            font-weight: 600;
        }
        .identity-box .value {
            width: 30%;
            color: #0f172a;
            font-weight: bold;
        }

        /* 4 Kotak KPI Ringkasan Capaian */
        .kpi-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        .kpi-card {
            width: 24%;
            background-color: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 6px;
            padding: 6px 4px;
            text-align: center;
        }
        .kpi-title {
            font-size: 7pt;
            text-transform: uppercase;
            font-weight: 700;
            color: #0369a1;
            letter-spacing: 0.5px;
        }
        .kpi-num {
            font-size: 12pt;
            font-weight: 800;
            color: #0284c7;
            margin-top: 1px;
        }

        /* Tabel 7 Pilar Kebiasaan */
        .section-header {
            font-size: 9.5pt;
            font-weight: bold;
            color: #0369a1;
            margin: 0 0 6px 0;
            border-left: 3px solid #0284c7;
            padding-left: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        table.habit-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }
        table.habit-table th {
            background-color: #0369a1;
            color: #ffffff;
            font-size: 8pt;
            text-transform: uppercase;
            padding: 6px 4px;
            border: 1px solid #0369a1;
            text-align: center;
            letter-spacing: 0.3px;
        }
        table.habit-table td {
            padding: 5px 6px;
            border: 1px solid #cbd5e1;
            font-size: 8.5pt;
        }
        table.habit-table tr:nth-child(even) {
            background-color: #f8fafc;
        }
        .stars-badge {
            font-size: 8.5pt;
            letter-spacing: 1px;
        }
        .predicate-tag {
            font-size: 7pt;
            color: #475569;
            display: block;
            margin-top: 1px;
        }

        /* Lencana & Piagam */
        .badges-box {
            background-color: #fffbeb;
            border: 1px solid #fef08a;
            border-radius: 6px;
            padding: 6px 8px;
            margin-bottom: 10px;
        }
        .badge-pill {
            display: inline-block;
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            color: #92400e;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 7.5pt;
            font-weight: bold;
            margin-right: 4px;
            margin-bottom: 2px;
        }

        /* Catatan Pembina */
        .note-box {
            background-color: #f1f5f9;
            border-left: 3px solid #0284c7;
            padding: 6px 8px;
            margin-bottom: 12px;
            border-radius: 0 4px 4px 0;
        }
        .note-quote {
            font-size: 7.5pt;
            font-style: italic;
            color: #475569;
            margin-bottom: 3px;
        }
        .note-text {
            font-size: 8pt;
            color: #1e293b;
            font-weight: 500;
        }

        /* Blok Pengesahan & Tanda Tangan */
        .signature-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }
        .signature-table td {
            width: 50%;
            vertical-align: top;
            text-align: center;
            font-size: 8.5pt;
        }
        .sig-container {
            position: relative;
            height: 60px;
            margin: 4px auto;
            width: 200px;
        }
        .sig-img {
            max-height: 55px;
            max-width: 160px;
            object-fit: contain;
            display: block;
            margin: 0 auto;
        }
        .stamp-img {
            position: absolute;
            top: -10px;
            left: 20px;
            max-height: 65px;
            max-width: 65px;
            opacity: 0.85;
            object-fit: contain;
            z-index: 10;
        }
        .sig-name {
            font-weight: bold;
            text-decoration: underline;
            color: #0f172a;
            margin-bottom: 1px;
        }
        .sig-nip {
            font-size: 7.5pt;
            color: #475569;
        }

        /* Footer */
        .footer {
            margin-top: 10px;
            text-align: center;
            font-size: 7pt;
            color: #94a3b8;
            border-top: 1px dashed #cbd5e1;
            padding-top: 4px;
        }
    </style>
</head>
<body>

    <!-- KOP SURAT RESMI -->
    <table class="kop-table">
        <tr>
            <!-- LOGO SEKOLAH (KIRI) -->
            <td class="kop-logo-left">
                @if(!empty($schoolLogoBase64))
                    <img src="{{ $schoolLogoBase64 }}" class="kop-logo-img" alt="Logo Sekolah">
                @else
                    <div style="width: 55px; height: 55px; border-radius: 50%; background-color: #0369a1; color: #fff; text-align: center; line-height: 55px; font-size: 22pt; font-weight: bold; margin: 0 auto;">
                        🏫
                    </div>
                @endif
            </td>

            <!-- TEKS KOP RESMI -->
            <td class="kop-text">
                <div class="kop-instansi">DINAS PENDIDIKAN DAN KEBUDAYAAN</div>
                <div class="kop-school-name">{{ $school?->name ?? 'SEKOLAH DASAR SAPTARA' }}</div>
                <div class="kop-sub">
                    NPSN: {{ $school?->npsn ?? '-' }}
                    @if(!empty($school?->address))
                        | {{ $school->address }}
                    @endif
                    @if(!empty($school?->city))
                        , {{ $school->city }}
                    @endif
                    @if(!empty($school?->province))
                        - {{ $school->province }}
                    @endif
                </div>
                <div class="kop-contact">
                    @if(!empty($school?->phone)) Telp: {{ $school->phone }} | @endif
                    @if(!empty($school?->email)) Email: {{ $school->email }} | @endif
                    @if(!empty($school?->website)) Web: {{ $school->website }} @endif
                </div>
            </td>

            <!-- LAMBANG SAPTARA (KANAN) -->
            <td class="kop-logo-right">
                @if(!empty($saptaraLogoBase64))
                    <img src="{{ $saptaraLogoBase64 }}" class="kop-logo-img" alt="Lambang SAPTARA">
                @else
                    <div style="width: 55px; height: 55px; border-radius: 50%; background-color: #0284c7; color: #fff; text-align: center; line-height: 55px; font-size: 22pt;">
                        🧭
                    </div>
                @endif
            </td>
        </tr>
    </table>

    <div class="kop-divider"></div>

    <!-- JUDUL RAPORT -->
    <div class="report-title-box">
        <h1 class="report-title">Lembar Laporan Capaian Pembiasaan Karakter Siswa</h1>
        <div class="report-subtitle">Program 7 Kebiasaan Anak Indonesia Hebat (SAPTARA)</div>
        <div class="report-period">
            Semester {{ strtoupper($class->semester ?? 'Ganjil') }} &bull; Tahun Pelajaran {{ $class->tahun_ajaran ?? '2026/2027' }}
        </div>
    </div>

    <!-- IDENTITAS AWAK & KAPAL (PASSPORT) -->
    <table class="identity-box">
        <tr>
            <td class="label">Nama Lengkap Awak:</td>
            <td class="value">{{ $student->name }} <span style="font-weight: normal;">({{ $student->avatar ?? '👦' }})</span></td>
            <td class="label">Nama Armada / Kapal:</td>
            <td class="value">{{ $class->ship_name ?? $class->shipName ?? 'KRI Saptara' }}</td>
        </tr>
        <tr>
            <td class="label">Nomor Induk Siswa (NIS):</td>
            <td class="value">{{ $student->nis ?? '-' }}</td>
            <td class="label">Rombongan Belajar:</td>
            <td class="value">Kelas {{ $class->class_code ?? $class->classCode }}</td>
        </tr>
        <tr>
            <td class="label">Pangkat Pelayaran:</td>
            <td class="value">{{ $student->ship_level['name'] ?? 'Pelaut Pemula' }} {{ $student->ship_level['emoji'] ?? '⛵' }}</td>
            <td class="label">Wali Kelas / Pembina:</td>
            <td class="value">{{ $teacher?->display_name ?? 'Bapak/Ibu Guru' }}{{ !empty($teacher?->title) ? ', ' . $teacher->title : '' }}</td>
        </tr>
    </table>

    <!-- 4 KOTAK KPI CAPAIAN -->
    <table class="kpi-table">
        <tr>
            <td class="kpi-card">
                <div class="kpi-title">Jarak Tempuh (XP)</div>
                <div class="kpi-num">{{ number_format($student->xp ?? 0) }} <span style="font-size: 8pt; font-weight: normal;">Mil</span></div>
            </td>
            <td style="width: 1%;"></td>
            <td class="kpi-card">
                <div class="kpi-title">Koin Karakter</div>
                <div class="kpi-num">{{ number_format($student->coins ?? 0) }} <span style="font-size: 8pt; font-weight: normal;">🪙</span></div>
            </td>
            <td style="width: 1%;"></td>
            <td class="kpi-card">
                <div class="kpi-title">Jurnal Terverifikasi</div>
                <div class="kpi-num">{{ $verifiedLogbooksCount }} <span style="font-size: 8pt; font-weight: normal;">Foto</span></div>
            </td>
            <td style="width: 1%;"></td>
            <td class="kpi-card">
                <div class="kpi-title">Konsistensi Beruntun</div>
                <div class="kpi-num">{{ $student->streak ?? 0 }} <span style="font-size: 8pt; font-weight: normal;">Hari 🔥</span></div>
            </td>
        </tr>
    </table>

    <!-- TABEL 7 PILAR KEBIASAAN ANAK INDONESIA HEBAT -->
    <div class="section-header">Capaian Pembiasaan 7 Pilar Karakter Hebat</div>
    <table class="habit-table">
        <thead>
            <tr>
                <th style="width: 4%;">No</th>
                <th style="width: 32%; text-align: left;">Pilar Pembiasaan Karakter</th>
                <th style="width: 24%; text-align: left;">Gugus Pulau Karakter</th>
                <th style="width: 13%;">Ceklis Selesai</th>
                <th style="width: 13%;">Jurnal Foto</th>
                <th style="width: 14%;">Predikat Bintang</th>
            </tr>
        </thead>
        <tbody>
            @foreach($habits as $idx => $habit)
                <tr>
                    <td style="text-align: center; font-weight: bold; color: #64748b;">{{ $idx + 1 }}</td>
                    <td>
                        <strong style="color: #0f172a;">{{ $habit->name }}</strong>
                    </td>
                    <td style="color: #475569;">
                        {{ $habit->island }}
                    </td>
                    <td style="text-align: center; font-weight: bold; color: #0284c7;">
                        {{ $habitStats[$habit->id]['completions'] ?? 0 }} kali
                    </td>
                    <td style="text-align: center; font-weight: bold; color: #16a34a;">
                        {{ $habitStats[$habit->id]['verified_logs'] ?? 0 }} jurnal
                    </td>
                    <td style="text-align: center;">
                        <span class="stars-badge">{{ $habitStats[$habit->id]['stars'] ?? '—' }}</span>
                        <span class="predicate-tag">{{ $habitStats[$habit->id]['predicate'] ?? '-' }}</span>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- PIAGAM & LENCANA DIRAIH -->
    @if(!empty($badges) && count($badges) > 0)
    <div class="badges-box">
        <strong style="font-size: 8pt; color: #b45309; text-transform: uppercase;">🎖️ Lencana & Piagam Kehormatan yang Telah Diraih:</strong>
        <div style="margin-top: 3px;">
            @foreach($badges as $badge)
                <span class="badge-pill">
                    🎖️ {{ $badge->habit?->name ?? 'Lencana Kebiasaan' }}
                </span>
            @endforeach
        </div>
    </div>
    @endif

    <!-- CATATAN PEMBINA & PESAN MOTIVASI -->
    <div class="note-box">
        <div class="note-quote">"Pelaut ulung tidak lahir dari laut yang tenang. Kebiasaan baik yang konsisten adalah mercusuar masa depan yang cemerlang."</div>
        <div class="note-text">
            <strong>Catatan Pembina:</strong> Ananda telah berpartisipasi aktif dalam pembiasaan karakter dengan total <strong>{{ $totalCompletions }} kali ceklis mandiri</strong> dan <strong>{{ $verifiedLogbooksCount }} jurnal foto terverifikasi</strong>. Terus tingkatkan kedisiplinan dan budi pekerti luhur di rumah maupun di sekolah.
        </div>
    </div>

    <!-- BLOK PENGESAHAN DOKUMEN & STEMPEL/TANDA TANGAN -->
    <table class="signature-table">
        <tr>
            <!-- ORANG TUA / WALI -->
            <td>
                Mengetahui,<br>
                <strong>Orang Tua / Wali Siswa</strong>
                <div class="sig-container">
                    <!-- Ruang kosong tanda tangan ortu -->
                </div>
                <div class="sig-name">( __________________________ )</div>
                <div class="sig-nip">&nbsp;</div>
            </td>

            <!-- GURU KELAS / PEMBINA DENGAN DIGITAL SIGNATURE & STEMPEL RESMI -->
            <td>
                {{ $school?->city ?? 'Nusantara' }}, {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}<br>
                <strong>Guru Kelas / Pembina Karakter</strong>

                <div class="sig-container">
                    <!-- STEMPEL SEKOLAH (OVERLAY) -->
                    @if(!empty($schoolStampBase64))
                        <img src="{{ $schoolStampBase64 }}" class="stamp-img" alt="Stempel Sekolah">
                    @endif

                    <!-- TANDA TANGAN DIGITAL GURU -->
                    @if(!empty($teacherSignatureBase64))
                        <img src="{{ $teacherSignatureBase64 }}" class="sig-img" alt="Tanda Tangan Guru">
                    @endif
                </div>

                <div class="sig-name">{{ $teacher?->display_name ?? 'Bapak/Ibu Guru' }}{{ !empty($teacher?->title) ? ', ' . $teacher->title : '' }}</div>
                <div class="sig-nip">
                    @if(!empty($teacher?->nip))
                        NIP. {{ $teacher->nip }}
                    @else
                        NIP. -
                    @endif
                </div>
            </td>
        </tr>
    </table>

    <!-- FOOTER VERIFIKASI -->
    <div class="footer">
        Dicetak otomatis oleh Sistem SAPTARA &bull; Mengembangkan Karakter Maritim & Kebiasaan Positif Anak Indonesia Hebat &bull; {{ date('d/m/Y H:i') }} WIB
    </div>

</body>
</html>
