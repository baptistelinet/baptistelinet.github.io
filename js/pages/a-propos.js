import { ROOMS } from '../projects.js';
import { esc, split } from './_kit.js';

const TITLES = Object.fromEntries(Object.values(ROOMS).filter(r => r.slug).map(r => [r.slug, r.title]));
const WORDS = ['Architecture', '3D', 'Sport', 'Musique', 'Photo'];
const TOOLS = [
  ['Archicad', 'outil de prédilection : modéliser en 3D en générant plans et coupes en simultané'],
  ['V-Ray', 'pour des rendus intérieurs réalistes et précis'],
  ['Twinmotion', 'pour valoriser les extérieurs, notamment en animation'],
  ['Lightroom', 'pour les ajustements subtils'],
  ['Photoshop', 'pour les retouches plus poussées'],
  ['InDesign', 'pour structurer et présenter les projets'],
  ['AutoCAD', 'ponctuellement'],
];
const QUALITIES = [
  ['Ouverture d’esprit', 'Curieux de nature, j’explore les idées sans a priori.'],
  ['Adaptabilité', 'À l’aise face au changement, je m’ajuste rapidement aux besoins et aux contraintes.'],
  ['Communication & écoute', 'Le dialogue est au cœur de mon processus : comprendre pour mieux concevoir.'],
  ['Esprit de synthèse & résolution de problème', 'Je transforme les idées complexes en solutions claires, efficaces et esthétiques.'],
];
// Les 12 pièces de la maison forment le mot LINET (x0 = début de chaque lettre, lettres de 80 x 120).
// Slug vide = pièce libre (dessinée en clair, sans lien) ; plusieurs traits peuvent porter le même projet.
const SEGS = [
  ['strate', 7, 7, 7, 113], ['strate', 7, 113, 73, 113],
  ['vespasian-ix', 144, 7, 144, 113],
  ['maison-biarritz', 215, 113, 215, 7], ['', 215, 7, 281, 113], ['cinque-frati', 281, 113, 281, 7],
  ['salle-de-cinema', 319, 7, 319, 113], ['', 319, 7, 385, 7], ['', 319, 60, 372, 60], ['labo-rendus', 319, 113, 385, 113],
  ['a-propos', 423, 7, 489, 7], ['contact', 456, 7, 456, 113],
];
const PLACES = [...new Set(SEGS.map(s => s[0]).filter(Boolean))];
function planSvg({ links = false, cls = '' } = {}) {
  const seg = s => `<line class="seg${s[1] === 215 && s[3] === 281 ? ' dg' : ''}${s[0] ? '' : ' vide'}" data-slug="${s[0]}" x1="${s[1]}" y1="${s[2]}" x2="${s[3]}" y2="${s[4]}" pathLength="1"/>`;
  const body = SEGS.map(s => links && s[0]
    ? `<a href="#/${s[0]}" data-slug="${s[0]}" aria-label="${esc(TITLES[s[0]] || s[0])}"><line class="hit" x1="${s[1]}" y1="${s[2]}" x2="${s[3]}" y2="${s[4]}"/>${seg(s)}</a>`
    : seg(s)).join('');
  return `<svg class="ap-plan ${cls}" viewBox="0 0 496 120" ${links ? 'role="group" aria-label="Plan LINET"' : 'aria-hidden="true"'} preserveAspectRatio="xMidYMid meet">${body}</svg>`;
}

export default {
  mount(ctx) {
    const { root, scroller, gsap, ScrollTrigger, project, reduced } = ctx;
    const signal = ctx.signal;
    ScrollTrigger.defaults({ scroller });
    let visited = [];
    try { visited = JSON.parse(localStorage.getItem('linet-visited') || '[]'); if (!Array.isArray(visited)) visited = []; } catch (e) { visited = []; }
    if (!visited.includes('a-propos')) { visited.push('a-propos'); try { localStorage.setItem('linet-visited', JSON.stringify(visited)); } catch (e) {} }
    const isVisited = s => visited.includes(s);
    const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

    root.innerHTML = `
      <section class="ap-hero">
        <p class="ap-label ap-kind">Architecte d’intérieur</p>
        <h1 class="ap-name"><span class="ap-line"><span class="ap-l1">Baptiste</span></span><span class="ap-line"><span class="ap-l2">Linet</span></span></h1>
        <div class="ap-plan-wrap">${planSvg({ cls: 'ap-hero-plan' })}</div>
        <p class="ap-label ap-scroll">Défiler</p>
      </section>
      <section class="ap-sec ap-demarche">
        <p class="ap-label">Démarche</p>
        <p class="ap-lead">${esc(project.text)}</p>
      </section>
      <section class="ap-words" aria-label="Passions">
        <p class="ap-label ap-wl">Passionné de</p>
        <div class="ap-wstack">${WORDS.map((w, i) => `<span class="ap-word" aria-hidden="${i ? 'true' : 'false'}">${esc(w)}</span>`).join('')}</div>
        <ul class="ap-ticks" aria-hidden="true">${WORDS.map(w => `<li>${esc(w)}</li>`).join('')}</ul>
        <p class="ap-sr">${WORDS.join(', ')}</p>
      </section>
      <section class="ap-tools">
        <p class="ap-label ap-sec-l">Outils</p>
        <div class="ap-track">${TOOLS.map((t, i) => `<article class="ap-tool"><span class="ap-label">${String(i + 1).padStart(2, '0')}</span><h2>${esc(t[0])}</h2><p>${esc(cap(t[1]))}.</p></article>`).join('')}</div>
      </section>
      <section class="ap-sec ap-quals">
        <p class="ap-label">Qualités</p>
        <div class="ap-q">
          <svg class="ap-q-svg" aria-hidden="true"></svg>
          ${QUALITIES.map(q => `<article class="ap-qi"><h2>${esc(q[0])}</h2><p>${esc(q[1])}</p></article>`).join('')}
          <span class="ap-hub" aria-hidden="true"></span>
        </div>
      </section>
      <section class="ap-sec ap-visit">
        <p class="ap-label">Pièces visitées</p>
        <div class="ap-visit-plan">${planSvg({ links: true, cls: 'ap-map' })}</div>
        <p class="ap-visit-cap"><span class="ap-visit-name">Maquette LINET</span><span class="ap-visit-n"></span></p>
      </section>`;
    const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];

    // Pièces allumées (hero + carte finale)
    const lit = () => {
      $$('.seg').forEach(l => l.classList.toggle('on', isVisited(l.dataset.slug)));
      $('.ap-visit-n').textContent = `${PLACES.filter(isVisited).length} / ${PLACES.length} pièces visitées`;
    };
    lit();
    const nameEl = $('.ap-visit-name');
    $$('.ap-map').length && $$('.ap-visit-plan a').forEach(a => {
      const on = () => { nameEl.textContent = TITLES[a.dataset.slug] || a.dataset.slug; };
      const off = () => { nameEl.textContent = 'Maquette LINET'; };
      a.addEventListener('mouseenter', on, { signal }); a.addEventListener('focus', on, { signal });
      a.addEventListener('mouseleave', off, { signal }); a.addEventListener('blur', off, { signal });
    });

    // Ouverture
    const name = split($('.ap-l1')).concat(split($('.ap-l2')));
    const hero = $$('.ap-hero-plan .seg');
    if (reduced) {
      gsap.set(hero, { strokeDashoffset: 0 });
    } else {
      gsap.set(name, { yPercent: 110 });
      gsap.set(hero, { strokeDashoffset: 1, opacity: 0 });
      const tl = gsap.timeline({ delay: 0.35 });
      tl.to(name, { yPercent: 0, duration: 0.7, ease: 'expo.out', stagger: 0.04 }, 0)
        .from('.ap-kind', { opacity: 0, y: 10, duration: 0.6, ease: 'power3.out' }, 0)
        .to(hero, { strokeDashoffset: 0, opacity: 1, duration: 0.9, ease: 'power2.inOut', stagger: 0.05 }, 0.15)
        .from('.ap-scroll', { opacity: 0, duration: 0.5 }, 1.0);
    }
    // les pièces s'allument une à une après le tracé
    const onSegs = hero.filter(l => isVisited(l.dataset.slug));
    hero.forEach(l => l.classList.add('base'));
    if (reduced) hero.forEach(l => l.classList.remove('base'));
    else gsap.delayedCall(1.2, () => hero.forEach((l, i) => setTimeout(() => { if (!signal.aborted) l.classList.remove('base'); }, i * 40)));
    void onSegs;

    // Démarche
    if (!reduced) gsap.from('.ap-demarche > *', { y: 30, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: '.ap-demarche', start: 'top 80%' } });

    // Mot géant épinglé
    const words = $$('.ap-word'), ticks = $$('.ap-ticks li');
    const setTick = i => ticks.forEach((t, k) => t.classList.toggle('on', k === i));
    setTick(0);
    if (reduced) { $('.ap-words').classList.add('static'); }
    else {
      gsap.set(words.slice(1), { yPercent: 105, opacity: 0 });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: '.ap-words', start: 'top top', end: () => '+=' + WORDS.length * 70 + '%', pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: s => setTick(Math.min(WORDS.length - 1, Math.floor(s.progress * 4.6 + 0.5))) },
      });
      words.slice(1).forEach((w, k) => {
        const t = k + 0.5;
        tl.to(words[k], { yPercent: -105, opacity: 0, duration: 0.5, ease: 'power2.inOut' }, t)
          .to(w, { yPercent: 0, opacity: 1, duration: 0.5, ease: 'power2.inOut' }, t);
      });
      tl.to({}, { duration: 0.6 });
    }

    // Bandeau d'outils
    const track = $('.ap-track');
    if (!reduced) gsap.fromTo(track, { x: () => innerWidth * 0.12 }, {
      x: () => -(track.scrollWidth - innerWidth * 0.9), ease: 'none',
      scrollTrigger: { trigger: '.ap-tools', start: 'top bottom', end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true },
    });

    // Qualités reliées
    const q = $('.ap-q'), svg = $('.ap-q-svg'), items = $$('.ap-qi'), hub = $('.ap-hub');
    const NS = 'http://www.w3.org/2000/svg';
    let paths = [], dots = [];
    function layoutQ() {
      const R = q.getBoundingClientRect(), mobile = innerWidth <= 700;
      svg.setAttribute('viewBox', `0 0 ${R.width} ${R.height}`); svg.setAttribute('width', R.width); svg.setAttribute('height', R.height);
      const hr = hub.getBoundingClientRect(), hx = hr.left - R.left + hr.width / 2, hy = hr.top - R.top + hr.height / 2;
      items.forEach((it, i) => {
        const r = it.getBoundingClientRect(), L = r.left - R.left, Rt = r.right - R.left, T = r.top - R.top, B = r.bottom - R.top;
        let d, ax, ay;
        if (mobile) { ax = L - 14; ay = T + 14; d = `M${ax} ${ay}H${hx}V${hy}`; }
        else { ax = (i % 2 === 0) ? Rt + 12 : L - 12; ay = i < 2 ? B - 6 : T + 6; d = `M${ax} ${ay}H${hx}V${hy}`; }
        if (!paths[i]) {
          const p = document.createElementNS(NS, 'path'); p.setAttribute('pathLength', 1); p.setAttribute('class', 'ap-qline');
          const c = document.createElementNS(NS, 'circle'); c.setAttribute('r', 4); c.setAttribute('class', 'ap-qdot');
          svg.append(p, c); paths[i] = p; dots[i] = c;
        }
        paths[i].setAttribute('d', d); dots[i].setAttribute('cx', ax); dots[i].setAttribute('cy', ay);
      });
    }
    layoutQ();
    new ResizeObserver(layoutQ).observe(q);
    addEventListener('resize', layoutQ, { signal });
    if (reduced) { gsap.set(paths, { strokeDashoffset: 0 }); }
    else {
      gsap.set(paths, { strokeDashoffset: 1, opacity: 0 }); gsap.set(dots, { opacity: 0 }); gsap.set(hub, { scale: 0 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: q, start: 'top 70%', end: 'center 45%', scrub: 0.6 } });
      items.forEach((it, i) => {
        tl.from(it, { opacity: 0.15, y: 20, duration: 0.5 }, i * 0.25)
          .to(dots[i], { opacity: 1, duration: 0.2 }, i * 0.25)
          .to(paths[i], { strokeDashoffset: 0, opacity: 1, duration: 1, ease: 'none' }, i * 0.25 + 0.1);
      });
      tl.to(hub, { scale: 1, duration: 0.4, ease: 'back.out(2)' }, '>-0.2');
    }

    // Carte finale
    if (!reduced) gsap.from('.ap-visit-plan .seg', { strokeDashoffset: 1, opacity: 0, duration: 0.9, ease: 'power2.inOut', stagger: 0.05, scrollTrigger: { trigger: '.ap-visit', start: 'top 70%' } });
  },
};
