/* ============================================================
   ナースのマネどく - サイト共通スクリプト
   ・ヘッダーのスクロール演出
   ・モバイルメニュー
   ・スクロールリベール（要素のフェードイン）
   ・カウントアップ統計
   ・トップへ戻るボタン
   ・ヒーロー背景のパーティクル演出（canvas）
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- モバイルメニュー ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      navToggle.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.textContent = '☰';
      });
    });
  }

  /* ---------- ヘッダー：スクロールで縮小 ---------- */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- スクロールリベール ---------- */
  const revealTargets = document.querySelectorAll(
    '.card, .voice, .series-card, .article-card, .concept, .cta-banner, .featured-article, .timeline li, .section-head, .hero-card, .pull-quote'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = (parseInt(el.dataset.delayIndex || '0', 10)) * 70;
          setTimeout(() => el.classList.add('is-visible'), delay);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    // グループ内で連番のディレイをつける（カード等が順番に浮き上がる演出）
    const groups = document.querySelectorAll('.grid-3, .voice-list, .series-grid');
    groups.forEach(group => {
      Array.from(group.children).forEach((child, idx) => {
        child.dataset.delayIndex = idx;
      });
    });

    revealTargets.forEach(el => io.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- カウントアップ統計 ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const countIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const decimals = el.dataset.count.includes('.') ? el.dataset.count.split('.')[1].length : 0;
        const duration = 1400;
        const start = performance.now();

        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          const value = target * eased;
          el.textContent = value.toFixed(decimals) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = target.toFixed(decimals) + suffix;
        };
        requestAnimationFrame(tick);
        countIo.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => countIo.observe(el));
  }

  /* ---------- トップへ戻るボタン ---------- */
  const backTop = document.createElement('button');
  backTop.className = 'back-to-top';
  backTop.setAttribute('aria-label', 'トップへ戻る');
  backTop.innerHTML = '↑';
  document.body.appendChild(backTop);

  window.addEventListener('scroll', () => {
    backTop.classList.toggle('show', window.scrollY > 480);
  }, { passive: true });

  backTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- ヒーロー背景：フローティングパーティクル ---------- */
  const canvas = document.getElementById('heroCanvas');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let width, height, dpr;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.width = rect.width * dpr;
      height = canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    };

    const initParticles = () => {
      const count = Math.round((width * height) / (26000 * dpr * dpr));
      particles = Array.from({ length: Math.max(14, Math.min(count, 34)) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: (Math.random() * 2.2 + 1.2) * dpr,
        vx: (Math.random() - 0.5) * 0.18 * dpr,
        vy: (Math.random() - 0.35) * 0.16 * dpr,
        alpha: Math.random() * 0.35 + 0.15
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // 粒子同士をつなぐ線
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i], p2 = particles[j];
          const dx = p1.x - p2.x, dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 140 * dpr;
          if (dist < maxDist) {
            ctx.strokeStyle = `rgba(46,139,217,${0.12 * (1 - dist / maxDist)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(18,87,143,${p.alpha})`;
        ctx.fill();
      });

      if (!prefersReducedMotion) requestAnimationFrame(draw);
    };

    resize();
    initParticles();
    draw();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { resize(); initParticles(); }, 200);
    });
  }

  /* ---------- ヘッダー高さ分だけアンカー位置を調整 ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        const offset = (header ? header.offsetHeight : 0) + 12;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
      }
    });
  });

});
