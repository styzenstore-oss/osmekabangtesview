import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { json } from '@/lib/guard';
import { COOKIE_VOTE, asalSah, bacaHariGuru, bacaVoted, cariKelas, catatGagal, ipDari, terlaluBanyakGagal, votingTerbuka } from '@/lib/hariguru';
import { dbReady, rpc } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Suara anonim: kode hanya menunjukkan kelas. Yang tersimpan di suara hanya id kelas dan id guru.
export async function POST(req) {
  if (!asalSah(req)) return json({ error: 'Permintaan ditolak.' }, 403);
  if (!dbReady()) return json({ error: 'Voting belum aktif.' }, 503);
  const ip = ipDari(req);
  if (terlaluBanyakGagal(ip)) return json({ error: 'Terlalu banyak kode salah. Coba lagi dalam 10 menit.' }, 429);

  const body = await req.json().catch(() => null);
  const guruId = String(body?.guru || '');

  let cfg;
  try {
    cfg = await bacaHariGuru();
  } catch (e) {
    return json({ error: 'Suara belum bisa dikirim. Coba lagi sebentar.' }, 500);
  }
  if (!votingTerbuka(cfg)) return json({ error: 'Voting sedang ditutup.', kode: 'tutup' }, 403);
  if (!cfg.guru.some((g) => g.id === guruId)) return json({ error: 'Guru tidak ditemukan. Muat ulang halaman.' }, 400);

  const kelas = cariKelas(cfg, body?.kode);
  if (!kelas) {
    catatGagal(ip);
    return json({ error: 'Kode tidak ditemukan. Periksa lagi huruf dan angkanya.', kode: 'salah' }, 404);
  }

  const sudah = bacaVoted(cookies().get(COOKIE_VOTE)?.value);
  if (cfg.kunciPerangkat && sudah.includes(kelas.id)) {
    return json({ error: `Perangkat ini sudah dipakai memilih untuk kelas ${kelas.nama}.`, kode: 'sudah' }, 409);
  }

  let hasil;
  try {
    hasil = await rpc('cast_guru_vote', { p_kelas: kelas.id, p_guru: guruId, p_kuota: kelas.kuota });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
  if (!hasil?.ok) {
    return json({ error: `Kuota suara kelas ${kelas.nama} sudah terpenuhi (${kelas.kuota} dari ${kelas.kuota} siswa). Jika kamu belum sempat memilih, segera lapor ke pengurus OSIS.`, kode: 'penuh' }, 409);
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_VOTE, [...new Set([...sudah, kelas.id])].slice(-40).join(','), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 60,
  });
  return res;
}
