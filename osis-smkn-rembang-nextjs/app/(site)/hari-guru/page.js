import { cookies } from 'next/headers';
import Image from 'next/image';
import HariGuruVote from '@/components/HariGuruVote';
import { COOKIE_VOTE, bacaHariGuru, bacaRekap, bacaVoted, votingTerbuka } from '@/lib/hariguru';
import { dbReady, publicUrl } from '@/lib/supabase';

export const metadata = { title: 'Hari Guru Nasional' };
export const dynamic = 'force-dynamic';

export default async function HariGuru() {
  let cfg = null;
  let rekap = null;
  let galat = null;

  if (dbReady()) {
    try {
      cfg = await bacaHariGuru();
      rekap = await bacaRekap(cfg);
    } catch (e) {
      galat = 'Data voting belum bisa dimuat. Coba lagi sebentar.';
    }
  }

  const terbuka = cfg ? votingTerbuka(cfg) : false;
  const sudah = cfg && cfg.kunciPerangkat ? bacaVoted(cookies().get(COOKIE_VOTE)?.value) : [];

  // Data guru dan kelas dikirim ke browser. Jumlah suara per guru hanya dikirim jika admin mengizinkan.
  const data =
    cfg && !galat
      ? {
          buka: terbuka,
          kunciPerangkat: cfg.kunciPerangkat,
          tutup: cfg.tutup || '',
          guru: cfg.guru.map((g) => ({ id: g.id, nama: g.nama, mapel: g.mapel, foto: g.foto ? publicUrl(g.foto) : null })),
          kelas: cfg.kelas.map((k) => ({ id: k.id, nama: k.nama, kuota: k.kuota, terisi: Math.min(rekap.perKelas[k.id] || 0, k.kuota) })),
          sudah,
          hasil: cfg.tampilHasil && !terbuka ? rekap.perGuru : null,
        }
      : null;

  return (
    <>
      <section className="page-head">
        <div className="container">
          <div className="seal">
            <Image src="/emblem-osis.png" width={800} height={800} alt="Logo OSIS SMK Negeri Rembang" />
            <span>
              Hari Guru Nasional
              <br />
              25 November
            </span>
          </div>
          <h1>{cfg?.judul || 'Guru Terfavorit'}</h1>
          <p>{cfg?.deskripsi || 'Pemilihan guru terfavorit dalam rangka Hari Guru Nasional.'}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {!dbReady() && <p className="empty">Halaman ini belum aktif. Pengurus OSIS perlu menghubungkan database terlebih dahulu.</p>}
          {galat && <p className="empty">{galat}</p>}
          {data && <HariGuruVote data={data} />}
        </div>
      </section>
    </>
  );
}
