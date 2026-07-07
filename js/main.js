(function () {
  'use strict';

  /* ── VIDEO + LOGO WATERMARK — controlados por scroll ────── */
  const bgVideo  = document.querySelector('.hero-video');
  const logoWm   = document.getElementById('logoWatermark');
  const LOGO_MAX = 0.20;

  function updateScrollEffects() {
    const scrollY = window.scrollY;
    const vh      = window.innerHeight;

    // Video: 100% dentro del hero, se apaga progresivamente al bajar
    // Logo:  invisible en el hero, aparece cuando el video se apaga,
    //        queda fijo un tramo y luego desaparece
    const P1 = vh;         // fin del hero — video intacto hasta aquí
    const P2 = vh * 1.8;   // video apagado / logo al máximo
    const P3 = vh * 2.6;   // logo fijo hasta aquí
    const P4 = vh * 3.4;   // logo desaparecido

    let videoOp, logoOp;
    if (scrollY <= P1) {
      videoOp = 1;
      logoOp  = 0;
    } else if (scrollY <= P2) {
      const t = (scrollY - P1) / (P2 - P1);
      videoOp = 1 - t;
      logoOp  = LOGO_MAX * t;
    } else if (scrollY <= P3) {
      videoOp = 0;
      logoOp  = LOGO_MAX;
    } else if (scrollY <= P4) {
      videoOp = 0;
      logoOp  = LOGO_MAX * (1 - (scrollY - P3) / (P4 - P3));
    } else {
      videoOp = 0;
      logoOp  = 0;
    }

    if (bgVideo) bgVideo.style.opacity = videoOp;
    if (logoWm)  logoWm.style.opacity  = logoOp;
  }

  // Ejecutar en cada frame de scroll para suavidad
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateScrollEffects();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Estado inicial
  updateScrollEffects();

  /* ── NAVBAR SCROLL ─────────────────────────────────────── */
  const nav = document.getElementById('nav');
  const stt = document.getElementById('stt');

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 80;
    if (nav) nav.classList.toggle('s', scrolled);
    if (stt) stt.classList.toggle('v', scrolled);
  }, { passive: true });

  if (stt) stt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ── HAMBURGER MENU ────────────────────────────────────── */
  const hbg = document.getElementById('hbg');
  const nl  = document.getElementById('nl');

  if (hbg && nl) {
    hbg.addEventListener('click', () => {
      const open = nl.classList.toggle('open');
      hbg.setAttribute('aria-expanded', open);
    });

    nl.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        nl.classList.remove('open');
        hbg.setAttribute('aria-expanded', false);
      });
    });
  }

  /* ── SMOOTH ANCHOR SCROLL ──────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - 80,
          behavior: 'smooth'
        });
      }
    });
  });

  /* ── INTERSECTION OBSERVER (reveal + counters + historia) ── */
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('in');

      const num = el.querySelector('[data-t]');
      if (num && !num._done) {
        num._done = true;
        const target   = +num.dataset.t;
        const suffix   = num.dataset.s || '';
        const duration = 1800;
        const t0       = performance.now();

        const fmt = n => target >= 1000
          ? n.toLocaleString('es-CO') + suffix
          : n + suffix;

        const step = now => {
          const progress = Math.min((now - t0) / duration, 1);
          const eased    = 1 - Math.pow(1 - progress, 3);
          num.textContent = fmt(Math.round(eased * target));
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            num.style.animation = 'popNum .35s ease';
          }
        };

        requestAnimationFrame(step);
      }

      obs.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.rev, .st, .hb').forEach(el => obs.observe(el));

  /* ── ASIDE STAGGER ANIMATION ───────────────────────────── */
  const asideObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.ai').forEach((ai, i) => {
        setTimeout(() => {
          ai.style.opacity   = '1';
          ai.style.transform = 'none';
        }, i * 70);
      });
      asideObs.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  const aside = document.getElementById('aside');
  if (aside) asideObs.observe(aside);

  /* ── REVIEWS CAROUSEL ──────────────────────────────────── */
  const track = document.getElementById('rct');
  const rdots = document.getElementById('rd');

  if (track && rdots) {
    const cards = [...track.querySelectorAll('.rc')];
    let cur = 0;

    const vis   = () => window.innerWidth >= 900 ? 3 : window.innerWidth >= 580 ? 2 : 1;
    const pages = () => Math.ceil(cards.length / vis());

    function buildDots() {
      rdots.innerHTML = '';
      for (let i = 0; i < pages(); i++) {
        const d = document.createElement('button');
        d.className = 'dot' + (i === cur ? ' on' : '');
        d.setAttribute('aria-label', 'Página ' + (i + 1));
        d.addEventListener('click', () => go(i));
        rdots.appendChild(d);
      }
    }

    function go(idx) {
      cur = (idx + pages()) % pages();
      const cardW = cards[0].offsetWidth + 20;
      track.style.transform = `translateX(-${cur * vis() * cardW}px)`;
      rdots.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('on', i === cur));
    }

    const btnP = document.getElementById('rp');
    const btnN = document.getElementById('rn');
    if (btnP) btnP.addEventListener('click', () => go(cur - 1));
    if (btnN) btnN.addEventListener('click', () => go(cur + 1));

    buildDots();

    window.addEventListener('resize', () => {
      cur = 0;
      track.style.transform = 'translateX(0)';
      buildDots();
    }, { passive: true });

    let auto = setInterval(() => go(cur + 1), 5000);
    track.addEventListener('mouseenter', () => clearInterval(auto));
    track.addEventListener('mouseleave', () => { auto = setInterval(() => go(cur + 1), 5000); });
  }

})();
