import { json } from '@/lib/guard';
import { asalSah, bacaHariGuru, bacaRekap, catatGagal, cekKode, ipDari, terlaluBanyakGagal, votingTerbuka } from '@/lib/hariguru';
import { dbReady } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Memeriksa kode voting (belum memakainya) dan memberi tahu kelas pemilik kode.
export async function POST(req) {
  if (!asalSah(req)) return json({ error: 'Permintaan ditolak.' }, 403);
  if (!dbReady()) return json({ error: 'Voting belum aktif.' }, 503);
  const ip = ipDari(req);
  if (terlaluBanyakGagal(ip)) return json({ error: 'Terlalu banyak kode salah. Coba lagi dalam 10 menit.' }, 429);

  const body = await req.json().catch(() => null);
  try {
    const cfg = await bacaHariGuru();
    if (!votingTerbuka(cfg)) return json({ error: 'Voting sedang ditutup.', kode: 'tutup' }, 403);
    const r = await cekKode(cfg, body?.kode);
    if (r.status === 'ok') {
      const rekap = await bacaRekap(cfg);
      return json({ ok: true, kode: r.kode, kelas: { nama: r.kelas.nama, kuota: r.kelas.kuota, terisi: Math.min(rekap.perKelas[r.kelas.id] || 0, r.kelas.kuota) } });
    }
    catatGagal(ip);
    if (r.status === 'terpakai') return json({ error: 'Kode ini sudah dipakai. Setiap kode hanya berlaku satu kali.', kode: 'terpakai' }, 409);
    return json({ error: 'Kode tidak ditemukan. Periksa lagi huruf dan angkanya.', kode: 'salah' }, 404);
  } catch (e) {
    return json({ error: 'Kode belum bisa diperiksa. Coba lagi sebentar.' }, 500);
  }
}
