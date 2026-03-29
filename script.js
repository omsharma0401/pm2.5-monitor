/* ===========================
   CANVAS PARTICLE SYSTEM (light-mode tuned)
   =========================== */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let W, H, particles = [], raf;

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.r = Math.random() * 1.2 + 0.3;
    this.vx = (Math.random() - 0.5) * 0.25;
    this.vy = (Math.random() - 0.5) * 0.25;
    this.life = 0;
    this.maxLife = Math.random() * 400 + 200;
    const c = Math.random();
    // Darker muted colors readable on light backgrounds
    this.color = c < 0.4 ? '#0a8f6e' : c < 0.7 ? '#2356c9' : '#6d28d9';
  }
  step() {
    this.x += this.vx; this.y += this.vy;
    this.life++;
    if (this.life > this.maxLife || this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  }
  draw() {
    const alpha = Math.min(this.life / 60, 1, (this.maxLife - this.life) / 60) * 0.45;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < 80; i++) particles.push(new Particle());
}

// Draw faint connection lines between nearby particles
function drawLines() {
  ctx.lineWidth = 0.6;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 120) {
        const alpha = (1 - d / 120) * 0.07;
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#0a8f6e';
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  drawLines();
  particles.forEach(p => { p.step(); p.draw(); });
  ctx.globalAlpha = 1;
  raf = requestAnimationFrame(draw);
}

window.addEventListener('resize', () => { resize(); initParticles(); });
resize();
initParticles();
draw();


/* ===========================
   NAV SCROLL BEHAVIOR
   =========================== */
const nav = document.getElementById('nav');
const sections = document.querySelectorAll('section[id], header[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  // Nav scrolled class for shadow
  nav.classList.toggle('scrolled', window.scrollY > 10);

  // Active link
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 100) current = s.id;
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
  });
}, { passive: true });

/* ===========================
   INTERSECTION OBSERVER — REVEAL
   =========================== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.07 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Reveal children with stagger
const childObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const children = entry.target.querySelectorAll('.reveal-child');
      children.forEach((child, i) => {
        setTimeout(() => child.classList.add('visible'), i * 100);
      });
      childObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.findings').forEach(el => childObserver.observe(el));

/* ===========================
   ANIMATED STAT BARS (Hero)
   =========================== */
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.hero-stat-fill').forEach(fill => {
        fill.classList.add('animated');
      });
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
const heroStats = document.querySelector('.hero-stats');
if (heroStats) barObserver.observe(heroStats);

/* ===========================
   ANIMATED RESULT BARS
   =========================== */
const rcBarObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.rc-bar-fill').forEach(fill => {
        fill.classList.add('animated');
      });
      rcBarObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.results-cards').forEach(el => rcBarObserver.observe(el));

/* ===========================
   ANIMATED TIER BARS
   =========================== */
const tierBarObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.tier-bar-fill').forEach(fill => {
        fill.classList.add('animated');
      });
      tierBarObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.tiers').forEach(el => tierBarObserver.observe(el));

/* ===========================
   ANIMATED NUMBER COUNTERS
   =========================== */
function animateCounter(el, target, duration) {
  const prefix = el.dataset.prefix ?? '';
  const suffix = el.dataset.suffix ?? '';
  const isFloat = !Number.isInteger(target);
  const decimals = isFloat ? (target.toString().split('.')[1]?.length ?? 4) : 0;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const val = target * eased;
    el.textContent = prefix + (decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString()) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      animateCounter(el, parseFloat(el.dataset.target), 1800);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

/* ===========================
   PIPELINE PIPE STEP HIGHLIGHT
   =========================== */
const pipeSteps = document.querySelectorAll('.pipe-step');
const pipeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    entry.target.style.opacity = entry.isIntersecting ? '1' : '0.4';
  });
}, { threshold: 0.6 });
pipeSteps.forEach(step => {
  step.style.transition = 'opacity 0.4s ease';
  pipeObserver.observe(step);
});
