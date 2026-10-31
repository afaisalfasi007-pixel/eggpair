// Google Analytics 4 with a consent banner. This file is only added to pages when a
// GA4 Measurement ID is configured (site.config.mjs). Nothing is sent to Google, and
// the Google script is not even downloaded, until the visitor accepts.
(() => {
  const script = document.currentScript;
  const id = script && script.dataset.id;
  if (!id || !/^G-[A-Z0-9]{6,12}$/.test(id)) return;

  const KEY = 'eggpair.consent.v1';
  const read = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
  const write = (v) => { try { localStorage.setItem(KEY, v); } catch { /* private mode */ } };

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('consent', 'default', {
    analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
  });

  let loaded = false;
  function grant() {
    gtag('consent', 'update', { analytics_storage: 'granted' });
    if (loaded) return;
    loaded = true;
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', id);
  }
  function deny() {
    gtag('consent', 'update', { analytics_storage: 'denied' });
  }

  /** Custom events. Does nothing unless the visitor accepted analytics. */
  window.eggpairTrack = (name, params) => {
    if (read() === 'granted') gtag('event', name, params || {});
  };

  let banner;
  function closeBanner() { if (banner) { banner.remove(); banner = null; } }
  function openBanner() {
    if (banner) return;
    banner = document.createElement('div');
    banner.className = 'consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Analytics cookies');
    banner.innerHTML = '<p>We use Google Analytics cookies to count visits and see which tools are used. No ads, and nothing is sent unless you accept. <a href="' +
      (document.querySelector('a[href$="/privacy/"]')?.getAttribute('href') || '/privacy/') + '">Privacy policy</a></p>' +
      '<div class="consent-btns"><button type="button" class="btn small ghost" data-choice="denied">Decline</button>' +
      '<button type="button" class="btn small" data-choice="granted">Accept</button></div>';
    banner.addEventListener('click', (e) => {
      const choice = e.target.closest('[data-choice]')?.dataset.choice;
      if (!choice) return;
      write(choice);
      choice === 'granted' ? grant() : deny();
      closeBanner();
    });
    document.body.appendChild(banner);
  }

  const saved = read();
  if (saved === 'granted') grant();
  else if (saved !== 'denied') openBanner();
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-consent-settings]')) openBanner();
  });
})();
