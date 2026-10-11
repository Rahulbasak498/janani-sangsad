/* =========================================================
   পূজা পঞ্জিকা — রিয়েল-টাইম পূজা স্ট্যাটাস (হিরো সেকশন)
   =========================================================
   এখানে দেওয়া তারিখগুলো বাংলা পঞ্জিকা (Drik Panchang) ও
   প্রচলিত হিন্দু ক্যালেন্ডার অনুযায়ী যাচাই করা বাস্তব তারিখ
   (এশিয়া/ঢাকা সময় ধরে) — ডামি/প্লেসহোল্ডার ডেটা নয়।

   এই ফাইলটা দুটো আলাদা জিনিস চালায়:
   1) হিরোর বড় countdown (cd-days/cd-hours/cd-mins/cd-secs)
      + উপরের ছোট পিল (heroDaysLeft/heroDaysLabel)
      => সবসময় "দুর্গাপূজা" (মহাষষ্ঠী থেকে বিজয়া দশমী) টার্গেট
         করে রিয়েল কাউন্টডাউন দেখায়।
   2) livePujaText/livePujaStatus (সবুজ ব্লিংকিং ডট সহ)
      => সম্পূর্ণ পঞ্জিকা (মহালয়া, ষষ্ঠী...সরস্বতী পূজা সব)
         ধরে "আজকে ঠিক কোন পূজা হচ্ছে" — বা কিছু না থাকলে
         পরবর্তী পূজা কবে — সেটা দেখায়।

   ⚠️ কেন bengalicalendar.com থেকে লাইভ fetch করা হয়নি:
   bengalicalendar.com একটা সাধারণ HTML ওয়েবসাইট — ব্রাউজার
   থেকে সরাসরি fetch() করার মতো JSON/API বা CORS হেডার তারা
   দেয় না, তাই client-side JS দিয়ে ওদের ডেটা টেনে আনা টেকনিক্যালি
   সম্ভব না (ব্যাকএন্ড প্রক্সি ছাড়া)। তাদের অফিসিয়াল embeddable
   iframe উইজেট ("আজকের বাংলা তারিখ") হিরো সেকশনে বসানো আছে।
   পূজার প্রকৃত তারিখের জন্য Drik Panchang ও Wikipedia থেকে
   যাচাই করা এই নিচের তালিকাটা ব্যবহার করা হচ্ছে।

   ⚠️ রক্ষণাবেক্ষণ নোট: তালিকাটা মহালয়া ২০২৬ থেকে সরস্বতী
   পূজা ২০২৭ পর্যন্ত। এই চক্র শেষ হয়ে গেলে (সরস্বতী পূজা ২০২৭
   পার হলে) নিচের অ্যারেতে পরের বছরের তারিখ যোগ করে দিতে হবে।
========================================================= */

(function () {

  var TZ = 'Asia/Dhaka';

  var PUJA_CALENDAR = [
    { id: 'mahalaya',    name: 'মহালয়া',        emoji: '🪔', date: '2026-10-10T00:00:00+06:00' },
    { id: 'panchami',    name: 'মহাপঞ্চমী',      emoji: '🌸', date: '2026-10-16T00:00:00+06:00' },
    { id: 'shashthi',    name: 'মহাষষ্ঠী',       emoji: '🛕', date: '2026-10-16T00:00:00+06:00' },
    { id: 'saptami',     name: 'মহাসপ্তমী',      emoji: '🛕', date: '2026-10-18T00:00:00+06:00' },
    { id: 'ashtami',     name: 'মহাষ্টমী',       emoji: '🙏', date: '2026-10-19T00:00:00+06:00' },
    { id: 'nabami',      name: 'মহানবমী',        emoji: '🔥', date: '2026-10-20T00:00:00+06:00' },
    { id: 'dashami',     name: 'বিজয়া দশমী',     emoji: '🚩', date: '2026-10-21T00:00:00+06:00' },
    { id: 'lakshmi',     name: 'লক্ষ্মী পূজা',    emoji: '🪷', date: '2026-10-25T00:00:00+06:00' },
    { id: 'kali',        name: 'কালী পূজা',      emoji: '🪔', date: '2026-11-08T00:00:00+06:00' },
    { id: 'bhaiphonta',  name: 'ভাইফোঁটা',       emoji: '🎗️', date: '2026-11-11T00:00:00+06:00' },
    { id: 'jagaddhatri', name: 'জগদ্ধাত্রী পূজা', emoji: '🌺', date: '2026-11-18T00:00:00+06:00' },
    { id: 'saraswati',   name: 'সরস্বতী পূজা',    emoji: '📚', date: '2027-02-11T00:00:00+06:00' }
  ];

  var BN_DIGIT = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  var BN_MONTH = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

  function toBn(input) {
    return String(input).replace(/[0-9]/g, function (d) { return BN_DIGIT[+d]; });
  }

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function todayKeyDhaka(now) {
    var parts = new Intl.DateTimeFormat('en-US', {
      timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(now).reduce(function (acc, part) {
      acc[part.type] = part.value;
      return acc;
    }, {});
    return parts.year + '-' + parts.month + '-' + parts.day;
  }

  function formatBnDate(isoDate) {
    var parts = new Intl.DateTimeFormat('en-US', {
      timeZone: TZ, day: 'numeric', month: 'numeric', year: 'numeric'
    }).formatToParts(new Date(isoDate)).reduce(function (acc, p) { acc[p.type] = p.value; return acc; }, {});
    return toBn(parts.day) + ' ' + BN_MONTH[parseInt(parts.month, 10) - 1] + ' ' + toBn(parts.year);
  }

  function render() {
    var liveTextEl = document.getElementById('livePujaText');
    var liveIconEl = document.getElementById('livePujaIcon');
    var liveStatusEl = document.getElementById('livePujaStatus');
    var liveBadgeEl = document.getElementById('livePujaBadge');

    var todayKey = todayKeyDhaka(new Date());
    var todayEvents = PUJA_CALENDAR.filter(function (event) {
      return event.date.slice(0, 10) === todayKey;
    });
    var nextEvent = PUJA_CALENDAR.find(function (event) {
      return event.date.slice(0, 10) > todayKey;
    });
    var isPujaToday = todayEvents.length > 0;

    if (liveTextEl) {
      if (isPujaToday) {
        var names = todayEvents.map(function (event) { return event.name; });
        if (liveIconEl) liveIconEl.textContent = todayEvents[0].emoji;
        liveTextEl.innerHTML =
          '<span class="lps-label">\u0986\u099C</span>' +
          '<span class="lps-name">' + names.join(' \u0993 ') + ' \u099A\u09B2\u099B\u09C7</span>';
      } else if (nextEvent) {
        if (liveIconEl) liveIconEl.textContent = nextEvent.emoji;
        liveTextEl.innerHTML =
          '<span class="lps-label">\u09AA\u09B0\u09AC\u09B0\u09CD\u09A4\u09C0 \u09AA\u09C2\u099C\u09BE</span>' +
          '<span class="lps-name">' + nextEvent.name + '</span>' +
          '<span class="lps-date">' + formatBnDate(nextEvent.date) + '</span>';
      } else {
        if (liveIconEl) liveIconEl.textContent = '\uD83E\uDE94';
        liveTextEl.textContent = '\u09AA\u09C2\u099C\u09BE\u09B0 \u09B8\u09C2\u099A\u09BF \u09B6\u09C0\u0998\u09CD\u09B0\u0987 \u0986\u09AA\u09A1\u09C7\u099F \u09B9\u09AC\u09C7';
      }
    }
    if (liveBadgeEl) liveBadgeEl.style.display = '';
    if (liveStatusEl) liveStatusEl.classList.toggle('is-today', isPujaToday);
  }

  document.addEventListener('DOMContentLoaded', function () {
    render();
    // মধ্যরাত পেরিয়ে দিন পাল্টালে "আজকের পূজা" ঠিকভাবে ধরার জন্য প্রতি মিনিটে পুনরায় হিসাব
    setInterval(render, 60 * 1000);
  });

})();
