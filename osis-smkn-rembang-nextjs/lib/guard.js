import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { COOKIE, verifySession } from './auth';

export const json = (data, status = 200) => NextResponse.json(data, { status });

// Dipanggil di setiap API admin (selain middleware): cek sesi dan asal permintaan.
export async function guard(req) {
  const ok = await verifySession(cookies().get(COOKIE)?.value);
  if (!ok) return json({ error: 'Sesi berakhir. Silakan masuk lagi.' }, 401);
  if (req.method !== 'GET') {
    const origin = req.headers.get('origin');
    if (origin) {
      try {
        if (new URL(origin).host !== req.headers.get('host')) return json({ error: 'Permintaan ditolak.' }, 403);
      } catch (e) {
        return json({ error: 'Permintaan ditolak.' }, 403);
      }
    }
  }
  return null;
}
