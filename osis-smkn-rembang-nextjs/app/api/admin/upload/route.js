import { readRaw } from '@/lib/content';
import { guard, json } from '@/lib/guard';
import { dbReady, removeFiles, uploadFile } from '@/lib/supabase';
import { semuaPath } from '@/lib/validate';

export const dynamic = 'force-dynamic';

const FOLDER = /^((kegiatan|kolaborasi)\/[a-z0-9][a-z0-9-]{0,60}|poster|foto)$/;
const MAKS = 4 * 1024 * 1024; // batas body fungsi serverless Vercel sekitar 4,5 MB

// Memeriksa isi file yang sebenarnya, bukan hanya tipe yang dilaporkan browser.
function jenisGambar(b) {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return ['image/jpeg', 'jpg'];
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return ['image/png', 'png'];
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) {
    return ['image/webp', 'webp'];
  }
  return null;
}

export async function POST(req) {
  const deny = await guard(req);
  if (deny) return deny;
  if (!dbReady()) return json({ error: 'Penyimpanan belum diatur (lihat README).' }, 503);

  let fd;
  try {
    fd = await req.formData();
  } catch (e) {
    return json({ error: 'Berkas tidak terbaca.' }, 400);
  }
  const file = fd.get('file');
  const folder = String(fd.get('folder') || '');
  if (!FOLDER.test(folder)) return json({ error: 'Folder tujuan tidak valid.' }, 400);
  if (!file || typeof file === 'string') return json({ error: 'Tidak ada foto yang dikirim.' }, 400);
  if (file.size > MAKS) return json({ error: 'Foto terlalu besar (maksimal 4 MB).' }, 413);

  const buf = Buffer.from(await file.arrayBuffer());
  const jenis = jenisGambar(buf);
  if (!jenis) return json({ error: 'Format foto harus JPG, PNG, atau WebP.' }, 415);

  const acak = Array.from(crypto.getRandomValues(new Uint8Array(3)), (n) => n.toString(16).padStart(2, '0')).join('');
  const path = `${folder}/${Date.now().toString(36)}-${acak}.${jenis[1]}`;
  try {
    await uploadFile(path, buf, jenis[0]);
  } catch (e) {
    return json({ error: e.message }, 500);
  }
  return json({ path });
}

// Membersihkan foto yang sudah diunggah tetapi batal dipakai. Foto yang masih dipakai website tidak akan dihapus.
export async function DELETE(req) {
  const deny = await guard(req);
  if (deny) return deny;
  if (!dbReady()) return json({ ok: true });

  const body = await req.json().catch(() => ({}));
  const minta = (Array.isArray(body.paths) ? body.paths : []).filter(
    (p) => typeof p === 'string' && /^[a-z0-9][a-z0-9._\-/]*$/i.test(p) && !p.includes('..')
  );
  if (!minta.length) return json({ ok: true });

  const raw = await readRaw();
  const dipakai = new Set([
    ...semuaPath('kegiatan', raw.kegiatan),
    ...semuaPath('kolaborasi', raw.kolaborasi),
    ...semuaPath('settings', raw.settings),
  ]);
  await removeFiles(minta.filter((p) => !dipakai.has(p)));
  return json({ ok: true });
}
