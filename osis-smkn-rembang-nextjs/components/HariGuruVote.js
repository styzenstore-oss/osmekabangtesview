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

const KAT = {
  guru: { judul: 'Guru terfavorit', pilih: 'guru terfavoritmu', label: 'Guru' },
  tendik: { judul: 'Tendik terfavorit', pilih: 'tendik terfavoritmu', label: 'Tendik' },
};

function Peringkat({ judul, daftar, hasil }) {
  const baris = daftar.map((g) => ({ ...g, n: hasil[g.id] || 0 })).sort((a, b) => b.n - a.n || a.nama.localeCompare(b.nama, 'id'));
  const total = baris.reduce((s, g) => s + g.n, 0);
  const maks = baris[0]?.n || 0;
  return (
    <div className="hg-hasil box">
      <h2>{judul}</h2>
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

function Hasil({ guru, tendik, hasil }) {
  return (
    <>
      <Peringkat judul={`Hasil akhir: ${KAT.guru.judul}`} daftar={guru} hasil={hasil} />
      {tendik.length > 0 && <Peringkat judul={`Hasil akhir: ${KAT.tendik.judul}`} daftar={tendik} hasil={hasil} />}
    </>
  );
}

function Pilihan({ kat, daftar, urut, terpilih, onPilih, nomor }) {
  return (
    <div className="hg-guru">
      <h2 className="hg-h2">
        {nomor}. Pilih {KAT[kat].pilih} <small>(pilih satu)</small>
      </h2>
      {daftar.length === 0 ? (
        <p className="empty">Daftar belum tersedia.</p>
      ) : (
        <ul>
          {urut.map((g) => {
            const on = terpilih?.id === g.id;
            return (
              <li key={g.id}>
                <button type="button" className={`hg-kartu box${on ? ' on' : ''}`} aria-pressed={on} onClick={() => onPilih(on ? null : g)} aria-label={`${on ? 'Batal memilih' : 'Pilih'} ${g.nama}`}>
                  <span className="hg-foto">
                    <Foto g={g} />
                    {on && (
                      <span className="hg-cek" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m5 12.5 4.5 4.5L19 7.5" />
                        </svg>
                      </span>
                    )}
                  </span>
                  <span className="hg-info">
                    <b>{g.nama}</b>
                    {g.mapel && <small>{g.mapel}</small>}
                  </span>
                  <span className="hg-aksi">{on ? 'Terpilih' : 'Pilih'}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function HariGuruVote({ data }) {
  const daftarGuru = data.guru.filter((g) => g.kategori !== 'tendik');
  const daftarTendik = data.guru.filter((g) => g.kategori === 'tendik');
  const adaTendik = daftarTendik.length > 0;

  const [buka, setBuka] = useState(data.buka);
  const [kodeInput, setKodeInput] = useState('');
  const [kode, setKode] = useState(''); // kode yang sudah diterima
  const [kelas, setKelas] = useState(null);
  const [urut, setUrut] = useState({ guru: [], tendik: [] });
  const [pilGuru, setPilGuru] = useState(null);
  const [pilTendik, setPilTendik] = useState(null);
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [memeriksa, setMemeriksa] = useState(false);
  const [proses, setProses] = useState(false);
  const [galat, setGalat] = useState('');
  const [selesai, setSelesai] = useState(null);
  const dlg = useRef(null);

  const siap = !!pilGuru && (!adaTendik || !!pilTendik);

  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (konfirmasi && !d.open) d.showModal();
    if (!konfirmasi && d.open) d.close();
  }, [konfirmasi]);

  function bersih() {
    setKode('');
    setKelas(null);
    setKodeInput('');
    setPilGuru(null);
    setPilTendik(null);
  }

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
        setPilGuru(null);
        setPilTendik(null);
        setUrut({ guru: acakUrut(daftarGuru), tendik: acakUrut(daftarTendik) }); // diacak agar tidak ada yang selalu di posisi pertama
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
    bersih();
    setSelesai(null);
    setGalat('');
  }

  async function kirim() {
    if (!kode || !siap || proses) return;
    setProses(true);
    setGalat('');
    try {
      const res = await fetch('/api/hari-guru/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kode, guru: pilGuru.id, tendik: pilTendik?.id || '' }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok) {
        setSelesai({ guru: pilGuru, tendik: pilTendik });
        bersih();
      } else {
        setGalat(j.error || 'Suara gagal dikirim. Coba lagi.');
        if (['terpakai', 'salah', 'sudah', 'penuh'].includes(j.kode)) bersih();
        if (j.kode === 'tutup') setBuka(false);
      }
    } catch (e) {
      setGalat('Tidak ada koneksi. Periksa internet lalu coba lagi.');
    } finally {
      setProses(false);
      setKonfirmasi(false);
    }
  }

  const persen = kelas ? Math.min(100, Math.round((kelas.terisi / kelas.kuota) * 100)) : 0;

  return (
    <div className="hg">
      {data.hasil && <Hasil guru={daftarGuru} tendik={daftarTendik} hasil={data.hasil} />}

      {!buka && !data.hasil && <p className="empty">Voting sedang tidak dibuka. Pantau terus website OSIS untuk informasinya.</p>}

      {buka && (
        <>
          {!kode && !selesai && (
            <form className="hg-pilih box" onSubmit={periksa}>
              <label htmlFor="hg-kode">
                <b>1. Masukkan kode votingmu</b>
                <span className="hg-sub">
                  Setiap kelas punya satu kode dari OSIS atau wali kelas. Kode hanya untuk kelasmu dan setiap siswa memilih satu kali: satu guru{adaTendik ? ' dan satu tendik' : ''}. Pilihanmu anonim.
                </span>
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
                Suaramu untuk guru <b>{selesai.guru.nama}</b>
                {selesai.tendik && (
                  <>
                    {' '}
                    dan tendik <b>{selesai.tendik.nama}</b>
                  </>
                )}{' '}
                sudah tercatat secara anonim. Selamat Hari Guru Nasional.
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

              <Pilihan kat="guru" nomor={2} daftar={daftarGuru} urut={urut.guru} terpilih={pilGuru} onPilih={setPilGuru} />
              {adaTendik && <Pilihan kat="tendik" nomor={3} daftar={daftarTendik} urut={urut.tendik} terpilih={pilTendik} onPilih={setPilTendik} />}

              <div className="hg-kirim box" role="region" aria-label="Ringkasan pilihan">
                <div className="hg-ring">
                  <span className={pilGuru ? 'ok' : ''}>
                    Guru: <b>{pilGuru ? pilGuru.nama : 'belum dipilih'}</b>
                  </span>
                  {adaTendik && (
                    <span className={pilTendik ? 'ok' : ''}>
                      Tendik: <b>{pilTendik ? pilTendik.nama : 'belum dipilih'}</b>
                    </span>
                  )}
                </div>
                <button type="button" className="btn btn-primary" disabled={!siap} onClick={() => setKonfirmasi(true)}>
                  Kirim suara
                </button>
              </div>
            </>
          )}
        </>
      )}

      <dialog
        ref={dlg}
        className="hg-dlg"
        aria-label="Konfirmasi pilihan"
        onClose={() => !proses && setKonfirmasi(false)}
        onClick={(e) => e.target === dlg.current && !proses && dlg.current.close()}
      >
        {konfirmasi && pilGuru && (
          <div className="hg-dlg-in">
            <h3>Kirim pilihan ini?</h3>
            <div className="hg-dlg-dua">
              {[
                ['Guru', pilGuru],
                adaTendik ? ['Tendik', pilTendik] : null,
              ]
                .filter(Boolean)
                .map(([label, g]) => (
                  <div key={label} className="hg-dlg-satu">
                    <span className="hg-dlg-foto">
                      <Foto g={g} />
                    </span>
                    <small>{label}</small>
                    <b>{g.nama}</b>
                  </div>
                ))}
            </div>
            <p>Suara tidak bisa diubah setelah dikirim, dan tidak ada yang tahu siapa pemilihnya.</p>
            <div className="hg-dlg-aksi">
              <button type="button" className="btn btn-ghost" disabled={proses} onClick={() => setKonfirmasi(false)}>
                Ubah
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
