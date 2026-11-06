import { createHeroScene } from './hero-scene.js';
import { CLIPS, CATEGORIES, SOCIALS } from './data.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
const isSmall = () => window.innerWidth < 860;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const ICONS = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>',
  eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1.5 12S5.5 4.5 12 4.5 22.5 12 22.5 12 18.5 19.5 12 19.5 1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-8.5-5-8.5-11A4.8 4.8 0 0 1 12 6.7a4.8 4.8 0 0 1 8.5 2.8c0 6-8.5 11-8.5 11z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg>',
  up: '<svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M4 16l6-6 4 4 6-6M14 8h6v6"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.7 15.1V8.9L15.5 12z"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.6 2h-3.4v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.1a6.4 6.4 0 1 0 5.4 6.3V8.6a8 8 0 0 0 4.7 1.5V6.7a4.7 4.7 0 0 1-4.7-4.7z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true" style="fill:none;stroke:#f5f5f5;stroke-width:2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="0.6" style="fill:#f5f5f5"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z"/></svg>',
};
const vThumb = (t) => t.replace(/\.webp$/, '-v.webp');
const statsHTML = (c) => {
  const p = [];
  if (c.views) p.push(`<span>${ICONS.eye}${esc(c.views)}</span>`);
  if (c.likes) p.push(`<span>${ICONS.heart}${esc(c.likes)}</span>`);
  if (c.sample) p.push('<span class="badge-sample mono">SAMPLE DATA</span>');
  return p.length ? `<div class="stats mono">${p.join('')}</div>` : '';
};

/* ═════════════════════════ LOADER ═════════════════════════ */
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
window.addEventListener('load', () => setTimeout(revealSite, reduceMotion ? 0 : 500));
setTimeout(revealSite, 3500);

/* ═════════════════════════ CUSTOM CURSOR ═════════════════════════ */
const cursor = $('.cursor');
const mouse = { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0 };
if (finePointer && !reduceMotion) {
  document.documentElement.classList.add('has-cursor');
  const ring = $('.cursor__ring'), dot = $('.cursor__dot'), label = $('.cursor__label');
  let rx = mouse.x, ry = mouse.y;
  window.addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  window.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
  window.addEventListener('pointerup', () => cursor.classList.remove('is-down'));
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('[data-cursor], a, button, [data-open]');
    if (!t) { cursor.classList.remove('is-hover'); return; }
    label.textContent = t.dataset.cursor || (t.matches('[data-open]') ? 'PLAY' : 'OPEN');
    cursor.classList.add('is-hover');
  });
  document.addEventListener('pointerleave', () => { cursor.style.opacity = '0'; });
  document.addEventListener('pointerenter', () => { cursor.style.opacity = '1'; });
  (function loop() {
    rx += (mouse.x - rx) * 0.2;
    ry += (mouse.y - ry) * 0.2;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    dot.style.transform = `translate(${mouse.x}px, ${mouse.y}px) translate(-50%, -50%)`;
    label.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(loop);
  })();
} else {
  window.addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
}

/* ═════════════════════════ HERO: THE FEED ═════════════════════════ */
const feed = $('#hero');
const world = $('.feed__world');
const screensEl = $('.feed__screens');
const intro = $('.feed__intro');
const scrollCue = $('.scroll-cue');
const depthVal = $('.depth__val');
const depthBar = $('.depth__bar span');

// 3D backdrop
let scene = null;
try {
  scene = createHeroScene($('.feed__canvas'), {
    quality: isSmall() || !finePointer ? 0.42 : 0.6,
    maxQuality: isSmall() || !finePointer ? 0.5 : 0.75,
    staticFrame: reduceMotion,
  });
} catch (e) { scene = null; }
if (scene) { feed.classList.add('has-webgl'); scene.start(); }

const N_SCREENS = 24;
const Z_START = -520;
const Z_STEP = 225;
const EXIT_Z = -6200;
const CAM_END = Math.abs(EXIT_Z) - 750;
const depthItems = []; // { el, z }

function buildTunnel() {
  screensEl.innerHTML = '';
  $$('.gate', world).forEach((g) => g.remove());
  depthItems.length = 0;
  const vw = innerWidth, vh = innerHeight;
  const small = vw < 860;
  const rx = clamp(vw * (small ? 0.36 : 0.42), 150, 780);
  const ry = clamp(vh * (small ? 0.34 : 0.4), 180, 430);
  const scale = small ? 0.62 : clamp(vw / 1440, 0.75, 1.15);

  for (let i = 0; i < N_SCREENS; i++) {
    const c = CLIPS[i % CLIPS.length];
    const a = i * 2.39996 + 0.6;
    const f = 0.88 + ((i * 37) % 10) / 33;
    const x = Math.cos(a) * rx * f;
    const y = Math.sin(a) * ry * f;
    const z = Z_START - i * Z_STEP;
    const portrait = i % 4 === 2;
    const w = (portrait ? 190 : 320) * scale;
    const h = (portrait ? 300 : 190) * scale;
    const rotY = (-x / rx) * 16;
    const rotZ = (((i * 53) % 9) - 4) * 0.8;
    const el = document.createElement('button');
    el.className = 'screen';
    el.dataset.open = c.id;
    el.dataset.cursor = 'PLAY';
    el.setAttribute('aria-label', `Play: ${c.title}`);
    el.style.cssText = `--w:${w}px;--h:${h}px;transform:translate3d(${x}px,${y}px,${z}px) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`;
    el.innerHTML = `<span class="screen__in">
        <img src="${esc(portrait ? vThumb(c.thumb) : c.thumb)}" alt="" loading="${i < 6 ? 'eager' : 'lazy'}" decoding="async" />
        <span class="screen__bar mono"><b>REC</b><span>${esc(c.category)}</span></span>
        <span class="screen__hook">${esc(c.hook || c.title)}</span>
      </span>`;
    screensEl.appendChild(el);
    depthItems.push({ el, z });
  }
  const colors = ['#ff3d81', '#8a42ff', '#ff7138'];
  for (let k = 0; k < 6; k++) {
    const z = -1150 - k * 1000;
    const g = document.createElement('div');
    g.className = 'gate';
    g.style.cssText = `--gw:${rx * 2.7}px;--gh:${ry * 2.6}px;--gc:${colors[k % 3]};transform:translate3d(0,0,${z}px)`;
    g.innerHTML = `<span>GATE 0${k + 1}</span>`;
    world.appendChild(g);
    depthItems.push({ el: g, z });
  }
  $$('.plane', world).forEach((p) => {
    const z = Number(p.dataset.z);
    p.style.transform = `translate(-50%, -50%) translate3d(0, 0, ${z}px)`;
    depthItems.push({ el: p, z, plane: true });
  });
}
buildTunnel();

function heroProgress() {
  const r = feed.getBoundingClientRect();
  return clamp(-r.top / Math.max(1, r.height - innerHeight));
}

let camZ = 0, lookX = 0, lookY = 0, feedRunning = false;
function renderFeed() {
  const p = reduceMotion ? 0 : heroProgress();
  const target = p * CAM_END;
  camZ += (target - camZ) * (reduceMotion ? 1 : 0.09);
  mouse.nx = (mouse.x / innerWidth) * 2 - 1;
  mouse.ny = (mouse.y / innerHeight) * 2 - 1;
  const tx = reduceMotion || !finePointer ? 0 : mouse.nx;
  const ty = reduceMotion || !finePointer ? 0 : mouse.ny;
  lookX += (tx - lookX) * 0.06;
  lookY += (ty - lookY) * 0.06;
  world.style.transform = `translate3d(${-lookX * 36}px, ${-lookY * 26}px, 0) rotateX(${lookY * 4}deg) rotateY(${-lookX * 6}deg) translateZ(${camZ}px)`;

  for (const it of depthItems) {
    const d = it.z + camZ; // 0 = focal plane, positive = towards the viewer
    let o = 1;
    if (d > 780) o = 0;
    else if (d > 260) o = 1 - (d - 260) / 520;
    if (d < -3400) o = 0;
    else if (d < -2000) o = Math.min(o, 1 - (-2000 - d) / 1400);
    if (it.plane) {
      o = d > 0 ? clamp(1 - d / 240) : clamp((d + 2700) / 1300);
    }
    const vis = o > 0.01;
    it.el.style.opacity = vis ? o.toFixed(3) : '0';
    it.el.style.visibility = vis ? 'visible' : 'hidden';
  }

  const introOut = clamp(p / 0.07);
  intro.style.opacity = String(1 - introOut);
  intro.style.transform = `translate(-50%, ${introOut * 40}px)`;
  intro.style.pointerEvents = introOut > 0.9 ? 'none' : '';
  scrollCue.style.opacity = String(1 - clamp(p / 0.05));
  depthVal.textContent = String(Math.round(camZ / 10)).padStart(4, '0');
  depthBar.style.height = `${p * 100}%`;
  if (scene) {
    scene.setScroll(p);
    if (finePointer && !reduceMotion) scene.setMouse(lookX * 0.8, -lookY * 0.6);
  }
}
function feedLoop() {
  if (!feedRunning) return;
  renderFeed();
  requestAnimationFrame(feedLoop);
}
const feedIO = new IntersectionObserver(([en]) => {
  if (en.isIntersecting && !reduceMotion) {
    if (!feedRunning) { feedRunning = true; requestAnimationFrame(feedLoop); }
    if (scene && !document.hidden) scene.start();
  } else {
    feedRunning = false;
    if (scene && !reduceMotion) scene.stop();
  }
});
feedIO.observe(feed);
document.addEventListener('visibilitychange', () => {
  if (!scene || reduceMotion) return;
  document.hidden ? scene.stop() : feedRunning && scene.start();
});
renderFeed();

/* ═════════════════════════ CLIPS: pinned coverflow ═════════════════════════ */
const clipsSec = $('#clips');
const track = $('#clips-track');
const progressFill = $('.clips__progress span');
const idxEl = $('.clips__idx');
const totalEl = $('.clips__total');

function cardHTML(c, featured) {
  return `
  <article class="card${featured ? ' card--featured' : ''}" data-cat="${esc(c.category)}" data-id="${esc(c.id)}">
    <button class="card__media" data-open="${esc(c.id)}" data-cursor="PLAY" aria-label="Play: ${esc(c.title)}">
      <img src="${esc(c.thumb)}" alt="" loading="lazy" decoding="async" width="1280" height="720" />
      ${c.video ? `<video muted loop playsinline preload="none" data-src="${esc(c.video)}"></video>` : ''}
      <span class="card__tag mono">${featured ? '★ FEATURED · ' : ''}${esc(c.category)}</span>
      <span class="card__dur mono">${esc(c.duration || '')}</span>
      <span class="card__hook">${esc(c.hook || '')}</span>
      <span class="card__play">${ICONS.play}</span>
      <span class="card__bar"><span></span></span>
    </button>
    <div class="card__meta">
      <h3>${esc(c.title)}</h3>
      <p>${esc(c.desc)}</p>
      ${statsHTML(c)}
    </div>
  </article>`;
}
const featuredClip = CLIPS.find((c) => c.featured) || CLIPS[0];
const ordered = [featuredClip, ...CLIPS.filter((c) => c !== featuredClip)];
track.innerHTML = ordered.map((c, i) => cardHTML(c, i === 0)).join('');
const cards = $$('.card', track);

const pinned = () => !isSmall() && !reduceMotion;
let maxShift = 0;
function sizeClips() {
  if (!pinned()) { clipsSec.style.height = ''; track.style.transform = ''; return; }
  maxShift = Math.max(0, track.scrollWidth - innerWidth);
  clipsSec.style.height = `${maxShift + innerHeight * 1.15}px`;
}
function visibleCards() { return cards.filter((c) => !c.classList.contains('is-hidden')); }
function updateClips() {
  const vis = visibleCards();
  totalEl.textContent = String(vis.length).padStart(2, '0');
  if (!pinned()) {
    // native swipe: just track the centred card
    const mid = innerWidth / 2;
    let best = 0, bestD = Infinity;
    vis.forEach((c, i) => { const r = c.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - mid); if (d < bestD) { bestD = d; best = i; } });
    idxEl.textContent = String(best + 1).padStart(2, '0');
    return;
  }
  const top = clipsSec.offsetTop;
  const span = Math.max(1, clipsSec.offsetHeight - innerHeight);
  const p = clamp((scrollY - top) / span);
  track.style.transform = `translate3d(${-p * maxShift}px, 0, 0)`;
  progressFill.style.width = `${p * 100}%`;
  const mid = innerWidth / 2;
  let best = 0, bestD = Infinity;
  vis.forEach((c, i) => {
    const r = c.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const t = clamp((cx - mid) / mid, -1.4, 1.4);
    c.style.transform = `rotateY(${-t * 16}deg) translateZ(${-Math.abs(t) * 90}px)`;
    c.style.opacity = String(1 - Math.min(0.55, Math.abs(t) * 0.35));
    const d = Math.abs(cx - mid);
    if (d < bestD) { bestD = d; best = i; }
  });
  idxEl.textContent = String(best + 1).padStart(2, '0');
}
track.addEventListener('scroll', updateClips, { passive: true });

const filtersEl = $('.filters');
filtersEl.innerHTML = CATEGORIES.map((cat, i) => `<button class="filter" role="tab" aria-selected="${i === 0}" data-filter="${esc(cat)}" data-cursor="FILTER">${esc(cat)}</button>`).join('');
filtersEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.filter');
  if (!btn) return;
  $$('.filter', filtersEl).forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
  const cat = btn.dataset.filter;
  cards.forEach((c) => c.classList.toggle('is-hidden', !(cat === 'All' || c.dataset.cat === cat)));
  sizeClips();
  if (pinned() && scrollY > clipsSec.offsetTop) window.scrollTo({ top: clipsSec.offsetTop, behavior: 'auto' });
  track.scrollLeft = 0;
  updateClips();
});

// hover previews for real videos
document.addEventListener('pointerover', (e) => {
  const card = e.target.closest('.card');
  if (!card || !finePointer) return;
  const v = $('video', card);
  if (v) { if (!v.src) v.src = v.dataset.src; card.classList.add('is-previewing'); v.play().catch(() => {}); }
});
document.addEventListener('pointerout', (e) => {
  const card = e.target.closest('.card');
  if (!card || card.contains(e.relatedTarget)) return;
  const v = $('video', card);
  if (v) { v.pause(); card.classList.remove('is-previewing'); }
});

/* ═════════════════════════ TRENDING: leaderboard ═════════════════════════ */
const toNum = (s) => {
  const m = String(s || '').match(/([\d.]+)\s*([KkMm]?)/);
  if (!m) return 0;
  return parseFloat(m[1]) * ({ m: 1e6, k: 1e3 }[m[2].toLowerCase()] || 1);
};
const ranked = [...CLIPS].sort((a, b) => toNum(b.views) - toNum(a.views));
$('#board').innerHTML = ranked.map((c, i) => `
  <li class="board__row reveal">
    <button class="board__btn" data-open="${esc(c.id)}" data-cursor="PLAY" data-thumb="${esc(c.thumb)}" data-hook="${esc(c.hook || '')}">
      <span class="board__rank">${String(i + 1).padStart(2, '0')}</span>
      <img class="board__thumb" src="${esc(c.thumb)}" alt="" loading="lazy" />
      <span class="board__title">${esc(c.title)}<small>${esc(c.category)}${c.sample ? ' · sample data' : ''}</small></span>
      <span class="board__cell board__cell--views mono">${c.views ? esc(c.views) + ' views' : ''}</span>
      <span class="board__cell board__cell--dur mono">${esc(c.duration || '')}</span>
      <span class="board__cell mono">${i < 3 ? `<span class="board__trend">${ICONS.up} HOT</span>` : ''}</span>
      <span class="board__arrow">${ICONS.arrow}</span>
    </button>
  </li>`).join('');
const preview = $('.board__preview');
const prevImg = $('img', preview);
const prevTxt = $('span', preview);
let px = 0, py = 0, pOn = false;
$('#board').addEventListener('pointerover', (e) => {
  const b = e.target.closest('.board__btn');
  if (!b || !finePointer) return;
  if (prevImg.getAttribute('src') !== b.dataset.thumb) prevImg.src = b.dataset.thumb;
  prevTxt.textContent = b.dataset.hook;
  preview.classList.add('is-on');
  if (!pOn) { pOn = true; px = mouse.x; py = mouse.y; requestAnimationFrame(previewLoop); }
});
$('#board').addEventListener('pointerleave', () => { preview.classList.remove('is-on'); pOn = false; });
function previewLoop() {
  if (!pOn) return;
  px += (mouse.x + 190 - px) * 0.14;
  py += (mouse.y - py) * 0.14;
  preview.style.left = `${px}px`;
  preview.style.top = `${py}px`;
  requestAnimationFrame(previewLoop);
}

$('#rail-latest').innerHTML = [...CLIPS].reverse().map((c, i) => `
  <button class="tcard" data-open="${esc(c.id)}" data-cursor="PLAY" aria-label="Play: ${esc(c.title)}">
    <img src="${esc(vThumb(c.thumb))}" alt="" loading="lazy" decoding="async" />
    ${i < 2 ? '<span class="tcard__label mono">NEW</span>' : ''}
    <span class="tcard__hook">${esc(c.hook || '')}</span>
    <span class="tcard__body">
      <span class="tcard__meta mono">${esc(c.duration || '')} · ${esc(c.category)}${c.sample ? ' · sample' : ''}</span>
      <h4>${esc(c.title)}</h4>
    </span>
  </button>`).join('');
$$('.carousel-nav .icon-btn').forEach((b) => b.addEventListener('click', () => {
  const rail = document.getElementById(b.dataset.target);
  rail.scrollBy({ left: Number(b.dataset.dir) * rail.clientWidth * 0.8, behavior: reduceMotion ? 'auto' : 'smooth' });
}));
$$('.rail').forEach((rail) => {
  let down = false, sx = 0, sl = 0, moved = false;
  rail.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft; });
  window.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 5) { moved = true; rail.classList.add('is-dragging'); }
    rail.scrollLeft = sl - dx;
  });
  window.addEventListener('pointerup', () => { if (!down) return; down = false; setTimeout(() => rail.classList.remove('is-dragging'), 0); });
  rail.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
});

/* ═════════════════════════ SOCIALS ═════════════════════════ */
$('#social-grid').innerHTML = SOCIALS.map((s, i) => {
  const soon = !s.url;
  const tag = soon ? 'div' : 'a';
  const attrs = soon ? 'aria-disabled="true"' : `href="${esc(s.url)}" target="_blank" rel="noopener" data-cursor="FOLLOW"`;
  return `
  <${tag} class="social social--${esc(s.id)} reveal${soon ? ' is-soon' : ''}" ${attrs} style="transition-delay:${i * 80}ms">
    <span class="social__icon">${ICONS[s.id] || ''}</span>
    <div><h3 class="social__name">${esc(s.label)}</h3><p class="social__handle mono">${esc(s.handle)}</p></div>
    <span class="social__go">${soon ? 'Link coming soon' : esc(s.action)} ${soon ? '' : ICONS.arrow}</span>
  </${tag}>`;
}).join('');
$('#footer-socials').innerHTML = SOCIALS.filter((s) => s.url).map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join('') || '<span style="color:var(--muted)">Coming soon</span>';

/* ═════════════════════════ MODAL ═════════════════════════ */
const modal = $('#modal');
const modalBody = $('.modal__body', modal);
function openClip(id) {
  const c = CLIPS.find((x) => x.id === id);
  if (!c) return;
  const follow = SOCIALS.find((s) => s.url);
  modalBody.innerHTML = c.video
    ? `<video src="${esc(c.video)}" poster="${esc(c.thumb)}" controls autoplay playsinline></video>`
    : `<div class="modal__soon"><img src="${esc(c.thumb)}" alt="" /><div>
         <p class="mono" style="color:var(--pink)">${esc(c.category)} · SAMPLE CLIP</p>
         <h3>${esc(c.title)}</h3>
         <p>This is a placeholder. The real clip lands here soon. Catch the latest drops on our socials.</p>
         ${follow ? `<a class="btn btn--primary" href="${esc(follow.url)}" target="_blank" rel="noopener">Watch on ${esc(follow.label)} ${ICONS.arrow}</a>` : ''}
       </div></div>`;
  typeof modal.showModal === 'function' ? modal.showModal() : modal.setAttribute('open', '');
}
function closeModal() {
  const v = $('video', modalBody);
  if (v) v.pause();
  modal.close ? modal.close() : modal.removeAttribute('open');
}
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-open]');
  if (t) { e.preventDefault(); openClip(t.dataset.open); }
});
$('.modal__close').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
modal.addEventListener('close', () => { modalBody.innerHTML = ''; });

/* ═════════════════════════ CHAOS METER + MISSION TOASTS ═════════════════════════ */
const chaos = $('.chaos');
const stars = $$('.chaos__stars i');
let chaosLevel = 0;
function setChaos(level) {
  if (level === chaosLevel) return;
  const up = level > chaosLevel;
  chaosLevel = level;
  stars.forEach((s, i) => s.classList.toggle('on', i < level));
  chaos.setAttribute('aria-label', `Chaos level ${level} of 5`);
  if (up && !reduceMotion) { chaos.classList.remove('is-flash'); void chaos.offsetWidth; chaos.classList.add('is-flash'); }
}
const toastsEl = $('.toasts');
function toast(kicker, title, small) {
  $$('.toast', toastsEl).forEach((t) => { t.classList.add('out'); setTimeout(() => t.remove(), 600); });
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<p class="mono">${esc(kicker)}</p><h4>${esc(title)}</h4>${small ? `<small>${esc(small)}</small>` : ''}`;
  toastsEl.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('in')));
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 600); }, 3200);
}
const seen = new Set();
const missionIO = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    const id = en.target.id;
    if (en.isIntersecting) {
      $$('.nav__links a').forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + id));
      if (!seen.has(id)) {
        seen.add(id);
        toast(`MISSION ${en.target.dataset.missionN} UNLOCKED`, en.target.dataset.mission, '+1 ★ CHAOS');
      }
    }
  });
}, { threshold: 0.3 });
$$('[data-mission]').forEach((s) => missionIO.observe(s));

/* ═════════════════════════ SCROLL-DRIVEN UI ═════════════════════════ */
const nav = $('.nav');
const toTop = $('.to-top');
const aboutTitle = $('[data-scrub]');
let words = [];
if (aboutTitle) {
  aboutTitle.innerHTML = aboutTitle.textContent.trim().split(/\s+/).map((w) => `<span class="w${/VIRAL/.test(w) ? ' hot-word' : ''}">${esc(w)}</span>`).join(' ');
  words = $$('.w', aboutTitle);
}
let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    const y = scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    if (reduceMotion || !feedRunning) renderFeed();
    updateClips();
    if (words.length && !reduceMotion) {
      const r = aboutTitle.getBoundingClientRect();
      const prog = clamp((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35));
      const n = Math.round(prog * words.length);
      words.forEach((w, i) => { w.classList.toggle('on', i < n); w.classList.toggle('hot', i < n && w.classList.contains('hot-word')); });
    }
    const max = document.documentElement.scrollHeight - innerHeight;
    const pp = max > 0 ? y / max : 0;
    toTop.style.setProperty('--off', String(138.2 * (1 - pp)));
    setChaos(pp < 0.015 ? 0 : Math.min(5, Math.ceil(pp * 5 - 0.0001)));
  });
}
window.addEventListener('scroll', onScroll, { passive: true });
let rT;
window.addEventListener('resize', () => {
  clearTimeout(rT);
  rT = setTimeout(() => { buildTunnel(); sizeClips(); renderFeed(); onScroll(); }, 150);
});
window.addEventListener('load', () => { sizeClips(); onScroll(); });
sizeClips();
onScroll();
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

/* ═════════════════════════ NAV / MENU / CLOCKS ═════════════════════════ */
const burger = $('.nav__burger');
const menu = $('.mobile-menu');
burger.addEventListener('click', () => {
  const open = burger.getAttribute('aria-expanded') === 'true';
  burger.setAttribute('aria-expanded', String(!open));
  menu.hidden = open;
  document.body.style.overflow = open ? '' : 'hidden';
});
$$('a', menu).forEach((a) => a.addEventListener('click', () => { burger.setAttribute('aria-expanded', 'false'); menu.hidden = true; document.body.style.overflow = ''; }));
const hudClock = $('.hud__clock');
const feedClock = $('.feed-clock');
function tickClock() {
  const d = new Date();
  const p2 = (n) => String(n).padStart(2, '0');
  hudClock.textContent = `${p2(d.getHours())}:${p2(d.getMinutes())}`;
  feedClock.textContent = `· UPDATED ${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`;
}
tickClock();
setInterval(tickClock, 1000);
$('.year').textContent = new Date().getFullYear();

/* ═════════════════════════ LOGO TILT + REVEALS ═════════════════════════ */
const tilt = $('[data-tilt]');
if (tilt && finePointer && !reduceMotion) {
  tilt.addEventListener('pointermove', (e) => {
    const r = tilt.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    tilt.style.transform = `rotateY(${(x - 0.5) * 18}deg) rotateX(${(0.5 - y) * 18}deg)`;
    tilt.style.setProperty('--gx', `${x * 100}%`);
    tilt.style.setProperty('--gy', `${y * 100}%`);
  });
  tilt.addEventListener('pointerleave', () => { tilt.style.transform = ''; });
}
const revealIO = new IntersectionObserver((entries) => {
  entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); revealIO.unobserve(en.target); } });
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
$$('.reveal').forEach((el, i) => {
  if (el.classList.contains('board__row')) el.style.transitionDelay = `${(i % 8) * 50}ms`;
  revealIO.observe(el);
});
