import { h, $$, esc, fig, autoReveal } from './_kit.js';

const NS = 'http://www.w3.org/2000/svg';
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
// bord supérieur irrégulier, comme une strate de pisé
function wave(x0, x1, y, amp, seed, bottom) {
  let d = `M${x0} ${bottom} L${x0} ${y}`;
  const n = 14;
  for (let i = 1; i <= n; i++) {
    const x = x0 + (x1 - x0) * i / n;
    const o = Math.sin(seed * 7.1 + i * 1.9) * amp + Math.cos(seed * 3.3 + i * 0.7) * amp * 0.6;
    d += ` L${x.toFixed(1)} ${(y + o).toFixed(1)}`;
  }
  return d + ` L${x1} ${bottom} Z`;
}
function lines(x0, x1, y0, y1, n, seed, col, op) {
  let s = '';
  for (let i = 1; i < n; i++) {
    const y = y0 + (y1 - y0) * i / n;
    s += `<path d="${wave(x0, x1, y, 1.6, seed + i, y + 0.01).replace(/ L\S+ \S+ Z$/, '')}" fill="none" stroke="${col}" stroke-opacity="${op}" stroke-width="1"/>`;
  }
  return s;
}

const ESPACES = [
  { n: 'L’accueil', t: 'Une banque en deux blocs, bois et pavés de verre, sous un linteau apparent.', k: /accueil/ },
  { n: 'Le hall', t: 'Un mur en pavés de verre et un porte-à-faux qui distingue l’existant de la greffe.', k: /hall/ },
  { n: 'La cafet et le café solidaire', t: 'Un comptoir abaissé à 90 cm et une table partagée.', k: /cafet|cafe|solidaire/ },
  { n: 'La mezzanine', t: 'Un bloc ajouté dans l’existant : une nouvelle strate.', k: /mezzanine/ },
  { n: 'L’espace hybride', t: 'Des méridiennes modulables et des portes sur pivot vers le jardin.', k: /hybride/ },
  { n: 'La bibliothèque', t: 'Une estrade : une nouvelle strate.', k: /biblio/ },
  { n: 'Les salles de travail', t: 'Mode travail, mode meeting, derrière un mur en pavés de verre.', k: /salle|travail|meeting/ },
  { n: 'Le préau', t: 'Une nouvelle toiture vitrée.', k: /preau/ },
  { n: 'Le jardin', t: 'Ouvert sur l’espace hybride par des portes sur pivot.', k: /jardin/ },
];

const MATS = [
  { id: 'verre', n: 'Pavé de verre', t: 'Un écho aux cloisons en briques d’origine.' },
  { id: 'pise', n: 'Pisé', t: 'Garde-corps en pisé : les nuances de terre forment des couches visibles.' },
  { id: 'chene', n: 'Chêne', t: 'Plaquage chêne Maven.' },
  { id: 'bolon', n: 'Bolon', t: 'Sol Bolon Sisal.' },
];

export default {
  mount(ctx) {
    const { root, scroller, gsap, ScrollTrigger, project: p, reduced } = ctx;
    const signal = ctx.signal;
    ScrollTrigger.defaults({ scroller });
    scroller.style.setProperty('--room', '#E5CBB6');
    root.style.background = '#E5CBB6';
    const images = (ctx.images || []).slice();
    const small = () => matchMedia('(max-width:700px)').matches;

    // images : accroche, espaces, galerie
    const hook = images.length ? images.shift() : null;
    const used = new Set();
    const spaceImg = ESPACES.map(e => {
      const im = images.find(i => !used.has(i) && e.k.test(norm(i.caption)));
      if (im) used.add(im);
      return im || null;
    });
    const rest = images.filter(i => !used.has(i));

    const title = (cls) => `<span class="st-band ${cls || ''}">STRA<span class="st-plus">+</span>E</span>`;
    const bands = [0, 1, 2, 3, 4].map(i => title()).join('');

    // frise : coupe de pisé
    const L = [
      { y: 300, b: 440, c: '#6E4733', a: 3, tx: '1887' },
      { y: 205, b: 306, c: '#A66A4A', a: 3.5, tx: '1907–1910' },
      { y: 152, b: 210, c: '#8d8279', a: 2, tx: '2023' },
      { y: 36, b: 158, c: '#C0603A', a: 3, tx: '2026' },
    ];
    const friseSvg = `<svg viewBox="0 0 400 450" role="img" aria-label="Coupe de strates : 1887, 1907-1910, 2023, 2026">
      ${L.map((l, i) => `<g class="fl" data-i="${i}">
        <path d="${wave(0, 400, l.y, l.a, i + 1, l.b)}" fill="${l.c}"/>
        ${lines(0, 400, l.y, l.b, i === 0 ? 8 : 5, i * 5, '#E5CBB6', 0.22)}
        ${i === 1 ? `<rect x="250" y="196" width="150" height="14" fill="#B07A58"/><rect x="40" y="196" width="60" height="14" fill="#D2A27C" opacity=".6"/>` : ''}
        ${i === 2 ? `<path d="M0 ${l.y + 30} H400" stroke="#2B2622" stroke-opacity=".35" stroke-dasharray="5 6"/>` : ''}
        ${i === 3 ? `<g class="gl">${[0, 1, 2, 3, 4, 5].map(k => [0, 1, 2].map(m => `<rect x="${222 + k * 28}" y="${58 + m * 28}" width="24" height="24" fill="#CBD3BE" opacity=".9"/>`).join('')).join('')}</g>` : ''}
        <text x="14" y="${l.y + 28}" fill="#E5CBB6" font-size="13" font-weight="500" letter-spacing="2" font-family="Jost,sans-serif">${l.tx}</text>
      </g>`).join('')}
    </svg>`;
    const FR = [
      ['1887', 'Construction', 'Construite par l’architecte Abraham Hirsch, l’école Gilibert pose la première couche.'],
      ['1907–1910', 'Agrandissement', 'Charles Monot ajoute le bâtiment sur rue, l’aile sur cour et le passage couvert.'],
      ['Juillet 2023', 'Fermeture', 'L’école ferme : le bâtiment attend sa nouvelle vie.'],
      ['2026', 'Stra+e', 'Une nouvelle strate, lieu de vie étudiant.'],
    ];

    // palimpseste
    const PH = 'Superposition de couches où l’on ajoute sans tout effacer, où l’on soustrait sans tout perdre, pour transmettre une même valeur sous une forme nouvelle.';
    const words = PH.split(' ');
    const wh = (cls) => words.map(w => `<span class="w">${esc(w)}${cls === 'o' ? '<i></i>' : ''}</span>`).join(' ');
    const SCH = [
      ['Bloc', '', `<g class="s-blk"><rect x="48" y="44" width="104" height="76" fill="#2B2622"/></g>`],
      ['Addition', 'imbrication · blocs · greffe architecturale', `<rect x="40" y="56" width="92" height="64" fill="#2B2622" opacity=".9"/><g class="s-add"><rect x="96" y="32" width="64" height="58" fill="#C0603A" stroke="#E5CBB6" stroke-width="2"/><rect x="132" y="86" width="40" height="34" fill="#CBD3BE" stroke="#E5CBB6" stroke-width="2"/></g>`],
      ['Soustraction', 'valorisation · réhabilitation · strates', `<rect x="48" y="44" width="104" height="76" fill="#2B2622"/><g class="s-sub"><rect x="102" y="44" width="50" height="38" fill="#CBD3BE"/><path d="M102 54H152M102 64H152M102 74H152" stroke="#C0603A" stroke-width="1.5"/></g>`],
      ['Transmission', 'entraide · échanges · événements · café solidaire · quartier', `<rect x="20" y="62" width="40" height="40" fill="#2B2622"/><rect x="140" y="62" width="40" height="40" fill="#C0603A"/><path class="s-arr" pathLength="1" d="M66 82 C 90 40, 110 40, 132 80" fill="none" stroke="#2B2622" stroke-width="2" stroke-dasharray="1" stroke-dashoffset="0"/><path class="s-ah" d="M123 74 L134 84 L136 70" fill="none" stroke="#2B2622" stroke-width="2"/>`],
    ];

    // matériaux
    const swatch = {
      verre: `<div class="st-glass">${'<i></i>'.repeat(80)}</div>`,
      pise: `<div class="st-pise">${['#6E4733', '#A66A4A', '#8C5E43', '#D2A27C', '#B07A58', '#7a4f38', '#C48D66'].map((c, i) => `<div style="background:${c};flex:${[1.2, .8, 1, .6, 1.1, .7, .9][i]};clip-path:polygon(0 0,100% ${i % 2 ? 0 : 12}%,100% 100%,0 100%)"></div>`).join('')}</div>`,
      chene: `<div class="st-oak">${Array.from({ length: 14 }, (_, i) => `<i style="background:linear-gradient(180deg,hsl(${30 + (i * 7) % 9} ${48 + (i * 5) % 12}% ${62 + (i * 11) % 14}%),hsl(${28 + (i * 5) % 8} 44% ${54 + (i * 7) % 12}%))"></i>`).join('')}</div>`,
      bolon: `<div class="st-bol"><svg viewBox="0 0 120 90" preserveAspectRatio="xMidYMid slice"><rect width="120" height="90" fill="#c9b79e"/>${Array.from({ length: 30 }, (_, r) => Array.from({ length: 40 }, (_, c) => `<rect class="bw" x="${c * 3}" y="${r * 3}" width="${(r + c) % 2 ? 3 : 1.4}" height="${(r + c) % 2 ? 1.4 : 3}" fill="${(r + c) % 2 ? '#8a7558' : '#e8dcc6'}"/>`).join('')).join('')}</svg></div>`,
    };

    // coupe : niveaux
    const LV = [['±0,00', 0], ['+5,00', 5], ['+9,40', 9.4], ['+13,40', 13.4]];
    const ly = v => 400 - v * 24;
    const coupe = `<svg viewBox="0 0 220 440" role="img" aria-label="Coupe simplifiée : niveaux ±0,00, +5,00, +9,40, +13,40">
      <rect x="62" y="${ly(13.4)}" width="14" height="${ly(0) - ly(13.4)}" fill="#8C5E43"/>
      <rect x="62" y="${ly(13.4)}" width="14" height="${(ly(0) - ly(13.4)) / 3}" fill="#A66A4A"/>
      <rect x="62" y="${ly(13.4) + (ly(0) - ly(13.4)) * 2 / 3}" width="14" height="${(ly(0) - ly(13.4)) / 3}" fill="#6E4733"/>
      <rect x="190" y="${ly(13.4)}" width="14" height="${ly(0) - ly(13.4)}" fill="#8C5E43"/>
      <rect x="190" y="${ly(13.4) + (ly(0) - ly(13.4)) / 3}" width="14" height="${(ly(0) - ly(13.4)) / 3}" fill="#A66A4A"/>
      ${[5, 9.4].map(v => `<rect x="62" y="${ly(v) - 3}" width="142" height="6" fill="#2B2622"/>`).join('')}
      <rect x="40" y="${ly(0)}" width="180" height="8" fill="#2B2622"/>
      <path d="M62 ${ly(13.4)} L204 ${ly(13.4)}" stroke="#2B2622" stroke-width="3"/>
      <g stroke="#2B2622" stroke-width="1.5" opacity=".55">${Array.from({ length: 8 }, (_, i) => `<path d="M${76 + i * 16} ${ly(13.4)} l8 -9"/>`).join('')}</g>
      <rect x="76" y="${ly(13.4) - 10}" width="114" height="8" fill="#CBD3BE" stroke="#2B2622" stroke-width="1.2" opacity=".0"/>
      <g class="lv">${LV.map(([t, v]) => `<path d="M0 ${ly(v)} H56" stroke="#2B2622" stroke-dasharray="3 4" opacity=".5"/><text x="0" y="${ly(v) - 6}">${t}</text>`).join('')}<text x="0" y="${ly(13.4) - 24}" font-size="10" fill="#C0603A" style="fill:#C0603A">TOITURE</text></g>
      <g class="mk"><rect x="62" y="-2" width="142" height="4" fill="#C0603A"/><circle cx="133" cy="0" r="7" fill="#C0603A"/></g>
    </svg>`;

    root.innerHTML = `
    <header class="st-hero">
      <div class="st-hero-top"><p class="st-l">Projet 01 · Tiers-lieu étudiant</p><p class="st-l" style="color:var(--ink)">Lyon 2e · 7 rue Gilibert</p></div>
      <h1 class="st-title" aria-label="Stra+e">${bands}</h1>
      <p class="st-sub st-in">Le lieu de vie étudiant installé dans l’ancienne école Gilibert, 700 m² à Lyon 2e. Projet 2026.</p>
      <ul class="st-chips st-in"><li>APD en groupe</li><li>700 m²</li><li>Construite en 1887</li></ul>
      <div class="st-strata" aria-hidden="true"><svg viewBox="0 0 1000 200" preserveAspectRatio="none">
        ${[['#D2A27C', 0], ['#B07A58', 1], ['#A66A4A', 2], ['#8C5E43', 3], ['#6E4733', 4]].map(([c, i]) => `<path class="hb" d="${wave(-40, 1040, 60 + i * 36, 7, i + 4, 220)}" fill="${c}"/>`).join('')}
        <path d="${wave(-40, 1040, 20, 3, 9, 40)}" fill="#C0603A" class="hb" transform="translate(0 0)" opacity=".0"/></svg></div>
    </header>

    <section class="st-sec st-intro">
      <div><p class="st-l st-r">Projet de groupe</p>
        <div class="st-team st-r"><span>Aucourt</span><span>Boukaoui</span><span>Linet</span><span>Verger</span></div></div>
      <p class="st-lead st-r">${esc(p.text)}</p>
    </section>
    ${hook ? `<section class="st-sec st-hook">${fig(hook, { cls: 'k-wipe', eager: true })}</section>` : ''}

    <section class="st-fr" id="stFr">
      <div class="st-fr-txt">
        ${FR.map(f => `<div class="st-fr-step"><p class="st-l">${f[1]}</p><p class="st-fr-y">${f[0]}</p><p>${f[2]}</p></div>`).join('')}
        <div class="st-fr-tick" aria-hidden="true"><i class="on"></i><i></i><i></i><i></i></div>
      </div>
      <div class="st-fr-svg">${friseSvg}</div>
    </section>

    <section class="st-pa" id="stPa">
      <p class="st-l" style="margin-bottom:20px">Palimpseste</p>
      <div class="st-pa-ph" aria-label="${esc(PH)}"><div class="o" aria-hidden="true">${wh('o')}</div><div class="u" aria-hidden="true">${wh('u')}</div></div>
      <div class="st-pa-stage">${SCH.map((s, i) => `<div class="st-sch"><p class="st-l">0${i + 1}</p><svg viewBox="0 0 200 150" aria-hidden="true">${s[2]}</svg><h3>${s[0]}</h3>${s[1] ? `<p>${s[1]}</p>` : ''}</div>`).join('')}</div>
    </section>
    <section class="st-trans"><p class="st-l st-r">Transmission</p><blockquote class="st-r">« L’ancienne école Gilibert était déjà un lieu d’apprentissage, de savoir et de vie collective. Le projet prolonge cette vocation sans la figer&nbsp;: la transmission scolaire devient une transmission plus libre, fondée sur l’entraide, les échanges entre étudiants, les événements, le café solidaire et le lien avec le quartier. »</blockquote></section>

    <section class="st-sec st-obj"><p class="st-l st-r">Objectifs</p>
      <ol><li class="st-r">Lutter contre l’isolement étudiant</li><li class="st-r">Réunir travail, confort et sociabilité</li><li class="st-r">Valoriser l’ancienne école et son patrimoine</li><li class="st-r">Créer un lieu attractif et durable</li></ol></section>

    <section class="st-lamp" id="stLamp" aria-label="Lampe de chantier : un motif de pavés de verre sous un aplat de terre">
      <div class="st-lamp-under"><svg preserveAspectRatio="xMidYMid slice" viewBox="0 0 1200 760"><defs><pattern id="stGl" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="#1c1815"/><rect x="3" y="3" width="54" height="54" fill="#CBD3BE" opacity=".92"/><rect x="9" y="9" width="42" height="42" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2"/><path d="M12 48 L48 12" stroke="#fff" stroke-opacity=".5" stroke-width="3"/><rect x="3" y="30" width="54" height="27" fill="#8fa386" opacity=".35"/></pattern></defs><rect width="1200" height="760" fill="url(#stGl)"/></svg>
        <div class="cap"><p class="st-l">Pavé de verre</p><p class="st-d">Un écho aux briques d’origine</p></div></div>
      <div class="st-lamp-over"><p class="st-l">Soustraction</p><p class="st-d">Ce qu’on décape laisse voir ce qui était dessous</p><p class="st-l" style="margin-top:28px;color:var(--ink)">Promenez la lampe</p></div>
      <div class="st-lamp-glow"></div>
    </section>

    <section class="st-sec st-mat"><p class="st-l st-r">Matériaux</p>
      <h2 class="st-d st-r" style="margin-top:12px">Quatre matières</h2>
      <div class="st-mat-g">${MATS.map(m => `<article class="st-s"><div class="st-s-sw" data-m="${m.id}">${swatch[m.id]}</div><h3>${m.n}</h3><p>${m.t}</p></article>`).join('')}</div>
      <div class="st-note"><div><p class="st-l">Lumières</p><p>directe · indirecte · naturelle · diffuse</p></div><div><p class="st-l">Lignes et formes</p><p>linéarité · imbrication · strates</p></div></div>
    </section>

    <section class="st-sec st-esp"><p class="st-l st-r">Les espaces</p>
      <h2 class="st-d st-r" style="margin-top:12px">Du sol à la toiture</h2>
      <div class="st-esp-g">
        <div class="st-esp-l">${ESPACES.map((e, i) => `<article class="st-sp"><span class="st-sp-n">0${i + 1}</span><div><h3>${e.n}</h3><p>${e.t}</p></div>${spaceImg[i] ? fig(spaceImg[i], { cls: 'k-wipe' }) : ''}</article>`).join('')}</div>
        <aside class="st-cp">${coupe}</aside>
      </div>
    </section>

    <section class="st-sec st-tech"><p class="st-l st-r">Données techniques</p>
      <div class="st-num">
        <div class="st-r"><b data-n="828.77" data-d="2">828,77</b><span>m² de surface intérieure</span></div>
        <div class="st-r"><b data-n="90" data-d="0">90</b><span>personnes · ERP 5e catégorie</span></div>
        <div class="st-r"><b data-n="4" data-d="0">4</b><span>niveaux, jusqu’à +13,40</span></div>
        <div class="st-r"><b data-n="60" data-d="0">60 cm</b><span>de murs porteurs en pisé conservés</span></div>
      </div>
      <div class="st-cols">
        <div class="st-r"><h3 class="st-l">Bâtiment</h3><ul><li><b>École Gilibert</b>, 7 rue Gilibert, Lyon 2e</li><li>700 m²</li><li>Abraham Hirsch, 1887</li><li>Charles Monot, 1907–1910</li><li>Fermée en juillet 2023</li></ul></div>
        <div class="st-r"><h3 class="st-l">Références</h3><ul><li><b>Peter Zumthor</b>, Kolumba Museum</li><li><b>Carlo Scarpa</b>, Castelvecchio Museum</li><li><b>Ricardo Bofill</b>, La Fabrica</li></ul></div>
        <div class="st-r"><h3 class="st-l">Niveaux</h3><ul><li>±0,00</li><li>+5,00</li><li>+9,40</li><li>+13,40 · toiture</li><li>Isolation fibre de bois</li></ul></div>
      </div>
    </section>
    ${rest.length ? `<section class="st-sec"><p class="st-l" style="margin-bottom:24px">Rendus</p><div class="st-gal">${rest.map((im, i) => fig(im, { cls: 'k-wipe' + (im.w > im.h * 1.3 && i % 3 === 0 ? ' wide' : '') })).join('')}</div></section>` : ''}
    `;

    const q = s => root.querySelector(s), qa = s => [...root.querySelectorAll(s)];
    const bandEls = qa('.st-title .st-band');
    const ease = 'expo.out';

    // 1. ouverture
    bandEls.forEach((b, i) => { b.style.clipPath = `inset(${i * 20}% 0% ${80 - i * 20}% 0%)`; });
    if (!reduced) {
      bandEls.forEach((b, i) => {
        gsap.fromTo(b, { clipPath: `inset(${i * 20}% 100% ${80 - i * 20}% 0%)`, x: -40 }, { clipPath: `inset(${i * 20}% 0% ${80 - i * 20}% 0%)`, x: 0, duration: 0.7, ease, delay: 0.35 + i * 0.08 });
      });
      gsap.from(qa('.st-plus'), { rotate: -90, duration: 0.8, ease: 'power3.out', delay: 0.5 });
      gsap.from(qa('.st-in'), { y: 24, opacity: 0, duration: 0.7, ease: 'power3.out', delay: 0.8, stagger: 0.1 });
      gsap.from(qa('.st-hero-top p'), { opacity: 0, duration: 0.6, delay: 0.5 });
      gsap.from(qa('.hb'), { y: 90, duration: 1.0, ease: 'power3.out', delay: 0.45, stagger: 0.07 });
      qa('.hb').forEach((el, i) => gsap.to(el, { x: i % 2 ? 14 : -14, duration: 4 + i, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
      gsap.to(qa('.st-strata'), { yPercent: 30, ease: 'none', scrollTrigger: { trigger: q('.st-hero'), start: 'top top', end: 'bottom top', scrub: 0.6 } });
    }

    // révélations génériques
    if (!reduced) {
      qa('.st-r').forEach(el => gsap.from(el, { y: 30, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));
    }
    autoReveal({ root, scroller, gsap, reduced });

    // 2. frise
    const fr = q('#stFr'), steps = qa('.st-fr-step'), layers = qa('.fl'), ticks = qa('.st-fr-tick i');
    if (!reduced) {
      fr.classList.add('is-pin');
      gsap.set(layers, { y: -70, opacity: 0 });
      gsap.set(layers[0], { y: 0, opacity: 1 });
      gsap.set(qa('.gl rect'), { scale: 0, transformOrigin: '50% 50%', svgOrigin: undefined });
      const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, scrollTrigger: { trigger: fr, start: 'top top', end: () => '+=' + (innerHeight * 3), pin: true, scrub: 0.6, anticipatePin: 1 } });
      for (let i = 1; i < 4; i++) {
        const t = (i - 1) * 1.2 + 0.3;
        tl.to(steps[i - 1], { opacity: 0, y: -20, duration: 0.3 }, t)
          .fromTo(steps[i], { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.4 }, t + 0.2)
          .to(layers[i], { y: 0, opacity: 1, duration: 0.7 }, t)
          .set(ticks[i], { className: 'on' }, t + 0.3);
      }
      tl.to(qa('.gl rect'), { scale: 1, duration: 0.5, stagger: { each: 0.02, from: 'random' } }, 2.9);
      tl.to({}, { duration: 0.4 });
    } else {
      steps.forEach(s => s.style.opacity = 1);
    }

    // 3. palimpseste
    const pa = q('#stPa');
    const ow = qa('.st-pa-ph .o .w'), uw = qa('.st-pa-ph .u .w'), stage = q('.st-pa-stage');
    if (!reduced) {
      const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: pa, start: 'top top', end: () => '+=' + innerHeight * 3.4, pin: true, scrub: 0.6, anticipatePin: 1 } });
      ow.forEach((w, i) => {
        const t = i * 0.16;
        tl.to(w.querySelector('i'), { scaleX: 1, duration: 0.14 }, t)
          .to(w, { opacity: 0.0, duration: 0.2, ease: 'power2.in' }, t + 0.18)
          .to(uw[i], { opacity: 1, y: 0, duration: 0.2 }, t + 0.18);
      });
      gsap.set(uw, { y: 8 });
      const T = ow.length * 0.16 + 0.6;
      tl.to({}, { duration: 0.5 }, T - 0.5)
        .to(q('.st-pa-ph'), { opacity: 0, y: -30, duration: 0.5, ease: 'power2.inOut' }, T)
        .to(pa.querySelector('.st-l'), { opacity: 0, duration: 0.3 }, T)
        .set(stage, { visibility: 'visible' }, T)
        .to(stage, { opacity: 1, duration: 0.4 }, T + 0.2);
      const sch = qa('.st-sch');
      gsap.set(sch, { opacity: 0.0 });
      gsap.set(q('.s-blk rect'), { transformOrigin: '50% 100%', scaleY: 0 });
      gsap.set(q('.s-add'), { x: 60, opacity: 0 });
      gsap.set(q('.s-sub'), { opacity: 0, scale: 0.2, transformOrigin: '100% 0%' });
      gsap.set(q('.s-arr'), { strokeDashoffset: 1 });
      gsap.set(q('.s-ah'), { opacity: 0 });
      const t0 = T + 0.6;
      tl.to(sch[0], { opacity: 1, duration: 0.3 }, t0).to(q('.s-blk rect'), { scaleY: 1, duration: 0.5, ease: 'power2.out' }, t0)
        .to(sch[1], { opacity: 1, duration: 0.3 }, t0 + 0.6).to(q('.s-add'), { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, t0 + 0.6)
        .to(sch[2], { opacity: 1, duration: 0.3 }, t0 + 1.2).to(q('.s-sub'), { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }, t0 + 1.2)
        .to(sch[3], { opacity: 1, duration: 0.3 }, t0 + 1.8).to(q('.s-arr'), { strokeDashoffset: 0, duration: 0.5 }, t0 + 1.8).to(q('.s-ah'), { opacity: 1, duration: 0.1 }, t0 + 2.3)
        .to({}, { duration: 0.6 });
    } else {
      pa.classList.add('static');
      gsap.set(qa('.s-blk rect,.s-add,.s-sub,.s-ah'), { opacity: 1 });
    }

    // 4. lampe de chantier
    const lamp = q('#stLamp');
    const lmp = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const setLamp = () => { lamp.style.setProperty('--lx', (lmp.x * 100).toFixed(1) + '%'); lamp.style.setProperty('--ly', (lmp.y * 100).toFixed(1) + '%'); };
    const mobile = () => small() || matchMedia('(hover:none)').matches;
    lamp.style.setProperty('--lr', small() ? '130px' : '280px');
    let lampVis = false, lampMoved = false, t0l = performance.now();
    new IntersectionObserver(es => { lampVis = es[0].isIntersecting; }, { threshold: 0 }).observe(lamp);
    lamp.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      const r = lamp.getBoundingClientRect(); lmp.tx = (e.clientX - r.left) / r.width; lmp.ty = (e.clientY - r.top) / r.height; lampMoved = true;
    }, { signal });
    if (mobile() && !reduced) {
      ScrollTrigger.create({ trigger: lamp, start: 'top bottom', end: 'bottom top', scrub: 0.5, onUpdate: s => { lmp.tx = 0.15 + s.progress * 0.7; lmp.ty = 0.5 + Math.sin(s.progress * 6.28) * 0.28; lampMoved = true; } });
    }
    setLamp();
    const loop = () => {
      if (ctx.signal.aborted) return;
      if (lampVis) {
        if (!lampMoved && !reduced) { const t = (performance.now() - t0l) / 1000; lmp.tx = 0.5 + Math.sin(t * 0.8) * 0.3; lmp.ty = 0.5 + Math.cos(t * 1.1) * 0.22; }
        lmp.x += (lmp.tx - lmp.x) * 0.14; lmp.y += (lmp.ty - lmp.y) * 0.14; setLamp();
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    // 5. matériaux
    qa('.st-s-sw').forEach(sw => {
      const m = sw.dataset.m;
      if (!reduced) gsap.from(sw, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.1, ease: 'power3.inOut', scrollTrigger: { trigger: sw, start: 'top 88%' } });
      if (m === 'verre') {
        const cells = [...sw.querySelectorAll('.st-glass i')];
        const flash = i => { const c = cells[i]; if (c) gsap.fromTo(c, { opacity: 1 }, { opacity: 0.5, duration: 1.1, ease: 'power2.out', overwrite: true }); };
        const hit = e => {
          const r = sw.getBoundingClientRect(); const cx = Math.floor((e.clientX - r.left) / r.width * 10), cy = Math.floor((e.clientY - r.top) / r.height * 8);
          [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { const x = cx + a, y = cy + b; if (x >= 0 && x < 10 && y >= 0 && y < 8) flash(y * 10 + x); });
        };
        sw.addEventListener('pointermove', hit, { signal });
        if (!reduced) { const iv = setInterval(() => flash(Math.floor(Math.random() * 80)), 380); signal.addEventListener('abort', () => clearInterval(iv)); }
        if (!reduced) gsap.from(cells, { opacity: 0, duration: 0.6, stagger: { each: 0.008, from: 'random' }, scrollTrigger: { trigger: sw, start: 'top 85%' } });
      }
      if (m === 'pise') {
        const bs = [...sw.querySelectorAll('.st-pise div')];
        if (!reduced) gsap.from(bs, { scaleX: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12, scrollTrigger: { trigger: sw, start: 'top 80%' } });
        sw.addEventListener('pointermove', e => { const r = sw.getBoundingClientRect(); const f = (e.clientY - r.top) / r.height * bs.length; bs.forEach((b, i) => gsap.to(b, { x: (i % 2 ? 1 : -1) * Math.max(0, 1 - Math.abs(f - i - 0.5) / 1.6) * 14, duration: 0.5, overwrite: 'auto' })); }, { signal });
        sw.addEventListener('pointerleave', () => gsap.to(bs, { x: 0, duration: 0.6 }), { signal });
      }
      if (m === 'chene') {
        const bs = [...sw.querySelectorAll('.st-oak i')];
        if (!reduced) gsap.from(bs, { scaleY: 0, duration: 0.8, ease: 'power3.out', stagger: 0.05, scrollTrigger: { trigger: sw, start: 'top 80%' } });
        sw.addEventListener('pointermove', e => { const r = sw.getBoundingClientRect(); const f = (e.clientX - r.left) / r.width * bs.length; bs.forEach((b, i) => gsap.to(b, { y: -Math.max(0, 1 - Math.abs(f - i - 0.5) / 2) * 10, duration: 0.4, overwrite: 'auto' })); }, { signal });
        sw.addEventListener('pointerleave', () => gsap.to(bs, { y: 0, duration: 0.6 }), { signal });
      }
      if (m === 'bolon') {
        const ws = [...sw.querySelectorAll('.bw')];
        if (!reduced) gsap.from(ws, { opacity: 0, duration: 0.5, stagger: { each: 0.0015, grid: [30, 40], from: 'start' }, scrollTrigger: { trigger: sw, start: 'top 85%' } });
        const svg = sw.querySelector('svg');
        sw.addEventListener('pointermove', e => {
          const r = svg.getBoundingClientRect(); const cx = (e.clientX - r.left) / r.width * 40, cy = (e.clientY - r.top) / r.height * 30;
          ws.forEach((w, i) => { const c = i % 40, rr = Math.floor(i / 40); const d = Math.hypot(c - cx, rr - cy); if (d < 5) gsap.fromTo(w, { x: (c % 2 ? 1 : -1) * 1.2 }, { x: 0, duration: 0.8, ease: 'elastic.out(1,0.4)', overwrite: true }); });
        }, { signal });
      }
    });

    // 6. espaces + coupe
    const sps = qa('.st-sp'), mk = q('.mk'), esp = q('.st-esp-l'), lvT = qa('.lv text');
    const yTop = ly(13.4), yBot = ly(0);
    gsap.set(mk, { y: yBot });
    if (!reduced) {
      sps.forEach(sp => ScrollTrigger.create({ trigger: sp, start: 'top 78%', onEnter: () => gsap.to(sp, { '--on': 1, duration: 0.8, ease: 'power3.out' }) }));
      ScrollTrigger.create({ trigger: esp, start: 'top 60%', end: 'bottom 60%', scrub: 0.6, onUpdate: s => {
        const y = yBot + (yTop - yBot) * s.progress; gsap.set(mk, { y });
        lvT.forEach((t, i) => { if (i < 4) t.style.fill = Math.abs(y - ly(LV[i][1])) < 22 ? '#C0603A' : ''; });
      } });
    } else sps.forEach(sp => sp.style.setProperty('--on', 1));

    // 7. chiffres
    qa('.st-num b').forEach(b => {
      const n = +b.dataset.n, d = +b.dataset.d, suf = b.textContent.includes('cm') ? ' cm' : '';
      const o = { v: reduced ? n : 0 }; const fmt = v => v.toFixed(d).replace('.', ',') + suf;
      b.textContent = fmt(o.v);
      if (!reduced) gsap.to(o, { v: n, duration: 1.6, ease: 'power3.out', onUpdate: () => { b.textContent = fmt(o.v); }, scrollTrigger: { trigger: b, start: 'top 90%' } });
    });

    // images : rafraîchir les positions une fois chargées
    qa('img').forEach(img => img.addEventListener('load', () => ScrollTrigger.refresh(), { signal, once: true }));
    requestAnimationFrame(() => ScrollTrigger.refresh());
  },
};
