// Logika voting Guru Terfavorit (Hari Guru Nasional). Hanya dipakai di server.
import { dbReady, readKey, rpc } from './supabase';

export const COOKIE_VOTE = 'osis_hg';

export function defaultHariGuru() {
  return {
    judul: 'Guru Terfavorit',
    deskripsi: 'Dalam rangka Hari Guru Nasional, pilih satu guru yang paling berkesan bagi kelasmu. Pilihanmu anonim.',
    buka: false,
    tutup: '', // 'TAHUN-BULAN-TANGGALTJAM:MENIT' (WIB), kosong = tanpa batas waktu
    tampilHasil: false,
    kunciPerangkat: true,
    guru: [],
    kelas: [],
  };
}

export async function bacaHariGuru() {
  const d = defaultHariGuru();
  if (!dbReady()) return d;
  const v = await readKey('hariguru');
  if (!v) return d;
  return { ...d, ...v, guru: v.guru || [], kelas: v.kelas || [] };
}

// Waktu tutup selalu dibaca sebagai WIB (UTC+7), apa pun zona waktu server.
export function votingTerbuka(cfg, sekarang = Date.now()) {
  if (!cfg.buka) return false;
  if (cfg.tutup) {
    const t = Date.parse(`${cfg.tutup}:00+07:00`);
    if (!Number.isNaN(t) && sekarang >= t) return false;
  }
  return true;
}

export const bacaVoted = (v) =>
  String(v || '')
    .split(',')
    .filter((x) => /^[a-z0-9][a-z0-9-]{0,60}$/.test(x));

// Mengubah baris rekap database menjadi ringkasan. Suara untuk guru/kelas yang sudah dihapus tidak dihitung.
export async function bacaRekap(cfg) {
  const rows = await rpc('rekap_guru_vote');
  const guruAda = new Set(cfg.guru.map((g) => g.id));
  const kelasAda = new Set(cfg.kelas.map((k) => k.id));
  const perKelas = {};
  const perGuru = {};
  const matriks = {};
  let total = 0;
  for (const r of Array.isArray(rows) ? rows : []) {
    const n = Number(r.jumlah) || 0;
    if (!kelasAda.has(r.kelas_id)) continue;
    perKelas[r.kelas_id] = (perKelas[r.kelas_id] || 0) + n;
    total += n;
    if (!guruAda.has(r.guru_id)) continue;
    perGuru[r.guru_id] = (perGuru[r.guru_id] || 0) + n;
    (matriks[r.kelas_id] ||= {})[r.guru_id] = n;
  }
  return { total, perKelas, perGuru, matriks };
}
