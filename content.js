(() => {
  'use strict';

  const DEFAULTS = { enabled: true, mode: 'remove', debug: false };
  const LABELS = new Set(['yerel', 'local']);

  let settings = { ...DEFAULTS };
  let hiddenCount = 0;

  const log = (...a) => settings.debug && console.log('[Temu Local Hider]', ...a);
  const norm = (t) => (t || '').trim().toLowerCase();

  function isLocalLabelNode(el) {
    const t = norm(el?.textContent);
    return t && t.length <= 12 && LABELS.has(t);
  }

  function getDisplay(el) {
    try { return getComputedStyle(el).display; } catch { return ''; }
  }

  function findGridItemWrapper(labelNode) {
    if (!labelNode) return null;

    let candidate =
      labelNode.closest('[role="listitem"]') ||
      labelNode.closest('article') ||
      labelNode.closest('li') ||
      labelNode.closest('div[role="group"]') ||
      labelNode.closest('a')?.closest('div,li,article') ||
      labelNode.closest('div,li,article');

    if (!candidate) return null;

    let el = candidate;
    for (let i = 0; i < 10 && el && el.parentElement; i++) {
      const p = el.parentElement;
      const disp = getDisplay(p);

      if (disp === 'grid' || disp === 'inline-grid' || disp === 'flex' || disp === 'inline-flex') {
        return el;
      }

      const gp = p.parentElement;
      const gdisp = gp ? getDisplay(gp) : '';
      if (gp && (gdisp === 'grid' || gdisp === 'inline-grid' || gdisp === 'flex' || gdisp === 'inline-flex')) {
        return p; 
      }

      el = p;
    }

    return candidate;
  }

  function apply(wrapper) {
    if (!wrapper) return false;
    if (wrapper.dataset?.temuLocalProcessed === '1') return false;
    if (wrapper.dataset) wrapper.dataset.temuLocalProcessed = '1';

    if (settings.mode === 'hide') {
      wrapper.style.setProperty('display', 'none', 'important');
    } else {
      wrapper.remove();
    }

    hiddenCount++;
    return true;
  }

  function notifyStats() {
    try { chrome.runtime.sendMessage({ type: 'TEMU_LOCAL_STATS', hiddenCount }); } catch {}
  }

  let scheduled = false;
  function scheduleScan() {
    if (!settings.enabled || scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      setTimeout(() => {
        scheduled = false;
        scan();
      }, 60);
    });
  }

  function scan() {
    if (!settings.enabled) return;

    const nodes = document.querySelectorAll('span,div,p,strong,em');
    let done = 0;

    for (const el of nodes) {
      if (!isLocalLabelNode(el)) continue;

      const wrapper = findGridItemWrapper(el);

      if (wrapper) {
        const r = wrapper.getBoundingClientRect();
        if (r.width > 50 && r.height > 50 && r.width < window.innerWidth * 0.98) {
          if (apply(wrapper)) done++;
        }
      }
    }

    if (done) {
      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new Event('scroll'));
      log('Bu tur:', done, 'Toplam:', hiddenCount);
      notifyStats();
    }
  }

  async function loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(DEFAULTS, (data) => {
        settings = { ...DEFAULTS, ...data };
        resolve();
      });
    });
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (!msg?.type) return;

    if (msg.type === 'TEMU_LOCAL_GET') {
      sendResponse({ ok: true, settings, hiddenCount });
      return;
    }

    if (msg.type === 'TEMU_LOCAL_SET') {
      settings = { ...settings, ...(msg.payload || {}) };
      chrome.storage.sync.set(settings, () => {
        if (settings.enabled) scheduleScan();
        sendResponse({ ok: true });
      });
      return true;
    }
  });

  function setupObserver() {
    const obs = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === 'childList' && (m.addedNodes?.length || m.removedNodes?.length)) {
          scheduleScan();
          break;
        }
      }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  function hookHistory() {
    const push = history.pushState;
    const rep = history.replaceState;
    history.pushState = function (...args) { const r = push.apply(this, args); scheduleScan(); return r; };
    history.replaceState = function (...args) { const r = rep.apply(this, args); scheduleScan(); return r; };
    window.addEventListener('popstate', scheduleScan);
  }

  (async function init() {
    await loadSettings();
    setupObserver();
    hookHistory();
    scheduleScan();
    setInterval(() => settings.enabled && scheduleScan(), 1500);
  })();
})();
