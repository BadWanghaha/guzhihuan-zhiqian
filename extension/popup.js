const $ = (s) => document.querySelector(s);
let activeTab = null;

function collectable(url) {
  return /^https?:\/\//i.test(url || '');
}

chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
  activeTab = tabs && tabs[0] ? tabs[0] : null;
  if (!activeTab) return;
  $('#tabTitle').textContent = activeTab.title || activeTab.url || '未命名页面';
  try { $('#tabHost').textContent = new URL(activeTab.url).host; }
  catch (e) { $('#tabHost').textContent = activeTab.url || ''; }
  if (!collectable(activeTab.url)) {
    $('#collect').disabled = true;
    $('#warn').hidden = false;
  }
}).catch(() => {
  $('#tabTitle').textContent = '无法读取当前页面';
});

$('#collect').addEventListener('click', () => {
  if (!activeTab || !collectable(activeTab.url)) return;
  const q = new URLSearchParams({
    collect: '1',
    url: activeTab.url,
    title: activeTab.title || activeTab.url
  }).toString();
  chrome.windows.create({
    url: chrome.runtime.getURL('newtab.html?' + q),
    type: 'popup',
    width: 460,
    height: 720,
    focused: true
  });
  window.close();
});

$('#open').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('newtab.html') });
  window.close();
});

$('#settings').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('newtab.html#settings') });
  window.close();
});
