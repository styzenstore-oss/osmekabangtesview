import { getAllKegiatan } from '@/lib/getKegiatanData';
import { getFotoMap } from '@/lib/media';
import Foundation from '@/components/Foundation';
import KegiatanExplorer from '@/components/KegiatanExplorer';

export const metadata = { title: 'Kegiatan' };
export const dynamic = 'force-dynamic';

export default async function Kegiatan() {
  const { kegiatan } = await getAllKegiatan();
  const staticFotoMap = getFotoMap('kegiatan', kegiatan);

  // Gabungkan foto dari database Supabase (item.fotos) ke dalam fotoMap
  const combinedFotoMap = { ...staticFotoMap };
  kegiatan.forEach((item) => {
    if (Array.isArray(item.fotos) && item.fotos.length > 0) {
      combinedFotoMap[item.id] = [
        ...(combinedFotoMap[item.id] || []),
        ...item.fotos,
      ];
    }
  });

  return (
    <>
      <section className="page-head">
        <div className="container">
          <h1>Kegiatan OSIS</h1>
          <p>
            Program kerja OSIS SMK Negeri Rembang, dari berbagi takjil, MPLS, sampai LDKS, lengkap dengan dokumentasi
            setiap kegiatan. Geser foto untuk melihat lebih banyak, klik untuk memperbesar.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <KegiatanExplorer fotoMap={combinedFotoMap} />
        </div>
      </section>
      <Foundation />
    </>
  );
}
