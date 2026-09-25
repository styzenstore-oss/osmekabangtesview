import Image from 'next/image';
import { getOsisProfile } from '@/lib/getProfileData';
import PhotoFrame from '@/components/PhotoFrame';

export const metadata = { title: 'Profil' };
export const dynamic = 'force-dynamic';

function Person({ p, periode }) {
  if (!p) return null;
  return (
    <article className="person chamfer" style={{ marginBottom: '24px' }}>
      <PhotoFrame person={p} />
      <div className="text">
        <h3>{p.nama}</h3>
        <div className="role">
          {p.jabatan} periode {periode}
        </div>
        {Array.isArray(p.salam) && p.salam.map((t, idx) => (
          <p key={idx}>{t}</p>
        ))}
      </div>
    </article>
  );
}

export default async function Profil() {
  const profileData = await getOsisProfile();

  return (
    <>
      <section className="page-head">
        <div className="container">
          <div className="seal">
            <Image
              src="/emblem-osis.png"
              width={300}
              height={160}
              alt="Logo Provinsi Jawa Timur dan logo SMK Negeri Rembang"
            />
            <span>
              Organisasi Siswa Intra Sekolah
              <br />
              SMK Negeri Rembang, Pasuruan
            </span>
          </div>
          <h1>Profil OSIS</h1>
          <p>
            Kenali ketua, wakil ketua, dan pembina OSIS, serta arah yang ingin dicapai OSIS periode {profileData.periode}.
          </p>
        </div>
      </section>

      <section className="section full">
        <div className="container">
          <h2 style={{ marginBottom: 24 }}>Salam hangat dari pengurus dan pembina</h2>
          <Person p={profileData.ketua} periode={profileData.periode} />
          {profileData.wakil && <Person p={profileData.wakil} periode={profileData.periode} />}
          <Person p={profileData.pembina} periode={profileData.periode} />
        </div>
      </section>

      <section className="section foundation full" style={{ borderTop: '1px solid var(--line)' }}>
        <div className="container">
          <h2>Visi dan misi</h2>
          <div className="f-grid">
            <div>
              <h3 className="sub">Visi</h3>
              <p className="visi">{profileData.visi}</p>
            </div>
            <div>
              <h3 className="sub">Misi</h3>
              <ul className="misi">
                {Array.isArray(profileData.misi) && profileData.misi.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
