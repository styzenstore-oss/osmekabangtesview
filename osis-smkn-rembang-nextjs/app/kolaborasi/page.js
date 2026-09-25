import { getAllKegiatan } from '@/lib/getKegiatanData';
import { getFotoMap } from '@/lib/media';
import ActivityCard from '@/components/ActivityCard';
import Foundation from '@/components/Foundation';

export const metadata = { title: 'Kolaborasi' };
export const dynamic = 'force-dynamic';

export default async function Kolaborasi() {
  const { kolaborasi } = await getAllKegiatan();
  const staticFotoMap = getFotoMap('kolaborasi', kolaborasi);

  const combinedFotoMap = { ...staticFotoMap };
  kolaborasi.forEach((item) => {
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
          <h1>Kolaborasi</h1>
          <p>
            Kegiatan yang telah OSIS lakukan bersama pihak lain, lengkap dengan dokumentasinya. Geser foto untuk melihat
            lebih banyak, klik untuk memperbesar.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <p className="count" style={{ marginTop: 0 }}>
            {kolaborasi.length} kolaborasi
          </p>
          <div className="collab-list">
            {kolaborasi.map((e) => (
              <div key={e.id} id={e.id} className="anchor">
                <ActivityCard e={e} fotos={combinedFotoMap[e.id] || []} jenis="kolaborasi" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <Foundation />
    </>
  );
}
