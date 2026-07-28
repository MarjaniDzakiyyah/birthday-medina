/* ============================================================
   script.js — Birthday Website
   Vanilla JavaScript, Modular, No Framework
   ============================================================ */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);
const wait = (ms) => new Promise((res) => setTimeout(res, ms));

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============================================================
// CANVAS: STARS (opening & ending)
// ============================================================

function initStars(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  let W, H;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    createStars();
  }

  function createStars() {
    const count = prefersReducedMotion ? 0 : 140;
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.3 + 0.3,
      alpha: Math.random(),
      speed: Math.random() * 0.004 + 0.001,
      drift: (Math.random() - 0.5) * 0.12,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    stars.forEach((s) => {
      s.alpha += s.speed;
      if (s.alpha > 1) s.speed *= -1;
      if (s.alpha < 0) { s.speed *= -1; s.alpha = 0; }
      s.x += s.drift;
      if (s.x < 0) s.x = W;
      if (s.x > W) s.x = 0;

      ctx.save();
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle = '#F3E9D2';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    if (!prefersReducedMotion) requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
}

// ============================================================
// OPENING PARTICLES
// ============================================================

function initOpeningParticles() {
  const container = $('#opening-particles');
  if (!container || prefersReducedMotion) return;

  const count = 18;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    const size = Math.random() * 5 + 2;
    const left = Math.random() * 100;
    const duration = Math.random() * 12 + 10;
    const delay = Math.random() * 8;

    p.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${left}%;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      opacity: 0;
    `;
    container.appendChild(p);
  }
}

// ============================================================
// OPENING SEQUENCE
// ============================================================

async function runOpeningSequence() {
  const lines = $$('.opening-line');
  const btn = $('#open-gift-btn');

  lines.forEach((line) => {
    const delay = parseInt(line.dataset.delay, 10) || 0;
    setTimeout(() => {
      line.classList.add('visible');
    }, delay);
  });

  const lastDelay = parseInt(lines[lines.length - 1]?.dataset.delay || 0, 10);
  await wait(lastDelay + 1800);
  btn.hidden = false;
  btn.style.display = 'inline-block';
}

// ============================================================
// OPEN GIFT
// ============================================================

function initOpenGiftButton() {
  const btn = $('#open-gift-btn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    playMusic();

    const opening = $('#opening');
    opening.classList.add('hide');

    await wait(700);

    const main = $('#main-content');
    main.hidden = false;
    await wait(50);
    main.classList.add('visible');

    const musicControl = $('#music-control');
    if (musicControl) {
      musicControl.hidden = false;
      musicControl.style.animation = 'fadeInUp 0.8s ease forwards';
    }

    await wait(400);
    document.getElementById('section-about').scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
}

// ============================================================
// MUSIC PLAYER
// ============================================================

let musicPlaying = false;

function playMusic() {
  const audio = $('#bg-music');
  if (!audio) return;
  audio.volume = 0.4;
  audio.play().catch(() => {
    console.warn('Audio play was blocked by browser policy.');
  });
  musicPlaying = true;
}

function initMusicControl() {
  const btn = $('#music-control');
  const audio = $('#bg-music');
  if (!btn || !audio) return;

  btn.addEventListener('click', () => {
    if (musicPlaying) {
      audio.pause();
      musicPlaying = false;
      $('.music-icon', btn).textContent = '♪';
      btn.style.opacity = '0.6';
    } else {
      audio.play();
      musicPlaying = true;
      $('.music-icon', btn).textContent = '♫';
      btn.style.opacity = '1';
    }
  });
}

// ============================================================
// SCROLL PROGRESS BAR
// ============================================================

function initScrollProgress() {
  const bar = $('#scroll-progress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / total) * 100;
    bar.style.width = `${Math.min(progress, 100)}%`;
  }, { passive: true });
}

// ============================================================
// SCROLL REVEAL
// ============================================================

function initScrollReveal() {
  if (prefersReducedMotion) {
    $$('.reveal, .reveal-ending').forEach((el) => el.classList.add('active'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal, .reveal-ending').forEach((el) => observer.observe(el));
}

// ============================================================
// GIFT BOX
// ============================================================

function initGiftBox() {
  const box = $('#gift-box');
  const reveal = $('#gift-reveal');
  if (!box || !reveal) return;

  let opened = false;

  const openBox = async () => {
    if (opened) return;
    opened = true;

    box.classList.add('opened');
    if (!prefersReducedMotion) {
      box.style.animation = 'giftShake 0.5s ease';
      await wait(500);
      box.style.animation = '';
    }

    await wait(prefersReducedMotion ? 50 : 400);

    reveal.hidden = false;
    reveal.style.opacity = '0';
    reveal.style.transform = 'translateY(20px)';
    await wait(50);
    reveal.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    reveal.style.opacity = '1';
    reveal.style.transform = 'translateY(0)';
  };

  box.addEventListener('click', openBox);
  box.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') openBox(); });
}

// ============================================================
// ENVELOPE
// ============================================================

function initEnvelope() {
  const envelope = $('#envelope');
  const letterWrapper = $('#letter-wrapper');
  if (!envelope || !letterWrapper) return;

  let opened = false;

  const openEnvelope = async () => {
    if (opened) return;
    opened = true;

    envelope.classList.add('opened');
    await wait(prefersReducedMotion ? 100 : 900);

    envelope.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    envelope.style.opacity = '0';
    envelope.style.transform = 'translateY(-20px)';
    await wait(prefersReducedMotion ? 50 : 600);
    envelope.style.display = 'none';

    letterWrapper.hidden = false;
  };

  envelope.addEventListener('click', openEnvelope);
  envelope.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') openEnvelope(); });
}

// ============================================================
// CONFETTI — runs once when birthday section is reached
// ============================================================

function initConfetti() {
  const canvas = $('#confetti-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H;
  let particles = [];
  let running = false;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  const COLORS = ['#D4A24C', '#E8C784', '#B33A3A', '#E8B4BC', '#3D6B8C', '#F3E9D2'];

  function createParticles() {
    const count = prefersReducedMotion ? 0 : 90;
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H - H,
      w: Math.random() * 9 + 4,
      h: Math.random() * 5 + 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      speed: Math.random() * 2.6 + 1.8,
      rotation: Math.random() * Math.PI * 2,
      tiltSpeed: Math.random() * 0.1 + 0.05,
    }));
  }

  function drawFrame() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);

    let allOut = true;
    particles.forEach((p) => {
      p.y += p.speed;
      p.rotation += p.tiltSpeed;
      if (p.y < H + 20) allOut = false;

      ctx.save();
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    if (!allOut) requestAnimationFrame(drawFrame);
    else { running = false; ctx.clearRect(0, 0, W, H); }
  }

  const section = document.getElementById('section-birthday');
  if (!section) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !running) {
        running = true;
        createParticles();
        drawFrame();
        spawnHearts();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(section);
}

// ============================================================
// FLOATING HEARTS — modest count, complements confetti instead of competing
// ============================================================

function spawnHearts() {
  const container = $('#hearts-container');
  if (!container || prefersReducedMotion) return;

  const emojis = ['❤️', '⭐', '✨'];
  let count = 0;
  const maxHearts = 14;

  const interval = setInterval(() => {
    if (count >= maxHearts) { clearInterval(interval); return; }
    count++;

    const heart = document.createElement('span');
    heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    heart.style.cssText = `
      position: absolute;
      left: ${Math.random() * 100}%;
      bottom: -40px;
      font-size: ${Math.random() * 16 + 14}px;
      animation: floatUp ${Math.random() * 4 + 4}s ease forwards;
      pointer-events: none;
      opacity: 0;
    `;
    container.appendChild(heart);

    setTimeout(() => heart.remove(), 8000);
  }, 260);
}

// ============================================================
// ENDING STARS
// ============================================================

function initEndingStars() {
  initStars('ending-stars');
}

// ============================================================
// RESTART
// ============================================================

function restartWebsite() {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });

  setTimeout(() => {
    const opening = document.getElementById('opening');
    if (opening) opening.classList.remove('hide');

    const main = document.getElementById('main-content');
    if (main) {
      main.hidden = true;
      main.classList.remove('visible');
    }

    const musicControl = document.getElementById('music-control');
    if (musicControl) musicControl.hidden = true;

    const audio = document.getElementById('bg-music');
    if (audio) { audio.pause(); audio.currentTime = 0; }
    musicPlaying = false;

    document.querySelectorAll('.opening-line').forEach((line) => {
      line.classList.remove('visible');
    });

    const btn = document.getElementById('open-gift-btn');
    if (btn) btn.hidden = true;

    setTimeout(() => runOpeningSequence(), 500);
  }, prefersReducedMotion ? 50 : 800);
}

// ============================================================
// PARALLAX on timeline photos
// ============================================================

function initParallax() {
  if (prefersReducedMotion) return;
  const photos = $$('.timeline-photo');
  if (!photos.length) return;

  window.addEventListener('scroll', () => {
    photos.forEach((photo) => {
      const rect = photo.closest('.timeline-item').getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      const offset = center * 0.05;
      photo.style.transform = `translateY(${offset}px)`;
    });
  }, { passive: true });
}

// ============================================================
// GIFT BOX SHAKE KEYFRAME
// ============================================================

function injectGiftShakeAnimation() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes giftShake {
      0%,100%{ transform: translateX(0) scale(1.04); }
      20%{ transform: translateX(-8px) scale(1.04); }
      40%{ transform: translateX(8px) scale(1.04); }
      60%{ transform: translateX(-5px) scale(1.04); }
      80%{ transform: translateX(5px) scale(1.04); }
    }
  `;
  document.head.appendChild(style);
}

// ============================================================
// MAIN INIT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initStars('stars-canvas');
  initOpeningParticles();
  runOpeningSequence();
  initOpenGiftButton();

  initMusicControl();

  initScrollProgress();
  initScrollReveal();
  initGiftBox();
  initEnvelope();
  initConfetti();
  initEndingStars();
  initParallax();
  injectGiftShakeAnimation();
});

window.restartWebsite = restartWebsite;