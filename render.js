// =========================================================
// PUBLIC SITE — Firestore থেকে ডেটা পড়ে পেজে বসায়
// =========================================================
// এই ফাইলটা admin panel দিয়ে যোগ করা ডেটা ওয়েবসাইটে দেখায়।
// index.html-এ firebase-config.js এর পরে এটা লোড হয়।
//
// নোট: Firestore-এ কোনো collection খালি থাকলে সেই সেকশনের
// আগের static (ডিফল্ট) কন্টেন্ট অপরিবর্তিত থাকবে — সাইট কখনো
// ফাঁকা দেখাবে না।
// =========================================================

// ---------- NOTICES ----------
function renderNotices(docs) {
  const wrap = document.getElementById('noticeList');
  if (!wrap || docs.length === 0) return;

  wrap.innerHTML = '';

  docs.forEach(d => {
    const n = d.data();
    const item = document.createElement('div');
    item.className = 'notice-item';
    item.innerHTML = `
      <div class="n-icon">${n.icon || '📌'}</div>
      <div>
        <h4>${escapeHtml(n.title || '')}</h4>
        <p>${escapeHtml(n.desc || '')}</p>
      </div>
      <div class="n-date">${escapeHtml(n.date || '')}</div>
    `;
    wrap.appendChild(item);
  });
}

// ---------- SCHEDULE (timeline) ----------
function renderSchedule(docs) {
  const wrap = document.getElementById('timeline');
  if (!wrap || docs.length === 0) return;

  wrap.innerHTML = '';

  docs.forEach(d => {
    const s = d.data();
    const items = (s.items || [])
      .map(li => `<li>${escapeHtml(li)}</li>`)
      .join('');

    const card = document.createElement('div');
    card.className = 'tl-card';
    card.innerHTML = `
      <div class="tl-day">${escapeHtml(s.day || '')}</div>
      <div class="tl-date">${escapeHtml(s.date || '')}</div>
      <h3>${escapeHtml(s.title || '')}</h3>
      <ul>${items}</ul>
    `;
    wrap.appendChild(card);
  });
}

// ---------- MEMBERS (committee / advisors / general) ----------
function renderMembers(containerId, docs) {
  const wrap = document.getElementById(containerId);
  if (!wrap || docs.length === 0) return;

  wrap.innerHTML = '';

  docs.forEach(d => {
    const m = d.data();
    const photo = m.photoUrl
      ? `<img src="${escapeAttr(m.photoUrl)}" alt="${escapeAttr(m.name || '')}">`
      : '👤';

    const card = document.createElement('div');
    card.className = 'mem-card';
    card.innerHTML = `
      <div class="mem-photo">${photo}</div>
      <h4>${escapeHtml(m.name || '')}</h4>
      <div class="role">${escapeHtml(m.role || '')}</div>
    `;
    wrap.appendChild(card);
  });
}

// ---------- GALLERY (masonry) ----------
function renderGallery(docs) {
  const wrap = document.getElementById('masonryGrid');
  if (!wrap || docs.length === 0) return;

  wrap.innerHTML = '';

  docs.forEach(d => {
    const g = d.data();
    const item = document.createElement('div');
    item.className = 'm-item';

    if (g.imageUrl) {
      item.innerHTML = `<img src="${escapeAttr(g.imageUrl)}" alt="${escapeAttr(g.caption || '')}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
    } else {
      item.innerHTML = `<div class="ph">${escapeHtml(g.caption || '')}</div>`;
    }
    wrap.appendChild(item);
  });
}

// ---------- AFFILIATES (অঙ্গসংগঠন) ----------
function renderAffiliates(docs) {
  const wrap = document.getElementById('affiliatesGrid');
  if (!wrap || docs.length === 0) return;

  wrap.innerHTML = '';

  docs.forEach(d => {
    const a = d.data();
    const iconHtml = a.logoUrl
      ? `<img src="${escapeAttr(a.logoUrl)}" alt="${escapeAttr(a.name || '')}">`
      : (a.icon || '🏛️');

    const linkHtml = a.link
      ? `<a class="aff-link" href="${escapeAttr(a.link)}" target="_blank" rel="noopener noreferrer">ওয়েবসাইট দেখুন →</a>`
      : '';

    const card = document.createElement('div');
    card.className = 'aff-card';
    card.innerHTML = `
      <div class="aff-icon">${iconHtml}</div>
      <h3>${escapeHtml(a.name || '')}</h3>
      <p>${escapeHtml(a.desc || '')}</p>
      ${linkHtml}
    `;
    wrap.appendChild(card);
  });
}

// ---------- helpers ----------
function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}
function escapeAttr(str) {
  return String(str).replace(/"/g, '&quot;');
}

// ---------- fetch all ----------
// Sorts docs by their 'order' field client-side. Docs missing 'order'
// are treated as 0 instead of being dropped — Firestore's orderBy()
// would otherwise silently exclude any document without that field.
function sortByOrder(docs) {
  return docs.slice().sort((a, b) => {
    const oa = Number(a.data().order);
    const ob = Number(b.data().order);
    return (isNaN(oa) ? 0 : oa) - (isNaN(ob) ? 0 : ob);
  });
}

async function loadPublicData() {
  try {
    const noticesSnap = await db.collection('notices').get();
    renderNotices(sortByOrder(noticesSnap.docs));
  } catch (e) { console.warn('notices fetch failed', e); }

  try {
    const scheduleSnap = await db.collection('schedule').get();
    renderSchedule(sortByOrder(scheduleSnap.docs));
  } catch (e) { console.warn('schedule fetch failed', e); }

  try {
    const membersSnap = await db.collection('members')
      .where('group', '==', 'committee').get();
    renderMembers('membersGrid', sortByOrder(membersSnap.docs));
  } catch (e) { console.warn('members(committee) fetch failed', e); }

  try {
    const advisorsSnap = await db.collection('members')
      .where('group', '==', 'advisor').get();
    renderMembers('advisorsGrid', sortByOrder(advisorsSnap.docs));
  } catch (e) { console.warn('members(advisor) fetch failed', e); }

  try {
    const generalSnap = await db.collection('members')
      .where('group', '==', 'general').get();
    renderMembers('generalMembersGrid', sortByOrder(generalSnap.docs));
  } catch (e) { console.warn('members(general) fetch failed', e); }

  try {
    const gallerySnap = await db.collection('gallery').get();
    renderGallery(sortByOrder(gallerySnap.docs));
  } catch (e) { console.warn('gallery fetch failed', e); }

  try {
    const affiliatesSnap = await db.collection('affiliates').get();
    renderAffiliates(sortByOrder(affiliatesSnap.docs));
  } catch (e) { console.warn('affiliates fetch failed', e); }
}

document.addEventListener('DOMContentLoaded', loadPublicData);