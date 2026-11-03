import { bacaHariGuru, buatKode } from '@/lib/hariguru';
import { guard, json } from '@/lib/guard';
import { bacaSemua, dbReady, hapusBaris, tambahBaris } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Semua kode beserta statusnya (hanya admin).
export async function GET(req) {
  const deny = await guard(req);
  if (deny) return deny;
  if (!dbReady()) return json({ error: 'Database belum diatur (lihat README).' }, 503);
  try {
    return json({ kode: await bacaSemua('guru_kode?select=kode,kelas_id,dipakai&order=kelas_id.asc,kode.asc') });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

// Menyamakan jumlah kode dengan jumlah siswa (kuota) kelas yang sudah tersimpan.
// Kurang -> dibuatkan kode baru. Lebih -> kode yang belum terpakai dihapus. Kode yang sudah dipakai tidak disentuh.
// Body: { kelas?: 'id-kelas' }  (kosong = semua kelas)
export async function POST(req) {
  const deny = await guard(req);
  if (deny) return deny;
  if (!dbReady()) return json({ error: 'Database belum diatur (lihat README).' }, 503);
  const body = await req.json().catch(() => ({}));
  try {
    const cfg = await bacaHariGuru();
    const target = body?.kelas ? cfg.kelas.filter((k) => k.id === body.kelas) : cfg.kelas;
    if (!target.length) return json({ error: 'Kelas belum tersimpan. Simpan dulu daftar kelas.' }, 400);

    const semua = await bacaSemua('guru_kode?select=kode,kelas_id,dipakai');
    const ada = new Set(semua.map((r) => r.kode));
    let dibuat = 0;
    let dihapus = 0;
    for (const k of target) {
      const milik = semua.filter((r) => r.kelas_id === k.id);
      const selisih = k.kuota - milik.length;
      if (selisih > 0) {
        const baru = [];
        while (baru.length < selisih) {
          const kode = buatKode();
          if (ada.has(kode)) continue;
          ada.add(kode);
          baru.push({ kode, kelas_id: k.id, dipakai: false });
        }
        await tambahBaris('guru_kode', baru);
        dibuat += baru.length;
      } else if (selisih < 0) {
        const buang = milik.filter((r) => !r.dipakai).slice(0, -selisih).map((r) => r.kode);
        if (buang.length) {
          await hapusBaris('guru_kode', `kode=in.(${buang.join(',')})`);
          dihapus += buang.length;
        }
      }
    }
    return json({ ok: true, dibuat, dihapus });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}
