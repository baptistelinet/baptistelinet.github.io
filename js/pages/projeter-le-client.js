import { esc, split } from './_kit.js';
// Projeter le client : « le rendu qui se calcule »
// ouverture en tuiles de rendu (canvas), chapitres esquisse / rendu, curseur montage -> rendu, fil d'Ariane en escalier.

const STEPS = ['Accroche', 'L\'esquisse', 'Du montage au rendu', 'Le rendu'];
const TILE = 48;

function spiralOrder(cols, rows) {
  const total = cols * rows, out = [];
  let x = Math.floor((cols - 1) / 2), y = Math.floor((rows - 1) / 2);
  const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  let d = 0, len = 1, guard = 0;
  const push = () => { if (x >= 0 && y >= 0 && x < cols && y < rows) out.push(y * cols + x); };
  push();
  while (out.length < total && guard++ < 100000) {
    for (let rep = 0; rep < 2 && out.length < total; rep++) {
      for (let i = 0; i < len && out.length < total; i++) { x += dirs[d][0]; y += dirs[d][1]; push(); }
      d = (d + 1) % 4;
    }
    len++;
  }
  return out;
}

export default {
  mount(ctx) {
    const { root, scroller, gsap, ScrollTrigger, project: p, images: im, reduced, signal } = ctx;
    const st = (o) => ({ scroller, ...o });
    const [r1, r2, r3, m1, m2, m3] = im;
    const lead = (p.text.match(/[^.]+\./g) || [p.text])[0].trim();
    const pic = (x, cls = '', eager = false) => `<img class="${cls}" src="${x.file}" alt="${esc(x.caption)}" width="${x.w}" height="${x.h}" loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;

    root.innerHTML = `
    <nav class="pc-steps" aria-label="Chapitres">
      <svg viewBox="0 0 150 56" aria-hidden="true">
        ${STEPS.map((s, i) => `<rect class="pc-step" data-i="${i}" x="${i * 38}" y="${56 - (i + 1) * 13}" width="34" height="${(i + 1) * 13}"/>`).join('')}
      </svg>
      <span class="pc-steps-l">${STEPS[0]}</span>
    </nav>

    <section class="pc-hero" data-step="0">
      <header class="pc-head">
        <div>
          <p class="pc-num">Projet ${esc(p.num)} · ${esc(p.kind)}</p>
          <h1 class="pc-h1">${esc(p.title)}</h1>
        </div>
        <p class="pc-lead">${esc(lead)}</p>
      </header>
      <div class="pc-frame">
        ${pic(r1, '', true)}
        <canvas class="pc-canvas" aria-hidden="true"></canvas>
      </div>
      <div class="pc-render" aria-live="off"><span>Rendu</span><b class="pc-pct">0 %</b><i class="pc-bar"><u></u></i><em>${esc(r1.caption)}</em></div>
    </section>

    <section class="pc-ch pc-ch1" data-step="1">
      <div class="pc-big" aria-hidden="true">01</div>
      <header class="pc-chh"><p class="k-label">Chapitre 01</p><h2 class="pc-h2">L'esquisse</h2><p class="pc-lead">Montages volumétriques sur photo du site.</p></header>
      <div class="pc-sketch">
        <figure class="pc-sk pc-sk-a"><div class="pc-img">${pic(m1)}<span class="pc-wire"></span></div><figcaption>${esc(m1.caption)}</figcaption></figure>
        <figure class="pc-sk pc-sk-b"><div class="pc-img">${pic(m2)}<span class="pc-wire"></span></div><figcaption>${esc(m2.caption)}</figcaption></figure>
        <figure class="pc-sk pc-sk-c"><div class="pc-img">${pic(m3)}<span class="pc-wire"></span></div><figcaption>${esc(m3.caption)}</figcaption></figure>
      </div>
    </section>

    <section class="pc-cmp" id="pcCmp" data-step="2">
      <div class="pc-cmp-in">
        <div class="pc-cmp-head"><p class="k-label">Du montage au rendu</p><p class="pc-cap"><b>Montage</b><span>${esc(m1.caption)}</span></p></div>
        <div class="pc-cmp-stage">
          ${pic(m1, 'pc-l pc-l-m1')}${pic(r1, 'pc-l pc-l-r1')}${pic(m2, 'pc-l pc-l-m2')}${pic(r2, 'pc-l pc-l-r2')}${pic(m3, 'pc-l pc-l-m3')}${pic(r3, 'pc-l pc-l-r3')}
          <span class="pc-cut" aria-hidden="true"></span>
        </div>
        <div class="pc-rail" aria-hidden="true"><span class="pc-rail-fill"></span>${[0, 1, 2, 3, 4, 5].map(i => `<i class="pc-dot" data-i="${i}"></i>`).join('')}</div>
      </div>
    </section>

    <section class="pc-ch pc-ch2" data-step="3">
      <div class="pc-big" aria-hidden="true">02</div>
      <header class="pc-chh"><p class="k-label">Chapitre 02</p><h2 class="pc-h2">Le rendu</h2><p class="pc-lead">Trois variantes de l'extension.</p></header>
      <div class="pc-var" id="pcVar">
        <div class="pc-var-stage">${[r1, r2, r3].map((x, i) => `<div class="pc-vl" data-i="${i}">${pic(x)}</div>`).join('')}</div>
        <div class="pc-var-tabs" role="tablist">${[r1, r2, r3].map((x, i) => `<button class="pc-tab" role="tab" data-i="${i}"><b>Variante ${i + 1}</b><span>${esc(x.caption)}</span></button>`).join('')}</div>
      </div>
    </section>`;

    const $ = (s, r = root) => r.querySelector(s);
    const $$ = (s, r = root) => [...r.querySelectorAll(s)];
    scroller.style.setProperty('--room', '#EFECE6');

    // ----- fil d'Ariane en escalier -----
    const steps = $$('.pc-step'), stepLabel = $('.pc-steps-l');
    let cur = -1;
    const setStep = (n) => {
      if (n === cur) return; cur = n;
      steps.forEach((s, i) => gsap.to(s, { fill: i <= n ? '#C0603A' : 'rgba(43,38,34,0)', duration: 0.45, ease: 'power2.out', overwrite: true }));
      stepLabel.textContent = STEPS[n];
      gsap.fromTo(stepLabel, { opacity: 0, x: 8 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out' });
    };
    gsap.set(steps, { fill: 'rgba(43,38,34,0)' });
    setStep(0);
    if (!reduced) {
      [['.pc-ch1', 1], ['#pcCmp', 2], ['.pc-ch2', 3]].forEach(([sel, n]) => {
        ScrollTrigger.create(st({ trigger: sel, start: 'top 58%', onEnter: () => setStep(n), onLeaveBack: () => setStep(n - 1) }));
      });
    }

    // ----- variantes (onglets + balayage) -----
    const vls = $$('.pc-vl'), tabs = $$('.pc-tab');
    let vi = 0, vz = 1, autoT = null, userTouched = false;
    gsap.set(vls, { zIndex: (i) => (i === 0 ? 1 : 0) });
    gsap.set(vls.slice(1), { clipPath: 'inset(0 0 0 100%)' });
    const showVar = (i, instant) => {
      if (i === vi && !instant) return;
      vi = i; vz++;
      const el = vls[i];
      tabs.forEach((t, k) => t.classList.toggle('on', k === i));
      el.style.zIndex = vz;
      if (reduced || instant) { gsap.set(el, { clipPath: 'inset(0 0 0 0)' }); return; }
      gsap.fromTo(el, { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 0.9, ease: 'power3.inOut' });
      gsap.fromTo($('img', el), { scale: 1.08 }, { scale: 1, duration: 1.4, ease: 'expo.out' });
    };
    tabs.forEach((t, i) => t.addEventListener('click', () => { userTouched = true; showVar(i); }, { signal }));
    $('.pc-var-stage').addEventListener('click', () => { userTouched = true; showVar((vi + 1) % 3); }, { signal });
    tabs[0].classList.add('on');
    if (!reduced) {
      ScrollTrigger.create(st({ trigger: '#pcVar', start: 'top 70%', end: 'bottom 20%',
        onToggle: (self) => {
          clearInterval(autoT);
          if (self.isActive && !userTouched) autoT = setInterval(() => { if (!userTouched && !signal.aborted) showVar((vi + 1) % 3); }, 4200);
        } }));
      signal.addEventListener('abort', () => clearInterval(autoT));
    }

    if (reduced) {
      root.classList.add('is-static');
      $('.pc-canvas').remove();
      return;
    }

    // ----- ouverture : tuiles de rendu en spirale -----
    const frame = $('.pc-frame'), cv = $('.pc-canvas'), c2 = cv.getContext('2d');
    const pct = $('.pc-pct'), bar = $('.pc-bar u');
    const W = frame.clientWidth, H = frame.clientHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    c2.scale(dpr, dpr);
    const cols = Math.ceil(W / TILE), rows = Math.ceil(H / TILE), N = cols * rows;
    const order = spiralOrder(cols, rows);
    c2.fillStyle = '#E4DFD5'; c2.fillRect(0, 0, W, H);
    c2.strokeStyle = 'rgba(43,38,34,.09)'; c2.lineWidth = 1;
    for (let x = 0; x <= cols; x++) { c2.beginPath(); c2.moveTo(x * TILE + .5, 0); c2.lineTo(x * TILE + .5, H); c2.stroke(); }
    for (let y = 0; y <= rows; y++) { c2.beginPath(); c2.moveTo(0, y * TILE + .5); c2.lineTo(W, y * TILE + .5); c2.stroke(); }
    const rect = (i) => { const cx = (i % cols) * TILE, cy = Math.floor(i / cols) * TILE; return [cx, cy, Math.min(TILE, W - cx), Math.min(TILE, H - cy)]; };
    const clearT = (i) => { const [x, y, w, h] = rect(i); c2.clearRect(x - 0.5, y - 0.5, w + 1, h + 1); };
    const bracket = (i) => {
      const [x, y, w, h] = rect(i), L = 9;
      c2.strokeStyle = '#C0603A'; c2.lineWidth = 2; c2.beginPath();
      c2.moveTo(x + 1, y + L); c2.lineTo(x + 1, y + 1); c2.lineTo(x + L, y + 1);
      c2.moveTo(x + w - L, y + h - 1); c2.lineTo(x + w - 1, y + h - 1); c2.lineTo(x + w - 1, y + h - L);
      c2.stroke();
    };
    let done = 0, act = [];
    const paint = (pr) => {
      const c = Math.min(N, Math.floor(pr * N));
      act.forEach(clearT); act = [];
      for (; done < c; done++) clearT(order[done]);
      for (let k = c; k < Math.min(N, c + 3); k++) { clearT(order[k]); bracket(order[k]); act.push(order[k]); }
      const v = Math.round(pr * 100);
      pct.textContent = v + ' %'; bar.style.transform = `scaleX(${pr})`;
    };
    paint(0);
    const split1 = split($('.pc-h1'), 'words');
    gsap.set(split1, { yPercent: 100, opacity: 0 });
    gsap.set('.pc-num,.pc-head .pc-lead,.pc-render', { opacity: 0, y: 12 });
    const o = { p: 0 };
    gsap.timeline({ delay: 0.35 })
      .to(o, { p: 1, duration: 1.2, ease: 'power1.inOut', onUpdate: () => paint(o.p),
        onComplete: () => { c2.clearRect(0, 0, W, H); cv.style.display = 'none'; pct.textContent = '100 %'; } }, 0)
      .to(split1, { yPercent: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.1 }, 0.05)
      .to('.pc-num,.pc-head .pc-lead,.pc-render', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08 }, 0.2);

    // ----- chapitres : grands numéros en parallaxe, révélations -----
    $$('.pc-big').forEach(b => gsap.fromTo(b, { yPercent: 25 }, { yPercent: -25, ease: 'none', scrollTrigger: st({ trigger: b.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.6 }) }));
    $$('.pc-chh > *').forEach(el => gsap.from(el, { y: 30, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: st({ trigger: el, start: 'top 90%' }) }));
    $$('.pc-sk').forEach((f, i) => {
      const box = $('.pc-img', f), wire = $('.pc-wire', f);
      gsap.fromTo(box, { opacity: 0, y: 70, rotationX: 14, transformPerspective: 900, transformOrigin: '50% 100%' },
        { opacity: 1, y: 0, rotationX: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: st({ trigger: f, start: 'top 88%' }) });
      gsap.fromTo(wire, { opacity: 1 }, { opacity: 0.1, ease: 'none', scrollTrigger: st({ trigger: f, start: 'top 85%', end: 'center 45%', scrub: 0.6 }) });
    });
    gsap.from('.pc-var', { y: 50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: st({ trigger: '.pc-var', start: 'top 88%' }) });

    // ----- section épinglée : du montage au rendu -----
    const L = (k) => $('.pc-l-' + k);
    gsap.set([L('r1'), L('m2'), L('r2'), L('m3'), L('r3')], { opacity: 0 });
    gsap.set(L('r1'), { opacity: 1, clipPath: 'inset(0 100% 0 0)' });
    const cut = $('.pc-cut'), capTag = $('.pc-cap b'), capTxt = $('.pc-cap span'), dots = $$('.pc-dot'), fill = $('.pc-rail-fill');
    const CAPS = [['Montage', m1.caption], ['Rendu', r1.caption], ['Montage', m2.caption], ['Rendu', r2.caption], ['Montage', m3.caption], ['Rendu', r3.caption]];
    const T = [0, 1.7, 2.9, 3.9, 5.0, 5.9], TOTAL = 6.6;
    let capI = 0;
    dots.forEach((d, i) => { d.style.left = (T[i] / TOTAL * 100) + '%'; });
    const prox = { t: 0, x: 0 };
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: st({ trigger: '#pcCmp', start: 'top top', end: '+=320%', pin: true, scrub: 0.6, anticipatePin: 1 }) });
    tl.to(prox, { t: TOTAL, duration: TOTAL, onUpdate: () => {
      const t = prox.t;
      fill.style.transform = `scaleX(${t / TOTAL})`;
      let i = 0; T.forEach((v, k) => { if (t >= v - 0.001) i = k; });
      dots.forEach((d, k) => d.classList.toggle('on', k <= i));
      if (i !== capI) { capI = i; capTag.textContent = CAPS[i][0]; capTxt.textContent = CAPS[i][1]; }
    } }, 0)
      // 1. balayage du curseur : montage -> rendu (cadrage identique)
      .to(prox, { x: 100, duration: 1.4, ease: 'power1.inOut', onUpdate: () => {
        L('r1').style.clipPath = `inset(0 ${100 - prox.x}% 0 0)`; cut.style.left = prox.x + '%'; cut.style.opacity = prox.x > 0.5 && prox.x < 99.5 ? 1 : 0;
      } }, 0.3)
      // 2. montage / rendu suivants : fondu croisé
      .to(L('m2'), { opacity: 1, duration: 0.7 }, 2.1)
      .to(L('r2'), { opacity: 1, duration: 0.8 }, 3.1)
      .to(L('m3'), { opacity: 1, duration: 0.7 }, 4.2)
      .to(L('r3'), { opacity: 1, duration: 0.8 }, 5.2);
  },
};
