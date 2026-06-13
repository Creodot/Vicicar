"use client";

/**
 * SmoothScroll — Lenis provider, scoped to the landing page ONLY.
 *
 * Mounted solely in `app/page.tsx` (renders null). Other routes (incl. the
 * multi-step form) never see Lenis. Per spec §3.1:
 * - single instance, duration 1.6, smoothWheel
 * - bridged to ScrollTrigger: lenis.on("scroll", ScrollTrigger.update),
 *   gsap.ticker drives lenis.raf, lagSmoothing(0)
 * - disabled entirely under prefers-reduced-motion (native scroll)
 * - delegated same-page hash-link handler (covers `#methode`)
 * - `document.fonts.ready → ScrollTrigger.refresh()` once (spec §3.6)
 * - fully destroyed on unmount (safe across Next route changes)
 */

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll() {
  useEffect(() => {
    /* Octane is a variable font; metrics shift once it loads — refresh
       trigger positions either way (also matters under reduced motion). */
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => {
        cancelled = true;
      };
    }

    const lenis = new Lenis({ duration: 1.6, smoothWheel: true });

    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    /* Same-page hash links (e.g. « Découvrir la méthode ↓ » → #methode):
       route Lenis instead of native jump. Links to other routes untouched. */
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) {
        return;
      }
      const anchor = (e.target as Element | null)?.closest?.(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;
      const target = document.querySelector<HTMLElement>(hash);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target);
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelled = true;
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33); // restore GSAP default for other routes
      lenis.destroy();
    };
  }, []);

  return null;
}
