// Sesi admin: cookie bertanda tangan HMAC-SHA256 (Web Crypto, jalan di middleware maupun route handler).
export const COOKIE = 'osis_admin';
export const TTL = 60 * 60 * 8; // sesi berlaku 8 jam

const enc = new TextEncoder();

const secret = () => process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || '';

export function authConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && secret());
}

async function hmac(data, key) {
  const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', k, enc.encode(data)));
  let s = '';
  sig.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function sameLength(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

// Perbandingan teks yang tidak membocorkan informasi lewat waktu.
export async function safeEqual(a, b) {
  const [x, y] = await Promise.all([hmac(String(a), 'cmp'), hmac(String(b), 'cmp')]);
  return sameLength(x, y);
}

export async function createSession() {
  const payload = `v1.${Math.floor(Date.now() / 1000) + TTL}`;
  return `${payload}.${await hmac(payload, secret())}`;
}

export async function verifySession(token) {
  if (!token || !authConfigured()) return false;
  const i = token.lastIndexOf('.');
  if (i < 0) return false;
  const payload = token.slice(0, i);
  const sig = token.slice(i + 1);
  const [v, exp] = payload.split('.');
  if (v !== 'v1' || !(Number(exp) > Date.now() / 1000)) return false;
  return sameLength(sig, await hmac(payload, secret()));
}
