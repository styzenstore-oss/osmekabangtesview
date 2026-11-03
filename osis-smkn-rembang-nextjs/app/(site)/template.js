// Template dibuat ulang di setiap pindah halaman, jadi animasi ini jalan tiap kali halaman berganti.
export default function Template({ children }) {
  return <div className="page-in">{children}</div>;
}
