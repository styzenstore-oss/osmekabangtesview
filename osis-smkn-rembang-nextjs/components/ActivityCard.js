import { STATUS } from '@/lib/events';
import { bulanSingkat, jamText, tanggalText } from '@/lib/format';
import Gallery from './Gallery';
import Kat from './Kat';

// Kartu satu kegiatan/kolaborasi lengkap dengan galeri dokumentasi.
// jenis: 'kegiatan' | 'kolaborasi'   status: 'akan' | 'berlangsung' | 'selesai' | null
export default function ActivityCard({ e, fotos, jenis, status }) {
  return (
    <article className="act chamfer">
      <header className="act-head">
        <div className="ev-date">
          <b>{e.start.getDate()}</b>
          <span>{bulanSingkat(e.start)}</span>
        </div>
        <div>
          <h3>{e.judul}</h3>
          <div className="act-info">
            {e.kat && <Kat nama={e.kat} />}
            <span>
              {tanggalText(e)}, {jamText(e)}
            </span>
            <span>{e.tempat}</span>
          </div>
        </div>
        {status && <span className={`status s-${status}`}>{STATUS[status]}</span>}
      </header>
      <p className="act-desc">{e.desk}</p>
      {e.mitra.length > 0 && (
        <div className="tags">
          <span className="tags-label">Bersama</span>
          {e.mitra.map((m) => (
            <span className="tag" key={m}>
              {m}
            </span>
          ))}
        </div>
      )}
      <Gallery fotos={fotos} judul={e.judul} jenis={jenis} folder={e.id} />
    </article>
  );
}
