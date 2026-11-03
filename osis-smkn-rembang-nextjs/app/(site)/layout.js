import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { LightboxProvider } from '@/components/Lightbox';
import RevealOnScroll from '@/components/RevealOnScroll';
import Splash from '@/components/Splash';

export default function SiteLayout({ children }) {
  return (
    <>
      <Splash />
      <a className="skip" href="#main">
        Lewati ke konten
      </a>
      <LightboxProvider>
        <Header />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <RevealOnScroll />
      </LightboxProvider>
    </>
  );
}
