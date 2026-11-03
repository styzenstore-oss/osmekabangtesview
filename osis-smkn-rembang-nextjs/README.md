# Website OSIS SMK Negeri Rembang

Website resmi OSIS SMK Negeri Rembang, Pasuruan. Dibuat dengan Next.js (App Router) dan React, **dilengkapi panel admin** supaya anggota OSIS bisa mengelola seluruh isi website tanpa menyentuh kode.

## Isi website

- **Beranda:** hitung mundur kegiatan berikutnya, slider poster, kegiatan terdekat, kolaborasi terbaru.
- **Kegiatan:** semua kegiatan dengan filter, pencarian, dan galeri dokumentasi.
- **Kolaborasi:** kerja sama OSIS dengan ekstrakurikuler dan pihak lain.
- **Profil:** salam ketua dan pembina, visi, dan misi.
- **Hari Guru (`/hari-guru`):** voting guru terfavorit, anonim, dengan kuota suara per kelas.
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

Halaman `/hari-guru`. **Jalankan ulang `supabase-setup.sql`** (bagian 3 baru, aman dijalankan ulang) agar tabel `guru_votes` dan fungsi vote dibuat.

Cara kerja:

1. Di **Admin > Hari Guru**, unggah foto guru (boleh banyak sekaligus; nama terisi otomatis dari nama file, tinggal diperbaiki).
2. Isi daftar kelas beserta jumlah siswanya, misalnya `XI TMP 1, 35` (bisa ditempel banyak baris sekaligus). Jumlah siswa menjadi **kuota suara** kelas itu.
3. Klik **Isi semua kelas SMKN Rembang** (35 kelas: TKI, TPM, TKR, TITL, DPB), atur jumlah siswa tiap kelas, centang **Voting dibuka**, lalu **Simpan**.
4. Tiap kelas punya **link sendiri**, misalnya `/hari-guru/x-titl-2` untuk X TITL 2. Salin lewat tombol **Salin link** (satu kelas) atau **Salin semua link**, lalu bagikan ke wali kelas atau grup kelas. Halaman `/hari-guru` menampilkan daftar kelas per jurusan.
5. Siswa membuka link kelasnya, memilih satu guru, dan mengonfirmasi. Suara bersifat **anonim**: database hanya menyimpan id kelas dan id guru.
5. Setelah kuota kelas terpenuhi (35 dari 35), kelas itu tidak bisa memilih lagi. Pencatatan suara dilakukan atomik di database sehingga kuota tidak bisa terlampaui walau banyak siswa menekan bersamaan.
6. Hasil hanya terlihat oleh admin selama voting berjalan. Opsi **Tampilkan hasil ke publik** menampilkan peringkat setelah voting ditutup.

Batasan yang perlu diketahui:

- Karena suara anonim tanpa akun, sistem tidak bisa memastikan *siapa* yang sudah memilih. Pengamannya: kuota per kelas, plus penguncian perangkat (cookie) agar satu HP tidak memilih berkali-kali untuk kelas yang sama. Siswa yang sengaja menghapus cookie atau memakai browser lain masih bisa memakai jatah teman sekelasnya. Bila ini jadi masalah, pantau lewat guru wali kelas, atau gunakan tombol **Reset suara** per kelas.
- Matikan opsi "Satu perangkat, satu suara per kelas" bila siswa bergantian memakai komputer yang sama (misalnya di lab).
- Waktu tutup otomatis dibaca sebagai WIB.

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
