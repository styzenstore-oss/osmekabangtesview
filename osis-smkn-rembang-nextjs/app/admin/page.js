'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { compressImage } from '@/lib/compress';
import { KATEGORI } from '@/lib/events';
import { DATA } from '@/lib/data';

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
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'tambah', 'profil_osis', 'users'

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

  // Form State Edit Profil OSIS
  const [periode, setPeriode] = useState('2026/2027');
  const [visi, setVisi] = useState('');
  const [misiText, setMisiText] = useState('');
  // Ketua
  const [ketuaNama, setKetuaNama] = useState('');
  const [ketuaRingkas, setKetuaRingkas] = useState('');
  const [ketuaSalam, setKetuaSalam] = useState('');
  const [ketuaFotoUrl, setKetuaFotoUrl] = useState('');
  // Wakil
  const [wakilNama, setWakilNama] = useState('');
  const [wakilRingkas, setWakilRingkas] = useState('');
  const [wakilSalam, setWakilSalam] = useState('');
  const [wakilFotoUrl, setWakilFotoUrl] = useState('');
  // Pembina
  const [pembinaNama, setPembinaNama] = useState('');
  const [pembinaRingkas, setPembinaRingkas] = useState('');
  const [pembinaSalam, setPembinaSalam] = useState('');
  const [pembinaFotoUrl, setPembinaFotoUrl] = useState('');
  const [savingProfil, setSavingProfil] = useState(false);

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
      await loadProfilOsis();
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

  const loadProfilOsis = async () => {
    try {
      const { data, error } = await supabase
        .from('profil_osis')
        .select('*')
        .eq('id', 'profil_utama')
        .single();

      if (!error && data) {
        setPeriode(data.periode || '2026/2027');
        setVisi(data.visi || DATA.visi);
        setMisiText(Array.isArray(data.misi) ? data.misi.join('\n') : DATA.misi.join('\n'));
        // Ketua
        setKetuaNama(data.ketua_nama || DATA.ketua.nama);
        setKetuaRingkas(data.ketua_ringkas || DATA.ketua.ringkas);
        setKetuaSalam(Array.isArray(data.ketua_salam) ? data.ketua_salam.join('\n\n') : DATA.ketua.salam.join('\n\n'));
        setKetuaFotoUrl(data.ketua_foto || '');
        // Wakil
        setWakilNama(data.wakil_nama || 'Nama Wakil Ketua OSIS');
        setWakilRingkas(data.wakil_ringkas || 'Mendampingi kepemimpinan OSIS dan sinergi antarsiswa.');
        setWakilSalam(Array.isArray(data.wakil_salam) ? data.wakil_salam.join('\n\n') : 'Semangat berorganisasi dan berkarya bersama OSIS SMK Negeri Rembang.');
        setWakilFotoUrl(data.wakil_foto || '');
        // Pembina
        setPembinaNama(data.pembina_nama || DATA.pembina.nama);
        setPembinaRingkas(data.pembina_ringkas || DATA.pembina.ringkas);
        setPembinaSalam(Array.isArray(data.pembina_salam) ? data.pembina_salam.join('\n\n') : DATA.pembina.salam.join('\n\n'));
        setPembinaFotoUrl(data.pembina_foto || '');
      } else {
        // Isi default dari data statis
        setPeriode(DATA.periode);
        setVisi(DATA.visi);
        setMisiText(DATA.misi.join('\n'));
        setKetuaNama(DATA.ketua.nama);
        setKetuaRingkas(DATA.ketua.ringkas);
        setKetuaSalam(DATA.ketua.salam.join('\n\n'));
        setWakilNama('Nama Wakil Ketua OSIS');
        setWakilRingkas('Mendampingi kepemimpinan OSIS dan sinergi antarsiswa.');
        setWakilSalam('Semangat berorganisasi dan berkarya bersama OSIS SMK Negeri Rembang.');
        setPembinaNama(DATA.pembina.nama);
        setPembinaRingkas(DATA.pembina.ringkas);
        setPembinaSalam(DATA.pembina.salam.join('\n\n'));
      }
    } catch (err) {
      console.error('Gagal mengambil profil osis:', err);
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

  // Upload Foto untuk Profil (Ketua/Wakil/Pembina)
  const handleUploadFotoProfil = async (e, setUrlCallback) => {
    const file = e.target.files[0];
    if (!file) return;

    setMessage({ text: 'Mengompresi dan mengunggah foto profil...', type: 'info' });
    try {
      const compressed = await compressImage(file, 800, 0.85);
      const filePath = `profil/foto_${Date.now()}.webp`;

      const { data: uploadRes, error: uploadErr } = await supabase.storage
        .from('dokumentasi')
        .upload(filePath, compressed, { contentType: 'image/webp' });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('dokumentasi').getPublicUrl(filePath);
      setUrlCallback(urlData.publicUrl);
      setMessage({ text: 'Foto profil berhasil diunggah!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.message || 'Gagal mengunggah foto profil.', type: 'danger' });
    }
  };

  // Simpan Data Profil OSIS
  const handleSaveProfil = async (e) => {
    e.preventDefault();
    setSavingProfil(true);
    setMessage({ text: 'Menyimpan profil OSIS ke database...', type: 'info' });

    try {
      const misiArr = misiText
        .split('\n')
        .map((m) => m.trim())
        .filter(Boolean);

      const ketuaSalamArr = ketuaSalam
        .split('\n\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const wakilSalamArr = wakilSalam
        .split('\n\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const pembinaSalamArr = pembinaSalam
        .split('\n\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        id: 'profil_utama',
        periode,
        visi,
        misi: misiArr,
        ketua_nama: ketuaNama,
        ketua_jabatan: 'Ketua OSIS',
        ketua_foto: ketuaFotoUrl || null,
        ketua_ringkas: ketuaRingkas,
        ketua_salam: ketuaSalamArr,
        wakil_nama: wakilNama,
        wakil_jabatan: 'Wakil Ketua OSIS',
        wakil_foto: wakilFotoUrl || null,
        wakil_ringkas: wakilRingkas,
        wakil_salam: wakilSalamArr,
        pembina_nama: pembinaNama,
        pembina_jabatan: 'Pembina OSIS',
        pembina_foto: pembinaFotoUrl || null,
        pembina_ringkas: pembinaRingkas,
        pembina_salam: pembinaSalamArr,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profil_osis')
        .upsert([payload]);

      if (error) throw error;

      setMessage({ text: 'Profil OSIS (Ketua, Wakil, Pembina, Visi & Misi) berhasil diperbarui!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.message || 'Gagal menyimpan profil OSIS.', type: 'danger' });
    } finally {
      setSavingProfil(false);
    }
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

      let finalMitra = mitraInput
        ? mitraInput.split(',').map((m) => m.trim()).filter(Boolean)
        : [];

      if (profile?.role === 'ekskul' && profile.ekskul_name && !finalMitra.includes(profile.ekskul_name)) {
        finalMitra.unshift(profile.ekskul_name);
      }

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

      // Jika Supabase mewajibkan konfirmasi email (Confirm email ON),
      // signUp berhasil tapi session = null dan user belum bisa login
      // sampai klik link verifikasi di Gmail.
      if (data?.user && !data?.session) {
        setMessage({
          text: `Akun ${newUserEmail} berhasil dibuat, tapi BELUM BISA LOGIN sebelum klik link verifikasi yang dikirim ke Gmail-nya. Solusi cepat: matikan "Confirm email" di Supabase (Auth > Providers > Email), atau buat akun via Dashboard > Authentication > Users > Add user (centang Auto Confirm).`,
          type: 'danger',
        });
      } else {
        setMessage({
          text: `Akun ${newUserEmail} (${newUserRole.toUpperCase()}) berhasil didaftarkan dan langsung bisa login!`,
          type: 'success',
        });
      }

      if (data?.user) {
        const { error: profErr } = await supabase.from('profiles').upsert([
          {
            id: data.user.id,
            email: newUserEmail,
            nama: newUserName,
            role: newUserRole,
            ekskul_name: newUserRole === 'ekskul' ? newUserEkskul : null,
          },
        ]);
        // Jika gagal simpan profil karena RLS (user baru belum login),
        // trigger handle_new_user di database tetap membuat baris profil otomatis.
        if (profErr) {
          console.warn('Upsert profil gagal (akan dibuat otomatis oleh trigger):', profErr.message);
        }
      }

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
  const canEditProfilOsis = isSuperadmin || isOsis;

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
        {canEditProfilOsis && (
          <button
            className={`btn ${activeTab === 'profil_osis' ? 'btn-primary' : 'btn-ghost'} chamfer btn-sm`}
            onClick={() => setActiveTab('profil_osis')}
          >
            ⚙️ Edit Profil OSIS & Visi Misi
          </button>
        )}
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

      {/* TAB 3: EDIT PROFIL OSIS, KETUA, WAKIL, PEMBINA & VISI MISI */}
      {activeTab === 'profil_osis' && canEditProfilOsis && (
        <div className="admin-card">
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.3rem', margin: '0 0 6px', color: 'var(--gold)' }}>
              Kelola Profil OSIS, Visi, Misi, & Pengurus
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--muted)', margin: 0 }}>
              Perubahan di sini langsung terbit dan tampil di halaman publik (Beranda & Profil).
            </p>
          </div>

          <form onSubmit={handleSaveProfil}>
            {/* Periode, Visi & Misi */}
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '20px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--ink)', marginBottom: '14px' }}>
                📌 Periode, Visi & Misi Organisasi
              </h3>

              <div className="admin-form-group">
                <label>Periode Kepengurusan</label>
                <input
                  type="text"
                  required
                  className="admin-input"
                  placeholder="2026/2027"
                  value={periode}
                  onChange={(e) => setPeriode(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Visi OSIS</label>
                <textarea
                  required
                  rows={3}
                  className="admin-textarea"
                  placeholder="Mewujudkan OSIS SMK Negeri Rembang..."
                  value={visi}
                  onChange={(e) => setVisi(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Misi OSIS (Satu baris untuk setiap poin misi)</label>
                <textarea
                  required
                  rows={6}
                  className="admin-textarea"
                  placeholder="Tulis setiap butir misi di baris baru..."
                  value={misiText}
                  onChange={(e) => setMisiText(e.target.value)}
                />
              </div>
            </div>

            {/* KETUA OSIS */}
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '20px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--cyan)', marginBottom: '14px' }}>
                👤 Profil Ketua OSIS
              </h3>

              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label>Nama Ketua OSIS</label>
                  <input
                    type="text"
                    required
                    className="admin-input"
                    value={ketuaNama}
                    onChange={(e) => setKetuaNama(e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Foto Ketua (Upload Baru / WebP)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadFotoProfil(e, setKetuaFotoUrl)}
                    className="admin-input"
                    style={{ padding: '8px' }}
                  />
                  {ketuaFotoUrl && (
                    <div style={{ marginTop: '6px', fontSize: '0.8rem', color: 'var(--gold)' }}>
                      ✓ Foto aktif: <a href={ketuaFotoUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>Lihat Foto</a>
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-form-group">
                <label>Pesan Singkat Ketua (Tampil di kartu beranda)</label>
                <textarea
                  rows={2}
                  className="admin-textarea"
                  value={ketuaRingkas}
                  onChange={(e) => setKetuaRingkas(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Sambutan Lengkap Ketua (Pisahkan paragraf dengan 2x Enter)</label>
                <textarea
                  rows={4}
                  className="admin-textarea"
                  value={ketuaSalam}
                  onChange={(e) => setKetuaSalam(e.target.value)}
                />
              </div>
            </div>

            {/* WAKIL KETUA OSIS */}
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '20px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--gold)', marginBottom: '14px' }}>
                👥 Profil Wakil Ketua OSIS
              </h3>

              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label>Nama Wakil Ketua OSIS</label>
                  <input
                    type="text"
                    required
                    className="admin-input"
                    value={wakilNama}
                    onChange={(e) => setWakilNama(e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Foto Wakil Ketua (Upload Baru / WebP)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadFotoProfil(e, setWakilFotoUrl)}
                    className="admin-input"
                    style={{ padding: '8px' }}
                  />
                  {wakilFotoUrl && (
                    <div style={{ marginTop: '6px', fontSize: '0.8rem', color: 'var(--gold)' }}>
                      ✓ Foto aktif: <a href={wakilFotoUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>Lihat Foto</a>
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-form-group">
                <label>Pesan Singkat Wakil Ketua (Tampil di kartu)</label>
                <textarea
                  rows={2}
                  className="admin-textarea"
                  value={wakilRingkas}
                  onChange={(e) => setWakilRingkas(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Sambutan Lengkap Wakil (Pisahkan paragraf dengan 2x Enter)</label>
                <textarea
                  rows={4}
                  className="admin-textarea"
                  value={wakilSalam}
                  onChange={(e) => setWakilSalam(e.target.value)}
                />
              </div>
            </div>

            {/* PEMBINA OSIS */}
            <div style={{ paddingBottom: '20px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--red)', marginBottom: '14px' }}>
                🎓 Profil Pembina OSIS
              </h3>

              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label>Nama Pembina OSIS</label>
                  <input
                    type="text"
                    required
                    className="admin-input"
                    value={pembinaNama}
                    onChange={(e) => setPembinaNama(e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Foto Pembina (Upload Baru / WebP)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadFotoProfil(e, setPembinaFotoUrl)}
                    className="admin-input"
                    style={{ padding: '8px' }}
                  />
                  {pembinaFotoUrl && (
                    <div style={{ marginTop: '6px', fontSize: '0.8rem', color: 'var(--gold)' }}>
                      ✓ Foto aktif: <a href={pembinaFotoUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>Lihat Foto</a>
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-form-group">
                <label>Pesan Singkat Pembina (Tampil di kartu beranda)</label>
                <textarea
                  rows={2}
                  className="admin-textarea"
                  value={pembinaRingkas}
                  onChange={(e) => setPembinaRingkas(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label>Sambutan Lengkap Pembina (Pisahkan paragraf dengan 2x Enter)</label>
                <textarea
                  rows={4}
                  className="admin-textarea"
                  value={pembinaSalam}
                  onChange={(e) => setPembinaSalam(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfil}
              className="btn btn-primary chamfer"
              style={{ width: '100%', minHeight: '50px' }}
            >
              {savingProfil ? 'Menyimpan Profil...' : '💾 Simpan Perubahan Profil & Visi Misi'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: KELOLA AKUN & ROLE (KHUSUS SUPERADMIN / PEMBINA) */}
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
