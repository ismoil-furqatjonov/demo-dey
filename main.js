/* ==========================================================================
   TELEPULSE DEMO DAY PRESENTATION — HIGH-PERFORMANCE INTERACTIVE LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // Register GSAP Plugins if loaded
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
    
    if (cursorDot) {
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    }
  }, { passive: true });

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

  // Attach dynamic cursor badges on interactive elements
  const interactiveElements = document.querySelectorAll('[data-cursor], a, button, .chat-item, .tech-pill, .maker-card, .feature-nav-btn');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
      const badgeText = el.getAttribute('data-cursor') || 'KO‘RISH';
      if (cursorBadge) cursorBadge.textContent = badgeText;
    });

    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
    });
  });

  /* --------------------------------------------------------------------------
     2. AMBIENT NEON PARTICLES & STARDUST CANVAS
     -------------------------------------------------------------------------- */
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, { passive: true });

    const particles = [];
    const particleCount = Math.min(Math.floor(window.innerWidth / 22), 50);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        alpha: Math.random() * 0.4 + 0.2,
        color: Math.random() > 0.4 ? '#ff2a4b' : '#ffffff'
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

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();

        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - dist / 110) * 0.12;
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
     3. NAVBAR SCROLL GLASS EFFECT & ACTIVE NAVIGATION LINK SYNC
     -------------------------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 180;
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
  }, { passive: true });

  /* --------------------------------------------------------------------------
     4. 3D MOUSE PARALLAX TILT EFFECT FOR HERO MOCKUP
     -------------------------------------------------------------------------- */
  const heroMockup = document.getElementById('hero-mockup');
  if (heroMockup) {
    window.addEventListener('mousemove', (e) => {
      const rect = heroMockup.getBoundingClientRect();
      const mockupX = rect.left + rect.width / 2;
      const mockupY = rect.top + rect.height / 2;

      const angleX = (e.clientY - mockupY) / 30;
      const angleY = (mockupX - e.clientX) / 30;

      heroMockup.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg) scale(1.01)`;
    }, { passive: true });
  }

  /* --------------------------------------------------------------------------
     5. INTERACTIVE FEATURE SHOWCASE SWITCHER
     -------------------------------------------------------------------------- */
  const featureBtns = document.querySelectorAll('.feature-nav-btn');
  const featureScreens = document.querySelectorAll('.feature-screen-content');

  featureBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const featureId = btn.getAttribute('data-feature');

      featureBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

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
    // Hero Entrance
    const heroTl = gsap.timeline();
    heroTl
      .from('.hero-title', { opacity: 0, y: 35, duration: 0.9, ease: 'power3.out' })
      .from('.hero-subtitle', { opacity: 0, y: 20, duration: 0.7, ease: 'power3.out' }, '-=0.5')
      .from('.hero-description', { opacity: 0, y: 20, duration: 0.7, ease: 'power3.out' }, '-=0.5')
      .from('.hero-cta-group', { opacity: 0, scale: 0.95, duration: 0.7, ease: 'power3.out' }, '-=0.4')
      .from('#hero-mockup', { opacity: 0, x: 50, rotateY: -15, duration: 1, ease: 'power4.out' }, '-=0.8');

    // ScrollTrigger Reveals
    gsap.utils.toArray('.gsap-reveal').forEach(el => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
        },
        opacity: 0,
        y: 35,
        filter: 'blur(8px)',
        duration: 0.85,
        ease: 'power3.out'
      });
    });

    // Timeline Line Progress Fill
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

    targetSection.scrollIntoView({ behavior: 'smooth' });

    slideSections.forEach((sec, idx) => {
      if (idx === currentSlideIndex) {
        sec.classList.add('slide-active');
      } else {
        sec.classList.remove('slide-active');
      }
    });

    const slideNum = targetSection.getAttribute('data-slide') || (currentSlideIndex + 1);
    const timeGuide = targetSection.getAttribute('data-time') || 'Demo Day Prezentatsiya';

    if (presCounter) presCounter.textContent = `SLAYD 0${slideNum} / 0${slideSections.length}`;
    if (presTimeGuide) presTimeGuide.textContent = `⏱️ ${timeGuide}`;
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

  // Keyboard shortcut controls
  window.addEventListener('keydown', (e) => {
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
