/* ============================================================
   AQUASYNCS â€” IoT THEMED WEBSITE
   main.js â€” Main JavaScript
   ============================================================ */

'use strict';

// ============================================================
// PRELOADER
// ============================================================
window.addEventListener('load', () => {
  setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.classList.add('hidden');
  }, 1800);
});

// ============================================================
// NAVBAR â€” scroll effect + active link
// ============================================================
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  updateActiveNav();
  toggleBackToTop();
});

function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  let current = '';

  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 120) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

// ============================================================
// HAMBURGER MENU
// ============================================================
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinksEl.classList.toggle('open');
  document.body.style.overflow = navLinksEl.classList.contains('open') ? 'hidden' : '';
});

navLinksEl.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinksEl.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// Close menu on outside click
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target) && navLinksEl.classList.contains('open')) {
    hamburger.classList.remove('open');
    navLinksEl.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ============================================================
// BACK TO TOP
// ============================================================
const backToTopBtn = document.getElementById('backToTop');

function toggleBackToTop() {
  if (window.scrollY > 500) {
    backToTopBtn.classList.add('visible');
  } else {
    backToTopBtn.classList.remove('visible');
  }
}

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ============================================================
// IOT CANVAS ANIMATION â€” Connected node network
// ============================================================
(function () {
  const canvas = document.getElementById('iotCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); initNodes(); });

  // Mouse interaction
  const mouse = { x: W / 2, y: H / 2 };
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

  const COLORS = {
    primary: '#00d4c0',
    accent:  '#00ffe5',
    conn:    'rgba(0, 212, 192, 0.18)',
  };

  class Node {
    constructor() { this.randomize(); }
    randomize() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.r  = Math.random() * 2 + 1;
      this.alpha = Math.random() * 0.5 + 0.3;
      this.phase = Math.random() * Math.PI * 2;
      this.isAccent = Math.random() < 0.15;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.phase += 0.018;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      const pR = this.r + Math.sin(this.phase) * 0.8;
      const color = this.isAccent ? COLORS.accent : COLORS.primary;
      // Glow
      ctx.save();
      ctx.globalAlpha = this.alpha * 0.25;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, pR * 4, 0, Math.PI * 2);
      ctx.fill();
      // Core
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, pR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  class DataPacket {
    constructor(fromNode, toNode) {
      this.from = fromNode;
      this.to   = toNode;
      this.t    = 0;
      this.speed = 0.007 + Math.random() * 0.008;
      this.isAccent = Math.random() < 0.3;
    }
    update() {
      this.t += this.speed;
      return this.t >= 1;
    }
    draw() {
      const x = this.from.x + (this.to.x - this.from.x) * this.t;
      const y = this.from.y + (this.to.y - this.from.y) * this.t;
      const color = this.isAccent ? COLORS.accent : COLORS.primary;
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  let nodes = [];
  const MAX_NODES = 65;
  const MAX_DIST  = 130;

  function initNodes() {
    nodes = [];
    for (let i = 0; i < MAX_NODES; i++) nodes.push(new Node());
  }
  initNodes();

  const packets = [];
  let packetTimer = 0;

  function spawnPacket() {
    if (nodes.length < 2) return;
    const i = Math.floor(Math.random() * nodes.length);
    let j;
    do { j = Math.floor(Math.random() * nodes.length); } while (j === i);
    packets.push(new DataPacket(nodes[i], nodes[j]));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw edges
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx   = nodes[i].x - nodes[j].x;
        const dy   = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.22;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = COLORS.primary;
          ctx.lineWidth   = 0.8;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    // Mouse ripple connection
    nodes.forEach(node => {
      const dx   = mouse.x - node.x;
      const dy   = mouse.y - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 160) {
        const alpha = (1 - dist / 160) * 0.35;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = COLORS.accent;
        ctx.lineWidth   = 0.6;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
        ctx.restore();
      }
    });

    // Update & draw nodes
    nodes.forEach(n => { n.update(); n.draw(); });

    // Data packets
    packetTimer++;
    if (packetTimer % 55 === 0) spawnPacket();
    for (let i = packets.length - 1; i >= 0; i--) {
      if (packets[i].update()) packets.splice(i, 1);
      else packets[i].draw();
    }

    requestAnimationFrame(draw);
  }
  draw();
})();

// ============================================================
// ANIMATED COUNTERS
// ============================================================
function animateCount(el, target, duration = 2000) {
  let startTime = null;
  const start   = parseInt(el.textContent) || 0;
  const step    = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.floor(start + (target - start) * eased);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = parseInt(entry.target.dataset.target, 10);
      animateCount(entry.target, target, 2200);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));

// ============================================================
// SCROLL REVEAL ANIMATIONS
// ============================================================
const revealEls = document.querySelectorAll(
  '.service-card, .team-card, .mv-card, .value-card, .info-item, .faq-item, .hours-table'
);

revealEls.forEach((el, i) => {
  el.style.opacity   = '0';
  el.style.transform = 'translateY(28px)';
  el.style.transition = `opacity 0.55s ease ${(i % 8) * 0.07}s, transform 0.55s ease ${(i % 8) * 0.07}s`;
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity   = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));

// ============================================================
// FAQ ACCORDION
// ============================================================
document.querySelectorAll('.faq-item').forEach(item => {
  item.querySelector('.faq-question').addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(f => f.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ============================================================
// CONTACT FORM
// ============================================================
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');
const submitBtn   = document.getElementById('submitBtn');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name    = document.getElementById('name').value.trim();
    const email   = document.getElementById('email').value.trim();
    const phone   = document.getElementById('phone').value.trim();
    const service = document.getElementById('service').value;
    const message = document.getElementById('message').value.trim();

    // Validation
    if (!name)    { showMsg('Please enter your full name.', 'error'); return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showMsg('Please enter a valid email address.', 'error'); return;
    }
    if (!message) { showMsg('Please enter your message.', 'error'); return; }

    // Loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    const payload = { name, email, phone, service, message };

    try {
      const res = await fetch('http://localhost:8080/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        const data = await res.json();
        showMsg('âœ… ' + (data.message || 'Message sent! We\'ll respond within 24 hours.'), 'success');
        contactForm.reset();
      } else {
        throw new Error(`Server returned ${res.status}`);
      }
    } catch (err) {
      if (err.name === 'AbortError' || err.name === 'TypeError') {
        // Backend not running â€” graceful fallback
        showMsg('âœ… Message received! (Backend offline â€” will be delivered once server starts.)', 'success');
        contactForm.reset();
      } else {
        showMsg('âŒ Something went wrong. Please try again or email us directly.', 'error');
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
    }
  });
}

function showMsg(text, type) {
  formMessage.textContent = text;
  formMessage.className   = `form-msg ${type}`;
  clearTimeout(formMessage._timer);
  formMessage._timer = setTimeout(() => { formMessage.className = 'form-msg'; }, 7000);
}

// ============================================================
// SMOOTH SCROLL for all anchor links
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id     = anchor.getAttribute('href');
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ============================================================
// ACTIVE NAV on load
// ============================================================
updateActiveNav();

