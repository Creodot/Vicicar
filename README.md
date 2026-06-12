# Vicicar

Rebuild 1:1 du site [vicicar.com](https://www.vicicar.com) (Webflow) en **Next.js 15 + GSAP**, avec en plus un formulaire multi-étapes de qualification.

Vicicar aide les particuliers à trouver leur voiture idéale, gratuitement : ils décrivent leur besoin via le formulaire, un expert (un humain, pas un robot) les rappelle.

## Stack

- **Next.js 15** (App Router, TypeScript, CSS Modules — pas de Tailwind, pour une fidélité 1:1 au CSS d'origine)
- **GSAP 3 + @gsap/react** (intro 3D des lettres, reveal vidéo au survol, sweep des liens nav, transitions du formulaire, reveals au scroll)
- Polices locales : **Octane** (police variable, axes `wght`/`wdth` — l'étirement des lettres au survol) et **Oak Sans**

## Démarrer

```bash
npm install
npm run dev
```

## Pages

| Route | Contenu |
|---|---|
| `/` | Hero V·I·C·I·C·A·R — réplique exacte du site d'origine |
| `/trouver-ma-voiture` | Formulaire multi-étapes (8 étapes) → POST `/api/leads` |
| `/avis` | Témoignages clients |
| `/a-propos` | Mission + « comment ça marche » |
| `/contact` | Coordonnées + mini formulaire → POST `/api/contact` |
| `/mentions-legales` | Page légale |

## À brancher avant la mise en prod

- `app/api/leads/route.ts` : les leads sont seulement loggés — brancher CRM / email / base de données.
- `app/api/contact/route.ts` : idem.
- Coordonnées de la page contact (email, téléphone, horaires) : valeurs **placeholder** à remplacer.
- Témoignages `/avis` et chiffres (4,9/5, +250…) : contenu **placeholder** à remplacer par de vrais avis.

## Référence

`_reference/` contient la capture du site Webflow d'origine (HTML, CSS, données d'animation IX2, assets, polices, specs dérivées et captures d'écran de comparaison).
