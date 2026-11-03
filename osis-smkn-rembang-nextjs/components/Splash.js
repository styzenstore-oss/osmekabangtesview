'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

// Animasi pembuka saat pengunjung pertama kali masuk (sekali per tab).
// Seluruh animasinya dijalankan CSS, jadi tetap mulus walau JavaScript belum siap.
export default function Splash() {
  const [selesai, setSelesai] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (root.getAttribute('data-splash') === 'skip') {
      setSelesai(true);
      return;
    }
    try {
      sessionStorage.setItem('osis-splash', '1');
    } catch (e) {}
    const a = setTimeout(() => setSelesai(true), 3100);
    // Setelah semua animasi masuk selesai, perpindahan halaman berikutnya tidak perlu menunggu lagi.
    const b = setTimeout(() => root.setAttribute('data-intro', 'done'), 4800);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);

  if (selesai) return null;

  return (
    <div className="splash" aria-hidden="true">
      <div className="splash-half t" />
      <div className="splash-half b" />
      <div className="splash-core">
        <span className="splash-orb" />
        <Image className="splash-logo" src="/emblem-osis.png" width={800} height={800} priority alt="" />
        <span className="splash-line" />
        <div className="splash-title">
          <b>OSIS</b>
          <span>SMK Negeri Rembang</span>
        </div>
        <div className="splash-bar">
          <i />
        </div>
      </div>
    </div>
  );
}
