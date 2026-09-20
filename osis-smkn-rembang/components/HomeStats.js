'use client';

import { KEGIATAN, KOLABORASI, statusOf } from '@/lib/events';
import { useNow } from './useNow';

export default function HomeStats() {
  const now = useNow(60000);
  const akan = now ? KEGIATAN.filter((e) => statusOf(e, now) === 'akan').length : '-';

  return (
    <div className="container stats-wrap">
      <div className="stats chamfer">
        <div className="stats-in">
          <div>
            <b>{KEGIATAN.length}</b>
            <span>kegiatan OSIS tercatat</span>
          </div>
          <div>
            <b>{akan}</b>
            <span>kegiatan akan datang</span>
          </div>
          <div>
            <b>{KOLABORASI.length}</b>
            <span>kolaborasi terlaksana</span>
          </div>
        </div>
      </div>
    </div>
  );
}
