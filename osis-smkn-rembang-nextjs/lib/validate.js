// Pemeriksaan data dari panel admin sebelum disimpan ke database.
import { KATEGORI } from './events';

const str = (v, max, nama, wajib = true) => {
  const s = String(v ?? '').trim();
  if (wajib && !s) throw new Error(`${nama} wajib diisi.`);
  if (s.length > max) throw new Error(`${nama} terlalu panjang (maksimal ${max} karakter).`);
  return s;
};

const ID = /^[a-z0-9][a-z0-9-]{0,60}$/;
const PATH = /^[a-z0-9][a-z0-9._\-/]*$/i;
const MULAI = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const TGL = /^\d{4}-\d{2}-\d{2}$/;

function path(p, prefix, nama) {
  if (typeof p !== 'string' || !PATH.test(p) || p.includes('..') || !p.startsWith(prefix) || p.length > 200) {
    throw new Error(`Foto tidak valid pada ${nama}.`);
  }
  return p;
}

function daftarFoto(arr, prefix, nama, maks = 300) {
  if (arr == null) return [];
  if (!Array.isArray(arr) || arr.length > maks) throw new Error(`Jumlah foto pada ${nama} terlalu banyak.`);
  return [...new Set(arr.map((p) => path(p, prefix, nama)))];
}

function cleanItems(list, jenis) {
  if (!Array.isArray(list) || list.length > 500) throw new Error('Data tidak valid.');
  const ids = new Set();
  return list.map((e) => {
    const id = String(e?.id || '');
    if (!ID.test(id)) throw new Error('ID tidak valid.');
    if (ids.has(id)) throw new Error('Ada ID ganda.');
    ids.add(id);
    const judul = str(e.judul, 200, 'Judul');
    const mulai = String(e.mulai || '');
    if (!MULAI.test(mulai) || Number.isNaN(new Date(mulai).getTime())) throw new Error(`Tanggal dan jam "${judul}" tidak valid.`);
    const out = {
      id,
      judul,
      mulai,
      tempat: str(e.tempat, 160, 'Tempat'),
      desk: str(e.desk, 2000, 'Deskripsi', false),
      fotos: daftarFoto(e.fotos, `${jenis}/${id}/`, judul),
    };
    if (jenis === 'kegiatan') {
      if (!KATEGORI.includes(e.kat)) throw new Error(`Kategori "${judul}" tidak valid.`);
      out.kat = e.kat;
      if (e.sampai) {
        if (!TGL.test(e.sampai) || e.sampai < mulai.slice(0, 10)) throw new Error(`Tanggal selesai "${judul}" tidak valid.`);
        out.sampai = e.sampai;
      }
    } else {
      const mitra = Array.isArray(e.mitra) ? e.mitra : [];
      if (mitra.length > 12) throw new Error('Mitra terlalu banyak.');
      out.mitra = mitra.map((m) => str(m, 60, 'Nama mitra', false)).filter(Boolean);
    }
    return out;
  });
}

function cleanPerson(p, nama) {
  if (!p || typeof p !== 'object') throw new Error(`Data ${nama} tidak valid.`);
  const salam = Array.isArray(p.salam) ? p.salam : [];
  if (salam.length > 10) throw new Error('Paragraf salam terlalu banyak.');
  return {
    nama: str(p.nama, 80, `Nama ${nama}`),
    jabatan: str(p.jabatan, 60, `Jabatan ${nama}`),
    foto: p.foto ? path(p.foto, 'foto/', nama) : null,
    ringkas: str(p.ringkas, 500, `Ringkasan ${nama}`, false),
    salam: salam.map((s) => str(s, 1200, 'Paragraf salam', false)).filter(Boolean),
  };
}

function cleanSettings(s) {
  if (!s || typeof s !== 'object') throw new Error('Data tidak valid.');
  const misi = Array.isArray(s.misi) ? s.misi : [];
  if (misi.length > 15) throw new Error('Misi terlalu banyak.');
  return {
    periode: str(s.periode, 20, 'Periode'),
    visi: str(s.visi, 800, 'Visi'),
    misi: misi.map((m) => str(m, 400, 'Misi', false)).filter(Boolean),
    ketua: cleanPerson(s.ketua, 'ketua'),
    pembina: cleanPerson(s.pembina, 'pembina'),
    poster: daftarFoto(s.poster, 'poster/', 'poster', 60),
  };
}

export const KEYS = ['settings', 'kegiatan', 'kolaborasi'];

export function bersihkan(key, value) {
  if (key === 'kegiatan') return cleanItems(value, 'kegiatan');
  if (key === 'kolaborasi') return cleanItems(value, 'kolaborasi');
  if (key === 'settings') return cleanSettings(value);
  throw new Error('Kunci tidak dikenal.');
}

// Semua path foto yang dipakai oleh sebuah nilai (untuk menghapus file yang sudah tidak dipakai).
export function semuaPath(key, value) {
  if (!value) return [];
  if (key === 'settings') return [...(value.poster || []), value.ketua?.foto, value.pembina?.foto].filter(Boolean);
  return (value || []).flatMap((e) => e.fotos || []);
}
