/* ==========================================================================
   TELEPULSE DEMO DAY PRESENTATION — FUTURISTIC INTERACTIVE LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // Register GSAP Plugins
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* --------------------------------------------------------------------------
     1. CUSTOM MAGNETIC CURSOR
     -------------------------------------------------------------------------- */
  const cursorDot = document.getElementById('cursor-dot');
  const cursorFollower = document.getElementById('cursor-follower');
  const cursorBadge = document.getElementById('cursor-badge');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let followerX = mouseX;
  let followerY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Position dot instantly
    if (cursorDot) {
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    }
  });

  function renderCursor() {
    followerX += (mouseX - followerX) * 0.18;
    followerY += (mouseY - followerY) * 0.18;

    if (cursorFollower) {
      cursorFollower.style.left = `${followerX}px`;
      cursorFollower.style.top = `${followerY}px`;
    }

    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  // Attach hover events to interactive elements
  const interactiveElements = document.querySelectorAll('[data-cursor], a, button, .glass-card, .chat-item');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
      const badgeText = el.getAttribute('data-cursor') || 'OPEN';
      if (cursorBadge) cursorBadge.textContent = badgeText;
    });

    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
    });
  });

  /* --------------------------------------------------------------------------
     2. CANVAS AMBIENT NEON PARTICLES & STARDUST
     -------------------------------------------------------------------------- */
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = Math.min(Math.floor(window.innerWidth / 20), 60);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.5 + 0.2,
        color: Math.random() > 0.5 ? '#00f0ff' : '#8a2be2'
      });
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();

        // Connect nearby particles with glowing lines
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - dist / 120) * 0.15;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      });

      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  /* --------------------------------------------------------------------------
     3. NAVBAR SCROLL EFFECT & SMOOTH NAV LINKS
     -------------------------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Active state link highlight on scroll
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  /* --------------------------------------------------------------------------
     4. 3D MOUSE PARALLAX TILT EFFECT FOR HERO MOCKUP
     -------------------------------------------------------------------------- */
  const heroMockup = document.getElementById('hero-mockup');
  if (heroMockup) {
    window.addEventListener('mousemove', (e) => {
      const rect = heroMockup.getBoundingClientRect();
      const mockupX = rect.left + rect.width / 2;
      const mockupY = rect.top + rect.height / 2;

      const angleX = (e.clientY - mockupY) / 25;
      const angleY = (mockupX - e.clientX) / 25;

      heroMockup.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg) scale(1.02)`;
    });
  }

  /* --------------------------------------------------------------------------
     5. INTERACTIVE FEATURE SHOWCASE SWITCHER
     -------------------------------------------------------------------------- */
  const featureBtns = document.querySelectorAll('.feature-nav-btn');
  const featureScreens = document.querySelectorAll('.feature-screen-content');

  featureBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const featureId = btn.getAttribute('data-feature');

      // Toggle Active Button
      featureBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Toggle Screen Display
      featureScreens.forEach(screen => {
        screen.classList.remove('active');
      });
      const activeScreen = document.getElementById(`screen-${featureId}`);
      if (activeScreen) {
        activeScreen.classList.add('active');
      }
    });
  });

  /* --------------------------------------------------------------------------
     6. GSAP ANIMATIONS & ENTRANCE REVEALS
     -------------------------------------------------------------------------- */
  if (typeof gsap !== 'undefined') {
    // Hero Entrance Timeline
    const heroTl = gsap.timeline();
    heroTl
      .from('.hero-title', { opacity: 0, y: 40, duration: 1, ease: 'power3.out' })
      .from('.hero-subtitle', { opacity: 0, y: 20, duration: 0.8, ease: 'power3.out' }, '-=0.6')
      .from('.hero-description', { opacity: 0, y: 20, duration: 0.8, ease: 'power3.out' }, '-=0.6')
      .from('.hero-cta-group', { opacity: 0, scale: 0.9, duration: 0.8, ease: 'power3.out' }, '-=0.5')
      .from('#hero-mockup', { opacity: 0, x: 60, rotateY: -20, duration: 1.2, ease: 'power4.out' }, '-=1');

    // ScrollTrigger Reveals for Problem Section
    gsap.utils.toArray('.gsap-reveal').forEach(el => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
        },
        opacity: 0,
        y: 40,
        filter: 'blur(10px)',
        duration: 0.9,
        ease: 'power3.out'
      });
    });

    // Timeline Progress Bar Sync
    ScrollTrigger.create({
      trigger: '#timeline',
      start: 'top 70%',
      end: 'bottom 70%',
      onUpdate: (self) => {
        const progress = Math.round(self.progress * 100);
        const bar = document.getElementById('timeline-progress');
        if (bar) bar.style.width = `${progress}%`;
      }
    });
  }

  /* --------------------------------------------------------------------------
     7. PRESENTATION MODE SYSTEM (FOR DEMO DAY PITCH)
     -------------------------------------------------------------------------- */
  const togglePresBtn = document.getElementById('toggle-pres-mode');
  const presBar = document.getElementById('presentation-bar');
  const presCounter = document.getElementById('pres-slide-counter');
  const presTimeGuide = document.getElementById('pres-time-guide');
  const presPrevBtn = document.getElementById('pres-prev');
  const presNextBtn = document.getElementById('pres-next');
  const presExitBtn = document.getElementById('pres-exit');

  const slideSections = Array.from(document.querySelectorAll('.slide-section'));
  let currentSlideIndex = 0;
  let isPresentationMode = false;

  function updateSlideView(index) {
    if (index < 0) index = 0;
    if (index >= slideSections.length) index = slideSections.length - 1;
    currentSlideIndex = index;

    const targetSection = slideSections[currentSlideIndex];

    // Scroll smooth to section
    targetSection.scrollIntoView({ behavior: 'smooth' });

    // Active state highlighting in presentation mode
    slideSections.forEach((sec, idx) => {
      if (idx === currentSlideIndex) {
        sec.classList.add('slide-active');
      } else {
        sec.classList.remove('slide-active');
      }
    });

    // Update Counter & Guide Text
    const slideNum = targetSection.getAttribute('data-slide') || (currentSlideIndex + 1);
    const timeGuide = targetSection.getAttribute('data-time') || 'Demo Day Presentation';

    if (presCounter) presCounter.textContent = `SLAYD 0${slideNum} / 0${slideSections.length}`;
    if (presTimeGuide) presTimeGuide.textContent = timeGuide;
  }

  function togglePresentationMode(enable) {
    isPresentationMode = enable !== undefined ? enable : !isPresentationMode;

    if (isPresentationMode) {
      document.body.classList.add('presentation-mode');
      updateSlideView(0);
    } else {
      document.body.classList.remove('presentation-mode');
      slideSections.forEach(sec => sec.classList.remove('slide-active'));
    }
  }

  if (togglePresBtn) {
    togglePresBtn.addEventListener('click', () => togglePresentationMode());
  }
  if (presExitBtn) {
    presExitBtn.addEventListener('click', () => togglePresentationMode(false));
  }
  if (presNextBtn) {
    presNextBtn.addEventListener('click', () => updateSlideView(currentSlideIndex + 1));
  }
  if (presPrevBtn) {
    presPrevBtn.addEventListener('click', () => updateSlideView(currentSlideIndex - 1));
  }

  // Keyboard navigation for presentation mode
  window.addEventListener('keydown', (e) => {
    // Press 'P' key to toggle presentation mode quickly
    if (e.key === 'p' || e.key === 'P') {
      togglePresentationMode();
      return;
    }

    if (isPresentationMode) {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        updateSlideView(currentSlideIndex + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        updateSlideView(currentSlideIndex - 1);
      } else if (e.key === 'Escape') {
        togglePresentationMode(false);
      }
    }
  });

});
