"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap, useGSAP, outQuad, wfEase } from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { asset } from "@/lib/asset";
import { register } from "@/components/home/v3/lib/videoManager";
import { Reveal, LineSweep } from "@/components/home/v3/lib/Reveal";
import { HOME_PULL_QUOTE } from "@/components/avis/testimonials";
import styles from "./Preuve.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * 03 — LA PREUVE (landing-v3.md §2.4) — the quiet editorial scene.
 *
 * LEFT: the R loop (French plate — authenticity) as a sharp portrait panel,
 * revealed by a corner mask-wipe from left-bottom (1250 ms, once).
 * RIGHT: three ledger rows (hairline sweeps, figures masked-rise — final
 * values live in the markup, no JS counting), the pull-quote (masked
 * per-line rise) and a glass meta chip whose hover breathes the C3 bokeh
 * loop behind the glass (desktop pointers only — never gated content).
 *
 * Static markup IS the final / no-JS / reduced-motion state; choreography
 * exists only inside the `no-preference` matchMedia branch.
 */

const STATS = [
  { figure: "100 %", caption: "Gratuit, sans exception" },
  { figure: "+250", caption: "Voitures trouvées" },
  { figure: "4,9/5", caption: "Note de nos clients" },
];

/** Living-glass hover is for fine pointers with motion allowed only. */
const fineHover = (): boolean =>
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Preuve() {
  const root = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const chip = useRef<HTMLAnchorElement>(null);
  const chipVideo = useRef<HTMLVideoElement>(null);
  const underline = useRef<HTMLSpanElement>(null);

  /* R loop → shared playback manager (IO play/pause, MAX_PLAYING cap,
     reduced-motion/saveData = poster + tap-to-play). The hover-driven C3
     chip video also goes through the manager (registered on enter,
     released on leave) so it counts against the cap and inherits the
     visibilitychange pause + watchdog. */
  const chipUnreg = useRef<(() => void) | null>(null);
  useEffect(() => {
    const unreg = video.current
      ? register(video.current, { threshold: 0.25 })
      : null;
    return () => {
      unreg?.();
      chipUnreg.current?.();
      chipUnreg.current = null;
    };
  }, []);

  const { contextSafe } = useGSAP(
    () => {
      /* Sync GSAP's xPercent with the CSS resting state (translateX(-105%)). */
      gsap.set(underline.current, { xPercent: -105, x: 0 });

      const mm = gsap.matchMedia();

      mm.add(
        {
          motionOK: "(prefers-reduced-motion: no-preference)",
          stacked: "(max-width: 991px)",
        },
        (ctx) => {
          if (!ctx.conditions?.motionOK) return;

          /* Corner mask-wipe from left-bottom (spec: 1250 ms ease-in-out,
             once). Static CSS = fully revealed. Stacked layouts put the
             (mostly near-black) R panel right under the label — fire at
             70% visibility there so mobile never scrolls into a black
             dead beat. */
          gsap.fromTo(
            panel.current,
            { webkitMaskSize: "0% 0%", maskSize: "0% 0%" },
            {
              webkitMaskSize: "101% 101%",
              maskSize: "101% 101%",
              duration: 1.25,
              ease: "power1.inOut",
              scrollTrigger: {
                trigger: panel.current,
                start: ctx.conditions.stacked ? "top 70%" : "top 50%",
                once: true,
              },
            }
          );

          /* Meta chip — soft rise after the quote settles. */
          gsap.fromTo(
            chip.current,
            { autoAlpha: 0, y: 16, rotation: 0 },
            {
              autoAlpha: 1,
              y: 0,
              rotation: 0,
              duration: 0.8,
              ease: wfEase,
              scrollTrigger: {
                trigger: chip.current,
                start: "top 92%",
                once: true,
              },
            }
          );
        }
      );
    },
    { scope: root }
  );

  /* Living-glass hover: C3 bokeh fades in behind the glass; underline
     wipes through (NavLink grammar). The C3 <video> is hover-driven —
     preload="none" means nothing loads before first enter, when it is
     registered with the manager (which load()s and play()s it). */
  const onChipEnter = contextSafe(() => {
    if (!fineHover() || document.hidden) return;
    gsap.to(underline.current, {
      xPercent: 0,
      duration: 0.3,
      ease: outQuad,
      overwrite: true,
    });
    const v = chipVideo.current;
    if (v) {
      if (!chipUnreg.current) chipUnreg.current = register(v, { threshold: 0.25 });
      gsap.to(v, { autoAlpha: 1, duration: 0.3, ease: outQuad, overwrite: true });
    }
  });

  const onChipLeave = contextSafe(() => {
    if (!fineHover()) return;
    gsap.to(underline.current, {
      xPercent: 105,
      duration: 0.3,
      ease: outQuad,
      overwrite: true,
      onComplete: () => gsap.set(underline.current, { xPercent: -105 }),
    });
    const v = chipVideo.current;
    if (v) {
      gsap.to(v, {
        autoAlpha: 0,
        duration: 0.3,
        ease: outQuad,
        overwrite: true,
        onComplete: () => {
          /* Unregister = manager pause + slot freed. */
          chipUnreg.current?.();
          chipUnreg.current = null;
        },
      });
    }
  });

  return (
    <section ref={root} className={styles.preuve} aria-labelledby="preuve-label">
      {/* Section seam — hairline sweeps in (origin right: alternates per section). */}
      <LineSweep origin="right" className={styles.seam} />

      {/* h2 (not p): the chapter exists in screen-reader heading navigation. */}
      <h2 id="preuve-label" className={`label ${styles.chapter}`}>
        03 — La preuve
      </h2>

      <div className={styles.grid}>
        {/* R loop — real car, real French plate. Sharp near-native portrait
            panel on desktop; full-bleed native cover on mobile. */}
        <div ref={panel} className={styles.panelWrap}>
          <video
            ref={video}
            className={styles.panelVideo}
            muted
            loop
            playsInline
            preload="none"
            poster={asset("/videos/R-poster.jpg")}
            aria-hidden="true"
            tabIndex={-1}
          >
            <source src={asset("/videos/R.webm")} type="video/webm" />
            <source src={asset("/videos/R.mp4")} type="video/mp4" />
          </video>
        </div>

        <div className={styles.right}>
          {/* Ledger — figures are final in the markup (count-up is dead). */}
          <ul className={styles.stats}>
            {STATS.map((stat, i) => (
              <li key={stat.caption} className={styles.row}>
                <LineSweep
                  origin={i % 2 === 0 ? "left" : "right"}
                  delay={i * 0.15}
                />
                <div className={styles.rowInner}>
                  <Reveal
                    as="span"
                    className={styles.figure}
                    duration={0.6}
                    delay={i * 0.15}
                  >
                    {stat.figure}
                  </Reveal>
                  <span className={`label ${styles.caption}`}>
                    {stat.caption}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          {/* Pull-quote — masked per-line rise (stately paragraph cadence). */}
          <Reveal
            as="blockquote"
            className={styles.quote}
            duration={1}
            stagger={0.18}
          >
            {HOME_PULL_QUOTE.text}
          </Reveal>

          {/* Meta chip → /avis. Glass; C3 living-glass on hover (desktop). */}
          <Link
            ref={chip}
            href="/avis"
            className={styles.chip}
            onMouseEnter={onChipEnter}
            onMouseLeave={onChipLeave}
          >
            <video
              ref={chipVideo}
              className={styles.chipVideo}
              muted
              loop
              playsInline
              preload="none"
              poster={asset("/videos/C3-poster.jpg")}
              aria-hidden="true"
              tabIndex={-1}
            >
              <source src={asset("/videos/C3.webm")} type="video/webm" />
              <source src={asset("/videos/C3.mp4")} type="video/mp4" />
            </video>
            <span className={`label ${styles.chipText}`}>
              {HOME_PULL_QUOTE.name} — Extrait de nos avis ·{" "}
              <span className={styles.chipLink}>
                Voir tous les avis →
                <span className={styles.blockUnderline} aria-hidden="true">
                  <span ref={underline} className={styles.underline} />
                </span>
              </span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
