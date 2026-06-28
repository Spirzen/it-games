/** Платформенные темы games-портала: steam, xbox, playstation, nintendo. */
(function initGamesPlatformTheme() {
  const root = document.documentElement;
  if (root.dataset.portal !== 'games') {
    return;
  }

  const STORAGE_KEY = 'itu-games-platform';
  const PLATFORMS = ['steam', 'xbox', 'playstation', 'nintendo'];

  function readStored() {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return PLATFORMS.includes(value) ? value : 'steam';
    } catch {
      return 'steam';
    }
  }

  function applyPlatform(platform) {
    root.dataset.platform = platform;
    document.querySelectorAll('[data-games-platform]').forEach((btn) => {
      if (!(btn instanceof HTMLElement)) {
        return;
      }
      btn.classList.toggle('is-active', btn.dataset.gamesPlatform === platform);
      btn.setAttribute('aria-pressed', btn.dataset.gamesPlatform === platform ? 'true' : 'false');
    });
  }

  function setPlatform(platform) {
    if (!PLATFORMS.includes(platform)) {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, platform);
    } catch {
      /* private mode */
    }
    applyPlatform(platform);
    window.dispatchEvent(new CustomEvent('itu-games-platform-set', {detail: {platform}}));
  }

  applyPlatform(readStored());

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    const btn = target.closest('[data-games-platform]');
    if (!btn || !(btn instanceof HTMLElement)) {
      return;
    }
    const platform = btn.dataset.gamesPlatform;
    if (platform) {
      setPlatform(platform);
    }
  });

  window.ITUGamesPlatformTheme = {setPlatform, readStored, PLATFORMS};
})();
