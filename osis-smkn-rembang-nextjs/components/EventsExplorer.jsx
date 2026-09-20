'use client';

import { useEffect, useMemo, useState } from 'react';
import { statusOf, STATUS_LABEL } from '../lib/events';
import { EventButton } from './EventDialog';
import Kat from './Kat';

const STATUS_FILTER = [
  ['semua', 'Semua status'],
  ['akan', 'Akan datang'],
  ['selesai', 'Selesai'],
];

// Daftar kegiatan dengan filter kategori, filter status, dan pencarian.
export default function EventsExplorer({ events, ekskul, kategori, nowIso }) {
  const [kat, setKat] = useState('Semua');
  const [status, setStatus] = useState('semua');
  const [q, setQ] = useState('');
  const [now, setNow] = useState(() => new Date(nowIso).getTime());

  useEffect(() => {
    setNow(Date.now());
  }, []);

  const nama = useMemo(() => Object.fromEntries(ekskul.map((k) => [k.id, k.nama])), [ekskul]);

  const baris = useMemo(() => {
    const kata = q.trim().toLowerCase();
    return events.filter((e) => {
      if (kat !== 'Semua' && e.kat !== kat) return false;
      const st = statusOf(e, now) === 'selesai' ? 'selesai' : 'akan';
      if (status !== 'semua' && st !== status) return false;
      if (kata) {
        const teks = `${e.judul} ${e.tempat} ${e.kat} ${e.ekskul.map((i) => nama[i]).join(' ')}`.toLowerCase();
        if (!teks.includes(kata)) return false;
      }
      return true;
    });
  }, [events, kat, status, q, now, nama]);

  const grup = useMemo(() => {
    const hasil = [];
    baris.forEach((e) => {
      const terakhir = hasil[hasil.length - 1];
      if (terakhir && terakhir.bulan === e.monthYear) terakhir.item.push(e);
      else hasil.push({ bulan: e.monthYear, item: [e] });
    });
    return hasil;
  }, [baris]);

  return (
    <>
      <div className="tools">
        <div className="chips" role="group" aria-label="Kategori">
          {['Semua', ...kategori].map((k) => (
            <button key={k} type="button" className="chip" aria-pressed={kat === k} onClick={() => setKat(k)}>
              {k}
            </button>
          ))}
        </div>
        <div className="chips" role="group" aria-label="Status">
          {STATUS_FILTER.map(([nilai, label]) => (
            <button key={nilai} type="button" className="chip" aria-pressed={status === nilai} onClick={() => setStatus(nilai)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="tools">
        <label className="sr-only" htmlFor="q">
          Cari kegiatan
        </label>
        <input
          id="q"
          className="search"
          type="search"
          placeholder="Cari kegiatan atau ekskul"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoComplete="off"
        />
      </div>
      <p className="count" aria-live="polite">
        {baris.length} kegiatan ditampilkan
      </p>

      {grup.length === 0 && (
        <p className="empty">Tidak ada kegiatan yang cocok. Ubah kata kunci atau pilih kategori lain.</p>
      )}
      {grup.map((g) => (
        <section key={g.bulan}>
          <h2 className="month">{g.bulan}</h2>
          <ul className="tl">
            {g.item.map((e) => {
              const st = statusOf(e, now);
              return (
                <li key={e.id} data-status={st}>
                  <EventButton id={e.id} className="ev chamfer">
                    <span className="ev-date">
                      <b>{e.day}</b>
                      <span>{e.monthShort}</span>
                    </span>
                    <span className="ev-body">
                      <span className="ev-title">{e.judul}</span>
                      <span className="ev-meta">
                        <Kat kat={e.kat} />
                        <span>{e.tempat}</span>
                      </span>
                    </span>
                    <span className={`status s-${st}`}>{STATUS_LABEL[st]}</span>
                  </EventButton>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </>
  );
}
