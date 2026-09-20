import Image from 'next/image';
import Link from 'next/link';
import { KOLABORASI } from '@/lib/events';
import { bulanSingkat } from '@/lib/format';

// Tiga kolaborasi terbaru di beranda. fotoMap berasal dari getFotoMap('kolaborasi', ...).
export default function RecentCollabs({ fotoMap }) {
  const list = KOLABORASI.slice(0, 3);
  if (!list.length) return null;

  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="section-head">
          <h2>Kolaborasi terbaru</h2>
          <Link className="link" href="/kolaborasi">
            Lihat semua kolaborasi
          </Link>
        </div>
        <div className="grid-3">
          {list.map((e) => {
            const sampul = (fotoMap[e.id] || [])[0];
            return (
              <Link key={e.id} className={`card chamfer${sampul ? ' has-cover' : ''}`} href={`/kolaborasi#${e.id}`}>
                {sampul && (
                  <span className="card-cover">
                    <Image src={sampul.src} alt="" fill sizes="(max-width: 700px) 100vw, 380px" />
                  </span>
                )}
                <span className="date-badge">
                  <b>{e.start.getDate()}</b>
                  <span>
                    {bulanSingkat(e.start)} {e.start.getFullYear()}
                  </span>
                </span>
                <h3>{e.judul}</h3>
                <span className="ev-meta">
                  {e.mitra.length > 0 && <span>Bersama {e.mitra.join(', ')}</span>}
                  <span>{e.tempat}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
