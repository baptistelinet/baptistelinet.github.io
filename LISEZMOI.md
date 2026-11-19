# Maison Linet — prototype

Site statique (aucune compilation) prêt pour GitHub Pages : publier ce dossier tel quel.

- `index.html` : la page. `js/projects.js` : textes et images de chaque pièce (à compléter).
- `assets/maison-linet.glb` : la maquette exportée de Blender. Une pièce = un objet `floor_<id>` ; murs `wall_<id>_n` ; les objets sont rattachés automatiquement à la pièce qui les contient.
- Tester en local : `python -m http.server` dans ce dossier, puis http://localhost:8000
- Liens directs : `#/cinque-frati`, `#/strate`, etc.
- Images : chaque `img/<projet>/xx.jpg` a une version allégée `img/<projet>/m/xx.jpg` (1200 px) servie aux téléphones (`js/img.js`). Après ajout d'une image, créer aussi sa version `m/`.
- Fluidité : la maquette n'est redessinée que quand quelque chose bouge, les ombres sont calculées une fois, la résolution baisse seule si l'appareil peine.
