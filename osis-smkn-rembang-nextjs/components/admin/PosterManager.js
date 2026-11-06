'use client';

import { useRef, useState } from 'react';
import { bersihkanFile } from './api';
import PhotoManager from './PhotoManager';
import { Spinner, useAdminUi } from './ui';

export default function PosterManager({ settings, onSimpan, mediaBase }) {
  const { toast } = useAdminUi();
  const [paths, setPaths] = useState(settings.poster || []);
  const [menyimpan, setMenyimpan] = useState(false);
  const unggahBaru = useRef([]);
  const berubah = JSON.stringify(paths) !== JSON.stringify(settings.poster || []);

  async function simpan() {
    setMenyimpan(true);
    try {
      await onSimpan({ ...settings, poster: paths });
      unggahBaru.current = [];
      toast('Poster tersimpan dan sudah tampil di beranda.');
    } catch (e) {
      toast(e.message, 'err');
    } finally {
      setMenyimpan(false);
    }
  }

  async function batalkan() {
    await bersihkanFile(unggahBaru.current);
    unggahBaru.current = [];
    setPaths(settings.poster || []);
  }

  return (
    <div className="adm-panel">
      <div className="adm-head">
        <div>
          <h1>Poster beranda</h1>
          <p>Poster tampil sebagai slider yang berganti otomatis di beranda. Foto pertama tampil lebih dulu.</p>
        </div>
      </div>

      <div className="adm-card box">
        <p className="adm-sub">Gunakan poster landscape, idealnya rasio 16:9 (misalnya 1600 x 900 piksel) supaya tampil penuh.</p>
        <PhotoManager
          paths={paths}
          onChange={(fn) => setPaths((p) => (typeof fn === 'function' ? fn(p) : fn))}
          folder="poster"
          mediaBase={mediaBase}
          onBaru={(p) => unggahBaru.current.push(p)}
          rasio="16/9"
          sisiMaks={2000}
          label="Tambah poster"
        />
        {paths.length === 0 && <p className="empty" style={{ marginTop: 16 }}>Belum ada poster. Beranda akan menampilkan kotak kosong.</p>}
      </div>

      <div className={`adm-bar${berubah ? ' aktif' : ''}`}>
        <span className="adm-dirty">{berubah ? 'Ada perubahan yang belum disimpan' : 'Semua perubahan sudah tersimpan'}</span>
        <button type="button" className="btn btn-ghost" disabled={!berubah || menyimpan} onClick={batalkan}>
          Batalkan
        </button>
        <button type="button" className="btn btn-primary" disabled={!berubah || menyimpan} onClick={simpan}>
          {menyimpan && <Spinner />} {menyimpan ? 'Menyimpan...' : 'Simpan poster'}
        </button>
      </div>
    </div>
  );
}
