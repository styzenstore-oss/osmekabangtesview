// Sumber data website. Jika Supabase sudah diatur, data dibaca dari database (diubah lewat panel admin).
// Jika belum, website memakai lib/data.js dan folder public seperti sebelumnya.
import { cache } from 'react';
import { DATA } from './data';
import { getFotoMap, getPoster } from './media';
import { dbReady, publicUrl, readKey } from './supabase';

const clone = (v) => JSON.parse(JSON.stringify(v));

export function defaultSettings() {
  const { kegiatan, kolaborasi, ...rest } = DATA;
  return { ...clone(rest), poster: [] };
}

// Data mentah (foto berupa path penyimpanan). Dipakai panel admin dan API.
export async function readRaw() {
  if (!dbReady()) {
    return {
      configured: false,
      error: null,
      settings: defaultSettings(),
      kegiatan: clone(DATA.kegiatan),
      kolaborasi: clone(DATA.kolaborasi),
    };
  }
  let error = null;
  const load = async (key, fallback) => {
    try {
      const v = await readKey(key);
      return v == null ? fallback : v;
    } catch (e) {
      error = e.message;
      return fallback;
    }
  };
  const [settings, kegiatan, kolaborasi] = await Promise.all([
    load('settings', {}),
    load('kegiatan', clone(DATA.kegiatan)),
    load('kolaborasi', clone(DATA.kolaborasi)),
  ]);
  const norm = (list) => list.map((e) => ({ ...e, mitra: e.mitra || [], fotos: e.fotos || [] }));
  return {
    configured: true,
    error,
    settings: { ...defaultSettings(), ...settings },
    kegiatan: norm(kegiatan),
    kolaborasi: norm(kolaborasi),
  };
}

const resolveFoto = (v) => {
  if (!v) return null;
  return /^(\/|https?:)/.test(v) ? v : publicUrl(v);
};

// Data siap tampil untuk halaman publik.
export const getContent = cache(async () => {
  const raw = await readRaw();
  const { settings } = raw;

  const orang = (p) => ({ ...p, foto: resolveFoto(p.foto) });
  const publicSettings = { ...settings, ketua: orang(settings.ketua), pembina: orang(settings.pembina) };

  let kegiatan;
  let kolaborasi;
  let posters;

  if (raw.configured) {
    const mapFoto = (jenis) => (e) => ({
      ...e,
      fotos: e.fotos.map((p, i) => ({ src: publicUrl(p), alt: `Dokumentasi ${e.judul}, foto ${i + 1}` })),
    });
    kegiatan = raw.kegiatan.map(mapFoto('kegiatan'));
    kolaborasi = raw.kolaborasi.map(mapFoto('kolaborasi'));
    posters = (settings.poster || []).map((p, i) => ({ src: publicUrl(p), alt: `Poster kegiatan OSIS ${i + 1}` }));
  } else {
    const fk = getFotoMap('kegiatan', raw.kegiatan);
    const fc = getFotoMap('kolaborasi', raw.kolaborasi);
    kegiatan = raw.kegiatan.map((e) => ({ ...e, fotos: fk[e.id] || [] }));
    kolaborasi = raw.kolaborasi.map((e) => ({ ...e, fotos: fc[e.id] || [] }));
    posters = getPoster();
  }

  return { settings: publicSettings, kegiatan, kolaborasi, posters };
});
