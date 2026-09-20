'use client';

import Image from 'next/image';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const LightboxContext = createContext({ openLightbox: () => {} });

export function useLightbox() {
  return useContext(LightboxContext);
}

const Panah = ({ arah }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={arah === 'kiri' ? 'm15 5-7 7 7 7' : 'm9 5 7 7-7 7'} />
  </svg>
);

// Penampil foto layar penuh. Dipakai oleh galeri dokumentasi dan slider poster.
export function LightboxProvider({ children }) {
  const ref = useRef(null);
  const sentuh = useRef(null);
  const [state, setState] = useState(null); // { fotos, index, judul }

  const openLightbox = useCallback((fotos, index = 0, judul = '') => {
    setState({ fotos, index, judul });
  }, []);

  useEffect(() => {
    const d = ref.current;
    if (state && d && !d.open) d.showModal();
  }, [state]);

  const geser = useCallback((delta) => {
    setState((s) => (s ? { ...s, index: (s.index + delta + s.fotos.length) % s.fotos.length } : s));
  }, []);

  const foto = state ? state.fotos[state.index] : null;
  const banyak = state ? state.fotos.length > 1 : false;

  return (
    <LightboxContext.Provider value={{ openLightbox }}>
      {children}
      <dialog
        ref={ref}
        className="lb"
        aria-label="Penampil foto"
        onClose={() => setState(null)}
        onClick={(e) => {
          if (e.target === ref.current) ref.current.close();
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') geser(-1);
          if (e.key === 'ArrowRight') geser(1);
        }}
      >
        {foto && (
          <div className="lb-in">
            <button type="button" className="x" aria-label="Tutup penampil foto" onClick={() => ref.current.close()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
            <div
              className="lb-stage"
              onTouchStart={(e) => {
                sentuh.current = e.touches[0].clientX;
              }}
              onTouchEnd={(e) => {
                if (sentuh.current == null || !banyak) return;
                const dx = e.changedTouches[0].clientX - sentuh.current;
                sentuh.current = null;
                if (Math.abs(dx) > 50) geser(dx < 0 ? 1 : -1);
              }}
            >
              <Image key={foto.src} src={foto.src} alt={foto.alt} fill sizes="100vw" priority style={{ objectFit: 'contain' }} />
            </div>
            <div className="lb-bar">
              <button type="button" className="gal-btn" aria-label="Foto sebelumnya" onClick={() => geser(-1)} disabled={!banyak}>
                <Panah arah="kiri" />
              </button>
              <div className="lb-cap">
                <strong>{state.judul}</strong>
                <span>
                  {state.index + 1} dari {state.fotos.length}
                </span>
              </div>
              <button type="button" className="gal-btn" aria-label="Foto berikutnya" onClick={() => geser(1)} disabled={!banyak}>
                <Panah arah="kanan" />
              </button>
            </div>
          </div>
        )}
      </dialog>
    </LightboxContext.Provider>
  );
}
