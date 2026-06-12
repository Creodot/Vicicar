"use client";

import { useRef } from "react";
import { gsap, useGSAP, outQuad, wfEase } from "@/lib/gsap";
import LetterBlock from "./LetterBlock";
import styles from "./Hero.module.css";

/**
 * Letter → video asset mapping, verbatim from home.html (design-system.md §4.4).
 * The CDN filenames are shuffled relative to the glyphs (asset "C" plays under
 * letter "I", etc.) — the videos were graded per position. Preserve the shuffle.
 */
const LETTERS = [
  { glyph: "V", video: "V" },
  { glyph: "I", video: "C" },
  { glyph: "C", video: "I" },
  { glyph: "I", video: "C3" },
  { glyph: "C", video: "I2" },
  { glyph: "A", video: "A2" },
  { glyph: "R", video: "R" },
] as const;

/**
 * Hero — 1:1 replica of the live vicicar.com homepage hero.
 *
 * Load sequence (animations.md §1, IX2 a-15…a-20 + a-13):
 * - each letter: opacity 0→1, x 3vw→0, rotX 7→0, rotY 70→0, 1.0s power1.out
 * - delays 0.20/0.25/0.30/0.35/0.40/0.45/0.45 — NO preload-7 in source:
 *   A and R both carry .preload-6 and flip in together at 0.45s. Replicated
 *   with stagger (i) => min(i, 5) * 0.05.
 * - tagline .block-info fades 0→1 at 0.7s over 1.4s, IX2 "ease" (wfEase).
 *   (The navbar runs its own identical fade — owned by <Navbar/>.)
 *
 * Initial states live in CSS (FOUC-proof, mirrors source inline styles);
 * the timeline fromTo's the same values so GSAP owns the transform cleanly.
 */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const letters = gsap.utils.toArray<HTMLElement>("[data-hero-letter]");
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline();
        tl.fromTo(
          letters,
          // rotation: 0 pins GSAP's Z axis — decomposing the CSS initial
          // matrix (rotateX 7° · rotateY 70°) is ambiguous and yields a
          // phantom ~18.5° rotationZ that the tween would never animate out.
          { opacity: 0, x: "3vw", rotationX: 7, rotationY: 70, rotation: 0 },
          {
            opacity: 1,
            x: 0,
            rotationX: 0,
            rotationY: 0,
            rotation: 0,
            duration: 1,
            ease: outQuad,
            // 0, .05, .10, .15, .20, .25, .25 → A & R together (IX2 quirk)
            stagger: (i) => Math.min(i, 5) * 0.05,
            // NOTE: the identity transform must stay inline at rest — the
            // CSS class holds the pre-intro flipped state (FOUC guard), so
            // clearProps here would snap the letters back to it.
          },
          0.2
        ).to(
          "[data-hero-info]",
          { autoAlpha: 1, duration: 1.4, ease: wfEase },
          0.7
        );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        // letters appear in place, no 3D flip — write an inline identity
        // transform (clearProps would re-expose the CSS pre-intro state)
        gsap.set(letters, {
          x: 0,
          rotationX: 0,
          rotationY: 0,
          rotation: 0,
          opacity: 1,
        });
        gsap.set("[data-hero-info]", { autoAlpha: 1 });
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className={styles.sectionHero}>
      <div
        className={styles.wrapperLetter}
        role="heading"
        aria-level={1}
        aria-label="Vicicar"
      >
        {LETTERS.map((l, i) => (
          <LetterBlock key={`${l.glyph}-${i}`} glyph={l.glyph} video={l.video} />
        ))}
      </div>

      <div className={styles.blockInfo} data-hero-info="">
        <div className={styles.textInfo}>
          Laissez-Nous Trouver Votre Voiture Idéale
        </div>
      </div>
    </section>
  );
}
