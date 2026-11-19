import { esc } from './_kit.js';
// Maison dans le désert : « le minéral et la lenteur ». Sable, dune, mirage, ombre de cactus.
export default {
  mount(ctx) {
    const { root, scroller, gsap, ScrollTrigger, project: p, images: im, reduced, signal } = ctx;
    (ctx.page || ctx.scroller).style.setProperty('--room', '#E5CBB6');
    const st = (o) => Object.assign({ scroller }, o);
    const fine = matchMedia('(pointer:fine)').matches && innerWidth > 700;

    root.innerHTML = `
    <svg class="md-defs" width="0" height="0" aria-hidden="true" focusable="false"><filter id="md-mirage" x="-5%" y="-25%" width="110%" height="150%"><feTurbulence type="fractalNoise" baseFrequency="0.004 0.05" numOctaves="1" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter></svg>
    <section class="md-hero">
      <header class="md-head"><p class="md-tag">Projet ${esc(p.num)} · ${esc(p.kind)}</p><h1 class="md-title">${esc(p.title)}</h1></header>
      <figure class="md-fig md-fig1"><div class="md-dback md-b1"></div><div class="md-img md-img1"><img src="${im[0].file}" alt="${esc(im[0].caption)}" width="${im[0].w}" height="${im[0].h}" loading="eager" decoding="async"></div><figcaption>${esc(im[0].caption)}</figcaption></figure>
      <div class="md-sand"></div>
      <canvas class="md-cv" aria-hidden="true"></canvas>
    </section>
    <section class="md-void"><p class="md-note">${esc(im[0].note)}</p></section>
    <section class="md-dune">
      <figure class="md-fig md-fig2"><div class="md-dback md-b2"></div><div class="md-img md-img2"><img src="${im[1].file}" alt="${esc(im[1].caption)}" width="${im[1].w}" height="${im[1].h}" loading="eager" decoding="async"></div><figcaption>${esc(im[1].caption)}</figcaption></figure>
    </section>
    <section class="md-void md-end"><p class="md-note">${esc(im[1].note)}</p><p class="md-fin">${esc(p.title)} · ${esc(p.kind)}</p></section>
    <svg class="md-cactus" viewBox="0 0 100 200" aria-hidden="true"><g fill="none" stroke="#2B2622" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"><path d="M50 192V28"/><path d="M50 128H24V84"/><path d="M50 100H76V58"/></g></svg>`;

    const $ = (s) => root.querySelector(s);
    const dune = (el, base, amp, ph = 0) => {
      const pts = [];
      for (let i = 0; i <= 16; i++) { const x = i / 16 * 100; pts.push(`${x}% ${(base + amp * Math.sin(x / 100 * Math.PI * 2.2 + ph) + amp * .4 * Math.sin(x / 100 * Math.PI * 5 + ph * 2)).toFixed(1)}%`); }
      el.style.clipPath = `polygon(${pts.join(',')},100% 120%,0 120%)`;
    };

    // ---------- Ouverture
    const title = $('.md-title'), i1 = $('.md-img1'), b1 = $('.md-b1');
    if (reduced) {
      $('.md-sand').style.display = 'none'; $('.md-cv').style.display = 'none';
      gsap.from('.md-head, .md-fig1', { opacity: 0, duration: 0.7, delay: 0.35 });
    } else {
      const o = { b: 118 };
      const draw = () => { dune(i1, o.b, 12, 0.6); dune(b1, o.b - 8, 12, 0.2); };
      draw();
      gsap.to(o, { b: -26, duration: 1.2, delay: 0.6, ease: 'power2.out', onUpdate: draw, onComplete: () => { i1.style.clipPath = 'none'; b1.style.display = 'none'; } });
      gsap.set('.md-tag, figcaption', { opacity: 0 });
      gsap.to('.md-tag', { opacity: 1, duration: 0.7, delay: 1, ease: 'power3.out' });
      gsap.to('.md-fig1 figcaption', { opacity: 0.75, duration: 0.7, delay: 1.5 });
    }

    // ---------- Sable (canvas) : retombe, découvre le titre, se laisse souffler
    const cv = $('.md-cv'), hero = $('.md-hero'), sand = $('.md-sand');
    if (!reduced) {
      const g = cv.getContext('2d'), N = Math.round(Math.max(110, Math.min(400, hero.clientWidth * 0.28))), dpr = Math.min(2, devicePixelRatio || 1);
      let W = 0, H = 0, vis = true, edge = 0, mx = -999, my = -999, pmx = -999, pmy = -999, msp = 0;
      const cols = ['#B7855C', '#C0603A', '#A8754E', '#D8A57C'];
      const P = [];
      const size = () => { W = hero.clientWidth; H = hero.clientHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
      size();
      for (let i = 0; i < N; i++) P.push({ x: Math.random(), y: Math.random(), vx: 0, vy: 0, r: (innerWidth > 700 ? 1 : 0.8) + Math.random() * (innerWidth > 700 ? 2.2 : 1.4), c: cols[i % 4], gy: 0.9 + Math.random() * 0.1, free: false });
      new ResizeObserver(size).observe(hero);
      const e = { p: 0 };
      const tw = gsap.to(e, { p: 1, duration: 1.2, delay: 0.35, ease: 'power1.in', onUpdate: () => { sand.style.clipPath = `inset(${(e.p * 100).toFixed(2)}% 0 0 0)`; edge = e.p; }, onComplete: () => { sand.style.display = 'none'; } });
      if (fine) scroller.addEventListener('pointermove', (ev) => { const r = hero.getBoundingClientRect(); mx = ev.clientX - r.left; my = ev.clientY - r.top; }, { signal });
      ScrollTrigger.create(st({ trigger: hero, start: 'top bottom', end: 'bottom top', onToggle: (s) => { vis = s.isActive; } }));
      const frame = () => {
        if (signal.aborted) return;
        requestAnimationFrame(frame);
        if (!vis) return;
        g.clearRect(0, 0, W, H);
        const dx = mx - pmx, dy = my - pmy; msp = Math.min(40, Math.hypot(dx, dy)); pmx = mx; pmy = my;
        for (const q of P) {
          if (!q.free && q.y <= edge) { q.free = true; q.x *= W; q.y *= H; q.vy = 0.5 + Math.random(); q.vx = (Math.random() - .5) * 1.2; }
          if (!q.free) { g.fillStyle = q.c; g.globalAlpha = 0.55; g.fillRect(q.x * W, q.y * H, q.r, q.r); continue; }
          const gy = q.gy * H;
          if (fine && msp > 1.2) {
            const ddx = q.x - mx, ddy = q.y - my, d = Math.hypot(ddx, ddy);
            if (d < 130 && d > 0.1) { const f = (1 - d / 130) * msp * 0.28; q.vx += ddx / d * f + dx * 0.05; q.vy += ddy / d * f - Math.random() * f * 0.6 + dy * 0.05; }
          }
          q.vy += 0.16; q.x += q.vx; q.y += q.vy; q.vx *= 0.985;
          if (q.y >= gy) { q.y = gy; q.vy *= -0.15; if (Math.abs(q.vy) < 0.3) q.vy = 0; q.vx *= 0.8; }
          if (q.x < 0 || q.x > W) { q.x = (q.x + W) % W; }
          g.fillStyle = q.c; g.globalAlpha = 0.8; g.beginPath(); g.arc(q.x, q.y, q.r, 0, 6.283); g.fill();
        }
        g.globalAlpha = 1;
      };
      requestAnimationFrame(frame);

      // Mirage : uniquement sur le titre, en pause hors écran
      title.style.filter = 'url(#md-mirage)';
      const turb = root.querySelector('feTurbulence'), disp = root.querySelector('feDisplacementMap');
      const m = { s: 0, f: 0.05 };
      const mir = gsap.timeline({ paused: true, repeat: -1, yoyo: true, onUpdate: () => { disp.setAttribute('scale', m.s.toFixed(2)); turb.setAttribute('baseFrequency', `0.004 ${m.f.toFixed(4)}`); } });
      mir.to(m, { s: 9, f: 0.075, duration: 3.2, ease: 'sine.inOut' });
      gsap.delayedCall(1.6, () => { if (vis) mir.play(); });
      ScrollTrigger.create(st({ trigger: hero, start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive ? mir.play() : mir.pause()) }));
    }

    // ---------- Vide + dune qui monte
    if (!reduced) {
      gsap.from('.md-note', { opacity: 0, y: 20, duration: 1.2, ease: 'power3.out', scrollTrigger: st({ trigger: '.md-void', start: 'top 70%' }) });
      const i2 = $('.md-img2'), b2 = $('.md-b2'), o2 = { b: 92 };
      const d2 = () => { dune(i2, o2.b, 12, 1.4); dune(b2, o2.b - 8, 12, 1.0); };
      d2();
      gsap.to(o2, { b: -26, ease: 'none', onUpdate: d2, scrollTrigger: st({ trigger: '.md-dune', start: 'top top', end: '+=110%', pin: true, scrub: 0.6, anticipatePin: 1 }) });
      gsap.from('.md-fin', { opacity: 0, duration: 1.2, scrollTrigger: st({ trigger: '.md-fin', start: 'top 95%' }) });

      // Ombre du cactus : pivote et s'allonge
      gsap.fromTo('.md-cactus', { rotation: -18, scaleY: 0.7, skewX: 0, opacity: 0.1 }, { rotation: 26, scaleY: 2.3, skewX: -24, opacity: 0.2, transformOrigin: '50% 100%', ease: 'none', scrollTrigger: st({ trigger: root, start: 'top top', end: 'bottom bottom', scrub: 1 }) });
    } else {
      $('.md-cactus').style.opacity = '.12';
    }
  },
};
