/* ============================================================
   MAIN — Animations, Navigation, Typewriter, Counters, Tilt
   ============================================================ */
(function () {
  'use strict';

  /* ── GSAP plugins ─────────────────────────────────────────── */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ── Loading Screen ───────────────────────────────────────── */
  var loaderMessages = [
    'Initializing neural networks...',
    'Loading AI models...',
    'Calibrating particles...',
    'Connecting to the matrix...',
    'System ready.',
  ];
  var loaderBar  = document.getElementById('loader-bar');
  var loaderText = document.getElementById('loader-text');
  var loader     = document.getElementById('loader');
  var loaderStep = 0;

  function advanceLoader() {
    loaderStep++;
    var pct = Math.min((loaderStep / loaderMessages.length) * 100, 100);
    if (loaderBar)  loaderBar.style.width = pct + '%';
    if (loaderText && loaderMessages[loaderStep - 1]) {
      loaderText.textContent = loaderMessages[loaderStep - 1];
    }
    if (loaderStep < loaderMessages.length) {
      setTimeout(advanceLoader, 400);
    } else {
      /* Fade out loader */
      setTimeout(function () {
        if (loader) {
          if (typeof gsap !== 'undefined') {
            gsap.to(loader, {
              opacity: 0, duration: 0.6, ease: 'power2.inOut',
              onComplete: function () {
                loader.style.display = 'none';
                startPageAnimations();
              },
            });
          } else {
            loader.style.opacity = '0';
            loader.style.transition = 'opacity .6s';
            setTimeout(function () {
              loader.style.display = 'none';
              startPageAnimations();
            }, 600);
          }
        }
      }, 300);
    }
  }

  setTimeout(advanceLoader, 200);

  /* ── Page animations (called after loader) ────────────────── */
  function startPageAnimations() {
    setupNavigation();
    setupScrollProgress();
    setupTypewriter();
    setupScrollReveal();
    setupCounters();
    setupSkillBars();
    setupProjectTilt();
    setupCursorTrail();
    initScrollIndicator();
    document.getElementById('footer-year') && (document.getElementById('footer-year').textContent = new Date().getFullYear());
  }

  /* ── Navigation ───────────────────────────────────────────── */
  function setupNavigation() {
    var navbar    = document.getElementById('navbar');
    var hamburger = document.getElementById('hamburger');
    var navLinks  = document.getElementById('nav-links');
    var links     = document.querySelectorAll('.nav-link');

    /* Scroll: add .scrolled class */
    window.addEventListener('scroll', function () {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      updateActiveLink();
    }, { passive: true });

    /* Hamburger toggle */
    if (hamburger && navLinks) {
      hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('open');
        navLinks.classList.toggle('open');
      });
    }

    /* Smooth scroll + close mobile nav */
    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          var target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          if (navLinks) navLinks.classList.remove('open');
          if (hamburger) hamburger.classList.remove('open');
        }
      });
    });

    function updateActiveLink() {
      var sections = document.querySelectorAll('section[id]');
      var scrollMid = window.scrollY + window.innerHeight / 2;
      sections.forEach(function (section) {
        var top    = section.offsetTop;
        var bottom = top + section.offsetHeight;
        var id     = section.getAttribute('id');
        var link   = document.querySelector('.nav-link[href="#' + id + '"]');
        if (!link) return;
        if (scrollMid >= top && scrollMid < bottom) {
          links.forEach(function (l) { l.classList.remove('active'); });
          link.classList.add('active');
        }
      });
    }
  }

  /* ── Scroll Progress ──────────────────────────────────────── */
  function setupScrollProgress() {
    var bar = document.getElementById('scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', function () {
      var max  = document.documentElement.scrollHeight - window.innerHeight;
      var pct  = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = pct + '%';
    }, { passive: true });
  }

  /* ── Typewriter ───────────────────────────────────────────── */
  function setupTypewriter() {
    var el     = document.getElementById('typewriter');
    if (!el) return;
    var phrases = [
      'Building Production AI Systems',
      'Leading Engineering Teams',
      'Designing Scalable Architectures',
      'Shipping Things That Matter',
    ];
    var phraseIdx = 0;
    var charIdx   = 0;
    var deleting  = false;
    var SPEED_TYPE = 80;
    var SPEED_DEL  = 45;
    var PAUSE      = 2200;

    function tick() {
      var phrase = phrases[phraseIdx];
      if (deleting) {
        charIdx--;
        el.textContent = phrase.slice(0, charIdx);
        if (charIdx === 0) {
          deleting   = false;
          phraseIdx  = (phraseIdx + 1) % phrases.length;
          setTimeout(tick, 350);
          return;
        }
        setTimeout(tick, SPEED_DEL);
      } else {
        charIdx++;
        el.textContent = phrase.slice(0, charIdx);
        if (charIdx === phrase.length) {
          deleting = true;
          setTimeout(tick, PAUSE);
          return;
        }
        setTimeout(tick, SPEED_TYPE);
      }
    }

    setTimeout(tick, 1800);
  }

  /* ── Scroll Reveal (Intersection Observer) ────────────────── */
  function setupScrollReveal() {
    var opts = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, opts);

    document.querySelectorAll('.fade-up').forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ── Stat Counters ────────────────────────────────────────── */
  function setupCounters() {
    var nums     = document.querySelectorAll('.stat-number');
    var counted  = false;
    var observer = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting || counted) return;
      counted = true;
      nums.forEach(function (el) {
        var target = parseInt(el.getAttribute('data-target'), 10);
        var start  = 0;
        var steps  = 60;
        var step   = 0;
        var timer  = setInterval(function () {
          step++;
          var progress = step / steps;
          /* Ease-out quad */
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target);
          if (step >= steps) {
            el.textContent = target;
            clearInterval(timer);
          }
        }, 18);
      });
    }, { threshold: 0.4 });

    var statsEl = document.querySelector('.about-stats');
    if (statsEl) observer.observe(statsEl);
  }

  /* ── Skill Bars ───────────────────────────────────────────── */
  function setupSkillBars() {
    var fills    = document.querySelectorAll('.skill-fill');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var fill = entry.target;
        var w    = fill.getAttribute('data-w');
        setTimeout(function () {
          fill.style.width = w + '%';
        }, 100);
        observer.unobserve(fill);
      });
    }, { threshold: 0.2 });

    fills.forEach(function (fill) { observer.observe(fill); });
  }

  /* ── Project Card 3-D Tilt ────────────────────────────────── */
  function setupProjectTilt() {
    var cards = document.querySelectorAll('.project-card[data-tilt]');

    cards.forEach(function (card) {
      var glow = card.querySelector('.proj-glow');

      card.addEventListener('mousemove', function (e) {
        var rect  = card.getBoundingClientRect();
        var cx    = rect.left + rect.width  / 2;
        var cy    = rect.top  + rect.height / 2;
        var dx    = (e.clientX - cx) / (rect.width  / 2);
        var dy    = (e.clientY - cy) / (rect.height / 2);

        card.style.transform = 'perspective(600px)' +
          ' rotateY(' + (dx * 12) + 'deg)' +
          ' rotateX(' + (-dy * 10) + 'deg)' +
          ' translateZ(6px)';
        card.style.transition = 'none';
        card.style.boxShadow  = '0 20px 60px rgba(0,212,255,' + (0.06 + Math.abs(dx) * 0.06) + ')';

        /* Move radial glow with mouse */
        if (glow) {
          var gx = ((e.clientX - rect.left) / rect.width)  * 100;
          var gy = ((e.clientY - rect.top)  / rect.height) * 100;
          glow.style.setProperty('--gx', gx + '%');
          glow.style.setProperty('--gy', gy + '%');
        }
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform  = 'perspective(600px) rotateY(0) rotateX(0) translateZ(0)';
        card.style.transition = 'transform .5s cubic-bezier(.25,.46,.45,.94), box-shadow .5s';
        card.style.boxShadow  = '';
      });
    });
  }

  /* ── Custom Cursor Trail ──────────────────────────────────── */
  function setupCursorTrail() {
    /* Skip on touch devices */
    if (window.matchMedia('(pointer: coarse)').matches) return;

    var ring = document.getElementById('cursor-ring');
    var dot  = document.getElementById('cursor-dot');

    var cx = -100, cy = -100; /* current cursor pos */
    var rx = -100, ry = -100; /* ring lerp pos */

    document.addEventListener('mousemove', function (e) {
      cx = e.clientX; cy = e.clientY;
    });

    /* Update dot instantly, ring with lerp */
    (function updateCursor() {
      requestAnimationFrame(updateCursor);
      if (dot)  { dot.style.left  = cx + 'px'; dot.style.top  = cy + 'px'; }
      rx += (cx - rx) * 0.14;
      ry += (cy - ry) * 0.14;
      if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
    }());

    /* Expand ring on hoverable elements */
    document.querySelectorAll('a, button, .project-card, .contact-card, .stat-card, #game-canvas').forEach(function (el) {
      el.addEventListener('mouseenter', function () { document.body.classList.add('cursor-hover'); });
      el.addEventListener('mouseleave', function () { document.body.classList.remove('cursor-hover'); });
    });

    /* Hide ring when leaving window */
    document.addEventListener('mouseleave', function () {
      if (ring) ring.style.opacity = '0';
      if (dot)  dot.style.opacity  = '0';
    });
    document.addEventListener('mouseenter', function () {
      if (ring) ring.style.opacity = '1';
      if (dot)  dot.style.opacity  = '1';
    });
  }

  /* ── Scroll Indicator click ───────────────────────────────── */
  function initScrollIndicator() {
    var si = document.getElementById('scroll-indicator');
    if (!si) return;
    si.addEventListener('click', function () {
      var about = document.getElementById('about');
      if (about) about.scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ── GSAP scroll animations (progressive enhancement) ─────── */
  function setupGSAPScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    /* Hero name reveal via GSAP (in addition to CSS) */
    gsap.fromTo('#hero-name .glitch',
      { opacity: 0, y: 40, skewX: -4 },
      {
        opacity: 1, y: 0, skewX: 0,
        duration: 1, ease: 'power3.out',
        stagger: 0.2, delay: 0.7,
      }
    );

    /* Parallax on section titles */
    document.querySelectorAll('.section-title').forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0, x: -30 },
        {
          opacity: 1, x: 0, duration: .8, ease: 'power2.out',
          scrollTrigger: {
            trigger: el, start: 'top 85%', toggleActions: 'play none none none',
          },
        }
      );
    });

    /* Timeline cards slide in */
    document.querySelectorAll('.tl-card').forEach(function (card, i) {
      gsap.fromTo(card,
        { opacity: 0, x: -40 },
        {
          opacity: 1, x: 0,
          duration: .7, delay: i * 0.1, ease: 'power2.out',
          scrollTrigger: {
            trigger: card, start: 'top 88%', toggleActions: 'play none none none',
          },
        }
      );
    });
  }

  /* Run GSAP animations if available (non-blocking) */
  window.addEventListener('load', setupGSAPScrollAnimations);

}());
