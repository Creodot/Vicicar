"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap, useGSAP, outQuad, wfEase } from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { asset } from "@/lib/asset";
import { register } from "@/components/home/v3/lib/videoManager";
import { LineSweep } from "@/components/home/v3/lib/Reveal";
import styles from "./FinalCta.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * 04 — À VOUS (landing-v3.md §2.5) — the headlights payoff.
 *
 * The frame the WebGL faked, now real: the I loop (red berline, headlights
 * blazing at camera) as a sharp full-height portrait strip, doubled by a
 * blur(2.5rem) full-bleed halo of the SAME sources (one network fetch) so
 * the whole viewport glows with moving light. Triggered only — no pin, no
 * scrub. « ALLEZ-Y. » masked-rises then performs the hero's own CSS
 * `font-variation-settings` 3 s wdth 0→100 stretch (class toggle), closing
 * the loop with the top of the page.
 *
 * Static markup IS the final / no-JS / reduced-motion state: word at
 * wdth 100, button functional, posters shown (manager = tap-to-play).
 * Mobile never mounts the halo visually (display:none → IO never fires →
 * never fetched): the sharp I loop IS full-bleed native cover.
 */

/** Living-glass hover is for fine pointers with motion allowed only. */
const fineHover = (): boolean =>
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function FinalCta() {
  const root = useRef<HTMLElement>(null);
  const haloVideo = useRef<HTMLVideoElement>(null);
  const panelVideo = useRef<HTMLVideoElement>(null);
  const chapter = useRef<HTMLParagraphElement>(null);
  const word = useRef<HTMLHeadingElement>(null);
  const button = useRef<HTMLAnchorElement>(null);
  const buttonVideo = useRef<HTMLVideoElement>(null);
  const underline = useRef<HTMLSpanElement>(null);
  const sub = useRef<HTMLParagraphElement>(null);

  /* Both I stages → shared manager. FinalCta is the page's MAX_PLAYING=2
     peak (sharp + halo) — they are the only loops on screen here. The halo
     registration lives in a ref so the C3 pill hover can hand its playback
     slot over (release halo → register C3) and the page never exceeds the
     cap; the C3 hover video gets the manager's visibilitychange pause and
     watchdog for free. */
  const haloUnreg = useRef<(() => void) | null>(null);
  const buttonUnreg = useRef<(() => void) | null>(null);
  useEffect(() => {
    const cleanups: (() => void)[] = [];
    if (panelVideo.current) cleanups.push(register(panelVideo.current, { threshold: 0.25 }));
    if (haloVideo.current) haloUnreg.current = register(haloVideo.current, { threshold: 0.25 });
    return () => {
      cleanups.forEach((fn) => fn());
      haloUnreg.current?.();
      haloUnreg.current = null;
      buttonUnreg.current?.();
      buttonUnreg.current = null;
    };
  }, []);

  const { contextSafe } = useGSAP(
    () => {
      gsap.set(underline.current, { xPercent: -105, x: 0 });

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const wordEl = word.current;
        if (!wordEl) return;

        /* Arm the CSS wdth mechanism: condensed + 3 s outQuart transition.
           (The word is masked-hidden by the fromTo below, so the snap to
           wdth 0 is never seen.) */
        wordEl.classList.add(styles.wordAnim);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top 50%",
            once: true,
          },
        });

        tl.fromTo(
          chapter.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.5, ease: wfEase },
          0
        )
          /* Masked rise (0.8 s power2.out)… */
          .fromTo(
            wordEl,
            { yPercent: 110, rotation: 0 },
            { yPercent: 0, rotation: 0, duration: 0.8, ease: "power2.out" },
            0
          )
          /* …then the hero's interruptible CSS stretch, wdth 0→100. */
          .add(() => wordEl.classList.add(styles.wordStretch), 0.8)
          .fromTo(
            button.current,
            { autoAlpha: 0, y: 24, rotation: 0 },
            { autoAlpha: 1, y: 0, rotation: 0, duration: 0.9, ease: wfEase },
            0.35
          )
          .fromTo(
            sub.current,
            { autoAlpha: 0, y: 24, rotation: 0 },
            { autoAlpha: 1, y: 0, rotation: 0, duration: 0.9, ease: wfEase },
            0.5
          );

        return () => {
          wordEl.classList.remove(styles.wordAnim, styles.wordStretch);
        };
      });
    },
    { scope: root }
  );

  /* C3 living-glass hover on the pill (same grammar as the Preuve chip):
     bokeh fades in behind the glass, underline wipes through, radius
     morphs via CSS. Hover-driven — preload="none" until first enter. */
  const onButtonEnter = contextSafe(() => {
    if (!fineHover() || document.hidden) return;
    gsap.to(underline.current, {
      xPercent: 0,
      duration: 0.3,
      ease: outQuad,
      overwrite: true,
    });
    const v = buttonVideo.current;
    if (v) {
      /* Slot hand-over: the halo is fully behind the glass anyway — pause
         it (unregister) and let the manager drive C3, keeping the page at
         MAX_PLAYING=2. */
      haloUnreg.current?.();
      haloUnreg.current = null;
      if (!buttonUnreg.current) buttonUnreg.current = register(v, { threshold: 0.25 });
      gsap.to(v, { autoAlpha: 1, duration: 0.3, ease: outQuad, overwrite: true });
    }
  });

  const onButtonLeave = contextSafe(() => {
    if (!fineHover()) return;
    gsap.to(underline.current, {
      xPercent: 105,
      duration: 0.3,
      ease: outQuad,
      overwrite: true,
      onComplete: () => gsap.set(underline.current, { xPercent: -105 }),
    });
    const v = buttonVideo.current;
    if (v) {
      gsap.to(v, {
        autoAlpha: 0,
        duration: 0.3,
        ease: outQuad,
        overwrite: true,
        onComplete: () => {
          /* Hand the slot back: unregister C3 (pauses it), re-register the
             halo — its IO refires and resumes the glow. */
          buttonUnreg.current?.();
          buttonUnreg.current = null;
          if (haloVideo.current && !haloUnreg.current) {
            haloUnreg.current = register(haloVideo.current, { threshold: 0.25 });
          }
        },
      });
    }
  });

  return (
    <section ref={root} className={styles.cta} aria-labelledby="cta-label">
      {/* Section seam — origin left (alternates with Preuve's right). */}
      <LineSweep origin="left" className={styles.seam} />

      {/* z0 — blurred full-bleed halo of I (desktop only; same sources →
          single fetch, cached). The blur erases the portrait upscale. */}
      <div className={styles.halo} aria-hidden="true">
        <video
          ref={haloVideo}
          className={styles.haloVideo}
          muted
          loop
          playsInline
          preload="none"
          poster={asset("/videos/I-poster.jpg")}
          tabIndex={-1}
        >
          <source src={asset("/videos/I.webm")} type="video/webm" />
          <source src={asset("/videos/I.mp4")} type="video/mp4" />
        </video>
      </div>

      {/* z0.5 — tiled noise to de-band the blur (inline SVG, no asset). */}
      <div className={styles.noise} aria-hidden="true" />

      {/* z1 — sharp I strip: full-height portrait, ~1.25× native = crisp. */}
      <div className={styles.panel} aria-hidden="true">
        <video
          ref={panelVideo}
          className={styles.panelVideo}
          muted
          loop
          playsInline
          preload="none"
          poster={asset("/videos/I-poster.jpg")}
          tabIndex={-1}
        >
          <source src={asset("/videos/I.webm")} type="video/webm" />
          <source src={asset("/videos/I.mp4")} type="video/mp4" />
        </video>
      </div>

      {/* z2 — clean seam into the Footer */}
      <div className={styles.bottomFade} aria-hidden="true" />

      {/* z3 — content */}
      <p ref={chapter} id="cta-label" className={`label ${styles.chapter}`}>
        04 — À vous
      </p>

      <div className={styles.content}>
        <div className={styles.wordMask}>
          <h2 ref={word} className={styles.word}>
            Allez-y.
          </h2>
        </div>

        <Link
          ref={button}
          href="/trouver-ma-voiture"
          className={styles.button}
          onMouseEnter={onButtonEnter}
          onMouseLeave={onButtonLeave}
        >
          <video
            ref={buttonVideo}
            className={styles.buttonVideo}
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
          <span className={styles.buttonText}>
            Trouver ma voiture — Gratuit
            <span className={styles.blockUnderline} aria-hidden="true">
              <span ref={underline} className={styles.underline} />
            </span>
          </span>
        </Link>

        <p ref={sub} className={styles.sub}>
          3&nbsp;minutes aujourd&apos;hui. Un expert au téléphone sous
          24&nbsp;h. Zéro euro, zéro pression.
        </p>
      </div>
    </section>
  );
}
