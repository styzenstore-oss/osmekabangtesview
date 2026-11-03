'use client';

import { useMemo, useState } from 'react';
import { KATEGORI, KEGIATAN, statusOf } from '@/lib/events';
import { bulanTahun } from '@/lib/format';
import ActivityCard from './ActivityCard';
import { useNow } from './useNow';

const SEMUA_KAT = ['Semua', ...KATEGORI];
const SEMUA_STATUS = [
  ['semua', 'Semua status'],
  ['akan', 'Akan datang'],
  ['selesai', 'Selesai'],
];

// fotoMap: { [idKegiatan]: [{ src, alt }] } dari getFotoMap('kegiatan', ...)
export default function KegiatanExplorer({ fotoMap }) {
  const now = useNow(60000);
  const [kat, setKat] = useState('Semua');
  const [status, setStatus] = useState('semua');
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const kata = q.trim().toLowerCase();
    return KEGIATAN.filter((e) => {
      if (kat !== 'Semua' && e.kat !== kat) return false;
      if (status !== 'semua' && now) {
        const st = statusOf(e, now) === 'selesai' ? 'selesai' : 'akan';
        if (st !== status) return false;
      }
      if (kata) {
        const hay = [e.judul, e.tempat, e.kat, e.desk, ...e.mitra].join(' ').toLowerCase();
        if (!hay.includes(kata)) return false;
      }
      return true;
    });
  }, [kat, status, q, now]);

  const groups = [];
  rows.forEach((e) => {
    const m = bulanTahun(e.start);
    const last = groups[groups.length - 1];
    if (last && last.m === m) last.items.push(e);
    else groups.push({ m, items: [e] });
  });

  return (
    <>
      <div className="tools">
        <div className="chips" role="group" aria-label="Kategori">
          {SEMUA_KAT.map((k) => (
            <button key={k} type="button" className="chip" aria-pressed={kat === k} onClick={() => setKat(k)}>
              {k}
            </button>
          ))}
        </div>
        <div className="chips" role="group" aria-label="Status">
          {SEMUA_STATUS.map(([v, label]) => (
            <button key={v} type="button" className="chip" aria-pressed={status === v} onClick={() => setStatus(v)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="tools">
        <label className="sr-only" htmlFor="cari">
          Cari kegiatan
        </label>
        <input
          id="cari"
          className="search"
          type="search"
          placeholder="Cari kegiatan"
          autoComplete="off"
          value={q}
          onChange={(ev) => setQ(ev.target.value)}
        />
      </div>
      <p className="count" aria-live="polite">
        {rows.length} kegiatan ditampilkan
      </p>

      {rows.length === 0 ? (
        <p className="empty">Tidak ada kegiatan yang cocok. Ubah kata kunci atau pilih kategori lain.</p>
      ) : (
        groups.map((g) => (
          <div key={g.m}>
            <h2 className="month">{g.m}</h2>
            <ul className="tl">
              {g.items.map((e) => {
                const st = statusOf(e, now);
                return (
                  <li key={e.id} id={e.id} data-status={st || 'muat'}>
                    <ActivityCard e={e} fotos={fotoMap[e.id] || []} jenis="kegiatan" status={st} />
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      )}
    </>
  );
}
