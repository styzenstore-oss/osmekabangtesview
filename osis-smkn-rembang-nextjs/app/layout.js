import './globals.css';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';

const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata = {
  title: {
    default: 'OSIS SMK Negeri Rembang',
    template: '%s | OSIS SMK Negeri Rembang',
  },
  description:
    'Website resmi OSIS SMK Negeri Rembang Pasuruan: kegiatan, kolaborasi dengan ekstrakurikuler, visi dan misi, serta salam dari ketua dan pembina.',
};

// Dijalankan sebelum halaman tampil, supaya tidak berkedip:
// 1) menerapkan tema pilihan pengunjung, 2) melewati animasi pembuka jika sudah pernah tampil di tab ini
// atau jika pengunjung memilih mengurangi gerakan.
const awalScript = `try{var d=document.documentElement,t=localStorage.getItem('osis-tema');if(t==='light'||t==='dark'){d.setAttribute('data-theme',t)}}catch(e){}try{if(sessionStorage.getItem('osis-splash')||matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.setAttribute('data-splash','skip')}}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: awalScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
