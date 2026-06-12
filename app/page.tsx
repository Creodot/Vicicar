import Hero from "@/components/Hero";
import HomeStory from "@/components/home/HomeStory";
import Footer from "@/components/Footer";

/* Home — immersive 100svh hero, then the « Longue exposition » story
   (Manifesto → Method → Proof → FinalCta, landing-v2.md), shared footer. */
export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <HomeStory />
      </main>
      <Footer />
    </>
  );
}
