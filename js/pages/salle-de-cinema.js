import { $$, esc, fig, split } from './_kit.js';
// Salle de cinéma privée : « la séance ». Format 2.39:1, lumière, acoustique, plan Dolby Atmos.
export default {
  mount(ctx) {
    const { root, scroller, gsap, ScrollTrigger, project: p, images: im, reduced, signal } = ctx;
    ctx.page.style.setProperty('--room', '#2B2622');
    const st = (o) => Object.assign({ scroller }, o);
    const fine = matchMedia('(pointer:fine)').matches && innerWidth > 700;
    const NS = 'http://www.w3.org/2000/svg';
    const textMain = (p.text || '').split(/(?<=\.)\s+/);

    // Plan de la salle (vue de dessus) dessiné ici
    const spk = [[100, 58], [200, 58], [300, 58], [52, 130], [348, 130], [52, 250], [348, 250], [120, 396], [280, 396]];
    const ceil = [[130, 120], [270, 120], [130, 235], [270, 235], [130, 335], [270, 335]];
    const plan = `<svg class="sc-plan" viewBox="0 0 400 440" role="img" aria-label="Plan de la salle : 9 enceintes horizontales, 6 au plafond, un caisson">
      <rect class="pl-room" x="36" y="24" width="328" height="388"/>
      <line class="pl-screen" x1="110" y1="36" x2="290" y2="36"/>
      <g class="pl-seats"><rect x="110" y="288" width="180" height="30" rx="8"/><rect x="100" y="334" width="200" height="30" rx="8"/></g>
      <g class="pl-waves"></g>
      <g class="pl-spk">${spk.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7"/>`).join('')}</g>
      <g class="pl-ceil">${ceil.map(([x, y]) => `<path data-x="${x}" data-y="${y}" d="M${x} ${y - 10}L${x + 10} ${y}L${x} ${y + 10}L${x - 10} ${y}Z"/>`).join('')}</g>
      <g class="pl-sub"><rect x="52" y="64" width="22" height="22" rx="3"/></g>
    </svg>`;

    root.innerHTML = `
    <section class="sc-hero">
      <div class="sc-win">
        <img src="${im[0].file}" alt="${esc(im[0].caption)}" width="${im[0].w}" height="${im[0].h}" loading="eager" decoding="async">
        <div class="sc-dim"></div><div class="sc-cone"></div>
        <h1 class="sc-title">${esc(p.title)}</h1>
      </div>
      <div class="sc-bar sc-top"><span class="sc-info">Projet ${esc(p.num)}</span><span class="sc-info">${esc(p.kind)}</span></div>
      <div class="sc-bar sc-bot"><span class="sc-info">${esc(im[0].caption)}</span><span class="sc-info sc-go">Séance ↓</span></div>
    </section>
    <section class="sc-sec sc-intro">
      <p class="sc-label">La séance</p>
      <p class="sc-lead">${esc(textMain[0] || '')}</p>
      <ul class="sc-specs">${p.meta.map((m, i) => `<li><small>0${i + 1}</small>${esc(m)}</li>`).join('')}</ul>
      <p class="sc-body">${esc(textMain.slice(1).join(' '))}</p>
    </section>
    <section class="sc-light">
      <div class="sc-stage">
        <p class="sc-label sc-lt-label">Lumière · <span class="sc-lt-state">salle éclairée</span></p>
        <figure class="sc-shot"><img src="${im[1].file}" alt="${esc(im[1].caption)}" width="${im[1].w}" height="${im[1].h}" loading="eager" decoding="async"><div class="sc-night"></div></figure>
        <div class="sc-floor" aria-hidden="true">${[0, 1, 2, 3, 4].map(() => '<i></i>').join('')}</div>
        <p class="sc-lt-cap"><span>${esc(im[1].caption)}</span><span>Bandes lumineuses au sol <b class="sc-lt-n">0</b> / 5</span></p>
      </div>
    </section>
    <section class="sc-sec sc-acou">
      <p class="sc-label">Acoustique Texaa</p>
      <p class="sc-lead sc-acou-lead">${esc(textMain.find((s) => /Texaa/.test(s)) || '')}</p>
      <div class="sc-acou-grid">
        ${fig(im[2], { cls: 'sc-f3' })}
        ${fig(im[3], { cls: 'sc-f4' })}
      </div>
    </section>
    <section class="sc-sec sc-son">
      <div class="sc-son-plan">${plan}</div>
      <div class="sc-son-side">
        <p class="sc-label">Dolby Atmos</p>
        <p class="sc-count" aria-label="9.1.6"><span class="c-a">0</span>.<span class="c-b">0</span>.<span class="c-c">0</span></p>
        <p class="sc-legend"><span>9 enceintes horizontales</span><span>1 caisson</span><span>6 au plafond</span></p>
        ${fig(im[4], { cls: 'sc-f5' })}
      </div>
    </section>`;

    const $ = (s) => root.querySelector(s);

    // ---------- Ouverture : bandes noires
    const bars = $$(root, '.sc-bar'), title = $('.sc-title'), infos = $$(root, '.sc-info');
    if (reduced) {
      gsap.from(title, { opacity: 0, duration: 0.6, delay: 0.35 });
    } else {
      gsap.set([title, infos], { opacity: 0 });
      const tl = gsap.timeline({ delay: 0.35 });
      tl.from(bars, { height: '50svh', duration: 1, ease: 'power3.inOut' })
        .to(infos, { opacity: 1, duration: 0.4, stagger: 0.08 }, 0.7)
        .to(title, { keyframes: [{ opacity: 0.9, duration: 0.05 }, { opacity: 0.1, duration: 0.07 }, { opacity: 0.6, duration: 0.07 }, { opacity: 0.25, duration: 0.07 }, { opacity: 1, duration: 0.12 }], ease: 'steps(1)' }, 0.75);
    }

    // ---------- Faisceau de projecteur (ordinateur, section d'accroche)
    if (fine && !reduced) {
      const win = $('.sc-win'), cone = $('.sc-cone'), dim = $('.sc-dim');
      let tx = 0, ty = 0, cx = 0, cy = 0, inside = false, vis = true;
      const setIn = (v) => { inside = v; gsap.to([cone, dim], { opacity: v ? 1 : 0, duration: 0.5, overwrite: 'auto' }); };
      gsap.set([cone, dim], { opacity: 0 });
      ScrollTrigger.create(st({ trigger: '.sc-hero', start: 'top bottom', end: 'bottom top', onToggle: (s) => { vis = s.isActive; } }));
      win.addEventListener('pointermove', (e) => { const r = win.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; if (!inside) { cx = tx; cy = ty; setIn(true); } }, { signal });
      win.addEventListener('pointerleave', () => setIn(false), { signal });
      const loop = () => {
        if (signal.aborted) return;
        if (vis && inside) {
          cx += (tx - cx) * 0.14; cy += (ty - cy) * 0.14;
          const r = win.getBoundingClientRect(), ox = r.width / 2, oy = r.height;
          const dx = cx - ox, dy = oy - cy, d = Math.max(60, Math.hypot(dx, dy));
          cone.style.height = d + 'px'; cone.style.width = d * 0.55 + 'px';
          cone.style.transform = `translateX(-50%) rotate(${Math.atan2(dx, dy)}rad)`;
          dim.style.setProperty('--mx', cx + 'px'); dim.style.setProperty('--my', cy + 'px');
        }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }

    // ---------- Texte
    if (!reduced) {
      gsap.from('.sc-intro > *', { y: 30, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12, scrollTrigger: st({ trigger: '.sc-intro', start: 'top 78%' }) });
      gsap.from('.sc-specs li', { x: -30, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12, scrollTrigger: st({ trigger: '.sc-specs', start: 'top 85%' }) });
    }

    // ---------- Lumière : la salle s'assombrit, les bandes s'allument
    const night = $('.sc-night'), floor = $$(root, '.sc-floor i'), nEl = $('.sc-lt-n'), state = $('.sc-lt-state');
    if (reduced) {
      night.style.opacity = '.55'; floor.forEach((f) => f.classList.add('on')); nEl.textContent = '5'; state.textContent = 'bandes allumées';
      $('.sc-light').classList.add('is-flat');
    } else {
      const tl = gsap.timeline({ scrollTrigger: st({ trigger: '.sc-light', start: 'top top', end: '+=140%', pin: true, scrub: 0.6, anticipatePin: 1 }) });
      tl.to('.sc-light', { backgroundColor: '#0c0a09', duration: 1.2, ease: 'none' }, 0)
        .to(night, { opacity: 0.78, duration: 1.2, ease: 'none' }, 0)
        .add(() => { state.textContent = 'salle éclairée'; }, 0)
        .add(() => { state.textContent = 'extinction'; }, 0.6);
      floor.forEach((f, i) => {
        tl.fromTo(f, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.32, ease: 'power2.out' }, 1.25 + i * 0.4)
          .add(() => { nEl.textContent = String(i + 1); if (i === 4) state.textContent = 'séance'; }, 1.25 + i * 0.4);
      });
      tl.to({}, { duration: 0.4 });
    }

    // ---------- Acoustique
    if (!reduced) {
      $$(root, '.sc-acou .k-img').forEach((el) => {
        gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power3.inOut', scrollTrigger: st({ trigger: el, start: 'top 85%' }) });
        gsap.fromTo(el.querySelector('img'), { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: st({ trigger: el, start: 'top bottom', end: 'bottom 40%', scrub: 0.6 }) });
      });
      gsap.from('.sc-acou-lead,.sc-acou > .sc-label', { y: 24, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: st({ trigger: '.sc-acou', start: 'top 80%' }) });
    }

    // ---------- Son : plan de la salle
    const svg = $('.sc-plan'), waves = svg.querySelector('.pl-waves');
    const spks = $$(svg, '.pl-spk circle'), ceils = $$(svg, '.pl-ceil path'), sub = svg.querySelector('.pl-sub rect');
    const A = $('.c-a'), B = $('.c-b'), C = $('.c-c'), cnt = { a: 0, b: 0, c: 0 };
    const wave = (x, y, rMax, col, dur = 1.6) => {
      const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 6); c.setAttribute('class', 'pl-w ' + col); waves.appendChild(c);
      gsap.fromTo(c, { attr: { r: 6 }, opacity: 0.8 }, { attr: { r: rMax }, opacity: 0, duration: dur, ease: 'power2.out', onComplete: () => c.remove() });
    };
    const show = () => { A.textContent = 9; B.textContent = 1; C.textContent = 6; };
    if (reduced) { show(); } else {
      gsap.set([...spks, ...ceils, sub], { scale: 0, transformOrigin: '50% 50%', transformBox: 'fill-box' });
      const bump = (k, el, v) => { cnt[k] = v; el.textContent = v; };
      const tl = gsap.timeline({ scrollTrigger: st({ trigger: '.sc-son', start: 'top 62%', once: true }) });
      spks.forEach((c, i) => tl.to(c, { scale: 1, duration: 0.45, ease: 'back.out(2.4)' }, i * 0.2)
        .add(() => { bump('a', A, i + 1); wave(c.getAttribute('cx'), c.getAttribute('cy'), 46, 'h'); }, i * 0.2));
      const t2 = 9 * 0.2 + 0.5;
      ceils.forEach((c, i) => tl.to(c, { scale: 1, duration: 0.45, ease: 'back.out(2.4)' }, t2 + i * 0.22)
        .add(() => { bump('c', C, i + 1); wave(c.dataset.x, c.dataset.y, 60, 'v', 1.9); }, t2 + i * 0.22));
      const t3 = t2 + 6 * 0.22 + 0.5;
      tl.to(sub, { scale: 1, duration: 0.6, ease: 'back.out(2)' }, t3)
        .add(() => { bump('b', B, 1); [0, 0.5, 1].forEach((d) => gsap.delayedCall(d, () => wave(63, 75, 130, 's', 2.4))); }, t3)
        .fromTo('.sc-legend span', { opacity: 0.3 }, { opacity: 1, stagger: 0.25, duration: 0.5 }, t3 - 1.5);
      gsap.fromTo('.sc-f5', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: st({ trigger: '.sc-f5', start: 'top 90%' }) });
    }
  },
};
