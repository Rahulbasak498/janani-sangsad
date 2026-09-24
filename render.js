// =========================================================
// PUBLIC SITE — FIREBASE DATA RENDER
// =========================================================

let noticeSnapshotReady = false;
const seenNoticeIds = new Set();

function notifyAboutNewNotices(docs) {
  const newDocs = docs.filter(doc => !seenNoticeIds.has(doc.id));
  docs.forEach(doc => seenNoticeIds.add(doc.id));

  if (!noticeSnapshotReady) {
    noticeSnapshotReady = true;
    return;
  }

  if (!newDocs.length || !('Notification' in window) || Notification.permission !== 'granted') return;

  const latest = newDocs[0].data();
  new Notification(latest.title || 'জননী সংসদে নতুন নোটিশ', {
    body: latest.desc || 'ওয়েবসাইটে নতুন নোটিশ প্রকাশিত হয়েছে।',
    icon: 'image/maa-durga.png'
  });
}

// ---------- NOTICES ----------
function renderNotices(docs) {
  const wrap = document.getElementById('noticeList');

  if (!wrap) return;

  notifyAboutNewNotices(docs);

  wrap.innerHTML = '';

  if (docs.length === 0) {
    wrap.innerHTML = '<div class="empty-note">এখন কোনো নোটিশ নেই।</div>';
    return;
  }

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
  const tickerWrap = document.querySelector('.ticker-wrap');

  if (!wrap) return;

  const items = docs
    .filter(d => d.data().active !== false && d.data().active !== 'false')
    .map(d => `<span>${escapeHtml(d.data().message || '')}</span>`)
    .join('');

  if (!items) {
    wrap.innerHTML = '';
    if (tickerWrap) tickerWrap.style.display = 'none';
    return;
  }

  if (tickerWrap) tickerWrap.style.display = '';

  // Repeat the messages so the existing marquee animation remains seamless.
  wrap.innerHTML = items + items;
}


// ---------- SITE SETTINGS ----------
// ---------- PLACEHOLDER GUARD ----------
// Values that were seeded as *samples* must never be shown to visitors as if
// they were real contact/payment details. Anything matching these patterns
// is treated as "not filled in yet" and its row/card stays hidden.
const PLACEHOLDER_PATTERNS = [
  /01710000000/,
  /0000-?0000-?0000/,
  /durgapujacommittee/i,
  /pujacommittee\.org/i
];

function isRealValue(value) {
  const text = String(value == null ? '' : value).trim();
  if (!text || text === '#') return false;
  const compact = text.replace(/\s+/g, '');
  return !PLACEHOLDER_PATTERNS.some(re => re.test(text) || re.test(compact));
}

function setHidden(id, hidden) {
  const el = document.getElementById(id);
  if (el) el.hidden = !!hidden;
}

function applySiteSettings(settings) {
  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element && value !== undefined) element.textContent = value;
  };

  const setAttr = (id, attr, value) => {
    const element = document.getElementById(id);
    if (element && value) element.setAttribute(attr, value);
  };

  setText('heroTitleMain', settings.heroTitleMain);
  setText('heroTitleSub', settings.heroTitleSub);
  const committeeName = String(settings.committeeName || '')
    .replace(/শ্রী\s*শ্রী\s*/g, '')
    .trim();
  setText('committeeName', committeeName);
  setText('navBrandName', committeeName);
  setText('footerBrandName', committeeName);
  setText('footerCreditName', committeeName);
  setText('navTagline', settings.foundingTagline);
  setAttr('heroDeity', 'src', settings.heroImageUrl);
  // ---- Donation (rows stay hidden until real values exist) ----
  const bkashOk = isRealValue(settings.bkashNagad);
  if (bkashOk) setText('bkashNagad', settings.bkashNagad);
  setText('bkashNagadNote', bkashOk ? (settings.bkashNagadNote || '') : '');
  setHidden('rowBkash', !bkashOk);

  const bankOk = isRealValue(settings.bankAccount);
  if (bankOk) {
    setText('bankName', settings.bankName);
    setText('bankAccount', settings.bankAccount);
  }
  setHidden('rowBank', !bankOk);

  setText('cashNote', settings.cashNote);

  // image/QR.jpg is the bundled DEMO placeholder — only show a QR when the
  // admin has pointed the setting at their own real image.
  const qrUrl = String(settings.donationQrUrl || '').trim();
  const qrOk = qrUrl && !/(^|\/)QR\.jpg(\?.*)?$/i.test(qrUrl);
  if (qrOk) setAttr('donationQr', 'src', qrUrl);
  setHidden('qrBox', !qrOk);

  const receiptOk = isRealValue(settings.receiptUrl);
  if (receiptOk) {
    setAttr('receiptUrl', 'href', settings.receiptUrl);
    setAttr('receiptUrl', 'target', '_blank');
    setAttr('receiptUrl', 'rel', 'noopener noreferrer');
  }
  setHidden('receiptUrl', !receiptOk);

  // ---- Location ----
  setText('locationTitle', settings.locationTitle);
  setText('locationAddress', settings.locationAddress);
  setText('locationHours', settings.locationHours);
  setText('locationDirection', settings.locationDirection);
  setAttr('mapEmbed', 'src', settings.mapEmbedUrl);
  setAttr('mapLink', 'href', settings.mapLink);

  // ---- Contact (cards stay hidden until real values exist) ----
  const phoneOk = isRealValue(settings.contactPhone);
  if (phoneOk) setText('contactPhone', settings.contactPhone);
  setHidden('cardPhone', !phoneOk);
  const phoneLink = document.getElementById('footerPhoneLink');
  if (phoneLink) {
    if (phoneOk) phoneLink.setAttribute('href', 'tel:' + String(settings.contactPhone).replace(/\s+/g, ''));
    phoneLink.hidden = !phoneOk;
  }

  const fbOk = isRealValue(settings.facebookUrl);
  if (fbOk) {
    setAttr('facebookLink', 'href', settings.facebookUrl);
    setAttr('facebookLink', 'target', '_blank');
    setAttr('facebookLink', 'rel', 'noopener noreferrer');
    setText('facebookLabel', isRealValue(settings.facebookLabel)
      ? settings.facebookLabel
      : String(settings.facebookUrl).replace(/^https?:\/\/(www\.)?/, ''));
  }
  setHidden('cardFacebook', !fbOk);

  [['footerFacebookLink', settings.facebookUrl],
   ['footerInstagramLink', settings.instagramUrl],
   ['footerYoutubeLink', settings.youtubeUrl]].forEach(([id, url]) => {
    const ok = isRealValue(url);
    if (ok) setAttr(id, 'href', url);
    setHidden(id, !ok);
  });

  const emailOk = isRealValue(settings.contactEmail);
  if (emailOk) setText('contactEmail', settings.contactEmail);
  setHidden('cardEmail', !emailOk);


  // ---- page title / meta (SEO) ----
  if (settings.siteTitle) document.title = settings.siteTitle;

  const setMeta = (selector, attr, value) => {
    if (value === undefined) return;
    const el = document.querySelector(selector);
    if (el) el.setAttribute(attr, value);
  };
  setMeta('meta[name="description"]', 'content', settings.metaDescription);
  setMeta('meta[property="og:title"]', 'content', settings.siteTitle);
  setMeta('meta[property="og:description"]', 'content', settings.metaDescription);

  const footerYear = document.getElementById('footerYear');
  if (footerYear) footerYear.textContent = new Date().getFullYear();

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

  if (!wrap) return;

  wrap.innerHTML = '';

  if (docs.length === 0) {
    wrap.innerHTML = '<div class="empty-note">সময়সূচি এখনো যোগ করা হয়নি।</div>';
    return;
  }

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

  if (!wrap) return;

  wrap.innerHTML = '';

  if (docs.length === 0) {
    wrap.innerHTML = '<div class="empty-note">এখনো কেউ যোগ করা হয়নি।</div>';
    return;
  }

  docs.forEach(d => {
    const m = d.data();

    const photo = m.photoUrl
      ? `
        <img
          src="${escapeAttr(m.photoUrl)}"
          alt="${escapeAttr(m.name || '')}"
          loading="lazy"
          decoding="async"
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
// GALLERY — সম্পূর্ণ Admin/Firestore নির্ভর।
// Firestore-এ ছবি না থাকলে গ্যালারি খালি দেখাবে;
// admin থেকে ছবি মুছে ফেললে সাথে সাথে ওয়েবসাইট থেকেও মুছে যাবে।
// =========================================================

function renderGallery(docs) {

  const wrap = document.getElementById('masonryGrid');

  if (!wrap) return;

  wrap.innerHTML = '';

  if (docs.length === 0) {
    wrap.innerHTML = '<div class="empty-note">গ্যালারিতে এখনো কোনো ছবি যোগ করা হয়নি।</div>';
    return;
  }


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
          decoding="async"
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

  if (!wrap) return;

  wrap.innerHTML = '';

  // On the homepage, don't show an empty section at all.
  const affiliatesSection = document.getElementById('affiliates');

  if (docs.length === 0) {
    if (affiliatesSection && !document.body.classList.contains('subpage')) affiliatesSection.hidden = true;
    wrap.innerHTML = '<div class="empty-note">এখনো কোনো অঙ্গসংগঠন যোগ করা হয়নি।</div>';
    return;
  }

  if (affiliatesSection) affiliatesSection.hidden = false;


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


// ---------- EVENTS ----------
function renderEvents(docs) {

  const wrap = document.getElementById('eventsGrid');

  if (!wrap) return;

  wrap.innerHTML = '';

  if (docs.length === 0) {
    wrap.innerHTML = '<div class="empty-note">এখনো কোনো অনুষ্ঠান যোগ করা হয়নি।</div>';
    return;
  }

  docs.forEach(d => {

    const ev = d.data();

    const card = document.createElement('div');
    card.className = 'ev-card';

    card.innerHTML = `
      <div class="ev-icon">${ev.icon || '🎉'}</div>
      <h3>${escapeHtml(ev.title || '')}</h3>
      <p>${escapeHtml(ev.desc || '')}</p>
    `;

    wrap.appendChild(card);
  });
}


// ---------- ABOUT ----------
function renderAbout(about) {

  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element && value !== undefined) element.textContent = value;
  };

  setText('aboutHeading', about.heading);
  setText('aboutStat1Num', about.stat1Num);
  setText('aboutStat1Label', about.stat1Label);
  setText('aboutStat2Num', about.stat2Num);
  setText('aboutStat2Label', about.stat2Label);
  setText('aboutStat3Num', about.stat3Num);
  setText('aboutStat3Label', about.stat3Label);

  const wrap = document.getElementById('aboutText');
  if (!wrap) return;

  const paragraphs = Array.isArray(about.paragraphs) ? about.paragraphs : [];

  if (paragraphs.length === 0) {
    wrap.innerHTML = '<p class="empty-note">এখনো বিবরণ যোগ করা হয়নি।</p>';
    return;
  }

  wrap.innerHTML = paragraphs
    .map(p => `<p>${escapeHtml(p)}</p>`)
    .join('');
}


// ---------- PAGE HEADINGS ----------
function renderPageHeadings(data) {
  const keys = ['about', 'schedule', 'events', 'gallery', 'committee', 'advisors',
    'generalMembers', 'affiliates', 'donation', 'notice', 'location', 'contact'];

  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element && value !== undefined) element.textContent = value;
  };

  keys.forEach(key => {
    setText('ph-eyebrow-' + key, data['eyebrow_' + key]);
    setText('ph-title-' + key, data['title_' + key]);
    setText('ph-sub-' + key, data['sub_' + key]);
  });
}


// =========================================================
// HELPERS
// =========================================================

(function setFooterYearImmediately() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
})();

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


// ---------- LOAD-ERROR FALLBACK ----------
// If a listener fails (offline, blocked, bad Firestore rules) the
// "লোড হচ্ছে..." placeholder used to stay forever. Replace only that
// placeholder — never real content — with a friendly retry note.
const LOADING_CONTAINERS = [
  'timeline', 'eventsGrid', 'masonryGrid', 'membersGrid',
  'advisorsGrid', 'generalMembersGrid', 'noticeList'
];

function showLoadError(containerId) {
  const el = document.getElementById(containerId);
  if (!el || el.children.length !== 1) return;
  const note = el.querySelector('.empty-note');
  if (!note || !/লোড হচ্ছে/.test(note.textContent)) return;
  note.classList.add('is-error');
  note.innerHTML = 'তথ্য এই মুহূর্তে লোড করা যাচ্ছে না। ইন্টারনেট সংযোগ দেখে ' +
    '<button type="button" class="retry-link" onclick="location.reload()">আবার চেষ্টা করুন</button>';
}

// Safety net, independent of Firebase: if nothing arrived after 12s
// (SDK blocked, very slow network) turn the placeholders into a retry note.
setTimeout(() => LOADING_CONTAINERS.forEach(showLoadError), 12000);

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
      e => { console.warn('Notices listener failed:', e); showLoadError('noticeList'); }
    );
  } catch (e) {
    console.warn('Notices listener setup failed:', e);
  }


  // ---------- SCHEDULE ----------
  db.collection('schedule').onSnapshot(
    snap => renderSchedule(sortByOrder(snap.docs)),
    e => { console.warn('Schedule listener failed:', e); showLoadError('timeline'); }
  );


  // ---------- COMMITTEE MEMBERS ----------
  db.collection('members').where('group', '==', 'committee').onSnapshot(
    snap => renderMembers('membersGrid', sortByOrder(snap.docs)),
    e => { console.warn('Committee members listener failed:', e); showLoadError('membersGrid'); }
  );


  // ---------- ADVISORS ----------
  db.collection('members').where('group', '==', 'advisor').onSnapshot(
    snap => renderMembers('advisorsGrid', sortByOrder(snap.docs)),
    e => { console.warn('Advisor listener failed:', e); showLoadError('advisorsGrid'); }
  );


  // ---------- TICKER ----------
  db.collection('ticker').onSnapshot(
    snap => renderTicker(sortByOrder(snap.docs)),
    e => console.warn('Ticker listener failed. Static ticker kept:', e)
  );


  // ---------- GENERAL MEMBERS ----------
  db.collection('members').where('group', '==', 'general').onSnapshot(
    snap => renderMembers('generalMembersGrid', sortByOrder(snap.docs)),
    e => { console.warn('General members listener failed:', e); showLoadError('generalMembersGrid'); }
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
    e => { console.warn('Gallery listener failed:', e); showLoadError('masonryGrid'); }
  );


  // ---------- AFFILIATES ----------
  db.collection('affiliates').onSnapshot(
    snap => renderAffiliates(sortByOrder(snap.docs)),
    e => console.warn('Affiliates listener failed:', e)
  );


  // ---------- EVENTS ----------
  db.collection('events').onSnapshot(
    snap => renderEvents(sortByOrder(snap.docs)),
    e => { console.warn('Events listener failed:', e); showLoadError('eventsGrid'); }
  );


  // ---------- ABOUT ----------
  db.collection('about').limit(1).onSnapshot(
    snap => renderAbout(snap.empty ? {} : snap.docs[0].data()),
    e => console.warn('About listener failed:', e)
  );


  // ---------- PAGE HEADINGS ----------
  db.collection('pageHeadings').limit(1).onSnapshot(
    snap => renderPageHeadings(snap.empty ? {} : snap.docs[0].data()),
    e => console.warn('Page headings listener failed:', e)
  );

}


// =========================================================
// START
// =========================================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadPublicData, { once: true });
} else {
  loadPublicData();
}