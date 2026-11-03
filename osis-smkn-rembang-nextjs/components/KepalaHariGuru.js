import Image from 'next/image';

export default function KepalaHariGuru({ judul, deskripsi }) {
  return (
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
        <h1>{judul || 'Guru Terfavorit'}</h1>
        <p>{deskripsi || 'Pemilihan guru terfavorit dalam rangka Hari Guru Nasional.'}</p>
      </div>
    </section>
  );
}
