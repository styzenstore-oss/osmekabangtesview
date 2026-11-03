import Link from 'next/link';
import { getContent } from '@/lib/content';
import PhotoFrame from './PhotoFrame';

function GreetCompact({ p }) {
  return (
    <article className="greet box">
      <PhotoFrame person={p} />
      <div>
        <h3>{p.nama}</h3>
        <div className="role">{p.jabatan}</div>
        <p>{p.ringkas}</p>
      </div>
    </article>
  );
}

// Bagian visi, misi, dan salam ketua/pembina. Dipasang di bawah setiap halaman.
export default async function Foundation() {
  const { settings: DATA } = await getContent();
  return (
    <section className="foundation section" aria-labelledby="f-title">
      <div className="container">
        <h2 id="f-title">Visi, misi, dan salam dari pengurus</h2>
        <div className="f-grid">
          <div>
            <h3 className="sub">Visi</h3>
            <p className="visi">{DATA.visi}</p>
            <h3 className="sub">Misi</h3>
            <ul className="misi">
              {DATA.misi.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
          <div className="f-salam">
            <GreetCompact p={DATA.ketua} />
            <GreetCompact p={DATA.pembina} />
            <Link className="link" href="/profil">
              Baca sambutan lengkap
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
