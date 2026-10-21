# Panduan Deploy SAPTARA ke Shared Hosting cPanel (Dual-Folder Model)

Dokumen ini menjelaskan tata cara deployment SAPTARA pada shared hosting cPanel menggunakan model pemisahan folder standar keamanan tinggi:
- **`/home/saptarai/saptara`** : Direktori core aplikasi (PHP, Laravel, Vendor, Config, Database, Storage) yang berada di **luar web root** sehingga file `.env` dan kode sumber tidak dapat diakses dari browser.
- **`/home/saptarai/public_html`** : Direktori web root publik tempat server melayani file statis (`index.php`, `.htaccess`, bundle React Vite `build/`, `install.php`).

---

## 🚀 Ringkasan Keunggulan Artefak Build Otomatis

| Kebutuhan Hosting | Solusi Otomatis SAPTARA |
|---|---|
| **Tidak ada Node.js di server** | GitHub Actions Pipeline otomatis mengompilasi React + Tailwind menjadi aset statis murni (`public_html/build/`). Server hosting hanya perlu menjalankan PHP. |
| **Tidak ada terminal / SSH** | Database, symlink storage, dan cache dapat di-setup lewat browser dengan **Web Installer** (`public_html/install.php`) ATAU import via phpMyAdmin. |
| **Tidak bisa jalankan composer** | Folder `vendor/` produksi PHP 8.3/8.4 sudah dipaketkan lengkap di dalam artefak rilis. |
| **Pemisahan `saptara` & `public_html`** | Struktur artefak rilis sudah dibagi menjadi dua folder (`saptara/` dan `public_html/`). Ekstrak di direktori home (`/home/username/`) langsung otomatis mengisi kedua folder tanpa perlu memindahkan file manual. |

---

## 📦 Pilihan Paket Artefak di GitHub Releases

Setiap kali Anda membuat **Git Tag** (contoh: `v1.0.0` atau `v2.0.1`) di GitHub:
```bash
git checkout main
git pull origin main
git tag v1.0.0
git push origin v1.0.0
```
Pipeline GitHub Actions akan otomatis menghasilkan beberapa pilihan paket zip:

1. **`saptara-production-v1.0.0.zip` (All-in-One cPanel)**:
   - Berisi folder `saptara/` dan `public_html/`.
   - Cukup di-upload ke `/home/username/` cPanel lalu diekstrak sekali.
2. **`saptara-production-v1.0.0-app-saptara.zip` (App Core Saja)**:
   - Digunakan untuk update kode backend/Laravel saja ke dalam `/home/username/saptara/`.
3. **`saptara-production-v1.0.0-public_html.zip` (Public Web Saja)**:
   - Digunakan jika hanya ada update tampilan frontend React/Vite ke dalam `/home/username/public_html/`.

---

## 🛠️ Langkah-Langkah Deploy ke cPanel (Hanya Menggunakan Browser)

### Langkah 1: Buat Database MySQL di cPanel
1. Masuk ke cPanel hosting Anda.
2. Buka menu **MySQL® Databases**.
3. Buat database baru (misal: `saptarai_db`).
4. Buat user database baru (misal: `saptarai_user`) dan catat password-nya.
5. Pada bagian **Add User to Database**, pilih user dan database tadi, centang **ALL PRIVILEGES**, lalu klik **Make Changes**.

---

### Langkah 2: Upload & Ekstrak Artefak di File Manager
1. Di cPanel, buka **File Manager**.
2. Pastikan Anda berada di direktori Home utama akun Anda (yaitu **`/home/saptarai/`**, satu tingkat di atas `public_html`).
3. Klik tombol **Upload** di bagian atas, pilih file **`saptara-production-vX.X.X.zip`**.
4. Setelah proses upload 100%, kembali ke File Manager, klik kanan file zip tersebut lalu pilih **Extract** ke direktori `/home/saptarai/`.
5. File Manager akan secara otomatis mengekstrak:
   - Folder **`saptara/`** berisi backend aplikasi.
   - Folder **`public_html/`** berisi berkas web publik.
6. Hapus file `.zip` setelah ekstraksi selesai untuk menghemat kuota hosting.

---

### Langkah 3: Konfigurasi File `.env`
1. Masuk ke folder **`saptara/`** di File Manager cPanel.
2. Pastikan opsi **Show Hidden Files (dotfiles)** aktif (ikon Settings di pojok kanan atas File Manager).
3. Temukan file bernama **`.env.cpanel.example`**, klik kanan lalu pilih **Rename** menjadi **`.env`**.
4. Klik kanan file `.env` baru tersebut, lalu pilih **Edit**.
5. Sesuaikan baris-baris berikut dengan kredensial cPanel Anda:
   ```env
   APP_NAME=SAPTARA
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://namadomainanda.com

   # Opsional: Jika direktori publik Anda bukan /home/username/public_html (misal: subdomain):
   # LARAVEL_PUBLIC_PATH=/home/saptarai/public_html

   DB_CONNECTION=mysql
   DB_HOST=localhost
   DB_DATABASE=saptarai_db
   DB_USERNAME=saptarai_user
   DB_PASSWORD=PasswordDatabaseAndaTadi
   ```
6. Klik **Save Changes**. *(Kunci `APP_KEY` dan `JWT_SECRET` sudah otomatis siap digunakan).*

---

### Langkah 4: Setup Database & Storage Link (Sekali Klik via Browser)
1. Buka browser dan akses alamat installer:
   ```text
   https://namadomainanda.com/install.php
   ```
2. Halaman diagnosa akan memeriksa apakah PHP, MySQL, dan folder `saptara/` sudah terdeteksi dengan benar.
3. Klik tombol **"Mulai Migrasi & Setup Database"**.
4. Installer akan secara otomatis:
   - Memastikan folder `storage/` dan `bootstrap/cache/` memiliki izin tulis.
   - Menjalankan migrasi seluruh tabel database.
   - Mengisi data awal kebiasaan maritim dan akun default (*db:seed*).
   - Menghubungkan symlink `storage` publik ke `saptara/storage/app/public`.
   - Mengoptimasi cache konfigurasi dan rute aplikasi.
5. **PENTING:** Setelah instalasi sukses, kembali ke File Manager cPanel, masuk ke folder `public_html/`, lalu **HAPUS file `install.php`** demi keamanan server.

---

## 🔑 Kredensial Login Bawaan Setelah Instalasi

| Peran Pengguna | URL Masuk | Kredensial Akun | Keterangan |
|---|---|---|---|
| **Super Admin** | `https://domainanda.com/admin/login` | **Email:** `admin@saptara.id`<br>**Password:** `password123` | Kelola master sekolah & buat akun admin sekolah |
| **Admin Sekolah** | `https://domainanda.com/school-admin/login` | **Sekolah:** `SMP Negeri 1 Samudra`<br>**Email:** `admin@samudra.sch.id`<br>**Password:** `password123` | Kelola guru, kelas, data siswa, dan orang tua |
| **Guru** | `https://domainanda.com` | **Sekolah:** `SMP Negeri 1 Samudra`<br>**Email:** `firman@school.id`<br>**Password:** `password123` | Masuk ke kelas/kapal & verifikasi logbook siswa |
| **Siswa** | `https://domainanda.com` | **Sekolah:** `SMP Negeri 1 Samudra`<br>**NIS:** `100001`<br>**PIN:** `123456` | Siswa: Kaisara Aqilla |

---

## ⏱️ Konfigurasi Cron Job (Opsional - Notifikasi Mingguan & Task Scheduler)
Di cPanel menu **Cron Jobs**, tambahkan perintah berikut setiap menit:
```bash
* * * * * /usr/local/bin/php /home/saptarai/saptara/artisan schedule:run >> /dev/null 2>&1
```
*(Sesuaikan path `/usr/local/bin/php` dan `/home/saptarai/saptara` dengan user cPanel Anda).*

---

## ⚠️ Troubleshooting: Error 403 Forbidden (LiteSpeed Web Server)

Jika saat membuka halaman web atau memanggil API muncul error:
> `403 Forbidden: Access to this resource on the server is denied!`

Penyebab umum dan cara mengatasinya:

### 1. Izin Berkas & Direktori (Aturan Ketat LiteSpeed suEXEC)
LiteSpeed dengan **suEXEC** menolak menjalankan file PHP jika folder atau file memiliki izin tulis oleh grup (`group-writable`) atau publik.
- **Direktori/Folder** wajib berizin **`755`** (bukan `775` atau `777`).
- **Berkas/File** (`index.php`, `.htaccess`, `.php`) wajib berizin **`644`** (bukan `664` atau `777`).

**Cara Cepat Memperbaiki di cPanel:**
- Melalui File Manager: Klik kanan file `index.php` di dalam `public_html/` -> **Change Permissions** -> ubah menjadi **`0644`** (User: Read+Write, Group: Read, World: Read). Lakukan hal yang sama untuk `install.php` dan folder `public_html/` (`0755`).
- Melalui Terminal cPanel (jika tersedia):
  ```bash
  chmod 755 /home/username/public_html
  find /home/username/public_html -type d -exec chmod 755 {} +
  find /home/username/public_html -type f -exec chmod 644 {} +
  ```

### 2. Pastikan File `.htaccess` Benar di `public_html`
Pastikan file `.htaccess` di dalam `public_html/` adalah isi dari `public/.htaccess` (yang mengarahkan ke `index.php`), **BUKAN** file root `.htaccess` proyek:
```apache
DirectoryIndex index.php index.html

<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Handle X-XSRF-Token Header
    RewriteCond %{HTTP:x-xsrf-token} .
    RewriteRule .* - [E=HTTP_X_XSRF_TOKEN:%{HTTP:X-XSRF-Token}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```
*(Catatan: Jika server hosting menolak direktif `Options`, coba beri tanda pagar `# Options -MultiViews -Indexes`).*

### 3. Nonaktifkan Sementara ModSecurity (WAF)
Pada beberapa hosting, firewall **ModSecurity** memblokir request API:
1. Di cPanel, cari menu **ModSecurity** (di bawah kategori *Security*).
2. Nonaktifkan untuk domain Anda, lalu uji kembali web.

### 4. Pastikan Versi PHP Aktif Mendukung
1. Di cPanel, buka **Select PHP Version** atau **MultiPHP Manager**.
2. Pastikan versi PHP yang dipilih adalah **PHP 8.2**, **8.3**, atau **8.4**.
3. Pastikan ekstensi `pdo_mysql`, `mbstring`, `fileinfo`, `openssl`, `curl`, `zip`, `bcmath` aktif.
