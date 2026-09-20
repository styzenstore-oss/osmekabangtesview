import { DATA } from '../../lib/data';
import Photo from '../../components/Photo';

export const metadata = { title: 'Profil' };

function Orang({ orang }) {
  return (
    <article className="person chamfer">
      <Photo orang={orang} />
      <div className="text">
        <h3>{orang.nama}</h3>
        <div className="role">
          {orang.jabatan} periode {DATA.periode}
        </div>
        {orang.salam.map((t) => (
          <p key={t}>{t}</p>
        ))}
      </div>
    </article>
  );
}

export default function Profil() {
  return (
    <>
      <section className="page-head">
        <div className="container">
          <div className="seal">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/emblem.png" width="300" height="160" alt="Logo Provinsi Jawa Timur dan logo SMK Negeri Rembang" />
            <span>
              Organisasi Siswa Intra Sekolah
              <br />
              SMK Negeri Rembang, Pasuruan
            </span>
          </div>
          <h1>Profil OSIS</h1>
          <p>Kenali ketua dan pembina OSIS, serta arah yang ingin dicapai OSIS periode {DATA.periode}.</p>
        </div>
      </section>

      <section className="section full">
        <div className="container">
          <h2 style={{ marginBottom: 24 }}>Salam hangat dari ketua dan pembina</h2>
          <Orang orang={DATA.ketua} />
          <Orang orang={DATA.pembina} />
        </div>
      </section>

      <section className="section foundation full" style={{ borderTop: '1px solid var(--line)' }}>
        <div className="container">
          <h2>Visi dan misi</h2>
          <div className="f-grid">
            <div>
              <h3 className="sub">Visi</h3>
              <p className="visi">{DATA.visi}</p>
            </div>
            <div>
              <h3 className="sub">Misi</h3>
              <ul className="misi">
                {DATA.misi.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
