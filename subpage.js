const navigationMarkup = `
  <nav class="nav scrolled" id="nav">
    <div class="container">
      <a class="brand" href="index.html">
        <div class="brand-mark">🕉️</div>
        <div class="brand-name">জননী সংসদ<small>প্রতিষ্ঠা ১৯৭৪</small></div>
      </a>
      <button class="nav-burger" id="navBurger" aria-label="মেনু খুলুন" type="button"><span></span><span></span><span></span></button>
      <div class="nav-links" id="navLinks">
        <a href="about.html">আমাদের সম্পর্কে</a>
        <a href="schedule.html">সময়সূচি</a>
        <a href="events.html">অনুষ্ঠান</a>
        <a href="gallery.html">গ্যালারি</a>
        <div class="nav-dropdown">
          <button class="nav-dropdown-btn" type="button">সদস্য <span class="caret">▾</span></button>
          <div class="nav-dropdown-menu">
            <a href="members.html">কার্যকরী সদস্যবৃন্দ</a>
            <a href="advisors.html">উপদেষ্টা</a>
            <a href="general-members.html">সাধারণ সদস্যবৃন্দ</a>
          </div>
        </div>
        <a href="affiliates.html">অঙ্গসংগঠন</a>
        <a href="donation.html">অনুদান</a>
        <a href="notice.html">নোটিশ</a>
        <a href="contact.html">যোগাযোগ</a>
      </div>
    </div>
  </nav>`;

document.getElementById('pageNav').innerHTML = navigationMarkup;
const transitionScript = document.createElement('script');
transitionScript.src = 'page-transition.js';
document.body.appendChild(transitionScript);
const pageSection = document.body.dataset.section;

async function loadSectionPage() {
  const target = document.getElementById('pageContent');
  try {
    const response = await fetch('index.html');
    if (!response.ok) throw new Error('Source page unavailable');
    const sourceDocument = new DOMParser().parseFromString(await response.text(), 'text/html');
    const sections = pageSection
      .split(',')
      .map(sectionId => sourceDocument.getElementById(sectionId.trim()))
      .filter(Boolean);
    if (!sections.length) throw new Error('Section unavailable');
    target.replaceChildren(...sections.map(section => document.importNode(section, true)));

    if (pageSection.split(',').map(sectionId => sectionId.trim()).includes('gallery')) {
      const lightbox = document.createElement('div');
      lightbox.className = 'gallery-lightbox';
      lightbox.id = 'galleryLightbox';
      lightbox.setAttribute('aria-hidden', 'true');
      lightbox.innerHTML = `
        <button type="button" class="lightbox-nav lightbox-prev" id="lightboxPrev" aria-label="আগের ছবি">‹</button>
        <button type="button" class="lightbox-close" id="lightboxClose" aria-label="ছবি বন্ধ করুন">×</button>
        <img id="lightboxImage" alt="">
        <button type="button" class="lightbox-nav lightbox-next" id="lightboxNext" aria-label="পরের ছবি">›</button>
      `;
      document.body.appendChild(lightbox);
    }

    await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
    await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js');
    await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js');
    await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-storage-compat.js');
    await loadScript('firebase-config.js');
    await loadScript('render.js');
    await loadScript('script.js');
  } catch (error) {
    target.innerHTML = '<section><div class="container"><h2 class="section-title">এই পেজটি লোড করা যায়নি</h2><p class="section-sub">অনুগ্রহ করে আবার চেষ্টা করুন।</p></div></section>';
    console.error('Section page failed to load:', error);
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

loadSectionPage();