"use client";

import { useRef } from "react";
import { gsap, useGSAP, wfEase } from "@/lib/gsap";
import BigLink from "./BigLink";
import ContactForm from "./ContactForm";
import styles from "./Contact.module.css";

const TITLE = "PARLONS-EN";

/**
 * /contact — single dramatic screen (content-ux.md §4):
 * eyebrow CONTACT, giant Octane "PARLONS-EN" (per-letter wdth 0→100 hover,
 * same as the home hero), giant mailto/tel links with the nav underline
 * sweep, hours micro-label, ghost mini-form.
 *
 * Entrance reuses the hero load grammar (animations.md §1): letters flip in
 * (opacity/x/rotX/rotY, 1s power1.out, 50ms stagger from t=0.2s), then the
 * rest fades in with the slow wfEase 1.4s from t=0.7s.
 */
export default function ContactSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const letters = `.${styles.letter}`;
      const fades = `.${styles.fade}`;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline();
        tl.to(
          letters,
          {
            opacity: 1,
            x: 0,
            rotationX: 0,
            rotationY: 0,
            // pin Z: decomposing the CSS initial 3D matrix yields a phantom
            // rotationZ that a plain to() would otherwise leave behind
            rotation: 0,
            duration: 1,
            ease: "power1.out",
            stagger: 0.05,
          },
          0.2
        ).to(
          fades,
          { autoAlpha: 1, duration: 1.4, ease: wfEase, stagger: 0.1 },
          0.7
        );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(letters, { opacity: 1, x: 0, rotationX: 0, rotationY: 0, rotation: 0 });
        gsap.set(fades, { autoAlpha: 1 });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className={styles.section}>
      <p className={`${styles.eyebrow} ${styles.fade}`}>Contact</p>

      <h1 className={styles.title} aria-label="Parlons-en">
        {TITLE.split("").map((char, i) => (
          <span key={i} className={styles.letter} aria-hidden="true">
            {char}
          </span>
        ))}
      </h1>

      <div className={`${styles.links} ${styles.fade}`}>
        <BigLink href="mailto:bonjour@vicicar.com">bonjour@vicicar.com</BigLink>
        <BigLink href="tel:+33186760404">01 86 76 04 04</BigLink>
      </div>

      <p className={`${styles.hours} ${styles.fade}`}>
        Du lundi au samedi, 9h – 19h
      </p>

      <div className={`${styles.formWrap} ${styles.fade}`}>
        <ContactForm />
      </div>
    </section>
  );
}
