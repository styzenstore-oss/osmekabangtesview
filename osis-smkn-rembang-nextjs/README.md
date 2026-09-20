# Website OSIS SMK Negeri Rembang

Website resmi OSIS SMK Negeri Rembang, Pasuruan. Dibuat dengan Next.js (App Router), React, dan CSS biasa tanpa library tambahan.

## Isi website

- **Beranda:** hitung mundur kegiatan OSIS berikutnya, slider poster (card landscape, berganti otomatis), kegiatan terdekat, dan kolaborasi terbaru.
- **Kegiatan:** seluruh kegiatan OSIS (berbagi takjil, MPLS, LDKS, peringatan hari besar, dan lainnya) dengan filter, pencarian, dan galeri dokumentasi untuk tiap kegiatan.
- **Kolaborasi:** kolaborasi yang sudah dilakukan OSIS bersama pihak lain, juga dengan galeri dokumentasi.
- **Profil:** salam ketua dan pembina, visi, dan misi.
- Visi, misi, dan salam ketua/pembina tampil di bawah setiap halaman.

## Menjalankan di komputer

Butuh Node.js versi 18.17 atau lebih baru.

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

## Menambah foto dokumentasi (tanpa batas, tanpa mengubah kode)

Foto dibaca otomatis dari folder. Jumlahnya tidak dibatasi, dan urutannya mengikuti nama file (1, 2, 3, ... 10 diurutkan sebagai angka). Format yang didukung: jpg, jpeg, png, webp, avif, gif.

| Untuk | Taruh foto di |
| --- | --- |
| Dokumentasi kegiatan | `public/dokumentasi/kegiatan/<id-kegiatan>/` |
| Dokumentasi kolaborasi | `public/dokumentasi/kolaborasi/<id-kolaborasi>/` |
| Poster di beranda | `public/poster/` |

`<id-kegiatan>` dan `<id-kolaborasi>` adalah nilai `id` di `lib/data.js`. Contoh: foto MPLS ditaruh di `public/dokumentasi/kegiatan/mpls/`. Folder untuk semua contoh kegiatan sudah disediakan.

Setelah foto ditaruh, jalankan ulang `npm run dev` (atau refresh) untuk melihat hasilnya. Di Vercel, foto baru ikut tampil setelah di-push ke GitHub dan proyek di-deploy ulang.

Tips: foto dari HP boleh langsung dipakai, Next.js otomatis mengecilkan ukurannya saat ditampilkan.

### Poster

- Taruh poster berbentuk landscape (disarankan rasio 16:9, misalnya 1600 x 900 piksel) di `public/poster/`.
- Poster berganti otomatis tiap beberapa detik, berhenti saat kursor di atasnya, dan bisa digeser atau diperbesar.
- **Hapus** `contoh-1.jpg`, `contoh-2.jpg`, dan `contoh-3.jpg` di folder itu sebelum website dipublikasikan.
- Ingin mengubah kecepatan? Ubah `JEDA` (milidetik) di `components/PosterSlider.js`.

## Mengganti teks dan data

Semua teks ada di satu file: `lib/data.js`.

- **Ketua dan pembina, visi, misi, salam:** bagian `ketua`, `pembina`, `visi`, `misi`. Untuk foto, taruh file di `public/foto` lalu isi `foto: '/foto/ketua.jpg'`.
- **Kegiatan:** tambah atau ubah item di `kegiatan`. Format `mulai` adalah `'2026-12-19T09:00'`. Untuk kegiatan beberapa hari, isi juga `sampai: '2026-12-21'`. Kategori: `Peringatan`, `Kepemimpinan`, `Lomba & Seni`, `Sosial`, atau `Olahraga`.
- **Kolaborasi:** tambah atau ubah item di `kolaborasi`. Isi `mitra` dengan nama pihak yang diajak bekerja sama (ekstrakurikuler, komunitas, sekolah lain, dan sebagainya).
- Setiap kegiatan/kolaborasi baru butuh `id` unik tanpa spasi (contoh: `'bakti-sosial'`). Buat folder dokumentasinya dengan nama yang sama.
- **Periode kepengurusan:** ubah `periode`.

Status "Akan datang" dan "Selesai" serta hitung mundur dihitung otomatis dari jam perangkat pengunjung.

## Logo

- `public/logo-smkn-rembang.png`: logo utuh (footer).
- `public/emblem-osis.png`: kedua emblem dengan latar transparan (header dan halaman Profil).
- `app/icon.png`: ikon tab browser.

## Deploy ke Vercel

1. Upload folder ini ke repository GitHub (`node_modules` dan `.next` tidak perlu, sudah masuk `.gitignore`).
2. Di Vercel, pilih **Add New Project**, lalu impor repository tersebut.
3. Biarkan pengaturan bawaan, lalu klik **Deploy**.

## Struktur

```
app/            halaman (Beranda, Kegiatan, Kolaborasi, Profil) dan layout
components/     header, footer, slider poster, galeri, penampil foto, kartu kegiatan, dll.
lib/data.js     seluruh isi website
lib/events.js   pengolahan data kegiatan dan status
lib/media.js    pembaca foto otomatis dari folder public
lib/format.js   format tanggal dan jam bahasa Indonesia
public/         logo, poster, foto ketua/pembina, dan folder dokumentasi
```
