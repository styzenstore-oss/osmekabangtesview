import { NextResponse } from 'next/server';
import { COOKIE, TTL, authConfigured, createSession, safeEqual } from '@/lib/auth';
import { json } from '@/lib/guard';

export const dynamic = 'force-dynamic';

// Pembatas percobaan login (per alamat IP). Tersimpan di memori server, cukup untuk menahan tebak-tebakan sandi.
const percobaan = new Map();
const BATAS = 5;
const JENDELA = 15 * 60 * 1000;
const tidur = (ms) => new Promise((r) => setTimeout(r, ms));

export async function POST(req) {
  if (!authConfigured()) {
    return json({ error: 'Admin belum diatur. Isi ADMIN_PASSWORD di pengaturan environment.' }, 503);
  }

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'lokal';
  const sekarang = Date.now();
  let rec = percobaan.get(ip);
  if (rec && sekarang - rec.t > JENDELA) rec = null;
  if (rec && rec.n >= BATAS) {
    return json({ error: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' }, 429);
  }

  const body = await req.json().catch(() => ({}));
  const userBenar = await safeEqual(
    String(body.username || '').trim().toLowerCase(),
    (process.env.ADMIN_USERNAME || 'admin').toLowerCase()
  );
  const passBenar = await safeEqual(String(body.password || ''), process.env.ADMIN_PASSWORD);

  if (!(userBenar && passBenar)) {
    percobaan.set(ip, { n: (rec?.n || 0) + 1, t: rec?.t || sekarang });
    await tidur(700);
    return json({ error: 'Username atau password salah.' }, 401);
  }

  percobaan.delete(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, await createSession(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: TTL,
  });
  return res;
}
