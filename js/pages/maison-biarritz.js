import { esc, split } from './_kit.js';
// Maison Biarritz : « l'océan entre dans la maison »
// vague d'ouverture, repères sur la façade, rangée qui ondule, masque en vague, planche de surf comparatrice.

const TAU = Math.PI * 2;
// Bande d'eau (bords haut et bas sinusoïdaux) dans un viewBox 2400 x 2400, 4 périodes (boucle sans couture)
function bandPath(top, bottom, per = 4, amp = 46) {
  const W = 2400, st = per * 18; let d = '';
  for (let i = 0; i <= st; i++) d += `${i ? 'L' : 'M'}${(W * i / st).toFixed(1)} ${(top + Math.sin(i / 18 * TAU) * amp).toFixed(1)} `;
  for (let i = st; i >= 0; i--) d += `L${(W * i / st).toFixed(1)} ${(bottom + Math.sin(i / 18 * TAU + 1.3) * amp).toFixed(1)} `;
  return d + 'Z';
}
const waveSvg = (top, bottom, cls) => `<svg class="bz-band ${cls}" viewBox="0 0 2400 2400" preserveAspectRatio="none" aria-hidden="true"><path d="${bandPath(top, bottom)}"/></svg>`;

export default {
  mount(ctx) {
    const { root, scroller, gsap, ScrollTrigger, project: p, images: im, reduced, signal } = ctx;
    const st = (o) => ({ scroller, ...o });
    const sentences = (p.text.match(/[^.]+\./g) || [p.text]).map(s => s.trim());
    const brief = sentences.slice(0, 2).join(' ');
    const interior = sentences.slice(2).join(' ');
    const [fac, salon, suite, dress, alcove] = im;

    root.innerHTML = `
    <section class="bz-hero">
      <div class="bz-hero-img"><img src="${fac.file}" alt="${esc(fac.caption)}" width="${fac.w}" height="${fac.h}" loading="eager" decoding="async"></div>
      ${waveSvg(500, 1900, 'bz-band-a')}${waveSvg(500, 1900, 'bz-band-b')}
      <header class="bz-title">
        <p class="bz-num">Projet ${esc(p.num)}</p>
        <h1 class="bz-h1">${esc(p.title)}</h1>
        <p class="bz-kind">${esc(p.kind)}</p>
      </header>
    </section>

    <section class="bz-brief">
      <div class="bz-brief-txt">
        <p class="k-label bz-reveal">Le brief</p>
        <p class="bz-lead bz-reveal">${esc(brief)}</p>
        <ul class="bz-meta bz-reveal">${p.meta.map(m => `<li>${esc(m)}</li>`).join('')}</ul>
      </div>
      <figure class="bz-facade">
        <div class="bz-facade-box">
          <img src="${fac.file}" alt="${esc(fac.caption)}" width="${fac.w}" height="${fac.h}" loading="lazy" decoding="async">
          <svg class="bz-marks" viewBox="0 0 1800 1013" aria-hidden="true">
            <path class="bz-m1" pathLength="1" d="M572 392 L965 296 L1420 438"/>
            <path class="bz-m2" pathLength="1" d="M720 412 L965 318 L1215 412 Z"/>
            <circle class="bz-m3" pathLength="1" cx="1405" cy="438" r="46"/>
          </svg>
          <span class="bz-pin" style="left:63.9%;top:30.6%" data-i="0">1</span>
          <span class="bz-pin" style="left:53.6%;top:37.8%" data-i="1">2</span>
          <span class="bz-pin" style="left:78.1%;top:35.4%" data-i="2">3</span>
        </div>
        <figcaption>${esc(fac.caption)} · repères indicatifs</figcaption>
      </figure>
      <ol class="bz-legend">
        <li><b>1</b><span>Toiture simplifiée à deux pans</span></li>
        <li><b>2</b><span>Colombages repris de Biarritz</span></li>
        <li><b>3</b><span>Charpente débordante</span></li>
      </ol>
    </section>

    <section class="bz-ocean">
      <div class="bz-ocean-head">
        <p class="k-label bz-reveal">Intérieur</p>
        <h2 class="bz-h2 bz-reveal">L'océan entre dans la maison</h2>
        <p class="bz-lead bz-reveal">${esc(interior)}</p>
      </div>
      <div class="bz-row">
        ${[salon, suite, alcove].map(x => `<figure class="bz-wv"><div class="bz-img"><img src="${x.file}" alt="${esc(x.caption)}" width="${x.w}" height="${x.h}" loading="lazy" decoding="async"></div><span class="bz-led"></span><figcaption>${esc(x.caption)}</figcaption></figure>`).join('')}
      </div>
    </section>

    <section class="bz-dress">
      <p class="k-label bz-reveal">Le dressing parental</p>
      <figure class="bz-dress-fig">
        <div class="bz-dress-img"><img src="${dress.file}" alt="${esc(dress.caption)}" width="${dress.w}" height="${dress.h}" loading="lazy" decoding="async"></div>
        <figcaption>${esc(dress.caption)}</figcaption>
      </figure>
    </section>

    <section class="bz-cmp">
      <div class="bz-cmp-head">
        <p class="k-label bz-reveal">À comparer</p>
        <h2 class="bz-h2 bz-reveal">Faites glisser la planche</h2>
      </div>
      <div class="bz-cmp-box" id="bzCmp">
        <div class="bz-cmp-a"><img src="${salon.file}" alt="${esc(salon.caption)}" width="${salon.w}" height="${salon.h}" loading="lazy" decoding="async"></div>
        <div class="bz-cmp-b"><img src="${suite.file}" alt="${esc(suite.caption)}" width="${suite.w}" height="${suite.h}" loading="lazy" decoding="async"></div>
        <span class="bz-tag bz-tag-a">${esc(salon.caption)}</span>
        <span class="bz-tag bz-tag-b">${esc(suite.caption)}</span>
        <div class="bz-board" role="slider" tabindex="0" aria-label="Comparer le salon et la suite parentale" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">
          <svg viewBox="0 0 44 320" preserveAspectRatio="none" aria-hidden="true">
            <path class="bz-board-body" d="M22 2 C38 50 41 130 41 170 C41 240 32 298 22 318 C12 298 3 240 3 170 C3 130 6 50 22 2Z"/>
            <line x1="22" y1="22" x2="22" y2="296" class="bz-board-str"/>
            <path class="bz-board-fin" d="M22 262 l-6 22 h12z"/>
          </svg>
        </div>
      </div>
    </section>`;

    const $ = (s, r = root) => r.querySelector(s);
    const $$ = (s, r = root) => [...r.querySelectorAll(s)];

    // ----- fond : sauge océan -> pêche -----
    scroller.style.setProperty('--room', '#DADDD0');
    root.style.background = 'transparent';
    scroller.style.backgroundColor = '#DADDD0';
    if (!reduced) {
      gsap.to(scroller, { backgroundColor: '#EFD9C9', ease: 'none',
        scrollTrigger: st({ trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.6 }),
        onUpdate() { scroller.style.setProperty('--room', scroller.style.backgroundColor); } });
    }

    // ----- ouverture : la vague balaie l'écran -----
    const letters = split($('.bz-h1'), 'chars');
    const hero = $('.bz-hero');
    if (reduced) {
      $$('.bz-band').forEach(b => b.remove());
    } else {
      const bands = $$('.bz-band');
      gsap.set(bands, { yPercent: 12.5, transformOrigin: '0 0' });
      gsap.set(letters, { yPercent: 115, opacity: 0 });
      gsap.set('.bz-num,.bz-kind', { opacity: 0, y: 14 });
      gsap.set('.bz-hero-img img', { scale: 1.14 });
      const tl = gsap.timeline({ delay: 0.35 });
      tl.to('.bz-band-a', { yPercent: -79.2, duration: 0.9, ease: 'power3.inOut' }, 0)
        .to('.bz-band-b', { yPercent: -79.2, duration: 0.9, ease: 'power3.inOut' }, 0.13)
        .to(bands, { xPercent: -25, duration: 0.9, ease: 'none', stagger: 0.13 }, 0)
        .to('.bz-hero-img img', { scale: 1, duration: 1.6, ease: 'expo.out' }, 0.2)
        .to(letters, { yPercent: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.035 }, 0.7)
        .to('.bz-num,.bz-kind', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.12 }, 0.95)
        .set(bands, { display: 'none' });
      // le titre glisse doucement au défilement
      gsap.to('.bz-title', { yPercent: -30, opacity: 0, ease: 'none', scrollTrigger: st({ trigger: hero, start: 'top top', end: 'bottom 30%', scrub: 0.6 }) });
    }

    // ----- révélations -----
    if (!reduced) {
      $$('.bz-reveal').forEach(el => gsap.from(el, { y: 28, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: st({ trigger: el, start: 'top 90%' }) }));
    }

    // ----- repères sur la façade -----
    const marks = ['.bz-m1', '.bz-m2', '.bz-m3'].map(s => $(s));
    const pins = $$('.bz-pin'), legend = $$('.bz-legend li');
    if (!reduced) {
      gsap.set(marks, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(pins, { scale: 0, opacity: 0 });
      gsap.set(legend, { opacity: 0.25, x: -10 });
      const tl = gsap.timeline({ scrollTrigger: st({ trigger: '.bz-facade', start: 'top 65%', end: 'bottom 55%', scrub: 0.6 }) });
      marks.forEach((m, i) => {
        tl.to(m, { strokeDashoffset: 0, duration: 1, ease: 'none' }, i * 1.1)
          .to(pins[i], { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)' }, i * 1.1 + 0.8)
          .to(legend[i], { opacity: 1, x: 0, duration: 0.4, ease: 'none' }, i * 1.1 + 0.8);
      });
      tl.to({}, { duration: 0.3 });
    }

    // ----- rangée qui ondule + LED -----
    const figs = $$('.bz-wv');
    const leds = $$('.bz-led');
    if (!reduced) {
      gsap.set(leds, { scaleX: 0, transformOrigin: '0 50%' });
      leds.forEach(l => gsap.to(l, { scaleX: 1, duration: 1.3, ease: 'power3.inOut', scrollTrigger: st({ trigger: l, start: 'top 88%', toggleActions: 'play none none reverse' }) }));
      const amp = () => (window.innerWidth <= 700 ? 14 : 40);
      const o = { p: 0 };
      const setters = figs.map(f => gsap.quickSetter(f, 'y', 'px'));
      const apply = () => { const a = amp(); figs.forEach((_, i) => setters[i](Math.sin(i * 1.15 + o.p * Math.PI * 2) * a)); };
      apply();
      gsap.to(o, { p: 1, ease: 'none', onUpdate: apply,
        scrollTrigger: st({ trigger: '.bz-row', start: 'top bottom', end: 'bottom top', scrub: 0.6 }) });
    }

    // ----- dressing : masque en vague qui se déroule -----
    const dimg = $('.bz-dress-img');
    if (!reduced) {
      const poly = (e, ph) => {
        const pts = [];
        const edge = -14 + e * 128;           // -14 % -> 114 %
        for (let x = 0; x <= 100; x += 4) pts.push(`${x}% ${(edge + Math.sin(x / 100 * TAU * 2 + ph) * 7).toFixed(2)}%`);
        return `polygon(0% -20%, 100% -20%, ${pts.reverse().join(',')})`;
      };
      const w = { e: 0 };
      const draw = () => { const c = poly(w.e, w.e * 9); dimg.style.clipPath = c; dimg.style.webkitClipPath = c; };
      draw();
      gsap.to(w, { e: 1, ease: 'none', onUpdate: draw, onComplete: () => { dimg.style.clipPath = 'none'; dimg.style.webkitClipPath = 'none'; },
        scrollTrigger: st({ trigger: dimg, start: 'top 88%', end: 'top 15%', scrub: 0.6 }) });
      gsap.fromTo('.bz-dress-img img', { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: st({ trigger: dimg, start: 'top 90%', end: 'bottom 30%', scrub: 0.6 }) });
    }

    // ----- signature : planche de surf comparatrice -----
    const box = $('#bzCmp'), board = $('.bz-board'), top = $('.bz-cmp-b');
    let pos = 50, vel = 0, last = 50;
    const set = (v, quiet) => {
      pos = Math.max(3, Math.min(97, v));
      box.style.setProperty('--x', pos + '%');
      top.style.clipPath = `inset(0 0 0 ${pos}%)`;
      board.setAttribute('aria-valuenow', Math.round(pos));
      if (!quiet) vel = pos - last; last = pos;
    };
    set(50, true);
    let dragging = false;
    const fromEvent = (e) => { const r = box.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 100); };
    box.addEventListener('pointerdown', (e) => { dragging = true; box.setPointerCapture(e.pointerId); box.classList.add('is-drag'); fromEvent(e); }, { signal });
    box.addEventListener('pointermove', (e) => { if (dragging) fromEvent(e); }, { signal });
    const end = () => { dragging = false; box.classList.remove('is-drag'); };
    box.addEventListener('pointerup', end, { signal });
    box.addEventListener('pointercancel', end, { signal });
    board.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { set(pos - 4); e.preventDefault(); }
      if (e.key === 'ArrowRight') { set(pos + 4); e.preventDefault(); }
    }, { signal });
    // inclinaison de la planche selon la vitesse
    const tilt = gsap.quickTo(board, 'rotation', { duration: 0.4, ease: 'power3.out' });
    const tick = () => { if (signal.aborted) return; tilt(Math.max(-14, Math.min(14, vel * 2.2))); vel *= 0.8; requestAnimationFrame(tick); };
    if (!reduced) requestAnimationFrame(tick);
    // invitation : la planche surfe de gauche à droite à l'arrivée
    if (!reduced) {
      const o = { v: 50 };
      gsap.timeline({ scrollTrigger: st({ trigger: box, start: 'top 70%', once: true }) })
        .to(o, { v: 28, duration: 0.7, ease: 'power2.inOut', onUpdate: () => set(o.v) })
        .to(o, { v: 72, duration: 1.1, ease: 'power2.inOut', onUpdate: () => set(o.v) })
        .to(o, { v: 50, duration: 0.7, ease: 'power3.out', onUpdate: () => set(o.v) });
    }
  },
};
