'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { statusOf, STATUS_LABEL } from '../lib/events';
import Kat from './Kat';

const Ctx = createContext({ open: () => {} });

export function useEventDialog() {
  return useContext(Ctx);
}

// Tombol yang membuka rincian kegiatan. Bisa dipakai di halaman mana pun.
export function EventButton({ id, className, children }) {
  const { open } = useEventDialog();
  return (
    <button type="button" className={className} data-ev={id} onClick={() => open(id)}>
      {children}
    </button>
  );
}

export function EventDialogProvider({ events, ekskul, children }) {
  const ref = useRef(null);
  const [id, setId] = useState(null);
  const ev = events.find((e) => e.id === id);
  const nama = Object.fromEntries(ekskul.map((k) => [k.id, k.nama]));
  const st = ev ? statusOf(ev, Date.now()) : null;

  useEffect(() => {
    if (ev && ref.current && !ref.current.open) ref.current.showModal();
  }, [ev]);

  function tutup() {
    if (ref.current) ref.current.close();
  }

  return (
    <Ctx.Provider value={{ open: setId }}>
      {children}
      <dialog
        ref={ref}
        aria-labelledby="dlg-title"
        onClose={() => setId(null)}
        onClick={(e) => {
          if (e.target === ref.current) tutup();
        }}
      >
        {ev && (
          <div className="dlg chamfer">
            <button type="button" className="x" onClick={tutup} aria-label="Tutup rincian">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
            <div className="top">
              <Kat kat={ev.kat} />
              <span className={`status s-${st}`}>{STATUS_LABEL[st]}</span>
            </div>
            <h2 id="dlg-title">{ev.judul}</h2>
            <p>{ev.desk}</p>
            <dl>
              <dt>Tanggal</dt>
              <dd>{ev.tanggalText}</dd>
              <dt>Waktu</dt>
              <dd>{ev.jamText}</dd>
              <dt>Tempat</dt>
              <dd>{ev.tempat}</dd>
              <dt>Kolaborasi</dt>
              <dd>
                <span className="tags">
                  {ev.ekskul.map((k) => (
                    <span className="tag" key={k}>
                      {nama[k]}
                    </span>
                  ))}
                </span>
              </dd>
            </dl>
          </div>
        )}
      </dialog>
    </Ctx.Provider>
  );
}
