// ===== Siempre iniciar desde arriba (evita que el navegador restaure el scroll) =====
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// ===== Pantalla de carga: espera lo esencial (fotos del sobre/portada y música) =====
const loadingScreen = document.getElementById('loadingScreen');
if (loadingScreen) {
  const preloadImage = (src) => new Promise((resolve) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = resolve;
    img.src = src;
  });

  const audioEl = document.getElementById('bgMusic');
  const audioReady = new Promise((resolve) => {
    if (!audioEl || audioEl.readyState >= 3) {
      resolve();
      return;
    }
    audioEl.addEventListener('canplaythrough', resolve, { once: true });
    audioEl.addEventListener('error', resolve, { once: true });
  });

  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();

  const essentialAssets = Promise.all([
    preloadImage('img/rosas.png'),
    preloadImage('img/vestido.png'),
    audioReady,
    fontsReady,
  ]);

  const COUNTDOWN_SECONDS = 10;
  const countdownEl = document.getElementById('loadingCountdown');
  let remaining = COUNTDOWN_SECONDS;
  if (countdownEl) countdownEl.textContent = String(remaining);
  const countdownInterval = setInterval(() => {
    remaining = Math.max(0, remaining - 1);
    if (countdownEl) countdownEl.textContent = String(remaining);
    if (remaining === 0) clearInterval(countdownInterval);
  }, 1000);

  const countdownDone = new Promise((resolve) => setTimeout(resolve, COUNTDOWN_SECONDS * 1000));
  const safetyTimeout = new Promise((resolve) => setTimeout(resolve, COUNTDOWN_SECONDS * 1000 + 4000));

  Promise.race([
    Promise.all([essentialAssets, countdownDone]),
    safetyTimeout,
  ]).then(() => {
    clearInterval(countdownInterval);
    loadingScreen.classList.add('is-hidden');
    setTimeout(() => loadingScreen.remove(), 700);
  });
}

// ===== Destellos ambientales (estrellitas relucientes) =====
const sparkleField = document.getElementById('sparkleField');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (sparkleField && !prefersReducedMotion) {
  const SPARKLE_COUNT = 24;
  const rand = (min, max) => Math.random() * (max - min) + min;
  for (let i = 0; i < SPARKLE_COUNT; i += 1) {
    const sparkle = document.createElement('span');
    sparkle.className = 'sparkle';
    sparkle.style.setProperty('--sx', `${rand(0, 100)}%`);
    sparkle.style.setProperty('--sy', `${rand(0, 100)}%`);
    sparkle.style.setProperty('--ssize', `${rand(12, 24).toFixed(1)}px`);
    sparkle.style.setProperty('--sdur', `${rand(1.1, 2.4).toFixed(2)}s`);
    sparkle.style.setProperty('--sdelay', `${rand(0, 3).toFixed(2)}s`);
    sparkle.style.setProperty('--speak', rand(0.7, 1).toFixed(2));
    sparkleField.appendChild(sparkle);
  }
}

// ===== Estrellitas sobre las rosas de las esquinas =====
if (!prefersReducedMotion) {
  const rand = (min, max) => Math.random() * (max - min) + min;
  const spawnRoseSparkles = (rose) => {
    const parent = rose.parentElement;
    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();
    const roseRect = rose.getBoundingClientRect();
    const offsetX = roseRect.left - parentRect.left;
    const offsetY = roseRect.top - parentRect.top;

    for (let i = 0; i < 3; i += 1) {
      const sparkle = document.createElement('span');
      sparkle.className = 'sparkle ink-rose-sparkle';
      sparkle.style.setProperty('--sx', `${offsetX + rand(0.15, 0.8) * roseRect.width}px`);
      sparkle.style.setProperty('--sy', `${offsetY + rand(0.15, 0.8) * roseRect.height}px`);
      sparkle.style.setProperty('--ssize', `${rand(10, 18).toFixed(1)}px`);
      sparkle.style.setProperty('--sdur', `${rand(1.1, 2.2).toFixed(2)}s`);
      sparkle.style.setProperty('--sdelay', `${rand(0, 2).toFixed(2)}s`);
      sparkle.style.setProperty('--speak', rand(0.7, 1).toFixed(2));
      parent.appendChild(sparkle);
    }
  };

  document.querySelectorAll('.ink-splash').forEach((rose) => {
    if (rose.complete && rose.naturalWidth) {
      spawnRoseSparkles(rose);
    } else {
      rose.addEventListener('load', () => spawnRoseSparkles(rose), { once: true });
    }
  });
}

// ===== Selector de tema (temporal, mientras se elige la paleta definitiva) =====
const THEME_STORAGE_KEY = 'xvTheme';
const themePicker = document.getElementById('themePicker');
if (themePicker) {
  const swatches = Array.from(themePicker.querySelectorAll('.theme-swatch'));
  const applyTheme = (theme) => {
    if (theme === 'clasico') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    swatches.forEach((sw) => sw.classList.toggle('is-active', sw.dataset.theme === theme));
  };

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const validThemes = swatches.map((sw) => sw.dataset.theme);
  if (savedTheme && validThemes.includes(savedTheme)) applyTheme(savedTheme);

  swatches.forEach((sw) => {
    sw.addEventListener('click', () => {
      const theme = sw.dataset.theme;
      applyTheme(theme);
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    });
  });
}

// ===== Reveal on scroll =====
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach((el) => revealObserver.observe(el));

// ===== Countdown =====
const countdownEl = document.getElementById('countdown');
if (countdownEl) {
  const targetDate = new Date(countdownEl.dataset.date).getTime();
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');

  const pad = (n) => String(n).padStart(2, '0');

  const tick = () => {
    const diff = targetDate - Date.now();
    if (diff <= 0) {
      [daysEl, hoursEl, minutesEl, secondsEl].forEach((el) => (el.textContent = '00'));
      clearInterval(timer);
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
  };

  tick();
  const timer = setInterval(tick, 1000);
}

// ===== Music =====
const musicBtn = document.getElementById('musicToggle');
const bgMusic = document.getElementById('bgMusic');
const startMusic = () => {
  if (!bgMusic) return;
  bgMusic
    .play()
    .then(() => musicBtn && musicBtn.classList.add('playing'))
    .catch(() => {
      // Playback was blocked; the toggle button lets the user start it manually.
    });
};
if (musicBtn && bgMusic) {
  musicBtn.addEventListener('click', () => {
    if (bgMusic.paused) {
      startMusic();
    } else {
      bgMusic.pause();
      musicBtn.classList.remove('playing');
    }
  });
}

// ===== Envelope opener =====
const envelope = document.getElementById('envelope');
const envelopeOpenBtn = document.getElementById('envelopeOpen');
if (envelope && envelopeOpenBtn) {
  window.scrollTo(0, 0);
  envelopeOpenBtn.addEventListener('click', () => {
    window.scrollTo(0, 0);
    startMusic();
    envelope.classList.add('is-opening');
    setTimeout(() => {
      window.scrollTo(0, 0);
      envelope.classList.add('is-open');
      document.body.classList.remove('locked');
      document.body.classList.add('invitation-open');
    }, 900);
    setTimeout(() => {
      envelope.remove();
    }, 2800);
  });

  window.addEventListener('pageshow', (e) => {
    if (e.persisted) window.scrollTo(0, 0);
  });
}

// ===== Línea de progreso al hacer scroll (reutilizable para itinerario y galería) =====
function initScrollTimeline({ containerId, progressId, trackSelector, itemSelector }) {
  const container = document.getElementById(containerId);
  const progress = document.getElementById(progressId);
  const track = container ? container.querySelector(trackSelector) : null;
  if (!container || !progress || !track) return;

  const items = Array.from(container.querySelectorAll(itemSelector));
  let dotCenters = [];
  let trackTop = 0;
  let trackHeight = 0;

  const measure = () => {
    dotCenters = items.map((item) => item.offsetTop + item.offsetHeight / 2);
    trackTop = dotCenters[0] || 0;
    trackHeight = (dotCenters[dotCenters.length - 1] || 0) - trackTop;
    track.style.top = `${trackTop}px`;
    track.style.height = `${trackHeight}px`;
    progress.style.top = `${trackTop}px`;
  };

  const updateProgress = () => {
    const rect = container.getBoundingClientRect();
    const focusY = window.innerHeight * 0.5;
    const relativeY = focusY - rect.top;
    const currentHeight = Math.min(Math.max(relativeY - trackTop, 0), trackHeight);

    progress.style.height = `${currentHeight}px`;

    items.forEach((item, i) => {
      const isActive = dotCenters[i] <= trackTop + currentHeight + 1;
      item.classList.toggle('is-active', isActive);
    });
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateProgress();
      ticking = false;
    });
  };

  measure();
  updateProgress();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    measure();
    updateProgress();
  });
}

initScrollTimeline({
  containerId: 'timeline',
  progressId: 'timelineProgress',
  trackSelector: '.timeline__track',
  itemSelector: '.titem',
});

// ===== Galería: las fotos avanzan solas conforme se desliza la página =====
const photoScroller = document.getElementById('photoScroller');
const photoScrollerDots = document.getElementById('photoScrollerDots');
if (photoScroller && photoScrollerDots) {
  const sticky = photoScroller.querySelector('.photo-scroller__sticky');
  const photos = Array.from(photoScroller.querySelectorAll('.photo-scroller__photo'));

  photos.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'photo-scroller__dot';
    dot.addEventListener('click', () => {
      const scrollableDistance = photoScroller.offsetHeight - sticky.offsetHeight;
      const targetY =
        photoScroller.offsetTop + (scrollableDistance * i) / (photos.length - 1);
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
    photoScrollerDots.appendChild(dot);
  });
  const dots = Array.from(photoScrollerDots.children);

  const stage = photoScroller.querySelector('.photo-scroller__stage');
  const STAGE_MAX_W = 280;
  const STAGE_MAX_H = 440;

  const ratioFor = (index) => {
    const img = photos[index];
    if (img.naturalWidth && img.naturalHeight) return img.naturalWidth / img.naturalHeight;
    return 4 / 5;
  };

  const applyStageSize = (ratio) => {
    const maxW = Math.min(STAGE_MAX_W, window.innerWidth * 0.72);
    const maxH = Math.min(STAGE_MAX_H, window.innerHeight * 0.6);
    let w = maxW;
    let h = w / ratio;
    if (h > maxH) {
      h = maxH;
      w = h * ratio;
    }
    stage.style.width = `${w}px`;
    stage.style.height = `${h}px`;
  };

  const setActivePhoto = (index) => {
    photos.forEach((p, i) => p.classList.toggle('is-active', i === index));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
    applyStageSize(ratioFor(index));
  };
  setActivePhoto(0);

  photos.forEach((img, i) => {
    img.addEventListener('load', () => {
      if (img.classList.contains('is-active')) applyStageSize(ratioFor(i));
    });
  });

  const updatePhotoScroll = () => {
    const rect = photoScroller.getBoundingClientRect();
    const scrollableDistance = photoScroller.offsetHeight - sticky.offsetHeight;
    const scrolled = -rect.top;
    const fraction = Math.min(Math.max(scrolled / scrollableDistance, 0), 1);
    let index = Math.floor(fraction * photos.length);
    if (index >= photos.length) index = photos.length - 1;
    if (index < 0) index = 0;
    setActivePhoto(index);
  };

  let photoTicking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (photoTicking) return;
      photoTicking = true;
      requestAnimationFrame(() => {
        updatePhotoScroll();
        photoTicking = false;
      });
    },
    { passive: true }
  );
  window.addEventListener('resize', updatePhotoScroll);
}

