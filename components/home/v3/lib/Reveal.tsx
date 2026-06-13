"use client";

/**
 * Shared reveal primitives (spec §1 seams + §3.6 discipline):
 *
 * - splitLines(el)  — tiny line-splitter (no SplitText club plugin).
 * - <Reveal>        — masked split-line rise: lines wrapped in
 *                     overflow:clip masks, yPercent 110→0 stagger,
 *                     power2.out, once, on scroll into view.
 * - <LineSweep>     — 1px hairline rule, scaleX 0→1 (origin left|right),
 *                     0.5s power1.inOut, once, on scroll into view.
 *
 * Static markup IS the final / no-JS / reduced-motion state: choreography
 * exists only inside the `prefers-reduced-motion: no-preference` matchMedia
 * branch. All tweens are fromTo with explicit rotation: 0 on both ends
 * (phantom-rotation guard).
 */

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Reveal.module.css";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/* Line splitter                                                       */
/* ------------------------------------------------------------------ */

/**
 * Split an element's PLAIN TEXT into visual lines, each wrapped in an
 * overflow:clip mask span. Returns the inner (animatable) line elements.
 * Only text content is supported (child elements are flattened to text).
 * Call `restore` (or re-set textContent) to undo.
 */
export function splitLines(el: HTMLElement): {
  lines: HTMLElement[];
  restore: () => void;
} {
  const original = el.textContent ?? "";
  const words = original.split(/\s+/).filter(Boolean);

  /* Pass 1: wrap words to measure natural line wrapping. */
  el.textContent = "";
  const probes: HTMLSpanElement[] = words.map((word) => {
    const span = document.createElement("span");
    span.style.display = "inline-block";
    span.textContent = word;
    el.appendChild(span);
    el.appendChild(document.createTextNode(" "));
    return span;
  });

  const grouped: string[][] = [];
  let lastTop: number | null = null;
  for (const probe of probes) {
    if (probe.offsetTop !== lastTop) {
      grouped.push([]);
      lastTop = probe.offsetTop;
    }
    grouped[grouped.length - 1].push(probe.textContent ?? "");
  }

  /* Pass 2: rebuild as mask > line blocks (same metrics — no CLS). */
  el.textContent = "";
  const lines = grouped.map((lineWords) => {
    const mask = document.createElement("span");
    mask.className = styles.mask;
    const line = document.createElement("span");
    line.className = styles.line;
    line.textContent = lineWords.join(" ");
    mask.appendChild(line);
    el.appendChild(mask);
    return line as HTMLElement;
  });

  return {
    lines,
    restore: () => {
      el.textContent = original;
    },
  };
}

/* ------------------------------------------------------------------ */
/* <Reveal> — masked split-line rise                                   */
/* ------------------------------------------------------------------ */

export type RevealProps = {
  /** Rendered tag. Default "p". */
  as?: ElementType;
  /** Plain text content (the splitter flattens markup). */
  children: ReactNode;
  className?: string;
  /** Per-line stagger in s. Default 0.12. */
  stagger?: number;
  /** Per-line duration in s. Default 1 (spec's paragraph cadence). */
  duration?: number;
  /** Delay before the first line, in s. Default 0. */
  delay?: number;
  /** ScrollTrigger start. Default "top 80%". */
  start?: string;
  id?: string;
};

export function Reveal({
  as: Tag = "p",
  children,
  className,
  stagger = 0.12,
  duration = 1,
  delay = 0,
  start = "top 80%",
  id,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        let cancelled = false;
        let tween: gsap.core.Tween | undefined;
        let restore: (() => void) | undefined;

        const build = () => {
          if (cancelled) return;
          const split = splitLines(el);
          restore = split.restore;
          tween = gsap.fromTo(
            split.lines,
            { yPercent: 110, rotation: 0 },
            {
              yPercent: 0,
              rotation: 0,
              duration,
              delay,
              ease: "power2.out",
              stagger,
              scrollTrigger: { trigger: el, start, once: true },
            }
          );
        };

        /* Octane/Oak metrics shift while loading — split on stable fonts. */
        if (document.fonts && document.fonts.status !== "loaded") {
          document.fonts.ready.then(build);
        } else {
          build();
        }

        return () => {
          cancelled = true;
          tween?.scrollTrigger?.kill();
          tween?.kill();
          restore?.();
        };
      });
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref} className={className} id={id}>
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* <LineSweep> — hairline rule, scaleX 0→1                             */
/* ------------------------------------------------------------------ */

export type LineSweepProps = {
  /** transform-origin side. Default "left". */
  origin?: "left" | "right";
  className?: string;
  /** Sweep duration in s. Default 0.5 (spec). */
  duration?: number;
  /** Delay in s. Default 0. */
  delay?: number;
  /** ScrollTrigger start. Default "top 85%". */
  start?: string;
};

export function LineSweep({
  origin = "left",
  className,
  duration = 0.5,
  delay = 0,
  start = "top 85%",
}: LineSweepProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tween = gsap.fromTo(
          el,
          { scaleX: 0, rotation: 0 },
          {
            scaleX: 1,
            rotation: 0,
            duration,
            delay,
            ease: "power1.inOut",
            scrollTrigger: { trigger: el, start, once: true },
          }
        );
        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      });
    },
    { scope: ref }
  );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`${styles.rule}${className ? ` ${className}` : ""}`}
      style={{ transformOrigin: `${origin} center` }}
    />
  );
}
