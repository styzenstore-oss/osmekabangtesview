import { getContent } from '@/lib/content';
import { urutKolaborasi } from '@/lib/events';
import ActivityCard from '@/components/ActivityCard';
import Foundation from '@/components/Foundation';

export const metadata = { title: 'Kolaborasi' };

export default async function Kolaborasi() {
  const { kolaborasi } = await getContent();
  const KOLABORASI = urutKolaborasi(kolaborasi);

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
                <ActivityCard e={e} jenis="kolaborasi" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <Foundation />
    </>
  );
}
