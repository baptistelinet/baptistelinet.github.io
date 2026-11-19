import { $$, esc, fig, split } from './_kit.js';
// Bulle musicale : « le son visuel ». Ouverture en iris, projecteur radial, anneau néon au tempo, égaliseur.
export default {
  mount(ctx) {
    const { root, scroller, gsap, ScrollTrigger, project: p, images: im, reduced, signal } = ctx;
    ctx.page.style.setProperty('--room', '#CBD3BE');
    const st = (o) => Object.assign({ scroller }, o);
    const fine = matchMedia('(pointer:fine)').matches && innerWidth > 700;
    const BEAT = 0.5; // 120 bpm

    const spot = (x, cls) => `<figure class="bm-spot ${cls}"><div class="bm-frame">
      <img class="bm-base" src="${x.file}" alt="" aria-hidden="true" width="${x.w}" height="${x.h}" loading="eager" decoding="async">
      <img class="bm-lit" src="${x.file}" alt="${esc(x.caption)}" width="${x.w}" height="${x.h}" loading="eager" decoding="async"></div>
      <figcaption>${esc(x.caption)}</figcaption></figure>`;
    const pub = (p.meta.find((m) => /Public/.test(m)) || '').match(/(\d+)\D+(\d+)/) || [0, 18, 28];

    root.innerHTML = `
    <section class="bm-hero">
      <div class="bm-heroimg"><img src="${im[0].file}" alt="${esc(im[0].caption)}" width="${im[0].w}" height="${im[0].h}" loading="eager" decoding="async"></div>
      <div class="bm-scrim"></div>
      <div class="bm-hbody">
        <p class="bm-tag">Projet ${esc(p.num)} · ${esc(p.kind)}</p>
        <h1 class="bm-title">${esc(p.title)}</h1>
        <p class="bm-phrase">Plongez dans votre bulle musicale</p>
      </div>
    </section>
    <section class="bm-sec bm-ctx">
      <svg class="bm-rings" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="30"/><circle cx="100" cy="100" r="58"/><circle cx="100" cy="100" r="86"/></svg>
      <div class="bm-ctxl"><p class="bm-label">Contexte · Auditorium de Lyon</p>
        <p class="bm-big"><span class="bm-n1">${pub[1]}</span>–<span class="bm-n2">${pub[2]}</span><small>ans</small></p>
        <ul class="bm-meta">${p.meta.map((m) => `<li>${esc(m)}</li>`).join('')}</ul></div>
      <div class="bm-ctxr"><p class="bm-lead">${esc(p.text)}</p>
        <figure class="bm-small">${`<img src="${im[4].file}" alt="${esc(im[4].caption)}" width="${im[4].w}" height="${im[4].h}" loading="lazy" decoding="async">`}<figcaption>${esc(im[4].caption)}</figcaption></figure></div>
    </section>
    <section class="bm-sec bm-views">
      <p class="bm-label">Dedans, dehors</p>
      ${spot(im[1], 'l')}
      ${spot(im[2], 'r')}
    </section>
    <section class="bm-night">
      <div class="bm-nbg"></div>
      <figure class="bm-nfig"><img src="${im[3].file}" alt="${esc(im[3].caption)}" width="${im[3].w}" height="${im[3].h}" loading="lazy" decoding="async"><figcaption>${esc(im[3].caption)}</figcaption></figure>
    </section>
    <section class="bm-sec bm-zoom">
      <p class="bm-label">Au cœur de la ville</p>
      <figure class="bm-zfig"><div class="bm-zimg"><img src="${im[0].file}" alt="${esc(im[0].caption)}" width="${im[0].w}" height="${im[0].h}" loading="lazy" decoding="async"></div><figcaption>${esc(im[0].caption)}</figcaption></figure>
    </section>
    <div class="bm-ring" aria-hidden="true"><i></i><b></b></div>
    <canvas class="bm-eq" aria-hidden="true"></canvas>`;

    const $ = (s) => root.querySelector(s);

    // ---------- Ouverture : iris + phrase au tempo
    const himg = $('.bm-heroimg'), words = split($('.bm-phrase'), 'words');
    if (reduced) {
      gsap.from('.bm-hbody', { opacity: 0, duration: 0.6, delay: 0.35 });
    } else {
      gsap.set(himg, { clipPath: 'circle(0% at 50% 50%)' });
      gsap.set(himg.firstElementChild, { scale: 1.25 });
      gsap.set(['.bm-tag', '.bm-title', '.bm-scrim'], { opacity: 0 });
      gsap.set(words, { yPercent: 60, opacity: 0 });
      const tl = gsap.timeline({ delay: 0.35 });
      tl.to(himg, { clipPath: 'circle(150% at 50% 50%)', duration: 1, ease: 'expo.out' })
        .to(himg.firstElementChild, { scale: 1, duration: 1.4, ease: 'expo.out' }, 0)
        .to('.bm-scrim', { opacity: 1, duration: 0.6 }, 0.35)
        .to(['.bm-tag', '.bm-title'], { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }, 0.45)
        .to(words, { yPercent: 0, opacity: 1, duration: 0.35, ease: 'power3.out', stagger: BEAT / 2 }, 0.6);
    }

    // ---------- Contexte
    if (!reduced) {
      gsap.from('.bm-ctx .bm-ctxl > *, .bm-lead, .bm-small', { y: 34, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, scrollTrigger: st({ trigger: '.bm-ctx', start: 'top 75%' }) });
      const n1 = $('.bm-n1'), n2 = $('.bm-n2'), o = { a: 0, b: 0 };
      gsap.to(o, { a: +pub[1], b: +pub[2], duration: 1.4, ease: 'power2.out', onUpdate: () => { n1.textContent = Math.round(o.a); n2.textContent = Math.round(o.b); }, scrollTrigger: st({ trigger: '.bm-big', start: 'top 85%', once: true }) });
      gsap.fromTo('.bm-rings circle', { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, transformOrigin: '50% 50%', stagger: 0.12, ease: 'none', scrollTrigger: st({ trigger: '.bm-ctx', start: 'top 85%', end: 'center 40%', scrub: 0.6 }) });
    }

    // ---------- Vues : masque radial « projecteur »
    $$(root, '.bm-spot').forEach((s, i) => {
      const lit = s.querySelector('.bm-lit');
      if (reduced) return;
      gsap.set(lit, { '--x': '-10%', '--y': '50%', '--r': '14vw' });
      const tl = gsap.timeline({ scrollTrigger: st({ trigger: s, start: 'top 85%', end: 'bottom 45%', scrub: 0.6 }) });
      tl.to(lit, { '--x': '105%', '--y': i ? '35%' : '65%', duration: 2, ease: 'sine.inOut' })
        .to(lit, { '--r': '120vw', duration: 1.2, ease: 'power2.in' }, 1.2);
      gsap.from(s.querySelector('figcaption'), { opacity: 0, y: 14, duration: 0.7, scrollTrigger: st({ trigger: s, start: 'top 60%' }) });
    });
    if (reduced) $$(root, '.bm-base').forEach((b) => (b.style.display = 'none'));

    // ---------- Nuit
    if (!reduced) {
      gsap.fromTo('.bm-nbg', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(150% at 50% 50%)', ease: 'none', scrollTrigger: st({ trigger: '.bm-night', start: 'top 85%', end: 'top 20%', scrub: 0.6 }) });
      gsap.fromTo('.bm-nfig img', { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: st({ trigger: '.bm-night', start: 'top 70%', end: 'bottom 40%', scrub: 0.6 }) });
      gsap.fromTo('.bm-nfig', { '--glow': 0.15 }, { '--glow': 0.75, duration: BEAT, ease: 'power2.out', repeat: -1, yoyo: true });
    } else {
      $('.bm-night').classList.add('is-dark');
    }

    // ---------- Dézoom
    if (!reduced) {
      gsap.fromTo('.bm-zimg img', { scale: 1.6 }, { scale: 1, ease: 'none', scrollTrigger: st({ trigger: '.bm-zfig', start: 'top 90%', end: 'center 45%', scrub: 0.6 }) });
    }

    // ---------- Anneau néon au tempo (curseur ; centre sur mobile)
    const ring = $('.bm-ring');
    if (!reduced) {
      gsap.to(ring.querySelector('i'), { scale: 1.9, opacity: 0, duration: BEAT, ease: 'power2.out', repeat: -1, startAt: { scale: 1, opacity: 0.9 } });
      gsap.to(ring.querySelector('b'), { scale: 1.12, duration: BEAT / 2, ease: 'sine.inOut', repeat: -1, yoyo: true });
    }
    if (fine && !reduced) {
      gsap.set(ring, { xPercent: -50, yPercent: -50, x: innerWidth / 2, y: innerHeight / 2, opacity: 0 });
      const mx = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' }), my = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' });
      let shown = false;
      scroller.addEventListener('pointermove', (e) => { mx(e.clientX); my(e.clientY); if (!shown) { shown = true; gsap.to(ring, { opacity: 1, duration: 0.4 }); } }, { signal });
    } else {
      ring.classList.add('is-center');
      if (reduced) ring.style.display = 'none';
      // l'anneau s'efface en bas de page pour ne pas masquer « Pièce suivante »
      const nav = scroller.querySelector('.page-next');
      if (nav && !reduced) ScrollTrigger.create(st({ trigger: nav, start: 'top 98%', end: 'bottom top', onToggle: (s) => gsap.to(ring, { autoAlpha: s.isActive ? 0 : 1, duration: 0.3, overwrite: 'auto' }) }));
    }

    // ---------- Égaliseur canvas (réagit à la vitesse de défilement)
    const cv = $('.bm-eq');
    if (!reduced) {
      const g = cv.getContext('2d'), N = 24, dpr = Math.min(2, devicePixelRatio || 1);
      let W = 0, Hh = 0, last = scroller.scrollTop, speed = 0, t0 = performance.now();
      const bars = new Array(N).fill(0);
      const size = () => { W = cv.clientWidth; Hh = cv.clientHeight; cv.width = W * dpr; cv.height = Hh * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
      size(); addEventListener('resize', size, { signal });
      const frame = (now) => {
        if (signal.aborted) return;
        requestAnimationFrame(frame);
        if (document.hidden) return;
        const y = scroller.scrollTop; speed += (Math.min(1, Math.abs(y - last) / 70) - speed) * 0.2; last = y;
        const t = (now - t0) / 1000;
        g.clearRect(0, 0, W, Hh);
        const bw = W / N;
        g.fillStyle = '#C0603A';
        for (let i = 0; i < N; i++) {
          const wob = 0.5 + 0.5 * Math.sin(t * (2.2 + (i % 5) * 0.7) + i * 1.3);
          const target = 0.06 + wob * (0.14 + speed * 0.8);
          bars[i] += (target - bars[i]) * 0.3;
          const bh = Math.max(2, bars[i] * Hh);
          g.fillRect(i * bw + bw * 0.2, Hh - bh, bw * 0.6, bh);
        }
      };
      requestAnimationFrame(frame);
    } else cv.style.display = 'none';
  },
};
