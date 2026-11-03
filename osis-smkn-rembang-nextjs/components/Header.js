'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/', label: 'Beranda' },
  { href: '/kegiatan', label: 'Kegiatan' },
  { href: '/kolaborasi', label: 'Kolaborasi' },
  { href: '/profil', label: 'Profil' },
];

function toggleTheme() {
  const root = document.documentElement;
  const now =
    root.getAttribute('data-theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = now === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try {
    localStorage.setItem('osis-tema', next);
  } catch (e) {}
}

export default function Header() {
  const path = usePathname();
  const active = (href) => (href === '/' ? path === '/' : path.startsWith(href));

  return (
    <header className="site-header">
      <div className="container bar">
        <Link className="brand" href="/" aria-label="OSIS SMK Negeri Rembang, ke beranda">
          <Image src="/emblem-osis.png" width={300} height={160} priority alt="Logo Provinsi Jawa Timur dan logo SMK Negeri Rembang" />
          <span className="brand-text">
            <b>OSIS</b>
            <span>SMK Negeri Rembang</span>
          </span>
        </Link>
        <nav className="nav" aria-label="Menu utama">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={active(n.href) ? 'page' : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
        <button className="theme" type="button" aria-label="Ganti tema terang atau gelap" onClick={toggleTheme}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </header>
  );
}
