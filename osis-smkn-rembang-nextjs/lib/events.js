export const KATEGORI = ['Peringatan', 'Kepemimpinan', 'Lomba & Seni', 'Sosial', 'Olahraga'];

export const WARNA = {
  Peringatan: 'var(--gold)',
  Kepemimpinan: 'var(--accent)',
  'Lomba & Seni': 'var(--rose)',
  Sosial: 'var(--green)',
  Olahraga: 'var(--violet)',
};

export const STATUS = { akan: 'Akan datang', berlangsung: 'Berlangsung', selesai: 'Selesai' };

// Tanggal tanpa zona waktu dibaca sebagai waktu lokal perangkat.
export function siapkan(list) {
  return (list || []).map((e) => ({
    ...e,
    mitra: e.mitra || [],
    fotos: e.fotos || [],
    start: new Date(e.mulai),
    endDay: new Date((e.sampai || e.mulai.slice(0, 10)) + 'T23:59:59'),
  }));
}

// Kegiatan OSIS: urut dari yang paling awal.
export const urutKegiatan = (list) => siapkan(list).sort((a, b) => a.start - b.start);

// Kolaborasi: urut dari yang paling baru.
export const urutKolaborasi = (list) => siapkan(list).sort((a, b) => b.start - a.start);

// "now" harus berasal dari browser (lihat useNow) agar status selalu terbaru.
export function statusOf(e, now) {
  if (!now) return null;
  if (e.endDay < now) return 'selesai';
  if (e.start <= now) return 'berlangsung';
  return 'akan';
}
