import { DATA } from '../../lib/data';
import { getEvents } from '../../lib/events';
import { EventButton } from '../../components/EventDialog';
import Foundation from '../../components/Foundation';
import Icon from '../../components/Icon';

export const metadata = { title: 'Kolaborasi' };

export default function Kolaborasi() {
  const events = getEvents();
  const kartu = DATA.ekskul
    .map((k) => ({ k, kegiatan: events.filter((e) => e.ekskul.includes(k.id)) }))
    .sort((a, b) => b.kegiatan.length - a.kegiatan.length);

  return (
    <>
      <section className="page-head">
        <div className="container">
          <h1>Kolaborasi dengan ekstrakurikuler</h1>
          <p>OSIS tidak berjalan sendiri. Setiap acara disiapkan bersama ekstrakurikuler yang paling dekat dengan bidangnya.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="col-grid">
            {kartu.map(({ k, kegiatan }) => (
              <article key={k.id} className="col-card chamfer">
                <div className="col-top">
                  <span className="ico">
                    <Icon name={k.ikon} />
                  </span>
                  <h3>{k.nama}</h3>
                </div>
                <p>{k.desk}</p>
                <div className="col-count">{kegiatan.length} kegiatan bersama OSIS</div>
                <ul className="col-list">
                  {kegiatan.map((e) => (
                    <li key={e.id}>
                      <EventButton id={e.id} className="link">
                        {e.judul}
                      </EventButton>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Foundation />
    </>
  );
}
