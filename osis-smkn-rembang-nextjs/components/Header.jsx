'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MENU = [
  ['/', 'Beranda'],
  ['/kegiatan', 'Kegiatan'],
  ['/kolaborasi', 'Kolaborasi'],
  ['/profil', 'Profil'],
];

function ToggleTema() {
  function ganti() {
    const root = document.documentElement;
    const sekarang =
      root.getAttribute('data-theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const berikut = sekarang === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', berikut);
    try {
      localStorage.setItem('osis-tema', berikut);
    } catch (e) {}
  }

  return (
    <button className="theme" type="button" onClick={ganti} aria-label="Ganti tema terang atau gelap">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
      </svg>
    </button>
  );
}

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="container bar">
        <Link className="brand" href="/" aria-label="OSIS SMK Negeri Rembang, ke beranda">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/emblem.png" width="300" height="160" alt="Logo Provinsi Jawa Timur dan logo SMK Negeri Rembang" />
          <span className="brand-text">
            <b>OSIS</b>
            <span>SMK Negeri Rembang</span>
          </span>
        </Link>
        <nav className="nav" aria-label="Menu utama">
          {MENU.map(([href, label]) => (
            <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined}>
              {label}
            </Link>
          ))}
        </nav>
        <ToggleTema />
      </div>
    </header>
  );
}
