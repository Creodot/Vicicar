"use client";

import { useRef } from "react";
import { gsap, useGSAP, outQuad, wfEase } from "@/lib/gsap";
import styles from "./AProposHero.module.css";

/**
 * /a-propos hero (content-ux.md §3.1) — giant Octane "À PROPOS" on 2 lines
 * (~16vw), each letter reuses the home letter interaction: hover stretches
 * `wdth` 0→100 over 3s outQuart (pure CSS), intro flips letters in with the
 * house page-load sequence (animations.md §1: opacity 0→1, x 3vw→0,
 * rotX 7→0, rotY 70→0, 1s power1.out, 50ms stagger), no videos.
 */
const LINES: string[][] = [["À"], ["P", "R", "O", "P", "O", "S"]];

export default function AProposHero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline();
        tl.to(
          "[data-letter]",
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
        ).to(
          "[data-info]",
          { autoAlpha: 1, duration: 1.4, ease: wfEase },
          0.7
        );
      });
      /* prefers-reduced-motion: reduce → final states are set in CSS. */
    },
    { scope: root }
  );

  return (
    <section ref={root} className={styles.hero}>
      <h1 className={styles.title}>
        <span className={styles.srOnly}>À propos</span>
        {LINES.map((line, i) => (
          <span key={i} className={styles.line} aria-hidden="true">
            {line.map((glyph, j) => (
              <span key={j} className={styles.letter} data-letter="">
                {glyph}
              </span>
            ))}
          </span>
        ))}
      </h1>
      <p className={styles.info} data-info="">
        On cherche. On compare. On négocie. Vous conduisez.
      </p>
    </section>
  );
}
