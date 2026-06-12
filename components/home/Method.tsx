"use client";

import { useRef } from "react";
import { gsap, useGSAP, outQuad } from "@/lib/gsap";
import { ScrollTrigger } from "./scroll";
import styles from "./Method.module.css";

/**
 * S2 — « 02 — LA MÉTHODE » (landing-v2.md §5). Three "frames" cross-fading
 * in place like cut titles under a desktop pin (+=110%): giant outlined
 * digit right-bleeding, fill layer wiping up (clip-path) while the frame
 * is active, hairline progress at the left gutter. Markup is ALWAYS the
 * stacked vertical list (accessible / no-JS / reduced-motion truth) — the
 * grid crossfade layout is CSS-gated to (min-width: 992px) and
 * (prefers-reduced-motion: no-preference). Mobile: stacked 75svh blocks,
 * one-shot reveals, digit as watermark.
 */

const FRAMES = [
  {
    digit: "01",
    micro: "≈ 3 MINUTES",
    title: "Décrivez votre besoin",
    body: "Budget, usage, envies. Trois minutes suffisent pour dresser le portrait de votre voiture idéale.",
  },
  {
    digit: "02",
    micro: "SOUS 24 H",
    title: "Un expert vous appelle",
    body: "Un spécialiste — pas un algorithme — vous rappelle pour affiner chaque critère avec vous.",
  },
  {
    digit: "03",
    micro: "0 € — TOUJOURS",
    title: "Recevez votre sélection",
    body: "Nous dénichons, vérifions l'historique et négocions le prix. Vous n'avez plus qu'à choisir.",
  },
];

export default function Method() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 992px) and (prefers-reduced-motion: no-preference)",
        () => {
          // The grid crossfade layout in CSS is gated on this attribute:
          // without JS (or before hydration) the GSAP autoAlpha hiding of
          // frames 2-3 never runs, so the stacked default must stay the
          // truth. Set BEFORE the gsap.set calls and timeline so the pin
          // measures the grid layout.
          root.current?.setAttribute("data-cinema", "");

          const frames = gsap.utils.toArray<HTMLElement>("[data-frame]");

          // Initial states (only here — CSS default state is fully visible
          // and filled for no-JS / reduced-motion).
          frames.forEach((frame, i) => {
            const digit = frame.querySelector("[data-digit]");
            const fill = frame.querySelector("[data-fill]");
            const items = frame.querySelectorAll("[data-t]");
            gsap.set(fill, { clipPath: "inset(100% 0 0 0)" });
            gsap.set(items, { autoAlpha: 0, y: 36, rotation: 0 });
            // x: 0 neutralizes the CSS translateX(8%) GSAP parses as px.
            if (i === 0) {
              gsap.set(digit, { xPercent: 8, x: 0, rotation: 0 });
            } else {
              gsap.set(digit, { autoAlpha: 0, xPercent: 16, x: 0, rotation: 0 });
            }
          });

          // One timeline, three equal thirds (duration 3 → third i = [i, i+1]).
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "+=110%",
              scrub: 0.7,
              pin: true,
              anticipatePin: 1,
            },
          });

          frames.forEach((frame, i) => {
            const digit = frame.querySelector("[data-digit]");
            const fill = frame.querySelector("[data-fill]");
            const items = frame.querySelectorAll("[data-t]");

            if (i > 0) {
              // Outgoing frame (i−1) over the first 25% of the third.
              tl.to(
                frames[i - 1],
                { autoAlpha: 0, xPercent: -4, rotation: 0, duration: 0.25 },
                i
              );
              // Incoming digit over the first 30% of the third.
              tl.to(digit, { autoAlpha: 1, xPercent: 8, duration: 0.3 }, i);
            }
            // Text column in the first 35% of the third.
            tl.to(
              items,
              { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.06 },
              i
            );
            // The digit "fills with light" across the middle 60% of the third.
            tl.to(
              fill,
              { clipPath: "inset(0% 0 0 0)", duration: 0.6 },
              i + 0.2
            );
            // Frame 3 never exits — holds to pin end.
          });

          // Hairline fill across the entire pin — the persistent motion cue.
          tl.fromTo(
            "[data-hairline-fill]",
            { scaleY: 0, rotation: 0, transformOrigin: "top" },
            { scaleY: 1, duration: 3 },
            0
          );

          // Revert to the stacked CSS default on breakpoint/preference change.
          return () => root.current?.removeAttribute("data-cinema");
        }
      );

      mm.add(
        "(max-width: 991px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.utils.toArray<HTMLElement>("[data-frame]").forEach((frame) => {
            const fill = frame.querySelector("[data-fill]");
            gsap.set(frame, { autoAlpha: 0, y: 32, rotation: 0 });
            gsap.set(fill, { clipPath: "inset(100% 0 0 0)" });

            const tl = gsap.timeline({
              scrollTrigger: { trigger: frame, start: "top 78%", once: true },
            });
            tl.to(
              frame,
              { autoAlpha: 1, y: 0, duration: 0.8, ease: outQuad },
              0
            ).to(
              fill,
              { clipPath: "inset(0% 0 0 0)", duration: 1.2, ease: "power3.out" },
              0.2
            );
          });
        }
      );

      // Reduced-motion: stacked layout (CSS default), everything visible,
      // digit fill at inset(0) (CSS default) — no triggers.

      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    },
    { scope: root }
  );

  return (
    <section id="methode" ref={root} className={styles.method}>
      {/* h2 (not p) so the h3 steps nest under this chapter in
          screen-reader heading navigation — .label keeps the visual. */}
      <h2 className={`label ${styles.chapter}`}>
        02 — LA MÉTHODE · COMMENT ÇA MARCHE
      </h2>

      <div className={styles.hairline} aria-hidden="true">
        <span data-hairline-fill="" className={styles.hairlineFill} />
      </div>

      <ol className={styles.frames}>
        {FRAMES.map((frame) => (
          <li key={frame.digit} data-frame="" className={styles.frame}>
            <div className={styles.text}>
              <p data-t="" className={`label ${styles.micro}`}>
                {frame.micro}
              </p>
              <h3 data-t="" className={styles.title}>
                {frame.title}
              </h3>
              <p data-t="" className={styles.body}>
                {frame.body}
              </p>
            </div>
            <div data-digit="" className={styles.digit} aria-hidden="true">
              {frame.digit}
              <span data-fill="" className={styles.digitFill}>
                {frame.digit}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
