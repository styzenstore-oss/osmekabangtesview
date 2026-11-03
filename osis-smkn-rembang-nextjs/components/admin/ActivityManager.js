'use client';

import { useMemo, useRef, useState } from 'react';
import { KATEGORI } from '@/lib/events';
import { acak, bersihkanFile, buatSlug } from './api';
import PhotoManager from './PhotoManager';
import { Field, Spinner, useAdminUi } from './ui';

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const tgl = (m) => {
  const d = new Date(m);
  return Number.isNaN(d.getTime()) ? '-' : `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
};

const KOSONG = { judul: '', kat: KATEGORI[0], mulai: '', sampai: '', tempat: '', desk: '', mitra: [], fotos: [] };

// Pengelola kegiatan dan kolaborasi: daftar, tambah, ubah, hapus, lengkap dengan foto dokumentasi.
export default function ActivityManager({ jenis, items, onSimpan, mediaBase }) {
  const { toast, tanya } = useAdminUi();
  const kolab = jenis === 'kolaborasi';
  const nama = kolab ? 'kolaborasi' : 'kegiatan';

  const [form, setForm] = useState(null); // null = tampilkan daftar
  const [baru, setBaru] = useState(true);
  const [menyimpan, setMenyimpan] = useState(false);
  const [cari, setCari] = useState('');
  const [mitraInput, setMitraInput] = useState('');
  const idRef = useRef(null);
  const unggahBaru = useRef([]);

  const daftar = useMemo(() => {
    const k = cari.trim().toLowerCase();
    return [...items]
      .sort((a, b) => (a.mulai < b.mulai ? 1 : -1))
      .filter((e) => !k || [e.judul, e.tempat, e.kat, ...(e.mitra || [])].join(' ').toLowerCase().includes(k));
  }, [items, cari]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function tambah() {
    idRef.current = null;
    unggahBaru.current = [];
    setMitraInput('');
    setBaru(true);
    setForm({ ...KOSONG, mitra: [], fotos: [] });
  }

  function ubah(e) {
    idRef.current = e.id;
    unggahBaru.current = [];
    setMitraInput('');
    setBaru(false);
    setForm({ ...KOSONG, ...e, sampai: e.sampai || '', mitra: [...(e.mitra || [])], fotos: [...(e.fotos || [])] });
  }

  // ID dibuat saat pertama dibutuhkan (unggah foto pertama atau simpan), supaya nama folder foto rapi.
  const pastikanId = () => {
    if (!idRef.current) idRef.current = `${buatSlug(form.judul) || nama}-${acak(4)}`;
    return idRef.current;
  };

  async function batal() {
    await bersihkanFile(unggahBaru.current);
    setForm(null);
  }

  function tambahMitra() {
    const v = mitraInput.trim();
    if (!v) return;
    if (!form.mitra.includes(v)) set('mitra', [...form.mitra, v]);
    setMitraInput('');
  }

  async function simpanForm(ev) {
    ev.preventDefault();
    if (!form.judul.trim()) return toast('Judul wajib diisi.', 'err');
    if (!form.mulai) return toast('Tanggal dan jam mulai wajib diisi.', 'err');
    if (!form.tempat.trim()) return toast('Tempat wajib diisi.', 'err');
    if (form.sampai && form.sampai < form.mulai.slice(0, 10)) return toast('Tanggal selesai tidak boleh sebelum tanggal mulai.', 'err');

    const mitra = [...form.mitra];
    if (mitraInput.trim() && !mitra.includes(mitraInput.trim())) mitra.push(mitraInput.trim());

    const item = {
      id: pastikanId(),
      judul: form.judul.trim(),
      mulai: form.mulai,
      tempat: form.tempat.trim(),
      desk: form.desk.trim(),
      fotos: form.fotos,
    };
    if (kolab) item.mitra = mitra;
    else {
      item.kat = form.kat;
      if (form.sampai) item.sampai = form.sampai;
    }

    const list = baru ? [...items, item] : items.map((e) => (e.id === item.id ? item : e));
    setMenyimpan(true);
    try {
      await onSimpan(list);
      toast(baru ? `${kolab ? 'Kolaborasi' : 'Kegiatan'} berhasil ditambahkan.` : 'Perubahan tersimpan.');
      setForm(null);
    } catch (e) {
      toast(e.message, 'err');
    } finally {
      setMenyimpan(false);
    }
  }

  async function hapus(e) {
    const ya = await tanya({
      judul: `Hapus ${nama} ini?`,
      isi: `"${e.judul}" beserta ${e.fotos?.length || 0} foto dokumentasinya akan dihapus dari website. Tindakan ini tidak bisa dibatalkan.`,
      tombol: 'Ya, hapus',
      bahaya: true,
    });
    if (!ya) return;
    try {
      await onSimpan(items.filter((x) => x.id !== e.id));
      toast(`${kolab ? 'Kolaborasi' : 'Kegiatan'} dihapus.`);
    } catch (err) {
      toast(err.message, 'err');
    }
  }

  // ---------- Form ----------
  if (form) {
    return (
      <form className="adm-panel" onSubmit={simpanForm}>
        <div className="adm-head">
          <div>
            <h1>{baru ? `Tambah ${nama}` : `Ubah ${nama}`}</h1>
            <p>Perubahan langsung tampil di website setelah disimpan.</p>
          </div>
        </div>

        <div className="adm-card box stagger">
          <Field label="Judul">
            <input className="in" value={form.judul} maxLength={200} onChange={(e) => set('judul', e.target.value)} placeholder={kolab ? 'Contoh: Donor Darah bersama PMR' : 'Contoh: Lomba Antarkelas HUT RI'} autoFocus />
          </Field>

          <div className="fld-row">
            {!kolab && (
              <Field label="Kategori">
                <select className="in" value={form.kat} onChange={(e) => set('kat', e.target.value)}>
                  {KATEGORI.map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Mulai (tanggal dan jam)">
              <input className="in" type="datetime-local" value={form.mulai} onChange={(e) => set('mulai', e.target.value)} />
            </Field>
            {!kolab && (
              <Field label="Selesai (opsional)" hint="Isi jika berlangsung lebih dari satu hari.">
                <input className="in" type="date" value={form.sampai} min={form.mulai.slice(0, 10)} onChange={(e) => set('sampai', e.target.value)} />
              </Field>
            )}
          </div>

          <Field label="Tempat">
            <input className="in" value={form.tempat} maxLength={160} onChange={(e) => set('tempat', e.target.value)} placeholder="Contoh: Aula sekolah" />
          </Field>

          {kolab && (
            <Field label="Bersama (mitra)" hint="Ketik nama ekstrakurikuler atau pihak lain, lalu tekan Enter atau tombol Tambah.">
              <div className="mitra">
                {form.mitra.map((m) => (
                  <span className="tag chip-x" key={m}>
                    {m}
                    <button type="button" aria-label={`Hapus ${m}`} onClick={() => set('mitra', form.mitra.filter((x) => x !== m))}>
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <div className="mitra-in">
                <input
                  className="in"
                  value={mitraInput}
                  maxLength={60}
                  onChange={(e) => setMitraInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      tambahMitra();
                    }
                  }}
                  placeholder="Contoh: PMR"
                />
                <button type="button" className="btn btn-ghost" onClick={tambahMitra}>
                  Tambah
                </button>
              </div>
            </Field>
          )}

          <Field label="Deskripsi">
            <textarea className="in" rows={4} maxLength={2000} value={form.desk} onChange={(e) => set('desk', e.target.value)} placeholder="Ceritakan singkat tentang kegiatan ini." />
          </Field>
        </div>

        <div className="adm-card box">
          <h2 className="adm-h2">Foto dokumentasi</h2>
          <p className="adm-sub">Jumlah foto tidak dibatasi. Foto pertama menjadi sampul. Foto yang dihapus baru hilang dari website setelah Anda menekan Simpan.</p>
          <PhotoManager
            paths={form.fotos}
            onChange={(fn) => setForm((f) => ({ ...f, fotos: typeof fn === 'function' ? fn(f.fotos) : fn }))}
            folder={() => `${nama}/${pastikanId()}`}
            mediaBase={mediaBase}
            onBaru={(p) => unggahBaru.current.push(p)}
            label="Tambah foto dokumentasi"
          />
        </div>

        <div className="adm-bar">
          <button type="button" className="btn btn-ghost" onClick={batal} disabled={menyimpan}>
            Batal
          </button>
          <button type="submit" className="btn btn-primary" disabled={menyimpan}>
            {menyimpan && <Spinner />} {menyimpan ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    );
  }

  // ---------- Daftar ----------
  return (
    <div className="adm-panel">
      <div className="adm-head">
        <div>
          <h1>{kolab ? 'Kolaborasi' : 'Kegiatan'}</h1>
          <p>
            {items.length} {nama} tercatat. {kolab ? 'Kerja sama OSIS dengan ekstrakurikuler dan pihak lain.' : 'Program kerja OSIS dari takjil sampai LDKS.'}
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={tambah}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Tambah {nama}
        </button>
      </div>

      {items.length > 4 && (
        <input className="in cari" type="search" placeholder={`Cari ${nama}`} value={cari} onChange={(e) => setCari(e.target.value)} aria-label={`Cari ${nama}`} />
      )}

      {daftar.length === 0 ? (
        <p className="empty">{items.length ? 'Tidak ada yang cocok dengan pencarian.' : `Belum ada ${nama}. Tekan tombol Tambah untuk memulai.`}</p>
      ) : (
        <ul className="adm-list stagger">
          {daftar.map((e) => (
            <li key={e.id} className="adm-row box">
              <span className="adm-thumb">
                {e.fotos?.[0] ? <img src={mediaBase + e.fotos[0]} alt="" loading="lazy" /> : <span>{new Date(e.mulai).getDate() || '-'}</span>}
              </span>
              <div className="adm-info">
                <h3>{e.judul}</h3>
                <p>
                  {tgl(e.mulai)} &middot; {e.tempat}
                </p>
                <p className="adm-meta">
                  {!kolab && e.kat && <span className="tag">{e.kat}</span>}
                  {kolab && (e.mitra || []).map((m) => (
                    <span className="tag" key={m}>
                      {m}
                    </span>
                  ))}
                  <span>{e.fotos?.length || 0} foto</span>
                </p>
              </div>
              <div className="adm-act">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => ubah(e)}>
                  Ubah
                </button>
                <button type="button" className="btn btn-danger-ghost btn-sm" onClick={() => hapus(e)} aria-label={`Hapus ${e.judul}`}>
                  Hapus
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
