"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP, wfEase } from "@/lib/gsap";
import "./scroll"; // registers ScrollTrigger (home namespace)
import styles from "./FinalCta.module.css";

/**
 * S4 — « 04 — À VOUS » (landing-v2.md §7). The climax: behind it the
 * canvas trail converges into two headlights (master `arrive`, owned by
 * HomeStory) while ALLEZ-Y. performs the hero's wdth 0→100 stretch one
 * last time. No pin. Hidden states only inside the no-preference branch —
 * reduced-motion / no-JS render the section complete (--wdth defaults to
 * 100 in CSS) over the gradient backdrop, button fully functional.
 */
export default function FinalCta() {
  const root = useRef<HTMLElement>(null);
  const word = useRef<HTMLHeadingElement>(null);
  const button = useRef<HTMLAnchorElement>(null);
  const sub = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      /* Same gesture at every width — the entrance IS the moment on touch
         devices (no hover-gated content). */
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top 70%",
            once: true,
          },
        });

        tl.fromTo(
          word.current,
          { autoAlpha: 0, "--wdth": 0 },
          { autoAlpha: 1, duration: 1, ease: wfEase },
          0
        )
          /* The exact AvisCta gesture (and the hero's), at maximum scale. */
          .to(
            word.current,
            { "--wdth": 100, duration: 2, ease: "power3.out" },
            0
          )
          .fromTo(
            button.current,
            { autoAlpha: 0, y: 24, rotation: 0 },
            { autoAlpha: 1, y: 0, rotation: 0, duration: 0.9, ease: wfEase },
            0.35
          )
          .fromTo(
            sub.current,
            { autoAlpha: 0, y: 24, rotation: 0 },
            { autoAlpha: 1, y: 0, rotation: 0, duration: 0.9, ease: wfEase },
            0.5
          );
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className={styles.cta} aria-labelledby="cta-label">
      <p id="cta-label" className={`label ${styles.chapter}`}>
        04 — À vous
      </p>

      <h2 ref={word} className={styles.word}>
        Allez-y.
      </h2>

      <Link ref={button} href="/trouver-ma-voiture" className={styles.button}>
        Trouver ma voiture — Gratuit
      </Link>

      <p ref={sub} className={styles.sub}>
        3 minutes pour décrire votre besoin. Un expert vous rappelle sous
        24&nbsp;h.
      </p>
    </section>
  );
}
