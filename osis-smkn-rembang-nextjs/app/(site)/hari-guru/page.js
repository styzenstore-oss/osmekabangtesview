import KepalaHariGuru from '@/components/KepalaHariGuru';
import HariGuruVote from '@/components/HariGuruVote';
import { siapkanPublik } from '@/lib/hariguru';

export const metadata = { title: 'Hari Guru Nasional' };
export const dynamic = 'force-dynamic';

export default async function HariGuru() {
  const r = await siapkanPublik();
  return (
    <>
      <KepalaHariGuru judul={r.cfg?.judul} deskripsi={r.cfg?.deskripsi} />
      <section className="section">
        <div className="container">
          {r.status === 'belum' && <p className="empty">Halaman ini belum aktif. Pengurus OSIS perlu menghubungkan database terlebih dahulu.</p>}
          {r.status === 'galat' && <p className="empty">Data voting belum bisa dimuat. Coba lagi sebentar.</p>}
          {r.status === 'ok' && <HariGuruVote data={r.data} />}
        </div>
      </section>
    </>
  );
}
