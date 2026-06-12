import type { Metadata } from "next";
import Footer from "@/components/Footer";
import AProposHero from "@/components/apropos/AProposHero";
import MissionSection from "@/components/apropos/MissionSection";
import HowItWorks from "@/components/apropos/HowItWorks";

export const metadata: Metadata = {
  title: "À propos — Vicicar",
  description:
    "Vicicar cherche, compare et négocie votre prochaine voiture à votre place. Un service d'experts indépendants, 100% gratuit.",
};

/* /a-propos — content-ux.md §3 (copy verbatim). */
export default function AProposPage() {
  return (
    <>
      <main>
        <AProposHero />

        <MissionSection
          eyebrow="Notre histoire"
          title="Trouver une voiture ne devrait pas être un parcours du combattant"
          paragraphs={[
            "Vicicar est né d'un constat simple : acheter une voiture, c'est des semaines d'annonces douteuses, de jargon technique et de négociations inconfortables. La plupart des gens finissent par payer trop cher — ou par choisir par défaut.",
            "Alors on a inversé le processus. Vous nous dites ce dont vous avez besoin, et nos experts indépendants font le travail à votre place : recherche, vérification, comparaison, négociation. Vous ne gardez que le meilleur moment — prendre le volant.",
          ]}
        />

        <MissionSection
          flip
          eyebrow="Notre modèle"
          title="Gratuit pour vous. Vraiment."
          paragraphs={[
            "Notre service ne vous coûte rien, et ne vous coûtera jamais rien. Vicicar est rémunéré par son réseau de distributeurs et de mandataires partenaires — jamais par vous, et jamais au détriment du prix que vous payez.",
            "Et parce que nous ne dépendons d'aucune marque, nos experts restent libres de vous recommander la voiture qui vous convient. Pas celle qu'il faut écouler.",
          ]}
        />

        <MissionSection
          eyebrow="Nos experts"
          title="Des humains, pas des algorithmes"
          paragraphs={[
            "Derrière chaque recherche, il y a un expert automobile qui connaît le marché, les cotes, les pièges de l'occasion et les marges des concessions. Il vous appelle, vous écoute, et négocie pour vous comme il le ferait pour un proche.",
          ]}
        />

        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
