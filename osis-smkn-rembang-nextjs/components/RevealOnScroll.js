'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// Bagian yang berada di bawah layar muncul pelan-pelan saat digulir ke dalam tampilan.
const TARGET = '.section-head, .act, .greet, .person, .f-grid > div, .pos-wrap, .month, .poster-empty, .copy';

export default function RevealOnScroll() {
  const path = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
    );

    const timer = setTimeout(() => {
      document.querySelectorAll(TARGET).forEach((el) => {
        // Yang sudah terlihat sejak awal dibiarkan, animasinya ditangani CSS pembuka halaman.
        if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
        el.classList.add('rv');
        io.observe(el);
      });
    }, 60);

    return () => {
      clearTimeout(timer);
      io.disconnect();
    };
  }, [path]);

  return null;
}
