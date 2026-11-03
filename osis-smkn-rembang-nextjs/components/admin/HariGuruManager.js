'use client';

import { useEffect, useRef, useState } from 'react';
import { acak, api, bersihkanFile, buatSlug, unggah } from './api';
import { Field, Spinner, useAdminUi } from './ui';

// "bu-siti_rahayu.jpg" -> "Bu Siti Rahayu" (admin tinggal memperbaiki jika perlu)
const namaDariFile = (n) =>
  n
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[-_.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\p{L}/gu, (c) => c.toUpperCase());

const idBaru = (nama, awalan) => `${buatSlug(nama) || awalan}-${acak(4)}`;
// ID kelas dibuat dari namanya (X TITL 2 -> x-titl-2) supaya link kelas mudah dibaca dan dihafal.
const HURUF = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // tanpa 0/O, 1/I/L agar tidak tertukar
const kodeAcak = (ada = new Set()) => {
  for (;;) {
    let s = '';
    while (s.length < 6) {
      const [x] = crypto.getRandomValues(new Uint8Array(1));
      if (x < 248) s += HURUF[x % HURUF.length];
    }
    if (!ada.has(s)) return s;
  }
};
const kodeSudah = (daftar) => new Set(daftar.map((k) => k.kode).filter(Boolean));
const idKelas = (nama, ada) => {
  const dasar = buatSlug(nama) || 'kelas';
  let id = dasar;
  while (ada.has(id)) id = `${dasar}-${acak(2)}`;
  return id;
};

// Kelas SMK Negeri Rembang: jurusan -> jumlah kelas di tingkat X, XI, XII.
const JURUSAN = [
  ['TKI', [2, 2, 2]],
  ['TPM', [4, 4, 4]],
  ['TKR', [2, 2, 2]],
  ['TITL', [2, 2, 2]],
  ['DPB', [1, 2, 2]],
];
const TINGKAT = ['X', 'XI', 'XII'];

function FotoGuru({ path, mediaBase, onPilih, proses }) {
  const input = useRef(null);
  return (
    <>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { onPilih(e.target.files[0]); e.target.value = ''; }} />
      <button type="button" className="hga-foto" onClick={() => input.current.click()} aria-label={path ? 'Ganti foto guru' : 'Unggah foto guru'} title={path ? 'Ganti foto' : 'Unggah foto'}>
        {path ? (
          <img src={mediaBase + path} alt="" loading="lazy" />
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
        <span className="hga-ganti">{path ? 'Ganti' : 'Unggah'}</span>
      </button>
    </>
  );
}

const Cek = ({ checked, onChange, judul, isi }) => (
  <label className="hga-cek">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    <span>
      <b>{judul}</b>
      <small>{isi}</small>
    </span>
  </label>
);

export default function HariGuruManager({ data, mediaBase, onSimpan }) {
  const { toast, tanya } = useAdminUi();
  const [f, setF] = useState(() => {
    const kelas = data.kelas.map((k) => ({ ...k }));
    kelas.forEach((k) => {
      if (!k.kode) k.kode = kodeAcak(kodeSudah(kelas)); // kelas lama tanpa kode dibuatkan otomatis, tinggal disimpan
    });
    return { ...data, guru: data.guru.map((g) => ({ ...g })), kelas };
  });
  const [menyimpan, setMenyimpan] = useState(false);
  const [proses, setProses] = useState(null); // unggah massal: { selesai, total }
  const [fotoProses, setFotoProses] = useState(null); // id guru yang sedang unggah foto
  const [rekap, setRekap] = useState(null);
  const [memuat, setMemuat] = useState(false);
  const [kNama, setKNama] = useState('');
  const [kKuota, setKKuota] = useState('35');
  const [massal, setMassal] = useState(false);
  const [teksKelas, setTeksKelas] = useState('');
  const unggahBaru = useRef([]);
  const massalInput = useRef(null);

  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const berubah = JSON.stringify(f) !== JSON.stringify({ ...data, guru: data.guru, kelas: data.kelas });

  async function muat() {
    setMemuat(true);
    try {
      setRekap(await api('/api/admin/hari-guru'));
    } catch (e) {
      toast(e.message, 'err');
    } finally {
      setMemuat(false);
    }
  }
  useEffect(() => {
    muat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Guru ----------
  const ubahGuru = (id, k, v) => set('guru', f.guru.map((g) => (g.id === id ? { ...g, [k]: v } : g)));

  async function fotoSatu(id, file) {
    if (!file) return;
    setFotoProses(id);
    try {
      const p = await unggah(file, 'hariguru', 900);
      unggahBaru.current.push(p);
      setF((x) => ({ ...x, guru: x.guru.map((g) => (g.id === id ? { ...g, foto: p } : g)) }));
    } catch (e) {
      toast(e.message, 'err');
    } finally {
      setFotoProses(null);
    }
  }

  async function unggahMassal(files) {
    const list = Array.from(files || []);
    if (!list.length) return;
    let ok = 0;
    for (let i = 0; i < list.length; i++) {
      setProses({ selesai: i, total: list.length });
      try {
        const p = await unggah(list[i], 'hariguru', 900);
        unggahBaru.current.push(p);
        const nama = namaDariFile(list[i].name) || 'Guru';
        setF((x) => ({ ...x, guru: [...x.guru, { id: idBaru(nama, 'guru'), nama, mapel: '', foto: p }] }));
        ok++;
      } catch (e) {
        toast(e.message, 'err');
      }
    }
    setProses(null);
    if (massalInput.current) massalInput.current.value = '';
    if (ok) toast(`${ok} foto guru ditambahkan. Periksa dan perbaiki nama masing-masing, lalu simpan.`);
  }

  const tambahGuru = () => set('guru', [...f.guru, { id: idBaru('', 'guru'), nama: '', mapel: '', foto: null }]);

  // ---------- Kelas ----------
  const ubahKelas = (id, k, v) => set('kelas', f.kelas.map((x) => (x.id === id ? { ...x, [k]: v } : x)));
  const adaKelas = (nama, daftar = f.kelas) => daftar.some((k) => k.nama.trim().toLowerCase() === nama.trim().toLowerCase());

  function tambahKelas() {
    const nama = kNama.trim();
    const kuota = Number(kKuota);
    if (!nama) return toast('Nama kelas wajib diisi.', 'err');
    if (!Number.isInteger(kuota) || kuota < 1) return toast('Jumlah siswa harus berupa angka minimal 1.', 'err');
    if (adaKelas(nama)) return toast(`Kelas "${nama}" sudah ada.`, 'err');
    set('kelas', [...f.kelas, { id: idKelas(nama, new Set(f.kelas.map((x) => x.id))), nama, kuota, kode: kodeAcak(kodeSudah(f.kelas)) }]);
    setKNama('');
  }

  // Satu kelas per baris: "XI TMP 1, 35". Tanpa koma, jumlah siswa memakai isian di atas.
  function tambahMassal() {
    const baru = [];
    let lewat = 0;
    for (const baris of teksKelas.split('\n')) {
      const b = baris.trim();
      if (!b) continue;
      const bagian = b.split(/[,;\t=]/).map((s) => s.trim());
      const nama = bagian[0];
      const kuota = bagian[1] ? Number(bagian[1]) : Number(kKuota);
      if (!nama || !Number.isInteger(kuota) || kuota < 1 || kuota > 500 || adaKelas(nama, [...f.kelas, ...baru])) {
        lewat++;
        continue;
      }
      baru.push({ id: idKelas(nama, new Set([...f.kelas, ...baru].map((x) => x.id))), nama, kuota, kode: kodeAcak(kodeSudah([...f.kelas, ...baru])) });
    }
    if (!baru.length) return toast('Tidak ada kelas baru yang bisa ditambahkan (kosong, ganda, atau jumlah siswa tidak valid).', 'err');
    set('kelas', [...f.kelas, ...baru]);
    setTeksKelas('');
    setMassal(false);
    toast(`${baru.length} kelas ditambahkan${lewat ? `, ${lewat} baris dilewati` : ''}.`);
  }

  // Membuat semua kelas SMKN Rembang sekaligus. Kelas yang sudah ada dilewati. Jumlah siswa diisi dari kolom "Jumlah siswa", lalu disesuaikan per kelas.
  function isiOtomatis() {
    const kuota = Number(kKuota);
    if (!Number.isInteger(kuota) || kuota < 1) return toast('Isi dulu kolom "Jumlah siswa" dengan angka, lalu sesuaikan per kelas.', 'err');
    const baru = [];
    JURUSAN.forEach(([j, jml]) =>
      TINGKAT.forEach((t, i) => {
        for (let n = 1; n <= jml[i]; n++) {
          const nama = `${t} ${j} ${n}`;
          if (adaKelas(nama, [...f.kelas, ...baru])) continue;
          baru.push({ id: idKelas(nama, new Set([...f.kelas, ...baru].map((x) => x.id))), nama, kuota, kode: kodeAcak(kodeSudah([...f.kelas, ...baru])) });
        }
      })
    );
    if (!baru.length) return toast('Semua kelas sudah ada di daftar.');
    set('kelas', [...f.kelas, ...baru]);
    toast(`${baru.length} kelas ditambahkan dengan kuota ${kuota}. Sesuaikan jumlah siswa tiap kelas, lalu simpan.`);
  }

  async function salin(teks, pesan) {
    try {
      await navigator.clipboard.writeText(teks);
      toast(pesan);
    } catch (e) {
      toast('Gagal menyalin. Salin manual dari daftar kode.', 'err');
    }
  }

  const acakUlang = (id) => {
    const ada = kodeSudah(f.kelas.filter((x) => x.id !== id));
    ubahKelas(id, 'kode', kodeAcak(ada));
  };

  const salinKode = (k) => salin(`Kode voting Guru Terfavorit kelas ${k.nama}: ${k.kode}\nBuka ${window.location.origin}/hari-guru lalu masukkan kode ini.`, `Kode kelas ${k.nama} disalin.`);
  const salinSemua = () => salin(`Kode voting Guru Terfavorit\nBuka ${window.location.origin}/hari-guru\n\n${data.kelas.map((k) => `${k.nama}: ${k.kode}`).join('\n')}`, 'Semua kode kelas disalin.');

  // Daftar kode untuk dicetak (bisa dibuka di Excel).
  function unduhCsv() {
    const baris = ['Kelas,Jumlah siswa,Kode', ...data.kelas.map((k) => `"${k.nama}",${k.kuota},${k.kode}`)];
    const url = URL.createObjectURL(new Blob([baris.join('\n')], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kode-voting-hari-guru.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const urutkanKelas = () => set('kelas', [...f.kelas].sort((a, b) => a.nama.localeCompare(b.nama, 'id', { numeric: true, sensitivity: 'base' })));

  // ---------- Simpan ----------
  async function simpan() {
    const nilai = {
      judul: f.judul.trim(),
      deskripsi: f.deskripsi.trim(),
      buka: f.buka,
      tutup: f.tutup || '',
      tampilHasil: f.tampilHasil,
      kunciPerangkat: f.kunciPerangkat,
      guru: f.guru.map((g) => ({ id: g.id, nama: g.nama.trim(), mapel: (g.mapel || '').trim(), foto: g.foto || null })),
      kelas: f.kelas.map((k) => ({ id: k.id, nama: k.nama.trim(), kuota: Number(k.kuota), kode: (k.kode || '').trim() })),
    };
    if (nilai.guru.some((g) => !g.nama)) return toast('Ada guru yang namanya masih kosong.', 'err');
    setMenyimpan(true);
    try {
      await onSimpan(nilai);
      unggahBaru.current = [];
      setF({ ...nilai, guru: nilai.guru.map((g) => ({ ...g })), kelas: nilai.kelas.map((k) => ({ ...k })) });
      toast('Pengaturan Hari Guru tersimpan.');
      muat();
    } catch (e) {
      toast(e.message, 'err');
    } finally {
      setMenyimpan(false);
    }
  }

  async function batalkan() {
    await bersihkanFile(unggahBaru.current);
    unggahBaru.current = [];
    setF({ ...data, guru: data.guru.map((g) => ({ ...g })), kelas: data.kelas.map((k) => ({ ...k })) });
  }

  // ---------- Reset suara ----------
  async function reset(kelas) {
    const ya = await tanya({
      judul: kelas ? `Reset suara kelas ${kelas.nama}?` : 'Reset semua suara?',
      isi: kelas
        ? 'Semua suara dari kelas ini dihapus dan kuotanya kembali kosong. Tindakan ini tidak bisa dibatalkan.'
        : 'Seluruh suara dari semua kelas dihapus dan voting mulai dari nol. Tindakan ini tidak bisa dibatalkan.',
      tombol: 'Ya, reset',
      bahaya: true,
    });
    if (!ya) return;
    try {
      await api('/api/admin/hari-guru', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(kelas ? { kelas: kelas.id } : {}) });
      toast('Suara direset.');
      muat();
    } catch (e) {
      toast(e.message, 'err');
    }
  }

  // Rekap memakai data yang sudah tersimpan (nama guru dan kelas sesuai database).
  const peringkat = rekap ? data.guru.map((g) => ({ ...g, n: rekap.perGuru[g.id] || 0 })).sort((a, b) => b.n - a.n || a.nama.localeCompare(b.nama, 'id')) : [];
  const maks = peringkat[0]?.n || 0;

  return (
    <div className="adm-panel">
      <div className="adm-head">
        <div>
          <h1>Hari Guru Nasional</h1>
          <p>Kelola voting guru terfavorit: foto dan nama guru, daftar kelas beserta jumlah siswanya, dan hasil suara.</p>
        </div>
        <a className="btn btn-ghost" href="/hari-guru" target="_blank" rel="noopener noreferrer">
          Lihat halaman voting
        </a>
      </div>

      {/* ---------- Hasil ---------- */}
      <div className="adm-card box">
        <div className="hga-top">
          <h2 className="adm-h2">Hasil suara sementara</h2>
          <div className="adm-act">
            <button type="button" className="btn btn-ghost btn-sm" onClick={muat} disabled={memuat}>
              {memuat && <Spinner />} Muat ulang
            </button>
            <button type="button" className="btn btn-danger-ghost btn-sm" onClick={() => reset(null)} disabled={!rekap || rekap.total === 0}>
              Reset semua
            </button>
          </div>
        </div>
        {!rekap ? (
          <p className="adm-sub">{memuat ? 'Memuat hasil...' : 'Hasil belum bisa dimuat. Pastikan supabase-setup.sql terbaru sudah dijalankan.'}</p>
        ) : data.guru.length === 0 ? (
          <p className="adm-sub">Belum ada guru tersimpan.</p>
        ) : (
          <>
            <p className="adm-sub">
              Total {rekap.total} suara dari {data.kelas.reduce((s, k) => s + k.kuota, 0)} siswa (sesuai kuota seluruh kelas). Hanya admin yang melihat ini selama voting berjalan.
            </p>
            <ol className="hga-rank">
              {peringkat.map((g, i) => (
                <li key={g.id}>
                  <span className="hg-no">{i + 1}</span>
                  <span className="hga-mini">{g.foto ? <img src={mediaBase + g.foto} alt="" /> : null}</span>
                  <span className="hg-nm">
                    <b>{g.nama}</b>
                    <span className="hg-bar" aria-hidden="true">
                      <i style={{ width: maks ? `${(g.n / maks) * 100}%` : 0 }} />
                    </span>
                  </span>
                  <span className="hg-n">{g.n}</span>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>

      {/* ---------- Pengaturan ---------- */}
      <div className="adm-card box">
        <h2 className="adm-h2">Pengaturan voting</h2>
        <Field label="Judul halaman">
          <input className="in" value={f.judul} maxLength={80} onChange={(e) => set('judul', e.target.value)} />
        </Field>
        <Field label="Deskripsi singkat">
          <textarea className="in" rows={3} maxLength={500} value={f.deskripsi} onChange={(e) => set('deskripsi', e.target.value)} />
        </Field>
        <Field label="Tutup otomatis (opsional)" hint="Waktu WIB. Kosongkan jika voting hanya ditutup manual.">
          <input className="in" type="datetime-local" value={f.tutup} onChange={(e) => set('tutup', e.target.value)} />
        </Field>
        <div className="hga-ceks">
          <Cek checked={f.buka} onChange={(v) => set('buka', v)} judul="Voting dibuka" isi="Siswa bisa memilih. Matikan untuk menutup voting kapan saja." />
          <Cek checked={f.kunciPerangkat} onChange={(v) => set('kunciPerangkat', v)} judul="Satu perangkat, satu suara per kelas" isi="Mencegah satu HP memilih berkali-kali dengan kode kelas yang sama. Matikan jika siswa bergantian memakai komputer yang sama." />
          <Cek checked={f.tampilHasil} onChange={(v) => set('tampilHasil', v)} judul="Tampilkan hasil ke publik setelah voting ditutup" isi="Peringkat guru tampil di halaman voting setelah voting ditutup. Selama voting berjalan hasil tetap tersembunyi." />
        </div>
      </div>

      {/* ---------- Guru ---------- */}
      <div className="adm-card box">
        <div className="hga-top">
          <h2 className="adm-h2">Calon guru ({f.guru.length})</h2>
          <div className="adm-act">
            <input ref={massalInput} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => unggahMassal(e.target.files)} />
            <button type="button" className="btn btn-primary btn-sm" disabled={!!proses} onClick={() => massalInput.current.click()}>
              {proses ? <Spinner /> : null} {proses ? `Mengunggah ${proses.selesai + 1} dari ${proses.total}...` : 'Unggah banyak foto sekaligus'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={tambahGuru}>
              Tambah satu guru
            </button>
          </div>
        </div>
        <p className="adm-sub">Tips: pilih banyak foto sekaligus. Nama guru terisi otomatis dari nama file (misalnya &quot;bu-siti.jpg&quot; menjadi &quot;Bu Siti&quot;), tinggal diperbaiki. Menghapus guru juga menghapus suaranya dari hasil.</p>
        {f.guru.length === 0 ? (
          <p className="empty">Belum ada guru. Unggah foto guru untuk memulai.</p>
        ) : (
          <ul className="adm-list">
            {f.guru.map((g) => (
              <li key={g.id} className="hga-row box">
                <FotoGuru path={g.foto} mediaBase={mediaBase} proses={fotoProses === g.id} onPilih={(file) => fotoSatu(g.id, file)} />
                <div className="hga-fields">
                  <input className="in" placeholder="Nama guru" aria-label="Nama guru" maxLength={80} value={g.nama} onChange={(e) => ubahGuru(g.id, 'nama', e.target.value)} />
                  <input className="in" placeholder="Mata pelajaran (opsional)" aria-label="Mata pelajaran" maxLength={80} value={g.mapel || ''} onChange={(e) => ubahGuru(g.id, 'mapel', e.target.value)} />
                </div>
                <button type="button" className="btn btn-danger-ghost btn-sm" onClick={() => set('guru', f.guru.filter((x) => x.id !== g.id))} aria-label={`Hapus ${g.nama || 'guru'}`}>
                  Hapus
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ---------- Kelas ---------- */}
      <div className="adm-card box">
        <div className="hga-top">
          <h2 className="adm-h2">Kelas dan kuota suara ({f.kelas.length})</h2>
          <div className="adm-act">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setMassal((v) => !v)}>
              {massal ? 'Tutup tempel banyak' : 'Tempel banyak kelas'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={isiOtomatis}>
              Isi semua kelas SMKN Rembang
            </button>
            {data.kelas.length > 0 && (
              <>
                <button type="button" className="btn btn-primary btn-sm" onClick={salinSemua} disabled={berubah}>
                  Salin semua kode
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={unduhCsv} disabled={berubah}>
                  Unduh kode (CSV)
                </button>
              </>
            )}
            {f.kelas.length > 1 && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={urutkanKelas}>
                Urutkan A-Z
              </button>
            )}
          </div>
        </div>
        <p className="adm-sub">Setiap kelas punya satu kode (contoh HW2K7M). Semua siswa memakai satu link, /hari-guru, lalu memasukkan kode kelasnya. Jumlah siswa menjadi kuota suara: setelah penuh, kode kelas itu tidak berlaku lagi. Bagikan kode hanya ke wali kelas atau kelas yang bersangkutan.</p>

        <div className="hga-add">
          <Field label="Nama kelas">
            <input className="in" value={kNama} maxLength={40} placeholder="Contoh: XI TMP 1" onChange={(e) => setKNama(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), tambahKelas())} />
          </Field>
          <Field label="Jumlah siswa">
            <input className="in" type="number" min={1} max={500} value={kKuota} onChange={(e) => setKKuota(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), tambahKelas())} />
          </Field>
          <button type="button" className="btn btn-primary" onClick={tambahKelas}>
            Tambah
          </button>
        </div>

        {massal && (
          <div className="hga-massal">
            <Field label="Satu kelas per baris" hint="Format: nama kelas, jumlah siswa. Contoh: XI TMP 1, 35. Tanpa koma, jumlah siswa memakai isian di atas.">
              <textarea className="in" rows={6} value={teksKelas} onChange={(e) => setTeksKelas(e.target.value)} placeholder={'X TKJ 1, 36\nXI TMP 1, 35\nXII RPL 2, 34'} />
            </Field>
            <button type="button" className="btn btn-ghost" onClick={tambahMassal}>
              Tambahkan ke daftar
            </button>
          </div>
        )}

        {f.kelas.length === 0 ? (
          <p className="empty">Belum ada kelas.</p>
        ) : (
          <ul className="adm-list">
            {f.kelas.map((k) => {
              const simpanan = data.kelas.find((x) => x.id === k.id);
              const terisi = rekap?.perKelas[k.id] || 0;
              return (
                <li key={k.id} className="hga-krow box">
                  <input className="in" aria-label="Nama kelas" maxLength={40} value={k.nama} onChange={(e) => ubahKelas(k.id, 'nama', e.target.value)} />
                  <label className="hga-kuota">
                    <input className="in" type="number" min={1} max={500} aria-label={`Jumlah siswa ${k.nama}`} value={k.kuota} onChange={(e) => ubahKelas(k.id, 'kuota', e.target.value)} />
                    <span>siswa</span>
                  </label>
                  <span className="hga-kd">
                    <input className="in hga-kode" aria-label={`Kode kelas ${k.nama}`} maxLength={10} value={k.kode || ''} onChange={(e) => ubahKelas(k.id, 'kode', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} />
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => acakUlang(k.id)} title="Buat kode acak baru">
                      Acak
                    </button>
                  </span>
                  <span className="hga-terisi" title="Suara yang sudah masuk">
                    {simpanan ? `${terisi}/${simpanan.kuota} memilih` : 'baru'}
                  </span>
                  <div className="adm-act">
                    {simpanan && simpanan.kode && (
                      <button type="button" className="btn btn-ghost btn-sm" disabled={berubah} onClick={() => salinKode(simpanan)}>
                        Salin kode
                      </button>
                    )}
                    {simpanan && terisi > 0 && (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => reset(simpanan)}>
                        Reset suara
                      </button>
                    )}
                    <button type="button" className="btn btn-danger-ghost btn-sm" onClick={() => set('kelas', f.kelas.filter((x) => x.id !== k.id))} aria-label={`Hapus ${k.nama}`}>
                      Hapus
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className={`adm-bar${berubah ? ' aktif' : ''}`}>
        <span className="adm-dirty">{berubah ? 'Ada perubahan yang belum disimpan' : 'Semua perubahan sudah tersimpan'}</span>
        <button type="button" className="btn btn-ghost" disabled={!berubah || menyimpan} onClick={batalkan}>
          Batalkan
        </button>
        <button type="button" className="btn btn-primary" disabled={!berubah || menyimpan} onClick={simpan}>
          {menyimpan && <Spinner />} {menyimpan ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </div>
  );
}
