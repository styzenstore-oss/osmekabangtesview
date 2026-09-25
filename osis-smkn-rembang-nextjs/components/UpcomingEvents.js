'use client';

import Link from 'next/link';
import { KEGIATAN as STATIC_KEGIATAN, statusOf } from '@/lib/events';
import { bulanSingkat } from '@/lib/format';
import Kat from './Kat';
import { useNow } from './useNow';

function Kartu({ e }) {
  return (
    <Link className="card chamfer" href={`/kegiatan#${e.id}`}>
      <span className="date-badge">
        <b>{e.start.getDate()}</b>
        <span>
          {bulanSingkat(e.start)} {e.start.getFullYear()}
        </span>
      </span>
      <h3>{e.judul}</h3>
      <span className="ev-meta">
        <Kat nama={e.kat} />
        <span>{e.tempat}</span>
      </span>
    </Link>
  );
}

export default function UpcomingEvents({ items }) {
  const now = useNow(60000);
  const kegiatanList = items && items.length > 0 ? items : STATIC_KEGIATAN;

  let title = 'Kegiatan terdekat';
  let list = null;
  if (now) {
    const upcoming = kegiatanList.filter((e) => statusOf(e, now) !== 'selesai');
    if (upcoming.length) {
      list = upcoming.slice(0, 3);
    } else {
      title = 'Kegiatan terbaru';
      list = kegiatanList.slice(-3).reverse();
    }
  }

  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="section-head">
          <h2>{title}</h2>
          <Link className="link" href="/kegiatan">
            Semua kegiatan
          </Link>
        </div>
        <div className="grid-3">
          {list
            ? list.map((e) => <Kartu key={e.id} e={e} />)
            : [0, 1, 2].map((i) => <div key={i} className="card skeleton chamfer" aria-hidden="true" />)}
        </div>
      </div>
    </section>
  );
}
