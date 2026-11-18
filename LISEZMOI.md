# Maison Linet — prototype

Site statique (aucune compilation) prêt pour GitHub Pages : publier ce dossier tel quel.

- `index.html` : la page. `js/projects.js` : textes et images de chaque pièce (à compléter).
- `assets/maison-linet.glb` : la maquette exportée de Blender. Une pièce = un objet `floor_<id>` ; murs `wall_<id>_n` ; les objets sont rattachés automatiquement à la pièce qui les contient.
- Tester en local : `python -m http.server` dans ce dossier, puis http://localhost:8000
- Liens directs : `#/cinque-frati`, `#/strate`, etc.
