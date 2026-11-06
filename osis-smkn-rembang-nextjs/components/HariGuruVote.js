'use client';

import { useEffect, useRef, useState } from 'react';

const acakUrut = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const waktu = (s) => {
  const d = new Date(`${s}:00Z`);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.toLocaleString('id-ID', { timeZone: 'UTC', dateStyle: 'long', timeStyle: 'short' })} WIB`;
};

// Foto dimuat langsung dari penyimpanan publik (tanpa pengoptimal gambar Next.js) supaya selalu tampil di semua HP.
// Foto sudah dikecilkan saat diunggah. Jika gagal dimuat, tampil siluet.
function Foto({ g }) {
  const [gagal, setGagal] = useState(false);
  return g.foto && !gagal ? (
    <img src={g.foto} alt={`Foto ${g.nama}`} loading="lazy" decoding="async" onError={() => setGagal(true)} />
  ) : (
    <svg viewBox="0 0 100 100" fill="currentColor" role="img" aria-label="Foto belum diunggah">
      <circle cx="50" cy="36" r="17" />
      <path d="M14 100c0-22 16-36 36-36s36 14 36 36z" />
    </svg>
  );
}

function Hasil({ guru, hasil }) {
  const baris = guru.map((g) => ({ ...g, n: hasil[g.id] || 0 })).sort((a, b) => b.n - a.n || a.nama.localeCompare(b.nama, 'id'));
  const total = baris.reduce((s, g) => s + g.n, 0);
  const maks = baris[0]?.n || 0;
  return (
    <div className="hg-hasil box">
      <h2>Hasil akhir</h2>
      <p className="hg-sub">Dari {total} suara yang masuk. Terima kasih sudah ikut memilih.</p>
      <ol>
        {baris.map((g, i) => (
          <li key={g.id} className={i === 0 && g.n > 0 ? 'juara' : ''}>
            <span className="hg-no">{i + 1}</span>
            <span className="hg-mini">
              <Foto g={g} />
            </span>
            <span className="hg-nm">
              <b>{g.nama}</b>
              {g.mapel && <small>{g.mapel}</small>}
              <span className="hg-bar" aria-hidden="true">
                <i style={{ width: maks ? `${(g.n / maks) * 100}%` : 0 }} />
              </span>
            </span>
            <span className="hg-n">
              {g.n}
              <small>{total ? `${Math.round((g.n / total) * 100)}%` : '0%'}</small>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function HariGuruVote({ data }) {
  const [buka, setBuka] = useState(data.buka);
  const [kodeInput, setKodeInput] = useState('');
  const [kode, setKode] = useState(''); // kode yang sudah diterima
  const [kelas, setKelas] = useState(null);
  const [urut, setUrut] = useState([]);
  const [pilihan, setPilihan] = useState(null);
  const [memeriksa, setMemeriksa] = useState(false);
  const [proses, setProses] = useState(false);
  const [galat, setGalat] = useState('');
  const [selesai, setSelesai] = useState(null);
  const dlg = useRef(null);

  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (pilihan && !d.open) d.showModal();
    if (!pilihan && d.open) d.close();
  }, [pilihan]);

  async function periksa(ev) {
    ev.preventDefault();
    if (memeriksa || !kodeInput.trim()) return;
    setMemeriksa(true);
    setGalat('');
    try {
      const res = await fetch('/api/hari-guru/kode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kode: kodeInput }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok) {
        setKode(j.kode);
        setKelas(j.kelas);
        setSelesai(null);
        setUrut(acakUrut(data.guru)); // diacak agar tidak ada guru yang selalu di posisi pertama
      } else {
        setGalat(j.error || 'Kode belum bisa diperiksa. Coba lagi.');
        if (j.kode === 'tutup') setBuka(false);
      }
    } catch (e) {
      setGalat('Tidak ada koneksi. Periksa internet lalu coba lagi.');
    } finally {
      setMemeriksa(false);
    }
  }

  function ulang() {
    setKode('');
    setKelas(null);
    setKodeInput('');
    setSelesai(null);
    setGalat('');
  }

  async function kirim() {
    if (!kode || !pilihan || proses) return;
    setProses(true);
    setGalat('');
    try {
      const res = await fetch('/api/hari-guru/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kode, guru: pilihan.id }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok) {
        setSelesai({ guru: pilihan, kelas: kelas.nama });
        setKode('');
        setKelas(null);
        setKodeInput('');
      } else {
        setGalat(j.error || 'Suara gagal dikirim. Coba lagi.');
        if (['terpakai', 'salah', 'sudah', 'penuh'].includes(j.kode)) {
          setKode('');
          setKelas(null);
        }
        if (j.kode === 'tutup') setBuka(false);
      }
    } catch (e) {
      setGalat('Tidak ada koneksi. Periksa internet lalu coba lagi.');
    } finally {
      setProses(false);
      setPilihan(null);
    }
  }

  const persen = kelas ? Math.min(100, Math.round((kelas.terisi / kelas.kuota) * 100)) : 0;

  return (
    <div className="hg">
      {data.hasil && <Hasil guru={data.guru} hasil={data.hasil} />}

      {!buka && !data.hasil && <p className="empty">Voting sedang tidak dibuka. Pantau terus website OSIS untuk informasinya.</p>}

      {buka && (
        <>
          {!kode && !selesai && (
            <form className="hg-pilih box" onSubmit={periksa}>
              <label htmlFor="hg-kode">
                <b>1. Masukkan kode votingmu</b>
                <span className="hg-sub">Setiap kelas punya satu kode dari OSIS atau wali kelas. Kode hanya untuk kelasmu dan setiap siswa memilih satu kali. Pilihanmu anonim.</span>
              </label>
              <div className="hg-kode-row">
                <input
                  id="hg-kode"
                  className="search hg-kode"
                  value={kodeInput}
                  onChange={(e) => setKodeInput(e.target.value.toUpperCase())}
                  placeholder="Contoh: HW2K7M"
                  maxLength={10}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  inputMode="text"
                />
                <button type="submit" className="btn btn-primary" disabled={memeriksa || !kodeInput.trim()}>
                  {memeriksa ? 'Memeriksa...' : 'Lanjut'}
                </button>
              </div>
              {data.tutup && <p className="hg-sub">Voting ditutup {waktu(data.tutup)}.</p>}
            </form>
          )}

          {galat && (
            <p className="hg-alert" role="alert">
              {galat}
            </p>
          )}

          {selesai && (
            <div className="hg-ok box" role="status">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9.5" />
                <path d="m7.8 12.4 3 3 5.6-6" />
              </svg>
              <h2>Terima kasih!</h2>
              <p>
                Suaramu untuk <b>{selesai.guru.nama}</b> sudah tercatat secara anonim. Selamat Hari Guru Nasional.
              </p>
              {!data.kunci && (
                <button type="button" className="btn btn-ghost" onClick={ulang}>
                  Pilih untuk teman sekelas
                </button>
              )}
            </div>
          )}

          {kode && kelas && (
            <>
              <div className="hg-pilih box">
                <h2 className="hg-kelas">Kelas {kelas.nama}</h2>
                <span className="hg-sub">Kode diterima. Pilihanmu anonim dan tidak bisa diubah setelah dikirim.</span>
                <div className="hg-prog">
                  <div className="hg-prog-t">
                    <span>
                      <b>{kelas.terisi}</b> dari {kelas.kuota} siswa kelasmu sudah memilih
                    </span>
                    <span>{persen}%</span>
                  </div>
                  <span className="hg-bar big" role="progressbar" aria-valuemin={0} aria-valuemax={kelas.kuota} aria-valuenow={kelas.terisi}>
                    <i style={{ width: `${persen}%` }} />
                  </span>
                </div>
                <button type="button" className="link" onClick={ulang}>
                  Bukan kelasmu? Ganti kode
                </button>
              </div>

              <div className="hg-guru">
                <h2 className="hg-h2">2. Pilih guru terfavoritmu</h2>
                {data.guru.length === 0 ? (
                  <p className="empty">Daftar guru belum tersedia.</p>
                ) : (
                  <ul>
                    {urut.map((g) => (
                      <li key={g.id}>
                        <button type="button" className="hg-kartu box" onClick={() => setPilihan(g)} aria-label={`Pilih ${g.nama}`}>
                          <span className="hg-foto">
                            <Foto g={g} />
                          </span>
                          <span className="hg-info">
                            <b>{g.nama}</b>
                            {g.mapel && <small>{g.mapel}</small>}
                          </span>
                          <span className="hg-aksi">Pilih</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </>
      )}

      <dialog
        ref={dlg}
        className="hg-dlg"
        aria-label="Konfirmasi pilihan"
        onClose={() => !proses && setPilihan(null)}
        onClick={(e) => e.target === dlg.current && !proses && dlg.current.close()}
      >
        {pilihan && (
          <div className="hg-dlg-in">
            <span className="hg-dlg-foto">
              <Foto g={pilihan} />
            </span>
            <h3>Pilih {pilihan.nama}?</h3>
            <p>Suara tidak bisa diubah setelah dikirim, dan tidak ada yang tahu siapa pemilihnya.</p>
            <div className="hg-dlg-aksi">
              <button type="button" className="btn btn-ghost" disabled={proses} onClick={() => setPilihan(null)}>
                Batal
              </button>
              <button type="button" className="btn btn-primary" disabled={proses} onClick={kirim}>
                {proses ? 'Mengirim...' : 'Ya, kirim suara'}
              </button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
