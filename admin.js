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
    singleton: true,
    fields: [
      { key: 'siteTitle', label: 'সাইটের টাইটেল (ব্রাউজার ট্যাবে দেখায়)', type: 'text', default: 'জননী সংসদ' },
      { key: 'metaDescription', label: 'সাইটের বিবরণ (SEO/শেয়ার করলে দেখাবে)', type: 'textarea',
        default: 'জননী সংসদ-এর পূজা, সময়সূচি, অনুষ্ঠান, নোটিশ ও যোগাযোগের তথ্য।' },
      { key: 'heroTitleMain', label: 'Hero প্রধান শিরোনাম', type: 'text', default: 'মা আসছেন' },
      { key: 'heroTitleSub', label: 'Hero দ্বিতীয় লাইন', type: 'text', default: 'ঘরে ঘরে' },
      { key: 'committeeName', label: 'কমিটির নাম', type: 'text', default: 'জননী সংসদ' },
      { key: 'foundingTagline', label: 'প্রতিষ্ঠার লেবেল (নেভিগেশনে ছোট করে দেখাবে)', type: 'text', default: 'প্রতিষ্ঠা ১৯৭৪' },
      { key: 'heroImageUrl', label: 'Hero image URL', type: 'text', default: 'image/maa-durga.png' },
      { key: 'pujaDate', label: 'পূজার তারিখ ও সময় (ISO format)', type: 'text', default: '2026-10-16T06:00:00+06:00' },
      { key: 'donationQrUrl', label: 'অনুদানের QR image URL', type: 'text', default: 'image/QR.jpg' },
      { key: 'bkashNagad', label: 'বিকাশ / নগদ নম্বর', type: 'text', default: '01710000000' },
      { key: 'bankName', label: 'ব্যাংক অ্যাকাউন্টের নাম', type: 'text', default: 'জননী সংসদ' },
      { key: 'bankAccount', label: 'ব্যাংক অ্যাকাউন্ট নম্বর', type: 'text', default: 'A/C: 0000-0000-0000' },
      { key: 'cashNote', label: 'নগদ অনুদানের বিবরণ', type: 'textarea', default: 'কমিটি অফিসে সরাসরি জমা দিতে পারেন' },
      { key: 'receiptUrl', label: 'রসিদ download URL (ঐচ্ছিক)', type: 'text' },
      { key: 'locationTitle', label: 'লোকেশন শিরোনাম', type: 'text', default: 'পূজা মণ্ডপের ঠিকানা' },
      { key: 'locationAddress', label: 'ঠিকানা', type: 'text', default: 'গঙ্গানগর, লস্করপুর, শায়েস্তাগঞ্জ, হবিগঞ্জ' },
      { key: 'locationHours', label: 'খোলার সময়', type: 'text', default: 'প্রতিদিন সকাল ৬টা থেকে রাত ১১টা পর্যন্ত খোলা' },
      { key: 'locationDirection', label: 'দিকনির্দেশের বিবরণ', type: 'text', default: 'নিকটস্থ বাস স্ট্যান্ড থেকে ৫ মিনিটের হাঁটা পথ' },
      { key: 'mapEmbedUrl', label: 'Google Map embed URL', type: 'text' },
      { key: 'mapLink', label: 'Google Map direction URL', type: 'text' },
      { key: 'contactPhone', label: 'ফোন নম্বর', type: 'text', default: '+880 1710000000' },
      { key: 'facebookUrl', label: 'Facebook URL (contact ও footer আইকন দুটোতেই ব্যবহার হবে)', type: 'text' },
      { key: 'facebookLabel', label: 'Facebook display text', type: 'text', default: 'fb.com/durgapujacommittee' },
      { key: 'instagramUrl', label: 'Instagram URL (footer আইকন)', type: 'text' },
      { key: 'youtubeUrl', label: 'YouTube URL (footer আইকন)', type: 'text' },
      { key: 'contactEmail', label: 'ইমেইল', type: 'text', default: 'info@pujacommittee.org' }
    ],
    card: s => ({ thumb: '⚙️', title: s.committeeName || 'সাইট সেটিংস', sub: 'Hero, donation, location ও contact' })
  },
  events: {
    label: 'অনুষ্ঠান',
    fields: [
      { key: 'icon',  label: 'আইকন (ইমোজি)', type: 'text', placeholder: '🎉' },
      { key: 'title', label: 'শিরোনাম', type: 'text', required: true },
      { key: 'desc',  label: 'বিবরণ', type: 'textarea' },
      { key: 'order', label: 'ক্রম (ছোট সংখ্যা আগে দেখাবে)', type: 'number', default: 0 }
    ],
    card: e => ({ thumb: e.icon || '🎉', title: e.title, sub: e.desc })
  },
  about: {
    label: 'আমাদের সম্পর্কে',
    collection: 'about',
    singleton: true,
    fields: [
      { key: 'heading', label: 'উপ-শিরোনাম', type: 'text', default: 'প্রতিষ্ঠা ১৯৭৪ সাল থেকে ভক্তি ও ঐক্যের প্রতীক' },
      { key: 'paragraphs', label: 'বিবরণ (প্রতি লাইনে একটি অনুচ্ছেদ)', type: 'textarea', isList: true,
        placeholder: '১৯৭৪ সালে কয়েকজনের উদ্যোগে পথচলা শুরু হয়...' },
      { key: 'stat1Num', label: 'পরিসংখ্যান ১ — সংখ্যা', type: 'text', default: '৫০+' },
      { key: 'stat1Label', label: 'পরিসংখ্যান ১ — লেবেল', type: 'text', default: 'বছরের ঐতিহ্য' },
      { key: 'stat2Num', label: 'পরিসংখ্যান ২ — সংখ্যা', type: 'text', default: '১৫০+' },
      { key: 'stat2Label', label: 'পরিসংখ্যান ২ — লেবেল', type: 'text', default: 'পরিবারের অংশগ্রহণ' },
      { key: 'stat3Num', label: 'পরিসংখ্যান ৩ — সংখ্যা', type: 'text', default: '৩৬+' },
      { key: 'stat3Label', label: 'পরিসংখ্যান ৩ — লেবেল', type: 'text', default: 'সক্রিয় সদস্য' }
    ],
    card: a => ({ thumb: '📖', title: a.heading || 'আমাদের সম্পর্কে', sub: 'গল্প ও পরিসংখ্যান' })
  },
  pageHeadings: {
    label: 'পেজের শিরোনাম',
    collection: 'pageHeadings',
    singleton: true,
    fields: [
      { key: 'eyebrow_about', label: 'আমাদের সম্পর্কে — উপরের ছোট লেবেল (eyebrow)', type: 'text' },
      { key: 'title_about', label: 'আমাদের সম্পর্কে — শিরোনাম', type: 'text' },
      { key: 'sub_about', label: 'আমাদের সম্পর্কে — সাবটাইটেল', type: 'textarea' },
      { key: 'eyebrow_schedule', label: 'সময়সূচি — উপরের ছোট লেবেল (eyebrow)', type: 'text' },
      { key: 'title_schedule', label: 'সময়সূচি — শিরোনাম', type: 'text' },
      { key: 'sub_schedule', label: 'সময়সূচি — সাবটাইটেল', type: 'textarea' },
      { key: 'eyebrow_events', label: 'অনুষ্ঠান — উপরের ছোট লেবেল (eyebrow)', type: 'text' },
      { key: 'title_events', label: 'অনুষ্ঠান — শিরোনাম', type: 'text' },
      { key: 'sub_events', label: 'অনুষ্ঠান — সাবটাইটেল', type: 'textarea' },
      { key: 'eyebrow_gallery', label: 'গ্যালারি — উপরের ছোট লেবেল (eyebrow)', type: 'text' },
      { key: 'title_gallery', label: 'গ্যালারি — শিরোনাম', type: 'text' },
      { key: 'sub_gallery', label: 'গ্যালারি — সাবটাইটেল', type: 'textarea' },
      { key: 'eyebrow_committee', label: 'কার্যকরী সদস্যবৃন্দ — উপরের ছোট লেবেল (eyebrow)', type: 'text' },
      { key: 'title_committee', label: 'কার্যকরী সদস্যবৃন্দ — শিরোনাম', type: 'text' },
      { key: 'sub_committee', label: 'কার্যকরী সদস্যবৃন্দ — সাবটাইটেল', type: 'textarea' },
      { key: 'eyebrow_advisors', label: 'উপদেষ্টা — উপরের ছোট লেবেল (eyebrow)', type: 'text' },
      { key: 'title_advisors', label: 'উপদেষ্টা — শিরোনাম', type: 'text' },
      { key: 'sub_advisors', label: 'উপদেষ্টা — সাবটাইটেল', type: 'textarea' },
      { key: 'eyebrow_generalMembers', label: 'সাধারণ সদস্যবৃন্দ — উপরের ছোট লেবেল (eyebrow)', type: 'text' },
      { key: 'title_generalMembers', label: 'সাধারণ সদস্যবৃন্দ — শিরোনাম', type: 'text' },
      { key: 'sub_generalMembers', label: 'সাধারণ সদস্যবৃন্দ — সাবটাইটেল', type: 'textarea' },
      { key: 'eyebrow_affiliates', label: 'অঙ্গসংগঠন — উপরের ছোট লেবেল (eyebrow)', type: 'text' },
      { key: 'title_affiliates', label: 'অঙ্গসংগঠন — শিরোনাম', type: 'text' },
      { key: 'sub_affiliates', label: 'অঙ্গসংগঠন — সাবটাইটেল', type: 'textarea' },
      { key: 'eyebrow_donation', label: 'অনুদান — উপরের ছোট লেবেল (eyebrow)', type: 'text' },
      { key: 'title_donation', label: 'অনুদান — শিরোনাম', type: 'text' },
      { key: 'sub_donation', label: 'অনুদান — সাবটাইটেল', type: 'textarea' },
      { key: 'eyebrow_notice', label: 'নোটিশ — উপরের ছোট লেবেল (eyebrow)', type: 'text' },
      { key: 'title_notice', label: 'নোটিশ — শিরোনাম', type: 'text' },
      { key: 'sub_notice', label: 'নোটিশ — সাবটাইটেল', type: 'textarea' },
      { key: 'eyebrow_location', label: 'লোকেশন — উপরের ছোট লেবেল (eyebrow)', type: 'text' },
      { key: 'title_location', label: 'লোকেশন — শিরোনাম', type: 'text' },
      { key: 'sub_location', label: 'লোকেশন — সাবটাইটেল', type: 'textarea' },
      { key: 'eyebrow_contact', label: 'যোগাযোগ — উপরের ছোট লেবেল (eyebrow)', type: 'text' },
      { key: 'title_contact', label: 'যোগাযোগ — শিরোনাম', type: 'text' },
      { key: 'sub_contact', label: 'যোগাযোগ — সাবটাইটেল', type: 'textarea' },
    ],
    card: () => ({ thumb: '🏷️', title: 'পেজের সব শিরোনাম/সাবটাইটেল', sub: 'প্রতিটি সেকশনের eyebrow, title, subtitle' })
  }
};

const DEFAULT_SETTINGS = {
  siteTitle: 'জননী সংসদ',
  metaDescription: 'জননী সংসদ-এর পূজা, সময়সূচি, অনুষ্ঠান, নোটিশ ও যোগাযোগের তথ্য।',
  heroTitleMain: 'মা আসছেন',
  heroTitleSub: 'ঘরে ঘরে',
  committeeName: 'জননী সংসদ',
  foundingTagline: 'প্রতিষ্ঠা ১৯৭৪',
  heroImageUrl: 'image/maa-durga.png',
  pujaDate: '2026-10-16T06:00:00+06:00',
  donationQrUrl: 'image/QR.jpg',
  bkashNagad: '01710000000',
  bankName: 'জননী সংসদ',
  bankAccount: 'A/C: 0000-0000-0000',
  cashNote: 'কমিটি অফিসে সরাসরি জমা দিতে পারেন',
  locationTitle: 'পূজা মণ্ডপের ঠিকানা',
  locationAddress: 'গঙ্গানগর, লস্করপুর, শায়েস্তাগঞ্জ, হবিগঞ্জ',
  locationHours: 'প্রতিদিন সকাল ৬টা থেকে রাত ১১টা পর্যন্ত খোলা',
  locationDirection: 'নিকটস্থ বাস স্ট্যান্ড থেকে ৫ মিনিটের হাঁটা পথ',
  contactPhone: '+880 1710000000',
  facebookLabel: 'fb.com/durgapujacommittee',
  contactEmail: 'info@pujacommittee.org'
};

const DEFAULT_ABOUT = {
  heading: 'প্রতিষ্ঠা ১৯৭৪ সাল থেকে ভক্তি ও ঐক্যের প্রতীক',
  paragraphs: [
    '১৯৭৪ সালে কয়েকজনের উদ্যোগে সমাজ কল্যাণ যুব সংঘ-এর পথচলা শুরু হয়। উদ্দেশ্য ছিল একটাই—এলাকার সবাইকে সঙ্গে নিয়ে ধর্মীয় ও সাংস্কৃতিক চেতনায় উৎসব উদযাপন করা।',
    'সেই ভাবনা থেকেই ১৯৭৪ সাল থেকে আজ পর্যন্ত নিয়মিতভাবে সরস্বতী পূজার আয়োজন হয়ে আসছে।',
    'দীর্ঘ পাঁচ দশকের এই পথচলায় পূজা আজ শুধু একটি ধর্মীয় আয়োজন নয়, এটি আমাদের ঐতিহ্য, সংস্কৃতি, সম্প্রীতি ও মিলনের প্রতীক।',
    'প্রজন্মের পর প্রজন্ম ধরে সকলের অংশগ্রহণে এই আয়োজন আমাদের শিকড়ের সঙ্গে সম্পর্ক আরও গভীর করে চলেছে।'
  ],
  stat1Num: '৫০+', stat1Label: 'বছরের ঐতিহ্য',
  stat2Num: '১৫০+', stat2Label: 'পরিবারের অংশগ্রহণ',
  stat3Num: '৩৬+', stat3Label: 'সক্রিয় সদস্য'
};

const DEFAULT_PAGE_HEADINGS = {
  eyebrow_about: 'আমাদের কথা', title_about: 'আমাদের জননী সংসদ',
  sub_about: 'পাঁচ দশক ধরে ভক্তি, ঐতিহ্য আর প্রতিবেশীর সম্মিলনের এক উৎসব-যাত্রা।',
  eyebrow_schedule: 'পঞ্জিকা অনুযায়ী', title_schedule: 'পূজার সময়সূচি',
  sub_schedule: 'ষষ্ঠী থেকে দশমী — প্রতিদিনের পূজা, আরতি ও অনুষ্ঠানের বিস্তারিত সময়সূচি।',
  eyebrow_events: 'উৎসবের আয়োজন', title_events: 'অনুষ্ঠান',
  sub_events: 'পূজার পাঁচ দিনে যা যা থাকছে আপনার জন্য।',
  eyebrow_gallery: 'স্মৃতির পাতা', title_gallery: 'গ্যালারি',
  sub_gallery: 'গত বছরগুলোর পূজার কিছু বিশেষ মুহূর্ত।',
  eyebrow_committee: 'যাঁরা এই পূজার পেছনে', title_committee: 'কার্যকরী সদস্যবৃন্দ',
  sub_committee: 'যাঁদের নিরলস পরিশ্রমে প্রতি বছর এই উৎসব সার্থক হয়ে ওঠে।',
  eyebrow_advisors: 'অভিজ্ঞদের পরামর্শ ও দিকনির্দেশনা', title_advisors: 'উপদেষ্টা',
  sub_advisors: 'যাঁদের অভিজ্ঞতা, পরামর্শ ও দিকনির্দেশনায় জননী সংসদ দুর্গোৎসবের সকল কার্যক্রম আরও সুন্দরভাবে পরিচালিত হয়।',
  eyebrow_generalMembers: 'আমাদের পরিবারের সদস্য', title_generalMembers: 'সাধারণ সদস্যবৃন্দ',
  sub_generalMembers: 'জননী সংসদের সকল সাধারণ সদস্য, যাঁদের অংশগ্রহণে আমাদের এই আয়োজন আরও সুন্দর ও প্রাণবন্ত হয়ে ওঠে।',
  eyebrow_affiliates: 'আমাদের সহযোগী সংগঠন', title_affiliates: 'অঙ্গসংগঠন',
  sub_affiliates: 'জননী সংসদের সাথে যুক্ত ও সহযোগী বিভিন্ন সংগঠন।',
  eyebrow_donation: 'সহযোগিতার আহ্বান', title_donation: 'পূজার কাজে সহযোগিতা করুন',
  sub_donation: 'আপনার সামান্য অনুদানই এই উৎসবকে করে তোলে আরও প্রাণবন্ত ও সুন্দর।',
  eyebrow_notice: 'গুরুত্বপূর্ণ তথ্য', title_notice: 'নোটিশ',
  sub_notice: 'সর্বশেষ ঘোষণা ও আপডেট।',
  eyebrow_location: 'আমাদের খুঁজে নিন', title_location: 'লোকেশন',
  sub_location: 'মণ্ডপের ঠিকানা ও দিকনির্দেশ।',
  eyebrow_contact: 'যোগাযোগ করুন', title_contact: 'যোগাযোগ',
  sub_contact: 'যেকোনো প্রশ্ন বা সহযোগিতার জন্য আমাদের সাথে যোগাযোগ করুন।',
};

let currentEdit = null; // { type, id } or null for "new"
let draggedGalleryId = null;
const dashboardCounts = {};

// ---------------- AUTH ----------------
auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById('loginWrap').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    document.getElementById('userEmail').textContent = user.email;
    Object.keys(SCHEMAS).forEach(attachListListener);
    seedDefaultSettings();
    seedDefaultAbout();
    seedDefaultPageHeadings();
  } else {
    document.getElementById('loginWrap').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
  }
});

// NOTE: ticker and gallery used to auto-reseed their sample content
// whenever the collection was empty. That meant deleting everything
// from the admin panel didn't actually stay deleted — the defaults
// would silently reappear on the next login. Both single-document
// collections below (settings/about) are config, not a list the
// admin deletes items from, so seeding them once is safe.

async function seedDefaultSettings() {
  try {
    const snap = await db.collection('siteSettings').limit(1).get();
    if (!snap.empty) return;
    await db.collection('siteSettings').add(DEFAULT_SETTINGS);
  } catch (err) {
    console.warn('Default site settings seed skipped:', err);
  }
}

async function seedDefaultAbout() {
  try {
    const snap = await db.collection('about').limit(1).get();
    if (!snap.empty) return;
    await db.collection('about').add(DEFAULT_ABOUT);
  } catch (err) {
    console.warn('Default about seed skipped:', err);
  }
}

async function seedDefaultPageHeadings() {
  try {
    const snap = await db.collection('pageHeadings').limit(1).get();
    if (!snap.empty) return;
    await db.collection('pageHeadings').add(DEFAULT_PAGE_HEADINGS);
  } catch (err) {
    console.warn('Default page headings seed skipped:', err);
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
    document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
  });
});

document.querySelectorAll('[data-stat-tab]').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelector(`.tab-btn[data-tab="${card.dataset.statTab}"]`)?.click();
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

  updateDashboardCount(type, docs.length);

  const visibleDocs = docs;
  wrap.innerHTML = '';

  if (visibleDocs.length === 0) {
    wrap.innerHTML = '<div class="empty-note">এখনও কিছু যোগ করা হয়নি — "+ নতুন" বাটনে ক্লিক করুন।</div>';
    return;
  }

  visibleDocs.forEach((doc, index) => {
    const data = doc.data();
    const c = schema.card(data);
    let thumbHtml;
    if (type === 'gallery') {
      const storedImage = c.thumb && typeof c.thumb === 'object' ? c.thumb.img : '';
      const imageUrl = storedImage ? new URL(storedImage, document.baseURI).href : '';
      thumbHtml = imageUrl
        ? `<img src="${escapeAttr(imageUrl)}" alt="${escapeAttr(data.caption || '')}" loading="eager" style="display:block;width:100%;height:100%;object-fit:cover;" onerror="this.style.opacity='.25';">`
        : '🖼️';
    } else {
      thumbHtml = (c.thumb && typeof c.thumb === 'object' && c.thumb.img)
        ? `<img src="${escapeAttr(c.thumb.img)}" alt="" onerror="this.style.opacity='.25';">`
        : (c.thumb || '📄');
    }

    const el = document.createElement('div');
    el.className = 'item-card';
    if (type === 'gallery') el.classList.add('gallery-item');
    const actionsHtml = `
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

  if (schema.singleton && !id) {
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

function escapeAttr(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(() => { t.style.display = 'none'; }, 2200);
}

function updateDashboardCount(type, count) {
  dashboardCounts[type] = count;

  const memberCount = ['committee', 'advisors', 'generalMembers']
    .reduce((total, memberType) => total + (dashboardCounts[memberType] || 0), 0);

  const countMap = {
    notices: dashboardCounts.notices,
    schedule: dashboardCounts.schedule,
    members: memberCount,
    gallery: dashboardCounts.gallery,
    events: dashboardCounts.events
  };

  Object.entries(countMap).forEach(([key, value]) => {
    const element = document.getElementById('stat-' + key);
    if (element) element.textContent = value ?? 0;
  });
}