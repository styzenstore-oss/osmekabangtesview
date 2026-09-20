const WARNA = {
  Peringatan: 'var(--gold)',
  Kepemimpinan: 'var(--cyan)',
  'Lomba & Seni': 'var(--red)',
  Sosial: '#2FB36D',
  Olahraga: '#7C6CF0',
};

export default function Kat({ kat }) {
  return (
    <span className="kat">
      <i style={{ background: WARNA[kat] || 'var(--muted)' }} />
      {kat}
    </span>
  );
}
