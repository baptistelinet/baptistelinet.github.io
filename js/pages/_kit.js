// Outils partagés par les pages projet.
export const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
export const $$ = (root, sel) => [...root.querySelectorAll(sel)];
export const esc = (s = '') => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// <figure> avec image + légende. opts: {cls, eager, caption:false}
export function fig(im, opts = {}) {
  if (!im) return '';
  const cap = opts.caption === false ? '' : `<figcaption>${esc(im.caption)}</figcaption>`;
  const ratio = im.w && im.h ? `style="aspect-ratio:${im.w}/${im.h}"` : '';
  return `<figure class="k-fig ${opts.cls || ''}"><div class="k-img" ${ratio}><img src="${im.file}" alt="${esc(im.caption)}" ${im.w ? `width="${im.w}" height="${im.h}"` : ''} loading="${opts.eager ? 'eager' : 'lazy'}" decoding="async"></div>${cap}</figure>`;
}

// Découpe un texte en lettres (spans .k-ch) ou en mots (.k-w)
export function split(node, mode = 'chars') {
  const text = node.textContent; node.textContent = ''; node.setAttribute('aria-label', text);
  const parts = mode === 'words' ? text.split(/(\s+)/) : [...text];
  parts.forEach(p => {
    if (/^\s+$/.test(p) || p === ' ') { node.appendChild(document.createTextNode(p)); return; }
    const s = document.createElement('span'); s.className = mode === 'words' ? 'k-w' : 'k-ch'; s.textContent = p; s.setAttribute('aria-hidden', 'true');
    node.appendChild(s);
  });
  return [...node.querySelectorAll('.k-ch,.k-w')];
}

// Bloc titre standard (numéro, titre, type, méta). Chaque page peut l'utiliser ou faire le sien.
export function titleBlock(p, extra = '') {
  return `<header class="k-head">
    ${p.num && p.num !== '—' ? `<p class="k-num">Projet ${p.num}</p>` : ''}
    <h1 class="k-title">${esc(p.title)}</h1>
    <p class="k-kind">${esc(p.kind)}</p>
    ${p.meta?.length ? `<ul class="k-meta">${p.meta.map(m => `<li>${esc(m)}</li>`).join('')}</ul>` : ''}
    ${extra}
  </header>`;
}

// Apparition au défilement des éléments .k-reveal et des images .k-wipe (clip-path vers le haut)
export function autoReveal({ root, scroller, gsap, reduced }) {
  if (reduced) return;
  $$(root, '.k-reveal').forEach(el => gsap.from(el, { y: 30, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, scroller, start: 'top 88%' } }));
  $$(root, '.k-fig.k-wipe .k-img').forEach(el => gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power3.inOut', scrollTrigger: { trigger: el, scroller, start: 'top 85%' } }));
}
