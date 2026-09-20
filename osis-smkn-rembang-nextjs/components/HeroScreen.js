'use client';

import Link from 'next/link';
import { KEGIATAN, statusOf } from '@/lib/events';
import { dua, jamText, tanggalText } from '@/lib/format';
import { useNow } from './useNow';

function Countdown({ target, now, label }) {
  const s = Math.max(0, Math.floor((target - now) / 1000));
  const items = [
    [Math.floor(s / 86400), 'hari'],
    [Math.floor((s % 86400) / 3600), 'jam'],
    [Math.floor((s % 3600) / 60), 'menit'],
    [s % 60, 'detik'],
  ];
  return (
    <div className="cd" role="timer" aria-label={`Hitung mundur menuju ${label}`}>
      {items.map(([n, l]) => (
        <div key={l}>
          <b>{dua(n)}</b>
          <span>{l}</span>
        </div>
      ))}
    </div>
  );
}

// Panel "layar" di hero: agenda OSIS berikutnya beserta hitung mundur.
export default function HeroScreen() {
  const now = useNow(1000);

  let inner;
  if (!now) {
    inner = (
      <div className="screen-inner">
        <div className="live">
          <span className="dot" aria-hidden="true" />
          Agenda berikutnya
        </div>
        <h2>Memuat agenda&hellip;</h2>
      </div>
    );
  } else {
    const running = KEGIATAN.find((e) => statusOf(e, now) === 'berlangsung');
    const next = running || KEGIATAN.find((e) => statusOf(e, now) === 'akan');

    inner = next ? (
      <div className="screen-inner">
        <div className="live">
          <span className="dot" aria-hidden="true" />
          {running ? 'Sedang berlangsung' : 'Agenda berikutnya'}
        </div>
        <h2>{next.judul}</h2>
        <div className="screen-meta">
          <span>
            {tanggalText(next)}, {jamText(next)}
          </span>
          <span>{next.tempat}</span>
        </div>
        {running ? (
          <span className="running">Ikuti sekarang</span>
        ) : (
          <Countdown target={next.start} now={now} label={next.judul} />
        )}
        <div>
          <Link className="btn btn-ghost chamfer" href={`/kegiatan#${next.id}`}>
            Lihat detail kegiatan
          </Link>
        </div>
      </div>
    ) : (
      <div className="screen-inner">
        <div className="live">
          <span className="dot" aria-hidden="true" />
          Agenda berikutnya
        </div>
        <h2>Belum ada agenda mendatang</h2>
        <div className="screen-meta">
          <span>Lihat kegiatan yang sudah berjalan di halaman Kegiatan.</span>
        </div>
        <div>
          <Link className="btn btn-ghost chamfer" href="/kegiatan">
            Buka halaman kegiatan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <aside className="screen chamfer" aria-label="Agenda berikutnya">
      {inner}
    </aside>
  );
}
