# Vicicar — Content + UX Spec (pages secondaires)

Spec d'implémentation. Tout le copy est **définitif** — l'implémenteur le reprend mot pour mot (casse, accents, ponctuation incluses). Toute la copie est en FRANÇAIS.

Référence visuelle commune (héritée de la home) :
- Fond : `--background: black`. Titres : `--heading: white`. Paragraphes : `--paragraphs: #ffffff80`. Bordures : `--border: #fff3`. Accents : `--azure: #d9e9e9`, `--midnight-blue: #272c5d`.
- Display : **Octane** (variable, axes `wght` 0–100 / `wdth` 0–100). Réglage de base display : `font-variation-settings: "wght" 10, "wdth" 0`, uppercase. Effet signature : animation de `wdth` 0→100 en 3s `cubic-bezier(.165,.84,.44,1)` (hover ou sélection).
- Corps : **Oak Sans** 16px, line-height 1.7em. Micro-labels : `.8em`, uppercase, letter-spacing `.07em`, weight 500 (même style que `.nav-text` / `.text-info`).
- Surfaces verre : `backdrop-filter: blur(30px); background: #70707033; border-radius: 1em`.
- Navbar fixe existante inchangée sur toutes les pages. Liens nav : `AVIS`, `A PROPOS`, logo centre, `TROUVER MA VOITURE`, `CONTACT`.

---

## 1. `/trouver-ma-voiture` — Formulaire cinématique (LA pièce maîtresse)

### 1.1 Principe

Plein écran (100svh), fond noir, **une question par écran**. 8 étapes + 1 écran de coordonnées + 1 écran de succès. La navbar reste visible mais le lien actif `TROUVER MA VOITURE` est souligné (underline `.block-underline` restée à `translate(0)`).

Structure d'un écran :
1. **Eyebrow** (micro-label) : `ÉTAPE {n} / 8` — .8em uppercase, couleur `--paragraphs`.
2. **Titre de la question** : Octane, `clamp(2.5rem, 8vw, 7rem)`, uppercase, blanc, `"wght" 10, "wdth" 25`. Au montage de l'écran, le titre anime `wdth` 0→25 (0.9s, même bezier) en plus du slide GSAP.
3. **Helper** (optionnel) : Oak Sans 1em, `--paragraphs`, max-width 32em.
4. **Options** : cartes/pills typographiques (voir 1.3).
5. **Barre d'actions** : bouton retour + bouton continuer (voir 1.4).

### 1.2 Progress + navigation

- **Indicateur de progression** : barre fixe de 2px en haut du viewport, sous la navbar, pleine largeur. Fond `#fff3`, remplissage blanc, width = `step/9 * 100%` (l'écran coordonnées = étape 9 ; le succès remplit à 100%). Animée par GSAP `width`, 0.6s `power3.out`.
- À droite de la barre d'actions (desktop) : compteur texte `0{n} — 09` en micro-label.
- **Transitions GSAP entre étapes** : timeline sortie/entrée.
  - Sortie (avancer) : écran courant `y: 0 → -60`, `opacity: 1 → 0`, 0.45s `power2.in`.
  - Entrée (avancer) : nouvel écran `y: 60 → 0`, `opacity: 0 → 1`, 0.6s `power3.out`, options en stagger 0.05s.
  - Reculer : mêmes valeurs en miroir (`y` inversé).
  - `prefers-reduced-motion: reduce` → fondu simple 0.3s, pas de translation.
- **Retour** : bouton `← RETOUR` (micro-label, ghost, hover : underline slide-in identique au nav-link) présent dès l'étape 2. Touche `Backspace` (hors champ de saisie) et flèche `←` = retour. L'état des réponses est conservé.
- **Clavier** : chaque option porte un raccourci visible (`1`–`6`). `Tab`/flèches `↑ ↓` naviguent entre options (roving tabindex, `role="radiogroup"` / `role="radio"`), `Enter` ou `Espace` sélectionne. Sur sélection d'une option à choix unique : auto-avance après 450ms (le temps de voir l'état sélectionné). `Enter` sur l'écran budget/coordonnées = continuer.
- **État sélectionné d'une option** : bordure passe de `#fff3` à blanc, fond `#70707033` (verre), et le label Octane anime `wdth` 0→100 (0.8s). Hover non sélectionné : bordure `#ffffff80` + `wdth` 0→40.
- Deep state : réponses stockées en mémoire (context/store) ; un refresh repart à l'étape 1 (pas de persistance requise en V1).

### 1.3 Les 8 étapes — copy exact

Format options : **LABEL** (Octane, uppercase, ~`clamp(1.4rem,3.2vw,2.6rem)`) + sous-texte éventuel (Oak Sans .9em, `--paragraphs`). Cartes : bordure 1px `--border`, border-radius 1em, padding 1.2em 1.6em, disposition en grille 2–3 colonnes desktop / 1 colonne mobile.

**Étape 1 — Type de véhicule** (choix unique)
- Eyebrow : `ÉTAPE 1 / 8`
- Titre : `QUEL TYPE DE VOITURE CHERCHEZ-VOUS ?`
- Helper : `Pas encore sûr ? Choisissez « Peu importe », on affinera ensemble au téléphone.`
- Options (label / sous-texte) :
  1. `CITADINE` — `Compacte, agile, parfaite en ville`
  2. `SUV` — `Surélevé, spacieux, polyvalent`
  3. `BERLINE` — `Confort et élégance sur la route`
  4. `BREAK` — `Du volume sans compromis`
  5. `UTILITAIRE` — `Pour le travail et les gros chargements`
  6. `PEU IMPORTE` — `Laissez-vous guider par nos experts`

**Étape 2 — État** (choix unique)
- Eyebrow : `ÉTAPE 2 / 8`
- Titre : `NEUVE OU D'OCCASION ?`
- Helper : `L'occasion récente offre souvent le meilleur rapport qualité-prix. On vous explique tout.`
- Options :
  1. `NEUVE` — `Zéro kilomètre, garantie constructeur`
  2. `OCCASION` — `Vérifiée, garantie, au juste prix`
  3. `LES DEUX` — `Le meilleur des deux mondes`

**Étape 3 — Budget** (choix unique, pills horizontales sur une « échelle »)
- Eyebrow : `ÉTAPE 3 / 8`
- Titre : `QUEL EST VOTRE BUDGET ?`
- Helper : `Une estimation suffit. Financement possible : on en parle lors de l'appel.`
- Options (pills, label seul) :
  1. `MOINS DE 10 000 €`
  2. `10 000 — 20 000 €`
  3. `20 000 — 35 000 €`
  4. `35 000 — 50 000 €`
  5. `PLUS DE 50 000 €`
  6. `JE NE SAIS PAS ENCORE`
- UX : pills en colonne (mobile) ou 2 colonnes (desktop), valeur stockée `budget: "lt10k" | "10-20k" | "20-35k" | "35-50k" | "gt50k" | "unknown"`.

**Étape 4 — Carburant** (choix unique)
- Eyebrow : `ÉTAPE 4 / 8`
- Titre : `QUELLE ÉNERGIE ?`
- Helper : `Le bon carburant dépend surtout de vos trajets. En cas de doute : « Peu importe ».`
- Options :
  1. `ESSENCE` — `Polyvalente et économique à l'achat`
  2. `DIESEL` — `Idéal pour les gros rouleurs`
  3. `HYBRIDE` — `Le compromis ville / route`
  4. `ÉLECTRIQUE` — `Silencieuse, zéro émission`
  5. `PEU IMPORTE` — `Nos experts vous conseilleront`

**Étape 5 — Boîte de vitesses** (choix unique)
- Eyebrow : `ÉTAPE 5 / 8`
- Titre : `MANUELLE OU AUTOMATIQUE ?`
- Options :
  1. `MANUELLE` — `Le contrôle, à l'ancienne`
  2. `AUTOMATIQUE` — `Le confort absolu, surtout en ville`
  3. `PEU IMPORTE` — `Les deux me conviennent`

**Étape 6 — Délai d'achat** (choix unique)
- Eyebrow : `ÉTAPE 6 / 8`
- Titre : `POUR QUAND ?`
- Helper : `Plus on s'y prend tôt, plus on négocie sereinement.`
- Options :
  1. `LE PLUS VITE POSSIBLE` — `J'en ai besoin maintenant`
  2. `SOUS 1 MOIS`
  3. `SOUS 3 MOIS`
  4. `SOUS 6 MOIS`
  5. `PLUS DE 6 MOIS` — `Je prépare mon projet`

**Étape 7 — Usage principal** (choix unique)
- Eyebrow : `ÉTAPE 7 / 8`
- Titre : `VOUS ROULEZ SURTOUT…`
- Options :
  1. `EN VILLE` — `Trajets courts, stationnement, bouchons`
  2. `SUR ROUTE` — `Longs trajets, autoroute, gros kilométrage`
  3. `MIXTE` — `Un peu de tout, au quotidien`
  4. `EN FAMILLE` — `Espace, sécurité, sièges enfants`

**Étape 8 — Coordonnées** (formulaire)
- Eyebrow : `DERNIÈRE ÉTAPE`
- Titre : `ON VOUS RAPPELLE ?`
- Helper : `Un expert Vicicar — un humain, pas un robot — vous appelle pour affiner votre recherche. C'est gratuit et sans engagement.`
- Champs (inputs ghost : fond transparent, border-bottom 1px `--border`, focus → border-bottom blanche animée gauche→droite 0.4s ; labels flottants en micro-label ; texte saisi en Oak Sans 1.25em blanc) :

| name (exact) | label | type | autocomplete | requis |
|---|---|---|---|---|
| `prenom` | `Prénom` | text | `given-name` | oui |
| `nom` | `Nom` | text | `family-name` | oui |
| `telephone` | `Téléphone` | tel | `tel` | oui |
| `email` | `Email` | email | `email` | oui |
| `creneau` | `Quand préférez-vous être appelé(e) ?` | pills (choix unique) | — | oui |
| `rgpd` | (checkbox consentement) | checkbox | — | oui |

- Options `creneau` (pills micro, style verre) : `MATIN (9H – 12H)` / `MIDI (12H – 14H)` / `APRÈS-MIDI (14H – 18H)` / `SOIRÉE (18H – 20H)` — valeurs `matin | midi | apres-midi | soiree`.
- Ligne RGPD (checkbox custom carré 1em bordure `--border`, coche blanche ; texte Oak Sans .85em `--paragraphs`) :
  `J'accepte que Vicicar utilise mes coordonnées pour me recontacter au sujet de ma recherche de voiture. Aucune revente de données, promis. Voir notre politique de confidentialité.`
  — « politique de confidentialité » est un lien souligné vers `/mentions-legales`.
- Bouton submit : pill pleine blanche, texte noir, micro-label : `ÊTRE RAPPELÉ GRATUITEMENT →`. État envoi : `ENVOI EN COURS…` (désactivé). 
- **Validation** (à la soumission + on-blur ; message d'erreur en `.8em` rouge `#ff6b6b` sous le champ, apparition fade/slide 0.25s ; `aria-describedby` + `aria-invalid`) :
  - `prenom`, `nom` : trim, longueur ≥ 2 → sinon `Veuillez renseigner ce champ.`
  - `telephone` : normaliser en retirant espaces, points, tirets, parenthèses ; regex **`^(?:\+33|0033|0)[1-9]\d{8}$`** → sinon `Entrez un numéro de téléphone français valide (ex. 06 12 34 56 78).`
  - `email` : regex `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$` → sinon `Entrez une adresse email valide.`
  - `creneau` non choisi → `Choisissez un créneau de rappel.`
  - `rgpd` non cochée → `Merci d'accepter pour qu'on puisse vous rappeler.`
  - Erreur réseau/serveur : bandeau au-dessus du bouton : `Oups, l'envoi a échoué. Vérifiez votre connexion et réessayez.`
- Payload soumis : toutes les réponses des étapes 1–7 + coordonnées (clés : `vehicule`, `etat`, `budget`, `carburant`, `boite`, `delai`, `usage`, `prenom`, `nom`, `telephone`, `email`, `creneau`).

### 1.4 Écran de succès

Plein écran, centré. La barre de progression se remplit à 100% puis fond out.
- Display Octane géant (~`12vw`) qui anime `wdth` 0→100 lentement (2.5s) au montage : `MERCI {PRENOM} !` (prénom saisi, uppercase ; fallback sans prénom : `MERCI !`).
- Sous-titre (Oak Sans 1.1em, blanc) : `Un expert Vicicar vous rappelle sous 24h.`
- Paragraphe (`--paragraphs`, max-width 32em, centré) : `Votre recherche est entre de bonnes mains. Pendant ce temps, pas besoin d'écumer les annonces : on s'occupe de tout. Surveillez votre téléphone — le numéro commencera par 01.`
- Lien retour (micro-label, underline animée) : `← RETOUR À L'ACCUEIL` → `/`.
- Confetti : NON. À la place, micro-animation : les 7 vidéos lettres de la home peuvent rejouer en fond très sombre (opacity .15) — optionnel, derrière le texte.

### 1.5 Accessibilité formulaire

- Chaque écran est un `<section role="group" aria-labelledby="{titre}">` ; au changement d'étape, focus programmatique sur le titre (`tabindex="-1"`).
- Annonce live (`aria-live="polite"`, visually-hidden) : `Étape {n} sur 9`.
- Cibles tactiles ≥ 48px. Contrastes : labels d'options en blanc pur sur noir.

---

## 2. `/avis` — Page Avis

### 2.1 Hero

- Eyebrow : `ILS NOUS ONT FAIT CONFIANCE`
- Titre Octane plein écran (~`20vw`, comme la home mais une seule ligne) : `AVIS` — chaque lettre reprend l'interaction hover `wdth` 0→100 de la home (sans vidéos, ou en réutilisant les vidéos A2/V/I/S si dispo : sinon pas de vidéo).
- Sous le titre (style `.text-info`) : `DES VRAIES VOITURES, TROUVÉES POUR DE VRAIS GENS`
- Stat strip (3 colonnes, bordures `--border`, chiffres en Octane `wdth` 60 ~4rem, label micro dessous) : `4,9/5` / `NOTE MOYENNE` — `+250` / `VOITURES TROUVÉES` — `100 %` / `GRATUIT, TOUJOURS`.

### 2.2 Témoignages — layout

Liste éditoriale verticale, **un avis = une rangée pleine largeur** séparée par une bordure 1px `--border` (pas de cards). Rangée en grille : gauche = grande citation (Oak Sans italic — utiliser OakSans-ItalicVF — `clamp(1.3rem,2.6vw,2rem)`, blanc) ; droite (ou dessous mobile) = méta : 5 étoiles (caractères `★★★★★` couleur `--azure`, `aria-label="5 étoiles sur 5"`), nom, ville, et la voiture trouvée en micro-label `VOITURE TROUVÉE : {modèle}`. Reveal au scroll : GSAP `opacity 0→1, y 40→0` au franchissement de 80% du viewport, stagger par rangée.

### 2.3 Les 8 avis — copy exact

1. **Sophie M. — Lyon** — Voiture trouvée : `PEUGEOT 2008 HYBRIDE`
   « Je redoutais les négociations en concession. Vicicar a tout géré : en dix jours j'avais trois propositions, et j'ai économisé 2 300 € sur le modèle que je voulais. »
2. **Karim B. — Paris** — Voiture trouvée : `RENAULT CLIO V OCCASION`
   « Un vrai humain au téléphone, qui pose les bonnes questions. Pas de jargon, pas de pression. Ma Clio était exactement dans mon budget, contrôle technique impeccable. »
3. **Claire D. — Bordeaux** — Voiture trouvée : `DACIA JOGGER 7 PLACES`
   « Troisième enfant en route, zéro temps pour chercher. Ils ont compris notre besoin mieux que nous. Le Jogger coche toutes les cases, livré en trois semaines. »
4. **Thomas L. — Nantes** — Voiture trouvée : `TESLA MODEL 3 OCCASION`
   « Je voulais passer à l'électrique sans me tromper. Leur expert m'a expliqué l'autonomie réelle, les bornes, la revente. J'ai signé en confiance. »
5. **Nadia R. — Marseille** — Voiture trouvée : `CITROËN C3 NEUVE`
   « Premier achat de voiture neuve de ma vie. On m'a accompagnée du premier appel jusqu'à la remise des clés. Et ça ne m'a rien coûté, je n'y croyais pas. »
6. **Julien P. — Toulouse** — Voiture trouvée : `VOLKSWAGEN TIGUAN`
   « 30 000 km par an pour le travail. Ils m'ont orienté vers un diesel récent que je n'aurais jamais trouvé seul, négocié 1 800 € sous le prix affiché. »
7. **Élodie F. — Lille** — Voiture trouvée : `MINI COOPER OCCASION`
   « Je rêvais d'une Mini mais je me méfiais des arnaques sur les sites d'annonces. Vicicar a vérifié l'historique complet du véhicule avant même que je le voie. »
8. **Marc V. — Strasbourg** — Voiture trouvée : `ŠKODA OCTAVIA BREAK`
   « Service bluffant d'efficacité. Un appel le lundi, une sélection le jeudi, l'essai le samedi. Mon break était sous la barre des 25 000 € comme demandé. »

### 2.4 CTA de fin de page

Bloc centré avant le footer : titre Octane (~8vw) `À VOTRE TOUR ?` + bouton pill blanche `TROUVER MA VOITURE →` vers `/trouver-ma-voiture`.

---

## 3. `/a-propos` — Page À propos

### 3.1 Hero

- Titre Octane (~`16vw`, 2 lignes) : `À PROPOS` (interaction lettre hover identique home, sans vidéos).
- Sous-titre `.text-info` : `ON CHERCHE. ON COMPARE. ON NÉGOCIE. VOUS CONDUISEZ.`

### 3.2 Section « Notre histoire »

- Eyebrow : `NOTRE HISTOIRE`
- Titre (Octane ~5vw) : `TROUVER UNE VOITURE NE DEVRAIT PAS ÊTRE UN PARCOURS DU COMBATTANT`
- Corps (2 paragraphes, `--paragraphs`, max-width 36em) :
  `Vicicar est né d'un constat simple : acheter une voiture, c'est des semaines d'annonces douteuses, de jargon technique et de négociations inconfortables. La plupart des gens finissent par payer trop cher — ou par choisir par défaut.`
  `Alors on a inversé le processus. Vous nous dites ce dont vous avez besoin, et nos experts indépendants font le travail à votre place : recherche, vérification, comparaison, négociation. Vous ne gardez que le meilleur moment — prendre le volant.`

### 3.3 Section « 100% gratuit »

- Eyebrow : `NOTRE MODÈLE`
- Titre : `GRATUIT POUR VOUS. VRAIMENT.`
- Corps :
  `Notre service ne vous coûte rien, et ne vous coûtera jamais rien. Vicicar est rémunéré par son réseau de distributeurs et de mandataires partenaires — jamais par vous, et jamais au détriment du prix que vous payez.`
  `Et parce que nous ne dépendons d'aucune marque, nos experts restent libres de vous recommander la voiture qui vous convient. Pas celle qu'il faut écouler.`

### 3.4 Section « Des experts indépendants »

- Eyebrow : `NOS EXPERTS`
- Titre : `DES HUMAINS, PAS DES ALGORITHMES`
- Corps :
  `Derrière chaque recherche, il y a un expert automobile qui connaît le marché, les cotes, les pièges de l'occasion et les marges des concessions. Il vous appelle, vous écoute, et négocie pour vous comme il le ferait pour un proche.`

### 3.5 Strip « Comment ça marche »

- Eyebrow : `COMMENT ÇA MARCHE`
- 3 colonnes (1 colonne mobile), chacune : numéro géant Octane `01 / 02 / 03` (~8vw, `wdth` anime 0→100 au scroll-reveal, stagger 0.15s), titre Oak Sans 1.2em blanc, texte `--paragraphs` :
  1. `01` — **Décrivez votre besoin** — `Trois minutes pour répondre à notre questionnaire : type de voiture, budget, usage, délai.`
  2. `02` — **Un expert vous appelle** — `Sous 24h, un expert Vicicar vous rappelle pour affiner votre projet et répondre à vos questions.`
  3. `03` — **Recevez une sélection** — `Vous recevez une sélection de voitures vérifiées et négociées. Vous choisissez, on s'occupe du reste.`
- Sous le strip, CTA pill blanche : `COMMENCER MA RECHERCHE →` → `/trouver-ma-voiture`.

---

## 4. `/contact` — Page Contact

Minimaliste, un seul écran si possible (min-height 100svh, contenu centré verticalement).

- Eyebrow : `CONTACT`
- Titre Octane (~`14vw`) : `PARLONS-EN` (hover lettres `wdth` comme home).
- Deux lignes géantes cliquables (Oak Sans `clamp(1.4rem,3.5vw,2.8rem)`, blanc, underline animée au hover comme nav-link) :
  - `bonjour@vicicar.com` → `mailto:bonjour@vicicar.com`
  - `01 86 76 04 04` → `tel:+33186760404`
- Micro-label sous les liens : `DU LUNDI AU SAMEDI, 9H – 19H`
- Mini-formulaire (mêmes inputs ghost que l'étape 8) :

| name | label | type | requis | validation / erreur |
|---|---|---|---|---|
| `nom` | `Nom` | text | oui | trim ≥ 2 → `Veuillez renseigner ce champ.` |
| `email` | `Email` | email | oui | même regex que §1.3 → `Entrez une adresse email valide.` |
| `message` | `Message` | textarea (4 lignes, auto-grow) | oui | trim ≥ 10 → `Dites-nous en un peu plus (10 caractères minimum).` |

- Bouton : pill blanche `ENVOYER →` ; envoi : `ENVOI EN COURS…`.
- Succès : le formulaire est remplacé (fondu croisé 0.4s) par : titre Oak Sans 1.3em blanc `Message bien reçu.` + paragraphe `--paragraphs` `On vous répond sous 24h ouvrées.`
- Erreur réseau : `Oups, l'envoi a échoué. Réessayez ou écrivez-nous directement à bonjour@vicicar.com.`

---

## 5. Footer partagé (toutes pages sauf l'écran de formulaire actif `/trouver-ma-voiture` — il réapparaît sur l'écran de succès)

Une bande sobre, padding `4em 1.4em 1.4em`, bordure top 1px `--border`.

- Rangée 1 (flex, space-between ; colonne sur mobile, gap 2em) :
  - Gauche : `logo.svg` (hauteur 1.62em, lien `/`).
  - Droite : liens nav en micro-label avec la même underline animée : `TROUVER MA VOITURE` (`/trouver-ma-voiture`) · `AVIS` (`/avis`) · `A PROPOS` (`/a-propos`) · `CONTACT` (`/contact`).
- Rangée 2 (micro-label, couleur `--paragraphs`, flex space-between ; colonne mobile) :
  - Gauche : `© 2026 VICICAR — TROUVEZ VOTRE VOITURE IDÉALE, 100% GRATUIT`
  - Droite : lien `MENTIONS LÉGALES` → `/mentions-legales` (page simple à prévoir, hors scope de cette spec).

---

## 6. Métadonnées (head) par page

| Route | `<title>` | meta description |
|---|---|---|
| `/trouver-ma-voiture` | `Trouver ma voiture — Vicicar` | `Décrivez la voiture de vos rêves en 3 minutes. Un expert Vicicar vous rappelle sous 24h. Gratuit et sans engagement.` |
| `/avis` | `Avis clients — Vicicar` | `Ils ont trouvé leur voiture idéale sans lever le petit doigt. Découvrez les avis de nos clients.` |
| `/a-propos` | `À propos — Vicicar` | `Vicicar cherche, compare et négocie votre prochaine voiture à votre place. Un service d'experts indépendants, 100% gratuit.` |
| `/contact` | `Contact — Vicicar` | `Une question ? Écrivez-nous ou appelez-nous : on vous répond sous 24h.` |

OG image commune : `assets/og.png`. Lang : `fr`.
