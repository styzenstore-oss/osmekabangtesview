import { DATA } from './data';

// Semua tanggal ditampilkan dalam WIB agar sama di server (UTC) maupun di HP siswa.
const TZ = 'Asia/Jakarta';
const fmt = (opts) => new Intl.DateTimeFormat('id-ID', { timeZone: TZ, ...opts });

const fMonthYear = fmt({ month: 'long', year: 'numeric' });
const fFull = fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const fMonthShort = fmt({ month: 'short' });
const fDayMonth = fmt({ day: 'numeric', month: 'long' });
const fDay = fmt({ day: 'numeric' });
const fYear = fmt({ year: 'numeric' });
const fTime = fmt({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

export const STATUS_LABEL = {
  akan: 'Akan datang',
  berlangsung: 'Berlangsung',
  selesai: 'Selesai',
};

function tanggalText(e, start) {
  if (!e.sampai) return fFull.format(start);
  const end = new Date(e.sampai + 'T12:00:00+07:00');
  if (fMonthYear.format(start) === fMonthYear.format(end)) {
    return `${fDay.format(start)}\u2013${fDay.format(end)} ${fMonthYear.format(start)}`;
  }
  return `${fDayMonth.format(start)} \u2013 ${fFull.format(end)}`;
}

function jamText(start) {
  return fTime.format(start).replace(':', '.') + ' WIB';
}

// Mengembalikan daftar kegiatan yang sudah siap pakai (data biasa, aman dikirim ke komponen client).
export function getEvents() {
  return DATA.kegiatan
    .map((e) => {
      const start = new Date(e.mulai);
      const end = new Date((e.sampai || e.mulai.slice(0, 10)) + 'T23:59:59+07:00');
      return {
        ...e,
        startMs: start.getTime(),
        endMs: end.getTime(),
        day: fDay.format(start),
        monthShort: fMonthShort.format(start),
        monthYear: fMonthYear.format(start),
        year: fYear.format(start),
        tanggalText: tanggalText(e, start),
        jamText: jamText(start),
      };
    })
    .sort((a, b) => a.startMs - b.startMs);
}

export function statusOf(e, nowMs) {
  if (e.endMs < nowMs) return 'selesai';
  if (e.startMs <= nowMs) return 'berlangsung';
  return 'akan';
}
