'use client';

import { useRef, useState } from 'react';
import { unggah } from './api';
import { Spinner, useAdminUi } from './ui';

// Unggah, urutkan, dan hapus foto. Foto dikecilkan otomatis di browser sebelum dikirim.
// paths: daftar path foto. onChange(fnAtauArray) dipanggil saat daftar berubah. onBaru(path) dicatat untuk pembersihan.
export default function PhotoManager({ paths, onChange, folder, mediaBase, onBaru, sisiMaks = 1920, rasio = '4/3', label = 'Tambah foto' }) {
  const { toast } = useAdminUi();
  const input = useRef(null);
  const [proses, setProses] = useState(null); // { selesai, total }
  const [seret, setSeret] = useState(false);

  async function mulai(files) {
    const list = Array.from(files || []);
    if (!list.length) return;
    const folderTujuan = typeof folder === 'function' ? folder() : folder;
    let ok = 0;
    for (let i = 0; i < list.length; i++) {
      setProses({ selesai: i, total: list.length });
      try {
        const path = await unggah(list[i], folderTujuan, sisiMaks);
        onBaru && onBaru(path);
        onChange((lama) => [...lama, path]);
        ok++;
      } catch (e) {
        toast(e.message, 'err');
      }
    }
    setProses(null);
    if (ok) toast(ok === 1 ? '1 foto berhasil diunggah.' : `${ok} foto berhasil diunggah.`);
    if (input.current) input.current.value = '';
  }

  const hapus = (p) => onChange((lama) => lama.filter((x) => x !== p));
  const jadikanSampul = (p) => onChange((lama) => [p, ...lama.filter((x) => x !== p)]);

  return (
    <div className="pm">
      <div
        className="drop"
        data-over={seret}
        onDragOver={(e) => {
          e.preventDefault();
          setSeret(true);
        }}
        onDragLeave={() => setSeret(false)}
        onDrop={(e) => {
          e.preventDefault();
          setSeret(false);
          mulai(e.dataTransfer.files);
        }}
      >
        <input ref={input} id={`f-${label}`} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => mulai(e.target.files)} />
        <button type="button" className="btn btn-ghost" disabled={!!proses} onClick={() => input.current && input.current.click()}>
          {proses ? <Spinner /> : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 16V4m0 0-4 4m4-4 4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
            </svg>
          )}
          {proses ? `Mengunggah ${proses.selesai + 1} dari ${proses.total}...` : label}
        </button>
        <span className="drop-h">atau seret foto ke sini. Format JPG, PNG, atau WebP; ukuran otomatis dikecilkan.</span>
        {proses && (
          <span className="drop-bar" aria-hidden="true">
            <i style={{ transform: `scaleX(${(proses.selesai + 0.4) / proses.total})` }} />
          </span>
        )}
      </div>

      {paths.length > 0 && (
        <ul className="ph-grid">
          {paths.map((p, i) => (
            <li key={p} className="ph" style={{ aspectRatio: rasio }}>
              <img src={mediaBase + p} alt={`Foto ${i + 1}`} loading="lazy" />
              {i === 0 && paths.length > 1 && <span className="ph-badge">Sampul</span>}
              <div className="ph-aksi">
                {i !== 0 && (
                  <button type="button" aria-label={`Jadikan foto ${i + 1} sebagai sampul`} title="Jadikan sampul" onClick={() => jadikanSampul(p)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
                    </svg>
                  </button>
                )}
                <button type="button" className="hapus" aria-label={`Hapus foto ${i + 1}`} title="Hapus foto" onClick={() => hapus(p)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
