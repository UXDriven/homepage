(() => {
  'use strict';

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const preloader = $('#preloader');
  const loadingNumber = $('#loading-number');
  let hasSeenIntro = false;
  try { hasSeenIntro = sessionStorage.getItem('uxdriven-intro-seen') === 'yes'; } catch (_) { /* storage may be disabled */ }

  // A short, non-blocking opening. Motion-sensitive visitors enter immediately.
  if (preloader) {
    if (reduceMotion || hasSeenIntro) {
      preloader.remove();
    } else {
      document.body.classList.add('is-loading');
      const start = performance.now();
      const length = 1780;
      const updateLoading = (now) => {
        if (!preloader.isConnected) return;
        const ratio = Math.min((now - start) / length, 1);
        if (loadingNumber) loadingNumber.textContent = `${String(Math.round(ratio * 100)).padStart(2, '0')}%`;
        if (ratio < 1) requestAnimationFrame(updateLoading);
      };
      requestAnimationFrame(updateLoading);
      setTimeout(() => {
        preloader.classList.add('done');
        document.body.classList.remove('is-loading');
        try { sessionStorage.setItem('uxdriven-intro-seen', 'yes'); } catch (_) { /* private browsing */ }
        setTimeout(() => preloader.remove(), 1200);
      }, length);
    }
  }

  const header = $('.site-header');
  const progress = $('#scroll-progress');
  let ticking = false;
  const updateScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    header?.classList.toggle('scrolled', scrollTop > 24);
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (progress) progress.style.width = `${Math.min(100, scrollTop / scrollable * 100)}%`;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(updateScroll); }
  }, { passive: true });
  updateScroll();

  const menuButton = $('#menu-toggle');
  const mobileNav = $('#mobile-nav');
  const toggleMenu = (open) => {
    if (!menuButton || !mobileNav) return;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menuButton.classList.toggle('active', open);
    mobileNav.hidden = !open;
  };
  menuButton?.addEventListener('click', () => toggleMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  $$('a', mobileNav || document).forEach(link => link.addEventListener('click', () => toggleMenu(false)));
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') toggleMenu(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) toggleMenu(false);
  }, { passive: true });

  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -30px 0px' });
    $$('.reveal').forEach(el => observer.observe(el));
  } else $$('.reveal').forEach(el => el.classList.add('visible'));

  // Circular pointer inspired by studio interfaces, with a subtle magnetic state.
  if (!coarsePointer && !reduceMotion) {
    const ring = $('#cursor-ring');
    const dot = $('#cursor-dot');
    const point = { x: -100, y: -100 };
    const follow = { x: -100, y: -100 };
    let active = true;
    window.addEventListener('pointermove', event => {
      point.x = event.clientX;
      point.y = event.clientY;
    }, { passive: true });
    document.addEventListener('pointerover', event => {
      ring?.classList.toggle('hovered', !!event.target.closest('a, button, input, select, textarea, [tabindex="0"]'));
    });
    document.addEventListener('visibilitychange', () => { active = !document.hidden; });
    const animateCursor = () => {
      if (active && ring && dot) {
        follow.x += (point.x - follow.x) * .17;
        follow.y += (point.y - follow.y) * .17;
        ring.style.transform = `translate3d(${follow.x - ring.offsetWidth / 2}px, ${follow.y - ring.offsetHeight / 2}px, 0)`;
        dot.style.transform = `translate3d(${point.x - 2}px, ${point.y - 2}px, 0)`;
      }
      requestAnimationFrame(animateCursor);
    };
    requestAnimationFrame(animateCursor);

    // Individual translate adds depth without overriding each artwork's rotation.
    const hero = $('.hero-universe');
    const layers = $$('.float-layer, .floating-tag', hero || document);
    if (hero) {
      hero.addEventListener('pointermove', event => {
        const bounds = hero.getBoundingClientRect();
        const x = (event.clientX - (bounds.left + bounds.width / 2)) / bounds.width;
        const y = (event.clientY - (bounds.top + bounds.height / 2)) / bounds.height;
        layers.forEach(layer => {
          const depth = Number(layer.dataset.depth || .12);
          layer.style.translate = `${(x * depth * 95).toFixed(2)}px ${(y * depth * 75).toFixed(2)}px`;
        });
      });
      hero.addEventListener('pointerleave', () => {
        layers.forEach(layer => { layer.style.translate = '0px 0px'; });
      });
    }
  }

  // Lightweight animated constellation, respecting battery/network and motion settings.
  const canvas = $('#particles');
  if (canvas && !reduceMotion && !window.matchMedia('(prefers-reduced-data: reduce)').matches) {
    const ctx = canvas.getContext('2d', { alpha: true });
    if (ctx) {
      const particles = Array.from({ length: window.innerWidth < 700 ? 26 : 47 }, (_, i) => ({
        x: (Math.sin(i * 83.3) * 10000 % 1 + 1) % 1,
        y: (Math.sin(i * 29.7) * 10000 % 1 + 1) % 1,
        r: i % 7 === 0 ? 1.4 : .6,
        speed: .08 + i % 6 * .025,
        phase: i * 2.3
      }));
      let width = 0, height = 0, frame = 0;
      const resizeCanvas = () => {
        const bounds = canvas.getBoundingClientRect();
        width = bounds.width;
        height = bounds.height;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas, { passive: true });
      const drawParticles = () => {
        frame += 1;
        if (!document.hidden) {
          ctx.clearRect(0, 0, width, height);
          for (const p of particles) {
            const x = p.x * width + Math.sin(frame * .003 + p.phase) * 15;
            const y = ((p.y + frame * p.speed / 20000) % 1) * height;
            ctx.globalAlpha = .18 + Math.sin(frame * .016 + p.phase) * .12;
            ctx.fillStyle = p.r > 1 ? '#d7ff5f' : '#dcefe4';
            ctx.beginPath(); ctx.arc(x, y, p.r, 0, Math.PI * 2); ctx.fill();
          }
          ctx.globalAlpha = 1;
        }
        requestAnimationFrame(drawParticles);
      };
      requestAnimationFrame(drawParticles);
    }
  }

  // Live showcase. Tabs are keyboard-operable (Left/Right/Home/End).
  const tabs = $$('.lab-tabs [role="tab"]');
  const labStage = $('#lab-stage');
  const labIndex = $('#lab-index');
  const setScreen = (screen, focus = false) => {
    if (!labStage || !['web', 'app', 'ai'].includes(screen)) return;
    labStage.dataset.active = screen;
    const activeIndex = ['web', 'app', 'ai'].indexOf(screen);
    tabs.forEach(tab => {
      const selected = tab.dataset.screen === screen;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      tab.classList.toggle('active', selected);
      if (selected && focus) tab.focus();
    });
    ['web', 'app', 'ai'].forEach(name => {
      const panel = $(`#screen-${name}`);
      if (!panel) return;
      panel.hidden = name !== screen;
      panel.classList.toggle('active', name === screen);
    });
    if (labIndex) labIndex.textContent = String(activeIndex + 1).padStart(2, '0');
    const lines = $$('.lab-counter-lines i');
    lines.forEach((line, index) => { line.style.background = index === activeIndex ? 'var(--lime)' : '#3b4a41'; });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setScreen(tab.dataset.screen));
    tab.addEventListener('keydown', event => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      setScreen(tabs[next].dataset.screen, true);
    });
  });

  // Illustrative UX optimization comparison. Copy changes with the UI state.
  const stage = $('#comparison-stage');
  const compareButtons = $$('.comparison-switch button');
  const reports = {
    before: ['Pontos de fricção', 'Hierarquia visual dispersa', 'Proposta de valor pouco clara', 'Chamada para ação sem destaque', 'SIMULAÇÃO ILUSTRATIVA'],
    after: ['Melhorias de UX', 'Leitura e hierarquia mais claras', 'Mensagem alinhada à intenção', 'Ação principal em evidência', 'HIPÓTESES DE OTIMIZAÇÃO']
  };
  const setComparison = mode => {
    if (!stage || !reports[mode]) return;
    stage.dataset.mode = mode;
    compareButtons.forEach(button => {
      const active = button.dataset.compare === mode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const ids = ['report-title', 'report-one', 'report-two', 'report-three', 'report-foot-text'];
    ids.forEach((id, index) => { const el = $(`#${id}`); if (el) el.textContent = reports[mode][index]; });
  };
  compareButtons.forEach(button => button.addEventListener('click', () => setComparison(button.dataset.compare)));

  // Brief generator: handoff to the user's own WhatsApp or email app.
  const form = $('#brief-form');
  const briefResult = $('#brief-result');
  const output = $('#brief-output');
  const copyBrief = $('#copy-brief');
  const editBrief = $('#edit-brief');
  const sendWhatsApp = $('#send-whatsapp');
  const sendEmail = $('#send-email');
  const getBrief = () => {
    const data = new FormData(form);
    return `NOVO BRIEFING — UXDRIVEN\n\nNome / empresa: ${data.get('name')}\nEmail: ${data.get('email')}\nProjeto: ${data.get('type')}\n\nDesafio:\n${data.get('message')}\n\n— Resumo gerado no site UXDriven`;
  };
  form?.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const brief = getBrief();
    output.textContent = brief;
    if (sendWhatsApp) sendWhatsApp.href = `https://wa.me/5581996505291?text=${encodeURIComponent(brief)}`;
    if (sendEmail) sendEmail.href = `mailto:vitor.lucianetti@gmail.com?subject=${encodeURIComponent('Solicitação de orçamento — UXDriven')}&body=${encodeURIComponent(brief)}`;
    form.hidden = true;
    briefResult.hidden = false;
    copyBrief?.focus();
  });
  copyBrief?.addEventListener('click', async () => {
    const original = copyBrief.innerHTML;
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(output.textContent);
      else {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(output);
        selection.removeAllRanges(); selection.addRange(range);
        const copied = document.execCommand('copy');
        selection.removeAllRanges();
        if (!copied) throw new Error('copy failed');
      }
      copyBrief.textContent = 'Copiado! ✓';
    } catch (_) {
      copyBrief.textContent = 'Selecione e copie o texto acima';
      output.focus?.();
    }
    setTimeout(() => { copyBrief.innerHTML = original; }, 2600);
  });
  editBrief?.addEventListener('click', () => {
    briefResult.hidden = true;
    form.hidden = false;
    $('#brief-name')?.focus();
  });
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
