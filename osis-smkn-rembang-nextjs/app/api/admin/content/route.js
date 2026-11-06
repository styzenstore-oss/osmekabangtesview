import { revalidatePath } from 'next/cache';
import { readRaw } from '@/lib/content';
import { guard, json } from '@/lib/guard';
import { dbReady, removeFiles, writeKey } from '@/lib/supabase';
import { KEYS, bersihkan, semuaPath } from '@/lib/validate';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const deny = await guard(req);
  if (deny) return deny;
  return json(await readRaw());
}

// Simpan satu bagian data: { key: 'kegiatan' | 'kolaborasi' | 'settings', value }
export async function PUT(req) {
  const deny = await guard(req);
  if (deny) return deny;
  if (!dbReady()) return json({ error: 'Database belum diatur (lihat README).' }, 503);

  const body = await req.json().catch(() => null);
  if (!body || !KEYS.includes(body.key)) return json({ error: 'Permintaan tidak valid.' }, 400);

  let bersih;
  try {
    bersih = bersihkan(body.key, body.value);
  } catch (e) {
    return json({ error: e.message }, 400);
  }

  try {
    const lama = await readRaw();
    await writeKey(body.key, bersih);

    // Hapus foto yang sudah tidak dipakai supaya penyimpanan tidak penuh.
    const dipakai = new Set(semuaPath(body.key, bersih));
    const dibuang = semuaPath(body.key, lama[body.key]).filter((p) => !dipakai.has(p));
    await removeFiles(dibuang);
  } catch (e) {
    return json({ error: e.message }, 500);
  }

  revalidatePath('/', 'layout');
  return json({ ok: true });
}
