import { supabase } from './supabase';
import { KEGIATAN as STATIC_KEGIATAN, KOLABORASI as STATIC_KOLABORASI } from './events';

function formatKegiatan(item) {
  return {
    id: item.id,
    judul: item.judul,
    kat: item.kat,
    jenis: item.jenis || 'kegiatan',
    mulai: item.mulai,
    sampai: item.sampai,
    tempat: item.tempat,
    desk: item.desk,
    mitra: item.mitra || [],
    fotos: item.fotos || [],
    start: new Date(item.mulai),
    endDay: new Date((item.sampai || item.mulai.slice(0, 10)) + 'T23:59:59'),
  };
}

export async function getAllKegiatan() {
  try {
    const { data, error } = await supabase
      .from('kegiatan')
      .select('*')
      .eq('status_verifikasi', 'approved')
      .order('mulai', { ascending: true });

    if (error || !data || data.length === 0) {
      return {
        kegiatan: STATIC_KEGIATAN,
        kolaborasi: STATIC_KOLABORASI,
      };
    }

    const dbKegiatan = data.filter((d) => d.jenis === 'kegiatan').map(formatKegiatan);
    const dbKolaborasi = data.filter((d) => d.jenis === 'kolaborasi').map(formatKegiatan);

    // Gabungkan data DB dengan data statis tanpa duplikat id
    const combinedKegiatan = [...dbKegiatan];
    STATIC_KEGIATAN.forEach((st) => {
      if (!combinedKegiatan.some((c) => c.id === st.id)) {
        combinedKegiatan.push(st);
      }
    });

    const combinedKolaborasi = [...dbKolaborasi];
    STATIC_KOLABORASI.forEach((st) => {
      if (!combinedKolaborasi.some((c) => c.id === st.id)) {
        combinedKolaborasi.push(st);
      }
    });

    combinedKegiatan.sort((a, b) => a.start - b.start);
    combinedKolaborasi.sort((a, b) => b.start - a.start);

    return {
      kegiatan: combinedKegiatan,
      kolaborasi: combinedKolaborasi,
      dbData: data,
    };
  } catch (err) {
    return {
      kegiatan: STATIC_KEGIATAN,
      kolaborasi: STATIC_KOLABORASI,
    };
  }
}
