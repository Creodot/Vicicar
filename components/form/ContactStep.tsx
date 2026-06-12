"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { CRENEAU_OPTIONS, type ChoiceKey } from "./formData";
import { MSG, validateContactField } from "./validation";
import s from "./MultiStepForm.module.css";
import { asset } from "@/lib/asset";

export type ContactValues = {
  prenom: string;
  nom: string;
  telephone: string;
  email: string;
  creneau: string;
  rgpd: boolean;
};

type TextField = {
  name: "prenom" | "nom" | "telephone" | "email";
  label: string;
  type: string;
  autoComplete: string;
  inputMode?: "tel" | "email";
};

const TEXT_FIELDS: TextField[] = [
  { name: "prenom", label: "Prénom", type: "text", autoComplete: "given-name" },
  { name: "nom", label: "Nom", type: "text", autoComplete: "family-name" },
  { name: "telephone", label: "Téléphone", type: "tel", autoComplete: "tel", inputMode: "tel" },
  { name: "email", label: "Email", type: "email", autoComplete: "email", inputMode: "email" },
];

type Props = {
  answers: Partial<Record<ChoiceKey, string>>;
  values: ContactValues;
  onChange: (next: ContactValues) => void;
  onSuccess: () => void;
};

/**
 * Step 8 — "ON VOUS RAPPELLE ?" (content-ux.md §1.3, étape 8 + §1.5).
 * Ghost inputs (transparent, 1px bottom border, white focus line sweeping
 * left→right 0.4s), floating micro-labels, créneau glass pills, custom RGPD
 * checkbox, white pill submit. Validation on blur + submit, exact FR errors.
 */
export default function ContactStep({ answers, values, onChange, onSuccess }: Props) {
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const titleId = "step-title-contact";

  const setValue = (name: keyof ContactValues, value: string | boolean) =>
    onChange({ ...values, [name]: value });

  const blurField = (name: TextField["name"]) =>
    setErrors((e) => ({ ...e, [name]: validateContactField(name, values[name]) }));

  const validateAll = () => {
    const next: Partial<Record<string, string>> = {};
    for (const f of TEXT_FIELDS) next[f.name] = validateContactField(f.name, values[f.name]);
    next.creneau = values.creneau ? "" : MSG.creneau;
    next.rgpd = values.rgpd ? "" : MSG.rgpd;
    setErrors(next);
    return Object.entries(next).find(([, msg]) => msg)?.[0] ?? null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;

    const firstInvalid = validateAll();
    if (firstInvalid) {
      formRef.current
        ?.querySelector<HTMLElement>(`[data-field='${firstInvalid}']`)
        ?.focus({ preventScroll: false });
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch(asset("/api/leads"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...answers,
          prenom: values.prenom.trim(),
          nom: values.nom.trim(),
          telephone: values.telephone.trim(),
          email: values.email.trim(),
          creneau: values.creneau,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("send failed");
      onSuccess();
    } catch {
      setStatus("error");
    }
  };

  const onCreneauKeyDown = (e: React.KeyboardEvent) => {
    if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(e.key)) return;
    const radios = Array.from(
      (e.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>("[role='radio']")
    );
    const current = radios.indexOf(document.activeElement as HTMLButtonElement);
    if (current === -1) return;
    e.preventDefault();
    e.stopPropagation();
    const delta = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
    radios[(current + delta + radios.length) % radios.length]?.focus();
  };

  return (
    <section role="group" aria-labelledby={titleId} className={s.step}>
      <p className={`label ${s.eyebrow}`}>DERNIÈRE ÉTAPE</p>
      <h1 id={titleId} data-step-title tabIndex={-1} className={s.title}>
        ON VOUS RAPPELLE ?
      </h1>
      <p className={s.helper}>
        Un expert Vicicar — un humain, pas un robot — vous appelle pour affiner votre
        recherche. C&apos;est gratuit et sans engagement.
      </p>

      <form ref={formRef} className={s.contactForm} onSubmit={onSubmit} noValidate>
        {TEXT_FIELDS.map((f) => {
          const error = errors[f.name];
          return (
            <div key={f.name} className={s.field} data-invalid={!!error} data-anim="option">
              <input
                id={`lead-${f.name}`}
                data-field={f.name}
                className={s.input}
                name={f.name}
                type={f.type}
                inputMode={f.inputMode}
                autoComplete={f.autoComplete}
                placeholder=" "
                value={values[f.name]}
                onChange={(e) => setValue(f.name, e.target.value)}
                onBlur={() => blurField(f.name)}
                aria-invalid={!!error}
                aria-describedby={error ? `lead-${f.name}-error` : undefined}
                required
              />
              <label className={`label ${s.fieldLabel}`} htmlFor={`lead-${f.name}`}>
                {f.label}
              </label>
              <span className={s.fieldLine} aria-hidden="true" />
              {error && (
                <p id={`lead-${f.name}-error`} className={s.fieldError}>
                  {error}
                </p>
              )}
            </div>
          );
        })}

        {/* créneau de rappel */}
        <fieldset className={s.creneau} data-anim="option">
          <legend className={`label ${s.creneauLegend}`}>
            Quand préférez-vous être appelé(e) ?
          </legend>
          <div
            role="radiogroup"
            aria-label="Quand préférez-vous être appelé(e) ?"
            className={s.creneauPills}
            onKeyDown={onCreneauKeyDown}
          >
            {CRENEAU_OPTIONS.map((option, i) => {
              const selected = values.creneau === option.value;
              const tabStop = values.creneau
                ? selected
                : i === 0;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  tabIndex={tabStop ? 0 : -1}
                  data-field={i === 0 ? "creneau" : undefined}
                  className={
                    selected ? `label ${s.creneauPill} ${s.creneauPillSelected}` : `label ${s.creneauPill}`
                  }
                  onClick={() => {
                    setValue("creneau", option.value);
                    setErrors((e) => ({ ...e, creneau: "" }));
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          {errors.creneau && (
            <p id="lead-creneau-error" className={s.fieldError}>
              {errors.creneau}
            </p>
          )}
        </fieldset>

        {/* RGPD */}
        <div className={s.rgpdBlock} data-anim="option">
          <label className={s.rgpd}>
            <input
              type="checkbox"
              data-field="rgpd"
              className={s.rgpdInput}
              checked={values.rgpd}
              onChange={(e) => {
                setValue("rgpd", e.target.checked);
                if (e.target.checked) setErrors((er) => ({ ...er, rgpd: "" }));
              }}
              aria-invalid={!!errors.rgpd}
              aria-describedby={errors.rgpd ? "lead-rgpd-error" : undefined}
            />
            <span className={s.rgpdBox} aria-hidden="true">
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path
                  d="M1 4.2 3.6 6.8 9 1.2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className={s.rgpdText}>
              J&apos;accepte que Vicicar utilise mes coordonnées pour me recontacter au
              sujet de ma recherche de voiture. Aucune revente de données, promis. Voir
              notre{" "}
              <Link href="/mentions-legales" className={s.rgpdLink}>
                politique de confidentialité
              </Link>
              .
            </span>
          </label>
          {errors.rgpd && (
            <p id="lead-rgpd-error" className={s.fieldError}>
              {errors.rgpd}
            </p>
          )}
        </div>

        <div className={s.submitRow} data-anim="option">
          <div aria-live="polite">
            {status === "error" && <p className={s.banner}>{MSG.network}</p>}
          </div>
          <button
            type="submit"
            className={`label ${s.submitBtn}`}
            disabled={status === "sending"}
          >
            {status === "sending" ? "ENVOI EN COURS…" : "ÊTRE RAPPELÉ GRATUITEMENT →"}
          </button>
        </div>
      </form>
    </section>
  );
}
