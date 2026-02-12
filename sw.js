chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg?.type === 'TEMU_LOCAL_STATS') {
    const tabId = sender?.tab?.id;
    if (tabId) {
      chrome.action.setBadgeText({ tabId, text: String(msg.hiddenCount || '') });
    }
  }
});
