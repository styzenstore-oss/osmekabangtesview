'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLightbox } from './Lightbox';

const Panah = ({ arah }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={arah === 'kiri' ? 'm15 5-7 7 7 7' : 'm9 5 7 7-7 7'} />
  </svg>
);

// Galeri dokumentasi: jumlah foto tidak dibatasi, bisa digeser (sentuh, seret mouse, tombol, atau keyboard).
// Klik foto untuk memperbesar.
export default function Gallery({ fotos, judul, jenis, folder }) {
  const { openLightbox } = useLightbox();
  const trackRef = useRef(null);
  const drag = useRef(null);
  const blokirKlik = useRef(false);
  const [tepi, setTepi] = useState({ awal: true, akhir: false });

  const ukurTepi = useCallback(() => {
    const t = trackRef.current;
    if (!t) return;
    setTepi({ awal: t.scrollLeft <= 2, akhir: t.scrollLeft + t.clientWidth >= t.scrollWidth - 2 });
  }, []);

  useEffect(() => {
    ukurTepi();
    window.addEventListener('resize', ukurTepi);
    return () => window.removeEventListener('resize', ukurTepi);
  }, [ukurTepi, fotos.length]);

  if (!fotos.length) {
    return (
      <div className="gal-empty">
        {[0, 1, 2].map((i) => (
          <div className="gal-slot" key={i}>
            {i === 0 && (
              <>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="6" width="18" height="14" rx="2" />
                  <circle cx="12" cy="13" r="3.5" />
                  <path d="M8 6l1.5-2h5L16 6" />
                </svg>
                <span>Foto dokumentasi akan ditampilkan di sini.</span>
                {process.env.NODE_ENV === 'development' && (
                  <code>
                    public/dokumentasi/{jenis}/{folder}/
                  </code>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    );
  }

  const geser = (arah) => {
    const t = trackRef.current;
    t.scrollBy({ left: arah * t.clientWidth * 0.85, behavior: 'smooth' });
  };

  // Seret dengan mouse (di layar sentuh, geser jari sudah otomatis).
  const mulaiSeret = (ev) => {
    if (ev.pointerType !== 'mouse' || ev.button !== 0) return;
    const t = trackRef.current;
    blokirKlik.current = false;
    drag.current = { x: ev.clientX, kiri: t.scrollLeft, bergerak: false };

    const gerak = (e) => {
      const d = drag.current;
      if (!d) return;
      const dx = e.clientX - d.x;
      if (!d.bergerak && Math.abs(dx) > 5) {
        d.bergerak = true;
        t.classList.add('dragging');
      }
      if (d.bergerak) t.scrollLeft = d.kiri - dx;
    };
    const selesai = () => {
      window.removeEventListener('pointermove', gerak);
      window.removeEventListener('pointerup', selesai);
      window.removeEventListener('pointercancel', selesai);
      t.classList.remove('dragging');
      if (drag.current && drag.current.bergerak) blokirKlik.current = true;
      drag.current = null;
    };
    window.addEventListener('pointermove', gerak);
    window.addEventListener('pointerup', selesai);
    window.addEventListener('pointercancel', selesai);
  };

  return (
    <div className="gal">
      <div className="gal-bar">
        <span>{fotos.length} foto dokumentasi</span>
        <div className="gal-nav">
          <button type="button" className="gal-btn" aria-label="Geser ke kiri" disabled={tepi.awal} onClick={() => geser(-1)}>
            <Panah arah="kiri" />
          </button>
          <button type="button" className="gal-btn" aria-label="Geser ke kanan" disabled={tepi.akhir} onClick={() => geser(1)}>
            <Panah arah="kanan" />
          </button>
        </div>
      </div>
      <div
        ref={trackRef}
        className="gal-track"
        role="region"
        aria-label={`Galeri dokumentasi ${judul}`}
        tabIndex={0}
        onScroll={ukurTepi}
        onPointerDown={mulaiSeret}
        onClickCapture={(e) => {
          if (blokirKlik.current) {
            e.stopPropagation();
            e.preventDefault();
            blokirKlik.current = false;
          }
        }}
      >
        {fotos.map((f, i) => (
          <button
            key={f.src}
            type="button"
            className="gal-item chamfer"
            aria-label={`Perbesar foto ${i + 1} dari ${fotos.length}`}
            onClick={() => openLightbox(fotos, i, judul)}
          >
            <Image src={f.src} alt={f.alt} fill sizes="(max-width: 600px) 72vw, 300px" draggable={false} />
          </button>
        ))}
      </div>
    </div>
  );
}
