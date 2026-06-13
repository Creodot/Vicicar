"use client";

/**
 * MarqueeBand — typographic breath between two film scenes
 * (landing-v3.md §2.2). No media, no chapter number.
 *
 * Hairline → giant Octane marquee (right-to-left) → hairline → mono strip
 * (left-to-right, the tension) → hairline. The marquees hold
 * (animation-play-state: paused via the shared <Marquee> `paused` prop)
 * until the band's line-sweeps finish: reveal first, motion second.
 *
 * Mobile (≤767): the giant marquee is display:none, replaced by a static
 * centered « VOTRE VOITURE. »; the mono strip stays animated — the one
 * moving thing. Reduced motion: both static (Marquee handles the strip;
 * the giant's staticFallback replaces its track at every remaining width).
 */

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Marquee from "./lib/Marquee";
import styles from "./MarqueeBand.module.css";

gsap.registerPlugin(ScrollTrigger);

const GIANT = "VOTRE VOITURE — ";
const STRIP =
  "100 % GRATUIT · EXPERT DÉDIÉ · PRIX NÉGOCIÉ · RÉPONSE SOUS 24 H · ZÉRO PRESSION · ";

export default function MarqueeBand() {
  const root = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(true);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* Section seam + inner rules: line sweeps, alternating origins
           (left / right / left), then release the marquees. */
        const rules = gsap.utils.toArray<HTMLElement>("[data-rule]");
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top 80%",
            once: true,
          },
          onComplete: () => setPaused(false),
        });
        rules.forEach((rule, i) => {
          tl.fromTo(
            rule,
            {
              scaleX: 0,
              rotation: 0,
              transformOrigin: i % 2 ? "right center" : "left center",
            },
            {
              scaleX: 1,
              rotation: 0,
              duration: 0.5,
              ease: "power1.inOut",
            },
            i * 0.12
          );
        });
      });

      /* Reduced motion: no sweeps (rules are drawn by default), marquees
         frozen/static via Marquee's own reduced-motion CSS. */
    },
    { scope: root }
  );

  return (
    <section ref={root} className={styles.band}>
      <div data-rule="" className={styles.rule} aria-hidden="true" />

      {/* Giant strip — decorative (the static variant carries the words). */}
      <div aria-hidden="true">
        <Marquee
          text={GIANT}
          speed={6}
          direction="left"
          paused={paused}
          className={styles.giant}
          staticFallback={
            <span className={styles.giantFallback}>VOTRE VOITURE.</span>
          }
        />
      </div>
      <p className={styles.giantStatic}>VOTRE VOITURE.</p>

      <div data-rule="" className={styles.rule} aria-hidden="true" />

      <Marquee
        text={STRIP}
        speed={10}
        direction="right"
        paused={paused}
        className={styles.strip}
        aria-label="Gratuit · Sur-mesure · Expert dédié · Réponse sous 24 h"
        staticFallback={
          <span className={styles.stripFallback}>
            GRATUIT · SUR-MESURE · EXPERT DÉDIÉ · RÉPONSE SOUS 24 H
          </span>
        }
      />

      <div data-rule="" className={styles.rule} aria-hidden="true" />
    </section>
  );
}
