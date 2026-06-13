export type Testimonial = {
  name: string;
  city: string;
  car: string;
  quote: string;
};

/* Copy exact — content-ux.md §2.3. Single source of truth: rendered by
   components/avis/TestimonialList.tsx and quoted on the home page
   (components/home/v3/Preuve.tsx via HOME_PULL_QUOTE below). */
export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Sophie M.",
    city: "Lyon",
    car: "PEUGEOT 2008 HYBRIDE",
    quote:
      "« Je redoutais les négociations en concession. Vicicar a tout géré : en dix jours j'avais trois propositions, et j'ai économisé 2 300 € sur le modèle que je voulais. »",
  },
  {
    name: "Karim B.",
    city: "Paris",
    car: "RENAULT CLIO V OCCASION",
    quote:
      "« Un vrai humain au téléphone, qui pose les bonnes questions. Pas de jargon, pas de pression. Ma Clio était exactement dans mon budget, contrôle technique impeccable. »",
  },
  {
    name: "Claire D.",
    city: "Bordeaux",
    car: "DACIA JOGGER 7 PLACES",
    quote:
      "« Troisième enfant en route, zéro temps pour chercher. Ils ont compris notre besoin mieux que nous. Le Jogger coche toutes les cases, livré en trois semaines. »",
  },
  {
    name: "Thomas L.",
    city: "Nantes",
    car: "TESLA MODEL 3 OCCASION",
    quote:
      "« Je voulais passer à l'électrique sans me tromper. Leur expert m'a expliqué l'autonomie réelle, les bornes, la revente. J'ai signé en confiance. »",
  },
  {
    name: "Nadia R.",
    city: "Marseille",
    car: "CITROËN C3 NEUVE",
    quote:
      "« Premier achat de voiture neuve de ma vie. On m'a accompagnée du premier appel jusqu'à la remise des clés. Et ça ne m'a rien coûté, je n'y croyais pas. »",
  },
  {
    name: "Julien P.",
    city: "Toulouse",
    car: "VOLKSWAGEN TIGUAN",
    quote:
      "« 30 000 km par an pour le travail. Ils m'ont orienté vers un diesel récent que je n'aurais jamais trouvé seul, négocié 1 800 € sous le prix affiché. »",
  },
  {
    name: "Élodie F.",
    city: "Lille",
    car: "MINI COOPER OCCASION",
    quote:
      "« Je rêvais d'une Mini mais je me méfiais des arnaques sur les sites d'annonces. Vicicar a vérifié l'historique complet du véhicule avant même que je le voie. »",
  },
  {
    name: "Marc V.",
    city: "Strasbourg",
    car: "ŠKODA OCTAVIA BREAK",
    quote:
      "« Service bluffant d'efficacité. Un appel le lundi, une sélection le jeudi, l'essai le samedi. Mon break était sous la barre des 25 000 € comme demandé. »",
  },
];

/* Home pull-quote (landing-v2.md §6.3) — the displayed text is the first
   two sentences of TESTIMONIALS[1] (Karim B.); keep them in sync. */
export const HOME_PULL_QUOTE = {
  text: "« Un vrai humain au téléphone, qui pose les bonnes questions. Pas de jargon, pas de pression. »",
  name: TESTIMONIALS[1].name,
};
