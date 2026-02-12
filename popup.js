const DEFAULTS = { enabled: true, mode: 'remove', debug: false };

const $ = (id) => document.getElementById(id);

const enabledEl = $('enabled');
const debugEl = $('debug');
const statusText = $('statusText');
const hiddenCountEl = $('hiddenCount');
const modeRemoveBtn = $('modeRemove');
const modeHideBtn = $('modeHide');
const refreshBtn = $('refresh');

function setModeUI(mode) {
  modeRemoveBtn.classList.toggle('active', mode === 'remove');
  modeHideBtn.classList.toggle('active', mode === 'hide');
}

function setStatus(enabled) {
  statusText.textContent = enabled ? 'Açık' : 'Kapalı';
}

async function getActiveTemuTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => resolve(tabs?.[0]));
  });
}

async function sendToTab(tabId, msg) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, msg, (resp) => resolve(resp));
  });
}

async function loadState() {
  const tab = await getActiveTemuTab();
  if (!tab?.id) return;

  const resp = await sendToTab(tab.id, { type: 'TEMU_LOCAL_GET' });
  const s = resp?.settings || DEFAULTS;

  enabledEl.checked = !!s.enabled;
  debugEl.checked = !!s.debug;
  setModeUI(s.mode || 'remove');
  setStatus(!!s.enabled);

  hiddenCountEl.textContent = String(resp?.hiddenCount ?? 0);
}

async function updateSettings(patch) {
  const tab = await getActiveTemuTab();
  if (!tab?.id) return;

  await sendToTab(tab.id, { type: 'TEMU_LOCAL_SET', payload: patch });
  await loadState();
}

enabledEl.addEventListener('change', () => updateSettings({ enabled: enabledEl.checked }));
debugEl.addEventListener('change', () => updateSettings({ debug: debugEl.checked }));

modeRemoveBtn.addEventListener('click', () => updateSettings({ mode: 'remove' }));
modeHideBtn.addEventListener('click', () => updateSettings({ mode: 'hide' }));

refreshBtn.addEventListener('click', async () => {
  const tab = await getActiveTemuTab();
  if (!tab?.id) return;
  await sendToTab(tab.id, { type: 'TEMU_LOCAL_SET', payload: {} });
  await loadState();
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === 'TEMU_LOCAL_STATS') {
    hiddenCountEl.textContent = String(msg.hiddenCount ?? 0);
  }
});

loadState();
