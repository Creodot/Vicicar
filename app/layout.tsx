import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { asset } from "@/lib/asset";
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
    images: [asset("/og.png")],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [asset("/og.png")],
  },
  icons: {
    icon: [
      { url: asset("/favicon-32.png"), sizes: "32x32", type: "image/png" },
      { url: asset("/icon-256.png"), sizes: "256x256", type: "image/png" },
    ],
    apple: asset("/icon-256.png"),
  },
};

/* @font-face lives here (not globals.css) so the font URLs can carry the
   deployment base path — CSS files can't read env vars. Octane keeps both
   wght and wdth axes (the hero letter stretch); do not subset it. */
const FONT_FACES = `
@font-face {
  font-family: "Oak Sans";
  src: url("${asset("/fonts/OakSans-ItalicVF.woff2")}") format("woff2");
  font-weight: 300 900;
  font-style: italic;
  font-display: swap;
}
@font-face {
  font-family: "Oak Sans";
  src: url("${asset("/fonts/OakSansVF.woff2")}") format("woff2");
  font-weight: 300 900;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Octane";
  src: url("${asset("/fonts/OctaneGX.ttf")}") format("truetype");
  font-weight: 0 100;
  font-style: normal;
  font-display: swap;
}
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        {/* React 19 hoists these into <head>. Octane preload is critical:
            the hero letters must never FOIT. */}
        <style dangerouslySetInnerHTML={{ __html: FONT_FACES }} />
        <link
          rel="preload"
          href={asset("/fonts/OctaneGX.ttf")}
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href={asset("/fonts/OakSansVF.woff2")}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href={asset("/fonts/OakSans-ItalicVF.woff2")}
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
