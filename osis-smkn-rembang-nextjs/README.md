# Website OSIS SMK Negeri Rembang

Website resmi OSIS SMK Negeri Rembang, Pasuruan. Dibuat dengan Next.js (App Router) dan React, **dilengkapi panel admin** supaya anggota OSIS bisa mengelola seluruh isi website tanpa menyentuh kode.

## Isi website

- **Beranda:** hitung mundur kegiatan berikutnya, slider poster, kegiatan terdekat, kolaborasi terbaru.
- **Kegiatan:** semua kegiatan dengan filter, pencarian, dan galeri dokumentasi.
- **Kolaborasi:** kerja sama OSIS dengan ekstrakurikuler dan pihak lain.
- **Profil:** salam ketua dan pembina, visi, dan misi.
- **Hari Guru (`/hari-guru`):** voting guru terfavorit, anonim, dengan satu kode per kelas dan kuota suara sesuai jumlah siswa.
- **Panel admin** di `/admin` (satu akun untuk seluruh pengurus).

## Panel admin: apa saja yang bisa diatur

| Menu | Fungsi |
| --- | --- |
| Ringkasan | jumlah data, kegiatan berikutnya, pintasan |
| Kegiatan | tambah, ubah, hapus kegiatan + unggah foto dokumentasi (tanpa batas) |
| Kolaborasi | tambah, ubah, hapus kolaborasi, daftar mitra, foto dokumentasi |
| Poster | unggah, hapus, dan atur urutan poster slider beranda |
| Hari Guru | unggah foto + nama guru (bisa banyak sekaligus), daftar kelas + jumlah siswa, buka/tutup voting, hasil suara, reset |
| Profil | periode, visi, misi, nama + foto + salam ketua dan pembina |

Perubahan langsung tampil di website. Foto dikecilkan otomatis di browser sebelum diunggah, jadi foto HP boleh langsung dipakai. Panel ini nyaman dipakai dari HP (menu berpindah ke bawah layar).

## Pengaturan pertama kali (sekali saja)

Panel admin menyimpan data di **Supabase** (gratis) karena Vercel tidak bisa menyimpan file baru.

1. Buat proyek di [supabase.com](https://supabase.com).
2. Buka **SQL Editor**, tempel seluruh isi `supabase-setup.sql`, klik **Run**. Ini membuat tabel dan tempat foto.
3. Buka **Project Settings > API**. Salin **Project URL** dan **service_role key** (atau secret key).
4. Isi environment variables (di Vercel: **Settings > Environment Variables**; di komputer: salin `.env.example` menjadi `.env.local`):

| Nama | Isi |
| --- | --- |
| `SUPABASE_URL` | Project URL dari langkah 3 |
| `SUPABASE_SERVICE_KEY` | service_role key dari langkah 3 (rahasia) |
| `ADMIN_USERNAME` | username login, misalnya `osis` |
| `ADMIN_PASSWORD` | sandi yang kuat |
| `SESSION_SECRET` | teks acak minimal 32 karakter (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) |

5. Deploy ulang di Vercel, lalu buka `https://alamat-website-anda/admin`.

Sebelum langkah ini selesai, website tetap tampil normal memakai data di `lib/data.js` dan folder `public` seperti versi sebelumnya. Saat panel admin pertama kali disimpan, data bawaan itu otomatis menjadi data awal di database, jadi tinggal diubah.

### Mengganti sandi atau mengeluarkan semua sesi

Ubah `ADMIN_PASSWORD` atau `SESSION_SECRET` di Vercel lalu deploy ulang. Mengubah `SESSION_SECRET` langsung membuat semua sesi login yang sedang aktif tidak berlaku.

## Voting Hari Guru (guru terfavorit)

Halaman `/hari-guru`. **Jalankan ulang `supabase-setup.sql`** (bagian 3 baru, aman dijalankan ulang) agar tabel suara dan fungsi voting dibuat.

Cara kerja:

1. Di **Admin > Hari Guru**, unggah foto guru (boleh banyak sekaligus; nama terisi otomatis dari nama file, tinggal diperbaiki).
2. Klik **Isi semua kelas SMKN Rembang** (35 kelas: TKI, TPM, TKR, TITL, DPB) atau tambah kelas sendiri, lalu isi **jumlah siswa** tiap kelas (misalnya 35 atau 34). Tiap kelas otomatis mendapat **satu kode** acak (misalnya `HW2K7M`); tombol **Acak** membuat kode baru, atau kode bisa diketik sendiri (5 sampai 10 huruf/angka). Centang **Voting dibuka**, lalu **Simpan**.
3. Bagikan kode ke wali kelas lewat **Salin kode** (satu kelas), **Salin semua kode**, atau **Unduh kode (CSV)**.
4. Semua siswa memakai satu link yang sama, `/hari-guru`. Siswa memasukkan kode kelasnya, memilih satu guru, dan mengonfirmasi. Kode hanya mengenali kelas, jadi siswa tidak bisa memilih untuk kelas lain.
5. Jumlah siswa menjadi **kuota suara** kelas. Setelah penuh (35 dari 35), kode kelas itu tidak berlaku lagi. Pencatatan suara atomik di database sehingga kuota tidak bisa terlampaui walau banyak siswa menekan bersamaan.
6. Hasil hanya terlihat oleh admin selama voting berjalan. Opsi **Tampilkan hasil ke publik** menampilkan peringkat setelah voting ditutup.

Soal anonimitas: suara hanya menyimpan id kelas dan id guru, tanpa nama atau identitas.

Batasan: karena satu kode dipakai seluruh kelas, sistem tidak tahu *siapa* yang sudah memilih. Pengamannya adalah kuota kelas dan penguncian perangkat (cookie) agar satu HP tidak memilih berkali-kali untuk kelas yang sama. Siswa yang sengaja memilih dua kali dari perangkat berbeda akan memakai jatah teman sekelasnya; kelas melapor ke OSIS, lalu admin memakai tombol **Reset suara** pada kelas itu. Matikan opsi "Satu perangkat, satu suara per kelas" bila siswa bergantian memakai komputer yang sama. Tebakan kode dibatasi 60 kali salah per 10 menit per IP. Jika kode bocor ke kelas lain, tekan **Acak**, **Simpan**, dan bagikan kode baru. Waktu tutup otomatis dibaca sebagai WIB.

## Keamanan

- Semua halaman dan API `/admin` dijaga middleware dan dicek ulang di setiap API.
- Sesi memakai cookie `httpOnly` bertanda tangan HMAC, berlaku 8 jam. Password dibandingkan dengan cara yang tahan serangan waktu.
- Salah sandi 5 kali dari satu IP dikunci 15 menit (disimpan di memori server, jadi di Vercel bisa reset saat server berganti; ini penahan tebak-tebakan, bukan pengganti sandi kuat).
- `SUPABASE_SERVICE_KEY` hanya dipakai di server, tidak pernah dikirim ke browser. Tabel dikunci (RLS), hanya server yang bisa mengubahnya.
- Unggahan foto dicek isinya (JPG/PNG/WebP), dibatasi 4 MB, dan hanya boleh ke folder yang diizinkan.
- Halaman admin diberi `noindex` agar tidak muncul di Google. Jangan pernah mengunggah `.env.local` ke GitHub (sudah masuk `.gitignore`).

## Animasi

- **Animasi pembuka** saat pertama masuk (logo, garis, bilah muat, lalu layar terbelah terbuka). Tampil sekali per tab; dilewati otomatis jika pengunjung memilih "kurangi gerakan" di perangkatnya.
- **Menu (taskbar) di HP:** tombol hamburger berubah menjadi X, panel menu turun, tautan masuk satu per satu, latar memburam. Menu desktop punya garis penanda yang bergeser.
- **Perpindahan halaman, judul, kartu, dan angka statistik** muncul berurutan; bagian bawah halaman muncul saat digulir.
- **Login admin:** latar bergerak, kartu masuk dengan efek kabur, kolom menyala saat difokus, kartu bergetar jika salah sandi, lalu layar membuka dengan tanda centang saat berhasil.
- Semua animasi ada di akhir `app/globals.css`. Durasi animasi pembuka diatur oleh `--intro` dan keyframe `.splash-*`.

## Menjalankan di komputer

Butuh Node.js 18.17 atau lebih baru.

```bash
npm install
npm run dev
```

Buka http://localhost:3000 (admin di http://localhost:3000/admin).

## Mengubah warna tema

Semua warna ada di blok `:root` di bagian atas `app/globals.css` (mode terang) dan dua blok mode gelap di bawahnya. Panel admin ikut memakai tema yang sama.

## Struktur

```
app/(site)/           halaman publik (Beranda, Kegiatan, Kolaborasi, Profil) + layout dengan header/footer
app/admin/            halaman login dan panel admin
app/api/admin/        API admin: login, logout, content (simpan data), upload (foto)
components/admin/     isi panel admin (login, kegiatan, kolaborasi, poster, profil)
components/           header, footer, splash, slider poster, galeri, dll.
lib/content.js        sumber data: database jika diatur, lib/data.js jika belum
lib/supabase.js       koneksi database dan penyimpanan foto
lib/auth.js           sesi login
lib/validate.js       pemeriksaan data dari admin
lib/data.js           data bawaan / cadangan
middleware.js         penjaga /admin
supabase-setup.sql    dijalankan sekali di Supabase
```
