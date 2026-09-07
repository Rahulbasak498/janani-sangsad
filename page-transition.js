(function () {
  const layer = document.createElement('div');
  layer.className = 'page-transition-layer';
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || link.target === '_blank') return;

    const url = new URL(link.href, window.location.href);
    const isSameDocument = url.pathname === window.location.pathname && url.search === window.location.search;
    const isExternal = url.origin !== window.location.origin;
    if (isExternal || isSameDocument || url.protocol === 'mailto:' || url.protocol === 'tel:') return;

    event.preventDefault();
    layer.classList.add('is-leaving');
    layer.style.visibility = 'visible';
    layer.style.opacity = '.96';
    document.body.classList.add('page-leaving');
    window.setTimeout(() => { window.location.href = url.href; }, 340);
  });
})();