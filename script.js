const nav = document.getElementById('nav');

if ('serviceWorker' in navigator && ['http:', 'https:'].includes(window.location.protocol)) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(error => {
      console.warn('Offline support unavailable.', error);
    });
  });
}

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

const burger = document.getElementById('navBurger');
const navLinks = document.getElementById('navLinks');

if (burger && navLinks) {
  const closeMobileNav = (restoreFocus = false) => {
    navLinks.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'মেনু খুলুন');
    document.querySelectorAll('.nav-dropdown.open').forEach(dropdown => {
      dropdown.classList.remove('open');
      dropdown.querySelector('.nav-dropdown-btn')?.setAttribute('aria-expanded', 'false');
    });
    if (restoreFocus) burger.focus();
  };

  burger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন');
  });

  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => closeMobileNav());
  });

  document.addEventListener('click', event => {
    if (navLinks.classList.contains('open') && !navLinks.contains(event.target) && !burger.contains(event.target)) {
      closeMobileNav();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navLinks.classList.contains('open')) closeMobileNav(true);
  });
}

// ---------- সদস্য DROPDOWN ----------
document.querySelectorAll('.nav-dropdown-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const dropdown = btn.closest('.nav-dropdown');
    const wasOpen = dropdown.classList.contains('open');

    document.querySelectorAll('.nav-dropdown.open').forEach(dd => dd.classList.remove('open'));
    document.querySelectorAll('.nav-dropdown-btn').forEach(dropdownButton => dropdownButton.setAttribute('aria-expanded', 'false'));

    if (!wasOpen) {
      dropdown.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

document.addEventListener('click', (e) => {
  document.querySelectorAll('.nav-dropdown.open').forEach(dd => {
    if (!dd.contains(e.target)) {
      dd.classList.remove('open');
      dd.querySelector('.nav-dropdown-btn')?.setAttribute('aria-expanded', 'false');
    }
  });
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const openDropdown = document.querySelector('.nav-dropdown.open');
  if (!openDropdown) return;
  openDropdown.classList.remove('open');
  const button = openDropdown.querySelector('.nav-dropdown-btn');
  button?.setAttribute('aria-expanded', 'false');
  button?.focus();
});

// পূজার countdown (cd-days/cd-hours/cd-mins/cd-secs) এখন puja-calendar.js
// থেকে বাস্তব পঞ্জিকার তারিখ অনুযায়ী নিয়ন্ত্রিত হয়।

const galleryLightbox = document.getElementById('galleryLightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
let lightboxIndex = 0;
let lightboxTrigger = null;

function keepFocusInDialog(dialog, event) {
  if (event.key !== 'Tab') return;
  const controls = [...dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter(element => element.getClientRects().length);
  if (!controls.length) {
    event.preventDefault();
    return;
  }

  const first = controls[0];
  const last = controls[controls.length - 1];
  if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function showGalleryImage(index) {
  const images = [...document.querySelectorAll('#masonryGrid img')];
  if (!images.length || !lightboxImage) return;

  lightboxIndex = (index + images.length) % images.length;
  const image = images[lightboxIndex];
  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt || 'Gallery image';
}

function closeGalleryLightbox() {
  if (!galleryLightbox) return;
  galleryLightbox.classList.remove('open');
  galleryLightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  lightboxTrigger?.focus();
  lightboxTrigger = null;
}

function openGalleryLightbox(image) {
  if (!image || !galleryLightbox || !lightboxImage) return;
  const images = [...document.querySelectorAll('#masonryGrid img')];
  showGalleryImage(images.indexOf(image));
  lightboxTrigger = image;
  galleryLightbox.classList.add('open');
  galleryLightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  lightboxClose?.focus();
}

document.addEventListener('click', event => {
  const image = event.target.closest('#masonryGrid img');
  if (!image || !galleryLightbox || !lightboxImage) return;
  openGalleryLightbox(image);
});

lightboxClose?.addEventListener('click', closeGalleryLightbox);
lightboxPrev?.addEventListener('click', event => {
  event.stopPropagation();
  showGalleryImage(lightboxIndex - 1);
});
lightboxNext?.addEventListener('click', event => {
  event.stopPropagation();
  showGalleryImage(lightboxIndex + 1);
});
galleryLightbox?.addEventListener('click', event => {
  if (event.target === galleryLightbox) closeGalleryLightbox();
});
document.addEventListener('keydown', event => {
  if (!galleryLightbox?.classList.contains('open')) {
    const image = event.target.closest?.('#masonryGrid img');
    if (image && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      openGalleryLightbox(image);
    }
    return;
  }
  keepFocusInDialog(galleryLightbox, event);
  if (event.key === 'Escape') closeGalleryLightbox();
  if (event.key === 'ArrowLeft') showGalleryImage(lightboxIndex - 1);
  if (event.key === 'ArrowRight') showGalleryImage(lightboxIndex + 1);
});

// ---------- SCROLL TO TOP ----------
function initScrollTopButton() {
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (!scrollTopBtn || scrollTopBtn.dataset.scrollTopReady === 'true') return;
  scrollTopBtn.dataset.scrollTopReady = 'true';

  const updateScrollTopVisibility = () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 350);
  };
  updateScrollTopVisibility();

  window.addEventListener('scroll', () => {
    updateScrollTopVisibility();
  });

  scrollTopBtn.addEventListener('click', () => {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    window.scrollTo({ top: 0, behavior });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollTopButton, { once: true });
} else {
  initScrollTopButton();
}

// ---------- QUICK COPY FOR DONATION DETAILS ----------
function makeCopyable(elementId, label) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.style.cursor = 'pointer';
  el.title = 'কপি করতে ক্লিক করুন';
  el.addEventListener('click', async () => {
    const text = el.textContent.trim().replace(/^A\/C:\s*/, '');
    try {
      await navigator.clipboard.writeText(text);
      if (typeof setDataStatus === 'function') {
        setDataStatus(`${label} কপি করা হয়েছে! (${text})`, true);
        setTimeout(() => setDataStatus('', false), 2500);
      }
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  });
}

makeCopyable('bkashNagad', 'নম্বর');
makeCopyable('bankAccount', 'অ্যাকাউন্ট নম্বর');

// Visible "📋 কপি" buttons beside donation numbers
document.addEventListener('click', async e => {
  const btn = e.target.closest('.copy-btn');
  if (!btn) return;
  const target = document.getElementById(btn.dataset.copyTarget);
  if (!target) return;
  const text = target.textContent.trim().replace(/^A\/C:\s*/i, '');
  if (!text) return;

  let ok = false;
  try {
    await navigator.clipboard.writeText(text);
    ok = true;
  } catch (err) {
    // Fallback for older browsers / non-secure contexts
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { ok = document.execCommand('copy'); } catch (e2) {}
    document.body.removeChild(ta);
  }

  const original = btn.dataset.label || btn.textContent;
  btn.dataset.label = original;
  btn.textContent = ok ? '✓ কপি হয়েছে' : 'কপি করা যায়নি';
  btn.classList.toggle('copied', ok);
  setTimeout(() => { btn.textContent = original; btn.classList.remove('copied'); }, 1800);
});

// =========================================================
// NEW FESTIVE & INTERACTIVE FEATURES IMPLEMENTATION
// =========================================================




// ---------- 2. PUSHPANJALI FLOWER SHOWER CANVAS ----------
class FlowerShower {
  constructor(canvasId) {
    this.particles = [];
    this.animationId = null;
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(count = 70) {
    if (!this.canvas || !this.ctx || !this.particles) return;
    this.resize();
    const colors = [
      { fill: '#FFA000', edge: '#FF6F00' }, // Marigold orange
      { fill: '#FFD54F', edge: '#FFA000' }, // Marigold yellow
      { fill: '#F06292', edge: '#C2185B' }, // Lotus pink
      { fill: '#FFF9C4', edge: '#FFE082' }, // Jasmine white/cream
      { fill: '#E91E63', edge: '#880E4F' }  // Hibiscus red
    ];

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: -20 - Math.random() * 80,
        size: 8 + Math.random() * 12,
        speedY: 2 + Math.random() * 3.5,
        speedX: (Math.random() - 0.5) * 2.2,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.08,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1,
        swing: Math.random() * Math.PI * 2
      });
    }

    if (!this.animationId) {
      this.loop();
    }
  }

  loop() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.swing) * 1.2;
      p.swing += 0.04;
      p.rotation += p.rotSpeed;

      if (p.y > this.canvas.height - 120) {
        p.opacity -= 0.02;
      }

      if (p.opacity <= 0 || p.y > this.canvas.height) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.globalAlpha = p.opacity;

      this.ctx.beginPath();
      this.ctx.moveTo(0, -p.size);
      this.ctx.bezierCurveTo(p.size * 0.7, -p.size * 0.5, p.size * 0.7, p.size * 0.5, 0, p.size);
      this.ctx.bezierCurveTo(-p.size * 0.7, p.size * 0.5, -p.size * 0.7, -p.size * 0.5, 0, -p.size);
      this.ctx.fillStyle = p.color.fill;
      this.ctx.fill();
      this.ctx.strokeStyle = p.color.edge;
      this.ctx.lineWidth = 0.8;
      this.ctx.stroke();

      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.loop());
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.animationId = null;
    }
  }
}

const globalFlowerShower = new FlowerShower('flowerShowerCanvas');
window._flowerShower = globalFlowerShower;

// ---------- 4. ADD TO GOOGLE CALENDAR & APPLE CALENDAR ----------
function addPujaToCalendar(dayName, dateStr, title, desc) {
  const dateMap = {
    'মহাষষ্ঠী': { start: '20261016T000000Z', end: '20261016T120000Z' },
    'মহাসপ্তমী — তিথির প্রথম দিন': { start: '20261017T002400Z', end: '20261018T025700Z' },
    'মহাসপ্তমী': { start: '20261018T000000Z', end: '20261018T060000Z' },
    'মহাষ্টমী': { start: '20261019T030000Z', end: '20261019T140000Z' },
    'মহানবমী': { start: '20261020T030000Z', end: '20261020T150000Z' },
    'বিজয়া দশমী': { start: '20261021T030000Z', end: '20261021T100000Z' }
  };

  const dateKey = Object.keys(dateMap).find(name => dayName.includes(name));
  const times = dateMap[dateKey] || { start: '20261016T000000Z', end: '20261021T100000Z' };
  const eventTitle = encodeURIComponent(`জননী সংসদ শারদোৎসব — ${dayName} (${title || 'পূজা ও আরতি'})`);
  const eventDesc = encodeURIComponent(`${desc || 'জননী সংসদ শারদীয় দুর্গোৎসব আয়োজন।'}\nওয়েবসাইট: ${window.location.origin}`);
  const eventLoc = encodeURIComponent('জননী সংসদ, ঢাকা, বাংলাদেশ');

  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${times.start}/${times.end}&details=${eventDesc}&location=${eventLoc}`;
  window.open(gcalUrl, '_blank');
}
window.addPujaToCalendar = addPujaToCalendar;

// Default Puja Timeline Population if Firebase is empty/slow
function initScheduleCalendarButtons() {
  const timelineEl = document.getElementById('timeline');
  if (!timelineEl) return;

  const defaultSchedule = [
    { day: '০১', date: '১৬ অক্টোবর ২০২৬, শুক্রবার · ২৮ আশ্বিন', title: 'মহাষষ্ঠী — কালপরম্ভ ও বোধন', items: ['ভোর ৬:০০টা — কালপরম্ভ', 'সকাল ৯:০০টা — পূজা ও পুষ্পাঞ্জলি', 'সন্ধ্যা ৬:০০টা — বোধন, আমন্ত্রণ ও অধিবাস; সন্ধ্যা আরতি', 'ষষ্ঠী তিথি ২৮ আশ্বিন; শেষ ১৭ অক্টোবর সকাল ৬:২৪-এ'] },
    { day: '০২', date: '১৭ অক্টোবর ২০২৬, শনিবার · ২৯ আশ্বিন', title: 'মহাসপ্তমী — তিথির প্রথম দিন', items: ['সকাল ৬:২৪টা — সপ্তমী তিথি শুরু', 'নবপত্রিকা স্নান ও সপ্তমী বিহিত পূজা ১৮ অক্টোবর অনুষ্ঠিত হবে'] },
    { day: '০৩', date: '১৮ অক্টোবর ২০২৬, রবিবার · ৩০ আশ্বিন', title: 'মহাসপ্তমী — নবপত্রিকা ও পূজা', items: ['ভোর ৬:০০টা — নবপত্রিকা স্নান ও স্থাপন', 'সকাল ৯:০০টা — সপ্তমী বিহিত পূজা ও পুষ্পাঞ্জলি', 'দুপুর ১২:০০টা — ভোগ আরতি', 'সকাল ৮:৫৭টা — সপ্তমী তিথি শেষ'] },
    { day: '০৪', date: '১৯ অক্টোবর ২০২৬, সোমবার · ১ কার্তিক', title: 'মহাষ্টমী — কুমারী পূজা ও সন্ধিপূজা', items: ['সকাল ৯:০০টা — কুমারী পূজা ও পুষ্পাঞ্জলি', 'সকাল ১০:৫৮টা–১১:৪৬টা — সন্ধিপূজা', 'রাত ৮:০০টা — সাংস্কৃতিক সন্ধ্যা', 'অষ্টমী তিথি ১ কার্তিক; শেষ সকাল ১১:২২-এ, সন্ধিপূজা তিথি-সন্ধিক্ষণে'] },
    { day: '০৫', date: '২০ অক্টোবর ২০২৬, মঙ্গলবার · ২ কার্তিক', title: 'মহানবমী — হোম ও মহাভোগ', items: ['সকাল ৯:০০টা — নবমী পূজা ও হোম', 'দুপুর ১:০০টা — মহাভোগ', 'রাত ৯:০০টা — ধুনুচি নাচ', 'নবমী তিথি ২ কার্তিক; শেষ দুপুর ১:২০-এ'] },
    { day: '০৬', date: '২১ অক্টোবর ২০২৬, বুধবার · ৩ কার্তিক', title: 'বিজয়া দশমী — দর্পণ বিসর্জন ও প্রতিমা বিসর্জন', items: ['সকাল ৯:০০টা — দশমী পূজা ও দর্পণ বিসর্জন', 'দুপুর ১২:০০টা — সিঁদুর খেলা', 'বিকেল ৪:০০টা — প্রতিমা বিসর্জন', 'দশমী তিথি ৩ কার্তিক; শেষ দুপুর ২:৪২-এ'] }
  ];

  setTimeout(() => {
    if (timelineEl.querySelector('.empty-note')) {
      timelineEl.innerHTML = '';
      defaultSchedule.forEach(s => {
        const card = document.createElement('div');
        card.className = 'tl-card';
        const scheduleItems = s.items.map(item => {
          const separator = item.indexOf(' — ');
          const timeLabel = separator > -1 ? item.slice(0, separator) : '';
          if (!/^(ভোর|সকাল|দুপুর|বিকেল|সন্ধ্যা|রাত)/.test(timeLabel)) {
            return `<li class="tl-note-item">${item}</li>`;
          }
          const eventClass = timeLabel.includes('১১:৪৬টা') ? ' tl-event-item-wide' : '';
          return `<li class="tl-event-item${eventClass}"><span class="tl-event-time">${timeLabel}</span><span>${item.slice(separator + 3)}</span></li>`;
        }).join('');
        card.innerHTML = `
          <div class="tl-day">${s.day}</div>
          <div class="tl-date">${s.date}</div>
          <h3>${s.title}</h3>
          <ul>${scheduleItems}</ul>
          <button type="button" class="btn-cal-add" onclick="addPujaToCalendar('${s.title}', '${s.date}', '${s.title}', '${s.items.join(', ')}')">
            <span>🗓️ ক্যালেন্ডারে রিমাইন্ডার</span>
          </button>
        `;
        timelineEl.appendChild(card);
      });
    }
  }, 1200);
}
initScheduleCalendarButtons();

// ---------- 5. FESTIVE GREETINGS SHARE MODAL ----------
function initGreetingModal() {
  const modal = document.getElementById('greetingModal');
  const openBtn = document.getElementById('btnShareGreeting');
  const closeBtn = document.getElementById('closeGreetingModal');
  const waBtn = document.getElementById('btnShareWhatsApp');
  const copyBtn = document.getElementById('btnCopyGreeting');
  const toast = document.getElementById('gmCopyToast');

  if (!modal) return;

  const open = () => {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    closeBtn?.focus();
  };
  const close = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    openBtn?.focus();
  };

  openBtn?.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  modal.addEventListener('click', e => {
    if (e.target === modal) close();
  });
  document.addEventListener('keydown', event => {
    if (!modal.classList.contains('open')) return;
    keepFocusInDialog(modal, event);
    if (event.key === 'Escape') close();
  });

  const getShareText = () => {
    const url = window.location.href;
    return `মা আসছেন ঘরে ঘরে! 🪔\n\nপবিত্র শারদীয় দুর্গোৎসব উপলক্ষে জননী সংসদ (প্রতিষ্ঠা ১৯৭৪)-এর পক্ষ থেকে আপনাকে ও আপনার পরিবারকে জানাই আন্তরিক প্রীতি ও শারদীয়া শুভেচ্ছা।\n\nমা দুর্গার আশীর্বাদে আপনার জীবন আলোয় ভরে উঠুক। 🙏\n\nপূজার সময়সূচি ও বিস্তারিত দেখুন: ${url}`;
  };

  waBtn?.addEventListener('click', () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  });

  copyBtn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      if (toast) {
        toast.style.display = 'block';
        setTimeout(() => toast.style.display = 'none', 2500);
      }
    } catch (e) {
      console.warn('Copy greeting failed:', e);
    }
  });
}
initGreetingModal();

// ---------- 6. SOUVENIR (SMARANIKA) MODAL ----------
function initSouvenirModal() {
  const modal = document.getElementById('souvenirModal');
  const openBtn = document.getElementById('btnOpenSouvenirModal');
  const closeBtn = document.getElementById('closeSouvenirModal');
  const actionCloseBtn = document.getElementById('btnCloseSouvenirAction');

  if (!modal) return;

  const open = () => {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  };
  const close = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  };

  openBtn?.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  actionCloseBtn?.addEventListener('click', close);
  modal.addEventListener('click', e => {
    if (e.target === modal) close();
  });
}
initSouvenirModal();

// ---------- 7. DEVOTEES WISHES WALL (ভক্তদের শুভকামনা বোর্ড) ----------
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function initWishesWall() {
  const form = document.getElementById('devoteeWishForm');
  const feed = document.getElementById('wishesFeedTrack');
  if (!form || !feed) return;

  const statusEl = document.getElementById('wishStatus');
  const submitBtn = form.querySelector('button[type="submit"]');
  let successMessageTimer;
  let successMessageCleanupTimer;
  let wishSubmitInProgress = false;
  let deferredWishes;
  const COOLDOWN_MS = 60 * 1000;          // one message per minute per browser
  const COOLDOWN_KEY = 'js_last_wish_at';

  const toBn = n => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);

  function timeAgo(ts) {
    if (!ts || typeof ts.toMillis !== 'function') return '';
    const diff = Date.now() - ts.toMillis();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'এইমাত্র';
    if (min < 60) return `${toBn(min)} মিনিট আগে`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${toBn(hr)} ঘণ্টা আগে`;
    const day = Math.floor(hr / 24);
    if (day < 7) return `${toBn(day)} দিন আগে`;
    return ts.toDate().toLocaleDateString('bn-BD');
  }

  function setStatus(message, kind) {
    if (!statusEl) return;
    statusEl.textContent = message || '';
    statusEl.className = 'wish-status' + (kind ? ' ' + kind : '');
  }

  // Nicer confirmation after a successful send (static markup only — no user text)
  function showSuccess() {
    if (!statusEl) return;
    clearTimeout(successMessageTimer);
    clearTimeout(successMessageCleanupTimer);
    statusEl.className = 'wish-status ok wish-success';
    statusEl.innerHTML =
      '<span class="ws-icon">🌸</span>' +
      '<strong>আপনার শুভেচ্ছা বার্তা সফলভাবে পাঠানো হয়েছে!</strong>' +
      '<span class="ws-sub">ধন্যবাদ 🙏 মা দুর্গা আপনার ও আপনার পরিবারের মঙ্গল করুন।<br>' +
      'আপনার শুভকামনা বোর্ডে প্রকাশিত হয়েছে।</span>';
    successMessageTimer = setTimeout(() => {
      if (!statusEl.classList.contains('wish-success')) return;
      statusEl.classList.add('is-leaving');
      successMessageCleanupTimer = setTimeout(() => {
        if (statusEl.classList.contains('wish-success') && statusEl.classList.contains('is-leaving')) {
          setStatus('', '');
        }
      }, 350);
    }, 4000);
  }

  function renderWishItem(w) {
    const div = document.createElement('div');
    div.className = 'wish-bubble';
    div.innerHTML = `
      <div class="wb-header">
        <span class="wb-author">${escapeHtml(w.name)}</span>
        ${w.loc ? `<span class="wb-loc">${escapeHtml(w.loc)}</span>` : ''}
      </div>
      <div class="wb-msg">${escapeHtml(w.msg)}</div>
      ${w.time ? `<div class="wb-time">${escapeHtml(w.time)}</div>` : ''}
    `;
    return div;
  }

  function renderAllWishes(list) {
    feed.innerHTML = '';
    if (!list.length) {
      feed.innerHTML = '<div class="empty-note">এখনো কোনো বার্তা প্রকাশিত হয়নি — প্রথম শুভেচ্ছাটি আপনিই জানান 🌸</div>';
      return;
    }
    list.forEach(w => feed.appendChild(renderWishItem(w)));
  }

  // ---- Submit: publish the wish immediately ----
  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Honeypot: real people never see/fill this field. Pretend success.
    const trap = document.getElementById('wishWebsite');
    if (trap && trap.value.trim()) {
      form.reset();
      showSuccess();
      return;
    }

    const name = document.getElementById('wishName')?.value.trim();
    const loc = document.getElementById('wishLocation')?.value.trim() || '';
    const msg = document.getElementById('wishMessage')?.value.trim();
    if (!name || !msg) {
      setStatus('অনুগ্রহ করে নাম ও বার্তা লিখুন।', 'err');
      return;
    }

    // Simple per-browser cooldown against accidental double-posts / spam.
    try {
      const last = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
      const wait = COOLDOWN_MS - (Date.now() - last);
      if (wait > 0) {
        setStatus(`আরেকটি বার্তা পাঠাতে ${toBn(Math.ceil(wait / 1000))} সেকেন্ড অপেক্ষা করুন।`, 'err');
        return;
      }
    } catch (err) { /* private mode — skip cooldown */ }

    if (typeof db === 'undefined') {
      setStatus('এই মুহূর্তে বার্তা পাঠানো যাচ্ছে না। পরে আবার চেষ্টা করুন।', 'err');
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    setStatus('পাঠানো হচ্ছে...', '');

    wishSubmitInProgress = true;
    try {
      await db.collection('wishes').add({
        name, loc, msg,
        approved: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      try { localStorage.setItem(COOLDOWN_KEY, String(Date.now())); } catch (err) {}
      form.reset();
      showSuccess();
      try { if (typeof playTempleBell === 'function') playTempleBell(); } catch (effectErr) {
        console.warn('Wish success sound failed:', effectErr);
      }
      try { if (typeof globalFlowerShower !== 'undefined') globalFlowerShower.burst(35); } catch (effectErr) {
        console.warn('Wish success animation failed:', effectErr);
      }
    } catch (err) {
      console.warn('Wish submit failed:', err && err.code, err);
      // Keep what they typed so nothing is lost.
      const code = err && err.code;
      const looksOffline = !navigator.onLine || code === 'unavailable' || code === 'deadline-exceeded';
      setStatus(
        looksOffline
          ? 'ইন্টারনেট সংযোগে সমস্যা হচ্ছে। সংযোগ দেখে আবার চেষ্টা করুন — আপনার লেখা মোছা হয়নি।'
          : 'দুঃখিত, এই মুহূর্তে বার্তাটি পাঠানো সম্ভব হয়নি। কিছুক্ষণ পরে আবার চেষ্টা করুন — আপনার লেখা মোছা হয়নি। 🙏',
        'err'
      );
    } finally {
      wishSubmitInProgress = false;
      if (deferredWishes) {
        renderAllWishes(deferredWishes);
        deferredWishes = undefined;
      }
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  // ---- Feed: all published wishes are readable by visitors ----
  try {
    if (typeof db === 'undefined') throw new Error('db missing');
    db.collection('wishes').limit(50).onSnapshot(snap => {
      const wishes = snap.docs
        .map(doc => doc.data())
        .sort((a, b) => {
          const ta = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
          const tb = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
          return tb - ta;
        })
        .slice(0, 20)
        .map(d => ({ name: d.name || '', loc: d.loc || '', msg: d.msg || '', time: timeAgo(d.createdAt) }));
      if (wishSubmitInProgress) deferredWishes = wishes;
      else renderAllWishes(wishes);
    }, err => {
      console.warn('Wishes listener failed:', err);
      feed.innerHTML = '<div class="empty-note is-error">বার্তাগুলো এই মুহূর্তে লোড করা যাচ্ছে না।</div>';
    });
  } catch (err) {
    feed.innerHTML = '<div class="empty-note is-error">বার্তাগুলো এই মুহূর্তে লোড করা যাচ্ছে না।</div>';
  }
}
initWishesWall();
