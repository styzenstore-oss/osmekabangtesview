import { DATA, KATEGORI } from '../../lib/data';
import { getEvents } from '../../lib/events';
import EventsExplorer from '../../components/EventsExplorer';
import Foundation from '../../components/Foundation';

export const metadata = { title: 'Kegiatan' };
export const revalidate = 60;

export default function Kegiatan() {
  return (
    <>
      <section className="page-head">
        <div className="container">
          <h1>Kegiatan OSIS</h1>
          <p>
            Seluruh program kerja OSIS SMK Negeri Rembang, dari yang sudah berlangsung sampai yang akan datang. Pilih
            kegiatan untuk melihat rinciannya.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <EventsExplorer
            events={getEvents()}
            ekskul={DATA.ekskul}
            kategori={KATEGORI}
            nowIso={new Date().toISOString()}
          />
        </div>
      </section>

      <Foundation />
    </>
  );
}
