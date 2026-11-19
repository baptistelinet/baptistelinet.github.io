import { esc, split } from './_kit.js';
// Maison californienne : « une journée de soleil »
// une seule image épinglée : la lumière traverse la journée, une ombre tourne, puis des recadrages sur les détails.

const fmt = (min) => { const h = Math.floor(min / 60), m = Math.floor(min % 60 / 5) * 5; return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'); };
// détails de la façade (coordonnées normalisées dans l'image) : x, y, largeur utile, zoom max
const DETAILS = [
  { label: 'Claustras bois', x: 0.431, y: 0.46, fw: 0.056, zmax: 1.9 },
  { label: 'Garde-corps vitré', x: 0.682, y: 0.425, fw: 0.26, zmax: 2.1 },
  { label: 'Carport', x: 0.267, y: 0.58, fw: 0.36, zmax: 1.9 },
];
const SUN_COLORS = ['#FFB45C', '#FFD79A', '#EAF2FF', '#FFE2B8', '#FF9C7A', '#F0809C'];

export default {
  mount(ctx) {
    const { root, scroller, gsap, ScrollTrigger, project: p, images: im, reduced } = ctx;
    const st = (o) => ({ scroller, ...o });
    const img = im[0];
    const IW = img.w, IH = img.h, OPX = 0.56;

    root.innerHTML = `
    <section class="ca-pin" id="caPin">
      <div class="ca-stage">
        <div class="ca-line" aria-hidden="true"></div>
        <div class="ca-clip">
          <div class="ca-zoom"><div class="ca-pic">
            <img class="ca-img" src="${img.file}" alt="${esc(img.caption)}. ${esc(img.note || '')}" width="${IW}" height="${IH}" loading="eager" decoding="async">
            <div class="ca-tint"></div><div class="ca-glow"></div><div class="ca-shadow"></div>
          </div></div>
          <div class="ca-grad"></div>
        </div>
        <header class="ca-title">
          <h1 class="ca-h1">${esc(p.title)}</h1>
          <div class="ca-refl" aria-hidden="true">${esc(p.title)}</div>
          <p class="ca-kind">Projet ${esc(p.num)} · ${esc(p.kind)}</p>
        </header>
        <div class="ca-sun" aria-hidden="true">
          <svg viewBox="0 0 240 130">
            <path class="ca-arc-bg" d="M14 114 A106 106 0 0 1 226 114"/>
            <path class="ca-arc" id="caArc" d="M14 114 A106 106 0 0 1 226 114"/>
            <line class="ca-ground" x1="2" y1="114" x2="238" y2="114"/>
            <circle class="ca-dot-halo" r="13"/><circle class="ca-dot" r="6.5"/>
          </svg>
          <span class="ca-time">08:00</span>
        </div>
        <div class="ca-legs">
          ${DETAILS.map((d, i) => `<p class="ca-leg"><b>0${i + 1}</b><span>${esc(d.label)}</span></p>`).join('')}
          <p class="ca-leg ca-leg-end"><b>·</b><span>${esc(img.caption)}</span></p>
        </div>
      </div>
    </section>
    <section class="ca-coda"><p>${esc(p.title)}</p><span>${esc(img.caption)}</span></section>`;

    const $ = (s) => root.querySelector(s);
    const $$ = (s) => [...root.querySelectorAll(s)];
    const stage = $('.ca-stage'), zoom = $('.ca-zoom'), tint = $('.ca-tint'), glow = $('.ca-glow'), shadow = $('.ca-shadow');
    const arc = $('#caArc'), dot = $('.ca-dot'), halo = $('.ca-dot-halo'), timeEl = $('.ca-time');
    const legs = $$('.ca-leg');

    (ctx.page || ctx.scroller).style.setProperty('--room', '#EFD9C9');
    (ctx.page || ctx.scroller).style.backgroundColor = '#EFD9C9';

    const arcLen = arc.getTotalLength();
    const placeSun = (d) => {
      const pt = arc.getPointAtLength(arcLen * d);
      dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y); halo.setAttribute('cx', pt.x); halo.setAttribute('cy', pt.y);
      arc.style.strokeDasharray = `${arcLen * d} ${arcLen}`;
      const t = fmt(480 + d * 720); if (timeEl.textContent !== t) timeEl.textContent = t;
    };
    placeSun(0);

    const tintCol = gsap.utils.interpolate(SUN_COLORS);
    const light = (d) => {
      const c = tintCol(d);
      tint.style.background = c;
      tint.style.opacity = (0.34 - 0.2 * Math.sin(Math.PI * d) ** 1.4).toFixed(3);
      const gx = 0.5 + 0.46 * Math.cos(Math.PI * (1 - d)), gy = 0.62 - 0.52 * Math.sin(Math.PI * d);
      glow.style.background = `radial-gradient(circle at ${(gx * 100).toFixed(1)}% ${(gy * 100).toFixed(1)}%, ${c} 0, rgba(255,255,255,0) 52%)`;
      glow.style.opacity = (0.62 - 0.3 * Math.sin(Math.PI * d)).toFixed(3);
      shadow.style.transform = `translate(-50%,-50%) rotate(${((d - 0.5) * 130).toFixed(1)}deg)`;
      shadow.style.opacity = (0.1 + 0.2 * Math.abs(1 - 2 * d) ** 1.3).toFixed(3);
      placeSun(d);
    };
    light(0);

    // cadrage « cover » : calcule la translation/échelle pour amener un point au centre
    const geom = () => {
      const W = stage.clientWidth, H = stage.clientHeight;
      const s = Math.max(W / IW, H / IH), dw = IW * s, dh = IH * s;
      return { W, H, dw, dh, ox: (W - dw) * OPX, oy: (H - dh) / 2 };
    };
    const focus = (d) => () => {
      const g = geom();
      const z = Math.max(1.5, Math.min(d.zmax, 0.92 * g.W / (d.fw * g.dw)));
      const px = g.ox + d.x * g.dw, py = g.oy + d.y * g.dh;
      return { scale: z, x: Math.min(0, Math.max(g.W * (1 - z), g.W / 2 - px * z)), y: Math.min(0, Math.max(g.H * (1 - z), g.H / 2 - py * z)) };
    };
    const fit = () => { const g = geom(); const z = Math.min(1, g.W / g.dw, g.H / g.dh); return { scale: z, x: (g.W - g.dw * z) / 2 - g.ox * z + 0, y: (g.H - g.dh * z) / 2 - g.oy * z }; };
    const fn = (f, k) => () => f()[k];

    const pic = $('.ca-pic');
    const sizePic = () => { const g = geom(); Object.assign(pic.style, { width: g.dw + 'px', height: g.dh + 'px', left: g.ox + 'px', top: g.oy + 'px' }); };
    sizePic();
    ScrollTrigger.addEventListener('refreshInit', sizePic);
    ctx.signal.addEventListener('abort', () => ScrollTrigger.removeEventListener('refreshInit', sizePic));

    if (reduced) {
      root.classList.add('is-static');
      light(0.25);
      return;
    }

    // ----- ouverture : la ligne s'ouvre en image, le titre se reflète -----
    const letters = split($('.ca-h1'), 'words');
    gsap.set('.ca-clip', { clipPath: 'inset(50% 0% 50% 0%)' });
    gsap.set('.ca-line', { scaleX: 0, opacity: 1 });
    gsap.set(zoom, { transformOrigin: '0 0' });
    gsap.set(letters, { yPercent: 40, opacity: 0 });
    gsap.set('.ca-refl', { opacity: 0 });
    gsap.set('.ca-kind,.ca-sun', { opacity: 0 });
    gsap.set('.ca-img', { scale: 1.12 });
    gsap.timeline({ delay: 0.35 })
      .to('.ca-line', { scaleX: 1, duration: 0.35, ease: 'power3.out' }, 0)
      .to('.ca-clip', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power3.inOut' }, 0.25)
      .to('.ca-line', { opacity: 0, duration: 0.3 }, 0.9)
      .to('.ca-img', { scale: 1, duration: 1.6, ease: 'expo.out' }, 0.25)
      .to(letters, { yPercent: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.1 }, 0.8)
      .to('.ca-refl', { opacity: 0.15, duration: 0.9, ease: 'power2.out' }, 1.0)
      .to('.ca-kind,.ca-sun', { opacity: 1, duration: 0.6, stagger: 0.1 }, 1.1);

    // ----- une journée au défilement -----
    gsap.set(legs, { opacity: 0, y: 14 });
    const day = { d: 0 };
    const tl = gsap.timeline({ defaults: { ease: 'none' },
      scrollTrigger: st({ trigger: '#caPin', start: 'top top', end: '+=440%', pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true }) });
    tl.to(day, { d: 1, duration: 10, onUpdate: () => light(day.d) }, 0)
      .to('.ca-title', { yPercent: -18, opacity: 0, duration: 0.9 }, 0.15)
      .to('.ca-grad', { opacity: 0, duration: 0.9 }, 0.15);
    const seg = [1.3, 3.5, 5.7];   // début de chaque zoom
    DETAILS.forEach((d, i) => {
      const t0 = seg[i];
      tl.to(zoom, { scale: fn(focus(d), 'scale'), x: fn(focus(d), 'x'), y: fn(focus(d), 'y'), duration: 0.8, ease: 'power2.inOut' }, t0)
        .to(legs[i], { opacity: 1, y: 0, duration: 0.4 }, t0 + 0.6)
        .to(legs[i], { opacity: 0, y: -10, duration: 0.3 }, t0 + 1.7);
    });
    tl.to(zoom, { scale: fn(fit, 'scale'), x: fn(fit, 'x'), y: fn(fit, 'y'), duration: 1, ease: 'power2.inOut' }, 7.9)
      .to('.ca-sun', { opacity: 0, duration: 0.5 }, 8.1) // HUD blanc illisible hors de l'image une fois le cadre entier rétabli
      .to(legs[3], { opacity: 1, y: 0, duration: 0.4 }, 8.7)
      .to({}, { duration: 1.1 }, 8.9);
    // fond de page : pêche -> pêche rosée
    gsap.to(ctx.page || ctx.scroller, { backgroundColor: '#E5CBB6', ease: 'none',
      scrollTrigger: st({ trigger: '#caPin', start: 'top top', end: '+=440%', scrub: 0.6 }),
      onUpdate() { (ctx.page || ctx.scroller).style.setProperty('--room', (ctx.page || ctx.scroller).style.backgroundColor); } });

    gsap.from('.ca-coda p,.ca-coda span', { y: 24, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12, scrollTrigger: st({ trigger: '.ca-coda', start: 'top 85%' }) });
  },
};
