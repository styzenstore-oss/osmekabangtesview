import Link from 'next/link';
import { DATA } from '../lib/data';
import { getEvents, statusOf } from '../lib/events';
import Countdown from '../components/Countdown';
import { EventButton } from '../components/EventDialog';
import Foundation from '../components/Foundation';
import Icon from '../components/Icon';
import Kat from '../components/Kat';

// Halaman dibuat ulang tiap 60 detik agar status kegiatan tetap mutakhir.
export const revalidate = 60;

export default function Beranda() {
  const now = Date.now();
  const events = getEvents();
  const berlangsung = events.find((e) => statusOf(e, now) === 'berlangsung');
  const akanDatang = events.filter((e) => statusOf(e, now) === 'akan');
  const berikut = berlangsung || akanDatang[0];
  const cuplikan = (akanDatang.length ? akanDatang : [...events].reverse()).slice(0, 3);

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
              Dari peringatan hari besar sampai kolaborasi dengan ekstrakurikuler: lihat agendanya, baca ceritanya, dan
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

          <aside className="screen chamfer" aria-label="Agenda berikutnya">
            <div className="screen-inner">
              {berikut ? (
                <>
                  <div className="live">
                    <span className="dot" aria-hidden="true" />
                    {berlangsung ? 'Sedang berlangsung' : 'Agenda berikutnya'}
                  </div>
                  <h2>{berikut.judul}</h2>
                  <div className="screen-meta">
                    <span>
                      {berikut.tanggalText}, {berikut.jamText}
                    </span>
                    <span>{berikut.tempat}</span>
                  </div>
                  {berlangsung ? (
                    <span className="running">Ikuti sekarang</span>
                  ) : (
                    <Countdown
                      targetIso={new Date(berikut.startMs).toISOString()}
                      nowIso={new Date(now).toISOString()}
                      judul={berikut.judul}
                    />
                  )}
                  <div>
                    <EventButton id={berikut.id} className="btn btn-ghost chamfer">
                      Lihat detail kegiatan
                    </EventButton>
                  </div>
                </>
              ) : (
                <>
                  <div className="live">
                    <span className="dot" aria-hidden="true" />
                    Agenda berikutnya
                  </div>
                  <h2>Belum ada agenda mendatang</h2>
                  <div className="screen-meta">
                    <span>Lihat kegiatan yang sudah berjalan di halaman Kegiatan.</span>
                  </div>
                  <div>
                    <Link className="btn btn-ghost chamfer" href="/kegiatan">
                      Buka halaman kegiatan
                    </Link>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>

        <div className="container stats-wrap">
          <div className="stats chamfer">
            <div className="stats-in">
              <div>
                <b>{events.length}</b>
                <span>kegiatan tercatat</span>
              </div>
              <div>
                <b>{akanDatang.length}</b>
                <span>kegiatan akan datang</span>
              </div>
              <div>
                <b>{DATA.ekskul.length}</b>
                <span>ekstrakurikuler berkolaborasi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>{akanDatang.length ? 'Kegiatan terdekat' : 'Kegiatan terbaru'}</h2>
            <Link className="link" href="/kegiatan">
              Semua kegiatan
            </Link>
          </div>
          <div className="grid-3">
            {cuplikan.map((e) => (
              <EventButton key={e.id} id={e.id} className="card chamfer">
                <span className="date-badge">
                  <b>{e.day}</b>
                  <span>
                    {e.monthShort} {e.year}
                  </span>
                </span>
                <h3>{e.judul}</h3>
                <span className="ev-meta">
                  <Kat kat={e.kat} />
                  <span>{e.tempat}</span>
                </span>
              </EventButton>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <h2>Berkolaborasi dengan ekstrakurikuler</h2>
            <Link className="link" href="/kolaborasi">
              Lihat semua kolaborasi
            </Link>
          </div>
          <div className="tiles">
            {DATA.ekskul.map((k) => (
              <Link key={k.id} className="tile chamfer" href="/kolaborasi">
                <span className="ico">
                  <Icon name={k.ikon} />
                </span>
                {k.nama}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Foundation />
    </>
  );
}
