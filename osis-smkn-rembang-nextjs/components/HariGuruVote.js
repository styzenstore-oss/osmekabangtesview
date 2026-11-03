'use client';

import Image from 'next/image';
import Link from 'next/link';
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

function Foto({ g, ukuran = 400 }) {
  return g.foto ? (
    <Image src={g.foto} alt={`Foto ${g.nama}`} width={ukuran} height={Math.round(ukuran * 1.25)} />
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
              <Foto g={g} ukuran={120} />
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

// Mengelompokkan kelas per jurusan: "X TITL 2" -> TITL. Tingkat (X, XI, XII) dipertahankan urutannya dari daftar.
function kelompokJurusan(kelas) {
  const peta = new Map();
  kelas.forEach((k) => {
    const m = k.nama.match(/^(XII|XI|X)\s+(.+?)\s*\d*$/i);
    const j = m ? m[2].toUpperCase() : 'Lainnya';
    if (!peta.has(j)) peta.set(j, []);
    peta.get(j).push(k);
  });
  return [...peta.entries()];
}

export default function HariGuruVote({ data, tetap }) {
  const [kelas, setKelas] = useState(data.kelas);
  const [sudah, setSudah] = useState(data.sudah);
  const [buka, setBuka] = useState(data.buka);
  const [kelasId] = useState(tetap || '');
  const [urut, setUrut] = useState([]);
  const [pilihan, setPilihan] = useState(null);
  const [proses, setProses] = useState(false);
  const [galat, setGalat] = useState('');
  const [selesai, setSelesai] = useState(null);
  const dlg = useRef(null);

  const k = kelas.find((x) => x.id === kelasId) || null;
  const penuh = k ? k.terisi >= k.kuota : false;
  const terkunci = k ? sudah.includes(k.id) : false;

  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (pilihan && !d.open) d.showModal();
    if (!pilihan && d.open) d.close();
  }, [pilihan]);

  // Urutan guru diacak agar tidak ada guru yang selalu di posisi pertama (dilakukan di browser agar tidak beda dengan server).
  useEffect(() => {
    if (tetap) setUrut(acakUrut(data.guru));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function kirim() {
    if (!k || !pilihan || proses) return;
    setProses(true);
    setGalat('');
    try {
      const res = await fetch('/api/hari-guru/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kelas: k.id, guru: pilihan.id }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok) {
        setKelas((l) => l.map((x) => (x.id === k.id ? { ...x, terisi: Math.min(j.jumlah, x.kuota) } : x)));
        if (data.kunciPerangkat) setSudah((s) => [...new Set([...s, k.id])]);
        setSelesai({ guru: pilihan, kelas: k.nama });
      } else {
        setGalat(j.error || 'Suara gagal dikirim. Coba lagi.');
        if (j.kode === 'penuh') setKelas((l) => l.map((x) => (x.id === k.id ? { ...x, terisi: x.kuota } : x)));
        if (j.kode === 'sudah') setSudah((s) => [...new Set([...s, k.id])]);
        if (j.kode === 'tutup') setBuka(false);
      }
    } catch (e) {
      setGalat('Tidak ada koneksi. Periksa internet lalu coba lagi.');
    } finally {
      setProses(false);
      setPilihan(null);
    }
  }

  const persen = k ? Math.min(100, Math.round((k.terisi / k.kuota) * 100)) : 0;

  return (
    <div className="hg">
      {data.hasil && <Hasil guru={data.guru} hasil={data.hasil} />}

      {!buka && !data.hasil && <p className="empty">Voting sedang tidak dibuka. Pantau terus website OSIS untuk informasinya.</p>}

      {buka && !tetap && (
        <div className="hg-pilih box">
          <b>Pilih kelasmu</b>
          <span className="hg-sub">Setiap kelas punya link sendiri. Pilih kelasmu untuk mulai memilih. Pilihanmu anonim, setiap siswa memilih satu kali.</span>
          {kelompokJurusan(kelas).map(([jurusan, daftar]) => (
            <div key={jurusan} className="hg-jur">
              <h3>{jurusan}</h3>
              <ul>
                {daftar.map((x) => (
                  <li key={x.id}>
                    <Link className="hg-kls" href={`/hari-guru/${x.id}`}>
                      {x.nama}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {data.tutup && <p className="hg-sub">Voting ditutup {waktu(data.tutup)}.</p>}
        </div>
      )}

      {buka && tetap && k && (
        <>
          <div className="hg-pilih box">
            <h2 className="hg-kelas">Kelas {k.nama}</h2>
            <span className="hg-sub">Pilihanmu anonim. Nama dan identitasmu tidak disimpan. Setiap siswa memilih satu kali.</span>
            <div className="hg-prog">
              <div className="hg-prog-t">
                <span>
                  <b>{k.terisi}</b> dari {k.kuota} siswa sudah memilih
                </span>
                <span>{persen}%</span>
              </div>
              <span className="hg-bar big" role="progressbar" aria-valuemin={0} aria-valuemax={k.kuota} aria-valuenow={k.terisi}>
                <i style={{ width: `${persen}%` }} />
              </span>
            </div>
            {data.tutup && <p className="hg-sub">Voting ditutup {waktu(data.tutup)}.</p>}
          </div>

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
              {!data.kunciPerangkat && (
                <button type="button" className="btn btn-ghost" onClick={() => setSelesai(null)}>
                  Teman sekelas memilih juga
                </button>
              )}
            </div>
          )}

          {k && !selesai && terkunci && <p className="empty">Perangkat ini sudah dipakai memilih untuk kelas {k.nama}. Setiap siswa hanya boleh memilih satu kali.</p>}
          {k && !selesai && !terkunci && penuh && <p className="empty">Kuota suara kelas {k.nama} sudah terpenuhi ({k.kuota} dari {k.kuota} siswa). Jika kamu belum sempat memilih, segera lapor ke pengurus OSIS.</p>}

          {k && !selesai && !terkunci && !penuh && (
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
              <Foto g={pilihan} ukuran={240} />
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
