// Contenu des pièces. Une pièce = un objet "floor_<id>" dans le modèle Blender.
// Pour modifier un texte ou ajouter des images, il suffit d'éditer ce fichier.
export const ROOMS = {
  L_stem: {
    slug: 'strate', num: '01', title: 'Stra+e', kind: 'Tiers-lieu étudiant',
    meta: ['Lyon 2e · 7 rue Gilibert', '700 m²', 'APD en groupe'],
    color: '#E5CBB6',
    text: "Réhabilitation de l'ancienne école Gilibert en lieu de vie étudiant. Le concept de palimpseste garde les traces du bâtiment et y ajoute une nouvelle couche : pavés de verre, pisé et chêne. Projet mené avec Aucourt, Boukaoui et Verger.",
    images: [],
  },
  // Le pied du L fait partie de Stra+e : survol et clic ouvrent la même page.
  L_foot: { partOf: 'L_stem' },
  I: {
    slug: 'vespasian-ix', num: '02', title: 'Vespasian IX', kind: 'Yacht',
    meta: ['The Boat', 'Projet fictif', 'Travail du volume'], color: '#DADDD0',
    text: "Vespasian IX est un projet architectural et scénographique conçu autour de l'identité d'un bateau. Sa silhouette élancée et ses lignes épurées traduisent une approche résolument moderne, où le minimalisme et la fluidité des formes renforcent l'expérience immersive. Les espaces alternent entre vues panoramiques ouvertes et séquences plus intimistes, recréant la sensation de voyage et d'évasion.",
    images: [],
  },
  N_left: {
    slug: 'maison-biarritz', num: '03', title: 'Maison Biarritz', kind: 'Résidentiel',
    meta: ['Rénovation + extension', '250 m²', 'Projet solo', 'Plans, 3D, permis de construire'], color: '#DADDD0',
    text: "Projet solo : une maison de 250 m² à rénover et une extension à créer, pour un couple et ses deux enfants venus de Paris vivre près de l'océan. La toiture est simplifiée à deux pans, la façade reprend les colombages et la charpente débordante de Biarritz. À l'intérieur, un effet « océan » : poignée en planche de surf, meuble de salon à lames bois et verre en vague, dressing parental ondulé.",
    images: [],
  },
  // Pièce libre, prête pour un nouveau projet (voir le mode d'emploi en bas du fichier).
  N_diag: { empty: true },
  N_right: {
    slug: 'cinque-frati', num: '04', title: 'Cinque Frati', kind: 'Commerce',
    meta: ['Halles Paul Bocuse, Lyon', 'Épicerie corse'], color: '#EFD9C9',
    text: "Une épicerie fine corse au cœur des Halles de Lyon Paul Bocuse, pensée comme un pont entre l'authenticité insulaire et la modernité lyonnaise. Inspiré des souvenirs du village de Calasima, le lieu valorise les matériaux bruts, bois, pierre et enduits naturels, et fait des arches le symbole de l'accueil. Dégustation, démonstrations culinaires et salon premium complètent la boutique.",
    images: [
      ['img/cinque-frati/01_stand_vue-allee.jpg', "Le stand depuis l'allée des Halles"],
      ['img/cinque-frati/06_axo_stand.jpg', 'Axonométrie du stand'],
      ['img/cinque-frati/03_degustation.jpg', 'Comptoir de dégustation'],
      ['img/cinque-frati/07_axo_degustation.jpg', 'Axonométrie · dégustation'],
      ['img/cinque-frati/04_boutique-presentoirs.jpg', 'Présentoirs de la boutique'],
      ['img/cinque-frati/08_axo_presentoirs.jpg', 'Axonométrie · présentoirs'],
      ['img/cinque-frati/05_salon-premium.jpg', 'Salon premium'],
      ['img/cinque-frati/09_axo_premium.jpg', 'Axonométrie · salon premium'],
      ['img/cinque-frati/02_stand_vue-halles.jpg', 'Insertion dans les Halles'],
    ],
  },
  E_stem: {
    slug: 'salle-de-cinema', num: '05', title: 'Salle de cinéma privée', kind: 'Résidentiel',
    meta: ['Dolby Atmos 9.1.6', 'Acoustique Texaa', 'Trinnov Altitude16'], color: '#2B2622',
    text: "Une salle de cinéma privée pensée pour l'immersion totale : canapés en gradins, panneaux muraux rétroéclairés, bandes lumineuses au sol. Le traitement acoustique Texaa habille murs et plafond ; le son Dolby Atmos 9.1.6, piloté par un processeur Trinnov Altitude16, place 9 enceintes à l'horizontale et 6 au plafond, toutes encastrées derrière des panneaux sur mesure.",
    images: [],
  },
  // Pièce libre, prête pour un nouveau projet (voir le mode d'emploi en bas du fichier).
  E_top: { empty: true },
  // Pièce libre, prête pour un nouveau projet (voir le mode d'emploi en bas du fichier).
  E_mid: { empty: true },
  E_bot: {
    slug: 'labo-rendus', num: '06', title: 'Labo rendus', kind: 'Recherches',
    meta: ['Rendus', 'Essais'], color: '#EFECE6',
    text: 'Essais de lumière, de matière et de cadrage.', images: [], gallery: true,
  },
  T_bar: {
    slug: 'a-propos', num: '—', title: 'À propos', kind: 'Baptiste Linet',
    meta: ['Archicad', 'V-Ray', 'Twinmotion', 'Lightroom', 'Photoshop', 'InDesign', 'AutoCAD'], color: '#CBD3BE',
    text: "Passionné d'architecture et de réalisation 3D, mais aussi de sport, de musique et de photo. Mon travail se concentre sur l'aménagement de l'espace et la mise en valeur des volumes, avec une attention particulière à l'harmonie, à la lumière et aux proportions. Chaque projet allie esthétique et praticité pour créer des espaces à la fois fonctionnels et uniques.",
    images: [], info: true,
  },
  T_stem: {
    slug: 'contact', num: '—', title: 'Contact', kind: 'Écrire, appeler, télécharger',
    meta: ['E-mail', 'Instagram', 'Lyon'], color: '#EFECE6',
    text: 'Écrivez-moi pour un projet, un stage ou un poste.',
    images: [], info: true,
  },
};
// Ordre du menu « Projets » et des liens « pièce précédente / suivante ».
export const ORDER = ['L_stem','I','N_left','N_right','E_stem','E_bot','T_bar','T_stem'];

/* Ajouter un nouveau projet dans une pièce libre (N_diag = diagonale du N, E_top = bras haut du E, E_mid = bras du milieu du E) :
   1. Remplacer `{ empty: true }` par une fiche comme celles ci-dessus :
        N_diag: {
          slug: 'mon-projet', num: '07', title: 'Mon projet', kind: 'Résidentiel',
          meta: ['Lyon', '120 m²'], color: '#CBD3BE',
          text: "Texte de présentation.", images: [],
        },
   2. Ajouter 'N_diag' dans ORDER, à la place voulue.
   3. Déposer les images dans img/mon-projet/ (+ leurs versions 1200 px dans img/mon-projet/m/)
      et les lister dans img/mon-projet/_images.json : [{ "file": "img/mon-projet/01.jpg", "caption": "…", "kind": "rendu" }].
   La page s'affiche alors avec la mise en page par défaut (js/pages/_default.js) ; une page sur mesure
   peut être ajoutée ensuite en js/pages/mon-projet.js + css/pages/mon-projet.css. */
