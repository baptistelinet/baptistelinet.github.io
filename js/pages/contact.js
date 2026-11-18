import { split } from './_kit.js';

const MAIL = 'baptiste.linet@gmail.com';
const SEGS = [
  [7, 7, 7, 113], [7, 113, 73, 113], [144, 7, 144, 113],
  [215, 113, 215, 7], [215, 7, 281, 113], [281, 113, 281, 7],
  [319, 7, 319, 113], [319, 7, 385, 7], [319, 60, 372, 60], [319, 113, 385, 113],
  [423, 7, 489, 7], [456, 7, 456, 113],
];

export default {
  mount(ctx) {
    const { root, gsap, reduced } = ctx;
    const signal = ctx.signal;
    try { const v = JSON.parse(localStorage.getItem('linet-visited') || '[]'); if (!v.includes('contact')) { v.push('contact'); localStorage.setItem('linet-visited', JSON.stringify(v)); } } catch (e) {}
    const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

    const lines = SEGS.map(s => `<line class="${s[0] === 215 && s[2] === 281 ? 'dg' : ''}" pathLength="1" x1="${s[0]}" y1="${s[1]}" x2="${s[2]}" y2="${s[3]}"/>`).join('');
    root.innerHTML = `
      <div class="ct-stage">
        <p class="ct-label">Contact · Lyon</p>
        <div class="ct-center">
          <svg class="ct-plan" viewBox="-4 -6 504 142" aria-hidden="true">
            <g class="ct-out">${lines}</g>
            <g class="ct-in">${SEGS.map(s => `<line class="${s[0] === 215 && s[2] === 281 ? 'dg' : ''}" x1="${s[0]}" y1="${s[1]}" x2="${s[2]}" y2="${s[3]}"/>`).join('')}</g>
            <path class="ct-arc" d="M476 124A40 40 0 0 0 436 84"/>
            <g class="ct-door"><line x1="436" y1="124" x2="476" y2="124"/></g>
          </svg>
          <button class="ct-mail" type="button" aria-label="Copier l’adresse e-mail ${MAIL}"><span class="ct-a">baptiste.linet</span><span class="ct-b">@gmail.com</span></button>
          <p class="ct-status" role="status" aria-live="polite"><span></span></p>
        </div>
        <ul class="ct-links">
          <li><a class="ct-mag" href="mailto:${MAIL}"><span>Écrire un e-mail</span></a></li>
          <li><a class="ct-mag" href="https://www.instagram.com/baptiste.linet/" target="_blank" rel="noopener"><span>Instagram · baptiste.linet</span></a></li>
          <li class="ct-city">Lyon</li>
          <li class="ct-back"><a class="ct-mag" href="#/"><span>Retour à la maquette</span></a></li>
        </ul>
      </div>`;
    const $ = s => root.querySelector(s);
    const mail = $('.ct-mail'), status = $('.ct-status span'), door = $('.ct-door');
    const chars = split($('.ct-a')).concat(split($('.ct-b')));
    const out = [...root.querySelectorAll('.ct-out line')];
    mail.removeAttribute('aria-hidden');

    // Ouverture
    if (reduced) { gsap.set(out, { strokeDashoffset: 0 }); }
    else {
      gsap.set(chars, { yPercent: 100, opacity: 0 });
      gsap.set(out, { strokeDashoffset: 1, opacity: 0 });
      gsap.set('.ct-links li, .ct-label, .ct-arc, .ct-door', { opacity: 0 });
      gsap.timeline({ delay: 0.35 })
        .to(chars, { yPercent: 0, opacity: 1, duration: 0.5, ease: 'expo.out', stagger: 0.013 }, 0)
        .to(out, { strokeDashoffset: 0, opacity: 1, duration: 0.9, ease: 'power2.inOut', stagger: 0.025 }, 0)
        .to('.ct-label, .ct-arc, .ct-door', { opacity: 1, duration: 0.5 }, 0.8)
        .to('.ct-links li', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.06 }, 0.8);
    }

    // Copie
    let timer = 0;
    const flash = () => {
      if (reduced) { door.style.transform = 'rotate(-78deg)'; door.style.transformOrigin = '436px 124px'; }
      else gsap.to(door, { rotation: -78, svgOrigin: '436 124', duration: 0.7, ease: 'power3.out' });
      status.textContent = 'Copié';
      if (!reduced) gsap.fromTo(status, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 }); else status.style.opacity = 1;
      if (!reduced) gsap.fromTo(chars, { color: '#C0603A' }, { color: '#2B2622', duration: 0.9, stagger: 0.01, ease: 'power2.out' });
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (signal.aborted) return;
        if (reduced) { door.style.transform = ''; status.style.opacity = 0; }
        else { gsap.to(door, { rotation: 0, svgOrigin: '436 124', duration: 0.7, ease: 'power2.inOut' }); gsap.to(status, { opacity: 0, duration: 0.4 }); }
      }, 2800);
    };
    const select = () => {
      try { const r = document.createRange(); r.selectNodeContents(mail); const s = getSelection(); s.removeAllRanges(); s.addRange(r); document.execCommand('copy'); } catch (e) {}
    };
    mail.addEventListener('click', async () => {
      let ok = false;
      try { await navigator.clipboard.writeText(MAIL); ok = true; } catch (e) { select(); }
      void ok; flash();
    }, { signal });
    signal.addEventListener('abort', () => clearTimeout(timer));

    // Liens magnétiques
    if (fine && !reduced) {
      root.querySelectorAll('.ct-mag').forEach(a => {
        const x = gsap.quickTo(a, 'x', { duration: 0.4, ease: 'power3.out' }), y = gsap.quickTo(a, 'y', { duration: 0.4, ease: 'power3.out' });
        a.addEventListener('pointermove', e => {
          const r = a.getBoundingClientRect();
          x(Math.max(-8, Math.min(8, (e.clientX - r.left - r.width / 2) / r.width * 16)));
          y(Math.max(-8, Math.min(8, (e.clientY - r.top - r.height / 2) / r.height * 16)));
        }, { signal });
        a.addEventListener('pointerleave', () => { x(0); y(0); }, { signal });
      });
    }
  },
};
