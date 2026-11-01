document.addEventListener('DOMContentLoaded', () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
  };

  /* ---------- Dynamic-Island toast ---------- */
  const toastEl = $('#toast');
  const toastText = $('#toast-text');
  let toastTimer;
  function toast(msg, icon = 'fa-circle-check') {
    if (!toastEl) return;
    toastText.textContent = msg;
    const i = toastEl.querySelector('i');
    if (i) i.className = 'fas ' + icon;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  function haptic() { if (navigator.vibrate) { try { navigator.vibrate(8); } catch (e) {} } }

  function scrollToTarget(target) {
    target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
  }

  /* ---------- Smooth anchor scroll ---------- */
  function setupAnchors() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) { e.preventDefault(); scrollToTarget(target); history.replaceState(null, '', href); }
    });
  }

  /* ---------- Theme switch ---------- */
  function applyTheme(theme) {
    const toggle = $('#theme-toggle');
    const light = theme === 'light';
    if (light) document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
    if (toggle) {
      toggle.setAttribute('aria-checked', light ? 'true' : 'false');
      const icon = toggle.querySelector('i');
      if (icon) icon.className = light ? 'fas fa-sun' : 'fas fa-moon';
    }
    document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.setAttribute('content', light ? '#eef1f8' : '#05070f'));
  }
  function toggleTheme() {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next);
    store.set('theme', next);
    haptic();
    requestAnimationFrame(() => { moveNavIndicator(); moveSegmentThumb(); });
  }
  function setupTheme() {
    applyTheme(store.get('theme') === 'light' ? 'light' : 'dark');
    const toggle = $('#theme-toggle');
    if (toggle) toggle.addEventListener('click', toggleTheme);
  }

  /* ---------- Scroll UI: progress, hide-on-scroll nav, back to top, timeline fill ---------- */
  function setupScrollUI() {
    const bar = $('#scroll-progress');
    const toTop = $('#back-to-top');
    const nav = $('.island-wrap');
    const tl = $('#vtimeline');
    const tlFill = $('#vtimeline-progress');
    let lastY = window.scrollY;
    let ticking = false;

    function update() {
      const h = document.documentElement;
      const y = h.scrollTop || window.scrollY;
      const max = h.scrollHeight - h.clientHeight;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      if (toTop) toTop.classList.toggle('show', y > 600);
      if (nav) {
        nav.classList.toggle('scrolled', y > 20);
        const goingDown = y > lastY + 4;
        const goingUp = y < lastY - 4;
        if (goingDown && y > 400) nav.classList.add('hide');
        else if (goingUp || y < 400) nav.classList.remove('hide');
      }
      if (tl && tlFill) {
        const r = tl.getBoundingClientRect();
        const vh = window.innerHeight;
        const p = Math.min(Math.max((vh * 0.6 - r.top) / r.height, 0), 1);
        tlFill.style.transform = `scaleY(${p})`;
      }
      lastY = y;
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
    if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' }));
  }

  /* ---------- Sliding nav indicator + active section ---------- */
  const indicator = $('#nav-indicator');
  function moveNavIndicator() {
    if (!indicator) return;
    const active = $('.island-links .nav-link.active');
    if (!active || !active.offsetParent) { indicator.classList.remove('ready'); return; }
    const li = active.parentElement;
    indicator.style.width = active.offsetWidth + 'px';
    indicator.style.transform = `translateX(${li.offsetLeft}px)`;
    indicator.classList.add('ready');
  }
  function setupActiveNav() {
    const sections = $$('main section[id]');
    const links = $$('.nav-link');
    const setActive = (id) => {
      links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
      moveNavIndicator();
    };
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        let id = entry.target.id;
        if (id === 'resume') id = 'projects';
        setActive(id);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => io.observe(s));
    setActive('home');
    window.addEventListener('resize', moveNavIndicator);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveNavIndicator);
  }

  /* ---------- Typewriter ---------- */
  function setupTypewriter() {
    const el = $('#typewriter');
    if (!el) return;
    const lines = [
      'Full Stack Developer | Salesforce Engineer | AI Builder',
      'Currently: building intelligent enterprise automation @ Dicomano',
      'Stack: Apex · React · Node · PostgreSQL · AWS · Claude AI',
      'Turning complex problems into elegant, reliable solutions.'
    ];
    if (prefersReduced) { el.textContent = lines[0]; return; }
    let li = 0, ci = 0, deleting = false;
    (function tick() {
      const line = lines[li];
      el.textContent = line.slice(0, ci);
      if (!deleting) {
        if (ci < line.length) { ci++; setTimeout(tick, 42); }
        else { deleting = true; setTimeout(tick, 1900); }
      } else {
        if (ci > 0) { ci--; setTimeout(tick, 20); }
        else { deleting = false; li = (li + 1) % lines.length; setTimeout(tick, 350); }
      }
    })();
  }

  /* ---------- Scroll reveal (staggered) ---------- */
  function setupReveal() {
    const els = $$('.reveal');
    if (prefersReduced || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('visible')); return; }
    const io = new IntersectionObserver((entries) => {
      const visible = entries.filter(e => e.isIntersecting);
      visible.forEach((entry, i) => {
        entry.target.style.transitionDelay = (i * 70) + 'ms';
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
        setTimeout(() => { entry.target.style.transitionDelay = ''; }, 900 + i * 70);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(e => io.observe(e));
  }

  /* ---------- Skill bars ---------- */
  function setupSkillBars() {
    const rows = $$('.skill-row');
    const fill = (row) => {
      const bar = row.querySelector('.skill-fill');
      if (bar) bar.style.width = row.dataset.level + '%';
    };
    if (prefersReduced || !('IntersectionObserver' in window)) { rows.forEach(fill); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) { fill(entry.target); io.unobserve(entry.target); } });
    }, { threshold: 0.4 });
    rows.forEach(r => io.observe(r));
  }

  /* ---------- Pointer-driven glass effects ---------- */
  function setupPointerFX() {
    if (!finePointer || prefersReduced) return;

    // Specular light that follows the cursor across glass surfaces
    document.addEventListener('pointermove', (e) => {
      const el = e.target.closest('.spotlight');
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });

    // 3D tilt
    $$('.tilt').forEach(card => {
      const max = card.classList.contains('portrait-card') ? 10 : 6;
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transition = 'transform 0.12s ease-out';
        card.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener('pointerleave', () => {
        card.style.transition = '';
        card.style.transform = '';
      });
    });

    // Magnetic buttons
    $$('.magnetic').forEach(btn => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });

    // Parallax: floating hero chips + ambient blobs
    const hero = $('#hero-visual');
    const chips = $$('[data-depth]');
    const blobs = $$('.blob');
    let raf = null, tx = 0, ty = 0;
    window.addEventListener('pointermove', (e) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        if (hero && window.scrollY < window.innerHeight) {
          chips.forEach(c => {
            const d = parseFloat(c.dataset.depth) || 0;
            c.style.transform = `translate3d(${tx * d}px, ${ty * d}px, 0)`;
          });
        }
        blobs.forEach((b, i) => {
          const d = (i + 1) * 12;
          b.style.translate = `${tx * d}px ${ty * d}px`;
        });
        raf = null;
      });
    }, { passive: true });
  }

  /* ---------- Segmented project filter ---------- */
  const seg = $('#project-filter');
  function moveSegmentThumb() {
    if (!seg) return;
    const thumb = seg.querySelector('.segmented-thumb');
    const active = seg.querySelector('[aria-selected="true"]');
    if (!thumb || !active) return;
    thumb.style.width = active.offsetWidth + 'px';
    thumb.style.transform = `translateX(${active.offsetLeft}px)`;
  }
  function setupFilter() {
    if (!seg) return;
    const cards = $$('.project-card');
    const empty = $('#empty-state');
    seg.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', b === btn ? 'true' : 'false'));
      moveSegmentThumb();
      haptic();
      const f = btn.dataset.filter;
      let shown = 0;
      cards.forEach(card => {
        const match = f === 'all' || (card.dataset.cat || '').split(' ').includes(f);
        card.classList.toggle('is-hidden', !match);
        card.classList.remove('pop-in');
        if (match) {
          shown++;
          card.classList.add('visible');
          if (!prefersReduced) { void card.offsetWidth; card.classList.add('pop-in'); }
        }
      });
      if (empty) empty.hidden = shown > 0;
    });
    // keyboard: arrows move between segments
    seg.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const btns = $$('button', seg);
      const i = btns.indexOf(document.activeElement);
      if (i < 0) return;
      const next = btns[(i + (e.key === 'ArrowRight' ? 1 : btns.length - 1)) % btns.length];
      next.focus(); next.click();
    });
    window.addEventListener('resize', moveSegmentThumb);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveSegmentThumb);
    moveSegmentThumb();
  }

  /* ---------- Quick-look bottom sheet ---------- */
  function setupSheet() {
    const backdrop = $('#sheet-backdrop');
    const sheet = $('#sheet');
    const body = $('#sheet-body');
    const closeBtn = $('#sheet-close');
    if (!backdrop || !sheet) return;
    let lastFocus = null;

    function open(card) {
      lastFocus = document.activeElement;
      body.innerHTML = '';
      ['.card-thumb', '.badge-featured', 'h3', 'p', '.tech-pills', '.card-links'].forEach(sel => {
        const n = card.querySelector(sel);
        if (n) body.appendChild(n.cloneNode(true));
      });
      const h = body.querySelector('h3');
      if (h) h.id = 'sheet-title';
      // upgrade small link chips to full buttons inside the sheet
      body.querySelectorAll('.card-link').forEach((a, i) => { a.className = 'btn btn-sm' + (i ? ' btn-glass' : ''); });
      backdrop.hidden = false;
      sheet.style.setProperty('--drag', '0px');
      requestAnimationFrame(() => backdrop.classList.add('open'));
      document.body.style.overflow = 'hidden';
      setTimeout(() => closeBtn && closeBtn.focus(), 50);
    }
    function close() {
      backdrop.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(() => { backdrop.hidden = true; sheet.style.setProperty('--drag', '0px'); }, prefersReduced ? 0 : 450);
      if (lastFocus) lastFocus.focus();
    }

    $$('.project-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('a')) return; // let real links work
        open(card);
      });
      card.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target === card) { e.preventDefault(); open(card); }
      });
    });
    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !backdrop.hidden) close(); });

    // drag-to-dismiss on the grabber/top of the sheet
    let startY = null, dy = 0;
    sheet.addEventListener('pointerdown', (e) => {
      if (sheet.scrollTop > 0 || e.target.closest('a, button')) return;
      if (e.clientY - sheet.getBoundingClientRect().top > 90) return;
      startY = e.clientY; dy = 0;
      sheet.classList.add('dragging');
      sheet.setPointerCapture(e.pointerId);
    });
    sheet.addEventListener('pointermove', (e) => {
      if (startY === null) return;
      dy = Math.max(0, e.clientY - startY);
      sheet.style.setProperty('--drag', dy + 'px');
    });
    const end = () => {
      if (startY === null) return;
      startY = null;
      sheet.classList.remove('dragging');
      if (dy > 120) close(); else sheet.style.setProperty('--drag', '0px');
    };
    sheet.addEventListener('pointerup', end);
    sheet.addEventListener('pointercancel', end);
  }

  /* ---------- Spotlight search (⌘K / Ctrl+K) ---------- */
  function setupSpotlight() {
    const backdrop = $('#spotlight');
    const input = $('#spotlight-input');
    const list = $('#spotlight-results');
    const trigger = $('#spotlight-open');
    if (!backdrop || !input || !list) return;

    const hint = trigger && trigger.querySelector('.kbd-hint');
    const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    if (hint && !isMac) hint.textContent = 'Ctrl K';

    const items = [];
    const goto = (sel) => () => { const t = $(sel); if (t) scrollToTarget(t); };
    [['Home', '#home', 'fa-house'], ['About', '#about', 'fa-user'], ['Journey', '#timeline', 'fa-route'],
     ['Projects', '#projects', 'fa-layer-group'], ['Résumé', '#resume', 'fa-file-lines'], ['Contact', '#contact', 'fa-paper-plane']]
      .forEach(([label, sel, icon]) => items.push({ group: 'Sections', label, icon, run: goto(sel) }));

    $$('.project-card').forEach(card => {
      const title = card.querySelector('h3').textContent.trim();
      const tags = $$('.pill', card).map(p => p.textContent).join(' ');
      items.push({ group: 'Projects', label: title, hint: tags, icon: 'fa-cube', run: () => { scrollToTarget(card); setTimeout(() => card.click(), prefersReduced ? 0 : 600); } });
    });
    $$('.more-item').forEach(a => {
      items.push({ group: 'Projects', label: a.querySelector('strong').textContent, hint: 'GitHub', icon: 'fa-code-branch', run: () => window.open(a.href, '_blank', 'noopener') });
    });

    items.push(
      { group: 'Actions', label: 'Toggle light / dark mode', icon: 'fa-circle-half-stroke', run: toggleTheme },
      { group: 'Actions', label: 'Copy email address', icon: 'fa-copy', run: () => copy('gabrielab5000@gmail.com', 'Email copied') },
      { group: 'Actions', label: 'Download résumé (PDF)', icon: 'fa-download', run: () => { const a = document.createElement('a'); a.href = 'Gabriela-Brailovsky-Resume.pdf'; a.download = ''; a.click(); } },
      { group: 'Links', label: 'GitHub', hint: 'github.com/Gabrielab5', icon: 'fa-github', brand: true, run: () => window.open('https://github.com/Gabrielab5', '_blank', 'noopener') },
      { group: 'Links', label: 'LinkedIn', hint: 'in/gabrielabrail', icon: 'fa-linkedin-in', brand: true, run: () => window.open('https://www.linkedin.com/in/gabrielabrail/', '_blank', 'noopener') }
    );

    let filtered = items, active = 0, lastFocus = null;

    function render() {
      const q = input.value.trim().toLowerCase();
      filtered = !q ? items : items.filter(it => (it.label + ' ' + (it.hint || '') + ' ' + it.group).toLowerCase().includes(q));
      active = Math.min(active, Math.max(filtered.length - 1, 0));
      list.innerHTML = '';
      if (!filtered.length) {
        const li = document.createElement('li');
        li.className = 'sr-empty';
        li.textContent = 'No results';
        list.appendChild(li);
        return;
      }
      let group = '';
      filtered.forEach((it, idx) => {
        if (it.group !== group) {
          group = it.group;
          const g = document.createElement('li');
          g.className = 'sr-group'; g.textContent = group; g.setAttribute('role', 'presentation');
          list.appendChild(g);
        }
        const li = document.createElement('li');
        li.className = 'sr-item' + (idx === active ? ' active' : '');
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', idx === active ? 'true' : 'false');
        const i = document.createElement('i');
        i.className = (it.brand ? 'fab ' : 'fas ') + it.icon;
        const span = document.createElement('span');
        span.textContent = it.label;
        li.append(i, span);
        if (it.hint) { const s = document.createElement('small'); s.textContent = it.hint.length > 28 ? it.hint.slice(0, 28) + '…' : it.hint; li.appendChild(s); }
        li.addEventListener('click', () => run(idx));
        li.addEventListener('pointermove', () => { if (active !== idx) { active = idx; highlight(); } });
        list.appendChild(li);
      });
    }
    function highlight() {
      $$('.sr-item', list).forEach((li, idx) => {
        li.classList.toggle('active', idx === active);
        li.setAttribute('aria-selected', idx === active ? 'true' : 'false');
        if (idx === active) li.scrollIntoView({ block: 'nearest' });
      });
    }
    function run(idx) { const it = filtered[idx]; close(); if (it) setTimeout(it.run, 60); }
    function open() {
      lastFocus = document.activeElement;
      backdrop.hidden = false;
      input.value = ''; active = 0; render();
      requestAnimationFrame(() => backdrop.classList.add('open'));
      setTimeout(() => input.focus(), 30);
    }
    function close() {
      backdrop.classList.remove('open');
      setTimeout(() => { backdrop.hidden = true; }, prefersReduced ? 0 : 250);
      if (lastFocus && lastFocus !== document.body) lastFocus.focus();
    }

    if (trigger) trigger.addEventListener('click', open);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
    input.addEventListener('input', () => { active = 0; render(); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, filtered.length - 1); highlight(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(active - 1, 0); highlight(); }
      else if (e.key === 'Enter') { e.preventDefault(); run(active); }
    });
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); backdrop.hidden ? open() : close(); }
      else if (e.key === '/' && backdrop.hidden && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); open(); }
      else if (e.key === 'Escape' && !backdrop.hidden) close();
    });
  }

  /* ---------- Copy to clipboard ---------- */
  function copy(text, msg) {
    const done = () => { toast(msg || 'Copied'); haptic(); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, () => fallback());
    } else fallback();
    function fallback() {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { toast('Copy failed', 'fa-circle-xmark'); }
      ta.remove();
    }
  }
  function setupCopy() {
    $$('.copy-btn').forEach(btn => btn.addEventListener('click', () => {
      copy(btn.dataset.copy, btn.getAttribute('aria-label').replace('Copy ', '').replace(/^\w/, c => c.toUpperCase()) + ' copied');
      const i = btn.querySelector('i');
      if (i) { i.className = 'fas fa-check'; setTimeout(() => { i.className = 'far fa-copy'; }, 1500); }
    }));
  }

  /* ---------- Local time in Israel ---------- */
  function setupLocalTime() {
    const el = $('#local-time');
    if (!el) return;
    const fmt = () => {
      try {
        el.textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jerusalem' }) + ' local';
      } catch (e) { el.remove(); }
    };
    fmt(); setInterval(fmt, 30000);
  }

  /* ---------- More projects accordion ---------- */
  function setupAccordion() {
    const toggle = $('#more-toggle');
    const list = $('#more-list');
    if (!toggle || !list) return;
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
      list.hidden = open;
      haptic();
    });
  }

  /* ---------- Count-up ---------- */
  function animateCount(el, target) {
    if (!el) return;
    if (prefersReduced) { el.textContent = target.toLocaleString(); return; }
    const dur = 1400, start = performance.now();
    (function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  /* ---------- Live GitHub stats (static fallback) ---------- */
  function setupStats() {
    const reposEl = $('#stat-repos');
    const starsEl = $('#stat-stars');
    const langEl = $('#stat-lang');
    const activeEl = $('#stat-active');
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
      io.observe($('.stats-bar'));
    } else runCount();

    fetch('https://api.github.com/users/Gabrielab5/repos?per_page=100&sort=pushed')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(repos => {
        if (!Array.isArray(repos) || !repos.length) return;
        const stars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
        const langCount = {};
        repos.forEach(r => { if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1; });
        const topLang = Object.keys(langCount).sort((a, b) => langCount[b] - langCount[a])[0];
        reposEl.dataset.target = repos.length;
        starsEl.dataset.target = stars;
        if (counted) { reposEl.textContent = repos.length.toLocaleString(); starsEl.textContent = stars.toLocaleString(); }
        if (topLang && langEl) langEl.textContent = topLang;
        if (repos[0] && repos[0].pushed_at && activeEl) {
          activeEl.textContent = new Date(repos[0].pushed_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }
      })
      .catch(() => { /* keep static fallback values */ });
  }

  /* ---------- Contact form (EmailJS) ---------- */
  function setupContactForm() {
    const contactForm = $('#contact-form');
    if (!contactForm) return;

    const message = $('#message');
    const counter = $('#char-count');
    if (message && counter) {
      const max = message.getAttribute('maxlength') || 1500;
      const upd = () => { counter.textContent = `${message.value.length} / ${max}`; };
      message.addEventListener('input', upd); upd();
    }

    if (typeof emailjs === 'undefined') { console.warn('EmailJS not loaded.'); return; }

    // EmailJS public identifiers — client-side publishable keys (safe to expose).
    // Account-level protection is enforced via EmailJS allowed-origins + the template's "To" address.
    const EMAILJS_PUBLIC_KEY = 'yzlDBiUW1zDE6a7SU';
    const EMAILJS_SERVICE_ID = 'service_pyvswzw';
    const EMAILJS_TEMPLATE_ID = 'template_e0w03h2';
    emailjs.init(EMAILJS_PUBLIC_KEY);

    const successModal = $('#success-modal');
    const errorModal = $('#error-modal');
    const submitBtn = $('#submit-btn');
    const emailError = $('#email-error');
    const messageError = $('#message-error');
    const emailInput = $('#email');
    const errorMessageText = $('#error-message-text');

    const closeModals = () => { successModal.classList.add('hidden'); if (errorModal) errorModal.classList.add('hidden'); };
    $$('.modal .close-button').forEach(btn => btn.addEventListener('click', closeModals));
    [successModal, errorModal].forEach(m => { if (m) m.addEventListener('click', (e) => { if (e.target === m) m.classList.add('hidden'); }); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModals(); });

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email).toLowerCase());
    const flag = (input, on) => {
      const g = input.closest('.form-group');
      if (!g) return;
      g.classList.remove('invalid');
      if (on) { void g.offsetWidth; g.classList.add('invalid'); }
    };
    [emailInput, message].forEach(inp => inp.addEventListener('input', () => flag(inp, false)));

    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();
      emailError.textContent = '';
      messageError.textContent = '';
      if (errorMessageText) errorMessageText.textContent = '';
      if (errorModal) errorModal.classList.add('hidden');

      let isValid = true;
      if (!validateEmail(emailInput.value.trim())) { emailError.textContent = 'Please enter a valid email address.'; flag(emailInput, true); isValid = false; }
      if (message.value.trim() === '') { messageError.textContent = 'Please enter a message.'; flag(message, true); isValid = false; }
      if (!isValid) { haptic(); return; }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Sending…';

      emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, this)
        .then(() => {
          successModal.classList.remove('hidden');
          toast('Message sent');
          contactForm.reset();
          if (counter) counter.textContent = `0 / ${message.getAttribute('maxlength') || 1500}`;
        }, (error) => {
          console.error('EmailJS FAILED to send:', error);
          if (errorModal && errorMessageText) {
            errorMessageText.textContent = 'Failed to send message. Please try again later.';
            errorModal.classList.remove('hidden');
          } else {
            toast('Something went wrong', 'fa-circle-xmark');
          }
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Send Message <i class="fas fa-paper-plane"></i>';
        });
    });
  }

  setupAnchors();
  setupTheme();
  setupScrollUI();
  setupActiveNav();
  setupTypewriter();
  setupReveal();
  setupSkillBars();
  setupPointerFX();
  setupFilter();
  setupSheet();
  setupSpotlight();
  setupCopy();
  setupLocalTime();
  setupAccordion();
  setupStats();
  setupContactForm();
});
