import { cookies } from 'next/headers';
import { json } from '@/lib/guard';
import { COOKIE_VOTE, asalSah, bacaHariGuru, bacaRekap, bacaVoted, cariKelas, catatGagal, ipDari, terlaluBanyakGagal, votingTerbuka } from '@/lib/hariguru';
import { dbReady } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Memeriksa kode kelas (belum memilih) dan memberi tahu kelas pemilik kode beserta sisa kuotanya.
export async function POST(req) {
  if (!asalSah(req)) return json({ error: 'Permintaan ditolak.' }, 403);
  if (!dbReady()) return json({ error: 'Voting belum aktif.' }, 503);
  const ip = ipDari(req);
  if (terlaluBanyakGagal(ip)) return json({ error: 'Terlalu banyak kode salah. Coba lagi dalam 10 menit.' }, 429);

  const body = await req.json().catch(() => null);
  try {
    const cfg = await bacaHariGuru();
    if (!votingTerbuka(cfg)) return json({ error: 'Voting sedang ditutup.', kode: 'tutup' }, 403);
    const kelas = cariKelas(cfg, body?.kode);
    if (!kelas) {
      catatGagal(ip);
      return json({ error: 'Kode tidak ditemukan. Periksa lagi huruf dan angkanya.', kode: 'salah' }, 404);
    }
    if (cfg.kunciPerangkat && bacaVoted(cookies().get(COOKIE_VOTE)?.value).includes(kelas.id)) {
      return json({ error: `Perangkat ini sudah dipakai memilih untuk kelas ${kelas.nama}.`, kode: 'sudah' }, 409);
    }
    const rekap = await bacaRekap(cfg);
    const terisi = Math.min(rekap.perKelas[kelas.id] || 0, kelas.kuota);
    if (terisi >= kelas.kuota) {
      return json({ error: `Kuota suara kelas ${kelas.nama} sudah terpenuhi (${kelas.kuota} dari ${kelas.kuota} siswa). Jika kamu belum sempat memilih, segera lapor ke pengurus OSIS.`, kode: 'penuh' }, 409);
    }
    return json({ ok: true, kode: kelas.kode, kelas: { nama: kelas.nama, kuota: kelas.kuota, terisi } });
  } catch (e) {
    return json({ error: 'Kode belum bisa diperiksa. Coba lagi sebentar.' }, 500);
  }
}
