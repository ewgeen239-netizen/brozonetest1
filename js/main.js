/* ==========================================================================
   BroZone — interactions
   No dependencies. Scroll work batched in one rAF loop.
   ========================================================================== */
(() => {
  'use strict';

  /* --------------------------------------------------------------------
     CONFIG — edit these two lines when the real links are confirmed.
     -------------------------------------------------------------------- */
  const BOOKSY_URL = 'https://booksy.com/pl-pl/287574_brozone_barber-shop_18078_szczecin';
  const PHONE      = '';  // np. '+48123456789' — zostaw puste, żeby ukryć przycisk "Zadzwoń"
  const INSTAGRAM  = 'https://www.instagram.com/brozone.szczecin/';

  // ?motion=on|off overrides the OS setting — handy for QA on a reduced-motion machine
  const motionParam = new URLSearchParams(location.search).get('motion');
  const reduced = motionParam === 'on' ? false
                : motionParam === 'off' ? true
                : window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (motionParam === 'on') document.documentElement.dataset.motion = 'on';
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  /* ====================================================================
     Links
     ==================================================================== */
  $$('[data-booksy]').forEach(a => {
    a.href = BOOKSY_URL;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  });

  $$('[data-phone]').forEach(a => {
    if (PHONE) a.href = 'tel:' + PHONE.replace(/\s/g, '');
    else a.remove();               // brak numeru → nie pokazujemy martwego CTA
  });

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ====================================================================
     Asset slots — mark empty ones so the placeholder label shows
     ==================================================================== */
  $$('.slot').forEach(slot => {
    const img = slot.querySelector('img');
    if (!img) return;
    const flag = () => slot.classList.add('is-empty');
    if (img.complete) { if (!img.naturalWidth) flag(); }
    else img.addEventListener('error', flag, { once: true });
  });

  const heroVideo = $('.hero__video');
  const heroMedia = $('.hero__media');
  if (heroVideo) {
    // <source> errors bubble on the capture phase only
    heroVideo.addEventListener('error', () => {
      heroVideo.style.display = 'none';
      heroMedia && heroMedia.classList.add('is-empty');
    }, true);
    // no readable data after 2.5 s → treat the slot as empty
    setTimeout(() => {
      if (!heroVideo.videoWidth) {
        heroVideo.style.display = 'none';
        heroMedia && heroMedia.classList.add('is-empty');
      }
    }, 2500);
  }

  /* ====================================================================
     Loader — max 1s, never blocks
     ==================================================================== */
  const loader = $('#loader');
  if (loader) {
    const kill = () => loader.classList.add('is-done');
    if (reduced) kill();
    else setTimeout(kill, 950);
    window.addEventListener('load', () => setTimeout(kill, 200));
  }

  /* ====================================================================
     Split text
     ==================================================================== */
  $$('[data-split]').forEach(el => {
    if (el.dataset.done) return;
    const text = el.textContent.trim();
    el.textContent = '';
    let i = 0;
    for (const ch of text) {
      const span = document.createElement('span');
      span.className = ch === ' ' ? 'ch ch--space' : 'ch';
      span.textContent = ch === ' ' ? ' ' : ch;
      span.style.setProperty('--i', i++);
      el.appendChild(span);
    }
    el.dataset.done = '1';
  });

  /* ====================================================================
     Reveal on enter (split / fade / stagger / clip-path gallery / map)
     ==================================================================== */
  const revealTargets = $$('[data-split], .reveal, .gitem, .loc__map');

  if (!('IntersectionObserver' in window)) {           // old browser → show everything
    [...revealTargets, ...$$('[data-stagger]')].forEach(el => el.classList.add('is-in'));
    document.documentElement.classList.remove('js');
    window.IntersectionObserver = function () {        // no-op shim, keeps the rest alive
      return { observe() {}, unobserve() {}, disconnect() {} };
    };
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const delay = +(el.dataset.delay || 0);
      setTimeout(() => el.classList.add('is-in'), reduced ? 0 : delay);
      io.unobserve(el);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  revealTargets.forEach(el => io.observe(el));

  // Stagger groups: index within parent drives the delay
  const staggerIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const group = [...e.target.parentElement.querySelectorAll('[data-stagger]')];
      group.forEach((el, i) => {
        el.style.setProperty('--s', i);
        el.classList.add('is-in');
        staggerIO.unobserve(el);
      });
    });
  }, { threshold: 0.3 });
  $$('[data-stagger]').forEach(el => staggerIO.observe(el));

  /* ====================================================================
     Nav — glass on scroll, hide on scroll down, active section
     ==================================================================== */
  const nav = $('#nav');
  const bottombar = $('#bottombar');
  const navLinks = $$('.nav__links a');
  let lastY = window.scrollY;

  const sections = navLinks
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const sectionIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => sectionIO.observe(s));

  /* ====================================================================
     Mobile menu
     ==================================================================== */
  const burger = $('#burger');
  const menu = $('#mobilemenu');
  if (burger && menu) {
    const setMenu = (open) => {
      burger.setAttribute('aria-expanded', String(open));
      menu.hidden = !open;
      document.body.classList.toggle('is-locked', open);
      if (open) $$('a', menu).forEach((a, i) => a.style.setProperty('--i', i));
    };
    burger.addEventListener('click', () => setMenu(menu.hidden));
    menu.addEventListener('click', e => { if (e.target.tagName === 'A') setMenu(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });
  }

  /* ====================================================================
     Smooth anchor scroll (Lenis-style easing, keeps sticky intact)
     ==================================================================== */
  if (!reduced) {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();

      const navH = nav ? nav.offsetHeight : 0;
      const start = window.scrollY;
      const end = target.getBoundingClientRect().top + start - navH - 8;
      const dist = end - start;
      const dur = clamp(Math.abs(dist) / 2.2, 500, 1400);
      let t0 = null;

      const step = (ts) => {
        if (t0 === null) t0 = ts;
        const p = clamp((ts - t0) / dur);
        window.scrollTo(0, start + dist * easeOut(p));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* ====================================================================
     PROCESS — sticky scroll-driven card stack
     ==================================================================== */
  const track = $('#processTrack');
  const cards = $$('.pcard');
  const steps = $$('.process__step');
  const bar = $('#processBar');
  const STEPS = Math.max(cards.length, 1);
  let activeStep = -1;

  const updateProcess = () => {
    if (!track || reduced) return;
    const r = track.getBoundingClientRect();
    const scrollable = track.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const p = clamp(-r.top / scrollable);

    // raw goes 0 → STEPS-1 across the track
    const raw = p * (STEPS - 0.001);

    cards.forEach((card, i) => {
      const t = easeOut(clamp(raw - (i - 1)));       // card i slides in as raw passes i-1 → i
      const behind = clamp(raw - i, 0, STEPS);
      const y = (1 - t) * 104;
      const scale = 1 - Math.min(behind, 3) * 0.035;
      const rot = (1 - t) * 3;
      card.style.transform = `translateY(${y}%) scale(${scale}) rotate(${rot}deg)`;
      card.style.zIndex = String(10 + i);
      card.style.filter = behind > 0.9 ? `brightness(${1 - Math.min(behind, 2) * 0.18})` : '';
    });

    const idx = clamp(Math.round(raw), 0, STEPS - 1);
    if (idx !== activeStep) {
      activeStep = idx;
      steps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
    }
    if (bar) bar.style.width = (p * 100).toFixed(2) + '%';
  };

  /* ====================================================================
     Parallax media (hero + final)
     ==================================================================== */
  const parallax = $$('[data-parallax-media]').map(wrap => ({
    wrap,
    layer: wrap.querySelector('.hero__video, .slot'),
  })).filter(o => o.layer);

  const updateParallax = () => {
    if (reduced) return;
    const vh = window.innerHeight;
    parallax.forEach(({ wrap, layer }) => {
      const r = wrap.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const p = clamp((vh - r.top) / (vh + r.height));   // 0 → 1 across the pass
      const y = (p - 0.5) * 12;                          // % drift
      const scale = 1.10 - p * 0.06;
      layer.style.transform = `translate3d(0,${y}%,0) scale(${Math.max(scale, 1.02)})`;
    });
  };

  /* ====================================================================
     Single rAF scroll loop
     ==================================================================== */
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;

    if (nav) {
      nav.classList.toggle('is-stuck', y > 40);
      const down = y > lastY && y > 420 && (!menu || menu.hidden);
      nav.classList.toggle('is-hidden', down);
    }
    if (bottombar) bottombar.classList.toggle('is-on', y > window.innerHeight * 0.75);
    lastY = y;

    updateProcess();
    updateParallax();
    ticking = false;
  };

  const requestTick = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onScroll);
  };

  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick);
  onScroll();

  /* ====================================================================
     Services — cursor-following image reveal
     ==================================================================== */
  const hover = $('#srvHover');
  const hoverImg = hover && hover.querySelector('img');
  const fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  if (hover && hoverImg && fine && !reduced) {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;

    const loop = () => {
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      hover.style.left = cx + 'px';
      hover.style.top = cy + 'px';
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.4 ? requestAnimationFrame(loop) : null;
    };

    $$('.srv__row').forEach(row => {
      row.addEventListener('mouseenter', () => {
        row.classList.add('is-hot');
        hoverImg.src = row.dataset.img;
        hover.classList.add('is-on');
      });
      row.addEventListener('mouseleave', () => {
        row.classList.remove('is-hot');
        hover.classList.remove('is-on');
      });
      row.addEventListener('mousemove', (e) => {
        tx = e.clientX; ty = e.clientY;
        if (!cx) { cx = tx; cy = ty; }
        if (!raf) raf = requestAnimationFrame(loop);
      });
    });
  }

  /* ====================================================================
     Magnetic buttons
     ==================================================================== */
  if (fine && !reduced) {
    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const mx = e.clientX - r.left, my = e.clientY - r.top;
        el.style.setProperty('--mx', (mx / r.width * 100) + '%');
        el.style.setProperty('--my', (my / r.height * 100) + '%');
        el.style.transform = `translate(${(mx - r.width / 2) * 0.22}px, ${(my - r.height / 2) * 0.3}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ====================================================================
     Team — arrows, drag-to-scroll, wheel
     ==================================================================== */
  const scroller = $('#teamScroller');
  if (scroller) {
    const step = () => {
      const card = scroller.querySelector('.tcard');
      return card ? card.offsetWidth + 20 : 320;
    };
    const prev = $('#teamPrev'), next = $('#teamNext');
    prev && prev.addEventListener('click', () => scroller.scrollBy({ left: -step(), behavior: 'smooth' }));
    next && next.addEventListener('click', () => scroller.scrollBy({ left: step(), behavior: 'smooth' }));

    const syncArrows = () => {
      const max = scroller.scrollWidth - scroller.clientWidth - 2;
      prev && prev.toggleAttribute('disabled', scroller.scrollLeft <= 2);
      next && next.toggleAttribute('disabled', scroller.scrollLeft >= max);
    };
    scroller.addEventListener('scroll', syncArrows, { passive: true });
    window.addEventListener('resize', syncArrows);
    syncArrows();

    // drag on desktop
    let down = false, startX = 0, startL = 0, moved = 0;
    scroller.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0;
      startX = e.clientX; startL = scroller.scrollLeft;
      scroller.classList.add('is-dragging');
    });
    scroller.addEventListener('pointermove', (e) => {
      if (!down) return;
      const d = e.clientX - startX;
      moved = Math.abs(d);
      scroller.scrollLeft = startL - d;
    });
    const endDrag = () => {
      if (!down) return;
      down = false;
      scroller.classList.remove('is-dragging');
    };
    scroller.addEventListener('pointerup', endDrag);
    scroller.addEventListener('pointerleave', endDrag);
    scroller.addEventListener('click', (e) => { if (moved > 6) e.preventDefault(); }, true);
  }

  /* ====================================================================
     Before / After slider
     ==================================================================== */
  const range = $('#baRange'), before = $('#baBefore'), handle = $('#baHandle');
  if (range && before && handle) {
    const set = (v) => {
      before.style.clipPath = `inset(0 ${100 - v}% 0 0)`;
      handle.style.left = v + '%';
    };
    range.addEventListener('input', () => set(range.value));
    set(range.value);
  }

  /* ====================================================================
     Reviews marquee — clone for a seamless loop
     ==================================================================== */
  const row = $('#marqueeRow');
  if (row && !reduced) {
    [...row.children].forEach(node => {
      const c = node.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      row.appendChild(c);
    });
  }

  /* ====================================================================
     Score count-up
     ==================================================================== */
  const score = $('[data-count]');
  if (score && !reduced) {
    const target = parseFloat(score.dataset.count);
    const scoreIO = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      scoreIO.disconnect();
      const t0 = performance.now();
      const tick = (ts) => {
        const p = clamp((ts - t0) / 1100);
        score.textContent = (target * easeOut(p)).toFixed(1);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    scoreIO.observe(score);
  }

  /* Pause hero video off-screen — saves battery / CPU */
  if (heroVideo) {
    const vIO = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) heroVideo.play().catch(() => {});
      else heroVideo.pause();
    }, { threshold: 0.05 });
    vIO.observe(heroVideo);
  }
})();
