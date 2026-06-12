import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

const TITLE = "Vicicar - Trouvez votre voiture idéale 100% gratuit";
const DESCRIPTION =
  "Vicicar vous aide à trouver la voiture parfaite gratuitement! Notre service personnalisé analyse vos besoins pour vous proposer les meilleurs véhicules adaptés. Trouvez votre prochaine voiture idéale avec Vicicar dès maintenant !";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.vicicar.com"),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-256.png", sizes: "256x256", type: "image/png" },
    ],
    apple: "/icon-256.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        {/* React 19 hoists these into <head>. Octane preload is critical:
            the hero letters must never FOIT. */}
        <link
          rel="preload"
          href="/fonts/OctaneGX.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/OakSansVF.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/OakSans-ItalicVF.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
