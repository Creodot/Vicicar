"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, wfEase } from "@/lib/gsap";
import styles from "./Contact.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const ERRORS = {
  nom: "Veuillez renseigner ce champ.",
  email: "Entrez une adresse email valide.",
  message: "Dites-nous en un peu plus (10 caractères minimum).",
} as const;

const NETWORK_ERROR =
  "Oups, l'envoi a échoué. Réessayez ou écrivez-nous directement à bonjour@vicicar.com.";

type FieldName = keyof typeof ERRORS;
type Errors = Partial<Record<FieldName, string>>;

/**
 * Mini-form contact (content-ux.md §4): ghost inputs (transparent, 1px
 * --border bottom, white focus wipe), floating micro-labels, white pill
 * submit. POSTs to /api/contact; on success the form crossfades (0.4s)
 * into the French confirmation.
 */
export default function ContactForm() {
  const root = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [netError, setNetError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const { contextSafe } = useGSAP({ scope: root });

  /* Crossfade form → success (0.4s, same grid cell). autoAlpha flips
     visibility at opacity 0, so the hidden form is also unfocusable. */
  const showSuccess = contextSafe(() => {
    setDone(true);
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      gsap.set(formRef.current, { autoAlpha: 0 });
      gsap.set(successRef.current, { autoAlpha: 1 });
      return;
    }
    gsap.to(formRef.current, { autoAlpha: 0, duration: 0.4, ease: wfEase });
    gsap.to(successRef.current, { autoAlpha: 1, duration: 0.4, ease: wfEase });
  });

  const clearError = (name: FieldName) => {
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const autoGrow = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending || done) return;
    setNetError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const nom = String(fd.get("nom") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();

    const next: Errors = {};
    if (nom.length < 2) next.nom = ERRORS.nom;
    if (!EMAIL_RE.test(email)) next.email = ERRORS.email;
    if (message.length < 10) next.message = ERRORS.message;
    setErrors(next);

    const firstInvalid = (Object.keys(next) as FieldName[])[0];
    if (firstInvalid) {
      form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, email, message }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error("send failed");
      showSuccess();
    } catch {
      setNetError(NETWORK_ERROR);
    } finally {
      setSending(false);
    }
  };

  return (
    <div ref={root} className={styles.swap}>
      <form
        ref={formRef}
        className={styles.form}
        onSubmit={onSubmit}
        noValidate
        aria-hidden={done}
        aria-busy={sending}
      >
        <fieldset className={styles.fieldset} disabled={sending || done}>
          <div className={styles.group}>
            <div className={styles.field}>
              <input
                id="contact-nom"
                className={styles.input}
                type="text"
                name="nom"
                autoComplete="name"
                placeholder=" "
                aria-invalid={Boolean(errors.nom)}
                aria-describedby={errors.nom ? "contact-nom-error" : undefined}
                onInput={() => clearError("nom")}
              />
              <label htmlFor="contact-nom" className={styles.fieldLabel}>
                Nom
              </label>
              <span className={styles.focusLine} aria-hidden="true" />
            </div>
            {errors.nom && (
              <p id="contact-nom-error" className={styles.error} role="alert">
                {errors.nom}
              </p>
            )}
          </div>

          <div className={styles.group}>
            <div className={styles.field}>
              <input
                id="contact-email"
                className={styles.input}
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                placeholder=" "
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? "contact-email-error" : undefined
                }
                onInput={() => clearError("email")}
              />
              <label htmlFor="contact-email" className={styles.fieldLabel}>
                Email
              </label>
              <span className={styles.focusLine} aria-hidden="true" />
            </div>
            {errors.email && (
              <p
                id="contact-email-error"
                className={styles.error}
                role="alert"
              >
                {errors.email}
              </p>
            )}
          </div>

          <div className={styles.group}>
            <div className={styles.field}>
              <textarea
                id="contact-message"
                className={styles.textarea}
                name="message"
                rows={4}
                placeholder=" "
                aria-invalid={Boolean(errors.message)}
                aria-describedby={
                  errors.message ? "contact-message-error" : undefined
                }
                onInput={(e) => {
                  clearError("message");
                  autoGrow(e);
                }}
              />
              <label htmlFor="contact-message" className={styles.fieldLabel}>
                Message
              </label>
              <span className={styles.focusLine} aria-hidden="true" />
            </div>
            {errors.message && (
              <p
                id="contact-message-error"
                className={styles.error}
                role="alert"
              >
                {errors.message}
              </p>
            )}
          </div>

          {netError && (
            <p className={styles.error} role="alert">
              {netError}
            </p>
          )}

          <div className={styles.actions}>
            <button className={styles.submit} type="submit">
              {sending ? "Envoi en cours…" : "Envoyer →"}
            </button>
          </div>
        </fieldset>
      </form>

      <div ref={successRef} className={styles.success} role="status">
        <p className={styles.successTitle}>Message bien reçu.</p>
        <p className={styles.successText}>On vous répond sous 24h ouvrées.</p>
      </div>
    </div>
  );
}
