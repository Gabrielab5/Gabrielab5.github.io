document.addEventListener('DOMContentLoaded', () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile nav + smooth scroll ---------- */
  function setupNav() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('main-nav');
    if (hamburger && navMenu) {
      hamburger.addEventListener('click', () => {
        const open = navMenu.classList.toggle('is-open');
        hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
        }
        if (navMenu && navMenu.classList.contains('is-open')) {
          navMenu.classList.remove('is-open');
          if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  /* ---------- Theme toggle ---------- */
  function setupTheme() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    const icon = toggle.querySelector('i');
    const saved = localStorage.getItem('theme') || 'dark';
    apply(saved);
    toggle.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      apply(next);
      localStorage.setItem('theme', next);
    });
    function apply(theme) {
      if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        if (icon) icon.className = 'fas fa-sun';
      } else {
        document.documentElement.removeAttribute('data-theme');
        if (icon) icon.className = 'fas fa-moon';
      }
    }
  }

  /* ---------- Scroll progress + back to top ---------- */
  function setupScrollUI() {
    const bar = document.getElementById('scroll-progress');
    const toTop = document.getElementById('back-to-top');
    function onScroll() {
      const h = document.documentElement;
      const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
      if (bar) bar.style.width = (scrolled * 100) + '%';
      if (toTop) toTop.classList.toggle('show', h.scrollTop > 500);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' }));
  }

  /* ---------- Open-to-work banner ---------- */
  function setupBanner() {
    const banner = document.getElementById('open-banner');
    const close = document.getElementById('open-close');
    if (!banner || !close) return;
    if (localStorage.getItem('bannerDismissed') === '1') banner.classList.add('dismissed');
    close.addEventListener('click', () => {
      banner.classList.add('dismissed');
      localStorage.setItem('bannerDismissed', '1');
    });
  }

  /* ---------- Typewriter ---------- */
  function setupTypewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;
    const lines = [
      'Full Stack Developer | Salesforce Architect | AI Builder',
      'Currently: building intelligent enterprise automation @ Dicomano',
      'Stack: Apex · React · Node · PostgreSQL · AWS · Claude AI',
      'Turning complex problems into elegant, reliable solutions.'
    ];
    if (prefersReduced) { el.textContent = lines[0]; return; }
    let li = 0, ci = 0, deleting = false;
    function tick() {
      const line = lines[li];
      el.textContent = line.slice(0, ci);
      if (!deleting) {
        if (ci < line.length) { ci++; setTimeout(tick, 45); }
        else { deleting = true; setTimeout(tick, 1900); }
      } else {
        if (ci > 0) { ci--; setTimeout(tick, 22); }
        else { deleting = false; li = (li + 1) % lines.length; setTimeout(tick, 350); }
      }
    }
    tick();
  }

  /* ---------- Scroll reveal ---------- */
  function setupReveal() {
    const els = document.querySelectorAll('.reveal');
    if (prefersReduced || !('IntersectionObserver' in window)) {
      els.forEach(e => e.classList.add('visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(e => io.observe(e));
  }

  /* ---------- Skill bars fill on view ---------- */
  function setupSkillBars() {
    const rows = document.querySelectorAll('.skill-row');
    if (!rows.length) return;
    const fill = (row) => {
      const lvl = row.getAttribute('data-level');
      const bar = row.querySelector('.skill-fill');
      if (bar) bar.style.width = lvl + '%';
    };
    if (prefersReduced || !('IntersectionObserver' in window)) { rows.forEach(fill); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { fill(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.4 });
    rows.forEach(r => io.observe(r));
  }

  /* ---------- Active nav highlight ---------- */
  function setupActiveNav() {
    const sections = document.querySelectorAll('main section[id]');
    const links = document.querySelectorAll('.nav-link');
    if (!sections.length || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => io.observe(s));
  }

  /* ---------- More projects accordion ---------- */
  function setupAccordion() {
    const toggle = document.getElementById('more-toggle');
    const list = document.getElementById('more-list');
    if (!toggle || !list) return;
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
      list.hidden = open;
    });
  }

  /* ---------- Animated count-up ---------- */
  function animateCount(el, target) {
    if (prefersReduced) { el.textContent = target; return; }
    const dur = 1400; const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.floor(p * target).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString();
    }
    requestAnimationFrame(step);
  }

  /* ---------- Live GitHub stats (with static fallback) ---------- */
  function setupStats() {
    const reposEl = document.getElementById('stat-repos');
    const starsEl = document.getElementById('stat-stars');
    const langEl = document.getElementById('stat-lang');
    const activeEl = document.getElementById('stat-active');
    if (!reposEl) return;

    let counted = false;
    const runCount = () => {
      if (counted) return; counted = true;
      animateCount(reposEl, parseInt(reposEl.dataset.target, 10) || 0);
      animateCount(starsEl, parseInt(starsEl.dataset.target, 10) || 0);
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { runCount(); io.disconnect(); }
      }, { threshold: 0.4 });
      io.observe(reposEl.closest('.stats-bar'));
    } else { runCount(); }

    // Try to refresh with live data (best-effort; ignores rate-limit errors)
    fetch('https://api.github.com/users/Gabrielab5/repos?per_page=100&sort=pushed')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(repos => {
        if (!Array.isArray(repos)) return;
        const stars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
        const langCount = {};
        repos.forEach(r => { if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1; });
        const topLang = Object.keys(langCount).sort((a, b) => langCount[b] - langCount[a])[0];
        reposEl.dataset.target = repos.length;
        starsEl.dataset.target = stars;
        if (!counted) { /* will count on view */ }
        else { reposEl.textContent = repos.length.toLocaleString(); starsEl.textContent = stars.toLocaleString(); }
        if (topLang && langEl) langEl.textContent = topLang;
        if (repos[0] && repos[0].pushed_at && activeEl) {
          activeEl.textContent = new Date(repos[0].pushed_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }
      })
      .catch(() => { /* keep static fallback values */ });
  }

  /* ---------- Contact form (EmailJS) ---------- */
  function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;
    if (typeof emailjs === 'undefined') { console.warn('EmailJS not loaded.'); return; }

    // EmailJS public identifiers — these are client-side publishable keys (safe to expose).
    // Account-level protection is enforced via EmailJS allowed-origins + the template's "To" address.
    const EMAILJS_PUBLIC_KEY = 'yzlDBiUW1zDE6a7SU';
    const EMAILJS_SERVICE_ID = 'service_pyvswzw';
    const EMAILJS_TEMPLATE_ID = 'template_e0w03h2';

    emailjs.init(EMAILJS_PUBLIC_KEY);

    const successModal = document.getElementById('success-modal');
    const errorModal = document.getElementById('error-modal');
    const submitBtn = document.getElementById('submit-btn');
    const emailError = document.getElementById('email-error');
    const messageError = document.getElementById('message-error');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const errorMessageText = document.getElementById('error-message-text');

    document.querySelectorAll('.modal .close-button').forEach(btn => {
      btn.addEventListener('click', () => {
        successModal.classList.add('hidden');
        if (errorModal) errorModal.classList.add('hidden');
      });
    });
    [successModal, errorModal].forEach(m => {
      if (m) m.addEventListener('click', (e) => { if (e.target === m) m.classList.add('hidden'); });
    });

    function validateEmail(email) {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    }

    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();
      emailError.textContent = '';
      messageError.textContent = '';
      if (errorMessageText) errorMessageText.textContent = '';
      if (errorModal) errorModal.classList.add('hidden');

      let isValid = true;
      if (!validateEmail(emailInput.value.trim())) { emailError.textContent = 'Please enter a valid email address.'; isValid = false; }
      if (messageInput.value.trim() === '') { messageError.textContent = 'Please enter a message.'; isValid = false; }
      if (!isValid) return;

      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending...';

      emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, this)
        .then(() => {
          successModal.classList.remove('hidden');
          contactForm.reset();
        }, (error) => {
          console.error('EmailJS FAILED to send:', error);
          if (errorModal && errorMessageText) {
            errorMessageText.textContent = 'Failed to send message. Please try again later.';
            errorModal.classList.remove('hidden');
          } else {
            alert('Oops! Something went wrong. Please try again.');
          }
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Send Message <i class="fas fa-paper-plane"></i>';
        });
    });
  }

  setupNav();
  setupTheme();
  setupScrollUI();
  setupBanner();
  setupTypewriter();
  setupReveal();
  setupSkillBars();
  setupActiveNav();
  setupAccordion();
  setupStats();
  setupContactForm();
});
