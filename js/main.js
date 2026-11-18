import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { ROOMS, ORDER } from './projects.js';

const gsap = window.gsap;
gsap.ticker.lagSmoothing(0);
const $ = (id) => document.getElementById(id);
const body = document.body;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;
if (finePointer) body.classList.add('pointer-fine');
else document.getElementById('hint').textContent = 'Glissez pour parcourir · touchez une pièce';

/* ---------- Rendu ---------- */
const canvas = $('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, finePointer ? 2 : 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const BG = new THREE.Color('#EFECE6');
const scene = new THREE.Scene();
scene.background = BG;

const hemi = new THREE.HemisphereLight('#fffaf1', '#e6dccb', 2.6);
scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff3e2', 2.3);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 120 });
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.025;
sun.shadow.radius = 3;
scene.add(sun, sun.target);

// « Lampe d'architecte » qui suit la pièce survolée
const lamp = new THREE.SpotLight('#ffe7cf', 0, 30, 0.42, 0.9, 0);
lamp.position.set(0, 12, 0);
scene.add(lamp, lamp.target);

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 400);

/* ---------- Texture liège procédurale ---------- */
function corkTexture() {
  const S = 1024, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d');
  g.fillStyle = '#dccdb4'; g.fillRect(0, 0, S, S);
  // granulés de liège : beaucoup de petits grains, contraste faible
  for (let i = 0; i < 60000; i++) {
    const x = Math.random() * S, y = Math.random() * S, r = Math.random() * 1.6 + 0.4;
    g.fillStyle = Math.random() < 0.55 ? `rgba(135,96,58,${0.05 + Math.random() * 0.1})` : `rgba(250,240,220,${0.06 + Math.random() * 0.12})`;
    g.beginPath(); g.ellipse(x, y, r, r * (0.5 + Math.random() * 0.5), Math.random() * 3, 0, 7); g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/* ---------- Chargement ---------- */
const draco = new DRACOLoader().setDecoderPath('vendor/draco/');
if (window.DRACO_JS) draco.setDecoderConfig({ type: 'js' });
const loader = new GLTFLoader().setDRACOLoader(draco);
const fill = $('loadFill');

const rooms = {};          // id -> {meshes, walls, props, floor, box, center, k}
const pickables = [];
const letters = [];        // BAPTISTE
let subtitle = null, subLine = null;

// Sous-titre gravé sur le socle, dessiné ici pour pouvoir le modifier sans repasser par Blender
const SUBTITLE = "ARCHITECTE D'INTÉRIEUR";
function makeSubtitle(ref) {
  const H = 0.5, px = 160, c = document.createElement('canvas'), g = c.getContext('2d');
  const font = `500 ${px * 0.78}px Jost, sans-serif`, spacing = px * 0.16;
  g.font = font;
  const chars = [...SUBTITLE], widths = chars.map(ch => g.measureText(ch).width);
  const textW = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  c.width = Math.ceil(textW) + 8; c.height = px;
  g.font = font; g.fillStyle = '#2B2622'; g.textBaseline = 'alphabetic';
  let x = 4; chars.forEach((ch, i) => { g.fillText(ch, x, px * 0.86); x += widths[i] + spacing; });
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const W = H * c.width / c.height;
  const geo = new THREE.PlaneGeometry(W, H); geo.translate(W / 2, H / 2, 0); geo.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  m.position.set(ref.position.x, 0.012, ref.position.z + 0.12);
  return m;
}
let homeHalfH = 10, modelBox = new THREE.Box3(), baseQuat = new THREE.Quaternion();
const view = { target: new THREE.Vector3(), zoom: 1, q: new THREE.Quaternion(), pan: 0 };

document.fonts.load('500 40px Jost').catch(() => {}).finally(() => loader.load(window.MODEL_URL || 'assets/maison-linet.glb', (gltf) => {
  const root = gltf.scene;
  scene.add(root);
  root.updateMatrixWorld(true);

  const camNode = root.getObjectByName('CamAxo');
  camNode.getWorldQuaternion(baseQuat);

  // 1. Sols = pièces
  root.traverse((o) => {
    if (!o.isMesh) return;
    const m = o.name.match(/^floor_(.+)$/);
    if (m && ROOMS[m[1]]) {
      const box = new THREE.Box3().setFromObject(o);
      rooms[m[1]] = { id: m[1], floor: o, meshes: [], walls: [], props: [], box, center: box.getCenter(new THREE.Vector3()), k: 0, lift: 0 };
    }
  });

  // 2. Rattachement des murs et objets à leur pièce
  const tmpBox = new THREE.Box3(), c = new THREE.Vector3();
  root.traverse((o) => {
    if (!o.isMesh) return;
    o.material = o.material.clone();
    o.material.userData.base = o.material.color.clone();
    o.castShadow = true; o.receiveShadow = true;
    const n = o.name;
    if (n === 'socle') {
      o.castShadow = false;
      const t = corkTexture(); t.repeat.set(3, 3);
      o.material.map = t; o.material.color.set('#ffffff'); o.material.userData.base = o.material.color.clone();
      o.material.roughness = 0.95;
      modelBox.setFromObject(o);
      return;
    }
    if (/^baptiste_\d/.test(n)) { o.castShadow = false; letters.push(o); return; }
    if (n === 'sous_titre') { o.visible = false; subLine = o; return; }
    if (/^(echelle|fleche_nord$|N$)/.test(n)) { o.castShadow = false; return; }
    if (n.startsWith('floor_')) { o.castShadow = false; const r = rooms[n.slice(6)]; if (r) attach(r, o, 'floor'); return; }
    const w = n.match(/^wall_(.+?)_\d+(_poche)?$/);
    if (w && rooms[w[1]]) { attach(rooms[w[1]], o, 'wall'); return; }
    // objet : pièce dont le sol contient son centre
    tmpBox.setFromObject(o).getCenter(c);
    let best = null, bestD = Infinity;
    for (const r of Object.values(rooms)) {
      const inside = c.x >= r.box.min.x - 0.05 && c.x <= r.box.max.x + 0.05 && c.z >= r.box.min.z - 0.05 && c.z <= r.box.max.z + 0.05;
      const d = (inside ? 0 : 100) + Math.hypot(c.x - r.center.x, c.z - r.center.z);
      if (d < bestD) { bestD = d; best = r; }
    }
    if (best) attach(best, o, 'prop');
  });
  function attach(r, o, kind) {
    o.userData.room = r.id; r.meshes.push(o); pickables.push(o);
    if (kind === 'wall') r.walls.push(o);
    if (kind === 'prop') { r.props.push(o); o.userData.y0 = o.position.y; }
  }

  // Boîte globale (socle + texte)
  modelBox.expandByObject(root.getObjectByName('baptiste_0_B'));
  const mc = modelBox.getCenter(new THREE.Vector3());
  view.target.copy(mc).setY(0);
  view.q.copy(baseQuat);
  sun.position.set(mc.x - 10, 26, mc.z + 12);
  sun.target.position.copy(mc);
  sun.shadow.camera.updateProjectionMatrix();

  if (subLine) { subtitle = makeSubtitle(subLine); scene.add(subtitle); }
  resize();
  buildIndex();
  body.classList.add('ready');
  fill.style.width = '100%';
  intro();
}, (e) => { if (e.total) fill.style.width = (e.loaded / e.total * 90).toFixed(0) + '%'; },
(err) => { console.error(err); $('loader').innerHTML = '<span>Impossible de charger la maquette.</span>'; }));

/* ---------- Cadrage ---------- */
let modelW = 1, modelH = 1;
function resize() {
  const w = innerWidth, h = innerHeight, a = w / h;
  renderer.setSize(w, h, false);
  // étendue du socle vue depuis la caméra axo
  const inv = baseQuat.clone().invert();
  const pts = [];
  for (let i = 0; i < 8; i++) pts.push(new THREE.Vector3(i & 1 ? modelBox.max.x : modelBox.min.x, i & 2 ? modelBox.max.y : modelBox.min.y, i & 4 ? modelBox.max.z : modelBox.min.z).sub(view.target).applyQuaternion(inv));
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  modelW = Math.max(...xs) - Math.min(...xs); modelH = Math.max(...ys) - Math.min(...ys);
  const portrait = a < 0.9;
  homeHalfH = portrait ? modelH * 1.25 : Math.max(modelH / 2, modelW / 2 / a) * 1.12;
  camera.left = -homeHalfH * a; camera.right = homeHalfH * a; camera.top = homeHalfH; camera.bottom = -homeHalfH;
  camera.updateProjectionMatrix();
  if (portrait && !resize.done) { view.pan = -1e9; resize.done = true; }
  clampPan();
}
addEventListener('resize', resize);
function clampPan() {
  const halfVisW = homeHalfH * innerWidth / innerHeight / view.zoom;
  const lim = Math.max(0, modelW / 2 - halfVisW * 0.85);
  view.pan = Math.max(-lim, Math.min(lim, view.pan));
}

/* ---------- Pointeur, survol ---------- */
const pointer = new THREE.Vector2(9, 9), smoothP = new THREE.Vector2();
const ray = new THREE.Raycaster();
let hovered = null, activeRoom = null, introDone = false, pageOpen = false, busy = false;
const cursor = $('cursor'), cursorLbl = $('cursorLbl'), tag = $('tag');

addEventListener('pointermove', (e) => {
  pointer.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  cursor.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
});

function pick() {
  if (!introDone || pageOpen || busy) return null;
  ray.setFromCamera(pointer, camera);
  const hit = ray.intersectObjects(pickables, false)[0];
  return hit ? hit.object.userData.room : null;
}
function setHover(id) {
  if (id === hovered) return;
  hovered = id;
  body.classList.toggle('hovering', !!id);
  document.querySelectorAll('.index a').forEach(a => a.classList.toggle('on', a.dataset.room === id));
  if (id) {
    const p = ROOMS[id];
    $('tagNum').textContent = p.num; $('tagTitle').textContent = p.title; $('tagKind').textContent = p.kind;
    cursorLbl.textContent = 'Entrer';
    canvas.style.cursor = 'pointer';
  } else { cursorLbl.textContent = ''; canvas.style.cursor = ''; }
  tag.classList.toggle('on', !!id);
}

// Clic / tap (avec glisser horizontal en portrait)
let down = null;
canvas.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, pan: view.pan, moved: false }; });
addEventListener('pointermove', (e) => {
  if (!down || pageOpen) return;
  const dx = e.clientX - down.x;
  if (Math.abs(dx) > 8) down.moved = true;
  if (down.moved && innerWidth / innerHeight < 0.9) {
    const unitsPerPx = (homeHalfH * 2 / view.zoom) / innerHeight;
    view.pan = down.pan - dx * unitsPerPx; clampPan();
  }
});
addEventListener('pointerup', (e) => {
  if (!down) return;
  const wasTap = !down.moved; down = null;
  if (!introDone) { skipIntro(); return; }
  if (!wasTap || pageOpen) return;
  pointer.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  const id = pick();
  if (id) location.hash = '#/' + ROOMS[id].slug;
});

/* ---------- Index HTML (accessibilité + accès direct) ---------- */
function buildIndex() {
  const ol = $('indexList');
  ol.innerHTML = ORDER.map(id => `<li><a href="#/${ROOMS[id].slug}" data-room="${id}"><b>${ROOMS[id].num}</b>${ROOMS[id].title}</a></li>`).join('');
  ol.querySelectorAll('a').forEach(a => {
    a.addEventListener('mouseenter', () => setHover(a.dataset.room));
    a.addEventListener('focus', () => setHover(a.dataset.room));
    a.addEventListener('mouseleave', () => setHover(null));
    a.addEventListener('click', () => toggleIndex(false));
  });
}
const indexEl = $('index'), indexBtn = $('indexBtn');
function toggleIndex(v = !indexEl.classList.contains('open')) {
  indexEl.classList.toggle('open', v); indexBtn.setAttribute('aria-expanded', v);
}
indexBtn.addEventListener('click', () => toggleIndex());
let indexHover = false;
indexEl.addEventListener('mouseenter', () => indexHover = true);
indexEl.addEventListener('mouseleave', () => indexHover = false);

/* ---------- Animation d'entrée ---------- */
let introTl = null;
function intro() {
  const ids = ORDER;
  ids.forEach(id => rooms[id].walls.forEach(w => w.scale.y = 0.001));
  ids.forEach(id => rooms[id].props.forEach(p => { p.position.y = p.userData.y0 + 4; p.visible = false; }));
  letters.forEach(l => { l.userData.y0 = l.position.y; l.position.y += 6; l.rotation.x = -1.3; l.visible = false; });
  if (subtitle) subtitle.scale.x = 0.001;
  view.zoom = 0.86;

  introTl = gsap.timeline({ onComplete: endIntro });
  introTl.to(view, { zoom: 1, duration: 2.8, ease: 'power2.out' }, 0);
  ids.forEach((id, i) => {
    introTl.to(rooms[id].walls.map(w => w.scale), { y: 1, duration: 0.7, ease: 'power3.out' }, 0.15 + i * 0.07);
  });
  ids.forEach((id, i) => {
    rooms[id].props.forEach((p, j) => {
      introTl.set(p, { visible: true }, 0.9 + i * 0.06 + j * 0.01);
      introTl.to(p.position, { y: p.userData.y0, duration: 0.55, ease: 'bounce.out' }, 0.9 + i * 0.06 + j * 0.01);
    });
  });
  letters.forEach((l, i) => {
    const t = 1.6 + i * 0.09;
    introTl.set(l, { visible: true }, t);
    introTl.to(l.position, { y: l.userData.y0, duration: 0.5, ease: 'power3.in' }, t);
    introTl.to(l.rotation, { x: 0, duration: 0.5, ease: 'power2.in' }, t);
    introTl.to(l.scale, { y: 1, duration: 0.01 }, t + 0.5);
  });
  if (subtitle) introTl.to(subtitle.scale, { x: 1, duration: 0.7, ease: 'power3.inOut' }, 2.4);
  if (reduced) introTl.progress(1);
}
function skipIntro() { if (introTl && !introDone) introTl.progress(1); }
function endIntro() {
  introDone = true; body.classList.add('intro-done');
  route();
}

/* ---------- Ouverture d'une pièce ---------- */
const page = $('page');
const topQuat = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), new THREE.Vector3(0, 0, -1)));

function roomScreenRect(r) {
  const b = r.box, pts = [[b.min.x, b.min.z], [b.max.x, b.min.z], [b.min.x, b.max.z], [b.max.x, b.max.z]];
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, z] of pts) {
    const v = new THREE.Vector3(x, 0, z).project(camera);
    const sx = (v.x + 1) / 2 * innerWidth, sy = (1 - v.y) / 2 * innerHeight;
    x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy);
  }
  const W = innerWidth, H = innerHeight, cl = (v, m) => Math.max(0, Math.min(m, v));
  return [cl(y0, H), cl(W - x1, W), cl(H - y1, H), cl(x0, W)];
}

/* ---------- Pages projet : un module par projet (js/pages/<slug>.js) ---------- */
const ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);
const pRoot = $('pRoot');
let pageCtx = null, pageAbort = null;
const cssLoaded = new Set();
function ensureCss(href) {
  if (cssLoaded.has(href)) return Promise.resolve();
  cssLoaded.add(href);
  return new Promise((res) => {
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href;
    l.onload = l.onerror = res; document.head.appendChild(l);
  });
}
function loadPage(id) {
  const p = ROOMS[id];
  return Promise.all([
    import(`./pages/${p.slug}.js`).catch(() => import('./pages/_default.js')),
    fetch(`img/${p.slug}/_images.json`).then(r => (r.ok ? r.json() : [])).catch(() => []),
    ensureCss(`css/pages/${p.slug}.css`),
  ]).then(([mod, images]) => ({ mod: mod.default, images }));
}
function fillNav(id) {
  const i = ORDER.indexOf(id);
  const prev = ROOMS[ORDER[(i - 1 + ORDER.length) % ORDER.length]], next = ROOMS[ORDER[(i + 1) % ORDER.length]];
  $('pPrev').innerHTML = `<small>Pièce précédente</small>${prev.title}`; $('pPrev').href = '#/' + prev.slug;
  $('pNext').innerHTML = `<small>Pièce suivante</small>${next.title}`; $('pNext').href = '#/' + next.slug;
}
function mountPage(id, { mod, images }) {
  unmountPage();
  const p = ROOMS[id];
  page.style.setProperty('--room', p.color);
  page.style.removeProperty('background');
  page.dataset.slug = p.slug;
  page.classList.toggle('dark', p.color.toLowerCase() === '#2b2622');
  pRoot.className = `pg pg-${p.slug}`;
  pRoot.innerHTML = '';
  page.scrollTop = 0;
  fillNav(id);
  try { const v = JSON.parse(localStorage.getItem('linet-visited') || '[]'); if (!v.includes(p.slug)) { v.push(p.slug); localStorage.setItem('linet-visited', JSON.stringify(v)); } } catch (e) {}
  pageAbort = new AbortController();
  const ctx = { root: pRoot, scroller: page, gsap, ScrollTrigger, project: p, images, reduced, signal: pageAbort.signal };
  pageCtx = gsap.context((self) => {
    ctx.add = (fn) => pageCtx ? pageCtx.add(fn) : fn();
    mod.mount(ctx);
  }, page);
  requestAnimationFrame(() => ScrollTrigger.refresh());
}
function unmountPage() {
  if (pageAbort) { pageAbort.abort(); pageAbort = null; }
  if (pageCtx) { pageCtx.revert(); pageCtx = null; }
  page.style.removeProperty('--room'); page.style.removeProperty('background');
  pRoot.innerHTML = '';
}

function openRoom(id, instant = false) {
  const r = rooms[id]; if (!r) return;
  busy = true; activeRoom = id; setHover(null); toggleIndex(false);
  const ready = loadPage(id);
  const a = innerWidth / innerHeight;
  const size = r.box.getSize(new THREE.Vector3());
  const z = Math.min(homeHalfH * 2 * a / size.x, homeHalfH * 2 / size.z) * 0.8;
  const from = { t: 0 }, q0 = view.q.clone(), t0 = view.target.clone(), z0 = Math.log(view.zoom), z1 = Math.log(z), pan0 = view.pan;
  const tl = gsap.timeline({ onComplete: () => { busy = false; } });
  const D = instant || reduced ? 0.01 : 1.1;
  // pression
  if (!instant) tl.to(r, { lift: -0.06, duration: 0.12, ease: 'power2.out' }).to(r, { lift: 0, duration: 0.25 }, '>');
  tl.to(from, {
    t: 1, duration: D, ease: 'expo.inOut',
    onUpdate: () => {
      view.q.slerpQuaternions(q0, topQuat, from.t);
      view.target.lerpVectors(t0, r.center, from.t);
      view.zoom = Math.exp(z0 + (z1 - z0) * from.t);
      view.pan = pan0 * (1 - from.t);
    },
  }, instant ? 0 : 0.12);
  tl.add(() => {
    ready.then((pg) => {
      mountPage(id, pg);
      body.classList.add('has-page'); pageOpen = true;
      page.classList.add('open'); page.setAttribute('aria-hidden', 'false');
      const [a0, a1, a2, a3] = roomScreenRect(r), ins = { a0, a1, a2, a3 };
      const setClip = () => { page.style.clipPath = `inset(${ins.a0}px ${ins.a1}px ${ins.a2}px ${ins.a3}px)`; };
      setClip();
      gsap.to(ins, { a0: 0, a1: 0, a2: 0, a3: 0, duration: instant ? 0.01 : 0.6, ease: 'power3.inOut', onUpdate: setClip });
    });
  }, instant ? D : D * 0.85 + 0.12);
}

function closeRoom() {
  if (!activeRoom) return;
  const r = rooms[activeRoom]; busy = true;
  const from = { t: 0 }, q0 = view.q.clone(), t0 = view.target.clone(), z0 = Math.log(view.zoom);
  const home = homeTarget();
  gsap.to(page, { opacity: 0, duration: 0.3, onComplete: () => {
    page.classList.remove('open'); page.style.opacity = ''; page.setAttribute('aria-hidden', 'true');
    body.classList.remove('has-page'); pageOpen = false; unmountPage();
  } });
  gsap.to(from, {
    t: 1, duration: reduced ? 0.01 : 0.95, ease: 'expo.inOut', delay: 0.1,
    onUpdate: () => {
      view.q.slerpQuaternions(q0, baseQuat, from.t);
      view.target.lerpVectors(t0, home, from.t);
      view.zoom = Math.exp(z0 * (1 - from.t));
    },
    onComplete: () => { busy = false; activeRoom = null; },
  });
}
function homeTarget() { return modelBox.getCenter(new THREE.Vector3()).setY(0); }

$('back').addEventListener('click', () => { location.hash = '#/'; });
addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (pageOpen) location.hash = '#/'; toggleIndex(false); } });

/* ---------- Routage (#/slug) ---------- */
function route() {
  if (!introDone) return;
  const slug = location.hash.replace(/^#\/?/, '');
  const id = ORDER.find(k => ROOMS[k].slug === slug);
  if (id && id !== activeRoom) {
    if (activeRoom) { // passage direct d'une pièce à l'autre
      page.classList.remove('open'); body.classList.remove('has-page'); pageOpen = false; unmountPage();
      activeRoom = null; openRoom(id, false);
    } else openRoom(id);
  } else if (!id && activeRoom) closeRoom();
}
addEventListener('hashchange', route);

/* ---------- Boucle ---------- */
const right = new THREE.Vector3(), fwd = new THREE.Vector3(), tmp = new THREE.Vector3(), white = new THREE.Color('#ffffff');
const qPar = new THREE.Quaternion(), eul = new THREE.Euler();
const warm = new THREE.Color('#ff8a50');
let dimAll = 0;
const clock = new THREE.Clock();

function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);
  if (introDone && !busy && !pageOpen && !indexHover) setHover(pick());

  // parallaxe légère, seulement en vue d'ensemble
  const parAmt = activeRoom ? 0 : 1;
  smoothP.lerp(finePointer && !pageOpen ? pointer.clone().clampScalar(-1, 1) : new THREE.Vector2(), 1 - Math.pow(0.002, dt));
  eul.set(smoothP.y * 0.025 * parAmt, -smoothP.x * 0.035 * parAmt, 0, 'YXZ');
  qPar.setFromEuler(eul);
  camera.quaternion.copy(view.q).multiply(qPar);
  fwd.set(0, 0, -1).applyQuaternion(camera.quaternion);
  right.set(1, 0, 0).applyQuaternion(view.q);
  tmp.copy(view.target).addScaledVector(right, view.pan);
  camera.position.copy(tmp).addScaledVector(fwd, -80);
  camera.zoom = view.zoom;
  camera.updateProjectionMatrix();

  // éclairage des pièces
  const ease = 1 - Math.pow(0.0005, dt);
  dimAll += ((hovered ? 1 : 0) - dimAll) * ease;
  for (const id in rooms) {
    const r = rooms[id];
    r.k += ((hovered === id ? 1 : 0) - r.k) * ease;
    const dim = dimAll * (1 - r.k) * 0.38;
    for (const m of r.meshes) {
      const mat = m.material;
      if (mat.name === 'poche' || mat.name === 'encre') continue;
      mat.color.copy(mat.userData.base).lerp(BG, dim);
      if (!mat.userData.em) mat.userData.em = mat.emissive.clone();
      mat.emissive.copy(mat.userData.em).lerp(warm, r.k * 0.1);
    }
    for (const p of r.props) if (introDone) p.position.y = p.userData.y0 + r.k * 0.12 + r.lift;
    for (const w of r.walls) if (introDone) w.position.y = r.lift;
  }
  if (hovered) {
    const c = rooms[hovered].center;
    lamp.target.position.lerp(c, ease);
    lamp.position.lerp(tmp.set(c.x - 2, 10, c.z + 2), ease);
  }
  lamp.intensity += ((hovered ? 2.2 : 0) - lamp.intensity) * ease;

  // étiquette
  if (hovered) {
    const c = rooms[hovered].center;
    const v = tmp.set(c.x, 1.1, rooms[hovered].box.min.z).project(camera);
    tag.style.transform = `translate(${(v.x + 1) / 2 * innerWidth}px, ${(1 - v.y) / 2 * innerHeight}px) translate(-50%,-100%)`;
  }

  if (!pageOpen || busy) renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
