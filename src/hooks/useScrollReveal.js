// hooks/useScrollReveal.js
// GSAP scroll reveal animation cho các section
// Nguồn: UI/UX Pro Max — Scroll Reveal (Subtle), power1.out, 350ms
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Hook tự động thêm scroll reveal animation cho 1 element
 * @param {object} options
 * @param {number} options.y       - Khoảng dịch chuyển theo trục Y (mặc định 24px)
 * @param {number} options.delay   - Delay trước khi animate (giây)
 * @param {number} options.stagger - Stagger cho các phần tử con (giây)
 */
export function useScrollReveal({ y = 24, delay = 0, stagger = 0 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Tôn trọng prefers-reduced-motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const targets = stagger > 0
      ? el.querySelectorAll('[data-reveal]') // con có data-reveal
      : el;

    const anim = gsap.from(targets, {
      opacity:       0,
      y,
      duration:      0.4,
      ease:          'power1.out',
      delay,
      stagger:       stagger || 0,
      scrollTrigger: {
        trigger:       el,
        start:         'top 90%',
        toggleActions: 'play none none reverse',
      },
    });

    return () => {
      anim.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [y, delay, stagger]);

  return ref;
}

/**
 * Hook stagger cho danh sách items (dùng trên BeatsSection)
 * Nguồn: UI/UX Pro Max — Stagger List (Subtle), 0.03s per item
 */
export function useStaggerReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const items = el.querySelectorAll('[data-stagger]');
    if (!items.length) return;

    const anim = gsap.from(items, {
      opacity:       0,
      y:             8,
      duration:      0.3,
      ease:          'power1.out',
      stagger:       0.03, // 30ms per item — recommended max 0.04s
      scrollTrigger: {
        trigger:       el,
        start:         'top 85%',
        toggleActions: 'play none none reverse',
      },
    });

    return () => anim.kill();
  }, []);

  return ref;
}
