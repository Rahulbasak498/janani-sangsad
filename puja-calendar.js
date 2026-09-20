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

  function findEvent(id) {
    return PUJA_CALENDAR.find(function (e) { return e.id === id; });
  }

  // মহাষষ্ঠী থেকে বিজয়া দশমীর দিন শেষ পর্যন্ত — এটাই "দুর্গাপূজা"-র আসল সময়সীমা
  function durgaPujaWindow() {
    var shashthi = findEvent('shashthi');
    var dashami = findEvent('dashami');
    var start = new Date(shashthi.date).getTime();
    var end = new Date(dashami.date).getTime() + (24 * 60 * 60 * 1000) - 1000; // দশমীর দিনের একদম শেষ মুহূর্ত পর্যন্ত
    return { start: start, end: end };
  }

  var currentTargetTime = null;

  function render() {
    var liveTextEl = document.getElementById('livePujaText');
    var liveIconEl = document.getElementById('livePujaIcon');
    var liveStatusEl = document.getElementById('livePujaStatus');
    var pillDaysEl = document.getElementById('heroDaysLeft');
    var pillLabelEl = document.getElementById('heroDaysLabel');
    var countdownEl = document.getElementById('countdown');

    var now = new Date();
    var nowMs = now.getTime();
    var todayKey = todayKeyDhaka(now);

    var todayEvent = PUJA_CALENDAR.find(function (e) { return e.date.slice(0, 10) === todayKey; });
    var nextEvent = PUJA_CALENDAR.find(function (e) { return new Date(e.date).getTime() > nowMs; });

    // ---- হিরো সেকশনের বড় লাইভ স্ট্যাটাস লাইন (আজকে ঠিক কোন পূজা — পুরো পঞ্জিকা ধরে) ----
    if (liveTextEl) {
      if (todayEvent) {
        if (liveIconEl) liveIconEl.textContent = todayEvent.emoji;
        liveTextEl.innerHTML =
          '<span class="lps-label">আজ</span>' +
          '<span class="lps-name">' + todayEvent.name + '</span>';
      } else if (nextEvent) {
        if (liveIconEl) liveIconEl.textContent = nextEvent.emoji;
        liveTextEl.innerHTML =
          '<span class="lps-label">পরবর্তী পূজা</span>' +
          '<span class="lps-name">' + nextEvent.name + '</span>' +
          '<span class="lps-date">' + formatBnDate(nextEvent.date) + '</span>';
      } else {
        if (liveIconEl) liveIconEl.textContent = '🕉️';
        liveTextEl.innerHTML = '<span class="lps-name">পূজা পঞ্জিকা শীঘ্রই আপডেট হবে</span>';
      }
    }
    if (liveStatusEl) {
      liveStatusEl.classList.toggle('is-today', !!todayEvent);
    }

    // ---- দুর্গাপূজা-নির্দিষ্ট রিয়েল কাউন্টডাউন (উপরের পিল + হিরোর বড় countdown) ----
    var win = durgaPujaWindow();
    var durgaOngoing = (nowMs >= win.start && nowMs <= win.end);
    var durgaTarget = null;

    if (durgaOngoing) {
      durgaTarget = win.end; // উৎসব চলছে — দশমী শেষ হওয়া পর্যন্ত গোনা হচ্ছে
    } else if (nowMs < win.start) {
      durgaTarget = win.start; // এখনো শুরু হয়নি — ষষ্ঠী পর্যন্ত গোনা হচ্ছে
    } else {
      durgaTarget = null; // এ বছরের দুর্গাপূজা শেষ, পরের বছরের তারিখ এখনো যোগ করা হয়নি
    }

    if (pillDaysEl && pillLabelEl) {
      if (durgaOngoing) {
        pillDaysEl.textContent = (todayEvent && todayEvent.emoji) || '🛕';
        pillLabelEl.textContent = 'আজ ' + ((todayEvent && todayEvent.name) || 'দুর্গাপূজা') + ' — উৎসব চলছে';
      } else if (durgaTarget) {
        // নিচের বড় countdown বক্সও Math.floor দিয়ে দিন গোনে (২৬ দিন ১৪ ঘণ্টা মানেই "২৬ দিন বাকি") —
        // এখানে Math.ceil ব্যবহার করলে ভগ্নাংশ দিনকে উপরের দিকে পূর্ণ করে ফেলত (২৭), যেটা নিচের
        // বড় countdown-এর সাথে না মিলিয়ে বিভ্রান্তিকর দেখাচ্ছিল। তাই দুটো জায়গায় একই হিসাব রাখা হলো।
        var daysLeft = Math.floor((durgaTarget - nowMs) / (1000 * 60 * 60 * 24));
        pillDaysEl.textContent = toBn(pad2(Math.max(daysLeft, 0)));
        pillLabelEl.textContent = 'দিন বাকি দুর্গাপূজার';
      } else {
        pillDaysEl.textContent = '—';
        pillLabelEl.textContent = 'পরের বছরের দুর্গাপূজার তারিখ শীঘ্রই আসছে';
      }
    }

    if (durgaTarget) {
      currentTargetTime = durgaTarget;
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