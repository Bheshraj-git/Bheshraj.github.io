/* ═══════════════════════════════════════════════════
   PORTFOLIO — script.js
   Bheshraj Upreti | Full-Stack Developer
═══════════════════════════════════════════════════ */

// ─── CUSTOM CURSOR ─────────────────────────────────
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');
let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

function animateFollower() {
  followerX += (mouseX - followerX) * 0.1;
  followerY += (mouseY - followerY) * 0.1;
  follower.style.left = followerX + 'px';
  follower.style.top = followerY + 'px';
  requestAnimationFrame(animateFollower);
}
animateFollower();

// ─── NAVBAR ────────────────────────────────────────
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

// Scroll: add glass depth
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  updateActiveLink();
});

// Mobile toggle
navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Close on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// Active link highlighting
function updateActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-link');
  let current = '';

  sections.forEach(section => {
    const top = section.offsetTop - 120;
    if (window.scrollY >= top) current = section.getAttribute('id');
  });

  links.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
}

// ─── SMOOTH SCROLL for anchor links ───────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 90;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ─── INTERSECTION OBSERVER — REVEAL ───────────────
const revealEls = document.querySelectorAll('.reveal, .reveal-up, .reveal-stat');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

// ─── SKILL BARS ────────────────────────────────────
const skillFills = document.querySelectorAll('.skill-fill');

const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const width = entry.target.getAttribute('data-width');
      entry.target.style.width = width + '%';
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

skillFills.forEach(el => skillObserver.observe(el));

// ─── HERO: page load entrance ─────────────────────
window.addEventListener('load', () => {
  // A tiny delay so fonts have loaded
  setTimeout(() => {
    document.querySelectorAll('.hero .reveal, .hero .reveal-stat').forEach(el => {
      el.classList.add('visible');
    });
  }, 200);
});

// ─── CONTACT FORM ──────────────────────────────────
const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formStatus = document.getElementById('formStatus');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !subject || !message) {
      showStatus('Please fill in all fields.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Sending…';
    formStatus.className = 'form-status';
    formStatus.textContent = '';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json();

      if (res.ok) {
        showStatus('Message sent! I\'ll get back to you soon.', 'success');
        form.reset();
      } else {
        showStatus(data.error || 'Something went wrong. Please try again.', 'error');
      }
    } catch (err) {
      showStatus('Network error. Please try again later.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = 'Send Message';
    }
  });
}

function showStatus(message, type) {
  formStatus.textContent = message;
  formStatus.className = 'form-status ' + type;
  setTimeout(() => {
    formStatus.className = 'form-status';
    formStatus.textContent = '';
  }, 5000);
}

// ─── PARALLAX: Hero BG text ────────────────────────
const heroBgText = document.querySelector('.hero-bg-text');
if (heroBgText) {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    heroBgText.style.transform = `translateY(calc(-50% + ${scrollY * 0.25}px))`;
  }, { passive: true });
}

// ─── PROJECT CARD TILT ─────────────────────────────
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rx = ((y - cy) / cy) * 2;
    const ry = ((x - cx) / cx) * -2;
    card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(4px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ─── TYPEWRITER (optional hero tagline) ────────────
const roles = [
  'Full-Stack Developer',
  'Open Source Contributor',
  'UI/UX Enthusiast',
  'Systems Thinker',
];
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
const roleLabel = document.querySelector('.role-label');

if (roleLabel) {
  function typewrite() {
    const current = roles[roleIndex];
    if (isDeleting) {
      roleLabel.textContent = current.substring(0, --charIndex);
    } else {
      roleLabel.textContent = current.substring(0, ++charIndex);
    }

    let delay = isDeleting ? 55 : 90;

    if (!isDeleting && charIndex === current.length) {
      delay = 2400;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      delay = 400;
    }

    setTimeout(typewrite, delay);
  }

  // Start after a short delay so the reveal animation completes first
  setTimeout(typewrite, 1200);
}

// ─── CURSOR: change on interactive elements ────────
document.querySelectorAll('a, button, input, textarea').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(0)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
  });
});

console.log('%c Bheshraj Upreti Portfolio ', 'background:#1a1a1a;color:#f5f0e8;padding:6px 12px;font-size:14px;font-family:monospace;border-radius:4px;');
console.log('%c Built with ♥ in Kathmandu ', 'color:#c8633a;font-family:monospace;');
