"use client";

import { useRef } from "react";
import { gsap, useGSAP, wfEase } from "@/lib/gsap";
import "./scroll"; // registers ScrollTrigger (avis namespace)
import { TESTIMONIALS } from "./testimonials";
import styles from "./TestimonialList.module.css";

/**
 * Editorial testimonial rows (content-ux.md §2.2): one review = one
 * full-width row separated by 1px --border. Scroll reveal per row at 80%
 * of the viewport: autoAlpha 0→1, y 40→0, inner stagger (index, quote,
 * meta), wfEase — the house reveal (animations.md §4c), played once.
 * Hidden states are applied by GSAP only in the animated branch, so
 * reduced-motion (and no-JS) users always see the content.
 */
export default function TestimonialList() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const rows = gsap.utils.toArray<HTMLElement>(`.${styles.row}`);
        rows.forEach((row) => {
          const parts = row.querySelectorAll(
            `.${styles.index}, .${styles.quote}, .${styles.meta}`
          );
          gsap.set(parts, { autoAlpha: 0, y: 40 });
          gsap.to(parts, {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: wfEase,
            stagger: 0.1,
            scrollTrigger: {
              trigger: row,
              start: "top 80%",
              once: true,
            },
          });
        });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className={styles.section} aria-label="Témoignages de clients Vicicar">
      <ol className={styles.list} role="list">
        {TESTIMONIALS.map((t, i) => (
          <li key={t.name} className={styles.row}>
            <p className={styles.index} aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </p>
            <blockquote className={styles.quote}>{t.quote}</blockquote>
            <div className={styles.meta}>
              <p className={styles.stars} role="img" aria-label="5 étoiles sur 5">
                ★★★★★
              </p>
              <p className={styles.person}>
                <span className={styles.name}>{t.name}</span>
                <span className={styles.city}> — {t.city}</span>
              </p>
              <p className={styles.car}>
                <span className={styles.carLabel}>VOITURE TROUVÉE :</span> {t.car}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
