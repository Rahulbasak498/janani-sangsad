// =========================================================
// PUBLIC SITE — FIREBASE DATA RENDER
// =========================================================

// ---------- NOTICES ----------
function renderNotices(docs) {
  const wrap = document.getElementById('noticeList');

  if (!wrap || docs.length === 0) return;

  wrap.innerHTML = '';

  docs
    .slice()
    .sort((a, b) => Number(b.data().pinned === true || b.data().pinned === 'true') - Number(a.data().pinned === true || a.data().pinned === 'true'))
    .forEach(d => {
    const n = d.data();

    const item = document.createElement('div');
    item.className = `notice-item${n.pinned === true || n.pinned === 'true' ? ' is-pinned' : ''}`;

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


// ---------- TICKER ----------
function renderTicker(docs) {
  const wrap = document.getElementById('tickerTrack');

  if (!wrap || docs.length === 0) return;

  const items = docs
    .filter(d => d.data().active !== false && d.data().active !== 'false')
    .map(d => `<span>${escapeHtml(d.data().message || '')}</span>`)
    .join('');

  if (!items) return;

  // Repeat the messages so the existing marquee animation remains seamless.
  wrap.innerHTML = items + items;
}


// ---------- SITE SETTINGS ----------
function applySiteSettings(settings) {
  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element && value !== undefined && value !== '') element.textContent = value;
  };

  const setAttr = (id, attr, value) => {
    const element = document.getElementById(id);
    if (element && value) element.setAttribute(attr, value);
  };

  setText('heroTitleMain', settings.heroTitleMain);
  setText('heroTitleSub', settings.heroTitleSub);
  setText('committeeName', settings.committeeName);
  setAttr('heroDeity', 'src', settings.heroImageUrl);
  setText('bkashNagad', settings.bkashNagad);
  setText('bankName', settings.bankName);
  setText('bankAccount', settings.bankAccount);
  setText('cashNote', settings.cashNote);
  setAttr('donationQr', 'src', settings.donationQrUrl);
  setAttr('receiptUrl', 'href', settings.receiptUrl);
  setText('locationTitle', settings.locationTitle);
  setText('locationAddress', settings.locationAddress);
  setText('locationHours', settings.locationHours);
  setText('locationDirection', settings.locationDirection);
  setAttr('mapEmbed', 'src', settings.mapEmbedUrl);
  setAttr('mapLink', 'href', settings.mapLink);
  setText('contactPhone', settings.contactPhone);
  setText('facebookLabel', settings.facebookLabel);
  setAttr('facebookLink', 'href', settings.facebookUrl);
  setText('contactEmail', settings.contactEmail);

  window.dispatchEvent(new CustomEvent('siteSettingsLoaded', { detail: settings }));
}

function setDataStatus(message, visible) {
  const status = document.getElementById('dataStatus');
  if (!status) return;
  status.textContent = message;
  status.classList.toggle('visible', visible);
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
    return;
  }


  // Firebase gallery-তে data থাকলে
  // তখন Firebase images দেখাবে
  wrap.innerHTML = '';


  docs.forEach((d, index) => {

    const g = d.data();

    const item = document.createElement('div');

    item.className = `m-item m${(index % 7) + 2}`;


    if (g.imageUrl) {

      item.innerHTML = `
        <img
          src="${escapeAttr(g.imageUrl)}"
          alt="${escapeAttr(g.caption || 'Gallery Image')}"
          loading="lazy"
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

  // ---------- SITE SETTINGS ----------
  db.collection('siteSettings').limit(1).onSnapshot(
    snap => {
      if (!snap.empty) applySiteSettings(snap.docs[0].data());
      setDataStatus('', false);
    },
    e => {
      console.warn('Site settings listener failed. Static content kept:', e);
      setDataStatus('লাইভ ডেটা লোড হয়নি, static content দেখানো হচ্ছে।', true);
    }
  );


  // ---------- NOTICES ----------
  try {
    db.collection('notices').onSnapshot(
      snap => renderNotices(sortByOrder(snap.docs)),
      e => console.warn('Notices listener failed:', e)
    );
  } catch (e) {
    console.warn('Notices listener setup failed:', e);
  }


  // ---------- SCHEDULE ----------
  db.collection('schedule').onSnapshot(
    snap => renderSchedule(sortByOrder(snap.docs)),
    e => console.warn('Schedule listener failed:', e)
  );


  // ---------- COMMITTEE MEMBERS ----------
  db.collection('members').where('group', '==', 'committee').onSnapshot(
    snap => renderMembers('membersGrid', sortByOrder(snap.docs)),
    e => console.warn('Committee members listener failed:', e)
  );


  // ---------- ADVISORS ----------
  db.collection('members').where('group', '==', 'advisor').onSnapshot(
    snap => renderMembers('advisorsGrid', sortByOrder(snap.docs)),
    e => console.warn('Advisor listener failed:', e)
  );


  // ---------- TICKER ----------
  db.collection('ticker').onSnapshot(
    snap => renderTicker(sortByOrder(snap.docs)),
    e => console.warn('Ticker listener failed. Static ticker kept:', e)
  );


  // ---------- GENERAL MEMBERS ----------
  db.collection('members').where('group', '==', 'general').onSnapshot(
    snap => renderMembers('generalMembersGrid', sortByOrder(snap.docs)),
    e => console.warn('General members listener failed:', e)
  );


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

  db.collection('gallery').onSnapshot(
    snap => renderGallery(sortByOrder(snap.docs)),
    e => console.warn('Gallery listener failed. Static images kept:', e)
  );


  // ---------- AFFILIATES ----------
  db.collection('affiliates').onSnapshot(
    snap => renderAffiliates(sortByOrder(snap.docs)),
    e => console.warn('Affiliates listener failed:', e)
  );

}


// =========================================================
// START
// =========================================================

document.addEventListener(
  'DOMContentLoaded',
  loadPublicData
);