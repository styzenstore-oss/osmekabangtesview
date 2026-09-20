# Website OSIS SMK Negeri Rembang

Website resmi OSIS SMK Negeri Rembang, Pasuruan. Dibuat dengan Next.js (App Router), tema digital, dan logo sekolah yang menyatu di header, halaman profil, footer, dan favicon.

## Halaman

| Alamat | Isi |
| --- | --- |
| `/` | Beranda: hitung mundur agenda berikutnya, kegiatan terdekat, ekskul yang berkolaborasi |
| `/kegiatan` | Semua kegiatan OSIS dengan filter kategori, filter status, dan pencarian |
| `/kolaborasi` | Kolaborasi OSIS dengan tiap ekstrakurikuler |
| `/profil` | Salam lengkap ketua dan pembina, visi, dan misi |

Setiap halaman ditutup dengan bagian visi, misi, dan salam dari ketua serta pembina.

## Menjalankan di komputer

Butuh Node.js 18.18 atau lebih baru.

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

## Mengganti isi website

Semua teks ada di satu file: `lib/data.js`.

- **Nama ketua dan pembina, salam, visi, misi:** ubah bagian `ketua`, `pembina`, `visi`, `misi`.
- **Foto ketua dan pembina:** taruh file di `public/foto/` (misalnya `ketua.jpg`), lalu isi `foto: '/foto/ketua.jpg'`. Rasio foto 4:5 (potret) paling pas.
- **Kegiatan:** tambah atau ubah item di `kegiatan`. Waktu memakai WIB (`+07:00`). Untuk kegiatan beberapa hari, isi `sampai` dengan tanggal terakhir.
- **Ekstrakurikuler:** ubah daftar `ekskul`. Ikon yang tersedia: `tenda`, `plus`, `bendera`, `bulan`, `kamera`, `nada`, `bola`.
- **Periode kepengurusan:** ubah `periode`.

Status "Akan datang", "Berlangsung", dan "Selesai" serta hitung mundur dihitung otomatis dari tanggal.

## Struktur folder

```
app/            halaman (beranda, kegiatan, kolaborasi, profil), layout, dan CSS
components/     header, footer, dialog rincian kegiatan, hitung mundur, filter kegiatan
lib/data.js     seluruh isi website
lib/events.js   format tanggal WIB dan status kegiatan
public/         logo sekolah dan folder foto
```

## Deploy ke Vercel

1. Upload folder ini ke GitHub.
2. Di Vercel, pilih **Add New Project**, lalu pilih repository tersebut.
3. Biarkan pengaturan bawaan (Framework: Next.js), lalu klik **Deploy**.

Tidak ada database maupun environment variable yang perlu diisi.
