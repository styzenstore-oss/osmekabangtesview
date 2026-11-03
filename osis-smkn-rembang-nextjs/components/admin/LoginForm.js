'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Spinner } from './ui';

export default function LoginForm({ siap }) {
  const router = useRouter();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [lihat, setLihat] = useState(false);
  const [status, setStatus] = useState('diam'); // diam | proses | gagal | berhasil
  const [pesan, setPesan] = useState('');
  const [goyang, setGoyang] = useState(false);

  const gagal = (teks) => {
    setStatus('gagal');
    setPesan(teks);
    setGoyang(true);
    setTimeout(() => setGoyang(false), 560);
  };

  async function kirim(e) {
    e.preventDefault();
    if (status === 'proses' || status === 'berhasil') return;
    setStatus('proses');
    setPesan('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return gagal(data.error || 'Gagal masuk. Coba lagi.');
      setStatus('berhasil');
      setTimeout(() => router.replace('/admin'), 1500);
    } catch (err) {
      gagal('Tidak bisa terhubung ke server. Periksa koneksi internet.');
    }
  }

  return (
    <div className="login">
      <span className="login-orb a" aria-hidden="true" />
      <span className="login-orb b" aria-hidden="true" />

      <div className="login-card">
        <div className={`login-shaker${goyang ? ' goyang' : ''}`}>
          <div className="login-logo" style={{ '--d': '.15s' }}>
            <Image src="/emblem-osis.png" width={800} height={800} priority alt="Logo OSIS SMK Negeri Rembang" />
          </div>
          <div style={{ '--d': '.25s' }} className="login-judul">
            <h1>Panel Admin OSIS</h1>
            <p>Masuk untuk mengelola website OSIS SMK Negeri Rembang.</p>
          </div>

          {!siap && (
            <p className="login-alert" role="alert">
              Admin belum diatur. Isi <code>ADMIN_PASSWORD</code> di pengaturan environment, lalu deploy ulang.
            </p>
          )}

          <form onSubmit={kirim} noValidate>
            <label className="login-fld" style={{ '--d': '.35s' }}>
              <span>Username</span>
              <div className="login-in">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                </svg>
                <input value={user} onChange={(e) => setUser(e.target.value)} autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="Username" required />
              </div>
            </label>

            <label className="login-fld" style={{ '--d': '.45s' }}>
              <span>Password</span>
              <div className="login-in">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="4" y="10" width="16" height="10" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
                <input type={lihat ? 'text' : 'password'} value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="current-password" placeholder="Password" required />
                <button type="button" className="login-eye" onClick={() => setLihat((v) => !v)} aria-label={lihat ? 'Sembunyikan password' : 'Tampilkan password'} aria-pressed={lihat}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                    {!lihat && <path d="M4 4l16 16" />}
                  </svg>
                </button>
              </div>
            </label>

            <p className={`login-err${status === 'gagal' ? ' tampil' : ''}`} role="alert">
              {pesan}
            </p>

            <button type="submit" className="btn btn-primary login-btn" style={{ '--d': '.55s' }} disabled={!siap || status === 'proses' || status === 'berhasil' || !user || !pass}>
              {status === 'proses' ? (
                <>
                  <Spinner /> Memeriksa...
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          <Link className="login-back" href="/" style={{ '--d': '.65s' }}>
            &larr; Kembali ke website
          </Link>
        </div>
      </div>

      {status === 'berhasil' && (
        <div className="login-ok" role="status">
          <div>
            <svg width="76" height="76" viewBox="0 0 52 52" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle className="ok-ring" cx="26" cy="26" r="23" />
              <path className="ok-check" d="m15 27 7.5 7.5L37 19" />
            </svg>
            <p>Berhasil masuk</p>
            <small>Menyiapkan panel admin...</small>
          </div>
        </div>
      )}
    </div>
  );
}
