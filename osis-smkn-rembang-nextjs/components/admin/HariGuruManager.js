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

// Nama file bawaan kamera/screenshot/WhatsApp (misalnya "image.png", "IMG_2034.jpg") bukan nama guru.
const namaFileGenerik = (n) => {
  const dasar = n.replace(/\.[a-z0-9]+$/i, '').trim();
  return !/\p{L}{3,}/u.test(dasar) || /^(image|img|screenshot|screen shot|whatsapp|wa\d|photo|foto|pasted|unnamed|dsc|cam|pxl)/i.test(dasar);
};

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

function FotoGuru({ path, mediaBase, onPilih, proses, belum }) {
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
        {belum && <span className="hga-belum">Belum disimpan</span>}
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

const KATEGORI = {
  guru: { nama: 'guru', judul: 'Calon guru', mapel: 'Mata pelajaran (opsional)', kosong: 'Belum ada guru. Unggah foto guru untuk memulai.' },
  tendik: { nama: 'tendik', judul: 'Calon tendik (tenaga kependidikan)', mapel: 'Jabatan (opsional), misalnya Kepala TU', kosong: 'Belum ada tendik. Kosongkan jika tidak ada pemilihan tendik.' },
};
const normData = (d) => ({ ...d, guru: d.guru.map((g) => ({ ...g, kategori: g.kategori === 'tendik' ? 'tendik' : 'guru' })), kelas: d.kelas });

export default function HariGuruManager({ data, mediaBase, onSimpan }) {
  const { toast, tanya } = useAdminUi();
  const [f, setF] = useState(() => {
    const kelas = data.kelas.map((k) => ({ ...k }));
    kelas.forEach((k) => {
      if (!k.kode) k.kode = kodeAcak(kodeSudah(kelas)); // kelas lama tanpa kode dibuatkan otomatis, tinggal disimpan
    });
    return { ...normData(data), kelas };
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
  const massalInput = useRef({});

  const fRef = useRef(f);
  fRef.current = f;
  const [seret, setSeret] = useState(null); // kategori yang sedang ketiban seretan file
  const [tempel, setTempel] = useState({ guru: false, tendik: false });
  const [teks, setTeks] = useState({ guru: '', tendik: '' });
  const [aktif, setAktif] = useState('guru'); // tujuan Ctrl+V
  const aktifRef = useRef('guru');
  const [centang, setCentang] = useState([]); // id calon yang dicentang untuk dipindah kategori
  const pilihAktif = (k) => {
    aktifRef.current = k;
    setAktif(k);
  };
  const massalRef = useRef(null);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const berubah = JSON.stringify(f) !== JSON.stringify(normData(data));

  // Ctrl+V: foto yang disalin (dari screenshot, WhatsApp Web, galeri, dan sebagainya) langsung ditambahkan sebagai guru.
  useEffect(() => {
    const saatTempel = (e) => {
      const files = Array.from(e.clipboardData?.files || []).filter((x) => x.type.startsWith('image/'));
      if (!files.length) return;
      e.preventDefault();
      massalRef.current?.(files, aktifRef.current);
    };
    window.addEventListener('paste', saatTempel);
    return () => window.removeEventListener('paste', saatTempel);
  }, []);

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
      toast('Foto terunggah. Tekan Simpan agar tampil di website dan di HP lain.');
    } catch (e) {
      toast(e.message, 'err');
    } finally {
      setFotoProses(null);
    }
  }

  // Unggah banyak foto sekaligus (3 foto diunggah bersamaan agar cepat).
  // Foto yang nama filenya cocok dengan nama guru yang sudah ada langsung dipasang ke guru itu (misalnya "bu-siti.jpg" untuk "Bu Siti").
  // Sisanya menjadi guru baru dengan nama dari nama file.
  async function unggahMassal(files, kat = 'guru') {
    const list = Array.from(files || []).filter((x) => /^image\//.test(x.type) || /\.(jpe?g|png|webp)$/i.test(x.name));
    if (!list.length) return toast('Pilih file foto JPG, PNG, atau WebP.', 'err');
    const hasil = new Array(list.length).fill(null);
    let selesai = 0;
    let giliran = 0;
    setProses({ selesai: 0, total: list.length });
    async function pekerja() {
      while (giliran < list.length) {
        const i = giliran++;
        try {
          const p = await unggah(list[i], 'hariguru', 900);
          unggahBaru.current.push(p);
          hasil[i] = p;
        } catch (e) {
          toast(`${list[i].name}: ${e.message}`, 'err');
        }
        selesai++;
        setProses({ selesai, total: list.length });
      }
    }
    await Promise.all([pekerja(), pekerja(), pekerja()]);

    const guru = fRef.current.guru.map((g) => ({ ...g }));
    let cocok = 0;
    let baru = 0;
    list.forEach((file, i) => {
      const p = hasil[i];
      if (!p) return;
      const nama = namaFileGenerik(file.name) ? '' : namaDariFile(file.name);
      const s = buatSlug(nama);
      const target = guru.find((g) => {
        if (g.kategori !== kat) return false;
        const gs = buatSlug(g.nama);
        if (!gs || !s) return false;
        if (gs === s) return true;
        return !g.foto && Math.min(gs.length, s.length) >= 4 && (gs.includes(s) || s.includes(gs));
      });
      if (target) {
        target.foto = p;
        cocok++;
      } else {
        guru.push({ id: idBaru(nama, kat), nama, mapel: '', kategori: kat, foto: p });
        baru++;
      }
    });
    setF((x) => ({ ...x, guru }));
    setProses(null);
    if (massalInput.current[kat]) massalInput.current[kat].value = '';
    if (cocok + baru) {
      toast(`${kat === 'tendik' ? '[Tendik] ' : ''}${cocok ? `${cocok} foto dipasang ke nama yang cocok. ` : ''}${baru ? `${baru} baru ditambahkan, isi atau periksa namanya. ` : ''}Tekan Simpan agar tampil di website.`);
    }
  }

  massalRef.current = unggahMassal;

  // Tempel daftar nama: satu orang per baris, "Nama, Mata pelajaran/Jabatan" (bagian kedua boleh dikosongkan).
  function tambahNama(kat) {
    const ada = new Set(f.guru.filter((g) => g.kategori === kat).map((g) => g.nama.trim().toLowerCase()));
    const baru = [];
    for (const baris of teks[kat].split('\n')) {
      const [nama, mapel = ''] = baris.split(/[,;\t]/).map((x) => x.trim());
      if (!nama || ada.has(nama.toLowerCase())) continue;
      ada.add(nama.toLowerCase());
      baru.push({ id: idBaru(nama, kat), nama: nama.slice(0, 80), mapel: mapel.slice(0, 80), kategori: kat, foto: null });
    }
    if (!baru.length) return toast('Tidak ada nama baru (kosong atau sudah ada di daftar).', 'err');
    set('guru', [...f.guru, ...baru]);
    setTeks((x) => ({ ...x, [kat]: '' }));
    setTempel((x) => ({ ...x, [kat]: false }));
    toast(`${baru.length} ${KATEGORI[kat].nama} ditambahkan. Sekarang unggah fotonya: nama file yang sama dengan namanya akan terpasang otomatis.`);
  }

  const toggleCentang = (id) => setCentang((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  function pilihSemua(kat) {
    const ids = f.guru.filter((g) => g.kategori === kat).map((g) => g.id);
    const semua = ids.every((i) => centang.includes(i));
    setCentang((c) => (semua ? c.filter((x) => !ids.includes(x)) : [...new Set([...c, ...ids])]));
  }
  // Memindahkan calon yang dicentang ke kategori lain tanpa mengunggah ulang foto atau mengisi ulang data.
  function pindahkan(kat) {
    const lawan = kat === 'guru' ? 'tendik' : 'guru';
    const ids = centang.filter((id) => f.guru.find((g) => g.id === id)?.kategori === kat);
    if (!ids.length) return;
    set('guru', f.guru.map((g) => (ids.includes(g.id) ? { ...g, kategori: lawan } : g)));
    setCentang((c) => c.filter((x) => !ids.includes(x)));
    toast(`${ids.length} dipindahkan ke ${lawan}. Tekan Simpan agar tersimpan.`);
  }

  const tambahGuru = (kat) => set('guru', [...f.guru, { id: idBaru('', kat), nama: '', mapel: '', kategori: kat, foto: null }]);

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
      guru: f.guru.map((g) => ({ id: g.id, nama: g.nama.trim(), mapel: (g.mapel || '').trim(), kategori: g.kategori, foto: g.foto || null })),
      kelas: f.kelas.map((k) => ({ id: k.id, nama: k.nama.trim(), kuota: Number(k.kuota), kode: (k.kode || '').trim() })),
    };
    if (nilai.guru.some((g) => !g.nama)) return toast('Ada guru atau tendik yang namanya masih kosong.', 'err');
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
    setF({ ...normData(data), guru: normData(data).guru.map((g) => ({ ...g })), kelas: data.kelas.map((k) => ({ ...k })) });
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
  const rank = (kat) => {
    const list = rekap ? data.guru.filter((g) => (g.kategori === 'tendik' ? 'tendik' : 'guru') === kat).map((g) => ({ ...g, n: rekap.perGuru[g.id] || 0 })).sort((x, y) => y.n - x.n || x.nama.localeCompare(y.nama, 'id')) : [];
    return { list, maks: list[0]?.n || 0 };
  };

  const kartuCalon = (kat) => {
    const K = KATEGORI[kat];
    const daftar = f.guru.filter((g) => g.kategori === kat);
    return (
      <div className="adm-card box hga-calon" data-aktif={aktif === kat} onPointerDownCapture={() => pilihAktif(kat)} onFocusCapture={() => pilihAktif(kat)}>
        <div className="hga-top">
          <h2 className="adm-h2">
            {K.judul} ({daftar.length})
          </h2>
          <div className="adm-act">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTempel((x) => ({ ...x, [kat]: !x[kat] }))}>
              {tempel[kat] ? 'Tutup tempel nama' : 'Tempel daftar nama'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => tambahGuru(kat)}>
              Tambah satu {K.nama}
            </button>
          </div>
        </div>
        <div
          className="drop"
          data-over={seret === kat}
          onDragOver={(e) => {
            e.preventDefault();
            setSeret(kat);
          }}
          onDragLeave={() => setSeret(null)}
          onDrop={(e) => {
            e.preventDefault();
            setSeret(null);
            unggahMassal(e.dataTransfer.files, kat);
          }}
        >
          <input ref={(el) => (massalInput.current[kat] = el)} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => unggahMassal(e.target.files, kat)} />
          <button type="button" className="btn btn-primary" disabled={!!proses} onClick={() => massalInput.current[kat].click()}>
            {proses ? <Spinner /> : null} {proses ? `Mengunggah ${Math.min(proses.selesai + 1, proses.total)} dari ${proses.total}...` : 'Pilih banyak foto sekaligus'}
          </button>
          <span className="drop-h">
            atau seret atau tempel (Ctrl+V) banyak foto ke sini. Nama file dipakai sebagai nama (&quot;bu-siti.jpg&quot; menjadi &quot;Bu Siti&quot;). Jika nama itu sudah ada di daftar {K.nama}, fotonya langsung dipasang ke orang tersebut.
          </span>
          {proses && (
            <span className="drop-bar" aria-hidden="true">
              <i style={{ transform: `scaleX(${(proses.selesai + 0.4) / proses.total})` }} />
            </span>
          )}
        </div>
        {tempel[kat] && (
          <div className="hga-massal">
            <Field label={`Satu ${K.nama} per baris`} hint={`Format: nama, ${kat === 'tendik' ? 'jabatan' : 'mata pelajaran'} (bagian kedua boleh dikosongkan). Bisa langsung ditempel dari Excel atau WhatsApp.`}>
              <textarea className="in" rows={6} value={teks[kat]} onChange={(e) => setTeks((x) => ({ ...x, [kat]: e.target.value }))} placeholder={kat === 'tendik' ? 'Bu Ida Lestari, Kepala TU\nPak Budi, Penjaga Sekolah\nBu Rina' : 'Bu Tri Wahyuni, Matematika\nPak Andi Wijaya, Bahasa Indonesia\nBu Dewi'} />
            </Field>
            <button type="button" className="btn btn-ghost" onClick={() => tambahNama(kat)}>
              Tambahkan ke daftar
            </button>
          </div>
        )}
        <p className="adm-sub">
          Ctrl+V menempel foto ke kategori yang terakhir Anda klik{aktif === kat ? ' (sekarang: di sini)' : ''}. Ubah kategori lewat pilihan Guru/Tendik di tiap baris, tanpa perlu unggah ulang foto. Sebaiknya sebelum voting dibuka. Menghapus calon juga menghapus suaranya dari hasil.
        </p>
        {daftar.length > 0 && (
          <div className="hga-bulk">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => pilihSemua(kat)}>
              {daftar.every((g) => centang.includes(g.id)) ? 'Batal pilih semua' : 'Pilih semua'}
            </button>
            {daftar.some((g) => centang.includes(g.id)) && (
              <>
                <span>{daftar.filter((g) => centang.includes(g.id)).length} dipilih</span>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => pindahkan(kat)}>
                  Pindahkan ke {kat === 'guru' ? 'Tendik' : 'Guru'}
                </button>
              </>
            )}
          </div>
        )}
        {daftar.length === 0 ? (
          <p className="empty">{K.kosong}</p>
        ) : (
          <ul className="adm-list">
            {daftar.map((g) => (
              <li key={g.id} className="hga-row box">
                <FotoGuru path={g.foto} mediaBase={mediaBase} belum={!!g.foto && unggahBaru.current.includes(g.foto)} proses={fotoProses === g.id} onPilih={(file) => fotoSatu(g.id, file)} />
                <div className="hga-fields">
                  <input className="in" placeholder={`Nama ${K.nama}`} aria-label={`Nama ${K.nama}`} maxLength={80} value={g.nama} onChange={(e) => ubahGuru(g.id, 'nama', e.target.value)} />
                  <input className="in" placeholder={K.mapel} aria-label={kat === 'tendik' ? 'Jabatan' : 'Mata pelajaran'} maxLength={80} value={g.mapel || ''} onChange={(e) => ubahGuru(g.id, 'mapel', e.target.value)} />
                  <div className="hga-pindah">
                    <label className="hga-pil">
                      <input type="checkbox" checked={centang.includes(g.id)} onChange={() => toggleCentang(g.id)} /> Pilih
                    </label>
                    <label className="hga-pil">
                      Kategori
                      <select className="in hga-kat" aria-label={`Kategori ${g.nama || K.nama}`} value={g.kategori} onChange={(e) => ubahGuru(g.id, 'kategori', e.target.value)}>
                        <option value="guru">Guru</option>
                        <option value="tendik">Tendik</option>
                      </select>
                    </label>
                  </div>
                </div>
                <button type="button" className="btn btn-danger-ghost btn-sm" onClick={() => set('guru', f.guru.filter((x) => x.id !== g.id))} aria-label={`Hapus ${g.nama || K.nama}`}>
                  Hapus
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="adm-panel">
      <div className="adm-head">
        <div>
          <h1>Hari Guru Nasional</h1>
          <p>Kelola voting guru dan tendik terfavorit: foto dan nama calon, daftar kelas beserta jumlah siswanya, dan hasil suara.</p>
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
          <p className="adm-sub">Belum ada guru atau tendik tersimpan.</p>
        ) : (
          <>
            <p className="adm-sub">
              {rekap.total} dari {data.kelas.reduce((s, k) => s + k.kuota, 0)} siswa (sesuai kuota seluruh kelas) sudah memilih. Tiap siswa memberi satu suara guru dan satu suara tendik. Hanya admin yang melihat ini selama voting berjalan.
            </p>
            {['guru', 'tendik'].map((kat) => {
              const { list, maks } = rank(kat);
              if (!list.length) return null;
              return (
                <div key={kat} className="hga-rankgrup">
                  <h3>{kat === 'tendik' ? 'Tendik' : 'Guru'}</h3>
                  <ol className="hga-rank">
                    {list.map((g, i) => (
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
                </div>
              );
            })}
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
          <Cek checked={f.tampilHasil} onChange={(v) => set('tampilHasil', v)} judul="Tampilkan hasil ke publik setelah voting ditutup" isi="Peringkat guru dan tendik tampil di halaman voting setelah voting ditutup. Selama voting berjalan hasil tetap tersembunyi." />
        </div>
      </div>

      {kartuCalon('guru')}
      {kartuCalon('tendik')}

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
