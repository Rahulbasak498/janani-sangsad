(function () {
  const layer = document.createElement('div');
  let isLeaving = false;
  layer.className = 'page-transition-layer';
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (
      !link ||
      isLeaving ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
      link.hasAttribute('download') ||
      (link.target && link.target !== '_self') ||
      link.relList.contains('external') ||
      link.closest('[data-no-transition]') ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) return;

    let url;
    try {
      url = new URL(link.href, window.location.href);
    } catch {
      return;
    }

    const isSameDocument = url.pathname === window.location.pathname && url.search === window.location.search;
    const isExternal = url.origin !== window.location.origin;
    if (isExternal || isSameDocument || !['http:', 'https:'].includes(url.protocol)) return;

    event.preventDefault();
    isLeaving = true;
    layer.classList.add('is-leaving');
    layer.style.visibility = 'visible';
    layer.style.opacity = '.96';
    document.body.classList.add('page-leaving');
    window.setTimeout(() => { window.location.href = url.href; }, 420);
  });

  window.addEventListener('pageshow', () => {
    isLeaving = false;
    layer.classList.remove('is-leaving');
    layer.style.visibility = '';
    layer.style.opacity = '';
    document.body.classList.remove('page-leaving');
  });
})();
