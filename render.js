// =========================================================
// PUBLIC SITE — FIREBASE DATA RENDER
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

      <div class="n-date">
        ${escapeHtml(n.date || '')}
      </div>
    `;

    wrap.appendChild(item);
  });
}


// ---------- SCHEDULE ----------
function renderSchedule(docs) {
  const wrap = document.getElementById('timeline');

  if (!wrap || docs.length === 0) return;

  wrap.innerHTML = '';

  docs.forEach(d => {
    const s = d.data();

    const items = (s.items || [])
      .map(item => `<li>${escapeHtml(item)}</li>`)
      .join('');

    const card = document.createElement('div');

    card.className = 'tl-card';

    card.innerHTML = `
      <div class="tl-day">
        ${escapeHtml(s.day || '')}
      </div>

      <div class="tl-date">
        ${escapeHtml(s.date || '')}
      </div>

      <h3>
        ${escapeHtml(s.title || '')}
      </h3>

      <ul>
        ${items}
      </ul>
    `;

    wrap.appendChild(card);
  });
}


// ---------- MEMBERS ----------
function renderMembers(containerId, docs) {
  const wrap = document.getElementById(containerId);

  if (!wrap || docs.length === 0) return;

  wrap.innerHTML = '';

  docs.forEach(d => {
    const m = d.data();

    const photo = m.photoUrl
      ? `
        <img
          src="${escapeAttr(m.photoUrl)}"
          alt="${escapeAttr(m.name || '')}"
          style="width:100%;height:100%;object-fit:cover;"
          onerror="this.style.display='none';"
        >
      `
      : '👤';

    const card = document.createElement('div');

    card.className = 'mem-card';

    card.innerHTML = `
      <div class="mem-photo">
        ${photo}
      </div>

      <h4>
        ${escapeHtml(m.name || '')}
      </h4>

      <div class="role">
        ${escapeHtml(m.role || '')}
      </div>
    `;

    wrap.appendChild(card);
  });
}


// =========================================================
// GALLERY
// =========================================================
//
// IMPORTANT:
// Firebase gallery data থাকলে সেটি দেখাবে।
// Firebase gallery empty হলে HTML-এর static images
// আগের মতোই থাকবে।
//
// তাই Firebase-এর gallery সমস্যা হলেও
// GitHub-এর image folder-এর ছবি মুছে যাবে না.
// =========================================================

function renderGallery(docs) {

  const wrap = document.getElementById('masonryGrid');

  if (!wrap) return;


  // Firebase gallery EMPTY হলে
  // HTML-এর existing/static images রেখে দাও
  if (docs.length === 0) {
    console.log('Gallery: Firestore empty. Static images kept.');
    return;
  }


  // Firebase gallery-তে data থাকলে
  // তখন Firebase images দেখাবে
  wrap.innerHTML = '';


  docs.forEach(d => {

    const g = d.data();

    const item = document.createElement('div');

    item.className = 'm-item';


    if (g.imageUrl) {

      item.innerHTML = `
        <img
          src="${escapeAttr(g.imageUrl)}"
          alt="${escapeAttr(g.caption || 'Gallery Image')}"
          style="
            width:100%;
            height:100%;
            object-fit:cover;
            display:block;
            border-radius:inherit;
          "
          onerror="this.parentElement.innerHTML='<div class=ph>ছবি লোড হয়নি</div>';"
        >
      `;

    } else {

      // imageUrl না থাকলে placeholder
      item.innerHTML = `
        <div class="ph">
          ${escapeHtml(g.caption || 'ছবি নেই')}
        </div>
      `;
    }


    wrap.appendChild(item);

  });
}


// ---------- AFFILIATES ----------
function renderAffiliates(docs) {

  const wrap = document.getElementById('affiliatesGrid');

  if (!wrap || docs.length === 0) return;

  wrap.innerHTML = '';


  docs.forEach(d => {

    const a = d.data();


    const iconHtml = a.logoUrl
      ? `
        <img
          src="${escapeAttr(a.logoUrl)}"
          alt="${escapeAttr(a.name || '')}"
          style="max-width:100%;height:auto;"
        >
      `
      : (a.icon || '🏛️');


    const linkHtml = a.link
      ? `
        <a
          class="aff-link"
          href="${escapeAttr(a.link)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          ওয়েবসাইট দেখুন →
        </a>
      `
      : '';


    const card = document.createElement('div');

    card.className = 'aff-card';


    card.innerHTML = `
      <div class="aff-icon">
        ${iconHtml}
      </div>

      <h3>
        ${escapeHtml(a.name || '')}
      </h3>

      <p>
        ${escapeHtml(a.desc || '')}
      </p>

      ${linkHtml}
    `;


    wrap.appendChild(card);

  });
}


// =========================================================
// HELPERS
// =========================================================

function escapeHtml(str) {

  const d = document.createElement('div');

  d.textContent = str ?? '';

  return d.innerHTML;
}


function escapeAttr(str) {

  return String(str ?? '')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}


// =========================================================
// SORT
// =========================================================

function sortByOrder(docs) {

  return docs.slice().sort((a, b) => {

    const oa = Number(a.data().order);
    const ob = Number(b.data().order);

    return (
      (isNaN(oa) ? 0 : oa) -
      (isNaN(ob) ? 0 : ob)
    );

  });
}


// =========================================================
// LOAD FIREBASE DATA
// =========================================================

async function loadPublicData() {


  // ---------- NOTICES ----------
  try {

    const noticesSnap =
      await db.collection('notices').get();

    renderNotices(
      sortByOrder(noticesSnap.docs)
    );

  } catch (e) {

    console.warn(
      'Notices fetch failed:',
      e
    );

  }


  // ---------- SCHEDULE ----------
  try {

    const scheduleSnap =
      await db.collection('schedule').get();

    renderSchedule(
      sortByOrder(scheduleSnap.docs)
    );

  } catch (e) {

    console.warn(
      'Schedule fetch failed:',
      e
    );

  }


  // ---------- COMMITTEE MEMBERS ----------
  try {

    const membersSnap =
      await db
        .collection('members')
        .where('group', '==', 'committee')
        .get();

    renderMembers(
      'membersGrid',
      sortByOrder(membersSnap.docs)
    );

  } catch (e) {

    console.warn(
      'Committee members fetch failed:',
      e
    );

  }


  // ---------- ADVISORS ----------
  try {

    const advisorsSnap =
      await db
        .collection('members')
        .where('group', '==', 'advisor')
        .get();

    renderMembers(
      'advisorsGrid',
      sortByOrder(advisorsSnap.docs)
    );

  } catch (e) {

    console.warn(
      'Advisor fetch failed:',
      e
    );

  }


  // ---------- GENERAL MEMBERS ----------
  try {

    const generalSnap =
      await db
        .collection('members')
        .where('group', '==', 'general')
        .get();

    renderMembers(
      'generalMembersGrid',
      sortByOrder(generalSnap.docs)
    );

  } catch (e) {

    console.warn(
      'General members fetch failed:',
      e
    );

  }


  // =======================================================
  // GALLERY
  // =======================================================
  //
  // IMPORTANT:
  // Gallery Firebase থেকে load হবে।
  // কিন্তু Firestore gallery EMPTY হলে
  // index.html-এর static images থাকবে।
  //
  // =======================================================

  try {

    const gallerySnap =
      await db.collection('gallery').get();

    renderGallery(
      sortByOrder(gallerySnap.docs)
    );

  } catch (e) {

    console.warn(
      'Gallery fetch failed. Static images kept:',
      e
    );

  }


  // ---------- AFFILIATES ----------
  try {

    const affiliatesSnap =
      await db.collection('affiliates').get();

    renderAffiliates(
      sortByOrder(affiliatesSnap.docs)
    );

  } catch (e) {

    console.warn(
      'Affiliates fetch failed:',
      e
    );

  }

}


// =========================================================
// START
// =========================================================

document.addEventListener(
  'DOMContentLoaded',
  loadPublicData
);