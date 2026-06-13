import Hero from "@/components/Hero";
import SmoothScroll from "@/components/home/v3/lib/SmoothScroll";
import Manifeste from "@/components/home/v3/Manifeste";
import MarqueeBand from "@/components/home/v3/MarqueeBand";
import Methode from "@/components/home/v3/Methode";
import Preuve from "@/components/home/v3/Preuve";
import FinalCta from "@/components/home/v3/FinalCta";
import Footer from "@/components/Footer";

/* Home — immersive 100svh hero, then « Plein phare » (landing-v3.md):
   Manifeste → MarqueeBand → Methode → Preuve → FinalCta, shared footer.
   SmoothScroll (Lenis) is mounted ONLY here — other routes keep native scroll. */
export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <SmoothScroll />
        <Manifeste />
        <MarqueeBand />
        <Methode />
        <Preuve />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
