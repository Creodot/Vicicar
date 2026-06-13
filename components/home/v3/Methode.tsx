"use client";

/**
 * 02 — LA MÉTHODE « step machine » (landing-v3.md §2.3). id="methode".
 *
 * Desktop: 280vh section, CSS-sticky 100dvh stage (never ScrollTrigger
 * pin). Text cols 1–5, a 9:16 portrait media panel cols 7–12 with three
 * stacked loops (I2 → C → A2: unknown → inspection → found), a giant
 * outlined digit bleeding off the viewport's right edge, and a 2px
 * progress rail scrubbed scaleY 0→1. One ScrollTrigger maps progress →
 * active step (triggered-within-sticky, NOT scrubbed — robust both
 * directions): incoming video wipes over the outgoing via clip-path,
 * text/digit masked-swap, active micro flips to --azure.
 *
 * Markup truth: the DOM ships BOTH the stacked per-step media slots and
 * the desktop sticky panel; CSS gates them ([data-cinema] set by the
 * desktop branch). Hidden videos are preload="none" and IO never fires on
 * display:none → zero network cost for the unused variant. Mobile /
 * reduced motion: stacked blocks, per-step corner mask-wipes, posters
 * under reduced motion (tap to play via the shared manager).
 */

import { useEffect, useRef } from "react";
import { asset } from "@/lib/asset";
import { gsap, useGSAP, wfEase } from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { register } from "./lib/videoManager";
import styles from "./Methode.module.css";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    digit: "01",
    loop: "I2", // near-black rear, red light-bar — the car still unknown
    micro: "≈ 3 MINUTES",
    title: "Décrivez votre besoin",
    body: "Budget, usage, envies : trois minutes pour nous dire ce que vous cherchez. C'est tout ce qu'on vous demande.",
  },
  {
    digit: "02",
    loop: "C", // headlight close-up — the expert inspects
    micro: "SOUS 24 H",
    title: "Un expert vous appelle",
    body: "Un spécialiste — pas un algorithme — vous rappelle sous 24 h et affine chaque critère avec vous.",
  },
  {
    digit: "03",
    loop: "A2", // white roadster parked — found, delivered
    micro: "0 € — TOUJOURS",
    title: "Recevez votre sélection",
    body: "On déniche, on vérifie l'historique, on négocie le prix. Vous n'avez plus qu'à choisir et prendre le volant.",
  },
] as const;

function loopSources(name: string) {
  return {
    poster: asset(`/videos/${name}-poster.jpg`),
    webm: asset(`/videos/${name}.webm`),
    mp4: asset(`/videos/${name}.mp4`),
  };
}

export default function Methode() {
  const root = useRef<HTMLElement>(null);

  /* Stacked (mobile / reduced-motion) videos: managed unconditionally —
     on the desktop cinema layout they are display:none, so their IO never
     fires and nothing is fetched. Under reduced motion the manager shows
     posters and arms tap-to-play. */
  useEffect(() => {
    const videos = Array.from(
      root.current?.querySelectorAll<HTMLVideoElement>("[data-step-video]") ??
        []
    );
    const cleanups = videos.map((v) => register(v, { threshold: 0.25 }));
    return () => cleanups.forEach((c) => c());
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      /* Section seam: top hairline sweep (origin right — alternates with
         MarqueeBand's left), any width, no-preference. */
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-seam]",
          { scaleX: 0, rotation: 0, transformOrigin: "right center" },
          {
            scaleX: 1,
            rotation: 0,
            duration: 0.5,
            ease: "power1.inOut",
            scrollTrigger: {
              trigger: root.current,
              start: "top 85%",
              once: true,
            },
          }
        );
      });

      mm.add(
        "(min-width: 992px) and (prefers-reduced-motion: no-preference)",
        () => {
          /* Cinema layout is CSS-gated on this attribute: without JS the
             stacked default stays the truth. Set before any measuring. */
          root.current?.setAttribute("data-cinema", "");

          const steps = gsap.utils.toArray<HTMLElement>("[data-step]");
          const digits = gsap.utils.toArray<HTMLElement>("[data-digit]");
          const medias = gsap.utils.toArray<HTMLElement>("[data-panel-media]");
          const videos = gsap.utils.toArray<HTMLVideoElement>(
            "[data-panel-video]"
          );

          /* Playback strictly through the shared manager: the active
             panel video is registered (IO inside the sticky stage → it
             plays); the outgoing one is unregistered (→ paused) after its
             wipe is covered. */
          const unregs: Array<(() => void) | null> = [null, null, null];
          const setManaged = (i: number, on: boolean) => {
            if (on && !unregs[i]) unregs[i] = register(videos[i]);
            if (!on && unregs[i]) {
              unregs[i]!();
              unregs[i] = null;
            }
          };

          /* Initial machine state — step 01 active. */
          medias.forEach((m, i) =>
            gsap.set(m, {
              clipPath: i === 0 ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)",
              zIndex: i === 0 ? 2 : 1,
            })
          );
          steps.forEach((s, i) => {
            if (i > 0)
              gsap.set(s.querySelectorAll("[data-t]"), {
                yPercent: 110,
                rotation: 0,
              });
          });
          digits.forEach((d, i) => {
            if (i > 0) gsap.set(d, { autoAlpha: 0 });
          });
          steps[0].setAttribute("data-active", "");
          setManaged(0, true);

          /* Entrance for the chapter label, first step and digit (once,
             fires before the sticky engages — and immediately when
             arriving via the #methode anchor). */
          const entrance = gsap.timeline({
            scrollTrigger: {
              trigger: root.current,
              start: "top 78%",
              once: true,
            },
          });
          entrance
            .fromTo(
              "[data-chapter]",
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: 0.5, ease: wfEase },
              0
            )
            .fromTo(
              steps[0].querySelectorAll("[data-t]"),
              { yPercent: 110, rotation: 0 },
              {
                yPercent: 0,
                rotation: 0,
                duration: 0.8,
                ease: "power2.out",
                stagger: 0.1,
              },
              0
            )
            .fromTo(
              digits[0],
              { yPercent: 30, autoAlpha: 0, rotation: 0 },
              {
                yPercent: 0,
                autoAlpha: 1,
                rotation: 0,
                duration: 0.6,
                ease: "power2.out",
              },
              0.2
            );

          /* The swap machine — triggered, not scrubbed. */
          let active = 0;
          let swapTl: gsap.core.Timeline | null = null;

          const swap = (next: number, dir: 1 | -1) => {
            const prev = active;
            active = next;
            swapTl?.kill();
            /* A killed swap timeline never runs its onComplete, so a panel
               video from two swaps ago could keep its manager registration
               (playing invisibly under the active clip, hogging a
               MAX_PLAYING slot). Force-release everything that is neither
               outgoing nor incoming. */
            unregs.forEach((_, i) => {
              if (i !== prev && i !== next) setManaged(i, false);
            });
            setManaged(next, true);
            steps.forEach((s, i) =>
              i === next
                ? s.setAttribute("data-active", "")
                : s.removeAttribute("data-active")
            );
            gsap.set(medias, { zIndex: 1 });
            gsap.set(medias[next], { zIndex: 2 });

            const outItems = steps[prev].querySelectorAll("[data-t]");
            const inItems = steps[next].querySelectorAll("[data-t]");

            swapTl = gsap.timeline({
              onComplete: () => setManaged(prev, false),
            });
            swapTl
              /* Incoming loop wipes over the outgoing — direction-aware. */
              .fromTo(
                medias[next],
                {
                  clipPath:
                    dir === 1 ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)",
                },
                {
                  clipPath: "inset(0% 0% 0% 0%)",
                  duration: 0.7,
                  ease: "power2.inOut",
                },
                0
              )
              .to(
                outItems,
                {
                  yPercent: -110,
                  duration: 0.35,
                  ease: "power2.in",
                  overwrite: "auto",
                },
                0
              )
              .fromTo(
                inItems,
                { yPercent: 110, rotation: 0 },
                {
                  yPercent: 0,
                  rotation: 0,
                  duration: 0.5,
                  ease: "power2.out",
                  stagger: 0.08,
                  overwrite: "auto",
                },
                0.15
              )
              .to(
                digits[prev],
                {
                  autoAlpha: 0,
                  yPercent: -25,
                  duration: 0.4,
                  overwrite: "auto",
                },
                0
              )
              .fromTo(
                digits[next],
                { yPercent: 30, autoAlpha: 0, rotation: 0 },
                {
                  yPercent: 0,
                  autoAlpha: 1,
                  rotation: 0,
                  duration: 0.6,
                  ease: "power2.out",
                  overwrite: "auto",
                },
                0.2
              );
          };

          ScrollTrigger.create({
            trigger: root.current,
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => {
              const idx = Math.min(2, Math.max(0, Math.floor(self.progress * 3)));
              if (idx !== active) swap(idx, self.direction === -1 ? -1 : 1);
            },
          });

          /* Continuous scrub UNDER the step machine — fills the long
             stretches between swaps where only the rail moved. Slow
             y-parallax on the panel videos (scale 1.1 covers the drift)
             and a digit-watermark drift; transform-only, GPU-cheap, and
             never touches the properties the swap machine animates
             (clip-path / per-digit yPercent). */
          gsap.set(videos, { scale: 1.1 });
          gsap.fromTo(
            videos,
            { yPercent: 4, rotation: 0 },
            {
              yPercent: -4,
              rotation: 0,
              ease: "none",
              scrollTrigger: {
                trigger: root.current,
                start: "top top",
                end: "bottom bottom",
                scrub: true,
              },
            }
          );
          gsap.fromTo(
            "[data-digits]",
            { y: 48, rotation: 0 },
            {
              y: -48,
              rotation: 0,
              ease: "none",
              scrollTrigger: {
                trigger: root.current,
                start: "top top",
                end: "bottom bottom",
                scrub: true,
              },
            }
          );

          /* Progress rail — the line-sweep motif as wayfinding. */
          gsap.fromTo(
            "[data-rail-fill]",
            { scaleY: 0, rotation: 0, transformOrigin: "top center" },
            {
              scaleY: 1,
              rotation: 0,
              ease: "none",
              scrollTrigger: {
                trigger: root.current,
                start: "top top",
                end: "bottom bottom",
                scrub: true,
              },
            }
          );

          return () => {
            swapTl?.kill();
            unregs.forEach((u) => u?.());
            steps.forEach((s) => s.removeAttribute("data-active"));
            root.current?.removeAttribute("data-cinema");
          };
        }
      );

      mm.add(
        "(max-width: 991px) and (prefers-reduced-motion: no-preference)",
        () => {
          /* Stacked choreography: per block — hairline sweep (alternating
             origin), masked rises, corner mask-wipe on the loop (1250ms,
             alternating left-bottom / right-bottom / left-bottom). */
          gsap.utils.toArray<HTMLElement>("[data-step]").forEach((step, i) => {
            const rule = step.querySelector("[data-step-rule]");
            const items = step.querySelectorAll("[data-t]");
            const media = step.querySelector<HTMLElement>("[data-step-media]");
            if (media) gsap.set(media, { "--msz": "0%" });

            const tl = gsap.timeline({
              scrollTrigger: { trigger: step, start: "top 78%", once: true },
            });
            tl.fromTo(
              rule,
              {
                scaleX: 0,
                rotation: 0,
                transformOrigin: i % 2 ? "right center" : "left center",
              },
              { scaleX: 1, rotation: 0, duration: 0.5, ease: "power1.inOut" },
              0
            )
              .fromTo(
                items,
                { yPercent: 110, rotation: 0 },
                {
                  yPercent: 0,
                  rotation: 0,
                  duration: 0.5,
                  ease: "power2.out",
                  stagger: 0.08,
                },
                0.15
              )
              .fromTo(
                media,
                { "--msz": "0%" },
                { "--msz": "101%", duration: 1.25, ease: "power1.inOut" },
                0.3
              );
          });
        }
      );

      /* Reduced motion: stacked layout (CSS default), posters, no rail,
         no wipes — nothing hidden, no branch needed. */
    },
    { scope: root }
  );

  return (
    <section id="methode" ref={root} className={styles.methode}>
      <div data-seam="" className={styles.seam} aria-hidden="true" />

      <div className={styles.stage}>
        {/* h2 (not p): the h3 steps nest under this chapter for AT. */}
        <h2 data-chapter="" className={`label ${styles.chapter}`}>
          02 — LA MÉTHODE · COMMENT ÇA MARCHE
        </h2>

        <div className={styles.rail} aria-hidden="true">
          <span data-rail-fill="" className={styles.railFill} />
        </div>

        <ol className={styles.steps}>
          {STEPS.map((step, i) => {
            const src = loopSources(step.loop);
            return (
              <li key={step.digit} data-step="" className={styles.step}>
                <span
                  data-step-rule=""
                  className={styles.stepRule}
                  aria-hidden="true"
                />
                <span className={styles.stepDigit} aria-hidden="true">
                  {step.digit}
                </span>

                <div className={styles.text}>
                  <div className={styles.tMask}>
                    <p data-t="" className={`label ${styles.micro}`}>
                      {step.micro}
                    </p>
                  </div>
                  <div className={styles.tMask}>
                    <h3 data-t="" className={styles.title}>
                      {step.title}
                    </h3>
                  </div>
                  <div className={styles.tMask}>
                    <p data-t="" className={styles.body}>
                      {step.body}
                    </p>
                  </div>
                </div>

                {/* Stacked media slot (mobile / reduced-motion truth). */}
                <div
                  data-step-media=""
                  className={styles.stepMedia}
                  data-alt={i % 2 ? "right" : "left"}
                  aria-hidden="true"
                >
                  <video
                    data-step-video=""
                    className={styles.video}
                    muted
                    loop
                    playsInline
                    preload="none"
                    poster={src.poster}
                  >
                    <source src={src.webm} type="video/webm" />
                    <source src={src.mp4} type="video/mp4" />
                  </video>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Desktop sticky panel: three stacked loops, clip-path wipes. */}
        <div className={styles.panel} aria-hidden="true">
          {STEPS.map((step) => {
            const src = loopSources(step.loop);
            return (
              <div
                key={step.loop}
                data-panel-media=""
                className={styles.panelMedia}
              >
                <video
                  data-panel-video=""
                  className={styles.video}
                  muted
                  loop
                  playsInline
                  preload="none"
                  poster={src.poster}
                >
                  <source src={src.webm} type="video/webm" />
                  <source src={src.mp4} type="video/mp4" />
                </video>
              </div>
            );
          })}
          <span className={styles.panelFrame} />
        </div>

        {/* Giant outlined digits — typographic watermark on moving paint,
            bleeding off the viewport's right edge. */}
        <div data-digits="" className={styles.digits} aria-hidden="true">
          {STEPS.map((step) => (
            <span key={step.digit} data-digit="" className={styles.digit}>
              {step.digit}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
