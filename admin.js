// =========================================================
// ADMIN PANEL LOGIC
// =========================================================

const SCHEMAS = {
  notices: {
    label: 'নোটিশ',
    fields: [
      { key: 'icon',  label: 'আইকন (ইমোজি)', type: 'text', placeholder: '📌' },
      { key: 'title', label: 'শিরোনাম', type: 'text', required: true },
      { key: 'desc',  label: 'বিবরণ', type: 'textarea' },
      { key: 'date',  label: 'তারিখ (যেমন: ২ দিন আগে)', type: 'text' },
      { key: 'pinned', label: 'গুরুত্বপূর্ণ notice হিসেবে ওপরে দেখাবেন?', type: 'select', options: [['false', 'না'], ['true', 'হ্যাঁ']], default: 'false' },
      { key: 'order', label: 'ক্রম (ছোট সংখ্যা আগে দেখাবে)', type: 'number', default: 0 }
    ],
    card: n => ({ thumb: n.icon || '📌', title: n.title, sub: n.desc })
  },
  schedule: {
    label: 'সময়সূচি',
    fields: [
      { key: 'day',   label: 'দিনের নাম (যেমন: ষষ্ঠী)', type: 'text', required: true },
      { key: 'date',  label: 'তারিখ', type: 'text' },
      { key: 'title', label: 'শিরোনাম', type: 'text' },
      { key: 'items', label: 'সময়সূচি (প্রতি লাইনে একটি বিষয়)', type: 'textarea', isList: true,
        placeholder: 'ভোর ৬:০০টা — কালপরম্ভ\nসকাল ৯:০০টা — পূজা ও পুষ্পাঞ্জলি' },
      { key: 'order', label: 'ক্রম', type: 'number', default: 0 }
    ],
    card: s => ({ thumb: '🗓️', title: `${s.day || ''} — ${s.title || ''}`, sub: s.date })
  },
  committee: {
    label: 'কার্যকরী সদস্যবৃন্দ',
    collection: 'members',
    filter: { field: 'group', value: 'committee' },
    fields: [
      { key: 'name', label: 'নাম', type: 'text', required: true },
      { key: 'role', label: 'পদবি', type: 'text' },
      { key: 'photoUrl', label: 'ছবির URL (ঐচ্ছিক, না দিলে 👤 দেখাবে)', type: 'text' },
      { key: 'order', label: 'ক্রম', type: 'number', default: 0 }
    ],
    card: m => ({ thumb: m.photoUrl ? { img: m.photoUrl } : '👤', title: m.name, sub: m.role })
  },
  advisors: {
    label: 'উপদেষ্টা',
    collection: 'members',
    filter: { field: 'group', value: 'advisor' },
    fields: [
      { key: 'name', label: 'নাম', type: 'text', required: true },
      { key: 'role', label: 'পদবি', type: 'text' },
      { key: 'photoUrl', label: 'ছবির URL (ঐচ্ছিক, না দিলে 👤 দেখাবে)', type: 'text' },
      { key: 'order', label: 'ক্রম', type: 'number', default: 0 }
    ],
    card: m => ({ thumb: m.photoUrl ? { img: m.photoUrl } : '👤', title: m.name, sub: m.role })
  },
  generalMembers: {
    label: 'সাধারণ সদস্যবৃন্দ',
    collection: 'members',
    filter: { field: 'group', value: 'general' },
    fields: [
      { key: 'name', label: 'নাম', type: 'text', required: true },
      { key: 'role', label: 'পদবি', type: 'text' },
      { key: 'photoUrl', label: 'ছবির URL (ঐচ্ছিক, না দিলে 👤 দেখাবে)', type: 'text' },
      { key: 'order', label: 'ক্রম', type: 'number', default: 0 }
    ],
    card: m => ({ thumb: m.photoUrl ? { img: m.photoUrl } : '👤', title: m.name, sub: m.role })
  },
  gallery: {
    label: 'গ্যালারি',
    fields: [
      { key: 'caption', label: 'ক্যাপশন', type: 'text' },
      { key: 'imageUrl', label: 'ছবির URL (upload না করলে)', type: 'text' },
      { key: 'imageFile', label: 'সরাসরি ছবি upload (ঐচ্ছিক)', type: 'file', accept: 'image/*' },
      { key: 'order', label: 'ক্রম', type: 'number', default: 0 }
    ],
    card: g => ({ thumb: g.imageUrl ? { img: g.imageUrl } : '🖼️', title: g.caption, sub: g.imageUrl })
  },
  affiliates: {
    label: 'অঙ্গসংগঠন',
    fields: [
      { key: 'icon',    label: 'আইকন (ইমোজি, লোগো URL না দিলে এটা দেখাবে)', type: 'text', placeholder: '🏛️' },
      { key: 'name',    label: 'সংগঠনের নাম', type: 'text', required: true },
      { key: 'desc',    label: 'সংক্ষিপ্ত বিবরণ', type: 'textarea' },
      { key: 'logoUrl', label: 'লোগো/ছবির URL (ঐচ্ছিক)', type: 'text' },
      { key: 'link',    label: 'ওয়েবসাইট/ফেসবুক লিংক (ঐচ্ছিক)', type: 'text' },
      { key: 'order',   label: 'ক্রম', type: 'number', default: 0 }
    ],
    card: a => ({ thumb: a.logoUrl ? { img: a.logoUrl } : (a.icon || '🏛️'), title: a.name, sub: a.desc })
  },
  ticker: {
    label: 'টিকার বার্তা',
    fields: [
      { key: 'message', label: 'টিকার বার্তা', type: 'textarea', required: true,
        placeholder: '🔔 নতুন টিকার বার্তা লিখুন' },
      { key: 'active', label: 'ওয়েবসাইটে দেখাবেন?', type: 'select', options: [['true', 'হ্যাঁ'], ['false', 'না']], default: 'true' },
      { key: 'order', label: 'ক্রম (ছোট সংখ্যা আগে দেখাবে)', type: 'number', default: 0 }
    ],
    card: t => ({ thumb: '📣', title: t.message, sub: `ক্রম: ${t.order ?? 0}` })
  },
  settings: {
    label: 'সাইট সেটিংস',
    collection: 'siteSettings',
    fields: [
      { key: 'heroTitleMain', label: 'Hero প্রধান শিরোনাম', type: 'text', default: 'মা আসছেন' },
      { key: 'heroTitleSub', label: 'Hero দ্বিতীয় লাইন', type: 'text', default: 'ঘরে ঘরে' },
      { key: 'committeeName', label: 'কমিটির নাম', type: 'text', default: 'শ্রী শ্রী জননী সংসদ' },
      { key: 'heroImageUrl', label: 'Hero image URL', type: 'text', default: 'image/maa-durga.png' },
      { key: 'pujaDate', label: 'পূজার তারিখ ও সময় (ISO format)', type: 'text', default: '2026-10-16T06:00:00+06:00' },
      { key: 'donationQrUrl', label: 'অনুদানের QR image URL', type: 'text', default: 'image/QR.jpg' },
      { key: 'bkashNagad', label: 'বিকাশ / নগদ নম্বর', type: 'text', default: '01710000000' },
      { key: 'bankName', label: 'ব্যাংক অ্যাকাউন্টের নাম', type: 'text', default: 'জননী সংসদ' },
      { key: 'bankAccount', label: 'ব্যাংক অ্যাকাউন্ট নম্বর', type: 'text', default: 'A/C: 0000-0000-0000' },
      { key: 'cashNote', label: 'নগদ অনুদানের বিবরণ', type: 'textarea', default: 'কমিটি অফিসে সরাসরি জমা দিতে পারেন' },
      { key: 'receiptUrl', label: 'রসিদ download URL (ঐচ্ছিক)', type: 'text' },
      { key: 'locationTitle', label: 'লোকেশন শিরোনাম', type: 'text', default: 'পূজা মণ্ডপের ঠিকানা' },
      { key: 'locationAddress', label: 'ঠিকানা', type: 'text', default: 'গঙ্গানগর, লস্করপুর, শায়েস্তাগঞ্জ, হবিগঞ্জ' },
      { key: 'locationHours', label: 'খোলার সময়', type: 'text', default: 'প্রতিদিন সকাল ৬টা থেকে রাত ১১টা পর্যন্ত খোলা' },
      { key: 'locationDirection', label: 'দিকনির্দেশের বিবরণ', type: 'text', default: 'নিকটস্থ বাস স্ট্যান্ড থেকে ৫ মিনিটের হাঁটা পথ' },
      { key: 'mapEmbedUrl', label: 'Google Map embed URL', type: 'text' },
      { key: 'mapLink', label: 'Google Map direction URL', type: 'text' },
      { key: 'contactPhone', label: 'ফোন নম্বর', type: 'text', default: '+880 1710000000' },
      { key: 'facebookUrl', label: 'Facebook URL', type: 'text' },
      { key: 'facebookLabel', label: 'Facebook display text', type: 'text', default: 'fb.com/durgapujacommittee' },
      { key: 'contactEmail', label: 'ইমেইল', type: 'text', default: 'info@pujacommittee.org' }
    ],
    card: s => ({ thumb: '⚙️', title: s.committeeName || 'সাইট সেটিংস', sub: 'Hero, donation, location ও contact' })
  }
};

const DEFAULT_TICKERS = [
  { message: '🔔 ষষ্ঠীর সন্ধ্যা আরতি শুরু বিকেল ৫টায়', active: 'true', order: 1 },
  { message: '🔔 সাংস্কৃতিক অনুষ্ঠানে অংশগ্রহণের জন্য রেজিস্ট্রেশন চলছে', active: 'true', order: 2 },
  { message: '🔔 ভোগ বিতরণ প্রতিদিন দুপুর ১২টা থেকে ২টা', active: 'true', order: 3 },
  { message: '🔔 অনুদান জমা দেওয়ার শেষ তারিখ ১৫ অক্টোবর', active: 'true', order: 4 }
];

const DEFAULT_SETTINGS = {
  heroTitleMain: 'মা আসছেন',
  heroTitleSub: 'ঘরে ঘরে',
  committeeName: 'শ্রী শ্রী জননী সংসদ',
  heroImageUrl: 'image/maa-durga.png',
  pujaDate: '2026-10-16T06:00:00+06:00',
  donationQrUrl: 'image/QR.jpg',
  bkashNagad: '01710000000',
  bankName: 'জননী সংসদ',
  bankAccount: 'A/C: 0000-0000-0000',
  cashNote: 'কমিটি অফিসে সরাসরি জমা দিতে পারেন',
  locationTitle: 'পূজা মণ্ডপের ঠিকানা',
  locationAddress: 'গঙ্গানগর, লস্করপুর, শায়েস্তাগঞ্জ, হবিগঞ্জ',
  locationHours: 'প্রতিদিন সকাল ৬টা থেকে রাত ১১টা পর্যন্ত খোলা',
  locationDirection: 'নিকটস্থ বাস স্ট্যান্ড থেকে ৫ মিনিটের হাঁটা পথ',
  contactPhone: '+880 1710000000',
  facebookLabel: 'fb.com/durgapujacommittee',
  contactEmail: 'info@pujacommittee.org'
};

const DEFAULT_GALLERY = [
  { caption: 'সন্ধ্যা আরতি', imageUrl: 'image/সন্ধ্যা আরতি.jpg', order: 1 },
  { caption: 'ধুনুচি নাচ', imageUrl: 'image/ধুনুচি নাচ.jpg', order: 2 },
  { caption: 'মণ্ডপ সজ্জা', imageUrl: 'image/মণ্ডপ সজ্জা.jpg', order: 3 },
  { caption: 'সাংস্কৃতিক সন্ধ্যা', imageUrl: 'image/সাংস্কৃতিক সন্ধ্যা.jpg', order: 4 },
  { caption: 'ভোগ বিতরণ', imageUrl: 'image/ভোগ বিতরণ.jpg', order: 5 },
  { caption: 'সিঁদুর খেলা', imageUrl: 'image/সিঁদুর খেলা.jpg', order: 6 },
  { caption: 'বিসর্জন শোভাযাত্রা', imageUrl: 'image/বিসর্জন শোভাযাত্রা.jpg', order: 7 }
];

let currentEdit = null; // { type, id } or null for "new"
let activeListType = 'notices';
let draggedGalleryId = null;

// ---------------- AUTH ----------------
auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById('loginWrap').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    document.getElementById('userEmail').textContent = user.email;
    Object.keys(SCHEMAS).forEach(attachListListener);
    seedDefaultTickers();
    seedDefaultSettings();
    seedDefaultGallery();
  } else {
    document.getElementById('loginWrap').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
  }
});

async function seedDefaultTickers() {
  try {
    const snap = await db.collection('ticker').limit(1).get();
    if (!snap.empty) return;

    await Promise.all(
      DEFAULT_TICKERS.map(item => db.collection('ticker').add(item))
    );
  } catch (err) {
    console.warn('Default ticker seed skipped:', err);
  }
}

async function seedDefaultSettings() {
  try {
    const snap = await db.collection('siteSettings').limit(1).get();
    if (!snap.empty) return;
    await db.collection('siteSettings').add(DEFAULT_SETTINGS);
  } catch (err) {
    console.warn('Default site settings seed skipped:', err);
  }
}

async function seedDefaultGallery() {
  try {
    await Promise.all(DEFAULT_GALLERY.map(async item => {
      const existing = await db.collection('gallery')
        .where('caption', '==', item.caption)
        .limit(1)
        .get();

      if (existing.empty) {
        await db.collection('gallery').add(item);
      }
    }));
  } catch (err) {
    console.warn('Default gallery seed skipped:', err);
  }
}

document.getElementById('loginForm').addEventListener('submit', event => {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPassword').value;
  const errBox = document.getElementById('loginError');

  errBox.style.display = 'none';

  auth.signInWithEmailAndPassword(email, pass)
    .then(() => {
    })
    .catch(err => {
      console.error("FIREBASE LOGIN ERROR:", err);

      errBox.textContent =
        'লগইন ব্যর্থ: ' + err.code + ' — ' + err.message;

      errBox.style.display = 'block';
    });
});
document.getElementById('logoutBtn').addEventListener('click', () => auth.signOut());

// ---------------- TABS ----------------
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    activeListType = btn.dataset.tab;
    document.getElementById('adminSearch').value = '';
    document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
  });
});

document.getElementById('adminSearch').addEventListener('input', event => {
  const query = event.target.value.trim().toLowerCase();
  const wrap = document.getElementById('list-' + activeListType);
  if (!wrap) return;
  wrap.querySelectorAll('.item-card').forEach(card => {
    card.hidden = query && !card.textContent.toLowerCase().includes(query);
  });
});

// ---------------- LIST (live) ----------------

// Some tabs (e.g. committee/advisors/generalMembers) share one Firestore
// collection ('members') but each only shows/edits docs matching a filter
// (e.g. group == 'committee'). This resolves the right collection ref.
function collRef(type) {
  const schema = SCHEMAS[type];
  return db.collection((schema && schema.collection) || type);
}

function attachListListener(type) {
  const schema = SCHEMAS[type];
  const wrap = document.getElementById('list-' + type);
  if (wrap) wrap.innerHTML = '<div class="loading-note">ডেটা লোড হচ্ছে...</div>';
  // NOTE: intentionally NOT using .orderBy('order') here.
  // Firestore's orderBy() silently EXCLUDES any document that is missing
  // the field being sorted on. If older/manually-added documents don't
  // have an 'order' field, they'd vanish from this list even though they
  // exist in the database. Instead we fetch everything and sort client-side.
  collRef(type).onSnapshot(snap => {
    let docs = snap.docs;
    if (schema.filter) {
      docs = docs.filter(d => d.data()[schema.filter.field] === schema.filter.value);
    }
    const sorted = docs.slice().sort((a, b) => {
      const oa = Number(a.data().order);
      const ob = Number(b.data().order);
      return (isNaN(oa) ? 0 : oa) - (isNaN(ob) ? 0 : ob);
    });
    renderList(type, sorted);
  }, err => {
    console.warn(type, 'listener error', err);
    showListError(type, err);
  });
}

function showListError(type, err) {
  const wrap = document.getElementById('list-' + type);
  if (!wrap) return;

  if (type === 'gallery') {
    renderList('gallery', []);
    return;
  }

  wrap.innerHTML = `
    <div class="empty-note" style="color:var(--danger);">
      ডেটা লোড করতে সমস্যা হয়েছে: ${escapeHtml(err.message || err.code || 'অজানা এরর')}
      <br><span style="font-size:12px;">Firestore Rules publish করা আছে কিনা, বা ইন্টারনেট কানেকশন চেক করুন।</span>
    </div>`;
}

function renderList(type, docs) {
  const schema = SCHEMAS[type];
  const wrap = document.getElementById('list-' + type);
  const usingLocalGallery = type === 'gallery' && docs.length === 0;

  if (usingLocalGallery) {
    docs = DEFAULT_GALLERY.map((data, index) => ({
      id: 'local-' + index,
      local: true,
      data: () => data
    }));
  }

  const query = activeListType === type
    ? document.getElementById('adminSearch').value.trim().toLowerCase()
    : '';
  const visibleDocs = docs.filter(doc => {
    if (!query) return true;
    const card = schema.card(doc.data());
    return `${card.title || ''} ${card.sub || ''}`.toLowerCase().includes(query);
  });
  wrap.innerHTML = '';

  if (visibleDocs.length === 0) {
    wrap.innerHTML = `<div class="empty-note">${query ? 'এই খোঁজে কিছু পাওয়া যায়নি।' : 'এখনও কিছু যোগ করা হয়নি — "+ নতুন" বাটনে ক্লিক করুন।'}</div>`;
    return;
  }

  visibleDocs.forEach(doc => {
    const data = doc.data();
    const c = schema.card(data);
    let thumbHtml;
    if (type === 'gallery') {
      const defaultImage = DEFAULT_GALLERY.find(item => item.caption === data.caption)?.imageUrl;
      const imageUrl = (c.thumb && typeof c.thumb === 'object' && c.thumb.img) || defaultImage;
      const fallback = defaultImage && imageUrl !== defaultImage
        ? ` onerror="this.onerror=null;this.src='${escapeAttr(defaultImage)}';"`
        : '';
      thumbHtml = imageUrl
        ? `<img src="${escapeAttr(imageUrl)}" alt="${escapeAttr(data.caption || '')}"${fallback}>`
        : '🖼️';
    } else {
      thumbHtml = (c.thumb && typeof c.thumb === 'object' && c.thumb.img)
        ? `<img src="${escapeAttr(c.thumb.img)}" alt="" onerror="this.style.opacity='.25';">`
        : (c.thumb || '📄');
    }

    const el = document.createElement('div');
    el.className = 'item-card';
    const actionsHtml = doc.local
      ? `<button class="btn btn-gold btn-sm" onclick="importDefaultGalleryItem(${DEFAULT_GALLERY.indexOf(data)})">Admin-এ যোগ করুন</button>`
      : `
        <button class="btn btn-outline btn-sm" onclick="openForm('${type}', '${doc.id}')">এডিট</button>
        <button class="btn btn-danger btn-sm" onclick="deleteItem('${type}', '${doc.id}')">মুছুন</button>
      `;
    if (type === 'gallery') {
      el.classList.add('sortable-item');
      el.draggable = true;
      el.dataset.docId = doc.id;
      el.addEventListener('dragstart', () => {
        draggedGalleryId = doc.id;
        el.classList.add('dragging');
      });
      el.addEventListener('dragend', () => {
        draggedGalleryId = null;
        el.classList.remove('dragging');
      });
      el.addEventListener('dragover', event => event.preventDefault());
      el.addEventListener('drop', async event => {
        event.preventDefault();
        if (!draggedGalleryId || draggedGalleryId === doc.id) return;

        const cards = [...wrap.querySelectorAll('.sortable-item')];
        const fromIndex = cards.findIndex(card => card.dataset.docId === draggedGalleryId);
        const toIndex = cards.findIndex(card => card.dataset.docId === doc.id);
        const reordered = cards.slice();
        const [moved] = reordered.splice(fromIndex, 1);
        reordered.splice(toIndex, 0, moved);

        try {
          await Promise.all(
            reordered.map((card, index) =>
              db.collection('gallery').doc(card.dataset.docId).update({ order: index + 1 })
            )
          );
          showToast('Gallery order আপডেট হয়েছে ✅');
        } catch (error) {
          showToast('Gallery order update ব্যর্থ');
        }
      });
    }
    el.innerHTML = `
      <div class="thumb">${thumbHtml}</div>
      <div class="info">
        <h4>${escapeHtml(c.title || '(নাম নেই)')}</h4>
        <p>${escapeHtml(c.sub || '')}</p>
      </div>
      <div class="actions">
        ${actionsHtml}
      </div>
    `;
    wrap.appendChild(el);
  });
}

async function importDefaultGalleryItem(index) {
  const item = DEFAULT_GALLERY[index];
  if (!item) return;

  try {
    await db.collection('gallery').add(item);
    showToast('Gallery ছবিটি Admin-এ যোগ হয়েছে ✅');
  } catch (error) {
    showToast('ছবি যোগ করা যায়নি');
  }
}

// ---------------- FORM ----------------
function openForm(type, id) {
  currentEdit = { type, id: id || null };
  const schema = SCHEMAS[type];
  document.getElementById('modalTitle').textContent =
    (id ? 'এডিট করুন — ' : 'নতুন যোগ করুন — ') + schema.label;
  document.getElementById('formError').style.display = 'none';

  const formEl = document.getElementById('itemForm');
  formEl.innerHTML = '';

  const buildFields = (data) => {
    schema.fields.forEach(f => {
      const fieldWrap = document.createElement('div');
      fieldWrap.className = 'field';

      const label = document.createElement('label');
      label.textContent = f.label + (f.required ? ' *' : '');
      fieldWrap.appendChild(label);

      let input;
      const existingVal = data ? data[f.key] : undefined;

      if (f.type === 'textarea') {
        input = document.createElement('textarea');
        input.placeholder = f.placeholder || '';
        if (f.isList && Array.isArray(existingVal)) {
          input.value = existingVal.join('\n');
        } else if (existingVal !== undefined) {
          input.value = existingVal;
        }
      } else if (f.type === 'select') {
        input = document.createElement('select');
        f.options.forEach(([val, lbl]) => {
          const opt = document.createElement('option');
          opt.value = val; opt.textContent = lbl;
          input.appendChild(opt);
        });
        input.value = existingVal !== undefined ? existingVal : (f.default || f.options[0][0]);
      } else {
        input = document.createElement('input');
        input.type = f.type;
        input.placeholder = f.placeholder || '';
        if (f.type !== 'file') {
          input.value = existingVal !== undefined ? existingVal
            : (f.default !== undefined ? f.default : '');
        }
        if (f.accept) input.accept = f.accept;
      }

      input.dataset.key = f.key;
      input.dataset.type = f.type;
      input.dataset.isList = f.isList ? '1' : '';
      if (f.required) input.required = true;

      fieldWrap.appendChild(input);
      formEl.appendChild(fieldWrap);
    });

    const actions = document.createElement('div');
    actions.className = 'form-actions';
    actions.innerHTML = `
      <button type="submit" class="btn btn-primary">সংরক্ষণ করুন</button>
      <button type="button" class="btn btn-outline" onclick="closeForm()">বাতিল</button>
    `;
    formEl.appendChild(actions);
  };

  if (type === 'settings' && !id) {
    collRef(type).limit(1).get().then(snapshot => {
      if (snapshot.empty) {
        buildFields(null);
        return;
      }

      const settingsDoc = snapshot.docs[0];
      currentEdit.id = settingsDoc.id;
      document.getElementById('modalTitle').textContent = 'এডিট করুন — ' + schema.label;
      buildFields(settingsDoc.data());
    }).catch(error => {
      const formError = document.getElementById('formError');
      formError.textContent = 'সাইট সেটিংস লোড করা যায়নি: ' + (error.message || 'অজানা এরর');
      formError.style.display = 'block';
    });
  } else if (id) {
    collRef(type).doc(id).get()
      .then(doc => buildFields(doc.data()))
      .catch(error => {
        const formError = document.getElementById('formError');
        formError.textContent = 'ডেটা লোড করা যায়নি: ' + (error.message || 'অজানা এরর');
        formError.style.display = 'block';
      });
  } else {
    buildFields(null);
  }

  document.getElementById('modalBg').classList.add('open');
}

function closeForm() {
  document.getElementById('modalBg').classList.remove('open');
  currentEdit = null;
}

document.getElementById('itemForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const { type, id } = currentEdit;
  const schema = SCHEMAS[type];
  const errBox = document.getElementById('formError');
  errBox.style.display = 'none';

  const payload = {};
  let uploadFile = null;
  const inputs = e.target.querySelectorAll('[data-key]');
  inputs.forEach(input => {
    const key = input.dataset.key;
    if (input.dataset.type === 'file') {
      uploadFile = input.files[0] || null;
      return;
    }
    let val = input.value;

    if (input.dataset.type === 'number') {
      val = Number(val) || 0;
    } else if (input.dataset.isList === '1') {
      val = val.split('\n').map(s => s.trim()).filter(Boolean);
    }
    payload[key] = val;
  });

  try {
    if (type === 'gallery' && uploadFile) {
      if (uploadFile.size > 5 * 1024 * 1024) {
        throw new Error('ছবির size 5MB-এর কম হতে হবে।');
      }
      const safeName = uploadFile.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const uploadRef = storage.ref().child(`gallery/${Date.now()}-${safeName}`);
      const snapshot = await uploadRef.put(uploadFile);
      payload.imageUrl = await snapshot.ref.getDownloadURL();
    }

    if (type === 'gallery' && !payload.imageUrl) {
      errBox.textContent = 'একটি ছবির URL অথবা upload করা ছবি দিন।';
      errBox.style.display = 'block';
      return;
    }

  // Tabs backed by a shared collection (e.g. committee/advisors/generalMembers
  // all live in 'members') carry a fixed field value that isn't shown as a
  // form input — set it here so saved docs land in the right group.
  if (schema.filter) {
    payload[schema.filter.field] = schema.filter.value;
  }

    if (id) {
      await collRef(type).doc(id).update(payload);
      showToast('আপডেট করা হয়েছে ✅');
    } else {
      await collRef(type).add(payload);
      showToast('যোগ করা হয়েছে ✅');
    }
    closeForm();
  } catch (err) {
    errBox.textContent = 'সংরক্ষণ ব্যর্থ: ' + err.message;
    errBox.style.display = 'block';
  }
});

// ---------------- DELETE ----------------
async function deleteItem(type, id) {
  if (!confirm('আপনি কি নিশ্চিত এটি মুছে ফেলতে চান?')) return;
  try {
    await collRef(type).doc(id).delete();
    showToast('মুছে ফেলা হয়েছে 🗑️');
  } catch (err) {
    alert('মুছতে ব্যর্থ: ' + err.message);
  }
}

// ---------------- HELPERS ----------------
function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str == null ? '' : str;
  return d.innerHTML;
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(() => { t.style.display = 'none'; }, 2200);
}