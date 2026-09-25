import Link from 'next/link';
import { getOsisProfile } from '@/lib/getProfileData';
import PhotoFrame from './PhotoFrame';

function GreetCompact({ p }) {
  if (!p) return null;
  return (
    <article className="greet chamfer">
      <PhotoFrame person={p} />
      <div>
        <h3>{p.nama}</h3>
        <div className="role">{p.jabatan}</div>
        <p>{p.ringkas}</p>
      </div>
    </article>
  );
}

export default async function Foundation() {
  const profileData = await getOsisProfile();

  return (
    <section className="foundation section" aria-labelledby="f-title">
      <div className="container">
        <h2 id="f-title">Visi, misi, dan salam dari pengurus</h2>
        <div className="f-grid">
          <div>
            <h3 className="sub">Visi</h3>
            <p className="visi">{profileData.visi}</p>
            <h3 className="sub">Misi</h3>
            <ul className="misi">
              {Array.isArray(profileData.misi) && profileData.misi.map((m, idx) => (
                <li key={idx}>{m}</li>
              ))}
            </ul>
          </div>
          <div className="f-salam">
            <GreetCompact p={profileData.ketua} />
            {profileData.wakil && <GreetCompact p={profileData.wakil} />}
            <GreetCompact p={profileData.pembina} />
            <Link className="link" href="/profil">
              Baca sambutan lengkap
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
