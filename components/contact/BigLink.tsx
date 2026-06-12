"use client";

import { useRef } from "react";
import { gsap, useGSAP, outQuad } from "@/lib/gsap";
import styles from "./Contact.module.css";

type BigLinkProps = {
  href: string;
  children: string;
};

/**
 * Giant contact link (mailto / tel) with the nav-link underline wipe-through
 * (animations.md §3): enters from the left (-105% → 0, 300ms outQuad), exits
 * to the right (→ +105%), then instantly resets to -105%. A quick re-hover
 * during the exit tweens back from wherever it is (overwrite, no hard reset).
 */
export default function BigLink({ href, children }: BigLinkProps) {
  const root = useRef<HTMLAnchorElement>(null);
  const line = useRef<HTMLSpanElement>(null);

  const { contextSafe } = useGSAP(
    () => {
      // Sync GSAP's xPercent with the CSS resting state (translateX(-105%)).
      gsap.set(line.current, { xPercent: -105, x: 0 });
    },
    { scope: root }
  );

  const reduced = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const onEnter = contextSafe(() => {
    gsap.to(line.current, {
      xPercent: 0,
      duration: reduced() ? 0 : 0.3,
      ease: outQuad,
      overwrite: true,
    });
  });

  const onLeave = contextSafe(() => {
    gsap.to(line.current, {
      xPercent: 105,
      duration: reduced() ? 0 : 0.3,
      ease: outQuad,
      overwrite: true,
      onComplete: () => gsap.set(line.current, { xPercent: -105 }),
    });
  });

  return (
    <a
      ref={root}
      href={href}
      className={styles.bigLink}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <span className={styles.bigLinkText}>{children}</span>
      <span className={styles.bigLinkTrack} aria-hidden="true">
        <span ref={line} className={styles.bigLinkLine} />
      </span>
    </a>
  );
}
