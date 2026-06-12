"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import "./scroll"; // registers ScrollTrigger (home namespace)
import Beam from "@/components/home/three/Beam";
import Manifesto from "./Manifesto";
import Method from "./Method";
import Proof from "./Proof";
import FinalCta from "./FinalCta";
import styles from "./HomeStory.module.css";

/**
 * « Longue exposition » wrapper (landing-v2.md §1) — sticky canvas slot
 * (the three.js « Faisceau » + permanent CSS gradient base layer) behind
 * the four chapters Manifesto → Method → Proof → FinalCta.
 *
 * One MASTER ScrollTrigger (scrub 0.8) over the whole wrapper scrubs a
 * plain proxy object { sweep, fade, arrive } that the Scene reads every
 * frame via progressRef; its onUpdate feeds normalized scroll velocity
 * into velocityRef (trail elongation). Reduced-motion: no master trigger —
 * ThreeStage gates itself out and the gradient base layer is the backdrop.
 */

export type HomeProgress = { sweep: number; fade: number; arrive: number };

export default function HomeStory() {
  const wrap = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HomeProgress>({ sweep: 0, fade: 0, arrive: 0 });
  const velocityRef = useRef(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const p = progressRef.current;
        // Pad object so the timeline lasts exactly 1 → tween positions
        // map 1:1 onto master progress fractions from the spec.
        const pad = { v: 0 };

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: wrap.current,
            start: "top bottom",
            end: "bottom bottom",
            scrub: 0.8,
            onUpdate: (self) => {
              velocityRef.current = gsap.utils.clamp(
                0,
                1,
                Math.abs(self.getVelocity()) / 3000
              );
            },
          },
        });

        // fade: 0→1 over p 0.00–0.06 · hold · 1→0.35 over 0.60–0.66 (S3
        // breath) · 0.35→1 over 0.78–0.86 (returns for S4)
        tl.fromTo(p, { fade: 0 }, { fade: 1, duration: 0.06 }, 0)
          .to(p, { fade: 0.35, duration: 0.06 }, 0.6)
          .to(p, { fade: 1, duration: 0.08 }, 0.78)
          // sweep: specular streak crosses S1+S2 over p 0.05–0.65
          .fromTo(p, { sweep: 0 }, { sweep: 1, duration: 0.6 }, 0.05)
          // arrive: trail converges into two headlights over p 0.84–0.98
          .fromTo(p, { arrive: 0 }, { arrive: 1, duration: 0.14 }, 0.84)
          .to(pad, { v: 1, duration: 0.02 }, 0.98);
      });
      // Reduced-motion branch intentionally empty: no master trigger,
      // ThreeStage renders null (its own gate), gradient backdrop only.
    },
    { scope: wrap }
  );

  return (
    <div ref={wrap} className={styles.story}>
      <div className={styles.canvasSlot} aria-hidden="true">
        <Beam progressRef={progressRef} velocityRef={velocityRef} />
      </div>
      <div className={styles.sections}>
        <Manifesto />
        <Method />
        <Proof />
        <FinalCta />
      </div>
    </div>
  );
}
