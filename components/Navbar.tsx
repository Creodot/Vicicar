"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { gsap, useGSAP, wfEase } from "@/lib/gsap";
import NavLink from "./NavLink";
import styles from "./Navbar.module.css";

/**
 * 1:1 replica of the Webflow navbar (design-system.md §3):
 * - transparent fixed bar, 3-col grid (left links | centered logo | right links)
 * - ≤767px: mobile brand left + round glass menu button right; the menu opens
 *   as a glass pill (blur 30px, #70707033, radius 1em) under the bar, 400ms ease.
 * - fades in on load (delay 0.7s, 1.4s, IX2 "ease") per animations.md.
 */
export default function Navbar() {
  const root = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  const { contextSafe } = useGSAP(
    () => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      gsap.to(root.current, {
        opacity: 1,
        duration: reduced ? 0 : 1.4,
        delay: reduced ? 0 : 0.7,
        ease: wfEase,
      });
    },
    { scope: root }
  );

  // Webflow w-nav data-animation="default": dropdown reveals by animating the
  // menu height 0 → auto + fade, 400ms ease (animations.md §4d).
  const openMenu = contextSafe(() => {
    setOpen(true);
    // display:block now so GSAP can measure the natural ("auto") height
    // before React commits the open class.
    gsap.set(menuRef.current, { display: "block" });
    gsap.fromTo(
      menuRef.current,
      { height: 0, autoAlpha: 0, overflow: "hidden" },
      {
        height: "auto",
        autoAlpha: 1,
        duration: 0.4,
        ease: wfEase,
        onComplete: () => {
          gsap.set(menuRef.current, { clearProps: "height,overflow" });
        },
      }
    );
  });

  const closeMenu = contextSafe(() => {
    gsap.set(menuRef.current, { overflow: "hidden" });
    gsap.to(menuRef.current, {
      height: 0,
      autoAlpha: 0,
      duration: 0.4,
      ease: wfEase,
      onComplete: () => {
        setOpen(false);
        // clear inline styles so the desktop layout is never affected
        gsap.set(menuRef.current, { clearProps: "all" });
      },
    });
  });

  const onLinkClick = () => {
    if (open) closeMenu();
  };

  return (
    <div ref={root} className={styles.navbar} role="banner">
      <Link
        href="/"
        className={styles.brandMobile}
        aria-label="Vicicar — Accueil"
        onClick={onLinkClick}
      >
        <img
          src="/logo-mobile.svg"
          alt="Vicicar"
          className={styles.logoMobile}
        />
      </Link>

      <nav
        ref={menuRef}
        className={open ? `${styles.navMenu} ${styles.navMenuOpen}` : styles.navMenu}
        aria-label="Navigation principale"
      >
        <div className={styles.gridNavbar}>
          <div className={styles.nav}>
            <NavLink href="/avis" label="Avis" onClick={onLinkClick} />
            <NavLink href="/a-propos" label="A propos" onClick={onLinkClick} />
          </div>

          <Link
            href="/"
            className={styles.brand}
            aria-label="Vicicar — Accueil"
            onClick={onLinkClick}
          >
            <img src="/logo.svg" alt="Vicicar" className={styles.logo} />
          </Link>

          <div className={`${styles.nav} ${styles.navRight}`}>
            <NavLink
              href="/trouver-ma-voiture"
              label="Trouver ma voiture"
              onClick={onLinkClick}
            />
            <NavLink href="/contact" label="Contact" onClick={onLinkClick} />
          </div>
        </div>
      </nav>

      <button
        type="button"
        className={styles.menuButton}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        onClick={open ? closeMenu : openMenu}
      >
        {/* em-sized so it tracks the button's 1.3em font-size like the
            original webflow-icons glyph (\e602) */}
        <svg
          width="1em"
          height="1em"
          viewBox="0 0 18 18"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M1.5 4.25h15M1.5 9h15M1.5 13.75h15"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </button>
    </div>
  );
}
