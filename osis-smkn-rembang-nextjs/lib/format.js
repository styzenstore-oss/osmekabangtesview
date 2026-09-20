const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const BULAN_SINGKAT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const pad = (n) => String(n).padStart(2, '0');

export const bulanTahun = (d) => `${BULAN[d.getMonth()]} ${d.getFullYear()}`;
export const bulanSingkat = (d) => BULAN_SINGKAT[d.getMonth()];
export const tanggalLengkap = (d) => `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;

export function tanggalText(e) {
  if (!e.sampai) return tanggalLengkap(e.start);
  const t = new Date(e.sampai + 'T00:00:00');
  if (t.getMonth() === e.start.getMonth() && t.getFullYear() === e.start.getFullYear()) {
    return `${e.start.getDate()}\u2013${t.getDate()} ${bulanTahun(e.start)}`;
  }
  return `${e.start.getDate()} ${BULAN[e.start.getMonth()]} \u2013 ${tanggalLengkap(t)}`;
}

export const jamText = (e) => `${pad(e.start.getHours())}.${pad(e.start.getMinutes())} WIB`;
export const dua = pad;
