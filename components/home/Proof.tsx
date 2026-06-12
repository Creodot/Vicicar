"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP, outQuad, wfEase } from "@/lib/gsap";
import "./scroll"; // registers ScrollTrigger (home namespace)
import { HOME_PULL_QUOTE } from "@/components/avis/testimonials";
import styles from "./Proof.module.css";

/**
 * S3 — « 03 — LA PREUVE » (landing-v2.md §6).
 * Free-flowing breath after the two pins: stats row (count-up on reveal)
 * + pull-quote derived from the /avis testimonials. Static markup renders
 * the FINAL figures — it IS the no-JS / reduced-motion state; hidden
 * states are applied only inside the no-preference matchMedia branch.
 */

type Stat = {
  /** Count-up target */
  value: number;
  /** Count-up quantizer step */
  snap: number;
  /** Rendered figure for a given value (also produces the static markup) */
  format: (v: number) => string;
  caption: string;
};

const STATS: Stat[] = [
  {
    value: 100,
    snap: 1,
    /* No-break space: the count-up rewrites textContent, so the no-wrap
       guarantee must live in the string itself too. */
    format: (v) => `${Math.round(v)} %`,
    caption: "Gratuit, sans exception",
  },
  {
    value: 250,
    snap: 1,
    format: (v) => `+${Math.round(v)}`,
    caption: "Voitures trouvées",
  },
  {
    value: 4.9,
    snap: 0.1,
    format: (v) => `${v.toFixed(1).replace(".", ",")}/5`,
    caption: "Note de nos clients",
  },
];

export default function Proof() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      /* Count-up is cheap → same choreography at every width. */
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const cells = gsap.utils.toArray<HTMLElement>(`.${styles.cell}`);
        const figures = gsap.utils.toArray<HTMLElement>(`.${styles.figure}`);
        const closing = gsap.utils.toArray<HTMLElement>([
          `.${styles.quote}`,
          `.${styles.meta}`,
        ]);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top 75%",
            once: true,
          },
        });

        tl.fromTo(
          cells,
          { autoAlpha: 0, y: 50, rotation: 0 },
          {
            autoAlpha: 1,
            y: 0,
            rotation: 0,
            duration: 0.9,
            ease: outQuad,
            stagger: 0.12,
          },
          0
        );

        /* Count-ups, each offset by the same 0.12 stagger as its cell. */
        figures.forEach((el, i) => {
          const stat = STATS[i];
          if (!stat) return;
          const snap = gsap.utils.snap(stat.snap);
          const proxy = { v: 0 };
          tl.to(
            proxy,
            {
              v: stat.value,
              duration: 1.6,
              ease: outQuad,
              onUpdate: () => {
                el.textContent = stat.format(snap(proxy.v));
              },
            },
            i * 0.12
          );
        });

        tl.fromTo(
          closing,
          { autoAlpha: 0, y: 28, rotation: 0 },
          {
            autoAlpha: 1,
            y: 0,
            rotation: 0,
            duration: 1,
            ease: wfEase,
            stagger: 0.1,
          },
          0.5
        );
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className={styles.proof} aria-labelledby="proof-label">
      {/* h2 (not p) so the section exists in screen-reader heading
          navigation — .label class keeps the visual identical. */}
      <h2 id="proof-label" className={`label ${styles.chapter}`}>
        03 — La preuve
      </h2>

      <div className={styles.inner}>
        <ul className={styles.stats}>
          {STATS.map((stat) => (
            <li key={stat.caption} className={styles.cell}>
              <span className={styles.figure}>{stat.format(stat.value)}</span>
              <span className={`label ${styles.caption}`}>{stat.caption}</span>
            </li>
          ))}
        </ul>

        <blockquote className={styles.quote}>{HOME_PULL_QUOTE.text}</blockquote>

        <Link href="/avis" className={`label ${styles.meta}`}>
          {HOME_PULL_QUOTE.name} — Extrait de nos avis · Voir tous les avis →
        </Link>
      </div>
    </section>
  );
}
