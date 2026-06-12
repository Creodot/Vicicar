"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP, outQuad } from "@/lib/gsap";
import styles from "./NavLink.module.css";

type NavLinkProps = {
  href: string;
  label: string;
  className?: string;
  onClick?: () => void;
};

/**
 * Nav link with the underline wipe-through hover (animations.md §3):
 * enters from the left (-105% → 0, 300ms outQuad), exits to the right
 * (→ +105%, 300ms outQuad), then instantly resets to -105%.
 * A quick re-hover during the exit tweens back from wherever it is
 * (overwrite, no hard reset).
 */
export default function NavLink({ href, label, className, onClick }: NavLinkProps) {
  const root = useRef<HTMLAnchorElement>(null);
  const line = useRef<HTMLSpanElement>(null);

  const { contextSafe } = useGSAP(
    () => {
      // Sync GSAP's xPercent with the CSS resting state (translateX(-105%)).
      gsap.set(line.current, { xPercent: -105, x: 0 });
    },
    { scope: root }
  );

  const onEnter = contextSafe(() => {
    gsap.to(line.current, {
      xPercent: 0,
      duration: 0.3,
      ease: outQuad,
      overwrite: true,
    });
  });

  const onLeave = contextSafe(() => {
    gsap.to(line.current, {
      xPercent: 105,
      duration: 0.3,
      ease: outQuad,
      overwrite: true,
      onComplete: () => gsap.set(line.current, { xPercent: -105 }),
    });
  });

  return (
    <Link
      ref={root}
      href={href}
      className={className ? `${styles.navLink} ${className}` : styles.navLink}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      <span className={styles.navText}>{label}</span>
      <span className={styles.blockUnderline} aria-hidden="true">
        <span ref={line} className={styles.underline} />
      </span>
    </Link>
  );
}
