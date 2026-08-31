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
  members: {
    label: 'সদস্য',
    fields: [
      { key: 'name', label: 'নাম', type: 'text', required: true },
      { key: 'role', label: 'পদবি', type: 'text' },
      { key: 'group', label: 'গ্রুপ', type: 'select', default: 'committee', options: [
        ['committee', 'কার্যকরী সদস্যবৃন্দ'],
        ['advisor', 'উপদেষ্টা'],
        ['general', 'সাধারণ সদস্যবৃন্দ']
      ]},
      { key: 'photoUrl', label: 'ছবির URL (ঐচ্ছিক, না দিলে 👤 দেখাবে)', type: 'text' },
      { key: 'order', label: 'ক্রম', type: 'number', default: 0 }
    ],
    card: m => ({ thumb: m.photoUrl ? { img: m.photoUrl } : '👤', title: m.name, sub: m.role })
  },
  gallery: {
    label: 'গ্যালারি',
    fields: [
      { key: 'caption', label: 'ক্যাপশন', type: 'text' },
      { key: 'imageUrl', label: 'ছবির URL', type: 'text', required: true },
      { key: 'order', label: 'ক্রম', type: 'number', default: 0 }
    ],
    card: g => ({ thumb: g.imageUrl ? { img: g.imageUrl } : '🖼️', title: g.caption, sub: g.imageUrl })
  }
};

let currentEdit = null; // { type, id } or null for "new"

// ---------------- AUTH ----------------
auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById('loginWrap').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    document.getElementById('userEmail').textContent = user.email;
    Object.keys(SCHEMAS).forEach(attachListListener);
  } else {
    document.getElementById('loginWrap').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
  }
});

document.getElementById('loginBtn').addEventListener('click', () => {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPassword').value;
  const errBox = document.getElementById('loginError');

  errBox.style.display = 'none';

  auth.signInWithEmailAndPassword(email, pass)
    .then(() => {
      console.log("LOGIN SUCCESS");
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
    document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
  });
});

// ---------------- LIST (live) ----------------
function attachListListener(type) {
  db.collection(type).orderBy('order').onSnapshot(snap => {
    renderList(type, snap.docs);
  }, err => {
    console.warn(type, 'listener error', err);
  });
}

function renderList(type, docs) {
  const schema = SCHEMAS[type];
  const wrap = document.getElementById('list-' + type);
  wrap.innerHTML = '';

  if (docs.length === 0) {
    wrap.innerHTML = `<div class="empty-note">এখনও কিছু যোগ করা হয়নি — "+ নতুন" বাটনে ক্লিক করুন।</div>`;
    return;
  }

  docs.forEach(doc => {
    const data = doc.data();
    const c = schema.card(data);
    const thumbHtml = (c.thumb && typeof c.thumb === 'object' && c.thumb.img)
      ? `<img src="${c.thumb.img}" alt="">`
      : (c.thumb || '📄');

    const el = document.createElement('div');
    el.className = 'item-card';
    el.innerHTML = `
      <div class="thumb">${thumbHtml}</div>
      <div class="info">
        <h4>${escapeHtml(c.title || '(নাম নেই)')}</h4>
        <p>${escapeHtml(c.sub || '')}</p>
      </div>
      <div class="actions">
        <button class="btn btn-outline btn-sm" onclick="openForm('${type}', '${doc.id}')">এডিট</button>
        <button class="btn btn-danger btn-sm" onclick="deleteItem('${type}', '${doc.id}')">মুছুন</button>
      </div>
    `;
    wrap.appendChild(el);
  });
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
        input.value = existingVal !== undefined ? existingVal
          : (f.default !== undefined ? f.default : '');
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

  if (id) {
    db.collection(type).doc(id).get().then(doc => buildFields(doc.data()));
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
  const inputs = e.target.querySelectorAll('[data-key]');
  inputs.forEach(input => {
    const key = input.dataset.key;
    let val = input.value;

    if (input.dataset.type === 'number') {
      val = Number(val) || 0;
    } else if (input.dataset.isList === '1') {
      val = val.split('\n').map(s => s.trim()).filter(Boolean);
    }
    payload[key] = val;
  });

  try {
    if (id) {
      await db.collection(type).doc(id).update(payload);
      showToast('আপডেট করা হয়েছে ✅');
    } else {
      await db.collection(type).add(payload);
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
    await db.collection(type).doc(id).delete();
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
