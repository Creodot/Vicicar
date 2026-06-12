import Link from "next/link";
import NavLink from "./NavLink";
import { asset } from "@/lib/asset";
import styles from "./Footer.module.css";

/**
 * Footer partagé (content-ux.md §5) — included per page (every page except
 * the active /trouver-ma-voiture form screen; it returns on the success screen).
 */
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.row}>
        <Link href="/" className={styles.brand} aria-label="Vicicar — Accueil">
          <img src={asset("/logo.svg")} alt="Vicicar" className={styles.logo} />
        </Link>
        <nav className={styles.links} aria-label="Pied de page">
          <NavLink href="/trouver-ma-voiture" label="Trouver ma voiture" />
          <NavLink href="/avis" label="Avis" />
          <NavLink href="/a-propos" label="A propos" />
          <NavLink href="/contact" label="Contact" />
        </nav>
      </div>
      <div className={styles.rowMeta}>
        <p className={styles.meta}>
          © 2026 Vicicar — Trouvez votre voiture idéale, 100% gratuit
        </p>
        <NavLink href="/mentions-legales" label="Mentions légales" />
      </div>
    </footer>
  );
}
