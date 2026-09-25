import { supabase } from './supabase';
import { DATA } from './data';

const DEFAULT_WAKIL = {
  nama: 'Nama Wakil Ketua OSIS',
  jabatan: 'Wakil Ketua OSIS',
  foto: null,
  ringkas: 'Mendukung kepemimpinan OSIS dan sinergi antardivisi.',
  salam: [
    'Assalamu\u2019alaikum warahmatullahi wabarakatuh. Salam sejahtera bagi kita semua.',
    'Bersama seluruh pengurus OSIS SMK Negeri Rembang, kami siap menjalin kerja sama yang solid dengan seluruh siswa dan ekstrakurikuler.',
    'Mari kita wujudkan program kerja yang nyata dan bermanfaat!',
    'Wassalamu\u2019alaikum warahmatullahi wabarakatuh.',
  ],
};

export async function getOsisProfile() {
  try {
    const { data, error } = await supabase
      .from('profil_osis')
      .select('*')
      .eq('id', 'profil_utama')
      .single();

    if (error || !data) {
      return {
        ...DATA,
        wakil: DEFAULT_WAKIL,
      };
    }

    return {
      periode: data.periode || DATA.periode,
      visi: data.visi || DATA.visi,
      misi: Array.isArray(data.misi) && data.misi.length > 0 ? data.misi : DATA.misi,
      ketua: {
        nama: data.ketua_nama || DATA.ketua.nama,
        jabatan: data.ketua_jabatan || DATA.ketua.jabatan,
        foto: data.ketua_foto || DATA.ketua.foto,
        ringkas: data.ketua_ringkas || DATA.ketua.ringkas,
        salam: Array.isArray(data.ketua_salam) && data.ketua_salam.length > 0
          ? data.ketua_salam
          : DATA.ketua.salam,
      },
      wakil: {
        nama: data.wakil_nama || DEFAULT_WAKIL.nama,
        jabatan: data.wakil_jabatan || DEFAULT_WAKIL.jabatan,
        foto: data.wakil_foto || DEFAULT_WAKIL.foto,
        ringkas: data.wakil_ringkas || DEFAULT_WAKIL.ringkas,
        salam: Array.isArray(data.wakil_salam) && data.wakil_salam.length > 0
          ? data.wakil_salam
          : DEFAULT_WAKIL.salam,
      },
      pembina: {
        nama: data.pembina_nama || DATA.pembina.nama,
        jabatan: data.pembina_jabatan || DATA.pembina.jabatan,
        foto: data.pembina_foto || DATA.pembina.foto,
        ringkas: data.pembina_ringkas || DATA.pembina.ringkas,
        salam: Array.isArray(data.pembina_salam) && data.pembina_salam.length > 0
          ? data.pembina_salam
          : DATA.pembina.salam,
      },
    };
  } catch (e) {
    return {
      ...DATA,
      wakil: DEFAULT_WAKIL,
    };
  }
}
