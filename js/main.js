import { createHeroScene } from './hero-scene.js';
import { CLIPS, CATEGORIES, SOCIALS, COLLECTIONS } from './data.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = window.matchMedia('(pointer: coarse)').matches;
const isSmall = () => window.innerWidth < 860;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const ICONS = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>',
  eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1.5 12S5.5 4.5 12 4.5 22.5 12 22.5 12 18.5 19.5 12 19.5 1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-8.5-5-8.5-11A4.8 4.8 0 0 1 12 6.7a4.8 4.8 0 0 1 8.5 2.8c0 6-8.5 11-8.5 11z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg>',
  fire: '<svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true" fill="currentColor"><path d="M12 2s5 4.5 5 10a5 5 0 0 1-10 0c0-2.6 1.6-4.2 1.6-4.2S9 10 10.6 10C10.6 6 12 2 12 2z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.7 15.1V8.9L15.5 12z"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.6 2h-3.4v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.1a6.4 6.4 0 1 0 5.4 6.3V8.6a8 8 0 0 0 4.7 1.5V6.7a4.7 4.7 0 0 1-4.7-4.7z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true" style="fill:none;stroke:#f5f5f5;stroke-width:2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="0.6" style="fill:#f5f5f5"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z"/></svg>',
};

/* ───────────────────────── loader ───────────────────────── */
const pctEl = $('.loader__pct');
const barEl = $('.loader__bar span');
let pct = 0;
const loaderTick = setInterval(() => {
  pct = Math.min(92, pct + Math.random() * 14);
  pctEl.textContent = Math.round(pct);
  barEl.style.width = pct + '%';
}, 120);
let revealed = false;
function revealSite() {
  if (revealed) return;
  revealed = true;
  clearInterval(loaderTick);
  pctEl.textContent = '100';
  barEl.style.width = '100%';
  setTimeout(() => {
    document.body.classList.remove('is-loading');
    setTimeout(() => document.body.classList.add('is-ready'), 250);
  }, reduceMotion ? 0 : 450);
}
window.addEventListener('load', () => setTimeout(revealSite, reduceMotion ? 0 : 600));
setTimeout(revealSite, 3500); // never block the page for long

/* ───────────────────────── hero scene ───────────────────────── */
const hero = $('#hero');
const canvas = $('.hero__canvas');
const heroContent = $('.hero__content');
const chapter = $('.hero__chapter');
const scrollCue = $('.scroll-cue');
let scene = null;
try {
  scene = createHeroScene(canvas, {
    quality: isSmall() || coarse ? 0.45 : 0.7,
    maxQuality: isSmall() || coarse ? 0.55 : 0.85,
    staticFrame: reduceMotion,
  });
} catch (e) {
  scene = null;
}
if (scene) {
  hero.classList.add('has-webgl');
  scene.start();
  const io = new IntersectionObserver(([en]) => {
    if (reduceMotion) return;
    en.isIntersecting && !document.hidden ? scene.start() : scene.stop();
  });
  io.observe(hero);
  document.addEventListener('visibilitychange', () => {
    if (reduceMotion) return;
    document.hidden ? scene.stop() : scene.start();
  });
  if (!coarse && !reduceMotion) {
    window.addEventListener('pointermove', (e) => {
      scene.setMouse((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    }, { passive: true });
  }
}

function heroProgress() {
  const r = hero.getBoundingClientRect();
  const span = Math.max(1, r.height - window.innerHeight);
  return Math.min(1, Math.max(0, -r.top / span));
}
const clamp01 = (v) => Math.min(1, Math.max(0, v));

/* ───────────────────────── scroll-driven UI ───────────────────────── */
const nav = $('.nav');
const toTop = $('.to-top');
const aboutTitle = $('[data-scrub]');
let words = [];
if (aboutTitle) {
  const text = aboutTitle.textContent.trim().split(/\s+/);
  aboutTitle.innerHTML = text.map((w) => `<span class="w${/VIRAL/.test(w) ? ' hot-word' : ''}">${esc(w)}</span>`).join(' ');
  words = $$('.w', aboutTitle);
}

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 40);

    // hero
    const p = heroProgress();
    if (scene) scene.setScroll(p);
    if (!reduceMotion) {
      const out = clamp01(p / 0.38);
      heroContent.style.opacity = String(1 - out);
      heroContent.style.transform = `translate3d(0, ${-out * 90}px, 0)`;
      const cin = clamp01((p - 0.42) / 0.2);
      const cout = clamp01((p - 0.86) / 0.14);
      chapter.style.opacity = String(cin * (1 - cout));
      chapter.style.transform = `translate3d(0, calc(-40% + ${(1 - cin) * 60 - cout * 60}px), 0)`;
      scrollCue.style.opacity = String(1 - clamp01(p / 0.12));
    }

    // about words
    if (words.length && !reduceMotion) {
      const r = aboutTitle.getBoundingClientRect();
      const vh = window.innerHeight;
      const prog = clamp01((vh * 0.85 - r.top) / (r.height + vh * 0.35));
      const n = Math.round(prog * words.length);
      words.forEach((w, i) => {
        w.classList.toggle('on', i < n);
        w.classList.toggle('hot', i < n && w.classList.contains('hot-word'));
      });
    }

    // back-to-top ring
    const max = document.documentElement.scrollHeight - window.innerHeight;
    toTop.style.setProperty('--off', String(138.2 * (1 - (max > 0 ? y / max : 0))));
  });
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();

toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

/* ───────────────────────── nav + mobile menu ───────────────────────── */
const burger = $('.nav__burger');
const menu = $('.mobile-menu');
burger.addEventListener('click', () => {
  const open = burger.getAttribute('aria-expanded') === 'true';
  burger.setAttribute('aria-expanded', String(!open));
  menu.hidden = open;
  document.body.style.overflow = open ? '' : 'hidden';
});
$$('a', menu).forEach((a) => a.addEventListener('click', () => {
  burger.setAttribute('aria-expanded', 'false');
  menu.hidden = true;
  document.body.style.overflow = '';
}));

/* ───────────────────────── clocks ───────────────────────── */
const hudClock = $('.hud__clock');
const feedClock = $('.feed-clock');
function tickClock() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  hudClock.textContent = `${hh}:${mm}`;
  feedClock.textContent = `· UPDATED ${hh}:${mm}:${ss}`;
}
tickClock();
setInterval(tickClock, 1000);
$('.year').textContent = new Date().getFullYear();

/* ───────────────────────── clips ───────────────────────── */
const stats = (c) => {
  const parts = [];
  if (c.views) parts.push(`<span>${ICONS.eye}${esc(c.views)}</span>`);
  if (c.likes) parts.push(`<span>${ICONS.heart}${esc(c.likes)}</span>`);
  if (c.sample) parts.push('<span class="badge-sample mono">SAMPLE DATA</span>');
  return parts.length ? `<div class="clip__stats mono">${parts.join('')}</div>` : '';
};

function clipCard(c, extraClass = '') {
  const size = c.size ? ` clip--${c.size}` : '';
  return `
  <article class="clip${size} ${extraClass}" data-cat="${esc(c.category)}" data-id="${esc(c.id)}">
    <button class="clip__media" data-open="${esc(c.id)}" aria-label="Play: ${esc(c.title)}">
      <img src="${esc(c.thumb)}" alt="" loading="lazy" decoding="async" width="1280" height="720" />
      ${c.video ? `<video muted loop playsinline preload="none" data-src="${esc(c.video)}"></video>` : ''}
      <span class="clip__tag mono">${esc(c.category)}</span>
      <span class="clip__play">${ICONS.play}</span>
      <span class="clip__dur mono">${esc(c.duration || '')}</span>
      <span class="clip__bar"><span></span></span>
    </button>
    <div class="clip__meta">
      <h3>${esc(c.title)}</h3>
      <p>${esc(c.desc)}</p>
      ${stats(c)}
    </div>
  </article>`;
}

const featuredClip = CLIPS.find((c) => c.featured) || CLIPS[0];
$('#featured').innerHTML = `
  <article class="clip" data-cat="${esc(featuredClip.category)}" data-id="${esc(featuredClip.id)}">
    <button class="clip__media" data-open="${esc(featuredClip.id)}" aria-label="Play featured clip: ${esc(featuredClip.title)}">
      <img src="${esc(featuredClip.thumb)}" alt="" loading="lazy" decoding="async" width="1280" height="720" />
      ${featuredClip.video ? `<video muted loop playsinline preload="none" data-src="${esc(featuredClip.video)}"></video>` : ''}
      <span class="clip__tag mono">${esc(featuredClip.category)}</span>
      <span class="clip__play">${ICONS.play}</span>
      <span class="clip__dur mono">${esc(featuredClip.duration || '')}</span>
      <span class="clip__bar"><span></span></span>
    </button>
    <div class="clip__meta">
      <p class="featured__label mono"><span class="live-dot"></span> FEATURED CLIP</p>
      <h3>${esc(featuredClip.title)}</h3>
      <p>${esc(featuredClip.desc)}</p>
      ${stats(featuredClip)}
      <button class="btn btn--primary" data-open="${esc(featuredClip.id)}">Watch now ${ICONS.play}</button>
    </div>
  </article>`;

const grid = $('#clip-grid');
grid.innerHTML = CLIPS.filter((c) => c !== featuredClip).map((c) => clipCard(c, 'reveal')).join('');

// filters
const filtersEl = $('.filters');
filtersEl.innerHTML = CATEGORIES.map((cat, i) =>
  `<button class="filter" role="tab" aria-selected="${i === 0}" data-filter="${esc(cat)}">${esc(cat)}</button>`).join('');
filtersEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.filter');
  if (!btn) return;
  $$('.filter', filtersEl).forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
  const cat = btn.dataset.filter;
  const cards = $$('.clip', grid);
  cards.forEach((c) => c.classList.add('is-leaving'));
  setTimeout(() => {
    cards.forEach((c) => {
      const show = cat === 'All' || c.dataset.cat === cat;
      c.classList.toggle('is-hidden', !show);
      c.classList.add('in');
    });
    requestAnimationFrame(() => cards.forEach((c) => c.classList.remove('is-leaving')));
  }, reduceMotion ? 0 : 280);
});

// hover previews (real videos only)
document.addEventListener('pointerover', (e) => {
  const card = e.target.closest('.clip');
  if (!card || coarse) return;
  const v = $('video', card);
  if (v) {
    if (!v.src) v.src = v.dataset.src;
    card.classList.add('is-previewing');
    v.play().catch(() => {});
  }
});
document.addEventListener('pointerout', (e) => {
  const card = e.target.closest('.clip');
  if (!card || card.contains(e.relatedTarget)) return;
  const v = $('video', card);
  if (v) { v.pause(); card.classList.remove('is-previewing'); }
});

/* ───────────────────────── trending ───────────────────────── */
const toNum = (s) => {
  if (!s) return 0;
  const m = String(s).match(/([\d.]+)\s*([KkMm]?)/);
  if (!m) return 0;
  return parseFloat(m[1]) * (m[2].toLowerCase() === 'm' ? 1e6 : m[2].toLowerCase() === 'k' ? 1e3 : 1);
};
const trending = [...CLIPS].sort((a, b) => toNum(b.views) - toNum(a.views)).slice(0, 7);
$('#rail-trending').innerHTML = trending.map((c, i) => `
  <button class="tcard" data-open="${esc(c.id)}" aria-label="Play: ${esc(c.title)}">
    <img src="${esc(c.thumb.replace('.webp', '-v.webp'))}" alt="" loading="lazy" decoding="async" />
    <span class="tcard__rank">${String(i + 1).padStart(2, '0')}</span>
    ${i < 3 ? `<span class="tcard__label mono">${ICONS.fire} TRENDING</span>` : ''}
    <span class="tcard__body">
      <span class="tcard__meta mono">${esc(c.category)}${c.views ? ' · ' + esc(c.views) + ' views' : ''}${c.sample ? ' · sample' : ''}</span>
      <h4>${esc(c.title)}</h4>
    </span>
  </button>`).join('');

const latest = [...CLIPS].reverse();
$('#rail-latest').innerHTML = latest.map((c, i) => `
  <button class="tcard" data-open="${esc(c.id)}" aria-label="Play: ${esc(c.title)}">
    <img src="${esc(c.thumb)}" alt="" loading="lazy" decoding="async" />
    ${i < 2 ? '<span class="tcard__label tcard__label--new mono">NEW</span>' : ''}
    <span class="tcard__body">
      <span class="tcard__meta mono">${esc(c.duration || '')} · ${esc(c.category)}${c.sample ? ' · sample' : ''}</span>
      <h4>${esc(c.title)}</h4>
    </span>
  </button>`).join('');

$('#collections').innerHTML = COLLECTIONS.map((c) => `
  <article class="coll reveal">
    <div class="coll__stack">${c.thumbs.map((t) => `<img src="${esc(t)}" alt="" loading="lazy" decoding="async" />`).join('')}</div>
    <h4>${esc(c.title)}</h4>
    <p>${esc(c.desc)}</p>
  </article>`).join('');

// rail arrows
$$('.carousel-nav .icon-btn').forEach((b) => b.addEventListener('click', () => {
  const rail = document.getElementById(b.dataset.target);
  rail.scrollBy({ left: Number(b.dataset.dir) * rail.clientWidth * 0.8, behavior: reduceMotion ? 'auto' : 'smooth' });
}));

// drag-to-scroll (mouse only; touch scrolls natively)
$$('.rail').forEach((rail) => {
  let down = false, startX = 0, startLeft = 0, moved = false;
  rail.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    down = true; moved = false; startX = e.clientX; startLeft = rail.scrollLeft;
  });
  window.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 5) { moved = true; rail.classList.add('is-dragging'); }
    rail.scrollLeft = startLeft - dx;
  });
  window.addEventListener('pointerup', () => {
    if (!down) return;
    down = false;
    setTimeout(() => rail.classList.remove('is-dragging'), 0);
  });
  rail.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
});

/* ───────────────────────── socials ───────────────────────── */
$('#social-grid').innerHTML = SOCIALS.map((s, i) => {
  const soon = !s.url;
  const tag = soon ? 'div' : 'a';
  const attrs = soon ? 'aria-disabled="true"' : `href="${esc(s.url)}" target="_blank" rel="noopener"`;
  return `
  <${tag} class="social social--${esc(s.id)} reveal${soon ? ' is-soon' : ''}" ${attrs} style="transition-delay:${i * 80}ms">
    <span class="social__icon">${ICONS[s.id] || ''}</span>
    <div>
      <h3 class="social__name">${esc(s.label)}</h3>
      <p class="social__handle mono">${esc(s.handle)}</p>
    </div>
    <span class="social__go">${soon ? 'Link coming soon' : esc(s.action)} ${soon ? '' : ICONS.arrow}</span>
  </${tag}>`;
}).join('');
$('#footer-socials').innerHTML = SOCIALS.filter((s) => s.url)
  .map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join('')
  || '<span style="color:var(--muted)">Coming soon</span>';

/* ───────────────────────── modal ───────────────────────── */
const modal = $('#modal');
const modalBody = $('.modal__body', modal);
function openClip(id) {
  const c = CLIPS.find((x) => x.id === id);
  if (!c) return;
  const follow = SOCIALS.find((s) => s.url);
  modalBody.innerHTML = c.video
    ? `<video src="${esc(c.video)}" poster="${esc(c.thumb)}" controls autoplay playsinline></video>`
    : `<div class="modal__soon">
         <img src="${esc(c.thumb)}" alt="" />
         <div>
           <p class="mono" style="color:var(--pink)">${esc(c.category)} · SAMPLE CLIP</p>
           <h3>${esc(c.title)}</h3>
           <p>This is a placeholder. The real clip lands here soon. Catch the latest drops on our socials.</p>
           ${follow ? `<a class="btn btn--primary" href="${esc(follow.url)}" target="_blank" rel="noopener">Watch on ${esc(follow.label)} ${ICONS.arrow}</a>` : ''}
         </div>
       </div>`;
  if (typeof modal.showModal === 'function') modal.showModal();
  else modal.setAttribute('open', '');
}
function closeModal() {
  const v = $('video', modalBody);
  if (v) v.pause();
  modal.close ? modal.close() : modal.removeAttribute('open');
  modalBody.innerHTML = '';
}
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-open]');
  if (t) { e.preventDefault(); openClip(t.dataset.open); }
});
$('.modal__close').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
modal.addEventListener('close', () => { modalBody.innerHTML = ''; });

/* ───────────────────────── logo tilt ───────────────────────── */
const tilt = $('[data-tilt]');
if (tilt && !coarse && !reduceMotion) {
  tilt.addEventListener('pointermove', (e) => {
    const r = tilt.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    tilt.style.transform = `rotateY(${(x - 0.5) * 18}deg) rotateX(${(0.5 - y) * 18}deg)`;
    tilt.style.setProperty('--gx', `${x * 100}%`);
    tilt.style.setProperty('--gy', `${y * 100}%`);
  });
  tilt.addEventListener('pointerleave', () => { tilt.style.transform = ''; });
}

/* ───────────────────────── reveal on scroll ───────────────────────── */
const revealIO = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('in'); revealIO.unobserve(en.target); }
  });
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
$$('.reveal').forEach((el, i) => {
  if (!el.style.transitionDelay && el.classList.contains('clip')) el.style.transitionDelay = `${(i % 3) * 90}ms`;
  revealIO.observe(el);
});
