import { WARNA } from '@/lib/events';

export default function Kat({ nama }) {
  return (
    <span className="kat">
      <i style={{ background: WARNA[nama] }} />
      {nama}
    </span>
  );
}
