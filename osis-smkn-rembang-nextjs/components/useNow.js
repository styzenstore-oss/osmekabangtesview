'use client';

import { useEffect, useState } from 'react';

// Mengembalikan null saat render di server, lalu waktu sekarang di browser.
// Dengan begitu status kegiatan (akan datang / selesai) selalu mengikuti jam pengunjung.
export function useNow(interval = 60000) {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return now;
}
