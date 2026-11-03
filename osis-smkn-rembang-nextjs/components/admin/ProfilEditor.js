'use client';

import { useRef, useState } from 'react';
import { unggah } from './api';
import { Field, Spinner, useAdminUi } from './ui';

function FotoOrang({ path, mediaBase, onGanti, onBaru }) {
  const { toast } = useAdminUi();
  const input = useRef(null);
  const [proses, setProses] = useState(false);

  async function pilih(file) {
    if (!file) return;
    setProses(true);
    try {
      const p = await unggah(file, 'foto', 1000);
      onBaru(p);
      onGanti(p);
    } catch (e) {
      toast(e.message, 'err');
    } finally {
      setProses(false);
      if (input.current) input.current.value = '';
    }
  }

  return (
    <div className="orang-foto">
      <div className="orang-pic">
        {path ? (
          <img src={mediaBase + path} alt="" />
        ) : (
          <svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
            <circle cx="50" cy="36" r="17" />
            <path d="M14 100c0-22 16-36 36-36s36 14 36 36z" />
          </svg>
        )}
        {proses && (
          <span className="orang-load">
            <Spinner />
          </span>
        )}
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => pilih(e.target.files[0])} />
      <div className="orang-btn">
        <button type="button" className="btn btn-ghost btn-sm" disabled={proses} onClick={() => input.current.click()}>
          {path ? 'Ganti foto' : 'Unggah foto'}
        </button>
        {path && (
          <button type="button" className="btn btn-danger-ghost btn-sm" onClick={() => onGanti(null)}>
            Hapus
          </button>
        )}
      </div>
    </div>
  );
}

const paragraf = (arr) => (arr || []).join('\n\n');
const pecahParagraf = (t) => t.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);

export default function ProfilEditor({ settings, onSimpan, mediaBase }) {
  const { toast } = useAdminUi();
  const [f, setF] = useState(() => ({
    periode: settings.periode,
    visi: settings.visi,
    misi: (settings.misi || []).join('\n'),
    ketua: { ...settings.ketua, salamTeks: paragraf(settings.ketua.salam) },
    pembina: { ...settings.pembina, salamTeks: paragraf(settings.pembina.salam) },
  }));
  const [menyimpan, setMenyimpan] = useState(false);
  const unggahBaru = useRef([]);

  const setOrang = (kunci, k, v) => setF((x) => ({ ...x, [kunci]: { ...x[kunci], [k]: v } }));

  async function simpan(ev) {
    ev.preventDefault();
    const orang = ({ salamTeks, ...p }) => ({ ...p, salam: pecahParagraf(salamTeks) });
    const baru = {
      ...settings,
      periode: f.periode.trim(),
      visi: f.visi.trim(),
      misi: f.misi.split('\n').map((s) => s.trim()).filter(Boolean),
      ketua: orang(f.ketua),
      pembina: orang(f.pembina),
    };
    setMenyimpan(true);
    try {
      await onSimpan(baru);
      unggahBaru.current = [];
      toast('Profil, visi, dan misi tersimpan.');
    } catch (e) {
      toast(e.message, 'err');
    } finally {
      setMenyimpan(false);
    }
  }

  const blokOrang = (kunci, judul) => (
    <div className="adm-card box">
      <h2 className="adm-h2">{judul}</h2>
      <div className="orang">
        <FotoOrang
          path={f[kunci].foto}
          mediaBase={mediaBase}
          onBaru={(p) => unggahBaru.current.push(p)}
          onGanti={(p) => setOrang(kunci, 'foto', p)}
        />
        <div className="orang-form">
          <div className="fld-row">
            <Field label="Nama">
              <input className="in" value={f[kunci].nama} maxLength={80} onChange={(e) => setOrang(kunci, 'nama', e.target.value)} />
            </Field>
            <Field label="Jabatan">
              <input className="in" value={f[kunci].jabatan} maxLength={60} onChange={(e) => setOrang(kunci, 'jabatan', e.target.value)} />
            </Field>
          </div>
          <Field label="Ringkasan" hint="Teks singkat yang tampil di bagian bawah setiap halaman.">
            <textarea className="in" rows={3} maxLength={500} value={f[kunci].ringkas} onChange={(e) => setOrang(kunci, 'ringkas', e.target.value)} />
          </Field>
          <Field label="Salam lengkap" hint="Pisahkan paragraf dengan satu baris kosong.">
            <textarea className="in" rows={9} value={f[kunci].salamTeks} onChange={(e) => setOrang(kunci, 'salamTeks', e.target.value)} />
          </Field>
        </div>
      </div>
    </div>
  );

  return (
    <form className="adm-panel" onSubmit={simpan}>
      <div className="adm-head">
        <div>
          <h1>Profil, visi, dan misi</h1>
          <p>Nama ketua dan pembina, salam, serta arah OSIS periode ini.</p>
        </div>
      </div>

      <div className="adm-card box">
        <Field label="Periode kepengurusan">
          <input className="in" value={f.periode} maxLength={20} onChange={(e) => setF({ ...f, periode: e.target.value })} placeholder="2026/2027" style={{ maxWidth: 220 }} />
        </Field>
        <Field label="Visi">
          <textarea className="in" rows={3} maxLength={800} value={f.visi} onChange={(e) => setF({ ...f, visi: e.target.value })} />
        </Field>
        <Field label="Misi" hint="Satu misi per baris.">
          <textarea className="in" rows={7} value={f.misi} onChange={(e) => setF({ ...f, misi: e.target.value })} />
        </Field>
      </div>

      {blokOrang('ketua', 'Ketua OSIS')}
      {blokOrang('pembina', 'Pembina OSIS')}

      <div className="adm-bar aktif">
        <span className="adm-dirty">Periksa kembali sebelum menyimpan</span>
        <button type="submit" className="btn btn-primary" disabled={menyimpan}>
          {menyimpan && <Spinner />} {menyimpan ? 'Menyimpan...' : 'Simpan profil'}
        </button>
      </div>
    </form>
  );
}
