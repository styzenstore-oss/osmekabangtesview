'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLightbox } from './Lightbox';

const JEDA = 5500; // milidetik per poster

const Panah = ({ arah }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={arah === 'kiri' ? 'm15 5-7 7 7 7' : 'm9 5 7 7-7 7'} />
  </svg>
);

// Slider poster landscape di beranda. Jumlah poster tidak dibatasi.
// Berganti otomatis, berhenti saat disentuh/di-hover, bisa digeser dan diperbesar.
export default function PosterSlider({ posters }) {
  const { openLightbox } = useLightbox();
  const trackRef = useRef(null);
  const programatik = useRef(false);
  const timerScroll = useRef(null);
  const [active, setActive] = useState(0);
  const [tahan, setTahan] = useState({ hover: false, fokus: false, sembunyi: false });
  const [kurangiGerak, setKurangiGerak] = useState(false);
  const n = posters.length;
  const jeda = tahan.hover || tahan.fokus || tahan.sembunyi;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setKurangiGerak(mq.matches);
    const h = (e) => setKurangiGerak(e.matches);
    mq.addEventListener('change', h);
    const v = () => setTahan((t) => ({ ...t, sembunyi: document.hidden }));
    document.addEventListener('visibilitychange', v);
    return () => {
      mq.removeEventListener('change', h);
      document.removeEventListener('visibilitychange', v);
    };
  }, []);

  const pergi = useCallback((i) => {
    const t = trackRef.current;
    const s = t && t.children[i];
    if (!s) return;
    programatik.current = true;
    clearTimeout(timerScroll.current);
    timerScroll.current = setTimeout(() => {
      programatik.current = false;
    }, 900);
    setActive(i);
    t.scrollTo({ left: s.offsetLeft - (t.clientWidth - s.offsetWidth) / 2, behavior: 'smooth' });
  }, []);

  // Ganti otomatis
  useEffect(() => {
    if (n < 2 || jeda || kurangiGerak) return;
    const id = setTimeout(() => pergi((active + 1) % n), JEDA);
    return () => clearTimeout(id);
  }, [active, jeda, kurangiGerak, n, pergi]);

  // Saat pengunjung menggeser sendiri, ikuti poster yang paling dekat dengan tengah
  const saatScroll = () => {
    if (programatik.current) return;
    const t = trackRef.current;
    const tengah = t.scrollLeft + t.clientWidth / 2;
    let terbaik = 0;
    let jarak = Infinity;
    Array.from(t.children).forEach((s, i) => {
      const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - tengah);
      if (d < jarak) {
        jarak = d;
        terbaik = i;
      }
    });
    setActive(terbaik);
  };

  return (
    <section className="section posters" aria-label="Poster kegiatan">
      <div className="container">
        <div className="section-head">
          <h2>Poster kegiatan</h2>
          {n > 1 && (
            <div className="gal-nav">
              <button type="button" className="gal-btn" aria-label="Poster sebelumnya" onClick={() => pergi((active - 1 + n) % n)}>
                <Panah arah="kiri" />
              </button>
              <button type="button" className="gal-btn" aria-label="Poster berikutnya" onClick={() => pergi((active + 1) % n)}>
                <Panah arah="kanan" />
              </button>
            </div>
          )}
        </div>
      </div>

      {n === 0 ? (
        <div className="container">
          <div className="poster-empty chamfer">
            <span>Poster kegiatan akan tampil di sini.</span>
            {process.env.NODE_ENV === 'development' && <code>Taruh gambar poster di folder public/poster/</code>}
          </div>
        </div>
      ) : (
        <div
          className="pos-wrap"
          onPointerEnter={(e) => e.pointerType === 'mouse' && setTahan((t) => ({ ...t, hover: true }))}
          onPointerLeave={(e) => e.pointerType === 'mouse' && setTahan((t) => ({ ...t, hover: false }))}
          onFocus={(e) => e.target.matches(':focus-visible') && setTahan((t) => ({ ...t, fokus: true }))}
          onBlur={() => setTahan((t) => ({ ...t, fokus: false }))}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') pergi((active - 1 + n) % n);
            if (e.key === 'ArrowRight') pergi((active + 1) % n);
          }}
        >
          <ul className="pos-track" ref={trackRef} onScroll={saatScroll}>
            {posters.map((p, i) => (
              <li
                key={p.src}
                className="pos-slide"
                data-active={i === active}
                aria-roledescription="slide"
                aria-label={`Poster ${i + 1} dari ${n}`}
              >
                <button
                  type="button"
                  className="poster chamfer"
                  aria-label={i === active ? `Perbesar poster ${i + 1}` : `Tampilkan poster ${i + 1}`}
                  onClick={() => (i === active ? openLightbox(posters, i, 'Poster kegiatan') : pergi(i))}
                >
                  <span className="poster-img">
                    <Image className="poster-bg" src={p.src} alt="" aria-hidden="true" fill sizes="(max-width: 700px) 90vw, 940px" priority={i === 0} draggable={false} />
                    <Image className="poster-fg" src={p.src} alt={p.alt} fill sizes="(max-width: 700px) 90vw, 940px" priority={i === 0} draggable={false} />
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {n > 1 && (
            <div className="pos-dots" role="group" aria-label="Pilih poster">
              {posters.map((p, i) => (
                <button
                  key={p.src}
                  type="button"
                  className="pos-dot"
                  aria-label={`Poster ${i + 1}`}
                  aria-current={i === active}
                  onClick={() => pergi(i)}
                >
                  <span className="pd">
                    {i === active && (
                      <i
                        key={`${active}-${jeda}`}
                        className={jeda || kurangiGerak ? 'diam' : ''}
                        style={{ animationDuration: `${JEDA}ms` }}
                      />
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
