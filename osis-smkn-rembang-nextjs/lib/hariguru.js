// Logika voting Guru Terfavorit (Hari Guru Nasional). Hanya dipakai di server.
import { cookies } from 'next/headers';
import { dbReady, publicUrl, readKey, rpc } from './supabase';

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

// ---------- Kode kelas (satu kode untuk satu kelas) ----------
export const normalKode = (v) => String(v ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');

export const bacaVoted = (v) =>
  String(v || '')
    .split(',')
    .filter((x) => /^[a-z0-9][a-z0-9-]{0,60}$/.test(x));

// Pembatas tebakan kode (per IP, di memori server). Batasnya longgar karena satu Wi-Fi sekolah bisa berbagi satu IP.
const gagal = new Map();
const BATAS_GAGAL = 60;
const JENDELA = 10 * 60 * 1000;
export const ipDari = (req) => (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'lokal';
export function terlaluBanyakGagal(ip) {
  const r = gagal.get(ip);
  if (!r) return false;
  if (Date.now() - r.t > JENDELA) {
    gagal.delete(ip);
    return false;
  }
  return r.n >= BATAS_GAGAL;
}
export function catatGagal(ip) {
  const r = gagal.get(ip);
  if (!r || Date.now() - r.t > JENDELA) gagal.set(ip, { n: 1, t: Date.now() });
  else r.n++;
}

export function asalSah(req) {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.get('host');
  } catch (e) {
    return false;
  }
}

// Mencari kelas pemilik kode. null jika kode tidak dikenal.
export function cariKelas(cfg, mentah) {
  const kode = normalKode(mentah);
  if (kode.length < 4) return null;
  return cfg.kelas.find((k) => k.kode && k.kode === kode) || null;
}

// Data untuk halaman publik. Daftar kelas dan jumlah suara kelas tidak dikirim ke browser.
export async function siapkanPublik() {
  if (!dbReady()) return { status: 'belum' };
  let cfg;
  let rekap;
  try {
    cfg = await bacaHariGuru();
    rekap = await bacaRekap(cfg);
  } catch (e) {
    return { status: 'galat' };
  }
  const terbuka = votingTerbuka(cfg);
  return {
    status: 'ok',
    cfg,
    data: {
      buka: terbuka,
      tutup: cfg.tutup || '',
      kunci: cfg.kunciPerangkat,
      guru: cfg.guru.map((g) => ({ id: g.id, nama: g.nama, mapel: g.mapel, foto: g.foto ? publicUrl(g.foto) : null })),
      hasil: cfg.tampilHasil && !terbuka ? rekap.perGuru : null,
    },
  };
}
