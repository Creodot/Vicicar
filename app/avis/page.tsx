import type { Metadata } from "next";
import Footer from "@/components/Footer";
import AvisHero from "@/components/avis/AvisHero";
import TestimonialList from "@/components/avis/TestimonialList";
import AvisCta from "@/components/avis/AvisCta";

export const metadata: Metadata = {
  title: "Avis clients — Vicicar",
  description:
    "Ils ont trouvé leur voiture idéale sans lever le petit doigt. Découvrez les avis de nos clients.",
};

/* /avis — content-ux.md §2 : hero AVIS + stat strip, 8 témoignages
   éditoriaux, CTA de fin de page, footer partagé. */
export default function AvisPage() {
  return (
    <>
      <main>
        <AvisHero />
        <TestimonialList />
        <AvisCta />
      </main>
      <Footer />
    </>
  );
}
