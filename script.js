// Nav scroll state
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

// Mobile menu
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// Music toggle (visual only — no audio source wired up in this mockup)
const musicBtn = document.getElementById('musicBtn');
let musicOn = false;
musicBtn.addEventListener('click', () => {
  musicOn = !musicOn;
  musicBtn.textContent = musicOn ? '🔊' : '🔈';
});

// Countdown to next Puja date (demo target date — replace with real Shashthi date)
const target = new Date();
target.setDate(target.getDate() + 7);
function updateCountdown(){
  const now = new Date();
  let diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000) % 24;
  const m = Math.floor(diff / 60000) % 60;
  const s = Math.floor(diff / 1000) % 60;
  document.getElementById('cd-days').textContent = String(d).padStart(2,'0');
  document.getElementById('cd-hours').textContent = String(h).padStart(2,'0');
  document.getElementById('cd-mins').textContent = String(m).padStart(2,'0');
  document.getElementById('cd-secs').textContent = String(s).padStart(2,'0');
}
updateCountdown();
setInterval(updateCountdown, 1000);
