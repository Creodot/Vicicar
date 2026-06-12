"use client";

import { useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap, useGSAP, wfEase } from "@/lib/gsap";
import styles from "./MissionSection.module.css";

gsap.registerPlugin(ScrollTrigger);

type MissionSectionProps = {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  /** alternate the editorial layout (title right / body left) */
  flip?: boolean;
};

/**
 * Mission sections of /a-propos (content-ux.md §3.2–3.4).
 * Editorial layout: eyebrow micro-label, huge Octane title (~5vw), body
 * paragraphs offset to the opposite half — alternating per section.
 * Scroll reveal = house style a-34 (animations.md §4c): autoAlpha 0→1
 * (+ y 40→0), wfEase, fired once at "top 80%"; the Octane title also
 * stretches `wdth` 0→25 via a CSS transition triggered by the reveal class.
 */
export default function MissionSection({
  eyebrow,
  title,
  paragraphs,
  flip = false,
}: MissionSectionProps) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set("[data-reveal]", { autoAlpha: 0, y: 40 });
        gsap.to("[data-reveal]", {
          autoAlpha: 1,
          y: 0,
          duration: 1.2,
          ease: wfEase,
          stagger: 0.12,
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            once: true,
            onEnter: () => el.classList.add(styles.in),
          },
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        /* No motion: content stays visible; title snaps to its final width
           (the CSS transition is disabled under the same media query). */
        el.classList.add(styles.in);
      });

      /* Variable fonts swap in late → recompute trigger positions. */
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      className={flip ? `${styles.section} ${styles.flip}` : styles.section}
    >
      <div className={styles.inner}>
        <p className={`label ${styles.eyebrow}`} data-reveal="">
          {eyebrow}
        </p>
        <h2 className={styles.title} data-reveal="">
          {title}
        </h2>
        <div className={styles.body}>
          {paragraphs.map((text, i) => (
            <p key={i} className={styles.paragraph} data-reveal="">
              {text}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
