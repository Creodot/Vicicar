import type { Metadata } from "next";
import Footer from "@/components/Footer";
import styles from "./mentions.module.css";

export const metadata: Metadata = {
  title: "Mentions légales — Vicicar",
  description:
    "Mentions légales et politique de confidentialité du site vicicar.com.",
};

/* /mentions-legales — page simple prévue par content-ux.md §5 (hors spec
   détaillée) : éditorial sobre dans l'esthétique du site. */
export default function MentionsLegalesPage() {
  return (
    <>
      <main className={styles.page}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>Informations légales</p>
          <h1 className={styles.title}>Mentions légales</h1>
        </header>

        <div className={styles.sections}>
          <section className={styles.section}>
            <h2 className={styles.heading}>Éditeur du site</h2>
            <p>
              Le site vicicar.com est édité par Vicicar. Pour toute question
              relative au site ou au service, écrivez-nous à{" "}
              <a href="mailto:bonjour@vicicar.com">bonjour@vicicar.com</a> ou
              appelez-nous au{" "}
              <a href="tel:+33186760404">01&nbsp;86&nbsp;76&nbsp;04&nbsp;04</a>.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>Hébergement</h2>
            <p>
              Le site est hébergé par un prestataire d&apos;hébergement
              professionnel dont les coordonnées peuvent être communiquées sur
              simple demande à{" "}
              <a href="mailto:bonjour@vicicar.com">bonjour@vicicar.com</a>.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble des contenus présents sur ce site (textes,
              visuels, logos, vidéos, typographies) est la propriété exclusive
              de Vicicar ou de ses partenaires. Toute reproduction, totale ou
              partielle, sans autorisation écrite préalable est interdite.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>
              Politique de confidentialité (RGPD)
            </h2>
            <p>
              Les informations que vous nous transmettez via nos formulaires
              (coordonnées, critères de recherche) sont utilisées uniquement
              pour vous recontacter au sujet de votre recherche de voiture.
              Elles ne sont jamais revendues à des tiers.
            </p>
            <p>
              Conformément au Règlement général sur la protection des données
              (RGPD), vous disposez d&apos;un droit d&apos;accès, de
              rectification et de suppression de vos données. Pour l&apos;exercer,
              écrivez-nous à{" "}
              <a href="mailto:bonjour@vicicar.com">bonjour@vicicar.com</a> —
              nous traitons toute demande sous 30 jours.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>Cookies</h2>
            <p>
              Ce site n&apos;utilise pas de cookies publicitaires. Seuls des
              cookies techniques strictement nécessaires au fonctionnement du
              site peuvent être déposés.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
