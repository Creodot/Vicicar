"use client";

import { useRef } from "react";
import { gsap, useGSAP, wfEase } from "@/lib/gsap";
import "./scroll"; // registers ScrollTrigger (avis namespace)
import styles from "./TestimonialList.module.css";

type Testimonial = {
  name: string;
  city: string;
  car: string;
  quote: string;
};

/* Copy exact — content-ux.md §2.3 */
const TESTIMONIALS: Testimonial[] = [
  {
    name: "Sophie M.",
    city: "Lyon",
    car: "PEUGEOT 2008 HYBRIDE",
    quote:
      "« Je redoutais les négociations en concession. Vicicar a tout géré : en dix jours j'avais trois propositions, et j'ai économisé 2 300 € sur le modèle que je voulais. »",
  },
  {
    name: "Karim B.",
    city: "Paris",
    car: "RENAULT CLIO V OCCASION",
    quote:
      "« Un vrai humain au téléphone, qui pose les bonnes questions. Pas de jargon, pas de pression. Ma Clio était exactement dans mon budget, contrôle technique impeccable. »",
  },
  {
    name: "Claire D.",
    city: "Bordeaux",
    car: "DACIA JOGGER 7 PLACES",
    quote:
      "« Troisième enfant en route, zéro temps pour chercher. Ils ont compris notre besoin mieux que nous. Le Jogger coche toutes les cases, livré en trois semaines. »",
  },
  {
    name: "Thomas L.",
    city: "Nantes",
    car: "TESLA MODEL 3 OCCASION",
    quote:
      "« Je voulais passer à l'électrique sans me tromper. Leur expert m'a expliqué l'autonomie réelle, les bornes, la revente. J'ai signé en confiance. »",
  },
  {
    name: "Nadia R.",
    city: "Marseille",
    car: "CITROËN C3 NEUVE",
    quote:
      "« Premier achat de voiture neuve de ma vie. On m'a accompagnée du premier appel jusqu'à la remise des clés. Et ça ne m'a rien coûté, je n'y croyais pas. »",
  },
  {
    name: "Julien P.",
    city: "Toulouse",
    car: "VOLKSWAGEN TIGUAN",
    quote:
      "« 30 000 km par an pour le travail. Ils m'ont orienté vers un diesel récent que je n'aurais jamais trouvé seul, négocié 1 800 € sous le prix affiché. »",
  },
  {
    name: "Élodie F.",
    city: "Lille",
    car: "MINI COOPER OCCASION",
    quote:
      "« Je rêvais d'une Mini mais je me méfiais des arnaques sur les sites d'annonces. Vicicar a vérifié l'historique complet du véhicule avant même que je le voie. »",
  },
  {
    name: "Marc V.",
    city: "Strasbourg",
    car: "ŠKODA OCTAVIA BREAK",
    quote:
      "« Service bluffant d'efficacité. Un appel le lundi, une sélection le jeudi, l'essai le samedi. Mon break était sous la barre des 25 000 € comme demandé. »",
  },
];

/**
 * Editorial testimonial rows (content-ux.md §2.2): one review = one
 * full-width row separated by 1px --border. Scroll reveal per row at 80%
 * of the viewport: autoAlpha 0→1, y 40→0, inner stagger (index, quote,
 * meta), wfEase — the house reveal (animations.md §4c), played once.
 * Hidden states are applied by GSAP only in the animated branch, so
 * reduced-motion (and no-JS) users always see the content.
 */
export default function TestimonialList() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const rows = gsap.utils.toArray<HTMLElement>(`.${styles.row}`);
        rows.forEach((row) => {
          const parts = row.querySelectorAll(
            `.${styles.index}, .${styles.quote}, .${styles.meta}`
          );
          gsap.set(parts, { autoAlpha: 0, y: 40 });
          gsap.to(parts, {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: wfEase,
            stagger: 0.1,
            scrollTrigger: {
              trigger: row,
              start: "top 80%",
              once: true,
            },
          });
        });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className={styles.section} aria-label="Témoignages de clients Vicicar">
      <ol className={styles.list} role="list">
        {TESTIMONIALS.map((t, i) => (
          <li key={t.name} className={styles.row}>
            <p className={styles.index} aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </p>
            <blockquote className={styles.quote}>{t.quote}</blockquote>
            <div className={styles.meta}>
              <p className={styles.stars} role="img" aria-label="5 étoiles sur 5">
                ★★★★★
              </p>
              <p className={styles.person}>
                <span className={styles.name}>{t.name}</span>
                <span className={styles.city}> — {t.city}</span>
              </p>
              <p className={styles.car}>
                <span className={styles.carLabel}>VOITURE TROUVÉE :</span> {t.car}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
