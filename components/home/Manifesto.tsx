"use client";

import { useRef } from "react";
import NavLink from "@/components/NavLink";
import { gsap, useGSAP, outQuad, wfEase } from "@/lib/gsap";
import { ScrollTrigger } from "./scroll";
import styles from "./Manifesto.module.css";

/**
 * S1 — « 01 — LE SERVICE » (landing-v2.md §4). One striking statement in
 * three film-credit lines; each line stretches the Octane `wdth` axis
 * 0→100 under a desktop pin (compressed = search unresolved, full-width =
 * the car found). Mobile: no pin, the AvisCta signature fired once.
 * Static markup is the final visible state (--wdth defaults to 100) —
 * hidden states only inside no-preference branches.
 */

const LINES = ["VOUS DÉCRIVEZ.", "ON DÉNICHE.", "ON NÉGOCIE."];

export default function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // Quantize --wdth to 2-unit steps so at most one cheap relayout per frame.
      const snapWdth = (v: string) => gsap.utils.snap(2, parseFloat(v));

      mm.add(
        "(prefers-reduced-motion: no-preference) and (min-width: 992px)",
        () => {
          const lines = gsap.utils.toArray<HTMLElement>("[data-line]");

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "+=70%",
              scrub: 0.7,
              pin: true,
              anticipatePin: 1,
            },
          });

          lines.forEach((line, i) => {
            tl.fromTo(
              line,
              { "--wdth": 0, autoAlpha: 0.15, x: "2vw", rotation: 0 },
              {
                "--wdth": 100,
                autoAlpha: 1,
                x: 0,
                duration: 0.45,
                modifiers: { "--wdth": snapWdth },
              },
              i * 0.18
            );
          });

          // Body + link in the last quarter of the pin.
          tl.fromTo(
            "[data-body]",
            { autoAlpha: 0, y: 30, rotation: 0 },
            { autoAlpha: 1, y: 0, duration: 0.25, ease: wfEase },
            0.75
          ).fromTo(
            "[data-link]",
            { autoAlpha: 0, y: 30, rotation: 0 },
            { autoAlpha: 1, y: 0, duration: 0.2, ease: wfEase },
            0.8
          );
        }
      );

      mm.add(
        "(prefers-reduced-motion: no-preference) and (max-width: 991px)",
        () => {
          gsap.set("[data-line]", {
            autoAlpha: 0,
            y: 24,
            "--wdth": 40,
            rotation: 0,
          });
          gsap.set(["[data-body]", "[data-link]"], {
            autoAlpha: 0,
            y: 24,
            rotation: 0,
          });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root.current,
              start: "top 75%",
              once: true,
            },
          });
          tl.to(
            "[data-line]",
            { autoAlpha: 1, y: 0, duration: 0.9, ease: outQuad, stagger: 0.15 },
            0
          )
            .to(
              "[data-line]",
              {
                "--wdth": 100,
                duration: 1.6,
                ease: "power3.out",
                stagger: 0.15,
              },
              0
            )
            .to(
              ["[data-body]", "[data-link]"],
              { autoAlpha: 1, y: 0, duration: 0.9, ease: wfEase, stagger: 0.1 },
              0.3
            );
        }
      );

      // Reduced-motion (all widths): no triggers, nothing hidden — static
      // markup already shows --wdth 100 and full opacity.

      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    },
    { scope: root }
  );

  return (
    <section ref={root} className={styles.manifesto}>
      <p className={`label ${styles.chapter}`}>01 — LE SERVICE</p>

      <h2 className={styles.lines}>
        {LINES.map((line) => (
          <span key={line} data-line="" className={styles.line}>
            {line}
          </span>
        ))}
      </h2>

      <div className={styles.bottom}>
        <p data-body="" className={styles.body}>
          Vicicar est un service de recherche automobile sur-mesure. Un expert
          dédié déniche, vérifie et négocie votre prochaine voiture à votre
          place — et cela ne vous coûte rien.
        </p>
        <div data-link="" className={styles.link}>
          <NavLink href="#methode" label="Découvrir la méthode ↓" />
        </div>
      </div>
    </section>
  );
}
