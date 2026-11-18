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
  L_foot: {
    slug: 'projeter-le-client', num: '02', title: 'Projeter le client', kind: 'Stage · galerie',
    meta: ['Stage', 'Rendus'], color: '#EFECE6',
    text: "En stage, j'ai réalisé plans et esquisses pour divers clients. J'en montre ici les 3D : un escalier avec meuble d'entrée, l'agrandissement d'une maison en parement pierre avec sa terrasse, et une buanderie minimaliste mais pratique.",
  },
  I: {
    slug: 'vespasian-ix', num: '03', title: 'Vespasian IX', kind: 'Yacht',
    meta: ['The Boat', 'Projet fictif', 'Travail du volume'], color: '#DADDD0',
    text: "Vespasian IX est un projet architectural et scénographique conçu autour de l'identité d'un bateau. Sa silhouette élancée et ses lignes épurées traduisent une approche résolument moderne, où le minimalisme et la fluidité des formes renforcent l'expérience immersive. Les espaces alternent entre vues panoramiques ouvertes et séquences plus intimistes, recréant la sensation de voyage et d'évasion.",
    images: [],
  },
  N_left: {
    slug: 'maison-biarritz', num: '04', title: 'Maison Biarritz', kind: 'Résidentiel',
    meta: ['Rénovation + extension', '250 m²', 'Projet solo', 'Plans, 3D, permis de construire'], color: '#DADDD0',
    text: "Projet solo : une maison de 250 m² à rénover et une extension à créer, pour un couple et ses deux enfants venus de Paris vivre près de l'océan. La toiture est simplifiée à deux pans, la façade reprend les colombages et la charpente débordante de Biarritz. À l'intérieur, un effet « océan » : poignée en planche de surf, meuble de salon à lames bois et verre en vague, dressing parental ondulé.",
    images: [],
  },
  N_diag: {
    slug: 'bulle-musicale', num: '05', title: 'Bulle musicale', kind: 'Événementiel',
    meta: ['Auditorium de Lyon', 'Place Bellecour', 'Public 18-28 ans', 'Projet de groupe'], color: '#CBD3BE',
    text: "Pour l'Auditorium de Lyon, l'objectif était de séduire un public de 18 à 28 ans, souvent peu familier du lieu. Notre concept, « Plongez dans votre bulle musicale », crée une bulle sonore qui attire le regard : une ossature en métal, des finitions colorées, des jeux d'ombres et de lumière qui reprennent la charte graphique de l'Auditorium.",
    images: [],
  },
  N_right: {
    slug: 'cinque-frati', num: '06', title: 'Cinque Frati', kind: 'Commerce',
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
    slug: 'salle-de-cinema', num: '07', title: 'Salle de cinéma privée', kind: 'Résidentiel',
    meta: ['Dolby Atmos 9.1.6', 'Acoustique Texaa', 'Trinnov Altitude16'], color: '#2B2622',
    text: "Une salle de cinéma privée pensée pour l'immersion totale : canapés en gradins, panneaux muraux rétroéclairés, bandes lumineuses au sol. Le traitement acoustique Texaa habille murs et plafond ; le son Dolby Atmos 9.1.6, piloté par un processeur Trinnov Altitude16, place 9 enceintes à l'horizontale et 6 au plafond, toutes encastrées derrière des panneaux sur mesure.",
    images: [],
  },
  E_top: {
    slug: 'maison-californienne', num: '08', title: 'Maison californienne', kind: 'Galerie de rendus',
    meta: ['Rendus'], color: '#EFD9C9', text: '', images: [], gallery: true,
  },
  E_mid: {
    slug: 'maison-desert', num: '09', title: 'Maison dans le désert', kind: 'Galerie de rendus',
    meta: ['Rendus'], color: '#E5CBB6', text: '', images: [], gallery: true,
  },
  E_bot: {
    slug: 'labo-rendus', num: '10', title: 'Labo rendus', kind: 'Recherches',
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
export const ORDER = ['L_stem','L_foot','I','N_left','N_diag','N_right','E_stem','E_top','E_mid','E_bot','T_bar','T_stem'];
