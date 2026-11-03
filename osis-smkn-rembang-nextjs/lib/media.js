// Membaca foto dari folder public saat build/server berjalan (hanya dipakai di Server Component).
// Tambah foto = cukup taruh file di folder yang sesuai, tanpa mengubah kode.
import fs from 'fs';
import path from 'path';

const EXT = /\.(jpe?g|png|webp|avif|gif)$/i;

function daftarFile(subdir) {
  try {
    return fs
      .readdirSync(path.join(process.cwd(), 'public', subdir))
      .filter((f) => EXT.test(f))
      .sort((a, b) => a.localeCompare(b, 'id', { numeric: true, sensitivity: 'base' }));
  } catch (e) {
    return [];
  }
}

const url = (subdir, file) => '/' + [...subdir.split('/'), file].map(encodeURIComponent).join('/');

// Semua gambar di public/poster
export function getPoster() {
  return daftarFile('poster').map((f, i) => ({
    src: url('poster', f),
    alt: `Poster kegiatan OSIS ${i + 1}`,
  }));
}

// jenis: 'kegiatan' atau 'kolaborasi'. Hasil: { [id]: [{ src, alt }, ...] }
export function getFotoMap(jenis, list) {
  const map = {};
  list.forEach((e) => {
    const dir = `dokumentasi/${jenis}/${e.id}`;
    map[e.id] = daftarFile(dir).map((f, i) => ({
      src: url(dir, f),
      alt: `Dokumentasi ${e.judul}, foto ${i + 1}`,
    }));
  });
  return map;
}
