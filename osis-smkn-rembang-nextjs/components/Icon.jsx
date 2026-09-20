const PATHS = {
  tenda: (
    <>
      <path d="M3 20 12 4l9 16z" />
      <path d="M12 20v-7" />
    </>
  ),
  plus: <path d="M12 4v16M4 12h16" />,
  bendera: (
    <>
      <path d="M5 21V4" />
      <path d="M5 5h12l-2.5 4L17 13H5" />
    </>
  ),
  bulan: <path d="M17 4a8 8 0 1 0 3 12 7 7 0 0 1-3-12z" />,
  kamera: (
    <>
      <rect x="3" y="7" width="13" height="10" rx="2" />
      <path d="m16 11 5-3v8l-5-3" />
    </>
  ),
  nada: (
    <>
      <path d="M9 18V6l10-2v12" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="16" r="2" />
    </>
  ),
  bola: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </>
  ),
};

export default function Icon({ name }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
