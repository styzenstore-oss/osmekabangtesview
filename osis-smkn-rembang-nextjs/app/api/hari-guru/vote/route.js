import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { COOKIE_VOTE, bacaHariGuru, bacaVoted, votingTerbuka } from '@/lib/hariguru';
import { json } from '@/lib/guard';
import { dbReady, rpc } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Suara anonim: yang disimpan hanya id kelas dan id guru, tanpa nama atau identitas pemilih.
export async function POST(req) {
  const origin = req.headers.get('origin');
  if (origin) {
    try {
      if (new URL(origin).host !== req.headers.get('host')) return json({ error: 'Permintaan ditolak.' }, 403);
    } catch (e) {
      return json({ error: 'Permintaan ditolak.' }, 403);
    }
  }
  if (!dbReady()) return json({ error: 'Voting belum aktif.' }, 503);

  const body = await req.json().catch(() => null);
  const kelasId = String(body?.kelas || '');
  const guruId = String(body?.guru || '');

  let cfg;
  try {
    cfg = await bacaHariGuru();
  } catch (e) {
    return json({ error: 'Gagal membaca data voting. Coba lagi sebentar.' }, 500);
  }
  if (!votingTerbuka(cfg)) return json({ error: 'Voting sedang ditutup.', kode: 'tutup' }, 403);

  const kelas = cfg.kelas.find((k) => k.id === kelasId);
  const guru = cfg.guru.find((g) => g.id === guruId);
  if (!kelas || !guru) return json({ error: 'Kelas atau guru tidak ditemukan. Muat ulang halaman.' }, 400);

  const sudah = bacaVoted(cookies().get(COOKIE_VOTE)?.value);
  if (cfg.kunciPerangkat && sudah.includes(kelas.id)) {
    return json({ error: `Perangkat ini sudah dipakai memilih untuk kelas ${kelas.nama}.`, kode: 'sudah' }, 409);
  }

  let hasil;
  try {
    hasil = await rpc('cast_guru_vote', { p_kelas: kelas.id, p_guru: guru.id, p_kuota: kelas.kuota });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
  if (!hasil?.ok) {
    return json({ error: `Kuota suara kelas ${kelas.nama} sudah terpenuhi (${kelas.kuota} dari ${kelas.kuota} siswa).`, kode: 'penuh', jumlah: hasil?.jumlah ?? kelas.kuota }, 409);
  }

  const res = NextResponse.json({ ok: true, jumlah: hasil.jumlah, kuota: kelas.kuota });
  res.cookies.set(COOKIE_VOTE, [...new Set([...sudah, kelas.id])].slice(-40).join(','), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 60,
  });
  return res;
}
