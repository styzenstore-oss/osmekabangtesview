'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import CountUp from '@/components/CountUp';
import { api, simpan } from './api';
import ActivityManager from './ActivityManager';
import PosterManager from './PosterManager';
import ProfilEditor from './ProfilEditor';
import { AdminUiProvider, useAdminUi } from './ui';

const ikon = {
  ringkasan: <path d="M4 13h6V4H4zm0 7h6v-5H4zm10 0h6V11h-6zm0-16v5h6V4z" />,
  kegiatan: <path d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />,
  kolaborasi: <path d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm7 1a3 3 0 1 0 0-6M2.5 20c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6M17 14.2c2.6.3 4.5 2.5 4.5 5.8" />,
  poster: <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm0 11 4.5-4.5 3.5 3.5 3-3L21 17" />,
  profil: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />,
};

const TABS = [
  { id: 'ringkasan', label: 'Ringkasan' },
  { id: 'kegiatan', label: 'Kegiatan' },
  { id: 'kolaborasi', label: 'Kolaborasi' },
  { id: 'poster', label: 'Poster' },
  { id: 'profil', label: 'Profil' },
];

const Ikon = ({ id }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {ikon[id]}
  </svg>
);

function toggleTheme() {
  const root = document.documentElement;
  const now = root.getAttribute('data-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = now === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try {
    localStorage.setItem('osis-tema', next);
  } catch (e) {}
}

function Ringkasan({ data, pindah }) {
  const sekarang = new Date();
  const mendatang = useMemo(
    () => [...data.kegiatan].filter((e) => new Date(e.mulai) >= sekarang).sort((a, b) => (a.mulai < b.mulai ? -1 : 1))[0],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.kegiatan]
  );
  const totalFoto =
    data.kegiatan.reduce((n, e) => n + (e.fotos?.length || 0), 0) +
    data.kolaborasi.reduce((n, e) => n + (e.fotos?.length || 0), 0) +
    (data.settings.poster?.length || 0);

  const kartu = [
    ['Kegiatan', data.kegiatan.length, 'kegiatan'],
    ['Kolaborasi', data.kolaborasi.length, 'kolaborasi'],
    ['Poster', data.settings.poster?.length || 0, 'poster'],
    ['Foto dokumentasi', totalFoto, null],
  ];

  return (
    <div className="adm-panel">
      <div className="adm-head">
        <div>
          <h1>Selamat datang, pengurus OSIS</h1>
          <p>Semua yang Anda ubah di sini langsung tampil di website, tanpa perlu mengedit kode.</p>
        </div>
        <a className="btn btn-ghost" href="/" target="_blank" rel="noopener noreferrer">
          Lihat website
        </a>
      </div>

      <div className="adm-stats stagger">
        {kartu.map(([label, n, tab]) => (
          <button key={label} type="button" className="adm-stat box" disabled={!tab} onClick={() => tab && pindah(tab)}>
            <b>
              <CountUp value={n} durasi={800} langsung />
            </b>
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="adm-grid2">
        <div className="adm-card box">
          <h2 className="adm-h2">Kegiatan berikutnya</h2>
          {mendatang ? (
            <>
              <p className="adm-next">{mendatang.judul}</p>
              <p className="adm-sub">
                {new Date(mendatang.mulai).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })} &middot; {mendatang.tempat}
              </p>
            </>
          ) : (
            <p className="adm-sub">Belum ada kegiatan mendatang. Tambahkan di menu Kegiatan.</p>
          )}
        </div>
        <div className="adm-card box">
          <h2 className="adm-h2">Pintasan</h2>
          <div className="adm-quick">
            <button type="button" className="btn btn-ghost" onClick={() => pindah('kegiatan')}>
              Kelola kegiatan
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => pindah('kolaborasi')}>
              Kelola kolaborasi
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => pindah('poster')}>
              Ganti poster
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => pindah('profil')}>
              Ubah profil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Isi({ initial, dbError, mediaBase }) {
  const router = useRouter();
  const { toast } = useAdminUi();
  const [data, setData] = useState(initial);
  const [tab, setTab] = useState('ringkasan');
  const [keluar, setKeluar] = useState(false);

  useEffect(() => {
    const h = window.location.hash.slice(1);
    if (TABS.some((t) => t.id === h)) setTab(h);
    if (dbError) toast(dbError, 'err');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pindah = (id) => {
    setTab(id);
    window.history.replaceState(null, '', `#${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const simpanKey = async (key, value) => {
    await simpan(key, value);
    setData((d) => ({ ...d, [key]: value }));
  };

  async function logout() {
    setKeluar(true);
    try {
      await api('/api/admin/logout', { method: 'POST' });
    } catch (e) {}
    setTimeout(() => {
      router.replace('/admin/login');
      router.refresh();
    }, 450);
  }

  return (
    <div className={`adm${keluar ? ' keluar' : ''}`}>
      <aside className="adm-side">
        <div className="adm-brand">
          <Image src="/emblem-osis.png" width={800} height={800} alt="" />
          <span>
            <b>Panel Admin</b>
            <small>OSIS SMK Negeri Rembang</small>
          </span>
        </div>
        <nav className="adm-nav" aria-label="Menu admin">
          {TABS.map((t, i) => (
            <button key={t.id} type="button" className="adm-tab" style={{ '--i': i }} aria-current={tab === t.id} onClick={() => pindah(t.id)}>
              <Ikon id={t.id} />
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
        <div className="adm-side-foot">
          <a className="adm-tab" href="/" target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
            </svg>
            <span>Lihat website</span>
          </a>
          <button type="button" className="adm-tab" onClick={toggleTheme}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
            </svg>
            <span>Ganti tema</span>
          </button>
          <button type="button" className="adm-tab keluar-btn" onClick={logout}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9" />
            </svg>
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      <header className="adm-top">
        <div className="adm-brand">
          <Image src="/emblem-osis.png" width={800} height={800} alt="" />
          <b>Panel Admin</b>
        </div>
        <div className="adm-top-act">
          <button type="button" className="theme" onClick={toggleTheme} aria-label="Ganti tema terang atau gelap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
            </svg>
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
            Keluar
          </button>
        </div>
      </header>

      <main className="adm-main" key={tab}>
        {tab === 'ringkasan' && <Ringkasan data={data} pindah={pindah} />}
        {tab === 'kegiatan' && <ActivityManager jenis="kegiatan" items={data.kegiatan} mediaBase={mediaBase} onSimpan={(v) => simpanKey('kegiatan', v)} />}
        {tab === 'kolaborasi' && <ActivityManager jenis="kolaborasi" items={data.kolaborasi} mediaBase={mediaBase} onSimpan={(v) => simpanKey('kolaborasi', v)} />}
        {tab === 'poster' && <PosterManager settings={data.settings} mediaBase={mediaBase} onSimpan={(v) => simpanKey('settings', v)} />}
        {tab === 'profil' && <ProfilEditor settings={data.settings} mediaBase={mediaBase} onSimpan={(v) => simpanKey('settings', v)} />}
      </main>

      <nav className="adm-bottom" aria-label="Menu admin (ponsel)">
        {TABS.map((t) => (
          <button key={t.id} type="button" aria-current={tab === t.id} onClick={() => pindah(t.id)}>
            <Ikon id={t.id} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default function AdminApp(props) {
  return (
    <AdminUiProvider>
      <Isi {...props} />
    </AdminUiProvider>
  );
}
