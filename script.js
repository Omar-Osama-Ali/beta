(() => {
  const menuBtn = document.querySelector('.menu-btn');
  const mobileNav = document.getElementById('mobile-nav');
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      const open = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', String(!open));
      menuBtn.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
      mobileNav.hidden = open;
    });
    mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', 'Open navigation');
      mobileNav.hidden = true;
    }));
  }

  const banner = document.getElementById('cookie-banner');
  const close = document.getElementById('cookie-close');
  if (banner && close) {
    try {
      if (!localStorage.getItem('oo-essential-notice-seen')) banner.hidden = false;
      close.addEventListener('click', () => {
        banner.hidden = true;
        try { localStorage.setItem('oo-essential-notice-seen', '1'); } catch (_) {}
      });
    } catch (_) {
      banner.hidden = false;
      close.addEventListener('click', () => { banner.hidden = true; });
    }
  }
})();
