"use client";

/**
 * ThreeStage — public wrapper for « Le Faisceau » (spec §2.1, aka Beam).
 *
 * The ONLY file the rest of the app needs to import (also re-exported as
 * ./Beam per the spec's file plan). Renders an absolutely-positioned host
 * inside HomeStory's sticky `.canvasSlot` and lazy-mounts the imperative
 * three.js Scene behind four gates:
 *
 *   1. IntersectionObserver (rootMargin 25% — scroll intent, not page
 *      load, so the three chunk + GL context never compete with the
 *      hero's LCP work) on the HomeStory wrapper — the element matching
 *      `[data-beam-root]` if present, else the canvasSlot's parent
 *      (spec DOM: wrap > canvasSlot > ThreeStage). Once mounted it stays
 *      mounted: Scene pauses its own render loop when offscreen and full
 *      disposal happens on unmount at route change.
 *   2. No `prefers-reduced-motion: reduce` (live — unmounts on change).
 *   3. WebGL2 or WebGL1 available (try/catch).
 *   4. (navigator.deviceMemory ?? 8) > 2.
 *
 * Any gate fails → renders nothing: the always-on CSS radial-gradient on
 * `.canvasSlot::before` is the fallback. Content never depends on this.
 *
 * Driving API (no re-renders — mutable refs read every ticker frame):
 *   - progressRef.current = { sweep, fade, arrive }  each 0..1
 *   - velocityRef.current = 0..1 (|ScrollTrigger velocity| / 3000, clamped)
 * HomeStory's master ScrollTrigger writes these; Scene lerps velocity at
 * 0.08/frame internally.
 */

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

/** Values written by HomeStory's master ScrollTrigger proxy (all 0..1). */
export interface BeamProgress {
  /** Specular streak position across S1+S2 (master p 0.05–0.65). */
  sweep: number;
  /** Canvas master opacity (1 → 0.35 for the S3 breath → back to 1). */
  fade: number;
  /** Trail convergence into the two S4 headlights (master p 0.84–0.98). */
  arrive: number;
}

/** Minimal mutable-ref shape (works with useRef and plain objects). */
export interface MutableRef<T> {
  current: T;
}

export interface ThreeStageProps {
  progressRef: MutableRef<BeamProgress>;
  velocityRef: MutableRef<number>;
}

/** Convenience initial value for `useRef<BeamProgress>(createBeamProgress())`. */
export const createBeamProgress = (): BeamProgress => ({
  sweep: 0,
  fade: 0,
  arrive: 0,
});

/* Module-level cache: WebGL availability doesn't change within a session,
   and browsers cap live WebGL contexts (~16) — probe exactly once and
   release the probe context explicitly instead of abandoning it to GC. */
let webglOk: boolean | null = null;
const hasWebGL = (): boolean => {
  if (webglOk !== null) return webglOk;
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    webglOk = !!gl;
  } catch {
    webglOk = false;
  }
  return webglOk;
};

export default function ThreeStage({
  progressRef,
  velocityRef,
}: ThreeStageProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  /** Set on webglcontextlost — permanent fall back to the CSS gradient. */
  const [dead, setDead] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    /* Static capability gates (2–4). */
    const nav = navigator as Navigator & { deviceMemory?: number };
    if (!hasWebGL() || (nav.deviceMemory ?? 8) <= 2) return;

    /* Gate 2 — reduced motion, kept live. */
    const rm = matchMedia("(prefers-reduced-motion: reduce)");
    if (rm.matches) {
      /* Still listen: if the user relaxes the preference, mount via IO. */
    }

    /* Gate 1 — IO on the HomeStory wrapper. */
    const target =
      (host.closest("[data-beam-root]") as HTMLElement | null) ??
      host.parentElement?.parentElement ??
      host.parentElement ??
      host;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (rm.matches) {
          setMounted(false);
          return;
        }
        if (entry.isIntersecting) {
          setMounted(true);
        }
        /* No scroll-away unmount: Scene pauses its own render loop when
           the slot leaves the viewport, and the renderer/buffers are
           disposed on route change (component unmount). */
      },
      { rootMargin: "25% 0px" }
    );
    io.observe(target);

    const onRmChange = () => {
      if (rm.matches) {
        setMounted(false);
      } else {
        /* IO callbacks only fire on intersection-state TRANSITIONS — if the
           wrapper is already (and stays) intersecting when the preference
           relaxes, no callback would ever come. Re-observing always delivers
           a fresh initial callback, which re-mounts if in view. */
        io.unobserve(target);
        io.observe(target);
      }
    };
    rm.addEventListener("change", onRmChange);

    return () => {
      io.disconnect();
      rm.removeEventListener("change", onRmChange);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {mounted && !dead && (
        <Scene
          progressRef={progressRef}
          velocityRef={velocityRef}
          onContextLost={() => setDead(true)}
        />
      )}
    </div>
  );
}
