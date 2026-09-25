'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Cek jika sudah login
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/admin');
      }
    });
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        router.push('/admin');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal login. Periksa email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container" style={{ maxWidth: '440px', marginTop: '40px' }}>
      <div className="admin-card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', margin: 0, fontSize: '1.8rem' }}>
            PORTAL ADMIN
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: '6px 0 0' }}>
            OSIS SMK Negeri Rembang
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              background: 'rgba(255, 90, 95, 0.15)',
              border: '1px solid var(--red)',
              color: 'var(--red)',
              padding: '10px 14px',
              borderRadius: '4px',
              marginBottom: '16px',
              fontSize: '0.88rem',
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="admin-form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              className="admin-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@smknrembang.sch.id"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              className="admin-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div style={{ marginTop: '24px' }}>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary chamfer"
              style={{ width: '100%' }}
            >
              {loading ? 'Memproses...' : 'Masuk ke Admin Panel'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link href="/" style={{ color: 'var(--muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
