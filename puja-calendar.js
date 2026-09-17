/* =========================================================
   পূজা পঞ্জিকা — রিয়েল-টাইম পূজা স্ট্যাটাস (হিরো সেকশন)
   =========================================================
   এখানে দেওয়া তারিখগুলো বাংলা পঞ্জিকা (Drik Panchang) ও
   প্রচলিত হিন্দু ক্যালেন্ডার অনুযায়ী যাচাই করা বাস্তব তারিখ
   (এশিয়া/ঢাকা সময় ধরে) — ডামি/প্লেসহোল্ডার ডেটা নয়। এটাই
   হোমপেজের "মা আসছেন ঘরে ঘরে" অংশের countdown এবং উপরের
   ছোট পিল দুটোকেই চালায়।

   ⚠️ কেন bengalicalendar.com থেকে লাইভ ফেচ (fetch) করা হয়নি:
   bengalicalendar.com একটা সাধারণ HTML ওয়েবসাইট — ব্রাউজার
   থেকে সরাসরি fetch() করার মতো JSON/API বা CORS হেডার তারা
   দেয় না, তাই client-side JS দিয়ে ওদের ডেটা টেনে আনা টেকনিক্যালি
   সম্ভব না (ব্যাকএন্ড প্রক্সি ছাড়া)। তবে তারা একটা অফিসিয়াল
   embeddable iframe উইজেট দেয় ("আজকের বাংলা তারিখ" দেখানোর
   জন্য), যেটা সরাসরি তাদের সার্ভার থেকে লাইভ লোড হয় — সেটা
   নিচে হিরো সেকশনে (index.html-এ) বসানো হয়েছে।
   পূজার প্রকৃত তারিখ/countdown-এর জন্য আমরা Drik Panchang ও
   Wikipedia থেকে যাচাই করা এই নিচের তালিকাটা ব্যবহার করছি।

   ⚠️ রক্ষণাবেক্ষণ নোট: এই তালিকা মহালয়া ২০২৬ থেকে সরস্বতী
   পূজা ২০২৭ পর্যন্ত একটি পূজা-চক্র পর্যন্ত দেওয়া আছে। পরের
   বছরের তারিখ প্রকাশিত হলে নিচের অ্যারেতে নতুন এন্ট্রি যোগ
   করে দিতে হবে (drikpanchang.com/bengali থেকে যাচাই করে)।
========================================================= */

(function () {

  var TZ = 'Asia/Dhaka';

  var PUJA_CALENDAR = [
    { id: 'mahalaya',    name: 'মহালয়া',        emoji: '🪔', date: '2026-10-10T00:00:00+06:00' },
    { id: 'panchami',    name: 'মহাপঞ্চমী',      emoji: '🌸', date: '2026-10-16T00:00:00+06:00' },
    { id: 'shashthi',    name: 'মহাষষ্ঠী',       emoji: '🛕', date: '2026-10-17T00:00:00+06:00' },
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
    return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(now);
  }

  function formatBnDate(isoDate) {
    var parts = new Intl.DateTimeFormat('en-US', {
      timeZone: TZ, day: 'numeric', month: 'numeric', year: 'numeric'
    }).formatToParts(new Date(isoDate)).reduce(function (acc, p) { acc[p.type] = p.value; return acc; }, {});
    return toBn(parts.day) + ' ' + BN_MONTH[parseInt(parts.month, 10) - 1] + ' ' + toBn(parts.year);
  }

  var currentTargetTime = null;

  function render() {
    var liveTextEl = document.getElementById('livePujaText');
    var liveStatusEl = document.getElementById('livePujaStatus');
    var pillDaysEl = document.getElementById('heroDaysLeft');
    var pillLabelEl = document.getElementById('heroDaysLabel');
    var countdownEl = document.getElementById('countdown');

    var now = new Date();
    var todayKey = todayKeyDhaka(now);

    var todayEvent = PUJA_CALENDAR.find(function (e) { return e.date.slice(0, 10) === todayKey; });
    var nextEvent = PUJA_CALENDAR.find(function (e) { return new Date(e.date).getTime() > now.getTime(); });

    // ---- হিরো সেকশনের বড় লাইভ স্ট্যাটাস লাইন ----
    if (liveTextEl) {
      if (todayEvent) {
        liveTextEl.textContent = 'আজ: ' + todayEvent.name + ' ' + todayEvent.emoji;
      } else if (nextEvent) {
        liveTextEl.textContent = 'পরবর্তী পূজা: ' + nextEvent.name + ' ' + nextEvent.emoji + ' · ' + formatBnDate(nextEvent.date);
      } else {
        liveTextEl.textContent = 'পূজা পঞ্জিকা শীঘ্রই আপডেট হবে';
      }
    }
    if (liveStatusEl) {
      liveStatusEl.classList.toggle('is-today', !!todayEvent);
    }

    // ---- উপরের ছোট পিল (হিরো-টপবার) ----
    if (pillDaysEl && pillLabelEl) {
      if (todayEvent) {
        pillDaysEl.textContent = todayEvent.emoji;
        pillLabelEl.textContent = 'আজ ' + todayEvent.name;
      } else if (nextEvent) {
        var daysLeft = Math.ceil((new Date(nextEvent.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        pillDaysEl.textContent = toBn(pad2(Math.max(daysLeft, 0)));
        pillLabelEl.textContent = 'দিন বাকি ' + nextEvent.name + '-এর';
      } else {
        pillDaysEl.textContent = '—';
        pillLabelEl.textContent = 'পঞ্জিকা শীঘ্রই আপডেট হবে';
      }
    }

    // ---- মূল countdown (cd-days/cd-hours/cd-mins/cd-secs) ----
    if (nextEvent) {
      currentTargetTime = new Date(nextEvent.date).getTime();
      if (countdownEl) countdownEl.style.display = '';
      tickCountdown();
    } else {
      currentTargetTime = null;
      if (countdownEl) countdownEl.style.display = 'none';
    }
  }

  function tickCountdown() {
    if (currentTargetTime === null) return;

    var diff = currentTargetTime - Date.now();
    if (diff < 0) {
      render();
      return;
    }

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    var mins = Math.floor((diff / (1000 * 60)) % 60);
    var secs = Math.floor((diff / 1000) % 60);

    var daysEl = document.getElementById('cd-days');
    var hoursEl = document.getElementById('cd-hours');
    var minsEl = document.getElementById('cd-mins');
    var secsEl = document.getElementById('cd-secs');

    if (daysEl) daysEl.textContent = toBn(pad2(days));
    if (hoursEl) hoursEl.textContent = toBn(pad2(hours));
    if (minsEl) minsEl.textContent = toBn(pad2(mins));
    if (secsEl) secsEl.textContent = toBn(pad2(secs));
  }

  document.addEventListener('DOMContentLoaded', function () {
    render();
    setInterval(tickCountdown, 1000);
    // মধ্যরাত পেরিয়ে দিন পাল্টালে "আজকের পূজা" ঠিকভাবে ধরার জন্য প্রতি মিনিটে পুনরায় হিসাব
    setInterval(render, 60 * 1000);
  });

})();
