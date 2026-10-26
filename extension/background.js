importScripts('webdav.js');

function collectable(url) {
  return /^https?:\/\//i.test(url || '');
}

function openCollect(url, title) {
  if (!collectable(url)) return;
  var q = new URLSearchParams({
    collect: '1',
    url: url,
    title: title || url
  }).toString();
  chrome.windows.create({
    url: chrome.runtime.getURL('newtab.html?' + q),
    type: 'popup',
    width: 460,
    height: 720,
    focused: true
  });
}

function ensureMenu() {
  chrome.contextMenus.removeAll(function () {
    chrome.contextMenus.create({
      id: 'zhiqian-collect',
      title: '收藏到稚签',
      contexts: ['page', 'link', 'selection']
    });
  });
}

chrome.runtime.onInstalled.addListener(ensureMenu);

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId !== 'zhiqian-collect') return;
  var url = info.linkUrl || (tab && tab.url) || '';
  var title = info.selectionText || (tab && tab.title) || url;
  openCollect(url, title);
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (!message || !message.type) return;
  if (message.type === 'dav:test') {
    ZHIQIAN_DAV.test(message.config)
      .then(function (r) { sendResponse({ ok: true, status: r.status, server: r.server }); })
      .catch(function (e) { sendResponse({ ok: false, error: String(e && e.message || e) }); });
    return true;
  }
  if (message.type === 'dav:sync') {
    ZHIQIAN_DAV.sync(message.config, message.data)
      .then(function (r) { sendResponse(r); })
      .catch(function (e) { sendResponse({ ok: false, error: String(e && e.message || e) }); });
    return true;
  }
  if (message.type === 'open:collect') {
    openCollect(message.url, message.title);
    sendResponse({ ok: true });
    return false;
  }
});
