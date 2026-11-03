'use client';

import { useEffect, useRef, useState } from 'react';

// Angka yang menghitung naik dari 0 saat pertama tampil. Menunggu animasi pembuka selesai jika masih berjalan.
export default function CountUp({ value, durasi = 1100, langsung = false }) {
  const angka = typeof value === 'number';
  const [tampil, setTampil] = useState(0);
  const dari = useRef(0);

  useEffect(() => {
    if (!angka) return;
    const kurangi = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (kurangi) {
      setTampil(value);
      return;
    }
    const root = document.documentElement;
    const tunggu = langsung || root.getAttribute('data-splash') === 'skip' || root.getAttribute('data-intro') === 'done' ? 0 : 2400;
    const awal = dari.current;
    let raf;
    let t0 = null;
    const langkah = (t) => {
      if (t0 == null) t0 = t;
      const p = Math.min(1, (t - t0) / durasi);
      const e = 1 - Math.pow(1 - p, 3);
      setTampil(Math.round(awal + (value - awal) * e));
      if (p < 1) raf = requestAnimationFrame(langkah);
      else dari.current = value;
    };
    const id = setTimeout(() => {
      raf = requestAnimationFrame(langkah);
    }, tunggu);
    return () => {
      clearTimeout(id);
      cancelAnimationFrame(raf);
    };
  }, [value, angka, durasi, langsung]);

  return <>{angka ? tampil : value}</>;
}
