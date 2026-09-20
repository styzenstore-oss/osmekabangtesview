import Link from 'next/link';
import { KOLABORASI } from '@/lib/events';
import { getFotoMap, getPoster } from '@/lib/media';
import Foundation from '@/components/Foundation';
import HeroScreen from '@/components/HeroScreen';
import HomeStats from '@/components/HomeStats';
import PosterSlider from '@/components/PosterSlider';
import RecentCollabs from '@/components/RecentCollabs';
import UpcomingEvents from '@/components/UpcomingEvents';

export default function Beranda() {
  const posters = getPoster();
  const fotoKolaborasi = getFotoMap('kolaborasi', KOLABORASI);

  return (
    <>
      <section className="hero">
        <svg className="circuit" viewBox="0 0 800 600" preserveAspectRatio="xMaxYMin slice" aria-hidden="true" focusable="false">
          <g fill="none" stroke="currentColor" strokeWidth="1.5">
            <path pathLength="1" d="M800 70H660l-40 40H500" />
            <path pathLength="1" d="M800 190H720l-36 36V330H560" />
            <path pathLength="1" d="M800 420H640l-44 44H430" />
            <path pathLength="1" d="M800 540H700l-30-30H600" />
          </g>
          <g fill="var(--gold)">
            <circle cx="500" cy="110" r="4" />
            <circle cx="560" cy="330" r="4" />
            <circle cx="430" cy="464" r="4" />
            <circle cx="600" cy="510" r="4" />
          </g>
        </svg>

        <div className="container hero-inner">
          <div className="hero-copy">
            <h1>Semua kegiatan OSIS SMK Negeri Rembang, dalam satu layar</h1>
            <p>
              Dari berbagi takjil sampai kolaborasi dengan ekstrakurikuler: lihat agendanya, telusuri dokumentasinya, dan
              kenali pengurusnya.
            </p>
            <div className="cta">
              <Link className="btn btn-primary chamfer" href="/kegiatan">
                Lihat semua kegiatan
              </Link>
              <Link className="btn btn-ghost chamfer" href="/profil">
                Kenali OSIS
              </Link>
            </div>
          </div>
          <HeroScreen />
        </div>

        <HomeStats />
      </section>

      <PosterSlider posters={posters} />
      <UpcomingEvents />
      <RecentCollabs fotoMap={fotoKolaborasi} />
      <Foundation />
    </>
  );
}
