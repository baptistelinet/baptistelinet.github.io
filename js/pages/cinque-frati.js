import { esc, split } from './_kit.js';
// Cinque Frati : « la traversée des arches »
// ouverture en arche, lecture mot à mot, enfilade épinglée, tampons d'épicerie, bandes matières.

const stamp = (t) => `<div class="cf-stamp" role="presentation"><span>${esc(t)}</span></div>`;
const arch = (im, extra = '') => `<div class="cf-arch ${extra}" style="aspect-ratio:${im.w}/${im.h}"><img src="${im.file}" alt="${esc(im.caption)}" width="${im.w}" height="${im.h}" loading="lazy" decoding="async"></div>`;

export default {
  mount(ctx) {
    const { root, scroller, gsap, project: p, images: im, reduced } = ctx;
    const st = (o) => ({ scroller, ...o });
    const byFile = (n) => im.find(x => x.file.includes(n));
    const hero = byFile('01_stand'), axoStand = byFile('06_axo'), halles = byFile('02_stand');
    const pairs = [
      { stamp: 'Dégustation', r: byFile('03_deg'), a: byFile('07_axo') },
      { stamp: 'Présentoirs', r: byFile('04_bou'), a: byFile('08_axo') },
      { stamp: 'Salon premium', r: byFile('05_sal'), a: byFile('09_axo') },
    ];
    const sent = (p.text.match(/[^.]+\./g) || [p.text]).map(s => s.trim());
    const lay = [axoStand, pairs[0].r, pairs[1].r, pairs[2].r];

    root.innerHTML = `
    <section class="cf-hero">
      <div class="cf-hero-wrap">
        <svg class="cf-key" viewBox="0 0 60 44" aria-hidden="true"><path d="M8 2 H52 L44 42 H16 Z"/></svg>
        <div class="cf-ring"></div>
        <div class="cf-hero-frame cf-arch">
          <img src="${hero.file}" alt="${esc(hero.caption)}" width="${hero.w}" height="${hero.h}" loading="eager" decoding="async">
          <h1 class="cf-h1">${esc(p.title)}</h1>
        </div>
      </div>
      <div class="cf-hero-meta">
        <p class="cf-kind">Projet ${esc(p.num)} · ${esc(p.kind)}</p>
        <ul class="cf-meta">${p.meta.map(m => `<li>${esc(m)}</li>`).join('')}</ul>
        <p class="cf-hint">${esc(hero.caption)}</p>
      </div>
    </section>

    <section class="cf-story">
      ${stamp('Souvenirs')}
      <p class="cf-read" data-read>${esc(sent[0])}</p>
      <p class="cf-read" data-read>${esc(sent[1] || '')}</p>
      <p class="cf-read cf-read-s" data-read>${esc(sent[2] || '')}</p>
      <svg class="cf-arcades" viewBox="0 0 500 90" aria-hidden="true">
        ${[0, 1, 2, 3, 4].map(i => `<path pathLength="1" d="M${12 + i * 98} 90 V${44} A${37} ${37} 0 0 1 ${86 + i * 98} 44 V90"/>`).join('')}
      </svg>
    </section>

    <section class="cf-pass" id="cfPass">
      <div class="cf-pass-stage">
        ${stamp('L\'enfilade')}
        <div class="cf-lays">
          ${lay.map((x, k) => `<div class="cf-lay" data-k="${k}"><div class="cf-lay-in">${arch(x, 'cf-fill').replace('loading="lazy"', 'loading="eager"')}</div></div>`).join('')}
        </div>
        <p class="cf-pass-cap" aria-live="polite"><b>01 / 0${lay.length}</b><span>${esc(lay[0].caption)}</span></p>
      </div>
    </section>

    ${pairs.map((q, i) => `
    <section class="cf-pair cf-pair-${i % 2 ? 'r' : 'l'}">
      ${stamp(q.stamp)}
      <div class="cf-pair-grid">
        <figure class="cf-fig cf-main">${arch(q.r)}<span class="cf-tag cf-tag-a">Rendu</span><figcaption>${esc(q.r.caption)}</figcaption></figure>
        <figure class="cf-fig cf-aux">${arch(q.a)}<span class="cf-tag cf-tag-b">Axonométrie</span><figcaption>${esc(q.a.caption)}</figcaption></figure>
      </div>
    </section>`).join('')}

    <section class="cf-mat">
      ${stamp('Matières')}
      <p class="cf-lead2">Bois, pierre et enduits naturels : des matériaux bruts.</p>
      <div class="cf-bands">
        <div class="cf-band cf-wood"><span>Bois</span></div>
        <div class="cf-band cf-stone"><span>Pierre</span></div>
        <div class="cf-band cf-plaster"><span>Enduit</span></div>
      </div>
    </section>

    <section class="cf-halles">
      ${stamp('Les Halles')}
      <figure class="cf-fig">${arch(halles)}<figcaption>${esc(halles.caption)}</figcaption></figure>
    </section>`;

    const $ = (s, r = root) => r.querySelector(s);
    const $$ = (s, r = root) => [...r.querySelectorAll(s)];

    (ctx.page || ctx.scroller).style.setProperty('--room', '#EFD9C9');

    // lecture mot à mot
    const words = $$('[data-read]').map(el => split(el, 'words'));

    if (reduced) { root.classList.add('is-static'); return; }

    // ----- tampons : frappent le nom de la section -----
    $$('.cf-stamp').forEach(s => {
      gsap.set(s, { opacity: 0, scale: 1.4, rotation: 0 });
      gsap.to(s, { opacity: 1, scale: 1, rotation: -8, duration: 0.55, ease: 'back.out(2.2)',
        scrollTrigger: st({ trigger: s, start: 'top 85%', toggleActions: 'play none none reverse' }),
        onComplete() { gsap.fromTo(s.parentElement, { y: 0 }, { y: 3, duration: 0.06, yoyo: true, repeat: 3, ease: 'none', clearProps: 'y' }); } });
    });

    // ----- ouverture : masque en arche de bas en haut, titre lettre par lettre -----
    const letters = split($('.cf-h1'), 'chars');
    const frame = $('.cf-hero-frame');
    gsap.set(frame, { clipPath: 'ellipse(0% 0% at 50% 100%)' });
    gsap.set(letters, { yPercent: 60, opacity: 0 });
    gsap.set('.cf-key', { y: -26, opacity: 0 });
    gsap.set('.cf-ring', { opacity: 0, scale: 0.94, transformOrigin: '50% 100%' });
    gsap.set('.cf-hero-meta > *', { opacity: 0, y: 14 });
    gsap.set('.cf-hero-frame img', { scale: 1.2 });
    gsap.timeline({ delay: 0.35 })
      .to(frame, { clipPath: 'ellipse(82% 138% at 50% 100%)', duration: 0.9, ease: 'power3.inOut', onComplete: () => gsap.set(frame, { clearProps: 'clipPath' }) }, 0)
      .to('.cf-hero-frame img', { scale: 1, duration: 1.5, ease: 'expo.out' }, 0)
      .to('.cf-ring', { opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out' }, 0.25)
      .to('.cf-key', { y: 0, opacity: 1, duration: 0.55, ease: 'back.out(1.8)' }, 0.75)
      .to(letters, { yPercent: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.03 }, 0.95)
      .to('.cf-hero-meta > *', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.1 }, 1.15);
    gsap.to('.cf-hero-wrap', { yPercent: -8, ease: 'none', scrollTrigger: st({ trigger: '.cf-hero', start: 'top top', end: 'bottom top', scrub: 0.6 }) });

    // ----- texte : les mots s'allument -----
    words.forEach(ws => {
      gsap.set(ws, { opacity: 0.18 });
      gsap.to(ws, { opacity: 1, ease: 'none', stagger: 0.12,
        scrollTrigger: st({ trigger: ws[0].parentElement, start: 'top 82%', end: 'bottom 55%', scrub: 0.6 }) });
    });
    const arcs = $$('.cf-arcades path');
    gsap.set(arcs, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.to(arcs, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', stagger: 0.15, scrollTrigger: st({ trigger: '.cf-arcades', start: 'top 90%' }) });

    // ----- enfilade épinglée : on passe au travers des arches -----
    const layers = $$('.cf-lay');
    const N = layers.length, PMAX = N - 1 + 0.2;
    const cap = $('.cf-pass-cap'), capB = $('b', cap), capS = $('span', cap);
    let curCap = 0;
    const o = { P: 0 };
    const draw = () => {
      layers.forEach((l, k) => {
        const u = o.P - k;
        const s = Math.pow(4, u);
        let a = 1;
        if (u < -1) a = Math.max(0, (u + 1.7) / 0.7);
        if (k < N - 1 && u > 0.3) a = Math.max(0, 1 - (u - 0.3) / 0.55);
        l.style.opacity = a.toFixed(3);
        l.style.transform = `translate(-50%,-50%) scale(${s.toFixed(4)})`;
        l.style.visibility = a <= 0.001 ? 'hidden' : 'visible';
      });
      const idx = Math.max(0, Math.min(N - 1, Math.round(o.P - 0.15)));
      if (idx !== curCap) {
        curCap = idx;
        capB.textContent = `0${idx + 1} / 0${N}`; capS.textContent = lay[idx].caption;
        gsap.fromTo(cap, { y: 10, opacity: 0.2 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' });
      }
    };
    draw();
    gsap.to(o, { P: PMAX, ease: 'none', onUpdate: draw,
      scrollTrigger: st({ trigger: '#cfPass', start: 'top top', end: '+=360%', pin: true, scrub: 0.6, anticipatePin: 1 }) });

    // ----- couples rendu + axonométrie -----
    $$('.cf-pair').forEach((sec, i) => {
      const archs = $$('.cf-arch', sec), imgs = $$('.cf-arch img', sec);
      archs.forEach((a, j) => {
        gsap.fromTo(a, { clipPath: 'ellipse(0% 0% at 50% 100%)' }, { clipPath: 'ellipse(82% 138% at 50% 100%)', duration: 1.1, ease: 'power3.inOut', delay: j * 0.18,
          scrollTrigger: st({ trigger: sec, start: 'top 62%' }), onComplete: () => gsap.set(a, { clearProps: 'clipPath' }) });
      });
      imgs.forEach(g => gsap.fromTo(g, { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: st({ trigger: g.parentElement, start: 'top bottom', end: 'bottom 30%', scrub: 0.6 }) }));
      const dir = i % 2 ? -1 : 1;
      [['.cf-tag-a', -1], ['.cf-tag-b', 1]].forEach(([s, d]) => {
        const tag = $(s, sec);
        gsap.fromTo(tag, { x: d * dir * 90, y: -40, rotation: d * 16, opacity: 0 }, { x: 0, y: 0, rotation: d * -3, opacity: 1, duration: 0.8, ease: 'back.out(1.7)', delay: 0.5,
          scrollTrigger: st({ trigger: sec, start: 'top 55%', toggleActions: 'play none none reverse' }) });
      });
    });

    // ----- bandes matières qui se déroulent -----
    $$('.cf-band').forEach((b, i) => {
      gsap.fromTo(b, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', ease: 'none', onComplete: () => {},
        scrollTrigger: st({ trigger: b, start: 'top 92%', end: 'top 45%', scrub: 0.6 }) });
      gsap.fromTo($('span', b), { xPercent: -30, opacity: 0 }, { xPercent: 0, opacity: 1, ease: 'none', scrollTrigger: st({ trigger: b, start: 'top 80%', end: 'top 45%', scrub: 0.6 }) });
      gsap.fromTo(b, { backgroundPositionX: '0px' }, { backgroundPositionX: (i % 2 ? -1 : 1) * 160 + 'px', ease: 'none', scrollTrigger: st({ trigger: b, start: 'top bottom', end: 'bottom top', scrub: 0.6 }) });
    });

    // ----- insertion dans les Halles -----
    const h = $('.cf-halles .cf-arch');
    gsap.fromTo(h, { clipPath: 'ellipse(0% 0% at 50% 100%)' }, { clipPath: 'ellipse(82% 138% at 50% 100%)', duration: 1.2, ease: 'power3.inOut', onComplete: () => gsap.set(h, { clearProps: 'clipPath' }),
      scrollTrigger: st({ trigger: h, start: 'top 80%' }) });
    gsap.fromTo($('img', h), { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: st({ trigger: h, start: 'top bottom', end: 'bottom 40%', scrub: 0.6 }) });
  },
};
