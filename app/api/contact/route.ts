import { NextResponse } from "next/server";

/**
 * Contact form intake (content-ux.md §4).
 * Server-side mirror of the client validation; logs the message and
 * returns { ok: true }. Forwarding (e-mail / CRM) plugs in here later.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { ok: false, error: "Requête invalide." },
      { status: 400 }
    );
  }

  const { nom, email, message } = body as Record<string, unknown>;
  const errors: Record<string, string> = {};

  if (typeof nom !== "string" || nom.trim().length < 2) {
    errors.nom = "Veuillez renseigner ce champ.";
  }
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    errors.email = "Entrez une adresse email valide.";
  }
  if (typeof message !== "string" || message.trim().length < 10) {
    errors.message = "Dites-nous en un peu plus (10 caractères minimum).";
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  console.log("[contact]", {
    nom: (nom as string).trim(),
    email: (email as string).trim(),
    message: (message as string).trim(),
    receivedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
