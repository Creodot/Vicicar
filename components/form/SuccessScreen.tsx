"use client";

import Link from "next/link";
import s from "./MultiStepForm.module.css";

/**
 * Success screen (content-ux.md §1.4): giant Octane "MERCI {PRENOM} !"
 * stretching wdth 0→100 over 2.5s (pure CSS keyframes, easeOutQuart),
 * no confetti.
 */
export default function SuccessScreen({ prenom }: { prenom: string }) {
  return (
    <section role="group" aria-labelledby="success-title" className={s.success}>
      <h1 id="success-title" data-step-title tabIndex={-1} className={s.successTitle}>
        {prenom ? `MERCI ${prenom.toUpperCase()} !` : "MERCI !"}
      </h1>
      <p className={s.successSub}>Un expert Vicicar vous rappelle sous 24h.</p>
      <p className={s.successBody}>
        Votre recherche est entre de bonnes mains. Pendant ce temps, pas besoin
        d&apos;écumer les annonces : on s&apos;occupe de tout. Surveillez votre
        téléphone — le numéro commencera par 01.
      </p>
      <Link href="/" className={s.backBtn}>
        <span className={`label ${s.backText}`}>← Retour à l&apos;accueil</span>
        <span className={s.backLineWrap} aria-hidden="true">
          <span className={s.backLine} />
        </span>
      </Link>
    </section>
  );
}
