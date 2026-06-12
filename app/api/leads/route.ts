import { NextResponse } from "next/server";
import { validateLead } from "@/components/form/validation";

/**
 * Lead intake for /trouver-ma-voiture (content-ux.md §1.3).
 *
 * Expected JSON payload (all strings):
 * { vehicule, etat, budget, carburant, boite, delai, usage,
 *   prenom, nom, telephone, email, creneau }
 *
 * Server-side validation mirrors the client exactly (shared module
 * components/form/validation.ts): step values against the declared enums,
 * names ≥ 2 chars, FR phone ^(?:\+33|0033|0)[1-9]\d{8}$ after stripping
 * separators, email regex, créneau enum.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { ok: false, error: "Requête invalide." },
      { status: 400 }
    );
  }

  const result = validateLead(body as Record<string, unknown>);

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: "Champs invalides.", fields: result.fields },
      { status: 422 }
    );
  }

  // V1: log the lead (visible in the server console / hosting logs).
  console.log("[vicicar:lead]", JSON.stringify({ receivedAt: new Date().toISOString(), ...result.lead }));

  // TODO(CRM/email integration): forward `result.lead` to the CRM
  // (e.g. HubSpot/Pipedrive API) and/or send a notification email
  // (e.g. Resend/Sendgrid) to the Vicicar team + a confirmation to the
  // prospect. Keep this route's response shape ({ ok: true }) unchanged —
  // the form's success screen depends on it.

  return NextResponse.json({ ok: true });
}
