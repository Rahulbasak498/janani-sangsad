const nav = document.getElementById('nav');

if ('serviceWorker' in navigator && ['http:', 'https:'].includes(window.location.protocol)) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(error => {
      console.warn('Offline support unavailable.', error);
    });
  });
}

async function updateHeroLocation() {
  const locationElement = document.getElementById('heroLocation');
  if (!locationElement) return;

  if (!navigator.geolocation) {
    locationElement.textContent = 'লোকেশন পাওয়া যায়নি';
    return;
  }

  navigator.geolocation.getCurrentPosition(async ({ coords }) => {
    try {
      const params = new URLSearchParams({
        format: 'jsonv2',
        lat: coords.latitude.toString(),
        lon: coords.longitude.toString(),
        zoom: '14',
        'accept-language': 'bn'
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`);
    if (!response.ok) throw new Error('Location lookup failed');

      const location = await response.json();
      const address = location.address || {};
      const area = address.suburb || address.neighbourhood || address.city_district;
      const city = address.city || address.town || address.municipality || address.state;
      const label = [area, city].filter(Boolean).join(', ');

      locationElement.textContent = label || 'লোকেশন পাওয়া যায়নি';
    } catch (error) {
      locationElement.textContent = 'লোকেশন পাওয়া যায়নি';
      console.warn('Hero location unavailable.', error);
    }
  }, () => {
    locationElement.textContent = 'লোকেশন অনুমতি দিন';
  }, {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000
  });
}

updateHeroLocation();

async function requestNoticePermission() {
  if (!('Notification' in window) || Notification.permission !== 'default') return;

  try {
    await Notification.requestPermission();
  } catch (error) {
    console.warn('Notification permission unavailable.', error);
  }
}

window.addEventListener('load', () => {
  window.setTimeout(requestNoticePermission, 900);
});

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

const burger = document.getElementById('navBurger');
const navLinks = document.getElementById('navLinks');

if (burger && navLinks) {
  burger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      document.querySelectorAll('.nav-dropdown.open').forEach(dd => dd.classList.remove('open'));
    });
  });
}

// ---------- সদস্য DROPDOWN ----------
document.querySelectorAll('.nav-dropdown-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const dropdown = btn.closest('.nav-dropdown');
    const wasOpen = dropdown.classList.contains('open');

    document.querySelectorAll('.nav-dropdown.open').forEach(dd => dd.classList.remove('open'));

    if (!wasOpen) dropdown.classList.add('open');
  });
});

document.addEventListener('click', (e) => {
  document.querySelectorAll('.nav-dropdown.open').forEach(dd => {
    if (!dd.contains(e.target)) dd.classList.remove('open');
  });
});

let pujaTarget =
  new Date("2026-10-16T06:00:00+06:00").getTime();

window.addEventListener('siteSettingsLoaded', event => {
  const configuredDate = event.detail && event.detail.pujaDate;
  const parsedDate = configuredDate ? new Date(configuredDate).getTime() : NaN;

  if (!Number.isNaN(parsedDate)) {
    pujaTarget = parsedDate;
    updateCountdown();
  }
});

function updateCountdown() {

  const now = new Date().getTime();

  let diff = pujaTarget - now;

  if (diff < 0) {
    diff = 0;
  }

  const days = Math.floor(
    diff / (1000 * 60 * 60 * 24)
  );

  const hours = Math.floor(
    (diff / (1000 * 60 * 60)) % 24
  );

  const minutes = Math.floor(
    (diff / (1000 * 60)) % 60
  );

  const seconds = Math.floor(
    (diff / 1000) % 60
  );

  const daysElement =
    document.getElementById('cd-days');

  const hoursElement =
    document.getElementById('cd-hours');

  const minsElement =
    document.getElementById('cd-mins');

  const secsElement =
    document.getElementById('cd-secs');

  if (daysElement) {
    daysElement.textContent =
      String(days).padStart(2, '0');
  }

  if (hoursElement) {
    hoursElement.textContent =
      String(hours).padStart(2, '0');
  }

  if (minsElement) {
    minsElement.textContent =
      String(minutes).padStart(2, '0');
  }

  if (secsElement) {
    secsElement.textContent =
      String(seconds).padStart(2, '0');
  }
}

updateCountdown();

setInterval(updateCountdown, 1000);

const galleryLightbox = document.getElementById('galleryLightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
let lightboxIndex = 0;

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
}

document.addEventListener('click', event => {
  const image = event.target.closest('#masonryGrid img');
  if (!image || !galleryLightbox || !lightboxImage) return;

  const images = [...document.querySelectorAll('#masonryGrid img')];
  showGalleryImage(images.indexOf(image));
  galleryLightbox.classList.add('open');
  galleryLightbox.setAttribute('aria-hidden', 'false');
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
  if (event.key === 'Escape') closeGalleryLightbox();
  if (event.key === 'ArrowLeft') showGalleryImage(lightboxIndex - 1);
  if (event.key === 'ArrowRight') showGalleryImage(lightboxIndex + 1);
});