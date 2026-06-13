"use client";

/**
 * 01 — LE SERVICE « Manifeste » (landing-v3.md §2.1) — the first-scroll WOW.
 *
 * Desktop: CSS-sticky 100dvh stage inside a min(160dvh, 100rem) section.
 * The V loop (dark sedan, industrial loft) is a sharp 9:16 portrait panel
 * that swells scale .55 → 1 under a scrub; the tricolon crosses black +
 * moving video, each line stretching the Octane `wdth` axis 0→100 across
 * staggered windows of section progress. Mobile: V is native full-bleed
 * cover, masked rises one-shot, wdth stretch via interruptible CSS
 * transition (the hero's own mechanism).
 *
 * Static markup IS the final / no-JS / reduced-motion state: lines at
 * wdth 100, full opacity, no sticky/scrub, poster shown (tap to play via
 * the shared manager). Choreography lives only in matchMedia branches.
 */

import { useEffect, useRef } from "react";
import NavLink from "@/components/NavLink";
import { asset } from "@/lib/asset";
import { gsap, useGSAP, wfEase } from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { register } from "./lib/videoManager";
import { Reveal } from "./lib/Reveal";
import styles from "./Manifeste.module.css";

gsap.registerPlugin(ScrollTrigger);

const LINES = ["VOUS DÉCRIVEZ.", "ON DÉNICHE.", "ON NÉGOCIE."];

/* Per-line `wdth` stretch windows over section scrub progress (spec §2.1). */
const WDTH_WINDOWS: ReadonlyArray<readonly [number, number]> = [
  [0.05, 0.35],
  [0.25, 0.6],
  [0.45, 0.85],
];

export default function Manifeste() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  /* Playback via the shared manager only (IO play/pause, MAX_PLAYING cap,
     reduced-motion / save-data = poster + tap-to-play). */
  useEffect(() => {
    if (!video.current) return;
    return register(video.current, { threshold: 0.25 });
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      /* Quantize --wdth to 2-unit steps: at most one cheap text relayout
         per frame during the scrub (carried over from v2). */
      const snapWdth = (v: string) => gsap.utils.snap(2, parseFloat(v));

      /* Entrance — shared recipe, both motion branches (spec: once,
         start "top 75%"). fromTo only: nothing is hidden until JS runs. */
      const entrance = () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top 75%",
            once: true,
          },
        });
        tl.fromTo(
          "[data-label]",
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.5, ease: wfEase },
          0
        )
          .fromTo(
            "[data-line]",
            { yPercent: 110, rotation: 0 },
            {
              yPercent: 0,
              rotation: 0,
              duration: 0.8,
              ease: "power2.out",
              stagger: 0.14,
            },
            0
          )
          .fromTo(
            "[data-link-inner]",
            { yPercent: 110, rotation: 0 },
            { yPercent: 0, rotation: 0, duration: 1, ease: "power2.out" },
            0.4
          );
        return tl;
      };

      mm.add(
        "(min-width: 992px) and (prefers-reduced-motion: no-preference)",
        () => {
          /* Sticky-stage layout + hidden-by-default media states are CSS-
             gated on this attribute so the no-JS truth stays the stacked,
             fully visible markup. */
          root.current?.setAttribute("data-cinema", "");

          entrance();

          /* Swell scrub — transform/opacity only, CSS sticky does the
             pinning (never ScrollTrigger pin). */
          const scrub = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: root.current,
              start: "top 60%",
              end: "bottom bottom",
              scrub: 1,
            },
          });
          scrub
            .fromTo(
              "[data-media]",
              { scale: 0.55, rotation: 0 },
              { scale: 1, rotation: 0, duration: 1 },
              0
            )
            /* Hairline frame fades over the last 20% of the scrub. */
            .fromTo(
              "[data-frame]",
              { autoAlpha: 1 },
              { autoAlpha: 0, duration: 0.2 },
              0.8
            );

          /* Brand gesture over video: per-line wdth 0→100 across the
             progress windows. Linear value interpolation on the scrub. */
          gsap.utils.toArray<HTMLElement>("[data-line]").forEach((line, i) => {
            const [from, to] = WDTH_WINDOWS[i];
            scrub.fromTo(
              line,
              { "--wdth": 0 },
              {
                "--wdth": 100,
                duration: to - from,
                modifiers: { "--wdth": snapWdth },
              },
              from
            );
          });

          return () => root.current?.removeAttribute("data-cinema");
        }
      );

      mm.add(
        "(max-width: 991px) and (prefers-reduced-motion: no-preference)",
        () => {
          const lines = gsap.utils.toArray<HTMLElement>("[data-line]");

          /* Rest condensed until the stretch fires (no transition class
             yet → instant, invisible inside the masks). */
          gsap.set(lines, { "--wdth": 0 });

          const tl = entrance();

          /* After each line's rise: interruptible CSS transition
             font-variation-settings 3s outQuart (class toggle — the
             hero's own mechanism), stagger .25s. */
          lines.forEach((line, i) => {
            tl.call(
              () => {
                line.classList.add(styles.stretch);
                requestAnimationFrame(() =>
                  line.style.setProperty("--wdth", "100")
                );
              },
              [],
              0.6 + i * 0.25
            );
          });

          return () => {
            lines.forEach((line) => line.classList.remove(styles.stretch));
          };
        }
      );

      /* Reduced motion (all widths): no branch — static markup already
         shows wdth 100, full opacity, poster. */
    },
    { scope: root }
  );

  return (
    <section ref={root} className={styles.manifeste}>
      <div className={styles.stage}>
        {/* V loop — sharp portrait panel (desktop) / full-bleed cover
            (mobile). Sources fetched only when the manager asks. */}
        <div data-media="" className={styles.media} aria-hidden="true">
          <video
            ref={video}
            className={styles.video}
            muted
            loop
            playsInline
            preload="none"
            poster={asset("/videos/V-poster.jpg")}
          >
            <source src={asset("/videos/V.webm")} type="video/webm" />
            <source src={asset("/videos/V.mp4")} type="video/mp4" />
          </video>
          <span data-frame="" className={styles.frame} />
        </div>

        <div className={styles.seamGradient} aria-hidden="true" />

        <p data-label="" className={`label ${styles.chapter}`}>
          01 — LE SERVICE
        </p>

        <h2 className={styles.lines}>
          {LINES.map((line) => (
            <span key={line} className={styles.mask}>
              <span data-line="" className={styles.line}>
                {line}
              </span>
            </span>
          ))}
        </h2>

        <div className={styles.bottom}>
          <Reveal className={styles.body} delay={0.4}>
            La bonne voiture, au bon prix, sans y passer vos soirées. Un
            expert dédié la déniche, vérifie chaque détail et négocie à votre
            place. Vous ne payez rien — vous n&apos;avez qu&apos;à dire oui.
          </Reveal>
          <div className={styles.linkMask}>
            <div data-link-inner="" className={styles.linkInner}>
              <NavLink href="#methode" label="Découvrir la méthode ↓" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
