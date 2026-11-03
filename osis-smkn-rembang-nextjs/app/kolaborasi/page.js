import { KOLABORASI } from '@/lib/events';
import { getFotoMap } from '@/lib/media';
import ActivityCard from '@/components/ActivityCard';
import Foundation from '@/components/Foundation';

export const metadata = { title: 'Kolaborasi' };

export default function Kolaborasi() {
  const fotoMap = getFotoMap('kolaborasi', KOLABORASI);

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
            {KOLABORASI.length} kolaborasi
          </p>
          <div className="collab-list">
            {KOLABORASI.map((e) => (
              <div key={e.id} id={e.id} className="anchor">
                <ActivityCard e={e} fotos={fotoMap[e.id] || []} jenis="kolaborasi" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <Foundation />
    </>
  );
}
