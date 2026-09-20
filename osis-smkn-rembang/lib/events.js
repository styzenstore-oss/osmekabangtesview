import { DATA } from './data';

export const KATEGORI = ['Peringatan', 'Kepemimpinan', 'Lomba & Seni', 'Sosial', 'Olahraga'];

export const WARNA = {
  Peringatan: 'var(--gold)',
  Kepemimpinan: 'var(--cyan)',
  'Lomba & Seni': 'var(--red)',
  Sosial: '#2FB36D',
  Olahraga: '#7C6CF0',
};

export const STATUS = { akan: 'Akan datang', berlangsung: 'Berlangsung', selesai: 'Selesai' };

// Tanggal tanpa zona waktu dibaca sebagai waktu lokal perangkat.
function siapkan(list) {
  return list.map((e) => ({
    ...e,
    mitra: e.mitra || [],
    start: new Date(e.mulai),
    endDay: new Date((e.sampai || e.mulai.slice(0, 10)) + 'T23:59:59'),
  }));
}

// Kegiatan OSIS: urut dari yang paling awal.
export const KEGIATAN = siapkan(DATA.kegiatan).sort((a, b) => a.start - b.start);

// Kolaborasi: urut dari yang paling baru.
export const KOLABORASI = siapkan(DATA.kolaborasi).sort((a, b) => b.start - a.start);

// "now" harus berasal dari browser (lihat useNow) agar status selalu terbaru.
export function statusOf(e, now) {
  if (!now) return null;
  if (e.endDay < now) return 'selesai';
  if (e.start <= now) return 'berlangsung';
  return 'akan';
}
