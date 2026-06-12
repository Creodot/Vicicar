/* ============================================================
   /trouver-ma-voiture — validation (content-ux.md §1.3)
   Isomorphic: used by ContactStep (client) AND /api/leads (server).
   ============================================================ */

import { CHOICE_STEPS, CRENEAU_OPTIONS } from "./formData";

/** FR phone, after stripping spaces, dots, dashes, parens */
export const PHONE_RE = /^(?:\+33|0033|0)[1-9]\d{8}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const normalizePhone = (v: string) => v.replace(/[\s.\-()]/g, "");

/* Exact French error strings (content-ux.md §1.3 — mot pour mot) */
export const MSG = {
  required: "Veuillez renseigner ce champ.",
  telephone: "Entrez un numéro de téléphone français valide (ex. 06 12 34 56 78).",
  email: "Entrez une adresse email valide.",
  creneau: "Choisissez un créneau de rappel.",
  rgpd: "Merci d'accepter pour qu'on puisse vous rappeler.",
  network: "Oups, l'envoi a échoué. Vérifiez votre connexion et réessayez.",
} as const;

/* Client-side single-field validators (run on blur + on submit) */
export function validateContactField(name: string, value: string): string {
  switch (name) {
    case "prenom":
    case "nom":
      return value.trim().length >= 2 ? "" : MSG.required;
    case "telephone":
      return PHONE_RE.test(normalizePhone(value)) ? "" : MSG.telephone;
    case "email":
      return EMAIL_RE.test(value.trim()) ? "" : MSG.email;
    default:
      return "";
  }
}

/* ---------- Server-side payload validation ---------- */

export type LeadPayload = {
  vehicule: string;
  etat: string;
  budget: string;
  carburant: string;
  boite: string;
  delai: string;
  usage: string;
  prenom: string;
  nom: string;
  telephone: string;
  email: string;
  creneau: string;
};

export type LeadValidation =
  | { ok: true; lead: LeadPayload }
  | { ok: false; fields: string[] };

export function validateLead(data: Record<string, unknown>): LeadValidation {
  const str = (k: string) =>
    typeof data[k] === "string" ? (data[k] as string).trim() : "";

  const fields: string[] = [];

  // steps 1–7: value must be one of the step's declared option values
  for (const step of CHOICE_STEPS) {
    if (!step.options.some((o) => o.value === str(step.key))) fields.push(step.key);
  }

  if (str("prenom").length < 2) fields.push("prenom");
  if (str("nom").length < 2) fields.push("nom");
  if (!PHONE_RE.test(normalizePhone(str("telephone")))) fields.push("telephone");
  if (!EMAIL_RE.test(str("email"))) fields.push("email");
  if (!CRENEAU_OPTIONS.some((o) => o.value === str("creneau"))) fields.push("creneau");

  if (fields.length > 0) return { ok: false, fields };

  return {
    ok: true,
    lead: {
      vehicule: str("vehicule"),
      etat: str("etat"),
      budget: str("budget"),
      carburant: str("carburant"),
      boite: str("boite"),
      delai: str("delai"),
      usage: str("usage"),
      prenom: str("prenom"),
      nom: str("nom"),
      telephone: normalizePhone(str("telephone")),
      email: str("email"),
      creneau: str("creneau"),
    },
  };
}
