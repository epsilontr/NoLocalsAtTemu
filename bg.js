
browser.runtime.onMessage.addListener((msg, sender) => {
  if (msg?.type === 'TEMU_LOCAL_STATS') {
    const tabId = sender?.tab?.id;
    if (tabId) {
      browser.action.setBadgeText({ tabId, text: String(msg.hiddenCount || '') });
    }
  }
});
