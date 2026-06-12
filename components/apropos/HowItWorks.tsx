"use client";

import Link from "next/link";
import { useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap, useGSAP, wfEase } from "@/lib/gsap";
import styles from "./HowItWorks.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * « Comment ça marche » strip (content-ux.md §3.5) — 3 columns, giant
 * outline Octane digits 01/02/03 (~8vw). On scroll-reveal each digit
 * stretches `wdth` 0→100 with a 0.15s stagger (CSS transition + delays,
 * class toggled by ScrollTrigger) while the columns fade/slide in
 * (house reveal, wfEase). White pill CTA → /trouver-ma-voiture.
 */
const STEPS = [
  {
    digit: "01",
    title: "Décrivez votre besoin",
    text: "Trois minutes pour répondre à notre questionnaire : type de voiture, budget, usage, délai.",
  },
  {
    digit: "02",
    title: "Un expert vous appelle",
    text: "Sous 24h, un expert Vicicar vous rappelle pour affiner votre projet et répondre à vos questions.",
  },
  {
    digit: "03",
    title: "Recevez une sélection",
    text: "Vous recevez une sélection de voitures vérifiées et négociées. Vous choisissez, on s'occupe du reste.",
  },
];

export default function HowItWorks() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set("[data-reveal]", { autoAlpha: 0, y: 40 });
        gsap.to("[data-reveal]", {
          autoAlpha: 1,
          y: 0,
          duration: 1.2,
          ease: wfEase,
          stagger: 0.15,
          scrollTrigger: {
            trigger: el,
            start: "top 78%",
            once: true,
            onEnter: () => el.classList.add(styles.in),
          },
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        el.classList.add(styles.in);
      });

      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    },
    { scope: root }
  );

  return (
    <section ref={root} className={styles.strip}>
      <div className={styles.inner}>
        <p className={`label ${styles.eyebrow}`} data-reveal="">
          Comment ça marche
        </p>
        <ol className={styles.grid}>
          {STEPS.map((step, i) => (
            <li key={i} className={styles.step} data-reveal="">
              <span className={styles.digit} aria-hidden="true">
                {step.digit}
              </span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepText}>{step.text}</p>
            </li>
          ))}
        </ol>
        <div className={styles.ctaWrap} data-reveal="">
          <Link href="/trouver-ma-voiture" className={styles.cta}>
            Commencer ma recherche{" "}
            <span aria-hidden="true" className={styles.ctaArrow}>
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
