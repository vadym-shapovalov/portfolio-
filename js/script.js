(function () {
  'use strict';
  var header = document.querySelector('.site-header');
  var navToggle = document.querySelector('.nav-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');
  var scrim = document.querySelector('.scrim');
  var toTopBtn = document.querySelector('.to-top');
  var navLinks = document.querySelectorAll('.nav-links a, .mobile-panel a');
  var sections = document.querySelectorAll('section[id]');

  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
    toTopBtn.classList.toggle('is-visible', window.scrollY > 560);
    updateActiveNav();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function openMenu() {
    mobilePanel.classList.add('is-open'); scrim.classList.add('is-visible');
    navToggle.classList.add('is-open'); navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    mobilePanel.classList.remove('is-open'); scrim.classList.remove('is-visible');
    navToggle.classList.remove('is-open'); navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  if (navToggle) navToggle.addEventListener('click', function () {
    mobilePanel.classList.contains('is-open') ? closeMenu() : openMenu();
  });
  if (scrim) scrim.addEventListener('click', closeMenu);
  document.querySelectorAll('.mobile-panel a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    if (link.classList.contains('logo')) return;
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var offset = header.offsetHeight + 8;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
      history.pushState(null, '', id);
    });
  });

  /* Логотип завжди плавно повертає на самий початок сторінки (Hero).
     Обробляється окремо від інших якорів, бо #top навішений на сам
     фіксований header — його getBoundingClientRect().top завжди 0,
     тож загальна формула зі зміщенням для нього не підходить. */
  var logoLink = document.querySelector('.logo');
  if (logoLink) {
    logoLink.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      history.pushState(null, '', '#top');
    });
  }

  function updateActiveNav() {
    var scrollPos = window.scrollY + header.offsetHeight + 40;
    var currentId = null;
    sections.forEach(function (sec) { if (sec.offsetTop <= scrollPos) currentId = sec.id; });
    navLinks.forEach(function (link) {
      link.classList.toggle('is-active', link.getAttribute('href') === '#' + currentId);
    });
  }

  if (toTopBtn) toTopBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  document.querySelectorAll('.reveal-stagger').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) { child.style.setProperty('--i', i); });
  });

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

(function () {
  'use strict';

  // Only ever runs on devices with a real mouse and hover capability.
  // On touch devices this whole block is skipped — native touch
  // behaviour is left completely untouched.
  if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;

  var dot = document.createElement('div');
  dot.className = 'cursor-dot';
  var ring = document.createElement('div');
  ring.className = 'cursor-ring';
  var label = document.createElement('div');
  label.className = 'cursor-label';
  label.textContent = 'VIEW \u2197';
  document.body.appendChild(dot);
  document.body.appendChild(ring);
  document.body.appendChild(label);
  document.documentElement.classList.add('custom-cursor');

  var mouseX = window.innerWidth / 2;
  var mouseY = window.innerHeight / 2;
  var dotX = mouseX, dotY = mouseY;
  var ringX = mouseX, ringY = mouseY;

  var DOT_EASE = 0.55;   // near-instant, precise point
  var RING_EASE = 0.16;  // slight lag = the "inertia" feel

  function onMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    document.body.classList.remove('cursor-idle');
  }
  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('mouseleave', function () { document.body.classList.add('cursor-idle'); });
  window.addEventListener('mousedown', function () { document.body.classList.add('cursor-down'); });
  window.addEventListener('mouseup', function () { document.body.classList.remove('cursor-down'); });

  function loop() {
    dotX += (mouseX - dotX) * DOT_EASE;
    dotY += (mouseY - dotY) * DOT_EASE;
    ringX += (mouseX - ringX) * RING_EASE;
    ringY += (mouseY - ringY) * RING_EASE;

    dot.style.transform = 'translate3d(' + dotX + 'px,' + dotY + 'px,0) translate(-50%,-50%)';
    var ringTransform = 'translate3d(' + ringX + 'px,' + ringY + 'px,0) translate(-50%,-50%)';
    ring.style.transform = ringTransform;
    label.style.transform = ringTransform + ' scale(' + (document.body.classList.contains('cursor-view') ? 1 : .6) + ')';

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // Two levels of "this is clickable" feedback:
  // - VIEW_TARGETS (project screenshots): filled gold pill with a "VIEW ↗" label
  // - HOVER_TARGETS (everything else clickable): ring grows and glows
  var VIEW_TARGETS = '.shot-link';
  var HOVER_TARGETS = 'a, button, input, textarea, select, label, summary, [role="button"], [tabindex], .project-card, .card, .contact-card, .process-step';

  function setState(el) {
    var isView = el && el.closest && el.closest(VIEW_TARGETS);
    var isHover = el && el.closest && el.closest(HOVER_TARGETS);
    document.body.classList.toggle('cursor-view', !!isView);
    document.body.classList.toggle('cursor-hover', !!isHover && !isView);
  }

  document.addEventListener('mouseover', function (e) {
    setState(e.target);
  });
  document.addEventListener('mouseout', function (e) {
    var toEl = e.relatedTarget;
    if (!(toEl && toEl.closest && (toEl.closest(VIEW_TARGETS) || toEl.closest(HOVER_TARGETS)))) {
      document.body.classList.remove('cursor-hover', 'cursor-view');
    } else {
      setState(toEl);
    }
  });
})();
