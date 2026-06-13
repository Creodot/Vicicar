"use client";

/**
 * Marquee — shared clone-math marquee (spec §3.5).
 *
 * CSS-keyframe translateX(0 → -50%) linear infinite. JS measures one copy
 * vs the container and renders `2 × ceil(container / copy)` copies so the
 * -50% loop point is seamless; `animation-duration = copies × speed`.
 * ResizeObserver re-runs the math. Pausable via `paused` (and auto-paused
 * offscreen via IO — battery-respectful). Reduced motion → `animation:
 * none`; if `staticFallback` is provided it replaces the track entirely.
 *
 * NOTE: include the trailing separator in your content
 * (e.g. "VOTRE VOITURE — ") so copies chain seamlessly.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import styles from "./Marquee.module.css";

export type MarqueeProps = {
  /** Single string content (one copy). Trailing separator included. */
  text?: string;
  /** Or items, joined as-is into one copy (provide separators in items). */
  items?: string[];
  /** Seconds per copy; total duration = copies × speed. Default 6. */
  speed?: number;
  /** Drift direction. Default "left" (content moves right-to-left). */
  direction?: "left" | "right";
  /** Hold the animation (e.g. until the band's line-sweeps finish). */
  paused?: boolean;
  /** Root class (sizing/typography owned by the caller). */
  className?: string;
  /** Class applied to each copy span. */
  copyClassName?: string;
  /** Shown INSTEAD of the moving track under prefers-reduced-motion. */
  staticFallback?: ReactNode;
  "aria-label"?: string;
};

export default function Marquee({
  text,
  items,
  speed = 6,
  direction = "left",
  paused = false,
  className,
  copyClassName,
  staticFallback,
  "aria-label": ariaLabel,
}: MarqueeProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const copyRef = useRef<HTMLSpanElement | null>(null);
  const [copies, setCopies] = useState(2);
  const [inView, setInView] = useState(true);

  const content = text ?? (items ? items.join("") : "");

  /* Clone math + remeasure on resize */
  useEffect(() => {
    const root = rootRef.current;
    const copy = copyRef.current;
    if (!root || !copy) return;

    const measure = () => {
      const copyWidth = copy.offsetWidth;
      const rootWidth = root.offsetWidth;
      if (copyWidth === 0 || rootWidth === 0) return;
      setCopies(Math.max(2, 2 * Math.ceil(rootWidth / copyWidth)));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    ro.observe(copy);
    return () => ro.disconnect();
  }, [content]);

  /* Pause offscreen — never animate what nobody sees */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      ([record]) => setInView(record.isIntersecting),
      { threshold: 0 }
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  const running = !paused && inView;

  return (
    <div
      ref={rootRef}
      className={`${styles.marquee}${className ? ` ${className}` : ""}`}
      /* aria-label needs a role to land in the accessible name computation
         (a role-less div drops it in most screen readers). */
      role={ariaLabel ? "group" : undefined}
      aria-label={ariaLabel}
      data-has-fallback={staticFallback ? "true" : undefined}
    >
      <div
        className={styles.track}
        data-direction={direction}
        data-paused={running ? undefined : "true"}
        style={{ "--marquee-duration": `${copies * speed}s` } as CSSProperties}
      >
        {Array.from({ length: copies }, (_, i) => (
          <span
            key={i}
            ref={i === 0 ? copyRef : undefined}
            aria-hidden={i > 0 ? "true" : undefined}
            className={`${styles.copy}${copyClassName ? ` ${copyClassName}` : ""}`}
          >
            {content}
          </span>
        ))}
      </div>
      {staticFallback ? (
        <div className={styles.fallback}>{staticFallback}</div>
      ) : null}
    </div>
  );
}
