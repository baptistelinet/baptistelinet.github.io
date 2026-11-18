import { h, $$, esc, fig, split } from './_kit.js';
// Vespasian IX : « la traversée ». Horizon, coque qui tangue, rail de vues, hublot, loch.
export default {
  mount(ctx) {
    const { root, scroller, gsap, ScrollTrigger, project: p, images: im, reduced, signal } = ctx;
    scroller.style.setProperty('--room', '#DADDD0');
    const st = (o) => Object.assign({ scroller }, o);
    const pad3 = (n) => String(Math.round(n)).padStart(3, '0');
    const sentences = (p.text || '').split(/(?<=\.)\s+/);
    const intime = sentences.find((s) => /intimist/.test(s)) || '';

    root.innerHTML = `
    <section class="vs-hero">
      <div class="vs-sky"><p class="vs-num">Projet ${esc(p.num)}</p><p class="vs-kind">${esc(p.kind)}</p><span class="vs-sun"></span></div>
      <svg class="vs-hz" viewBox="0 0 1000 2" preserveAspectRatio="none" aria-hidden="true"><path d="M0 1H1000" pathLength="1"/></svg>
      <div class="vs-hull"><h1 class="vs-title">${esc(p.title)}</h1></div>
      <figure class="vs-heromob" aria-hidden="true"><img src="${im[0].file}" alt="" width="${im[0].w}" height="${im[0].h}" loading="eager" decoding="async"></figure>
      <ul class="vs-meta">${p.meta.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>
      <p class="vs-hint">Appareiller<span></span></p>
    </section>
    <section class="vs-sec vs-text">
      <p class="vs-label">La traversée</p>
      <p class="vs-lead">${esc(p.text)}</p>
    </section>
    <section class="vs-sec vs-first">${fig(im[0], { cls: 'vs-big', eager: true })}</section>
    <section class="vs-rail">
      <div class="vs-railhead"><span class="vs-label">Vues panoramiques</span><span class="vs-count"><b>01</b> / 03</span></div>
      <div class="vs-track">${[im[2], im[3], im[1]].map((x, i) => `<figure class="vs-panel"><div class="vs-pimg"><img src="${x.file}" alt="${esc(x.caption)}" width="${x.w}" height="${x.h}" loading="eager" decoding="async"></div><figcaption class="vs-cap"><b>${String(i + 1).padStart(2, '0')}</b>${esc(x.caption)}</figcaption></figure>`).join('')}</div>
    </section>
    <section class="vs-hub">
      <div class="vs-hubin">
        <div class="vs-hubtxt"><p class="vs-label">Séquence intime</p><p class="vs-lead">${esc(intime)}</p></div>
        <figure class="vs-port"><div class="vs-portimg"><img src="${im[4].file}" alt="${esc(im[4].caption)}" width="${im[4].w}" height="${im[4].h}" loading="eager" decoding="async"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><ellipse cx="50" cy="50" rx="6" ry="6"/></svg></div><figcaption>${esc(im[4].caption)}</figcaption></figure>
      </div>
    </section>
    <section class="vs-sec vs-end">
      ${fig(im[1], { cls: 'vs-big vs-last' })}
      <p class="vs-fin">Fin de traversée</p>
    </section>
    <div class="vs-loch" aria-hidden="true"><span>Loch <b class="vs-nm">0.0</b> NM</span><i></i><span>Cap <b class="vs-hd">084</b>°</span></div>`;

    const $ = (s) => root.querySelector(s);
    const title = $('.vs-title');

    // --- Ouverture
    const line = $('.vs-hz path');
    if (reduced) {
      gsap.from([title, '.vs-meta', '.vs-sky'], { opacity: 0, duration: 0.6, delay: 0.35 });
    } else {
      gsap.set(line, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(title, { yPercent: 105 });
      gsap.set(['.vs-meta li', '.vs-sky > *:not(.vs-sun)', '.vs-hint'], { opacity: 0 });
      gsap.set('.vs-sun', { opacity: 0 });
      const tl = gsap.timeline({ delay: 0.35 });
      tl.to(line, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' })
        .to(title, { yPercent: 0, duration: 0.85, ease: 'expo.out' }, 0.25)
        .to('.vs-sun', { opacity: 1, duration: 0.6 }, 0.4)
        .to(['.vs-sky > *:not(.vs-sun)', '.vs-meta li', '.vs-hint'], { opacity: 1, duration: 0.6, stagger: 0.05 }, 0.55)
        .fromTo('.vs-heromob', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power3.inOut' }, 0.5)
        .add(() => {
          gsap.to(title, { rotation: 0.6, y: -3, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 100%' });
        });
      // Le soleil se couche derrière la ligne
      gsap.to('.vs-sun', { yPercent: 130, ease: 'none', scrollTrigger: st({ trigger: '.vs-hero', start: 'top top', end: 'bottom top', scrub: 0.6 }) });
    }

    // --- Texte : mots qui s'éclairent
    const words = split($('.vs-lead'), 'words');
    if (!reduced) {
      gsap.fromTo(words, { opacity: 0.16 }, { opacity: 1, ease: 'none', stagger: 0.12, scrollTrigger: st({ trigger: '.vs-text', start: 'top 78%', end: 'bottom 55%', scrub: 0.6 }) });
      const f = $('.vs-first .k-img');
      gsap.fromTo(f, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power3.inOut', scrollTrigger: st({ trigger: f, start: 'top 82%' }) });
      gsap.fromTo(f.querySelector('img'), { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: st({ trigger: f, start: 'top bottom', end: 'bottom 30%', scrub: 0.6 }) });
    }

    // --- Rail horizontal épinglé
    const rail = $('.vs-rail'), track = $('.vs-track');
    const panels = $$(root, '.vs-panel');
    if (reduced) {
      rail.classList.add('is-flat');
    } else {
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      const tween = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: st({ trigger: rail, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: (s) => { const n = Math.min(panels.length, 1 + Math.floor(s.progress * panels.length * 0.999)); $('.vs-count b').textContent = String(n).padStart(2, '0'); } }),
      });
      panels.forEach((pn) => {
        const cap = pn.querySelector('.vs-cap'), img = pn.querySelector('img');
        gsap.fromTo(cap, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', scrollTrigger: st({ trigger: pn, containerAnimation: tween, start: 'left 78%', toggleActions: 'play none none reverse' }) });
        gsap.fromTo(img, { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: st({ trigger: pn, containerAnimation: tween, start: 'left 100%', end: 'left 35%', scrub: true }) });
      });
      // inclinaison liée à la vitesse
      const skewTo = gsap.quickTo(track, 'skewX', { duration: 0.5, ease: 'power3.out' });
      const calm = gsap.delayedCall(0.12, () => skewTo(0)).pause();
      ScrollTrigger.create(st({ trigger: root, start: 0, end: 'max', onUpdate: (s) => { skewTo(gsap.utils.clamp(-3, 3, s.getVelocity() / -450)); calm.restart(true); } }));
    }

    // --- Hublot
    const hubImg = $('.vs-portimg'), ell = hubImg.querySelector('ellipse');
    if (reduced) {
      gsap.from(hubImg, { opacity: 0, duration: 0.8, scrollTrigger: st({ trigger: hubImg, start: 'top 85%' }) });
      ell.parentNode.style.display = 'none';
    } else {
      const o = { r: 18 };
      const draw = () => { hubImg.style.clipPath = `ellipse(${o.r}% ${o.r}% at 50% 50%)`; ell.setAttribute('rx', o.r); ell.setAttribute('ry', o.r); };
      draw();
      const tl = gsap.timeline({ scrollTrigger: st({ trigger: '.vs-hub', start: 'top top', end: '+=120%', pin: true, scrub: 0.6, anticipatePin: 1 }) });
      tl.to(o, { r: 78, ease: 'power2.inOut', duration: 1, onUpdate: draw })
        .fromTo(hubImg.querySelector('img'), { scale: 1.3 }, { scale: 1, ease: 'none', duration: 1 }, 0)
        .to(ell, { opacity: 0, duration: 0.3 }, 0.6)
        .fromTo('.vs-hubtxt', { y: 40, opacity: 0.2 }, { y: 0, opacity: 1, duration: 0.5 }, 0.15);
    }

    // --- Finale
    if (!reduced) {
      const l = $('.vs-last .k-img');
      gsap.fromTo(l, { clipPath: 'inset(18% 12% 18% 12%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: st({ trigger: l, start: 'top 95%', end: 'top 25%', scrub: 0.6 }) });
      gsap.from('.vs-fin', { y: 20, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: st({ trigger: '.vs-fin', start: 'top 92%' }) });
    }

    // --- Loch : milles et cap suivent le défilement
    const nm = $('.vs-nm'), hd = $('.vs-hd');
    const upd = (pr) => { nm.textContent = (pr * 48).toFixed(1); hd.textContent = pad3(((84 + pr * 62 + Math.sin(pr * 18) * 7) + 360) % 360); };
    ScrollTrigger.create(st({ trigger: root, start: 'top top', end: 'bottom bottom', onUpdate: (s) => upd(s.progress) }));
    gsap.from('.vs-loch', { opacity: 0, y: 12, duration: 0.8, delay: 1.2 });
  },
};
