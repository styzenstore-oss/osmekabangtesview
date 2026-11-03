import { json } from '@/lib/guard';
import { asalSah, bacaHariGuru, catatGagal, cekKode, ipDari, terlaluBanyakGagal, votingTerbuka } from '@/lib/hariguru';
import { dbReady, rpc } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Suara anonim: kode hanya menandai bahwa jatah seorang siswa sudah dipakai. Yang tersimpan di suara hanya id kelas dan id guru.
export async function POST(req) {
  if (!asalSah(req)) return json({ error: 'Permintaan ditolak.' }, 403);
  if (!dbReady()) return json({ error: 'Voting belum aktif.' }, 503);
  const ip = ipDari(req);
  if (terlaluBanyakGagal(ip)) return json({ error: 'Terlalu banyak kode salah. Coba lagi dalam 10 menit.' }, 429);

  const body = await req.json().catch(() => null);
  const guruId = String(body?.guru || '');

  try {
    const cfg = await bacaHariGuru();
    if (!votingTerbuka(cfg)) return json({ error: 'Voting sedang ditutup.', kode: 'tutup' }, 403);
    if (!cfg.guru.some((g) => g.id === guruId)) return json({ error: 'Guru tidak ditemukan. Muat ulang halaman.' }, 400);

    const r = await cekKode(cfg, body?.kode);
    if (r.status !== 'ok') {
      catatGagal(ip);
      return json(
        r.status === 'terpakai'
          ? { error: 'Kode ini sudah dipakai. Setiap kode hanya berlaku satu kali.', kode: 'terpakai' }
          : { error: 'Kode tidak ditemukan. Periksa lagi huruf dan angkanya.', kode: 'salah' },
        r.status === 'terpakai' ? 409 : 404
      );
    }

    const hasil = await rpc('cast_guru_vote_kode', { p_kode: r.kode, p_guru: guruId });
    if (!hasil?.ok) return json({ error: 'Kode ini sudah dipakai. Setiap kode hanya berlaku satu kali.', kode: 'terpakai' }, 409);
    return json({ ok: true });
  } catch (e) {
    return json({ error: 'Suara belum bisa dikirim. Coba lagi sebentar.' }, 500);
  }
}
