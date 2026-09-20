import Image from 'next/image';

export default function PhotoFrame({ person, className = '' }) {
  return (
    <div className={`photo chamfer ${className}`.trim()}>
      {person.foto ? (
        <Image src={person.foto} alt={`Foto ${person.nama}`} width={400} height={500} />
      ) : (
        <svg viewBox="0 0 100 100" fill="currentColor" role="img" aria-label="Foto belum diunggah">
          <circle cx="50" cy="36" r="17" />
          <path d="M14 100c0-22 16-36 36-36s36 14 36 36z" />
        </svg>
      )}
    </div>
  );
}
