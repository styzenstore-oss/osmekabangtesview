'use client';

import { useMemo } from 'react';
import { statusOf, urutKegiatan } from '@/lib/events';
import CountUp from './CountUp';
import { useNow } from './useNow';

export default function HomeStats({ kegiatan, kolaborasi }) {
  const now = useNow(60000);
  const list = useMemo(() => urutKegiatan(kegiatan), [kegiatan]);
  const akan = now ? list.filter((e) => statusOf(e, now) === 'akan').length : '-';

  return (
    <div className="container stats-wrap">
      <div className="stats box">
        <div className="stats-in">
          <div>
            <b>
              <CountUp value={list.length} />
            </b>
            <span>kegiatan OSIS tercatat</span>
          </div>
          <div>
            <b>
              <CountUp value={akan} />
            </b>
            <span>kegiatan akan datang</span>
          </div>
          <div>
            <b>
              <CountUp value={kolaborasi.length} />
            </b>
            <span>kolaborasi terlaksana</span>
          </div>
        </div>
      </div>
    </div>
  );
}
