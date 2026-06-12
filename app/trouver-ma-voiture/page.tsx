import type { Metadata } from "next";
import MultiStepForm from "@/components/form/MultiStepForm";

export const metadata: Metadata = {
  title: "Trouver ma voiture — Vicicar",
  description:
    "Décrivez la voiture de vos rêves en 3 minutes. Un expert Vicicar vous rappelle sous 24h. Gratuit et sans engagement.",
};

/* Cinematic multi-step form (content-ux.md §1).
   No footer while the form is active — it returns on the success screen
   (rendered inside MultiStepForm). */
export default function TrouverMaVoiturePage() {
  return <MultiStepForm />;
}
