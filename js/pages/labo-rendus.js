import { ROOMS } from '../projects.js?v=20261119c';
import { esc } from './_kit.js';
import { imgSrc } from '../img.js';

// Projets dont les rendus alimentent la planche contact (ajouter ici le slug d'un nouveau projet)
const SLUGS = ['strate', 'vespasian-ix', 'maison-biarritz', 'cinque-frati', 'salle-de-cinema'];
const TITLES = Object.fromEntries(Object.values(ROOMS).filter(r => r.slug).map(r => [r.slug, r.title]));
const pad = (n, l = 3) => String(n).padStart(l, '0');
const CROPS = [
  { t: 30, r: 34, b: 30, l: 34, label: 'Détail' },
  { t: 6, r: 38, b: 46, l: 4, label: 'Plan large, haut gauche' },
  { t: 42, r: 4, b: 6, l: 40, label: 'Plan serré, bas droit' },
  { t: 0, r: 0, b: 0, l: 0, label: 'Cadre complet' },
];

async function loadAll() {
  const lists = await Promise.all(SLUGS.map(s =>
    fetch(`img/${s}/_images.json`).then(r => (r.ok ? r.json() : [])).catch(() => [])
      .then(a => (Array.isArray(a) ? a : []).filter(i => i && i.file && (!i.kind || i.kind === 'rendu')).map(i => ({ ...i, file: imgSrc(i.file), slug: s, project: TITLES[s] || s })))));
  return lists.flat();
}

export default {
  mount(ctx) {
    const { root, scroller, gsap, ScrollTrigger, reduced, project } = ctx;
    const signal = ctx.signal;
    try { const v = JSON.parse(localStorage.getItem('linet-visited') || '[]'); if (!v.includes('labo-rendus')) { v.push('labo-rendus'); localStorage.setItem('linet-visited', JSON.stringify(v)); } } catch (e) {}
    ScrollTrigger.defaults({ scroller });
    const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

    root.innerHTML = `
      <div class="lr-marks" aria-hidden="true"><i class="tl"></i><i class="tr"></i><i class="bl"></i><i class="br"></i></div>
      <header class="lr-head">
        <p class="lr-label">Planche contact</p>
        <h1 class="lr-title">${esc(project.title)}</h1>
        <p class="lr-lead">${esc(project.text)}</p>
      </header>
      <div class="lr-bar"><span class="lr-count" aria-live="off">ESSAI 000/000</span></div>
      <section class="lr-sheet"><ul class="lr-grid"></ul></section>
      <section class="lr-crop-sec" aria-label="Cadrage">
        <div class="lr-stick">
          <p class="lr-label lr-crop-lab">Cadrage</p>
          <div class="lr-fbox"><img class="lr-ghost" alt="" aria-hidden="true"><img class="lr-main" alt=""><div class="lr-crop" aria-hidden="true"><i class="tl"></i><i class="tr"></i><i class="bl"></i><i class="br"></i></div></div>
          <p class="lr-crop-cap"><span class="lr-label lr-crop-name"></span> <span class="lr-crop-img"></span></p>
        </div>
      </section>
      <div class="lr-loupe" aria-hidden="true"></div>
      <div class="lr-viewer" role="dialog" aria-modal="true" aria-label="Visionneuse" hidden>
        <div class="lr-vtop"><span class="lr-label lr-vcount"></span><button class="lr-vclose" type="button">Fermer</button></div>
        <button class="lr-vnav lr-vprev" type="button" aria-label="Image précédente">&larr;</button>
        <figure class="lr-vfig"><img alt=""><figcaption><span class="lr-vcap"></span><span class="lr-vproj"></span><a class="lr-vlink" href="#/">Voir le projet</a></figcaption></figure>
        <button class="lr-vnav lr-vnext" type="button" aria-label="Image suivante">&rarr;</button>
      </div>`;
    const $ = s => root.querySelector(s);
    const marks = [...root.querySelectorAll('.lr-marks i')];
    const countEl = $('.lr-count');

    // Ouverture : repères de coupe
    if (reduced) gsap.set(marks, { scale: 1 });
    else {
      marks.forEach(m => gsap.fromTo(m, { '--k': 0 }, { '--k': 1, duration: 0.6, delay: 0.35, ease: 'power3.out' }));
    }
    if (!reduced) gsap.from('.lr-head > *', { y: 24, opacity: 0, duration: 0.8, delay: 0.45, stagger: 0.08, ease: 'power3.out' });

    let all = [], cur = 0;
    const total = () => pad(all.length);
    const setCount = i => { countEl.textContent = `ESSAI ${pad(i + 1)}/${total()}`; };

    loadAll().then(items => {
      all = items;
      if (!all.length) { $('.lr-sheet').innerHTML = '<p class="lr-empty">Aucun rendu à afficher pour le moment.</p>'; countEl.textContent = 'ESSAI 000/000'; return; }
      const grid = $('.lr-grid');
      grid.innerHTML = all.map((im, i) => `<li><button class="lr-tile" type="button" data-i="${i}" aria-label="Ouvrir l’essai ${pad(i + 1)} : ${esc(im.project)}">
        <span class="lr-ph"><img src="${im.file}" alt="${esc(im.caption || '')}" loading="${i < 12 ? 'eager' : 'lazy'}" decoding="async"></span>
        <span class="lr-meta"><b>ESSAI ${pad(i + 1)}</b><em>${esc(im.project)}</em></span></button></li>`).join('');
      setCount(0);
      const tiles = [...grid.querySelectorAll('.lr-tile')];
      ctx.add(() => {
        if (reduced) { gsap.set(tiles, { opacity: 1 }); return; }
        gsap.set(tiles, { opacity: 0 });
        gsap.to(tiles, {
          keyframes: [{ opacity: 1, filter: 'brightness(2.6)', duration: 0.06 }, { opacity: 0.35, filter: 'brightness(1)', duration: 0.07 }, { opacity: 1, filter: 'brightness(1.4)', duration: 0.07 }, { filter: 'brightness(1)', duration: 0.12 }],
          stagger: { each: 0.02, from: 'start' }, delay: 0.95, clearProps: 'filter',
        });
      });

      // survol : compteur + loupe
      const loupe = $('.lr-loupe');
      tiles.forEach((t, i) => {
        const im = all[i];
        t.addEventListener('mouseenter', () => setCount(i), { signal });
        t.addEventListener('focus', () => setCount(i), { signal });
        t.addEventListener('click', () => openViewer(i, t), { signal });
        if (!fine) return;
        const ph = t.querySelector('.lr-ph');
        // la loupe n'apparaît qu'au premier mouvement (sinon elle resterait figée en haut à gauche, sur le bouton retour)
        t.addEventListener('mouseenter', () => { loupe.style.backgroundImage = `url("${im.file}")`; }, { signal });
        t.addEventListener('mouseleave', () => loupe.classList.remove('on'), { signal });
        t.addEventListener('mousemove', e => {
          const r = ph.getBoundingClientRect(), iw = im.w || 1800, ih = im.h || 1013;
          const s0 = Math.max(r.width / iw, r.height / ih), ox = (r.width - iw * s0) / 2, oy = (r.height - ih * s0) / 2;
          const x = e.clientX - r.left, y = e.clientY - r.top, R = 80;
          loupe.style.backgroundSize = `${iw * s0 * 2}px ${ih * s0 * 2}px`;
          loupe.style.backgroundPosition = `${R - (x - ox) * 2}px ${R - (y - oy) * 2}px`;
          loupe.style.transform = `translate(${e.clientX - R}px, ${e.clientY - R}px)`;
          loupe.classList.add('on');
        }, { signal });
      });

      // Cadrage
      const pick = all.find(i => i.slug === 'maison-biarritz') || all[0];
      const fb = $('.lr-fbox'), fimg = fb.querySelector('.lr-main'), ghost = fb.querySelector('.lr-ghost'), crop = $('.lr-crop');
      fimg.src = pick.file; ghost.src = pick.file; fimg.alt = pick.caption || '';
      fb.style.aspectRatio = `${pick.w || 1800}/${pick.h || 1013}`;
      $('.lr-crop-img').textContent = `${pick.project} · ${pick.caption || ''}`;
      const o = { ...CROPS[0] };
      const apply = () => {
        fimg.style.clipPath = `inset(${o.t}% ${o.r}% ${o.b}% ${o.l}%)`;
        crop.style.inset = `${o.t}% ${o.r}% ${o.b}% ${o.l}%`;
      };
      const nameEl = $('.lr-crop-name');
      ctx.add(() => {
        if (reduced) { Object.assign(o, CROPS[3]); apply(); nameEl.textContent = CROPS[3].label; $('.lr-crop-sec').style.height = 'auto'; return; }
        apply(); nameEl.textContent = CROPS[0].label;
        const tl = gsap.timeline({ scrollTrigger: { trigger: '.lr-crop-sec', start: 'top top', end: 'bottom bottom', scrub: 0.6 } });
        CROPS.slice(1).forEach((c, k) => {
          tl.to(o, { t: c.t, r: c.r, b: c.b, l: c.l, duration: 1, ease: 'power2.inOut', onUpdate: apply }, k * 1.3)
            .call(() => { nameEl.textContent = c.label; }, null, k * 1.3 + 0.5)
            .call(() => { nameEl.textContent = c.label; }, null, k * 1.3 + 0.5);
        });
        tl.to({}, { duration: 0.4 });
      });
      ScrollTrigger.refresh();
    });

    // Visionneuse
    const V = $('.lr-viewer'), vimg = V.querySelector('.lr-vfig img');
    let opener = null;
    function show(i) {
      cur = (i + all.length) % all.length; const im = all[cur];
      vimg.src = im.file; vimg.alt = im.caption || '';
      V.querySelector('.lr-vcap').textContent = im.caption || '';
      V.querySelector('.lr-vproj').textContent = im.project;
      V.querySelector('.lr-vlink').href = '#/' + im.slug;
      V.querySelector('.lr-vcount').textContent = `ESSAI ${pad(cur + 1)}/${total()}`;
      setCount(cur);
      if (!reduced) gsap.fromTo(vimg, { opacity: 0, scale: 0.985 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'power3.out' });
    }
    function openViewer(i, from) {
      opener = from; V.hidden = false; scroller.style.overflow = 'hidden';
      show(i);
      if (!reduced) gsap.fromTo(V, { clipPath: 'inset(50% 50% 50% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'power3.inOut', clearProps: 'clipPath' });
      V.querySelector('.lr-vclose').focus({ preventScroll: true });
    }
    function closeViewer() {
      if (V.hidden) return;
      const done = () => { V.hidden = true; scroller.style.overflow = ''; if (opener) opener.focus({ preventScroll: true }); };
      if (reduced) done(); else gsap.to(V, { clipPath: 'inset(50% 50% 50% 50%)', duration: 0.35, ease: 'power3.in', onComplete: () => { gsap.set(V, { clearProps: 'clipPath' }); done(); } });
    }
    V.querySelector('.lr-vclose').addEventListener('click', closeViewer, { signal });
    V.querySelector('.lr-vprev').addEventListener('click', () => show(cur - 1), { signal });
    V.querySelector('.lr-vnext').addEventListener('click', () => show(cur + 1), { signal });
    V.querySelector('.lr-vlink').addEventListener('click', () => { V.hidden = true; scroller.style.overflow = ''; }, { signal });
    V.addEventListener('click', e => { if (e.target === V) closeViewer(); }, { signal });
    window.addEventListener('keydown', e => {
      if (V.hidden) return;
      if (e.key === 'Escape') { e.stopImmediatePropagation(); e.preventDefault(); closeViewer(); }
      else if (e.key === 'ArrowRight') show(cur + 1);
      else if (e.key === 'ArrowLeft') show(cur - 1);
    }, { signal, capture: true });
    let sx = null;
    V.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { signal, passive: true });
    V.addEventListener('touchend', e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1)); }, { signal });
    signal.addEventListener('abort', () => { scroller.style.overflow = ''; });
  },
};
