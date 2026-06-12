import type { Metadata } from "next";
import Footer from "@/components/Footer";
import ContactSection from "@/components/contact/ContactSection";

export const metadata: Metadata = {
  title: "Contact — Vicicar",
  description:
    "Une question ? Écrivez-nous ou appelez-nous : on vous répond sous 24h.",
};

export default function ContactPage() {
  return (
    <>
      <main>
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
