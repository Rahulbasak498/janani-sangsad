const nav = document.getElementById('nav');

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
    });
  });
}

const musicBtn = document.getElementById('musicBtn');

let musicOn = false;

if (musicBtn) {
  musicBtn.addEventListener('click', () => {
    musicOn = !musicOn;
    musicBtn.textContent = musicOn ? '🔊' : '🔈';
  });
}

const pujaTarget =
  new Date("2026-10-16T06:00:00+06:00").getTime();

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