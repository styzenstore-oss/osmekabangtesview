import './globals.css';
import { Chakra_Petch, Plus_Jakarta_Sans } from 'next/font/google';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { EventDialogProvider } from '../components/EventDialog';
import { DATA } from '../lib/data';
import { getEvents } from '../lib/events';

const display = Chakra_Petch({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const body = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
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

// Menerapkan tema pilihan pengunjung sebelum halaman tampil, supaya tidak berkedip.
const SKRIP_TEMA = `try{var t=localStorage.getItem('osis-tema');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SKRIP_TEMA }} />
      </head>
      <body>
        <a className="skip" href="#main">
          Lewati ke konten
        </a>
        <EventDialogProvider events={getEvents()} ekskul={DATA.ekskul}>
          <Header />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </EventDialogProvider>
      </body>
    </html>
  );
}
