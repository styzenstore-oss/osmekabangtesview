import Link from 'next/link';
import HariGuruVote from '@/components/HariGuruVote';
import { siapkanPublik } from '@/lib/hariguru';
import KepalaHariGuru from '@/components/KepalaHariGuru';

export const metadata = { title: 'Hari Guru Nasional' };
export const dynamic = 'force-dynamic';

// Satu link per kelas, misalnya /hari-guru/x-titl-2 untuk kelas X TITL 2.
export default async function HariGuruKelas({ params }) {
  const id = String(params.kelas || '').toLowerCase();
  const r = await siapkanPublik(id);
  return (
    <>
      <KepalaHariGuru judul={r.cfg?.judul} deskripsi={r.cfg?.deskripsi} />
      <section className="section">
        <div className="container">
          {r.status === 'belum' && <p className="empty">Halaman ini belum aktif. Pengurus OSIS perlu menghubungkan database terlebih dahulu.</p>}
          {r.status === 'galat' && <p className="empty">Data voting belum bisa dimuat. Coba lagi sebentar.</p>}
          {r.status === 'tidak-ada' && (
            <p className="empty">
              Link kelas ini tidak dikenal. Periksa lagi link dari OSIS, atau <Link className="link" href="/hari-guru">lihat daftar kelas</Link>.
            </p>
          )}
          {r.status === 'ok' && <HariGuruVote data={r.data} tetap={id} />}
        </div>
      </section>
    </>
  );
}
