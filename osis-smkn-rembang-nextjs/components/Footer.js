import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="foot">
      <div className="container foot-grid">
        <div>
          <div className="plate">
            <Image src="/logo-smkn-rembang.png" width={228} height={60} alt="Logo SMK Negeri Rembang Pasuruan" />
          </div>
          <p>Website resmi OSIS SMK Negeri Rembang. Semua kegiatan dan kolaborasi OSIS tercatat di sini.</p>
        </div>
        <nav aria-label="Menu footer">
          <Link href="/">Beranda</Link>
          <Link href="/kegiatan">Kegiatan</Link>
          <Link href="/kolaborasi">Kolaborasi</Link>
          <Link href="/profil">Profil</Link>
          <Link href="/admin">Portal Admin</Link>
        </nav>
      </div>
      <div className="container">
        <div className="copy">&copy; {new Date().getFullYear()} OSIS SMK Negeri Rembang, Pasuruan.</div>
      </div>
    </footer>
  );
}

