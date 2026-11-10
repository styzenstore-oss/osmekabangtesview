import { bacaHariGuru, bacaRekap } from '@/lib/hariguru';
import { guard, json } from '@/lib/guard';
import { dbReady, hapusBaris } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Hasil voting sementara untuk panel admin.
export async function GET(req) {
  const deny = await guard(req);
  if (deny) return deny;
  if (!dbReady()) return json({ error: 'Database belum diatur (lihat README).' }, 503);
  try {
    const cfg = await bacaHariGuru();
    return json(await bacaRekap(cfg));
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

// Reset suara. Body kosong = semua suara; { kelas: 'id-kelas' } = hanya satu kelas.
export async function DELETE(req) {
  const deny = await guard(req);
  if (deny) return deny;
  if (!dbReady()) return json({ error: 'Database belum diatur (lihat README).' }, 503);
  const body = await req.json().catch(() => ({}));
  const kelas = body?.kelas ? String(body.kelas) : '';
  if (kelas && !/^[a-z0-9][a-z0-9-]{0,60}$/.test(kelas)) return json({ error: 'Kelas tidak valid.' }, 400);
  try {
    await hapusBaris('guru_votes', kelas ? `kelas_id=eq.${encodeURIComponent(kelas)}` : 'id=gt.0');
  } catch (e) {
    return json({ error: e.message }, 500);
  }
  return json({ ok: true });
}
