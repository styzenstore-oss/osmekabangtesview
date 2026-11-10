import { NextResponse } from 'next/server';
import { COOKIE, verifySession } from '@/lib/auth';

// Semua halaman dan API admin wajib login, kecuali halaman login itu sendiri.
export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const api = pathname.startsWith('/api/');
  const terbuka = pathname === '/admin/login' || pathname === '/api/admin/login';
  const ok = await verifySession(req.cookies.get(COOKIE)?.value);

  if (terbuka) {
    if (ok && !api) return NextResponse.redirect(new URL('/admin', req.url));
    return NextResponse.next();
  }
  if (!ok) {
    if (api) return NextResponse.json({ error: 'Sesi berakhir. Silakan masuk lagi.' }, { status: 401 });
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
