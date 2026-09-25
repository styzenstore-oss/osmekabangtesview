'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { compressImage } from '@/lib/compress';
import { KATEGORI } from '@/lib/events';

const DAFTAR_EKSKUL = [
  'PMR',
  'Pramuka',
  'Paskibra',
  'Rohis',
  'Multimedia',
  'Seni & Musik',
  'Olahraga / Futsal',
  'Pecinta Alam',
  'KIR / Robotik',
  'Lainnya',
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [kegiatanList, setKegiatanList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'tambah', 'users'

  // Form State Tambah Kegiatan
  const [judul, setJudul] = useState('');
  const [kat, setKat] = useState('Peringatan');
  const [jenis, setJenis] = useState('kegiatan');
  const [mulai, setMulai] = useState('');
  const [sampai, setSampai] = useState('');
  const [tempat, setTempat] = useState('');
  const [desk, setDesk] = useState('');
  const [mitraInput, setMitraInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Form Tambah User Baru (Khusus Superadmin)
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('osis');
  const [newUserEkskul, setNewUserEkskul] = useState('PMR');

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/admin/login');
        return;
      }
      setUser(session.user);

      // Ambil data profile role
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (prof) {
        setProfile(prof);
        if (prof.role === 'ekskul') {
          setJenis('kolaborasi');
          setMitraInput(prof.ekskul_name || '');
        }
      } else {
        const defaultRole = {
          id: session.user.id,
          email: session.user.email,
          role: 'superadmin',
          nama: session.user.email.split('@')[0],
        };
        setProfile(defaultRole);
      }

      await loadKegiatan();
      setLoading(false);
    }

    checkAuth();
  }, [router]);

  const loadKegiatan = async () => {
    try {
      const { data, error } = await supabase
        .from('kegiatan')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setKegiatanList(data);
      }
    } catch (err) {
      console.error('Gagal mengambil kegiatan:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setUserList(data);
      }
    } catch (err) {
      console.error('Gagal mengambil pengguna:', err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setMessage({ text: 'Mengompresi foto sebelum upload...', type: 'info' });
    const compressedList = [];
    for (const f of files) {
      const comp = await compressImage(f, 1600, 0.82);
      compressedList.push(comp);
    }

    setSelectedFiles((prev) => [...prev, ...compressedList]);
    setMessage({
      text: `${files.length} foto berhasil dikompresi otomatis format WebP hemat kuota!`,
      type: 'success',
    });
  };

  const removeFile = (idx) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage({ text: 'Menyimpan kegiatan...', type: 'info' });

    try {
      const idUnik =
        judul
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') +
        '-' +
        Date.now().toString().slice(-4);
      const uploadedFotos = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const filePath = `${jenis}/${idUnik}/${Date.now()}_${i}.webp`;

        const { data: uploadRes, error: uploadErr } = await supabase.storage
          .from('dokumentasi')
          .upload(filePath, file, { contentType: 'image/webp' });

        if (!uploadErr && uploadRes) {
          const { data: urlData } = supabase.storage
            .from('dokumentasi')
            .getPublicUrl(filePath);

          uploadedFotos.push({
            src: urlData.publicUrl,
            alt: `Dokumentasi ${judul} foto ${i + 1}`,
          });
        }
      }

      // Pastikan jika role ekskul, mitra terisi ekskulnya
      let finalMitra = mitraInput
        ? mitraInput.split(',').map((m) => m.trim()).filter(Boolean)
        : [];

      if (profile?.role === 'ekskul' && profile.ekskul_name && !finalMitra.includes(profile.ekskul_name)) {
        finalMitra.unshift(profile.ekskul_name);
      }

      // Status verifikasi: jika role ekskul, default 'pending' (butuh review pembina/superadmin)
      // Jika Superadmin atau OSIS, langsung 'approved'
      const statusVerif = profile?.role === 'ekskul' ? 'pending' : 'approved';

      const { error: insertErr } = await supabase.from('kegiatan').insert([
        {
          id: idUnik,
          judul,
          kat,
          jenis: profile?.role === 'ekskul' ? 'kolaborasi' : jenis,
          mulai,
          sampai: sampai || null,
          tempat,
          desk,
          mitra: finalMitra,
          fotos: uploadedFotos,
          created_by: user.id,
          created_by_email: user.email,
          created_by_role: profile?.role || 'osis',
          status_verifikasi: statusVerif,
        },
      ]);

      if (insertErr) throw insertErr;

      setMessage({
        text:
          statusVerif === 'pending'
            ? 'Kegiatan berhasil diajukan! Menunggu persetujuan Pembina / Superadmin.'
            : 'Kegiatan berhasil disimpan dan langsung tayang!',
        type: 'success',
      });

      setJudul('');
      setTempat('');
      setDesk('');
      setMitraInput('');
      setSelectedFiles([]);
      setActiveTab('list');
      await loadKegiatan();
    } catch (err) {
      setMessage({ text: err.message || 'Gagal menyimpan kegiatan.', type: 'danger' });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('kegiatan')
        .update({ status_verifikasi: status })
        .eq('id', id);

      if (!error) {
        setKegiatanList((prev) =>
          prev.map((k) => (k.id === id ? { ...k, status_verifikasi: status } : k))
        );
        setMessage({ text: `Status kegiatan berhasil diubah jadi ${status}!`, type: 'success' });
      }
    } catch (err) {
      setMessage({ text: 'Gagal memperbarui status.', type: 'danger' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus kegiatan ini?')) return;

    try {
      const { error } = await supabase.from('kegiatan').delete().eq('id', id);
      if (!error) {
        setKegiatanList((prev) => prev.filter((k) => k.id !== id));
        setMessage({ text: 'Kegiatan berhasil dihapus.', type: 'success' });
      }
    } catch (err) {
      setMessage({ text: 'Gagal menghapus kegiatan.', type: 'danger' });
    }
  };

  // Fungsi Tambah User Baru oleh Superadmin
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMessage({ text: 'Mendaftarkan pengguna baru...', type: 'info' });

    try {
      const { data, error } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPass,
        options: {
          data: {
            nama: newUserName,
            role: newUserRole,
            ekskul_name: newUserRole === 'ekskul' ? newUserEkskul : null,
          },
        },
      });

      if (error) throw error;

      if (data?.user) {
        await supabase.from('profiles').upsert([
          {
            id: data.user.id,
            email: newUserEmail,
            nama: newUserName,
            role: newUserRole,
            ekskul_name: newUserRole === 'ekskul' ? newUserEkskul : null,
          },
        ]);
      }

      setMessage({
        text: `Akun ${newUserEmail} (${newUserRole.toUpperCase()}) berhasil didaftarkan!`,
        type: 'success',
      });
      setNewUserEmail('');
      setNewUserPass('');
      setNewUserName('');
      await loadUsers();
    } catch (err) {
      setMessage({ text: err.message || 'Gagal membuat user.', type: 'danger' });
    }
  };

  if (loading) {
    return (
      <div className="admin-container" style={{ textAlign: 'center', marginTop: '60px' }}>
        <p style={{ color: 'var(--muted)' }}>Memuat Admin Panel...</p>
      </div>
    );
  }

  const isSuperadmin = profile?.role === 'superadmin';
  const isOsis = profile?.role === 'osis';
  const isEkskul = profile?.role === 'ekskul';

  return (
    <div className="admin-container">
      {/* Top Header */}
      <div className="admin-header">
        <div>
          <h1>ADMIN PANEL OSIS</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{user?.email}</span>
            <span className={`admin-badge badge-${profile?.role}`}>
              {isSuperadmin
                ? '★ Pembina / Superadmin'
                : isEkskul
                ? `Ekskul: ${profile?.ekskul_name || 'Umum'}`
                : 'Pengurus OSIS'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/" className="btn btn-ghost chamfer btn-sm" target="_blank">
            Lihat Website ↗
          </Link>
          <button onClick={handleLogout} className="btn btn-ghost chamfer btn-sm btn-danger">
            Keluar
          </button>
        </div>
      </div>

      {/* Pesan Notifikasi */}
      {message.text && (
        <div
          style={{
            background: message.type === 'danger' ? 'rgba(255, 90, 95, 0.15)' : 'rgba(47, 179, 109, 0.15)',
            border: `1px solid ${message.type === 'danger' ? 'var(--red)' : '#2FB36D'}`,
            color: message.type === 'danger' ? 'var(--red)' : '#2FB36D',
            padding: '12px 16px',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '0.9rem',
          }}
        >
          {message.text}
        </div>
      )}

      {/* Tab Navigasi */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeTab === 'list' ? 'btn-primary' : 'btn-ghost'} chamfer btn-sm`}
          onClick={() => setActiveTab('list')}
        >
          Daftar Kegiatan ({kegiatanList.length})
        </button>
        <button
          className={`btn ${activeTab === 'tambah' ? 'btn-primary' : 'btn-ghost'} chamfer btn-sm`}
          onClick={() => setActiveTab('tambah')}
        >
          + Tambah {isEkskul ? 'Kolaborasi Ekskul' : 'Kegiatan'}
        </button>
        {isSuperadmin && (
          <button
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-ghost'} chamfer btn-sm`}
            onClick={() => {
              setActiveTab('users');
              loadUsers();
            }}
          >
            👥 Kelola Akun & Role
          </button>
        )}
      </div>

      {/* TAB 1: DAFTAR KEGIATAN */}
      {activeTab === 'list' && (
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--ink)' }}>
              Daftar Kegiatan & Dokumentasi
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              {isEkskul ? `Menampilkan data ekskul Anda` : 'Semua program kerja sekolah'}
            </span>
          </div>

          {kegiatanList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--muted)' }}>
              <p>Belum ada kegiatan yang diunggah ke database Supabase.</p>
              <button
                onClick={() => setActiveTab('tambah')}
                className="btn btn-primary chamfer btn-sm"
                style={{ marginTop: '10px' }}
              >
                Tambah Kegiatan Pertama
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Judul Kegiatan</th>
                    <th>Kategori</th>
                    <th>Jenis</th>
                    <th>Status</th>
                    <th>Waktu Mulai</th>
                    <th>Tempat</th>
                    <th>Foto</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {kegiatanList.map((item) => {
                    const canEdit = isSuperadmin || item.created_by === user.id;
                    return (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 600 }}>{item.judul}</td>
                        <td>
                          <span className="admin-badge" style={{ fontSize: '0.75rem' }}>
                            {item.kat}
                          </span>
                        </td>
                        <td>{item.jenis === 'kolaborasi' ? 'Kolaborasi' : 'OSIS'}</td>
                        <td>
                          <span
                            style={{
                              fontSize: '0.78rem',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background:
                                item.status_verifikasi === 'approved'
                                  ? 'rgba(47, 179, 109, 0.2)'
                                  : item.status_verifikasi === 'pending'
                                  ? 'rgba(230, 180, 80, 0.2)'
                                  : 'rgba(255, 90, 95, 0.2)',
                              color:
                                item.status_verifikasi === 'approved'
                                  ? '#2FB36D'
                                  : item.status_verifikasi === 'pending'
                                  ? 'var(--gold)'
                                  : 'var(--red)',
                              border: '1px solid currentColor',
                            }}
                          >
                            {item.status_verifikasi === 'approved'
                              ? 'Tayang'
                              : item.status_verifikasi === 'pending'
                              ? 'Menunggu Review'
                              : 'Ditolak'}
                          </span>
                        </td>
                        <td>{item.mulai?.replace('T', ' ')}</td>
                        <td>{item.tempat}</td>
                        <td>{item.fotos?.length || 0} foto</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {isSuperadmin && item.status_verifikasi === 'pending' && (
                              <button
                                onClick={() => handleUpdateStatus(item.id, 'approved')}
                                className="btn btn-primary chamfer btn-sm"
                                style={{ padding: '0 8px', fontSize: '0.75rem' }}
                              >
                                Setujui
                              </button>
                            )}
                            {canEdit && (
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="btn btn-ghost chamfer btn-sm btn-danger"
                                style={{ padding: '0 8px' }}
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FORM TAMBAH KEGIATAN */}
      {activeTab === 'tambah' && (
        <div className="admin-card">
          <h2 style={{ fontSize: '1.2rem', margin: '0 0 16px', color: 'var(--ink)' }}>
            Form Tambah & Upload Dokumentasi Foto
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label>Judul Kegiatan *</label>
              <input
                type="text"
                required
                className="admin-input"
                placeholder={
                  isEkskul
                    ? `Contoh: Latihan Gabungan ${profile?.ekskul_name}`
                    : 'Contoh: Lomba Kebersihan Kelas'
                }
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
              />
            </div>

            <div className="admin-grid-2">
              <div className="admin-form-group">
                <label>Kategori *</label>
                <select className="admin-select" value={kat} onChange={(e) => setKat(e.target.value)}>
                  {KATEGORI.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label>Jenis Kegiatan *</label>
                <select
                  className="admin-select"
                  value={isEkskul ? 'kolaborasi' : jenis}
                  disabled={isEkskul}
                  onChange={(e) => setJenis(e.target.value)}
                >
                  <option value="kegiatan">Kegiatan Mandiri OSIS</option>
                  <option value="kolaborasi">Kolaborasi Ekstrakurikuler</option>
                </select>
              </div>
            </div>

            <div className="admin-grid-2">
              <div className="admin-form-group">
                <label>Waktu Mulai *</label>
                <input
                  type="datetime-local"
                  required
                  className="admin-input"
                  value={mulai}
                  onChange={(e) => setMulai(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Waktu Selesai (Opsional)</label>
                <input
                  type="date"
                  className="admin-input"
                  value={sampai}
                  onChange={(e) => setSampai(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>Lokasi / Tempat *</label>
              <input
                type="text"
                required
                className="admin-input"
                placeholder="Contoh: Aula SMKN Rembang"
                value={tempat}
                onChange={(e) => setTempat(e.target.value)}
              />
            </div>

            {(jenis === 'kolaborasi' || isEkskul) && (
              <div className="admin-form-group">
                <label>Mitra Kolaborasi (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="Contoh: PMR, Pramuka, Paskibra"
                  value={mitraInput}
                  onChange={(e) => setMitraInput(e.target.value)}
                />
              </div>
            )}

            <div className="admin-form-group">
              <label>Deskripsi Kegiatan *</label>
              <textarea
                required
                rows={4}
                className="admin-textarea"
                placeholder="Rincian kegiatan, tujuan, dan alur acara..."
                value={desk}
                onChange={(e) => setDesk(e.target.value)}
              />
            </div>

            {/* Upload Foto Dokumentasi dengan Kompresi Otomatis */}
            <div className="admin-form-group" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <span>Upload Foto Dokumentasi (Bisa Pilih Banyak Foto)</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--gold)' }}>
                  ⚡ Auto-compress WebP Aktif (Hemat Kuota Supabase)
                </span>
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="admin-input"
                style={{ padding: '8px' }}
              />

              {selectedFiles.length > 0 && (
                <div className="image-preview-grid">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="image-preview-item">
                      <img src={URL.createObjectURL(file)} alt="preview" />
                      <button type="button" onClick={() => removeFile(idx)}>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <button type="submit" disabled={uploading} className="btn btn-primary chamfer">
                {uploading ? 'Mengunggah & Menyimpan...' : 'Simpan Kegiatan'}
              </button>
              <button
                type="button"
                className="btn btn-ghost chamfer"
                onClick={() => setActiveTab('list')}
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: KELOLA AKUN & ROLE (KHUSUS SUPERADMIN / PEMBINA) */}
      {activeTab === 'users' && isSuperadmin && (
        <div>
          <div className="admin-card">
            <h2 style={{ fontSize: '1.2rem', margin: '0 0 16px', color: 'var(--ink)' }}>
              Tambah Pengguna Baru & Atur Role
            </h2>
            <form onSubmit={handleCreateUser}>
              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label>Nama Lengkap / Jabatan</label>
                  <input
                    type="text"
                    required
                    className="admin-input"
                    placeholder="Contoh: Rendi (Ketua PMR)"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Email Pengguna</label>
                  <input
                    type="email"
                    required
                    className="admin-input"
                    placeholder="pmr@smknrembang.sch.id"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label>Password Awal</label>
                  <input
                    type="password"
                    required
                    className="admin-input"
                    placeholder="Minimal 6 karakter"
                    value={newUserPass}
                    onChange={(e) => setNewUserPass(e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Pilih Role</label>
                  <select
                    className="admin-select"
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                  >
                    <option value="superadmin">Pembina / Superadmin (Akses Penuh)</option>
                    <option value="osis">Pengurus OSIS Inti (Kelola Semua Kegiatan)</option>
                    <option value="ekskul">Admin Seksi / Ekskul (Khusus Kegiatan Ekskul)</option>
                  </select>
                </div>
              </div>

              {newUserRole === 'ekskul' && (
                <div className="admin-form-group">
                  <label>Nama Ekstrakurikuler</label>
                  <select
                    className="admin-select"
                    value={newUserEkskul}
                    onChange={(e) => setNewUserEkskul(e.target.value)}
                  >
                    {DAFTAR_EKSKUL.map((eks) => (
                      <option key={eks} value={eks}>
                        {eks}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button type="submit" className="btn btn-primary chamfer" style={{ marginTop: '10px' }}>
                + Daftarkan Pengguna
              </button>
            </form>
          </div>

          <div className="admin-card">
            <h2 style={{ fontSize: '1.2rem', margin: '0 0 16px', color: 'var(--ink)' }}>
              Daftar Pengguna Terdaftar
            </h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Ekskul</th>
                </tr>
              </thead>
              <tbody>
                {userList.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.nama || '-'}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`admin-badge badge-${u.role}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{u.ekskul_name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
