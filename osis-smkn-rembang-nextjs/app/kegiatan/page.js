import { KEGIATAN } from '@/lib/events';
import { getFotoMap } from '@/lib/media';
import Foundation from '@/components/Foundation';
import KegiatanExplorer from '@/components/KegiatanExplorer';

export const metadata = { title: 'Kegiatan' };

export default function Kegiatan() {
  const fotoMap = getFotoMap('kegiatan', KEGIATAN);

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
          <KegiatanExplorer fotoMap={fotoMap} />
        </div>
      </section>
      <Foundation />
    </>
  );
}
