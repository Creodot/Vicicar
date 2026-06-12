"use client";

import { useRef } from "react";
import { gsap, useGSAP, wfEase, outQuad } from "@/lib/gsap";
import "./scroll"; // registers ScrollTrigger (avis namespace)
import styles from "./AvisHero.module.css";

const LETTERS = ["A", "V", "I", "S"];

const STATS: Array<{ number: string; label: string }> = [
  { number: "4,9/5", label: "NOTE MOYENNE" },
  { number: "+250", label: "VOITURES TROUVÉES" },
  { number: "100 %", label: "GRATUIT, TOUJOURS" },
];

/**
 * /avis hero (content-ux.md §2.1):
 * eyebrow + oversized Octane "AVIS" (home-hero letter intro + the 3s CSS
 * wdth 0→100 hover stretch, no videos) + .text-info subtitle + stat strip.
 * Intro mirrors the home load sequence (animations.md §1): letters flip in
 * 1.0s power1.out, 0.05s stagger from t=0.2s; the rest fades 1.4s wfEase
 * from t=0.7s. Subtle scrub parallax on the word while scrolling away.
 */
export default function AvisHero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const letters = `.${styles.letter}`;
      const fades = [`.${styles.eyebrow}`, `.${styles.sub}`, `.${styles.stats}`];
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline();
        tl.to(
          letters,
          {
            opacity: 1,
            x: 0,
            rotationX: 0,
            rotationY: 0,
            // pin Z: decomposing the CSS initial 3D matrix yields a phantom
            // rotationZ that a plain to() would otherwise leave behind
            rotation: 0,
            duration: 1,
            ease: outQuad,
            stagger: 0.05,
          },
          0.2
        ).to(fades, { autoAlpha: 1, duration: 1.4, ease: wfEase }, 0.7);

        // Subtle parallax: the word drifts down slightly as the hero scrolls out.
        gsap.to(`.${styles.word}`, {
          yPercent: 14,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([letters, ...fades], {
          autoAlpha: 1,
          x: 0,
          rotationX: 0,
          rotationY: 0,
          rotation: 0,
        });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className={styles.hero}>
      <div className={styles.head}>
        <p className={styles.eyebrow}>ILS NOUS ONT FAIT CONFIANCE</p>
        <h1 className={styles.word} aria-label="Avis">
          {LETTERS.map((glyph, i) => (
            <span key={`${glyph}-${i}`} className={styles.blockLetter} aria-hidden="true">
              <span className={styles.letter}>{glyph}</span>
            </span>
          ))}
        </h1>
        <p className={styles.sub}>DES VRAIES VOITURES, TROUVÉES POUR DE VRAIS GENS</p>
      </div>

      <ul className={styles.stats} role="list">
        {STATS.map((stat) => (
          <li key={stat.label} className={styles.stat}>
            <span className={styles.statNumber}>{stat.number}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
