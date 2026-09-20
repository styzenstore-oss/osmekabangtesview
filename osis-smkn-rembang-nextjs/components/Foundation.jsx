import Link from 'next/link';
import { DATA } from '../lib/data';
import Photo from './Photo';

function GreetCompact({ orang }) {
  return (
    <article className="greet chamfer">
      <Photo orang={orang} />
      <div>
        <h3>{orang.nama}</h3>
        <div className="role">{orang.jabatan}</div>
        <p>{orang.ringkas}</p>
      </div>
    </article>
  );
}

// Bagian visi, misi, dan salam ketua serta pembina. Dipasang di bawah setiap halaman.
export default function Foundation() {
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
            <GreetCompact orang={DATA.ketua} />
            <GreetCompact orang={DATA.pembina} />
            <Link className="link" href="/profil">
              Baca sambutan lengkap
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
