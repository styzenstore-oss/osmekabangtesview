'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

// ---------- Notifikasi kecil (toast) dan kotak konfirmasi, keduanya beranimasi ----------
const Ctx = createContext({ toast: () => {}, tanya: async () => false });
export const useAdminUi = () => useContext(Ctx);

export function AdminUiProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const nomor = useRef(0);

  const toast = useCallback((pesan, jenis = 'ok') => {
    const id = ++nomor.current;
    setToasts((t) => [...t, { id, pesan, jenis, keluar: false }]);
    setTimeout(() => setToasts((t) => t.map((x) => (x.id === id ? { ...x, keluar: true } : x))), jenis === 'err' ? 5200 : 3000);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), jenis === 'err' ? 5600 : 3400);
  }, []);

  const tanya = useCallback(
    (opsi) =>
      new Promise((selesai) => {
        setDialog({ ...opsi, selesai, tutup: false });
      }),
    []
  );

  const jawab = (v) => {
    if (!dialog) return;
    const { selesai } = dialog;
    setDialog({ ...dialog, tutup: true });
    setTimeout(() => {
      setDialog(null);
      selesai(v);
    }, 180);
  };

  useEffect(() => {
    if (!dialog) return;
    const onKey = (e) => e.key === 'Escape' && jawab(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <Ctx.Provider value={{ toast, tanya }}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast t-${t.jenis}${t.keluar ? ' keluar' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {t.jenis === 'err' ? <path d="M12 8v5M12 17h.01M10.3 3.9 2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /> : <path d="m5 12.5 4.5 4.5L19 7.5" />}
            </svg>
            <span>{t.pesan}</span>
          </div>
        ))}
      </div>
      {dialog && (
        <div className={`cf-back${dialog.tutup ? ' tutup' : ''}`} onClick={() => jawab(false)}>
          <div className="cf box" role="alertdialog" aria-modal="true" aria-label={dialog.judul} onClick={(e) => e.stopPropagation()}>
            <h3>{dialog.judul}</h3>
            <p>{dialog.isi}</p>
            <div className="cf-aksi">
              <button type="button" className="btn btn-ghost" onClick={() => jawab(false)}>
                Batal
              </button>
              <button type="button" autoFocus className={`btn ${dialog.bahaya ? 'btn-danger' : 'btn-primary'}`} onClick={() => jawab(true)}>
                {dialog.tombol || 'Ya'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}

export const Spinner = () => (
  <svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
    <path d="M12 3a9 9 0 1 0 9 9" />
  </svg>
);

export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`fld ${className}`.trim()}>
      <span className="fld-l">{label}</span>
      {children}
      {hint && <span className="fld-h">{hint}</span>}
    </label>
  );
}
