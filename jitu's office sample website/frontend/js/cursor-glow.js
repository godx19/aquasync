/**
 * cursor-glow.js — Global mouse-follow spotlight glow
 * Follows the cursor at exact speed (no lerp delay).
 */
(function () {
  'use strict';

  const FADE_DELAY = 2500; // ms idle before glow fades out

  /* ── Create / reuse element ───────────────────────── */
  let glow = document.getElementById('cursorGlow');
  if (!glow) {
    glow = document.createElement('div');
    glow.id = 'cursorGlow';
    document.body.appendChild(glow);
  }

  let hideTimer = null;

  /* ── Move exactly with the cursor ─────────────────── */
  document.addEventListener('mousemove', (e) => {
    // Direct position — no lerp, instant 1:1 follow
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    glow.style.opacity = '1';

    // Auto-hide after idle
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      glow.style.opacity = '0';
    }, FADE_DELAY);
  });

  /* Hide when cursor leaves window */
  document.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
    clearTimeout(hideTimer);
  });

  /* Re-show on re-entry */
  document.addEventListener('mouseenter', (e) => {
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    glow.style.opacity = '1';
  });

  /* ── Boost on interactive elements ───────────────── */
  const BOOST = 'a, button, .product-card, .service-card, .why-card, .position-card, .perk-card, .team-card, .btn';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(BOOST)) {
      glow.style.filter = 'blur(20px) brightness(1.7)';
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(BOOST)) {
      glow.style.filter = 'blur(28px) brightness(1)';
    }
  });

})();
