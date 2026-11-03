// Koneksi ke Supabase (database + penyimpanan foto). Hanya dipakai di server.
// Kunci SUPABASE_SERVICE_KEY tidak pernah dikirim ke browser.

const BUCKET = 'osis-media';

export function dbReady() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);
}

const base = () => process.env.SUPABASE_URL.replace(/\/+$/, '');

function headers(extra = {}) {
  const key = process.env.SUPABASE_SERVICE_KEY;
  const h = { apikey: key, ...extra };
  // Kunci lama (JWT) dikirim juga sebagai Bearer; kunci baru (sb_secret_...) cukup lewat apikey.
  if (key.startsWith('eyJ')) h.Authorization = `Bearer ${key}`;
  return h;
}

export function mediaBase() {
  return dbReady() ? `${base()}/storage/v1/object/public/${BUCKET}/` : '';
}

export function publicUrl(path) {
  return mediaBase() + path.split('/').map(encodeURIComponent).join('/');
}

// ---------- Database (tabel site_content: key, value) ----------
export async function readKey(key) {
  const res = await fetch(`${base()}/rest/v1/site_content?key=eq.${encodeURIComponent(key)}&select=value`, {
    headers: headers(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Gagal membaca data dari database (kode ${res.status}). Pastikan supabase-setup.sql sudah dijalankan.`);
  const rows = await res.json();
  return rows.length ? rows[0].value : null;
}

export async function writeKey(key, value) {
  const res = await fetch(`${base()}/rest/v1/site_content?on_conflict=key`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }),
    body: JSON.stringify({ key, value, updated_at: new Date().toISOString() }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Gagal menyimpan ke database (kode ${res.status}).`);
}

// ---------- Penyimpanan foto ----------
export async function uploadFile(path, body, contentType) {
  const url = `${base()}/storage/v1/object/${BUCKET}/${path.split('/').map(encodeURIComponent).join('/')}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: headers({ 'Content-Type': contentType, 'x-upsert': 'true', 'cache-control': 'max-age=31536000' }),
    body,
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Gagal mengunggah foto (kode ${res.status}). Pastikan bucket "${BUCKET}" sudah dibuat.`);
}

export async function removeFiles(paths) {
  if (!paths.length) return;
  try {
    await fetch(`${base()}/storage/v1/object/${BUCKET}`, {
      method: 'DELETE',
      headers: headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ prefixes: paths }),
      cache: 'no-store',
    });
  } catch (e) {
    // Gagal menghapus file lama tidak boleh membatalkan penyimpanan data.
  }
}
