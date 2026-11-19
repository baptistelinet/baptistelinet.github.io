// Images allégées (1200 px, dossier m/) pour les petits écrans : téléphones et petites tablettes.
const small = Math.min(screen.width, screen.height) <= 820 && Math.max(innerWidth, innerHeight) <= 1400;
export const imgSrc = (f) => (small && /^img\/[^/]+\/[^/]+\.jpg$/.test(f) ? f.replace(/\/([^/]+)$/, '/m/$1') : f);
