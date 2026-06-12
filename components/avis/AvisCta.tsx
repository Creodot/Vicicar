"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP, wfEase } from "@/lib/gsap";
import "./scroll"; // registers ScrollTrigger (avis namespace)
import styles from "./AvisCta.module.css";

/**
 * End-of-page CTA (content-ux.md §2.4): Octane ~8vw "À VOTRE TOUR ?" +
 * white pill to /trouver-ma-voiture. On scroll reveal the title fades in
 * while its wdth axis stretches 0→100 (2s, easeOutQuart ≈ power3.out per
 * animations.md §0) — the signature move, triggered once.
 * Hidden states applied only in the animated branch (reduced-motion and
 * no-JS see the section fully rendered).
 */
export default function AvisCta() {
  const root = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const button = useRef<HTMLAnchorElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(title.current, { autoAlpha: 0, "--wdth": 0 });
        gsap.set(button.current, { autoAlpha: 0, y: 24 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top 75%",
            once: true,
          },
        });
        tl.to(title.current, { autoAlpha: 1, duration: 1, ease: wfEase }, 0)
          .to(title.current, { "--wdth": 100, duration: 2, ease: "power3.out" }, 0)
          .to(button.current, { autoAlpha: 1, y: 0, duration: 0.9, ease: wfEase }, 0.35);
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className={styles.cta}>
      <h2 ref={title} className={styles.title}>
        À VOTRE TOUR ?
      </h2>
      <Link ref={button} href="/trouver-ma-voiture" className={styles.button}>
        TROUVER MA VOITURE →
      </Link>
    </section>
  );
}
