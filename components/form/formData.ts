/* ============================================================
   /trouver-ma-voiture — step definitions
   Source of truth: _reference/spec/content-ux.md §1.3 (copy exact)
   Pure data — imported by both the client form and the server
   validator (app/api/leads/route.ts).
   ============================================================ */

export type ChoiceKey =
  | "vehicule"
  | "etat"
  | "budget"
  | "carburant"
  | "boite"
  | "delai"
  | "usage";

export type Option = {
  value: string;
  label: string;
  sub?: string;
};

export type ChoiceStepDef = {
  key: ChoiceKey;
  eyebrow: string;
  title: string;
  helper?: string;
  options: Option[];
  /** budget = label-only pills on a "scale" */
  pills?: boolean;
  /** desktop grid columns (≤991 → 2, ≤767 → 1) */
  cols: 2 | 3;
};

export const CHOICE_STEPS: ChoiceStepDef[] = [
  {
    key: "vehicule",
    eyebrow: "ÉTAPE 1 / 8",
    title: "QUEL TYPE DE VOITURE CHERCHEZ-VOUS ?",
    helper:
      "Pas encore sûr ? Choisissez « Peu importe », on affinera ensemble au téléphone.",
    cols: 3,
    options: [
      { value: "citadine", label: "CITADINE", sub: "Compacte, agile, parfaite en ville" },
      { value: "suv", label: "SUV", sub: "Surélevé, spacieux, polyvalent" },
      { value: "berline", label: "BERLINE", sub: "Confort et élégance sur la route" },
      { value: "break", label: "BREAK", sub: "Du volume sans compromis" },
      { value: "utilitaire", label: "UTILITAIRE", sub: "Pour le travail et les gros chargements" },
      { value: "peu-importe", label: "PEU IMPORTE", sub: "Laissez-vous guider par nos experts" },
    ],
  },
  {
    key: "etat",
    eyebrow: "ÉTAPE 2 / 8",
    title: "NEUVE OU D'OCCASION ?",
    helper:
      "L'occasion récente offre souvent le meilleur rapport qualité-prix. On vous explique tout.",
    cols: 3,
    options: [
      { value: "neuve", label: "NEUVE", sub: "Zéro kilomètre, garantie constructeur" },
      { value: "occasion", label: "OCCASION", sub: "Vérifiée, garantie, au juste prix" },
      { value: "les-deux", label: "LES DEUX", sub: "Le meilleur des deux mondes" },
    ],
  },
  {
    key: "budget",
    eyebrow: "ÉTAPE 3 / 8",
    title: "QUEL EST VOTRE BUDGET ?",
    helper: "Une estimation suffit. Financement possible : on en parle lors de l'appel.",
    cols: 2,
    pills: true,
    options: [
      { value: "lt10k", label: "MOINS DE 10 000 €" },
      { value: "10-20k", label: "10 000 — 20 000 €" },
      { value: "20-35k", label: "20 000 — 35 000 €" },
      { value: "35-50k", label: "35 000 — 50 000 €" },
      { value: "gt50k", label: "PLUS DE 50 000 €" },
      { value: "unknown", label: "JE NE SAIS PAS ENCORE" },
    ],
  },
  {
    key: "carburant",
    eyebrow: "ÉTAPE 4 / 8",
    title: "QUELLE ÉNERGIE ?",
    helper:
      "Le bon carburant dépend surtout de vos trajets. En cas de doute : « Peu importe ».",
    cols: 3,
    options: [
      { value: "essence", label: "ESSENCE", sub: "Polyvalente et économique à l'achat" },
      { value: "diesel", label: "DIESEL", sub: "Idéal pour les gros rouleurs" },
      { value: "hybride", label: "HYBRIDE", sub: "Le compromis ville / route" },
      { value: "electrique", label: "ÉLECTRIQUE", sub: "Silencieuse, zéro émission" },
      { value: "peu-importe", label: "PEU IMPORTE", sub: "Nos experts vous conseilleront" },
    ],
  },
  {
    key: "boite",
    eyebrow: "ÉTAPE 5 / 8",
    title: "MANUELLE OU AUTOMATIQUE ?",
    cols: 3,
    options: [
      { value: "manuelle", label: "MANUELLE", sub: "Le contrôle, à l'ancienne" },
      { value: "automatique", label: "AUTOMATIQUE", sub: "Le confort absolu, surtout en ville" },
      { value: "peu-importe", label: "PEU IMPORTE", sub: "Les deux me conviennent" },
    ],
  },
  {
    key: "delai",
    eyebrow: "ÉTAPE 6 / 8",
    title: "POUR QUAND ?",
    helper: "Plus on s'y prend tôt, plus on négocie sereinement.",
    cols: 2,
    options: [
      { value: "asap", label: "LE PLUS VITE POSSIBLE", sub: "J'en ai besoin maintenant" },
      { value: "1-mois", label: "SOUS 1 MOIS" },
      { value: "3-mois", label: "SOUS 3 MOIS" },
      { value: "6-mois", label: "SOUS 6 MOIS" },
      { value: "plus-6-mois", label: "PLUS DE 6 MOIS", sub: "Je prépare mon projet" },
    ],
  },
  {
    key: "usage",
    eyebrow: "ÉTAPE 7 / 8",
    title: "VOUS ROULEZ SURTOUT…",
    cols: 2,
    options: [
      { value: "ville", label: "EN VILLE", sub: "Trajets courts, stationnement, bouchons" },
      { value: "route", label: "SUR ROUTE", sub: "Longs trajets, autoroute, gros kilométrage" },
      { value: "mixte", label: "MIXTE", sub: "Un peu de tout, au quotidien" },
      { value: "famille", label: "EN FAMILLE", sub: "Espace, sécurité, sièges enfants" },
    ],
  },
];

export const CRENEAU_OPTIONS: Option[] = [
  { value: "matin", label: "MATIN (9H – 12H)" },
  { value: "midi", label: "MIDI (12H – 14H)" },
  { value: "apres-midi", label: "APRÈS-MIDI (14H – 18H)" },
  { value: "soiree", label: "SOIRÉE (18H – 20H)" },
];

/** progress denominator: 8 form screens, the 9th notch = success (fills to 100%) */
export const TOTAL_SCREENS = 9;
export const CONTACT_INDEX = CHOICE_STEPS.length; // screen 8 of 9
