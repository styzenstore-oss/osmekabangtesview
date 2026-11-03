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
        <div className="container hero-inner">
          <div className="hero-copy">
            <h1>Semua kegiatan OSIS SMK Negeri Rembang, dalam satu layar</h1>
            <p>
              Dari berbagi takjil sampai kolaborasi dengan ekstrakurikuler: lihat agendanya, telusuri dokumentasinya, dan
              kenali pengurusnya.
            </p>
            <div className="cta">
              <Link className="btn btn-primary" href="/kegiatan">
                Lihat semua kegiatan
              </Link>
              <Link className="btn btn-ghost" href="/profil">
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
