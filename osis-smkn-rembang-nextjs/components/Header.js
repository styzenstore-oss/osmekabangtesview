'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  const [open, setOpen] = useState(false);
  const active = (href) => (href === '/' ? path === '/' : path.startsWith(href));

  // Menu tertutup otomatis setelah pindah halaman.
  useEffect(() => {
    setOpen(false);
  }, [path]);

  // Saat menu terbuka: kunci gulir halaman, Escape menutup, dan layar lebar mereset menu.
  useEffect(() => {
    if (!open) return;
    document.body.classList.add('menu-open');
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const onResize = () => window.innerWidth > 760 && setOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.body.classList.remove('menu-open');
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  return (
    <>
      <header className="site-header">
        <div className="container bar">
          <Link className="brand" href="/" aria-label="OSIS SMK Negeri Rembang, ke beranda">
            <Image src="/emblem-osis.png" width={800} height={800} priority alt="Logo OSIS SMK Negeri Rembang" />
            <span className="brand-text">
              <b>OSIS</b>
              <span>SMK Negeri Rembang</span>
            </span>
          </Link>

          <nav id="menu-utama" className="nav" data-open={open} aria-label="Menu utama">
            {NAV.map((n, i) => (
              <Link key={n.href} href={n.href} style={{ '--i': i }} aria-current={active(n.href) ? 'page' : undefined}>
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

          <button
            className="menu-btn"
            type="button"
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={open}
            aria-controls="menu-utama"
            data-open={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>
      <div className="nav-backdrop" data-open={open} onClick={() => setOpen(false)} aria-hidden="true" />
    </>
  );
}
