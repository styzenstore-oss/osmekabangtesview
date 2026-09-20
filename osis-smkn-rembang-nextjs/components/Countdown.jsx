'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const dua = (n) => String(n).padStart(2, '0');

// Hitung mundur menuju awal kegiatan. nowIso dikirim dari server agar tampilan awal sama.
export default function Countdown({ targetIso, nowIso, judul }) {
  const router = useRouter();
  const target = new Date(targetIso).getTime();
  const [sisa, setSisa] = useState(() => Math.max(0, Math.floor((target - new Date(nowIso).getTime()) / 1000)));

  useEffect(() => {
    let id;
    const tick = () => {
      const s = Math.max(0, Math.floor((target - Date.now()) / 1000));
      setSisa(s);
      if (s === 0) {
        clearInterval(id);
        router.refresh();
      }
    };
    id = setInterval(tick, 1000);
    tick();
    return () => clearInterval(id);
  }, [target, router]);

  const kotak = [
    [Math.floor(sisa / 86400), 'hari'],
    [Math.floor((sisa % 86400) / 3600), 'jam'],
    [Math.floor((sisa % 3600) / 60), 'menit'],
    [sisa % 60, 'detik'],
  ];

  return (
    <div className="cd" role="timer" aria-label={`Hitung mundur menuju ${judul}`}>
      {kotak.map(([nilai, label]) => (
        <div key={label}>
          <b>{dua(nilai)}</b>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
