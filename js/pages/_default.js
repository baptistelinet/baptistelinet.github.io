import { titleBlock, fig, autoReveal } from './_kit.js';
// Page générique, utilisée si un projet n'a pas encore sa page dédiée.
export default {
  mount(ctx) {
    const { root, project: p, images } = ctx;
    root.innerHTML = titleBlock(p) +
      (p.text ? `<section class="k-sec"><p class="k-lead k-reveal">${p.text}</p></section>` : '') +
      `<section class="k-sec k-grid2">${images.map((im, i) => fig(im, { cls: 'k-wipe' + (i % 3 === 0 ? ' wide' : ''), eager: i < 2 })).join('')}</section>`;
    autoReveal(ctx);
  },
};
