"use client";

import { useRef } from "react";
import { gsap, useGSAP, outQuad } from "@/lib/gsap";
import { asset } from "@/lib/asset";
import styles from "./Hero.module.css";

type LetterBlockProps = {
  /** The displayed glyph (V, I, C, A, R) */
  glyph: string;
  /** Base name of the video asset in /public/videos (V, C, I, C3, I2, A2, R) */
  video: string;
};

/**
 * One hero letter block — 1:1 replica of Webflow's .block-letter:
 * - glyph (z 10) over its background video (z 5), per design-system.md §4.
 * - hover-in on the GLYPH (not the wrapper, per ix2 e-79…e-90): video wrapper
 *   autoAlpha 0→1 in 0.5s power1.out + video.play(); hover-out reverses and
 *   pauses on complete (animations.md §2a). In/out overwrite each other so a
 *   mid-fade exit tweens from the current opacity.
 * - the 3s "wdth" 0→100 variable-font stretch is pure CSS (Hero.module.css).
 * - videos stay paused & hidden until hover (preload="none"; first
 *   pointerenter kicks load()) — visually identical to Webflow's
 *   always-playing hidden videos, and zero network cost on load (the seven
 *   clips otherwise ship ~2.3 MB to users who may never hover — or, on
 *   touch devices, CAN never hover).
 */
export default function LetterBlock({ glyph, video }: LetterBlockProps) {
  const blockRef = useRef<HTMLDivElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { contextSafe } = useGSAP({ scope: blockRef });

  const canHover = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover)").matches;

  const onEnter = contextSafe(() => {
    if (!canHover()) return;
    const vid = videoRef.current;
    if (vid) {
      vid.muted = true; // belt-and-braces: guarantees play() resolves
      if (vid.readyState === 0) vid.load(); // preload="none" → fetch on first hover
      vid.play().catch(() => {});
    }
    gsap.to(videoWrapRef.current, {
      autoAlpha: 1,
      duration: 0.5,
      ease: outQuad,
      overwrite: "auto",
    });
  });

  const onLeave = contextSafe(() => {
    if (!canHover()) return;
    gsap.to(videoWrapRef.current, {
      autoAlpha: 0,
      duration: 0.5,
      ease: outQuad,
      overwrite: "auto",
      onComplete: () => videoRef.current?.pause(),
    });
  });

  return (
    <div ref={blockRef} className={styles.blockLetter}>
      <div
        className={styles.letter}
        data-hero-letter=""
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        aria-hidden="true"
      >
        {glyph}
      </div>
      <div ref={videoWrapRef} className={styles.bgVideoLetter} aria-hidden="true">
        <video
          ref={videoRef}
          className={styles.video}
          loop
          muted
          playsInline
          preload="none"
          tabIndex={-1}
          style={{ backgroundImage: `url(${asset(`/videos/${video}-poster.jpg`)})` }}
        >
          <source src={asset(`/videos/${video}.mp4`)} type="video/mp4" />
          <source src={asset(`/videos/${video}.webm`)} type="video/webm" />
        </video>
      </div>
    </div>
  );
}
