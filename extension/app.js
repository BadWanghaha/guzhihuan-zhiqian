
(function () {
  'use strict';

  var KEY = 'zhiqian.proto.v1';
  var OLD_KEY = 'shiqian.proto.v1';
  var DAY = 86400000;
  var COLOR_VAR = {
    vermilion: 'var(--c-vermilion)',
    jade: 'var(--c-jade)',
    ochre: 'var(--c-ochre)',
    indigo: 'var(--c-indigo)',
    lotus: 'var(--c-lotus)',
    slate: 'var(--c-slate)'
  };
  var COLOR_LABEL = { vermilion: '珊瑚', jade: '薄荷', ochre: '琥珀', indigo: '靛蓝', lotus: '藕荷', slate: '雾灰' };
  var EVENT_CATS = {
    work: { label: '工作', color: 'var(--c-vermilion)' },
    design: { label: '设计', color: 'var(--c-lotus)' },
    dev: { label: '开发', color: 'var(--c-indigo)' },
    life: { label: '生活', color: 'var(--c-ochre)' },
    health: { label: '健康', color: 'var(--c-jade)' },
    read: { label: '阅读', color: 'var(--c-slate)' }
  };
  var TASK_LISTS = ['工作', '开发', '阅读', '生活', '健康'];

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function uid(prefix) { return (prefix || 'b') + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function dayKey(offset) {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + (offset || 0));
    return ymd(d);
  }
  function parseDayKey(key) {
    var p = String(key || '').split('-');
    if (p.length !== 3) return new Date();
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }
  function startOfWeek(ts) {
    var d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d.getTime();
  }
  function fmtDayCN(key) {
    var d = parseDayKey(key);
    return (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日';
  }
  var WEEKDAYS_CN = ['日', '一', '二', '三', '四', '五', '六'];

  /* ---------------- seed ---------------- */
  function seedData() {
    var now = Date.now();
    var cats = [
      { id: 'design', name: '设计灵感', color: 'lotus' },
      { id: 'dev', name: '开发工具', color: 'indigo' },
      { id: 'read', name: '阅读清单', color: 'jade' },
      { id: 'tools', name: '效率工具', color: 'ochre' },
      { id: 'later', name: '稍后读', color: 'slate' }
    ];
    function B(id, title, url, cat, tags, days, starred, visits, note) {
      var t = now - Math.round(days * DAY);
      return {
        id: id, title: title, url: url, categoryId: cat, tags: tags || [],
        note: note || '', starred: !!starred, visits: visits || 0,
        createdAt: t, updatedAt: t, lastVisited: t, source: 'chrome'
      };
    }
    var list = [
      B('b1', 'Are.na', 'https://www.are.na', 'design', ['灵感', '策展'], 0.2, true, 9, '把零散的灵感连成一条线索，比收藏夹更像一间私人档案室。'),
      B('b2', 'Savee', 'https://savee.it', 'design', ['图片', '素材'], 2.4, false, 4, ''),
      B('b3', 'Dribbble', 'https://dribbble.com', 'design', ['UI', '作品集'], 12, false, 18, ''),
      B('b4', 'Behance', 'https://www.behance.net', 'design', ['作品集'], 26, false, 6, ''),
      B('b5', '站酷 ZCOOL', 'https://www.zcool.com.cn', 'design', ['中文', '设计'], 5, false, 7, ''),
      B('b6', 'Awwwards', 'https://www.awwwards.com', 'design', ['网页', '评选'], 31, false, 3, ''),

      B('b7', 'GitHub', 'https://github.com', 'dev', ['代码', '开源'], 62, true, 48, '每天第一个打开的网站。'),
      B('b8', 'MDN Web Docs', 'https://developer.mozilla.org', 'dev', ['前端', '文档'], 48, false, 31, ''),
      B('b9', 'Stack Overflow', 'https://stackoverflow.com', 'dev', ['问答'], 40, false, 22, ''),
      B('b10', 'Can I use', 'https://caniuse.com', 'dev', ['兼容性'], 35, false, 14, ''),
      B('b11', 'CSS-Tricks', 'https://css-tricks.com', 'dev', ['CSS'], 22, false, 8, ''),
      B('b12', 'Vercel', 'https://vercel.com', 'dev', ['部署'], 18, false, 12, ''),
      B('b13', 'Excalidraw', 'https://excalidraw.com', 'dev', ['白板', '画图'], 9, true, 11, '手绘风白板，画架构图和流程最快。'),
      B('b14', 'npm', 'https://www.npmjs.com', 'dev', ['包管理'], 55, false, 19, ''),

      B('b15', '少数派', 'https://sspai.com', 'read', ['效率', '中文'], 17, true, 27, ''),
      B('b16', '阮一峰的网络日志', 'https://www.ruanyifeng.com/blog/', 'read', ['技术', '周刊'], 21, false, 15, '科技爱好者周刊，每周五的固定读物。'),
      B('b17', 'Hacker News', 'https://news.ycombinator.com', 'read', ['社区', '英文'], 14, false, 21, ''),
      B('b18', '豆瓣读书', 'https://book.douban.com', 'read', ['书评'], 44, false, 9, ''),
      B('b19', '微信读书', 'https://weread.qq.com', 'read', ['阅读'], 29, false, 16, ''),
      B('b20', 'The Marginalian', 'https://www.themarginalian.org', 'read', ['随笔', '英文'], 33, true, 5, '关于艺术、科学和如何活着。适合夜深的时候慢慢读。'),

      B('b21', 'Notion', 'https://www.notion.so', 'tools', ['笔记', '协作'], 70, true, 39, ''),
      B('b22', 'Linear', 'https://linear.app', 'tools', ['项目管理'], 25, true, 17, '把 issue 做得像一件产品。'),
      B('b23', 'Figma', 'https://www.figma.com', 'tools', ['设计', '协作'], 66, false, 29, ''),
      B('b24', '飞书', 'https://www.feishu.cn', 'tools', ['协作', '中文'], 52, false, 24, ''),
      B('b25', '语雀', 'https://www.yuque.com', 'tools', ['文档', '中文'], 6.2, false, 8, ''),
      B('b26', 'Readwise Reader', 'https://readwise.io/read', 'tools', ['稍后读'], 19, false, 7, ''),
      B('b27', 'Obsidian', 'https://obsidian.md', 'tools', ['笔记', '本地'], 38, false, 13, 'Markdown 笔记，数据完全在自己硬盘上。'),
      B('b28', 'Raycast', 'https://www.raycast.com', 'tools', ['效率', 'macOS'], 16, false, 10, ''),

      B('b29', '小宇宙', 'https://www.xiaoyuzhoufm.com', 'later', ['播客'], 1.2, true, 12, '通勤路上的一小时。'),
      B('b30', '哔哩哔哩', 'https://www.bilibili.com', 'later', ['视频'], 42, false, 26, ''),
      B('b31', 'Product Hunt', 'https://www.producthunt.com', 'later', ['产品'], 23, false, 6, ''),
      B('b32', 'DeepSeek', 'https://www.deepseek.com', 'later', ['AI'], 0.6, true, 20, ''),
      B('b33', 'Anthropic', 'https://www.anthropic.com', 'later', ['AI', '研究'], 11, false, 9, ''),
      B('b34', 'Perplexity', 'https://www.perplexity.ai', 'later', ['AI', '搜索'], 8, false, 14, ''),
      B('b35', 'Unsplash', 'https://unsplash.com', 'later', ['图片', '摄影'], 36, false, 11, '')
    ];
    var visitMap = { b1: 2 * 3600000, b29: 5 * 3600000, b7: 26 * 3600000, b15: 2 * DAY, b32: 7 * 3600000 };
    list.forEach(function (b) {
      if (visitMap[b.id]) { b.lastVisited = now - visitMap[b.id]; }
    });

    function T(id, title, listName, priority, off, done, note, subtasks, repeat) {
      var due = dayKey(off);
      var dueTs = parseDayKey(due).getTime();
      var completedAt = done ? Math.min(now - 3600000, dueTs + 11 * 3600000) : null;
      return {
        id: id, title: title, list: listName, priority: priority, due: due,
        done: !!done, note: note || '', createdAt: now - 3 * DAY, updatedAt: now,
        completedAt: completedAt,
        subtasks: subtasks || [], repeat: repeat || 'none', repeatUntil: ''
      };
    }
    var tasks = [
      T('t1', '整理稚签 v0.2 的需求清单', '工作', 'high', 0, false, '日程、待办、书签三块先定布局，再补交互。', [
        { id: 's1', title: '列出现有页面与交互', done: true },
        { id: 's2', title: '确定日程 / 待办布局', done: false },
        { id: 's3', title: '补充壁纸入口', done: false }
      ]),
      T('t2', '看完《设计中的设计》第 3 章', '阅读', 'med', 0, false, ''),
      T('t3', '给 WebDAV 同步补 ETag 冲突测试', '开发', 'high', 0, false, '两台设备同时改同一条书签，验证冲突副本是否生成。', [
        { id: 's4', title: '构造 412 冲突', done: true },
        { id: 's5', title: '验证冲突副本生成', done: false }
      ]),
      T('t4', '预约周五的牙医', '生活', 'low', 1, false, ''),
      T('t5', '输出首页面板线框图', '工作', 'med', 2, false, ''),
      T('t6', '晨跑 5 公里', '健康', 'med', 0, true, '', [], 'weekly'),
      T('t7', '回复合作邮件', '工作', 'low', 0, true, ''),
      T('t8', '整理上个月的照片', '生活', 'low', 5, false, ''),
      T('t9', '备份一次书签数据', '开发', 'med', -1, true, '')
    ];

    function E(id, title, off, start, end, cat, location, note, repeat) {
      return {
        id: id, title: title, date: dayKey(off), start: start, end: end, cat: cat,
        location: location || '', note: note || '', repeat: repeat || 'none', repeatUntil: ''
      };
    }
    var events = [
      E('e1', '产品周会', 0, '09:30', '10:15', 'work', '会议室 A', '', 'weekly'),
      E('e2', '设计评审 · 稚签首页', 0, '11:00', '12:00', 'design', 'Figma 协作'),
      E('e3', '和 YG 对齐 v0.2 范围', 0, '14:30', '15:30', 'work', '腾讯会议'),
      E('e4', '夜跑 5 公里', 0, '19:30', '20:30', 'health', '滨江步道'),
      E('e9', '睡前阅读 30 分钟', 0, '21:30', '22:15', 'read', '床头'),
      E('e5', '牙医预约', 1, '10:00', '10:45', 'life', '口腔医院'),
      E('e6', 'WebDAV 冲突联调', 2, '15:00', '16:30', 'dev', ''),
      E('e7', '读书会 ·《设计中的设计》', 3, '20:00', '21:30', 'read', '线上'),
      E('e8', '周报整理', -1, '16:00', '17:00', 'work', '')
    ];

    return {
      categories: cats,
      bookmarks: list,
      tasks: tasks,
      events: events,
      notes: [
        {
          id: 'quick', title: '速记',
          body: '把「日程 / 待办 / 书签」放进同一张首页，但不要做成信息堆砌：留白、层级、只显示今天。',
          tags: ['速记'], createdAt: now - 3600000, updatedAt: now - 3600000
        },
        {
          id: 'n1', title: 'WebDAV 同步设计',
          body: '同步文件用 workspace.json。拉取远端后按 id 做并集，ETag 乐观锁，412 时重新合并。删除写墓碑保留 30 天，冲突保留「冲突副本」。',
          tags: ['开发', '同步'], createdAt: now - 2 * DAY, updatedAt: now - 2 * DAY
        },
        {
          id: 'n2', title: '首页面板的取舍',
          body: '首页只放今天：今日日程、今日待办、本周进度、月历、常用书签、速记。历史数据去各自的页面看，不要把首页做成报表。',
          tags: ['设计'], createdAt: now - 4 * DAY, updatedAt: now - 3 * DAY
        }
      ]
    };
  }

  /* ---------------- state ---------------- */
  var seed = seedData();
  var state = {
    categories: seed.categories,
    bookmarks: seed.bookmarks,
    tasks: seed.tasks,
    events: seed.events,
    notes: seed.notes,
    searchHistory: [],
    ui: {
      filter: 'all', query: '', sort: 'recent', view: 'grid',
      page: 'overview', todoFilter: 'today',
      calMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime(),
      calSelected: dayKey(0),
      calView: 'month',
      calWeekStart: dayKey(-((new Date().getDay() + 6) % 7)),
      noteId: 'quick', noteQuery: '', searchQuery: '',
      profileAvatarDraft: null, profileColorDraft: ''
    },
    prefs: {
      skin: 'midnight',
      accent: 'indigo',
      defaultShelf: 'read',
      showTime: true,
      autoIcon: true,
      showGreeting: true,
      iconSize: 'md',
      searchEngine: 'bing',
      dashboardLayout: 'full',
      startPage: 'overview',
      onboarded: true,
      profile: { name: 'YG', avatar: '', color: 'indigo', updatedAt: 0 },
      background: { type: 'none', value: '', blur: 0, dim: 30 }
    },
    sync: {
      url: 'https://dav.jianguoyun.com/dav/',
      user: '',
      pass: '',
      dir: '/zhiqian/workspace.json',
      deviceId: 'dev_' + Math.random().toString(36).slice(2, 10),
      deviceName: '',
      mode: 'merge',
      auto: true,
      interval: '15',
      connected: false,
      lastSync: 0,
      size: '—',
      status: 'idle',
      logs: [
        { t: Date.now(), msg: '等待连接 · 配置坚果云 WebDAV 后测试', ok: true }
      ]
    },
    collect: { catId: 'read', tags: ['设计', '长文'], title: '设计中的留白：从版式到呼吸感', url: 'https://sspai.com/post/83210', host: 'sspai.com/post/83210' },
    selectedId: null,
    editingId: null,
    editingEventId: null,
    editingTaskId: null,
    subtaskDraft: [],
    dragId: null,
    confirmCb: null,
    shelfColor: 'vermilion',
    paletteIndex: 0,
    paletteItems: []
  };

  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        categories: state.categories,
        bookmarks: state.bookmarks,
        tasks: state.tasks,
        events: state.events,
        notes: state.notes,
        searchHistory: state.searchHistory,
        prefs: state.prefs,
        sync: state.sync
      }));
      return true;
    } catch (e) {
      return false;
    }
  }

  function restore() {
    try {
      var raw = localStorage.getItem(KEY) || localStorage.getItem(OLD_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (data && Array.isArray(data.bookmarks) && Array.isArray(data.categories)) {
        state.categories = data.categories;
        state.bookmarks = data.bookmarks;
        if (Array.isArray(data.tasks)) { state.tasks = data.tasks; }
        if (Array.isArray(data.events)) { state.events = data.events; }
        if (Array.isArray(data.notes)) { state.notes = data.notes; }
        if (Array.isArray(data.searchHistory)) { state.searchHistory = data.searchHistory; }
        if (data.note && typeof data.note.text === 'string' && !Array.isArray(data.notes)) {
          state.notes = [{ id: 'quick', title: '速记', body: data.note.text, tags: ['速记'], createdAt: Date.now(), updatedAt: data.note.updatedAt || Date.now() }];
        }
        if (data.prefs) { Object.assign(state.prefs, data.prefs); }
        if (data.sync) {
          var logs = state.sync.logs;
          Object.assign(state.sync, data.sync);
          if (!Array.isArray(state.sync.logs) || !state.sync.logs.length) { state.sync.logs = logs; }
          if (state.sync.dir === '/shiqian/workspace.json') state.sync.dir = '/zhiqian/workspace.json';
        }
      }
    } catch (e) { /* ignore */ }
  }

  /* ---------------- helpers ---------------- */
  function catById(id) {
    for (var i = 0; i < state.categories.length; i++) { if (state.categories[i].id === id) return state.categories[i]; }
    return null;
  }
  function bookById(id) {
    for (var i = 0; i < state.bookmarks.length; i++) { if (state.bookmarks[i].id === id) return state.bookmarks[i]; }
    return null;
  }
  function colorOf(b) {
    var c = catById(b.categoryId);
    return COLOR_VAR[(c && c.color) || 'slate'] || COLOR_VAR.slate;
  }
  function monoText(b) {
    var t = (b.title || '').trim();
    if (!t) { t = hostOf(b.url); }
    return t.charAt(0).toUpperCase();
  }
  function hostOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return url.replace(/^https?:\/\//, '').split('/')[0] || url; }
  }
  function davLabel() {
    var h = hostOf(state.sync.url);
    return /jianguoyun/i.test(h) ? '坚果云' : h;
  }
  function profileName() {
    var n = state.prefs.profile && state.prefs.profile.name;
    return String(n || '').trim() || 'YG';
  }
  function profileInitials() {
    var chars = Array.from(profileName());
    return chars.slice(0, 2).join('') || '稚';
  }
  function renderProfile() {
    var p = state.prefs.profile || {};
    var name = profileName();
    var el = $('#railAvatar');
    if (el) {
      el.innerHTML = '';
      el.title = name;
      el.setAttribute('aria-label', '编辑个人资料：' + name);
      if (p.avatar) {
        var img = document.createElement('img');
        img.src = p.avatar;
        img.alt = name;
        el.appendChild(img);
        el.classList.add('has-img');
        el.style.background = 'transparent';
      } else {
        el.textContent = profileInitials();
        el.classList.remove('has-img');
        el.style.background = COLOR_VAR[p.color] || COLOR_VAR.indigo;
      }
    }
    if ($('#profilePreview')) {
      var pv = $('#profilePreview');
      pv.innerHTML = '';
      var draftAvatar = state.ui.profileAvatarDraft != null ? state.ui.profileAvatarDraft : (p.avatar || '');
      if (draftAvatar) {
        var pimg = document.createElement('img');
        pimg.src = draftAvatar;
        pimg.alt = '头像预览';
        pv.appendChild(pimg);
        pv.style.background = 'transparent';
      } else {
        pv.textContent = Array.from(String($('#profileNameInput') ? $('#profileNameInput').value : name)).slice(0, 2).join('') || '稚';
        pv.style.background = COLOR_VAR[state.ui.profileColorDraft || p.color] || COLOR_VAR.indigo;
      }
    }
    if ($('#profileNameInput') && document.activeElement !== $('#profileNameInput')) {
      $('#profileNameInput').value = name;
    }
    $$('.avatar-color').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-color') === (state.ui.profileColorDraft || p.color));
    });
  }
  function applyStartPagePref() {
    var start = state.prefs.startPage === 'search' ? 'search' : 'overview';
    $$('#startPageSeg button').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-start') === start);
    });
  }
  function applyDashboardLayout() {
    var el = $('#pageOverview');
    var layout = state.prefs.dashboardLayout || 'full';
    if (el) el.setAttribute('data-layout', layout);
    $$('#dashLayoutSeg button').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-layout') === layout);
    });
  }

  function normalizeUrl(input) {
    var v = (input || '').trim();
    if (!v) return '';
    if (/^https?:\/\//i.test(v)) { try { return new URL(v).href; } catch (e) { return ''; } }
    if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(v)) {
      try { return new URL('https://' + v).href; } catch (e) { return ''; }
    }
    return '';
  }
  function timeAgo(ts) {
    var diff = Date.now() - ts;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' 分钟前';
    if (diff < DAY) return Math.floor(diff / 3600000) + ' 小时前';
    if (diff < 7 * DAY) return Math.floor(diff / DAY) + ' 天前';
    var d = new Date(ts);
    var s = (d.getMonth() + 1) + '月' + d.getDate() + '日';
    if (d.getFullYear() !== new Date().getFullYear()) s = d.getFullYear() + '年' + s;
    return s;
  }
  function timeShort(ts) {
    var d = new Date(ts);
    function p(n) { return n < 10 ? '0' + n : '' + n; }
    return p(d.getHours()) + ':' + p(d.getMinutes());
  }
  function fullDate(ts) {
    var d = new Date(ts);
    return d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日';
  }
  function setMono(el, b) {
    el.textContent = monoText(b);
    el.style.setProperty('--mc', colorOf(b));
  }
  function setStar(btn, on) {
    if (!btn) return;
    btn.classList.toggle('is-stared', !!on);
    var use = btn.querySelector('use');
    if (use) { use.setAttribute('href', on ? '#i-star-fill' : '#i-star'); }
    btn.setAttribute('aria-label', on ? '取消标星' : '标星');
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function debounce(fn, wait) {
    var t = null;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, wait);
    };
  }

  /* ---------------- toast ---------------- */
  function toast(msg, kind) {
    var wrap = $('#toasts');
    var el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('data-kind', kind || 'ok');
    var icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('class', 'ic');
    var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', kind === 'error' ? '#i-x' : kind === 'warn' ? '#i-info' : '#i-check');
    icon.appendChild(use);
    var span = document.createElement('span');
    span.textContent = msg;
    el.appendChild(icon);
    el.appendChild(span);
    wrap.appendChild(el);
    setTimeout(function () {
      el.classList.add('is-out');
      setTimeout(function () { el.remove(); }, 260);
    }, 2600);
  }

  /* ---------------- derived ---------------- */
  function weekStats() {
    var days = [];
    var today = new Date();
    for (var i = 6; i >= 0; i--) {
      var d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      var start = d.getTime();
      var end = start + DAY;
      var n = 0;
      state.bookmarks.forEach(function (b) { if (b.createdAt >= start && b.createdAt < end) n++; });
      days.push({ label: '日一二三四五六'.charAt(d.getDay()), count: n, today: i === 0 });
    }
    return days;
  }
  function countRecent() {
    var cutoff = Date.now() - 7 * DAY;
    return state.bookmarks.filter(function (b) { return !b.archived && b.createdAt >= cutoff; }).length;
  }
  function countStarred() { return state.bookmarks.filter(function (b) { return !b.archived && b.starred; }).length; }
  function countRead() { return state.bookmarks.filter(function (b) { return !b.read && !b.archived; }).length; }
  function countArchived() { return state.bookmarks.filter(function (b) { return b.archived; }).length; }
  function countTags() {
    var set = {};
    state.bookmarks.forEach(function (b) { (b.tags || []).forEach(function (t) { set[t] = 1; }); });
    return Object.keys(set).length;
  }

  function currentList() {
    var f = state.ui.filter;
    var list = state.bookmarks.slice().filter(function (b) { return f === 'archived' ? !!b.archived : !b.archived; });
    if (f === 'starred') list = list.filter(function (b) { return b.starred; });
    else if (f === 'read') list = list.filter(function (b) { return !b.read; });
    else if (f === 'recent') {
      var cutoff = Date.now() - 7 * DAY;
      var filtered = list.filter(function (b) { return b.createdAt >= cutoff; });
      list = filtered.length ? filtered : list;
    } else if (f.indexOf('cat:') === 0) {
      var cid = f.slice(4);
      list = list.filter(function (b) { return b.categoryId === cid; });
    }
    var q = state.ui.query.trim().toLowerCase();
    if (q) {
      list = list.filter(function (b) {
        var hay = (b.title + ' ' + b.url + ' ' + (b.tags || []).join(' ') + ' ' + (b.note || '') + ' ' + (b.excerpt || '')).toLowerCase();
        return hay.indexOf(q) !== -1;
      });
    }
    var sort = state.ui.sort;
    list.sort(function (a, b) {
      if (sort === 'name') return a.title.localeCompare(b.title, 'zh-Hans-CN');
      if (sort === 'visits') return (b.visits || 0) - (a.visits || 0);
      return b.createdAt - a.createdAt;
    });
    return list;
  }
  function filterLabel() {
    var f = state.ui.filter;
    if (state.ui.query.trim()) return '搜索结果';
    if (f === 'starred') return '标星收藏';
    if (f === 'read') return '稍后读';
    if (f === 'archived') return '已归档';
    if (f === 'recent') return '最近添加';
    if (f.indexOf('cat:') === 0) {
      var c = catById(f.slice(4));
      return c ? c.name : '全部书签';
    }
    return '全部书签';
  }

  /* ---------------- task / event helpers ---------------- */
  function eventById(id) {
    for (var i = 0; i < state.events.length; i++) { if (state.events[i].id === id) return state.events[i]; }
    return null;
  }
  function taskById(id) {
    for (var i = 0; i < state.tasks.length; i++) { if (state.tasks[i].id === id) return state.tasks[i]; }
    return null;
  }
  function toMin(t) {
    var p = String(t || '00:00').split(':');
    return Number(p[0] || 0) * 60 + Number(p[1] || 0);
  }
  function occursOn(ev, key) {
    if (!ev || !key) return false;
    if (ev.date === key) return true;
    if (!ev.repeat || ev.repeat === 'none') return false;
    if (key < ev.date) return false;
    if (ev.repeatUntil && key > ev.repeatUntil) return false;
    var base = parseDayKey(ev.date);
    var d = parseDayKey(key);
    var diff = Math.round((d.getTime() - base.getTime()) / DAY);
    if (ev.repeat === 'daily') return true;
    if (ev.repeat === 'weekdays') return d.getDay() >= 1 && d.getDay() <= 5;
    if (ev.repeat === 'weekly') return diff % 7 === 0;
    if (ev.repeat === 'monthly') return d.getDate() === base.getDate();
    return false;
  }
  function eventsOn(key) {
    return state.events.filter(function (e) { return occursOn(e, key); }).map(function (e) {
      return Object.assign({}, e, { occurrenceDate: key });
    }).sort(function (a, b) { return a.start < b.start ? -1 : a.start > b.start ? 1 : 0; });
  }
  function weekStartKey(key) {
    var d = parseDayKey(key);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return ymd(d);
  }
  function addDaysKey(key, n) {
    var d = parseDayKey(key);
    d.setDate(d.getDate() + n);
    return ymd(d);
  }
  function nextDue(dueKey, repeat) {
    var d = parseDayKey(dueKey);
    if (repeat === 'daily') d.setDate(d.getDate() + 1);
    else if (repeat === 'weekdays') {
      do { d.setDate(d.getDate() + 1); } while (d.getDay() === 0 || d.getDay() === 6);
    } else if (repeat === 'weekly') d.setDate(d.getDate() + 7);
    else if (repeat === 'monthly') d.setMonth(d.getMonth() + 1);
    else return '';
    return ymd(d);
  }
  function noteById(id) {
    for (var i = 0; i < state.notes.length; i++) { if (state.notes[i].id === id) return state.notes[i]; }
    return null;
  }
  function quickNote() {
    var n = noteById('quick');
    if (!n) {
      n = { id: 'quick', title: '速记', body: '', tags: ['速记'], createdAt: Date.now(), updatedAt: 0 };
      state.notes.unshift(n);
    }
    return n;
  }
  function todayEvents() { return eventsOn(dayKey(0)); }
  function openTasks() { return state.tasks.filter(function (t) { return !t.done; }); }
  function todayOpenTasks() {
    var today = dayKey(0);
    return state.tasks.filter(function (t) { return !t.done && t.due <= today; });
  }
  function doneThisWeek() {
    var ws = startOfWeek(Date.now());
    return state.tasks.filter(function (t) { return t.done && t.completedAt && t.completedAt >= ws; }).length;
  }
  function dueLabel(t) {
    if (t.done) return '完成于 ' + (t.completedAt ? timeShort(t.completedAt) : '—');
    var today = dayKey(0);
    if (t.due === today) return '今天';
    if (t.due === dayKey(1)) return '明天';
    if (t.due < today) return '逾期 · ' + fmtDayCN(t.due);
    return fmtDayCN(t.due);
  }
  function taskReminderText(t) {
    if (!t.remindAt || t.done) return '';
    var diff = Number(t.remindAt) - Date.now();
    if (diff <= 0) return '提醒已过';
    if (diff < 3600000) return '还有 ' + Math.max(1, Math.ceil(diff / 60000)) + ' 分钟';
    var d = new Date(Number(t.remindAt));
    return '提醒 ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }
  function taskSort(a, b) {
    if (a.done !== b.done) return a.done ? 1 : -1;
    var pr = { high: 0, med: 1, low: 2 };
    if (pr[a.priority] !== pr[b.priority]) return pr[a.priority] - pr[b.priority];
    if (a.due !== b.due) return a.due < b.due ? -1 : 1;
    return 0;
  }
  function renderWeekBars(el) {
    if (!el) return;
    el.innerHTML = '';
    var ws = startOfWeek(Date.now());
    var counts = [];
    var max = 1;
    for (var i = 0; i < 7; i++) {
      var from = ws + i * DAY;
      var to = from + DAY;
      var n = state.tasks.filter(function (t) { return t.done && t.completedAt && t.completedAt >= from && t.completedAt < to; }).length;
      counts.push(n);
      if (n > max) max = n;
    }
    var todayIdx = (new Date().getDay() + 6) % 7;
    var labels = ['一', '二', '三', '四', '五', '六', '日'];
    counts.forEach(function (n, idx) {
      var bar = document.createElement('div');
      bar.className = 'bar' + (idx === todayIdx ? ' is-today' : '');
      var i2 = document.createElement('i');
      i2.style.height = n === 0 ? '2px' : Math.max(12, Math.round((n / max) * 100)) + '%';
      var s = document.createElement('span');
      s.textContent = labels[idx];
      bar.appendChild(i2);
      bar.appendChild(s);
      el.appendChild(bar);
    });
  }

  /* ---------------- search page ---------------- */
  var SEARCH_ENGINES = {
    bing: { name: '必应', short: 'B', url: 'https://www.bing.com/search?q=' },
    google: { name: 'Google', short: 'G', url: 'https://www.google.com/search?q=' },
    baidu: { name: '百度', short: '百', url: 'https://www.baidu.com/s?wd=' },
    duck: { name: 'DuckDuckGo', short: 'D', url: 'https://duckduckgo.com/?q=' },
    perplexity: { name: 'Perplexity', short: 'P', url: 'https://www.perplexity.ai/search?q=' }
  };
  function currentEngine() {
    return SEARCH_ENGINES[state.prefs.searchEngine] || SEARCH_ENGINES.bing;
  }
  function looksLikeUrl(q) {
    if (!q || /\s/.test(q)) return false;
    return /^https?:\/\/[^\s]+$/i.test(q) || /^[\w-]+(\.[\w-]+)+([\/?#].*)?$/.test(q);
  }
  function localSearchResults(q) {
    var needle = q.toLowerCase();
    var out = [];
    state.bookmarks.forEach(function (b) {
      if ((b.title + ' ' + b.url + ' ' + (b.tags || []).join(' ') + ' ' + (b.note || '') + ' ' + (b.excerpt || '')).toLowerCase().indexOf(needle) !== -1) {
        out.push({ kind: 'bookmark', id: b.id, title: b.title, meta: hostOf(b.url), mono: (b.title || '书').slice(0, 1) });
      }
    });
    state.tasks.forEach(function (t) {
      if ((t.title + ' ' + (t.note || '')).toLowerCase().indexOf(needle) !== -1) {
        out.push({ kind: 'task', id: t.id, title: t.title, meta: t.done ? '待办 · 已完成' : '待办 · ' + dueLabel(t), mono: '任' });
      }
    });
    state.notes.forEach(function (n) {
      if ((n.title + ' ' + n.body + ' ' + (n.tags || []).join(' ')).toLowerCase().indexOf(needle) !== -1) {
        out.push({ kind: 'note', id: n.id, title: n.title || '无标题笔记', meta: '笔记', mono: '记' });
      }
    });
    return out.slice(0, 6);
  }
  function renderSearchPage() {
    var host = $('#searchEngines');
    if (!host) return;
    host.innerHTML = '';
    Object.keys(SEARCH_ENGINES).forEach(function (key) {
      var e = SEARCH_ENGINES[key];
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'engine-btn' + (key === state.prefs.searchEngine ? ' is-active' : '');
      btn.setAttribute('data-engine', key);
      var b = document.createElement('b'); b.textContent = e.short;
      var s = document.createElement('span'); s.textContent = e.name;
      btn.appendChild(b); btn.appendChild(s);
      host.appendChild(btn);
    });
    var note = $('#searchNote');
    if (note) note.textContent = '用' + currentEngine().name + '搜索 · 输入网址可直接打开';
    var clearHist = $('#clearSearchHistory');
    if (clearHist) clearHist.hidden = !state.searchHistory.length;
    var hist = $('#searchHistory');
    if (hist) {
      hist.innerHTML = '';
      if (!state.searchHistory.length) {
        var empty = document.createElement('span');
        empty.className = 'search-empty';
        empty.textContent = '还没有搜索记录';
        hist.appendChild(empty);
      } else {
        state.searchHistory.forEach(function (q) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'search-chip';
          b.setAttribute('data-search-history', q);
          var i = document.createElement('i'); i.className = 'dot';
          var s = document.createElement('span'); s.textContent = q;
          b.appendChild(i); b.appendChild(s);
          hist.appendChild(b);
        });
      }
    }
    var quick = $('#searchQuickLinks');
    if (quick) {
      quick.innerHTML = '';
      var tops = state.bookmarks.filter(function (b) { return !b.archived; }).sort(function (a, b) {
        return (b.starred ? 1 : 0) - (a.starred ? 1 : 0) || (b.visits || 0) - (a.visits || 0);
      }).slice(0, 8);
      if (!tops.length) {
        var qEmpty = document.createElement('span');
        qEmpty.className = 'search-empty';
        qEmpty.textContent = '还没有书签，先收藏一个页面';
        quick.appendChild(qEmpty);
      }
      tops.forEach(function (bm) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'search-quick-item';
        btn.setAttribute('data-quick-url', bm.url);
        var mono = document.createElement('span');
        mono.className = 'search-quick-mono';
        mono.textContent = (bm.title || '书').slice(0, 1);
        var copy = document.createElement('span');
        copy.className = 'search-quick-copy';
        var t = document.createElement('b'); t.textContent = bm.title;
        var u = document.createElement('small'); u.textContent = hostOf(bm.url);
        copy.appendChild(t); copy.appendChild(u);
        btn.appendChild(mono); btn.appendChild(copy);
        quick.appendChild(btn);
      });
    }
    var input = $('#searchPageInput');
    if (input) {
      if (document.activeElement !== input) input.value = state.ui.searchQuery || '';
      renderSearchSuggestions(input.value);
    }
  }
  function renderSearchSuggestions(q) {
    var host = $('#searchSuggest');
    if (!host) return;
    q = (q || '').trim();
    if (!q) {
      host.hidden = true;
      host.innerHTML = '';
      return;
    }
    var engine = currentEngine();
    host.innerHTML = '';
    var web = document.createElement('button');
    web.type = 'button';
    web.className = 'suggest-item suggest-web';
    web.setAttribute('data-search-web', q);
    var wi = document.createElement('span'); wi.className = 'suggest-ico'; wi.innerHTML = '<svg class="ic"><use href="#i-search"></use></svg>';
    var wc = document.createElement('span'); wc.className = 'suggest-copy';
    var wb = document.createElement('b');
    wb.textContent = looksLikeUrl(q) ? '打开 ' + q : '在' + engine.name + '搜索 “' + q + '”';
    var ws = document.createElement('small'); ws.textContent = looksLikeUrl(q) ? '网址' : 'Enter';
    wc.appendChild(wb); wc.appendChild(ws); web.appendChild(wi); web.appendChild(wc);
    host.appendChild(web);
    var locals = localSearchResults(q);
    if (locals.length) {
      var label = document.createElement('div');
      label.className = 'suggest-label';
      label.textContent = '书房里';
      host.appendChild(label);
      locals.forEach(function (r) {
        var item = document.createElement('button');
        item.type = 'button';
        item.className = 'suggest-item';
        item.setAttribute('data-search-kind', r.kind);
        item.setAttribute('data-search-id', r.id);
        var ico = document.createElement('span'); ico.className = 'suggest-ico'; ico.textContent = r.mono;
        var copy = document.createElement('span'); copy.className = 'suggest-copy';
        var b = document.createElement('b'); b.textContent = r.title;
        var s = document.createElement('small'); s.textContent = r.meta;
        copy.appendChild(b); copy.appendChild(s); item.appendChild(ico); item.appendChild(copy);
        host.appendChild(item);
      });
    }
    host.hidden = false;
  }

  /* ---------------- render: nav ---------------- */
  function renderNav() {
    var page = state.ui.page;
    $$('#pageNav .nav-item').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-page') === page);
    });
    $$('#mobileNav button').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-page') === page);
    });
    if ($('#navBookmarkCount')) $('#navBookmarkCount').textContent = state.bookmarks.filter(function (b) { return !b.archived; }).length;
    if ($('#navTodayCount')) $('#navTodayCount').textContent = todayEvents().length;
    if ($('#navOpenTasks')) $('#navOpenTasks').textContent = openTasks().length;
    if ($('#navNoteCount')) $('#navNoteCount').textContent = state.notes.length;
    renderRailNotes();
    if ($('#filterAllCount')) $('#filterAllCount').textContent = state.bookmarks.filter(function (b) { return !b.archived; }).length;
    if ($('#filterRecentCount')) $('#filterRecentCount').textContent = countRecent();
    if ($('#filterStarCount')) $('#filterStarCount').textContent = countStarred();
    if ($('#filterReadCount')) $('#filterReadCount').textContent = countRead();
    if ($('#filterArchiveCount')) $('#filterArchiveCount').textContent = countArchived();
    if ($('#bookmarksSub')) {
      $('#bookmarksSub').textContent = state.bookmarks.length + ' 枚书签 · ' + state.categories.length + ' 个书架 · 慢慢整理，常常回看。';
    }

    $$('#filterRow .filter-chip').forEach(function (btn) {
      var f = btn.getAttribute('data-filter');
      if (f === 'cat:') return;
      btn.classList.toggle('is-active', f === state.ui.filter);
    });
    var catChip = $('#filterCatChip');
    if (catChip) {
      if (state.ui.filter.indexOf('cat:') === 0) {
        var cid = state.ui.filter.slice(4);
        var c = catById(cid);
        catChip.classList.remove('is-hidden');
        catChip.setAttribute('data-filter', state.ui.filter);
        catChip.style.setProperty('--mc', COLOR_VAR[c ? c.color : 'slate']);
        catChip.querySelector('.txt').textContent = c ? c.name : '书架';
      } else {
        catChip.classList.add('is-hidden');
      }
    }

    ['#catList', '#catListMobile'].forEach(function (sel) {
      var list = $(sel);
      if (!list) return;
      var tpl = $('#tpl-cat');
      list.innerHTML = '';
      state.categories.forEach(function (c) {
        var node = tpl.content.firstElementChild.cloneNode(true);
        node.setAttribute('data-filter', 'cat:' + c.id);
        node.setAttribute('data-cat', c.id);
        node.style.setProperty('--mc', COLOR_VAR[c.color] || COLOR_VAR.slate);
        node.querySelector('.label').textContent = c.name;
        var n = state.bookmarks.filter(function (b) { return b.categoryId === c.id; }).length;
        node.querySelector('.count').textContent = n;
        if (page === 'bookmarks' && state.ui.filter === 'cat:' + c.id) node.classList.add('is-active');
        node.setAttribute('title', c.name + ' · ' + n + ' 枚书签');
        list.appendChild(node);
      });
    });
  }

  /* ---------------- render: dashboard ---------------- */
  function renderDashHead() {
    var d = new Date();
    if ($('#dashDateInline')) {
      $('#dashDateInline').textContent = (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日 · 星期' + WEEKDAYS_CN[d.getDay()];
    }
    var h = d.getHours();
    var greet = h < 5 ? '凌晨好' : h < 9 ? '早上好' : h < 12 ? '上午好' : h < 14 ? '中午好' : h < 18 ? '下午好' : '晚上好';
    if (state.prefs.showGreeting) {
      $('#dashGreeting').innerHTML = greet + '，<em></em>。';
      var nameEl = $('#dashGreeting em');
      if (nameEl) nameEl.textContent = profileName();
    } else {
      $('#dashGreeting').textContent = '私人书房';
    }
  }

  function renderDashboard() {
    renderDashHead();
    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var evs = todayEvents();
    $('#dashScheduleMeta').textContent = evs.length ? evs.length + ' 个安排' : '空';
    var tl = $('#dashTimeline');
    tl.innerHTML = '';
    if (!evs.length) {
      tl.innerHTML = '<div class="timeline-empty"><b>今天没有安排</b><span>留一点空白，也很好。</span></div>';
    }
    evs.forEach(function (ev) {
      var cat = EVENT_CATS[ev.cat] || EVENT_CATS.work;
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'timeline-item';
      item.setAttribute('data-id', ev.id);
      item.style.setProperty('--mc', cat.color);
      if (nowMin > toMin(ev.end)) item.classList.add('is-past');
      else if (nowMin >= toMin(ev.start) && nowMin <= toMin(ev.end)) item.classList.add('is-now');
      item.innerHTML = '<span class="timeline-time"></span><span class="timeline-rail"><i class="timeline-dot"></i></span><span class="timeline-body"><b></b><span></span></span>';
      item.querySelector('.timeline-time').textContent = ev.start;
      item.querySelector('.timeline-body b').textContent = ev.title;
      item.querySelector('.timeline-body span').textContent = ev.start + ' – ' + ev.end + (ev.location ? ' · ' + ev.location : '');
      tl.appendChild(item);
    });
    var next = null;
    evs.forEach(function (ev) { if (toMin(ev.start) > nowMin && (!next || ev.start < next.start)) next = ev; });
    $('#dashScheduleFoot').textContent = next ? '下一个 · ' + next.start + ' ' + next.title : (evs.length ? '今天的安排都过去了' : '一整天都由你安排');

    var today = dayKey(0);
    var todays = state.tasks.filter(function (t) { return t.due === today || (!t.done && t.due < today); }).sort(taskSort);
    var doneCount = todays.filter(function (t) { return t.done; }).length;
    var total = todays.length;
    $('#dashTaskMeta').textContent = doneCount + '/' + total;
    $('#dashTaskBar').style.width = (total ? Math.round((doneCount / total) * 100) : 0) + '%';
    var tasksHost = $('#dashTasks');
    tasksHost.innerHTML = '';
    if (!todays.length) {
      tasksHost.innerHTML = '<div class="timeline-empty" style="min-height:70px"><b>今天清空了</b><span>享受这段空白。</span></div>';
    }
    todays.slice(0, 5).forEach(function (t) {
      var row = document.createElement('div');
      row.className = 'mini-task' + (t.done ? ' is-done' : '');
      row.setAttribute('data-id', t.id);
      row.innerHTML = '<button class="check" type="button" aria-label="切换完成"><svg class="ic"><use href="#i-check"></use></svg></button><span class="txt"></span><span class="when"></span>';
      if (t.done) row.querySelector('.check').classList.add('is-on');
      row.querySelector('.txt').textContent = t.title;
      row.querySelector('.when').textContent = t.done ? '已完成' : (t.due < today ? '逾期' : (taskReminderText(t) || (t.priority === 'high' ? '高优先' : '')));
      tasksHost.appendChild(row);
    });
    var tomorrowTasks = state.tasks.filter(function (t) { return !t.done && t.due === dayKey(1); }).slice(0, 2);
    if (tomorrowTasks.length) {
      var sep = document.createElement('div');
      sep.className = 'mini-sep';
      sep.textContent = '明天';
      tasksHost.appendChild(sep);
      tomorrowTasks.forEach(function (t) {
        var row2 = document.createElement('div');
        row2.className = 'mini-task';
        row2.setAttribute('data-id', t.id);
        row2.innerHTML = '<button class="check" type="button" aria-label="切换完成"><svg class="ic"><use href="#i-check"></use></svg></button><span class="txt"></span><span class="when">明天</span>';
        row2.querySelector('.txt').textContent = t.title;
        tasksHost.appendChild(row2);
      });
    }

    var upcoming = state.tasks.filter(function (t) { return !t.done && t.due > dayKey(1); }).sort(taskSort).slice(0, 2);
    if (upcoming.length) {
      var sep2 = document.createElement('div');
      sep2.className = 'mini-sep';
      sep2.textContent = '稍后';
      tasksHost.appendChild(sep2);
      upcoming.forEach(function (t) {
        var row3 = document.createElement('div');
        row3.className = 'mini-task';
        row3.setAttribute('data-id', t.id);
        row3.innerHTML = '<button class="check" type="button" aria-label="切换完成"><svg class="ic"><use href="#i-check"></use></svg></button><span class="txt"></span><span class="when"></span>';
        row3.querySelector('.txt').textContent = t.title;
        row3.querySelector('.when').textContent = dueLabel(t);
        tasksHost.appendChild(row3);
      });
    }

    var ws = startOfWeek(Date.now());
    var weekEnd = ws + 7 * DAY;
    var weekDone = doneThisWeek();
    var weekOpen = state.tasks.filter(function (t) {
      var ts = parseDayKey(t.due).getTime();
      return !t.done && ts >= ws && ts < weekEnd;
    }).length;
    var weekTasks = state.tasks.filter(function (t) {
      var ts = parseDayKey(t.due).getTime();
      return ts >= ws && ts < weekEnd;
    }).length;
    var weekEv = state.events.filter(function (e) {
      var ts = parseDayKey(e.date).getTime();
      return ts >= ws && ts < weekEnd;
    }).length;
    var weekBm = state.bookmarks.filter(function (b) { return b.createdAt >= ws; }).length;
    var pct = weekDone + weekOpen ? Math.round((weekDone / (weekDone + weekOpen)) * 100) : 0;
    if ($('#weekDone')) $('#weekDone').textContent = weekDone;
    if ($('#weekBookmarks')) $('#weekBookmarks').textContent = weekBm;
    if ($('#weekEvents')) $('#weekEvents').textContent = weekEv;
    if ($('#weekTasks')) $('#weekTasks').textContent = weekTasks;
    if ($('#weekRing')) $('#weekRing').style.setProperty('--p', pct);
    var sd = new Date(ws);
    var ed = new Date(ws + 6 * DAY);
    $('#dashWeekRange').textContent = (sd.getMonth() + 1) + '.' + sd.getDate() + ' – ' + (ed.getMonth() + 1) + '.' + ed.getDate();
    renderWeekBars($('#weekBarsMini'));
    renderMiniCal();

    var picks = state.bookmarks.filter(function (b) { return !b.archived; }).sort(function (a, b) {
      if (!!b.starred !== !!a.starred) return b.starred ? 1 : -1;
      return (b.visits || 0) - (a.visits || 0);
    }).slice(0, 8);
    var bmHost = $('#dashBookmarks');
    bmHost.innerHTML = '';
    if (!picks.length) {
      var bmEmpty = document.createElement('div');
      bmEmpty.className = 'dash-empty';
      bmEmpty.textContent = '还没有书签，用工具栏或右键收藏网页';
      bmHost.appendChild(bmEmpty);
    }
    picks.forEach(function (b) {
      var tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'bm-tile';
      tile.setAttribute('data-url', b.url);
      tile.innerHTML = '<span class="mono" aria-hidden="true"></span><span class="copy"><b></b><span></span></span>';
      setMono(tile.querySelector('.mono'), b);
      tile.querySelector('b').textContent = b.title;
      tile.querySelector('.copy span').textContent = hostOf(b.url);
      bmHost.appendChild(tile);
    });

    var sp = $('#scratchpad');
    var qn = quickNote();
    if (sp && document.activeElement !== sp) sp.value = qn.body || '';
    var saved = qn.updatedAt ? '已保存 ' + timeShort(qn.updatedAt) : '自动保存';
    if ($('#noteSaved')) $('#noteSaved').textContent = saved;
  }

  function renderMiniCal() {
    var base = new Date(state.ui.calMonth);
    var y = base.getFullYear();
    var m = base.getMonth();
    var label = document.querySelector('[data-mini-label]');
    if (label) label.textContent = y + ' 年 ' + (m + 1) + ' 月';
    var grid = $('#miniCalGrid');
    if (!grid) return;
    grid.innerHTML = '';
    ['一', '二', '三', '四', '五', '六', '日'].forEach(function (d) {
      var el = document.createElement('div');
      el.className = 'mini-dow';
      el.textContent = d;
      grid.appendChild(el);
    });
    var first = new Date(y, m, 1);
    var offset = (first.getDay() + 6) % 7;
    var daysInMonth = new Date(y, m + 1, 0).getDate();
    var cells = Math.ceil((offset + daysInMonth) / 7) * 7;
    var start = new Date(y, m, 1 - offset);
    var today = dayKey(0);
    for (var i = 0; i < cells; i++) {
      var d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      var key = ymd(d);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mini-day';
      btn.setAttribute('data-date', key);
      btn.textContent = d.getDate();
      if (d.getMonth() !== m) btn.classList.add('is-out');
      if (key === today) btn.classList.add('is-today');
      if (eventsOn(key).length) btn.classList.add('has-ev');
      grid.appendChild(btn);
    }
  }

  /* ---------------- render: notes page ---------------- */
  function renderRailNotes() {
    var host = $('#railNotes');
    if (!host) return;
    var notes = state.notes.slice().sort(function (a, b) { return b.updatedAt - a.updatedAt; }).slice(0, 3);
    host.innerHTML = '';
    if (!notes.length) {
      var empty = document.createElement('span');
      empty.className = 'rail-note';
      empty.style.opacity = '.55';
      empty.textContent = '还没有笔记';
      host.appendChild(empty);
      return;
    }
    notes.forEach(function (n) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'rail-note' + (state.ui.page === 'notes' && state.ui.noteId === n.id ? ' is-active' : '');
      btn.setAttribute('data-note', n.id);
      var dot = document.createElement('i'); dot.className = 'dot';
      var span = document.createElement('span'); span.textContent = n.title || '无标题笔记';
      btn.appendChild(dot); btn.appendChild(span);
      host.appendChild(btn);
    });
  }

  function renderNotes() {
    var list = $('#notesList');
    if (!list) return;
    var q = state.ui.noteQuery.trim().toLowerCase();
    var notes = state.notes.slice().sort(function (a, b) { return b.updatedAt - a.updatedAt; });
    if (q) {
      notes = notes.filter(function (n) {
        return ((n.title || '') + ' ' + (n.body || '') + ' ' + (n.tags || []).join(' ')).toLowerCase().indexOf(q) !== -1;
      });
    }
    list.innerHTML = '';
    if (!notes.length) {
      list.innerHTML = '<div class="notes-empty"><b>没有笔记</b><span>新建一篇，或者换个关键词。</span></div>';
    }
    notes.forEach(function (n) {
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'note-item' + (n.id === state.ui.noteId ? ' is-active' : '');
      item.setAttribute('data-id', n.id);
      var b = document.createElement('b'); b.textContent = n.title || '无标题笔记';
      var s = document.createElement('span');
      s.textContent = (n.body || '').replace(/\s+/g, ' ').slice(0, 54) || '空白笔记';
      var t = document.createElement('time'); t.textContent = timeAgo(n.updatedAt || n.createdAt);
      item.appendChild(b); item.appendChild(s); item.appendChild(t);
      list.appendChild(item);
    });
    var current = null;
    for (var ni = 0; ni < notes.length; ni++) {
      if (notes[ni].id === state.ui.noteId) current = notes[ni];
    }
    if (!current) current = notes[0] || null;
    if (current) state.ui.noteId = current.id;
    var title = $('#noteTitle');
    var body = $('#noteBody');
    var tags = $('#noteTags');
    if (!current) {
      if (title) title.value = '';
      if (body) body.value = '';
      if (tags) tags.value = '';
      if ($('#noteSavedAt')) $('#noteSavedAt').textContent = '—';
      return;
    }
    if (title && document.activeElement !== title) title.value = current.title || '';
    if (body && document.activeElement !== body) body.value = current.body || '';
    if (tags && document.activeElement !== tags) tags.value = (current.tags || []).join(', ');
    if ($('#noteSavedAt')) $('#noteSavedAt').textContent = '更新于 ' + timeAgo(current.updatedAt || current.createdAt);
    if ($('#noteWords')) $('#noteWords').textContent = (current.body || '').replace(/\s+/g, '').length + ' 字';
    if ($('#navNoteCount')) $('#navNoteCount').textContent = state.notes.length;
    renderRailNotes();
  }

  /* ---------------- render: calendar page ---------------- */
  function renderCalendar() {
    var isWeek = state.ui.calView === 'week';
    if ($('#monthView')) $('#monthView').hidden = isWeek;
    if ($('#weekView')) $('#weekView').hidden = !isWeek;
    $$('#calViewSeg button').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-cal-view') === state.ui.calView);
    });
    if (isWeek) renderWeek(); else renderMonth();
    renderAgenda();
  }

  function renderMonth() {
    var base = new Date(state.ui.calMonth);
    var y = base.getFullYear();
    var m = base.getMonth();
    $('#calMonthLabel').textContent = y + ' 年 ' + (m + 1) + ' 月';
    var monthCount = 0;
    var daysInMonth = new Date(y, m + 1, 0).getDate();
    for (var day = 1; day <= daysInMonth; day++) {
      monthCount += eventsOn(ymd(new Date(y, m, day))).length;
    }
    $('#calMonthMeta').textContent = '本月 ' + monthCount + ' 个日程';
    var grid = $('#calGrid');
    grid.innerHTML = '';
    var first = new Date(y, m, 1);
    var offset = (first.getDay() + 6) % 7;
    var daysInMonth = new Date(y, m + 1, 0).getDate();
    var cells = Math.ceil((offset + daysInMonth) / 7) * 7;
    var start = new Date(y, m, 1 - offset);
    var today = dayKey(0);
    for (var i = 0; i < cells; i++) {
      var d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      var key = ymd(d);
      var cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cal-day';
      cell.setAttribute('data-date', key);
      if (d.getMonth() !== m) cell.classList.add('is-out');
      if (key === today) cell.classList.add('is-today');
      if (key === state.ui.calSelected) cell.classList.add('is-selected');
      var num = document.createElement('span');
      num.className = 'cal-num';
      num.textContent = d.getDate();
      cell.appendChild(num);
      var evs = eventsOn(key);
      if (evs.length) cell.classList.add('has-ev');
      evs.slice(0, 2).forEach(function (ev) {
        var cat = EVENT_CATS[ev.cat] || EVENT_CATS.work;
        var chip = document.createElement('span');
        chip.className = 'cal-event';
        chip.setAttribute('data-event', ev.id);
        chip.style.setProperty('--mc', cat.color);
        var dot = document.createElement('i');
        chip.appendChild(dot);
        chip.appendChild(document.createTextNode(ev.title));
        cell.appendChild(chip);
      });
      if (evs.length > 2) {
        var more = document.createElement('span');
        more.className = 'cal-more';
        more.textContent = '+' + (evs.length - 2);
        cell.appendChild(more);
      }
      grid.appendChild(cell);
    }
  }

  function renderWeek() {
    var ws = weekStartKey(state.ui.calSelected || dayKey(0));
    state.ui.calWeekStart = ws;
    var days = [];
    for (var i = 0; i < 7; i++) days.push(addDaysKey(ws, i));
    var we = days[6];
    $('#calMonthLabel').textContent = fmtDayCN(ws) + ' – ' + fmtDayCN(we);
    var weekCount = 0;
    days.forEach(function (k) { weekCount += eventsOn(k).length; });
    $('#calMonthMeta').textContent = '本周 ' + weekCount + ' 个日程';

    var head = $('#weekHead');
    head.innerHTML = '';
    var corner = document.createElement('div');
    corner.className = 'wk-time';
    head.appendChild(corner);
    var today = dayKey(0);
    days.forEach(function (key) {
      var d = parseDayKey(key);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'wk-day' + (key === today ? ' is-today' : '');
      btn.setAttribute('data-date', key);
      var b = document.createElement('b');
      b.textContent = '周' + WEEKDAYS_CN[d.getDay()];
      var s = document.createElement('span');
      s.textContent = (d.getMonth() + 1) + '/' + d.getDate();
      btn.appendChild(b);
      btn.appendChild(s);
      head.appendChild(btn);
    });

    var canvas = $('#weekCanvas');
    canvas.innerHTML = '';
    var gutter = document.createElement('div');
    gutter.className = 'week-gutter';
    for (var h = 7; h <= 23; h++) {
      var lab = document.createElement('span');
      lab.className = 'week-hour-label';
      lab.style.top = ((h - 7) * 60) + 'px';
      lab.textContent = (h < 10 ? '0' : '') + h + ':00';
      gutter.appendChild(lab);
    }
    canvas.appendChild(gutter);

    var canvasWidth = canvas.clientWidth || 760;
    var colW = (canvasWidth - 54) / 7;
    days.forEach(function (key, idx) {
      var col = document.createElement('div');
      col.className = 'week-col' + (idx >= 5 ? ' is-weekend' : '');
      col.style.left = (54 + idx * colW) + 'px';
      col.style.width = colW + 'px';
      col.setAttribute('data-date', key);
      eventsOn(key).forEach(function (ev) {
        var startMin = Math.max(420, Math.min(23 * 60, toMin(ev.start)));
        var endMin = Math.max(startMin + 15, Math.min(23 * 60, toMin(ev.end)));
        var item = document.createElement('div');
        item.className = 'week-event' + (ev.repeat && ev.repeat !== 'none' ? ' is-recurring' : '');
        item.setAttribute('data-id', ev.id);
        item.setAttribute('data-date', key);
        item.style.top = (startMin - 420) + 'px';
        item.style.height = Math.max(24, endMin - startMin) + 'px';
        item.style.left = '2px';
        item.style.right = '2px';
        var cat = EVENT_CATS[ev.cat] || EVENT_CATS.work;
        item.style.setProperty('--mc', cat.color);
        var b = document.createElement('b');
        b.textContent = ev.title;
        var s = document.createElement('span');
        s.textContent = ev.start + ' – ' + ev.end;
        item.appendChild(b);
        item.appendChild(s);
        col.appendChild(item);
      });
      canvas.appendChild(col);
    });

    var now = new Date();
    if (ws <= today && today <= we) {
      var nowMin = now.getHours() * 60 + now.getMinutes();
      if (nowMin >= 420 && nowMin <= 1380) {
        var line = document.createElement('div');
        line.className = 'week-now';
        line.style.top = (nowMin - 420) + 'px';
        canvas.appendChild(line);
      }
    }
  }

  function renderAgenda() {
    var key = state.ui.calSelected || dayKey(0);
    var d = parseDayKey(key);
    var evs = eventsOn(key);
    $('#agendaDate').textContent = fmtDayCN(key);
    $('#agendaWeek').textContent = '星期' + WEEKDAYS_CN[d.getDay()] + ' · ' + evs.length + ' 个日程';
    var host = $('#agendaList');
    host.innerHTML = '';
    if (!evs.length) {
      host.innerHTML = '<div class="agenda-empty"><b>这一天还是空的</b><span>给重要的事留一段时间。</span></div>';
      return;
    }
    evs.forEach(function (ev) {
      var cat = EVENT_CATS[ev.cat] || EVENT_CATS.work;
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'agenda-item';
      item.setAttribute('data-id', ev.id);
      item.innerHTML = '<span class="agenda-time"><b></b><span></span></span><span class="agenda-copy"><b></b><span></span></span>';
      item.querySelector('.agenda-time b').textContent = ev.start;
      item.querySelector('.agenda-time span').textContent = ev.end;
      item.querySelector('.agenda-copy b').textContent = ev.title;
      item.querySelector('.agenda-copy span').textContent = cat.label + (ev.location ? ' · ' + ev.location : '');
      item.style.setProperty('--mc', cat.color);
      host.appendChild(item);
    });
  }

  /* ---------------- render: todos page ---------------- */
  function renderTodos() {
    var today = dayKey(0);
    var ws = startOfWeek(Date.now());
    var weekEnd = ws + 7 * DAY;
    var filter = state.ui.todoFilter;
    $$('#todoFilters .todo-filter').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-tfilter') === filter);
    });
    var todayAll = state.tasks.filter(function (t) { return t.due === today; });
    var todayDone = todayAll.filter(function (t) { return t.done; }).length;
    var doneWeek = doneThisWeek();
    $('#todoSub').textContent = '今天 ' + (todayAll.length - todayDone) + ' 件未完成 · 本周已放下 ' + doneWeek + ' 件。';
    var pct = todayAll.length ? Math.round((todayDone / todayAll.length) * 100) : 0;
    $('#todoProgressBar').style.width = pct + '%';
    $('#todoProgressText').textContent = todayDone + ' / ' + todayAll.length;
    if ($('#sideDone')) $('#sideDone').textContent = doneWeek;
    if ($('#sideOpen')) $('#sideOpen').textContent = openTasks().length;
    if ($('#todoWeekMeta')) $('#todoWeekMeta').textContent = '已完成 ' + doneWeek + ' 件';
    renderWeekBars($('#todoWeekBars'));

    var list = state.tasks.slice();
    if (filter === 'today') {
      list = list.filter(function (t) { return t.due === today || (!t.done && t.due < today); });
    } else if (filter === 'week') {
      list = list.filter(function (t) {
        var ts = parseDayKey(t.due).getTime();
        return ts >= ws && ts < weekEnd;
      });
    } else if (filter === 'done') {
      list = list.filter(function (t) { return t.done; });
    }
    list.sort(filter === 'done'
      ? function (a, b) { return (b.completedAt || 0) - (a.completedAt || 0); }
      : taskSort);

    var host = $('#todoList');
    host.innerHTML = '';
    if (!list.length) {
      host.innerHTML = '<div class="task-empty">这一栏是空的。<br>要不要先放一件小事进来？</div>';
      return;
    }
    list.forEach(function (t) {
      var row = document.createElement('div');
      row.className = 'task-row' + (t.done ? ' is-done' : '');
      row.setAttribute('data-id', t.id);
      row.innerHTML = '<button class="check" type="button" aria-label="切换完成"><svg class="ic"><use href="#i-check"></use></svg></button>' +
        '<div class="task-body"><div class="task-title"></div><div class="task-meta"><i class="pri" data-p=""></i><span class="due"></span><span class="sep"></span><span class="list"></span><span class="task-sub"></span><span class="task-repeat"></span><span class="task-remind"></span></div></div>' +
        '<button class="task-del" type="button" aria-label="删除待办"><svg class="ic"><use href="#i-x"></use></svg></button>';
      if (t.done) row.querySelector('.check').classList.add('is-on');
      row.querySelector('.task-title').textContent = t.title;
      row.querySelector('.pri').setAttribute('data-p', t.priority);
      row.querySelector('.due').textContent = dueLabel(t);
      var reminder = row.querySelector('.task-remind');
      reminder.textContent = taskReminderText(t);
      reminder.classList.toggle('is-due', !!t.remindAt && Number(t.remindAt) <= Date.now() && !t.done);
      row.querySelector('.list').textContent = t.list + ' · ' + ({ high: '高优先', med: '中优先', low: '低优先' }[t.priority] || '中优先');
      var subs = t.subtasks || [];
      if (subs.length) {
        var sdone = subs.filter(function (s) { return s.done; }).length;
        row.querySelector('.task-sub').textContent = '子任务 ' + sdone + '/' + subs.length;
      }
      if (t.repeat && t.repeat !== 'none') {
        var repLabel = { daily: '每天', weekdays: '工作日', weekly: '每周', monthly: '每月' };
        row.querySelector('.task-repeat').textContent = repLabel[t.repeat] || '重复';
      }
      host.appendChild(row);
    });
  }

  /* ---------------- render: recents ---------------- */
  function renderRecents() {
    var strip = $('#recentStrip');
    if (!strip) return;
    var tpl = $('#tpl-recent');
    strip.innerHTML = '';
    var list = state.bookmarks.slice().sort(function (a, b) { return b.lastVisited - a.lastVisited; }).slice(0, 5);
    list.forEach(function (b) {
      var node = tpl.content.firstElementChild.cloneNode(true);
      setMono(node.querySelector('.mono'), b);
      node.querySelector('.recent-title').textContent = b.title;
      node.querySelector('.recent-host').textContent = hostOf(b.url) + ' · ' + timeAgo(b.lastVisited);
      node.setAttribute('data-id', b.id);
      strip.appendChild(node);
    });
  }

  /* ---------------- render: library ---------------- */
  function tagNodes(container, tags) {
    container.innerHTML = '';
    (tags || []).slice(0, 3).forEach(function (t) {
      var chip = document.createElement('span');
      chip.className = 'tag';
      chip.textContent = t;
      container.appendChild(chip);
    });
  }

  function paintCard(card, b, index) {
    card.setAttribute('data-id', b.id);
    card.classList.toggle('is-read', !!b.read);
    card.classList.toggle('is-archived', !!b.archived);
    card.style.animationDelay = Math.min(index * 22, 220) + 'ms';
    if (state.ui.query.trim()) card.style.animation = 'none';
    var mono = card.querySelector('.mono');
    setMono(mono, b);
    card.querySelector('.card-title').textContent = b.title;
    card.querySelector('.card-host').textContent = hostOf(b.url);
    tagNodes(card.querySelector('.tag-list'), b.tags);
    card.querySelector('.card-time').textContent = state.prefs.showTime ? timeAgo(b.lastVisited) : '';
    setStar(card.querySelector('.card-star'), b.starred);
  }

  function paintRow(row, b, index) {
    row.setAttribute('data-id', b.id);
    row.classList.toggle('is-read', !!b.read);
    row.classList.toggle('is-archived', !!b.archived);
    row.style.animationDelay = Math.min(index * 16, 180) + 'ms';
    if (state.ui.query.trim()) row.style.animation = 'none';
    setMono(row.querySelector('.mono'), b);
    row.querySelector('.row-title').textContent = b.title;
    row.querySelector('.row-host').textContent = hostOf(b.url);
    tagNodes(row.querySelector('.row-tags'), b.tags);
    row.querySelector('.row-time').textContent = state.prefs.showTime ? timeAgo(b.lastVisited) : '';
    setStar(row.querySelector('.row-star'), b.starred);
  }

  function renderLibrary() {
    var label = filterLabel();
    var list = currentList();
    var title = $('#libraryTitle');
    if (title.firstChild && title.firstChild.nodeType === 3) {
      title.firstChild.nodeValue = label + ' ';
    } else {
      title.insertBefore(document.createTextNode(label + ' '), title.firstChild);
    }
    $('#libraryCount').textContent = list.length;
    var host = $('#library');
    host.innerHTML = '';
    var recentSec = $('#recentSection');
    if (recentSec) recentSec.style.display = state.ui.query.trim() ? 'none' : '';
    if (!list.length) {
      var empty = document.createElement('div');
      empty.className = 'empty';
      var hasQuery = state.ui.query.trim().length > 0;
      empty.innerHTML = hasQuery
        ? '<div class="empty-seal">无</div><h3>没有找到匹配的书签</h3><p>试试更短的关键词，或者清空搜索看看整个书房。</p><button class="btn btn-sm" type="button" data-action="clear-search" style="margin-top:8px">清空搜索</button>'
        : '<div class="empty-seal">空</div><h3>这里还没有书签</h3><p>换一个书架看看，或者把此刻正在读的页面收藏进来。</p><button class="btn btn-sm btn-primary" type="button" data-action="new" style="margin-top:8px"><svg class="ic"><use href="#i-plus"></use></svg>新增书签</button>';
      host.appendChild(empty);
      return;
    }
    if (state.ui.view === 'grid') {
      var grid = document.createElement('div');
      grid.className = 'grid';
      var tpl = $('#tpl-card');
      list.forEach(function (b, i) {
        var card = tpl.content.firstElementChild.cloneNode(true);
        paintCard(card, b, i);
        grid.appendChild(card);
      });
      if (!state.ui.query.trim()) {
        var add = document.createElement('button');
        add.type = 'button';
        add.className = 'card-add';
        add.setAttribute('data-action', 'new');
        add.innerHTML = '<span class="plus-ring"><svg class="ic"><use href="#i-plus"></use></svg></span><span>新增书签</span>';
        grid.appendChild(add);
      }
      host.appendChild(grid);
    } else {
      var wrap = document.createElement('div');
      wrap.className = 'list';
      var tplRow = $('#tpl-row');
      list.forEach(function (b, i) {
        var row = tplRow.content.firstElementChild.cloneNode(true);
        paintRow(row, b, i);
        wrap.appendChild(row);
      });
      host.appendChild(wrap);
    }
  }

  function renderStats() {
    if ($('#statBookmarks')) $('#statBookmarks').textContent = state.bookmarks.length;
    if ($('#statTasks')) $('#statTasks').textContent = state.tasks.length;
    if ($('#statEvents')) $('#statEvents').textContent = state.events.length;
    if ($('#statShelves')) $('#statShelves').textContent = state.categories.length;
    if ($('#statTags')) $('#statTags').textContent = countTags();
    if ($('#collectTotal')) $('#collectTotal').textContent = state.bookmarks.length;
  }

  function renderShelfSelects() {
    ['#fShelf', '#defaultShelf', '#inspShelf'].forEach(function (sel) {
      var el = $(sel);
      if (!el) return;
      var current = el.value;
      el.innerHTML = '';
      state.categories.forEach(function (c) {
        var opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        el.appendChild(opt);
      });
      if (sel === '#defaultShelf') {
        el.value = state.prefs.defaultShelf;
      } else if (current && catById(current)) {
        el.value = current;
      }
    });
    if (state.selectedId) {
      var b = bookById(state.selectedId);
      if (b) $('#inspShelf').value = b.categoryId;
    }
  }

  /* ---------------- render: sync ---------------- */
  function syncStatusText() {
    var s = state.sync;
    if (!s.connected) return { state: s.status === 'error' ? 'error' : 'idle', text: '未连接', meta: '尚未完成首次同步 · 点击配置' };
    return { state: 'ok', text: '已同步', meta: timeAgo(s.lastSync) + ' · ' + davLabel() };
  }
  function renderSyncChip() {
    if (state.sync.status === 'syncing') {
      var chip = $('#syncCardStatus');
      chip.textContent = '同步中';
      chip.setAttribute('data-state', 'syncing');
      $('#syncCardMeta').textContent = '正在与云端校验…';
      return;
    }
    var st = syncStatusText();
    var el = $('#syncCardStatus');
    el.textContent = st.text;
    el.setAttribute('data-state', st.state === 'ok' ? 'ok' : st.state);
    $('#syncCardMeta').textContent = st.meta;
  }
  function renderSyncPane() {
    var s = state.sync;
    var hero = $('#syncHero');
    if (s.status === 'syncing') {
      hero.setAttribute('data-state', 'idle');
      $('#syncStateText').textContent = '正在同步…';
      $('#syncStateMeta').textContent = '正在比较本地与云端数据';
    } else if (!s.connected) {
      hero.setAttribute('data-state', s.status === 'error' ? 'error' : 'idle');
      $('#syncStateText').textContent = s.status === 'error' ? '连接失败' : '未连接';
      $('#syncStateMeta').textContent = s.status === 'error' ? '请检查地址与凭据后重试' : '配置 WebDAV 后测试连接';
    } else {
      hero.setAttribute('data-state', 'ok');
      $('#syncStateText').textContent = '连接正常';
      $('#syncStateMeta').textContent = davLabel() + ' · 上次同步 ' + timeAgo(s.lastSync) + ' · ' + s.size;
    }
    $('#davUrl').value = s.url;
    $('#davUser').value = s.user;
    $('#davPass').value = s.pass;
    $('#davDir').value = s.dir;
    $('#autoSync').checked = !!s.auto;
    $('#syncInterval').value = s.interval;
    $$('#syncRules .rule').forEach(function (r) {
      var input = r.querySelector('input');
      r.classList.toggle('is-on', input.value === s.mode);
    });
    renderLogs();
  }
  function renderLogs() {
    var host = $('#syncLog');
    host.innerHTML = '';
    if (!state.sync.logs.length) {
      var e = document.createElement('div');
      e.className = 'log-empty';
      e.textContent = '还没有同步记录';
      host.appendChild(e);
      return;
    }
    var tpl = $('#tpl-log');
    state.sync.logs.slice(0, 6).forEach(function (log) {
      var row = tpl.content.firstElementChild.cloneNode(true);
      var use = row.querySelector('use');
      use.setAttribute('href', log.pending ? '#i-refresh' : log.ok ? '#i-check' : '#i-x');
      if (log.pending) {
        row.classList.add('is-pending');
        row.querySelector('.ic').classList.add('spin');
      }
      if (!log.ok && !log.pending) row.classList.add('is-error');
      row.querySelector('.msg').textContent = log.msg;
      row.querySelector('time').textContent = timeShort(log.t);
      host.appendChild(row);
    });
  }
  function addLog(msg, ok, pending) {
    state.sync.logs.unshift({ t: Date.now(), msg: msg, ok: ok !== false, pending: !!pending });
    state.sync.logs = state.sync.logs.slice(0, 20);
    renderLogs();
    persist();
  }

  /* ---------------- render: all ---------------- */
  function renderAll() {
    renderNav();
    renderProfile();
    applyStartPagePref();
    applyDashboardLayout();
    renderRecents();
    renderLibrary();
    renderStats();
    renderShelfSelects();
    renderSyncChip();
    renderSyncPane();
    renderDashboard();
    renderSearchPage();
    renderCalendar();
    renderTodos();
    renderNotes();
  }

  /* ---------------- skins ---------------- */
  var SKINS = {
    midnight: { theme: 'dark', accent: 'indigo', label: '午夜玻璃' },
    mist: { theme: 'light', accent: 'indigo', label: '晨雾' },
    sage: { theme: 'light', accent: 'jade', label: '鼠尾草' },
    ember: { theme: 'dark', accent: 'ochre', label: '余烬' }
  };
  function applyTheme() {
    var key = SKINS[state.prefs.skin] ? state.prefs.skin : 'midnight';
    var skin = SKINS[key];
    document.documentElement.setAttribute('data-skin', key);
    document.documentElement.setAttribute('data-theme', skin.theme);
    document.documentElement.setAttribute('data-accent', state.prefs.accent);
    $$('#skinTiles .skin-tile').forEach(function (tile) {
      tile.classList.toggle('is-active', tile.getAttribute('data-skin') === key);
    });
    $$('#railSkins [data-skin]').forEach(function (dot) {
      dot.classList.toggle('is-active', dot.getAttribute('data-skin') === key);
    });
    $$('#accentSwatches .swatch').forEach(function (sw) {
      sw.classList.toggle('is-active', sw.getAttribute('data-swatch') === state.prefs.accent);
    });
    var use = $('#themeToggle use');
    if (use) use.setAttribute('href', '#i-palette');
  }
  function setSkin(key) {
    if (!SKINS[key]) return;
    state.prefs.skin = key;
    state.prefs.accent = SKINS[key].accent;
    applyTheme();
    persist();
    toast('风格已切换为「' + SKINS[key].label + '」');
  }

  /* ---------------- background + icon size ---------------- */
  var BG_PRESETS = {
    mist: 'radial-gradient(120% 120% at 10% 0%, #a9c7ff 0%, #e2ebfa 48%, #cfdff4 100%)',
    dawn: 'linear-gradient(135deg, #f3c3b3 0%, #e7edf8 55%, #cdd9ef 100%)',
    mint: 'linear-gradient(135deg, #a9e3cf 0%, #e2eef8 55%, #cfe0f2 100%)',
    sand: 'linear-gradient(135deg, #efd4a8 0%, #eef0f6 60%, #d3dfef 100%)',
    dusk: 'linear-gradient(135deg, #2d3552 0%, #4b5b86 52%, #8b9ac4 100%)'
  };
  var BG_TONES = { mist: 'light', dawn: 'light', mint: 'light', sand: 'light', dusk: 'dark' };
  function toneFromCanvas(canvas) {
    try {
      var ctx = canvas.getContext('2d');
      var data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      var sum = 0;
      var n = 0;
      for (var i = 0; i < data.length; i += 64) {
        sum += (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
        n++;
      }
      return n && sum / n < 0.58 ? 'dark' : 'light';
    } catch (e) { return 'light'; }
  }
  function detectToneFromUrl(url, cb) {
    var img = new Image();
    img.onload = function () {
      var scale = Math.min(1, 160 / Math.max(img.width, img.height));
      var c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.width * scale));
      c.height = Math.max(1, Math.round(img.height * scale));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      cb(toneFromCanvas(c));
    };
    img.onerror = function () { cb('light'); };
    img.src = url;
  }
  function bgState() {
    if (!state.prefs.background || typeof state.prefs.background !== 'object') {
      state.prefs.background = { type: 'none', value: '', blur: 0, dim: 24 };
    }
    return state.prefs.background;
  }
  function applyBackground() {
    var bg = bgState();
    var layer = $('#bgLayer');
    if (!layer) return;
    var has = bg.type === 'image' || bg.type === 'preset';
    document.body.classList.toggle('has-bg', has);
    if (bg.type === 'image') {
      layer.style.backgroundImage = 'url("' + bg.value + '")';
    } else if (bg.type === 'preset') {
      layer.style.backgroundImage = BG_PRESETS[bg.value] || '';
    } else {
      layer.style.backgroundImage = 'none';
    }
    document.body.style.setProperty('--bg-blur', (bg.blur || 0) + 'px');
    document.body.style.setProperty('--bg-dim', ((bg.dim == null ? 30 : bg.dim) / 100).toFixed(2));
    document.body.setAttribute('data-bg-tone', has ? (bg.tone || 'light') : 'light');
    var blur = $('#bgBlur');
    var dim = $('#bgDim');
    if (blur) { blur.value = bg.blur || 0; }
    if (dim) { dim.value = bg.dim == null ? 24 : bg.dim; }
    if ($('#bgBlurVal')) $('#bgBlurVal').textContent = bg.blur || 0;
    if ($('#bgDimVal')) $('#bgDimVal').textContent = bg.dim == null ? 24 : bg.dim;
    $$('#bgPresets .bg-swatch').forEach(function (sw) {
      sw.classList.toggle('is-active', bg.type === 'preset' && sw.getAttribute('data-bg') === bg.value);
    });
  }
  function usePreset(id) {
    var bg = bgState();
    state.prefs.background = { type: 'preset', value: id, tone: BG_TONES[id] || 'light', blur: bg.blur || 0, dim: bg.dim == null ? 30 : bg.dim };
    persist();
    applyBackground();
    toast('背景已切换');
  }
  function clearBackground() {
    var bg = bgState();
    state.prefs.background = { type: 'none', value: '', blur: bg.blur || 0, dim: bg.dim == null ? 30 : bg.dim };
    persist();
    applyBackground();
    toast('背景已移除');
  }
  function setBackgroundFromFile(file) {
    if (!file || !/^image\//.test(file.type || '')) { toast('请选择图片文件', 'warn'); return; }
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var max = 2400;
        var scale = Math.min(1, max / Math.max(img.width, img.height));
        var w = Math.max(1, Math.round(img.width * scale));
        var h = Math.max(1, Math.round(img.height * scale));
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        var data = canvas.toDataURL('image/jpeg', 0.85);
        var bg = bgState();
        var prev = state.prefs.background;
        var tone = toneFromCanvas(canvas);
        state.prefs.background = { type: 'image', value: data, tone: tone, blur: bg.blur || 0, dim: bg.dim == null ? 30 : bg.dim };
        if (!persist()) {
          state.prefs.background = prev;
          toast('图片太大，本地存储失败，换一张小一点的', 'error');
          return;
        }
        applyBackground();
        toast('背景已更新');
      };
      img.onerror = function () { toast('图片读取失败', 'error'); };
      img.src = reader.result;
    };
    reader.onerror = function () { toast('文件读取失败', 'error'); };
    reader.readAsDataURL(file);
  }
  function applyIconSize() {
    var size = state.prefs.iconSize || 'md';
    document.documentElement.setAttribute('data-icon', size);
    $$('#iconSizeSeg button').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-icon-size') === size);
    });
  }

  /* ---------------- overlays ---------------- */
  function lockScroll() {
    document.body.style.overflow = 'hidden';
  }
  function unlockScroll() {
    if (!document.querySelector('.overlay.is-open') && !$('#inspector').classList.contains('is-open')) {
      document.body.style.overflow = '';
    }
  }
  function openOverlay(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.add('is-open');
    lockScroll();
  }
  function closeOverlay(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('is-open');
    unlockScroll();
  }
  function closeTopLayer() {
    var order = ['confirmOverlay', 'paletteOverlay', 'collectOverlay', 'editorOverlay', 'shelfOverlay', 'settingsOverlay'];
    for (var i = 0; i < order.length; i++) {
      var el = document.getElementById(order[i]);
      if (el && el.classList.contains('is-open')) { closeOverlay(order[i]); return true; }
    }
    if ($('#inspector').classList.contains('is-open')) { closeInspector(); return true; }
    return false;
  }

  /* ---------------- inspector ---------------- */
  function openInspector(id) {
    var b = bookById(id);
    if (!b) return;
    state.selectedId = id;
    fillInspector(b);
    $('#inspector').classList.add('is-open');
    $('#inspector').setAttribute('aria-hidden', 'false');
    $('#drawerScrim').classList.add('is-open');
    lockScroll();
  }
  function closeInspector() {
    $('#inspector').classList.remove('is-open');
    $('#inspector').setAttribute('aria-hidden', 'true');
    $('#drawerScrim').classList.remove('is-open');
    unlockScroll();
  }
  function readingMinutes(text) {
    var s = String(text || '').trim();
    if (!s) return 0;
    var cn = (s.match(/[\u4e00-\u9fa5]/g) || []).length;
    var en = (s.replace(/[\u4e00-\u9fa5]/g, ' ').match(/[A-Za-z0-9]+/g) || []).length;
    return Math.max(1, Math.round(cn / 300 + en / 220));
  }
  function readerBookmark() {
    return bookById(state.selectedReaderId || '');
  }
  function renderReader() {
    var b = readerBookmark();
    if (!b) return;
    setMono($('#readerMono'), b);
    $('#readerTitle').textContent = b.title;
    $('#readerHost').textContent = hostOf(b.url);
    $('#readerMeta').innerHTML = '';
    var meta = [
      ['书架', (catById(b.categoryId) || {}).name || '未分类'],
      ['添加', timeAgo(b.createdAt)],
      ['阅读', readingMinutes(b.excerpt || b.note) ? readingMinutes(b.excerpt || b.note) + ' 分钟' : '待摘录'],
      ['状态', b.archived ? '已归档' : (b.read ? '已读' : '未读')]
    ];
    meta.forEach(function (m) {
      var span = document.createElement('span');
      span.innerHTML = '<b></b> · ';
      span.querySelector('b').textContent = m[0];
      span.appendChild(document.createTextNode(m[1]));
      $('#readerMeta').appendChild(span);
    });
    var ex = $('#readerExcerpt');
    if (b.excerpt && b.excerpt.trim()) {
      ex.classList.remove('is-empty');
      ex.textContent = b.excerpt;
    } else {
      ex.classList.add('is-empty');
      ex.textContent = '还没有摘录。打开右侧书签详情，把值得留下的句子贴进去；它会参与搜索，也会留在这里。';
    }
    var note = $('#readerNote');
    if (b.note && b.note.trim()) {
      note.hidden = false;
      note.querySelector('span').textContent = b.note;
    } else {
      note.hidden = true;
    }
    $('#readerToggleRead').textContent = b.read ? '标记未读' : '标记已读';
    $('#readerToggleArchive').textContent = b.archived ? '取消归档' : '归档';
    $('#readerStatus').textContent = b.archived ? '已归档 · 不进入常用书签' : (b.read ? '已读' : '未读');
  }
  function openReader(id) {
    var b = bookById(id);
    if (!b) return;
    if (state.selectedId === id && $('#inspExcerpt')) {
      b.excerpt = $('#inspExcerpt').value;
      b.updatedAt = Date.now();
      persist();
    }
    state.selectedReaderId = id;
    closeInspector();
    renderReader();
    openOverlay('readerOverlay');
  }
  function toggleBookmarkRead(id) {
    var b = bookById(id);
    if (!b) return;
    b.read = !b.read;
    b.readAt = b.read ? Date.now() : null;
    b.updatedAt = Date.now();
    persist();
    renderAll();
    if ($('#readerOverlay').classList.contains('is-open')) renderReader();
    if (state.selectedId === id) fillInspector(b);
    toast(b.read ? '已标记为读完' : '已放回稍后读');
  }
  function toggleBookmarkArchive(id) {
    var b = bookById(id);
    if (!b) return;
    b.archived = !b.archived;
    b.archivedAt = b.archived ? Date.now() : null;
    b.updatedAt = Date.now();
    persist();
    closeInspector();
    renderAll();
    if ($('#readerOverlay').classList.contains('is-open')) renderReader();
    toast(b.archived ? '已归档，可在「归档」里找到' : '已取消归档');
  }

  function fillInspector(b) {
    setMono($('#inspMono'), b);
    $('#inspTitle').textContent = b.title;
    $('#inspUrl').textContent = b.url;
    setStar($('#inspStar'), b.starred);
    var shelf = $('#inspShelf');
    shelf.innerHTML = '';
    state.categories.forEach(function (c) {
      var o = document.createElement('option');
      o.value = c.id;
      o.textContent = c.name;
      shelf.appendChild(o);
    });
    shelf.value = b.categoryId;
    renderInspTags(b);
    $('#inspNote').value = b.note || '';
    $('#inspExcerpt').value = b.excerpt || '';
    $('#inspReadState').textContent = b.archived ? '已归档' : (b.read ? '已读' : '未读');
    var archiveBtn = $('#inspArchive');
    if (archiveBtn) {
      archiveBtn.classList.toggle('is-on', !!b.archived);
      archiveBtn.title = b.archived ? '取消归档' : '归档书签';
    }
    $('#inspCreated').textContent = fullDate(b.createdAt);
    $('#inspVisited').textContent = timeAgo(b.lastVisited || b.createdAt);
    $('#inspVisits').textContent = (b.visits || 0) + ' 次';
    $('#inspSource').textContent = b.source === 'chrome' ? '浏览器收藏' : '手动收藏';
  }
  function renderInspTags(b) {
    var editor = $('#inspTagEditor');
    var input = $('#inspTagInput');
    $$('.tag', editor).forEach(function (n) { n.remove(); });
    (b.tags || []).forEach(function (t) {
      var chip = $('#tpl-tag-edit').content.firstElementChild.cloneNode(true);
      chip.querySelector('.txt').textContent = t;
      chip.querySelector('button').addEventListener('click', function () {
        b.tags = b.tags.filter(function (x) { return x !== t; });
        b.updatedAt = Date.now();
        renderInspTags(b);
        persist();
        renderLibrary();
        toast('已移除标签「' + t + '」');
      });
      editor.insertBefore(chip, input);
    });
  }
  function addInspTag() {
    var b = bookById(state.selectedId);
    if (!b) return;
    var input = $('#inspTagInput');
    var v = input.value.trim().replace(/^#/, '');
    if (!v) return;
    if (b.tags.indexOf(v) !== -1) { input.value = ''; return; }
    if (b.tags.length >= 6) { toast('标签最多 6 个', 'warn'); return; }
    b.tags.push(v);
    b.updatedAt = Date.now();
    input.value = '';
    renderInspTags(b);
    persist();
    renderLibrary();
  }

  /* ---------------- editor ---------------- */
  function openEditor(id) {
    state.editingId = id || null;
    var b = id ? bookById(id) : null;
    $('#editorHeading').textContent = b ? '编辑书签' : '新增书签';
    $('#fUrl').value = b ? b.url : '';
    $('#fTitle').value = b ? b.title : '';
    $('#fShelf').innerHTML = '';
    state.categories.forEach(function (c) {
      var o = document.createElement('option');
      o.value = c.id;
      o.textContent = c.name;
      $('#fShelf').appendChild(o);
    });
    $('#fShelf').value = b ? b.categoryId : (catById(state.prefs.defaultShelf) ? state.prefs.defaultShelf : (state.categories[0] ? state.categories[0].id : ''));
    $('#fTags').value = b ? (b.tags || []).join(', ') : '';
    $('#fNote').value = b ? (b.note || '') : '';
    openOverlay('editorOverlay');
    setTimeout(function () { (b ? $('#fTitle') : $('#fUrl')).focus(); }, 60);
  }
  function parseTags(text) {
    var out = [];
    (text || '').split(/[,，、]/).forEach(function (t) {
      var v = t.trim().replace(/^#/, '');
      if (v && out.indexOf(v) === -1) out.push(v);
    });
    return out.slice(0, 6);
  }
  function saveEditor() {
    var url = normalizeUrl($('#fUrl').value);
    if (!url) { toast('请输入有效的网址，例如 https://example.com', 'warn'); $('#fUrl').focus(); return; }
    var title = $('#fTitle').value.trim() || hostOf(url);
    var shelf = $('#fShelf').value;
    var tags = parseTags($('#fTags').value);
    var note = $('#fNote').value.trim();
    var b = state.editingId ? bookById(state.editingId) : null;
    if (b) {
      b.url = url; b.title = title; b.categoryId = shelf; b.tags = tags; b.note = note; b.updatedAt = Date.now();
      toast('书签已更新');
    } else {
      b = {
        id: uid(), title: title, url: url, categoryId: shelf, tags: tags, note: note,
        starred: false, visits: 0, createdAt: Date.now(), updatedAt: Date.now(),
        lastVisited: Date.now(), source: 'manual'
      };
      state.bookmarks.unshift(b);
      var c = catById(shelf);
      toast('已添加到「' + (c ? c.name : '书架') + '」');
    }
    persist();
    closeOverlay('editorOverlay');
    renderAll();
    if ($('#inspector').classList.contains('is-open') && state.selectedId === b.id) fillInspector(b);
  }

  /* ---------------- shelf ---------------- */
  function openShelf() {
    $('#shelfName').value = '';
    state.shelfColor = 'vermilion';
    $$('#shelfColors .swatch').forEach(function (sw) {
      sw.classList.toggle('is-active', sw.getAttribute('data-color') === 'vermilion');
    });
    openOverlay('shelfOverlay');
    setTimeout(function () { $('#shelfName').focus(); }, 60);
  }
  function createShelf() {
    var name = $('#shelfName').value.trim();
    if (!name) { toast('给书架起个名字吧', 'warn'); $('#shelfName').focus(); return; }
    var c = { id: uid('c'), name: name, color: state.shelfColor };
    state.categories.push(c);
    persist();
    closeOverlay('shelfOverlay');
    renderAll();
    toast('已创建书架「' + name + '」');
  }

  /* ---------------- collect ---------------- */
  function openCollectEntry() {
    if (isExtension() && new URLSearchParams(location.search).get('collect') !== '1') {
      toast('用工具栏的「稚签」按钮，或右键「收藏到稚签」收藏网页', 'warn');
      return;
    }
    openCollect();
  }
  function openCollect() {
    var c = catById(state.prefs.defaultShelf);
    state.collect.catId = c ? c.id : (state.categories[0] ? state.categories[0].id : '');
    renderCollect();
    openOverlay('collectOverlay');
    setTimeout(function () { $('#collectTagInput').focus(); }, 80);
  }
  function renderCollect() {
    var c = state.collect;
    $('#collectTitle').value = c.title;
    $('#collectHost').textContent = c.host;
    var mono = $('#collectMono');
    mono.textContent = (c.title || '稚').trim().charAt(0) || '稚';
    var activeCat = catById(c.catId);
    mono.style.setProperty('--mc', COLOR_VAR[activeCat ? activeCat.color : 'slate']);
    $('#collectTotal').textContent = state.bookmarks.length;
    $('#collectWarn').classList.remove('is-on');
    var host = $('#collectShelves');
    host.innerHTML = '';
    state.categories.forEach(function (cat) {
      var chip = $('#tpl-shelf-chip').content.firstElementChild.cloneNode(true);
      chip.setAttribute('data-cat', cat.id);
      chip.style.setProperty('--mc', COLOR_VAR[cat.color] || COLOR_VAR.slate);
      chip.querySelector('.txt').textContent = cat.name;
      if (cat.id === c.catId) chip.classList.add('is-active');
      host.appendChild(chip);
    });
    renderCollectTags();
  }
  function renderCollectTags() {
    var editor = $('#collectTagEditor');
    var input = $('#collectTagInput');
    $$('.tag', editor).forEach(function (n) { n.remove(); });
    state.collect.tags.forEach(function (t) {
      var chip = $('#tpl-tag-edit').content.firstElementChild.cloneNode(true);
      chip.querySelector('.txt').textContent = t;
      chip.querySelector('button').addEventListener('click', function () {
        state.collect.tags = state.collect.tags.filter(function (x) { return x !== t; });
        renderCollectTags();
      });
      editor.insertBefore(chip, input);
    });
  }
  function saveCollect() {
    var c = state.collect;
    if (!c.catId) { $('#collectWarn').classList.add('is-on'); toast('请先选择一个书架', 'warn'); return; }
    var b = {
      id: uid(), title: $('#collectTitle').value.trim() || hostOf(c.url), url: c.url,
      categoryId: c.catId, tags: c.tags.slice(0, 4), note: $('#collectNote').value.trim(),
      starred: false, visits: 0, createdAt: Date.now(), updatedAt: Date.now(),
      lastVisited: Date.now(), source: 'chrome', read: false, archived: false, excerpt: ''
    };
    state.bookmarks.unshift(b);
    persist();
    closeOverlay('collectOverlay');
    $('#collectNote').value = '';
    renderAll();
    var cat = catById(c.catId);
    toast('已收藏到「' + (cat ? cat.name : '书架') + '」');
    if (document.body.classList.contains('collect-window')) setTimeout(function () { window.close(); }, 520);
  }

  /* ---------------- profile / onboarding ---------------- */
  function openProfile() {
    var p = state.prefs.profile || {};
    state.ui.profileAvatarDraft = p.avatar || '';
    state.ui.profileColorDraft = p.color || 'indigo';
    $('#profileNameInput').value = p.name || 'YG';
    renderProfile();
    openOverlay('profileOverlay');
    setTimeout(function () { $('#profileNameInput').focus(); }, 80);
  }
  function readAvatarFile(file) {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) { toast('请选择 PNG、JPG 或 WebP 图片', 'warn'); return; }
    if (file.size > 5 * 1024 * 1024) { toast('原图请小于 5MB', 'warn'); return; }
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var size = 256;
        var canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        var ctx = canvas.getContext('2d');
        var side = Math.min(img.width, img.height);
        var sx = (img.width - side) / 2, sy = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
        var data = canvas.toDataURL('image/webp', 0.82);
        if (data.indexOf('data:image/webp') !== 0) data = canvas.toDataURL('image/jpeg', 0.86);
        state.ui.profileAvatarDraft = data;
        renderProfile();
      };
      img.onerror = function () { toast('头像读取失败', 'warn'); };
      img.src = String(reader.result || '');
    };
    reader.onerror = function () { toast('头像读取失败', 'warn'); };
    reader.readAsDataURL(file);
  }
  function saveProfile() {
    var name = $('#profileNameInput').value.trim().slice(0, 20) || 'YG';
    state.prefs.profile = {
      name: name,
      avatar: state.ui.profileAvatarDraft || '',
      color: state.ui.profileColorDraft || 'indigo',
      updatedAt: Date.now()
    };
    state.ui.profileAvatarDraft = null;
    persist();
    closeOverlay('profileOverlay');
    renderAll();
    toast('个人资料已保存');
  }
  function onboardInitials() {
    var name = $('#onboardName') ? $('#onboardName').value.trim() : '';
    return Array.from(name || 'YG').slice(0, 2).join('') || '稚';
  }
  function openOnboarding() {
    $('#onboardName').value = state.prefs.profile && state.prefs.profile.name || 'YG';
    $('#onboardAvatar').textContent = onboardInitials();
    $('#onboardAvatar').style.background = COLOR_VAR[state.prefs.profile && state.prefs.profile.color || 'indigo'] || COLOR_VAR.indigo;
    $$('#onboardSkins button').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-onboard-skin') === state.prefs.skin);
    });
    openOverlay('onboardingOverlay');
    setTimeout(function () { $('#onboardName').focus(); }, 80);
  }
  function finishOnboarding(goSync) {
    var name = $('#onboardName').value.trim().slice(0, 20) || 'YG';
    state.prefs.profile = state.prefs.profile || { color: 'indigo', avatar: '' };
    state.prefs.profile.name = name;
    state.prefs.profile.updatedAt = Date.now();
    state.prefs.onboarded = true;
    persist();
    closeOverlay('onboardingOverlay');
    renderAll();
    if (goSync) setTimeout(function () { openSettings('sync'); }, 180);
    else toast('欢迎，' + name);
  }

  /* ---------------- sync code ---------------- */
  function b64url(bytes) {
    var bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function fromB64url(s) {
    s = String(s || '').replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var bin = atob(s);
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  async function deriveSyncKey(pass, salt) {
    var base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: salt, iterations: 120000, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
    );
  }
  async function exportSyncCode(pass) {
    var config = { v: 1, url: state.sync.url, user: state.sync.user, pass: state.sync.pass, dir: state.sync.dir };
    var salt = crypto.getRandomValues(new Uint8Array(16));
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var key = await deriveSyncKey(pass, salt);
    var cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, new TextEncoder().encode(JSON.stringify(config)));
    var packed = new Uint8Array(salt.length + iv.length + cipher.byteLength);
    packed.set(salt, 0); packed.set(iv, salt.length); packed.set(new Uint8Array(cipher), salt.length + iv.length);
    return 'ZQ1.' + b64url(packed);
  }
  async function importSyncCode(code, pass) {
    if (!/^ZQ1\./.test(code)) throw new Error('同步码格式不正确');
    var packed = fromB64url(code.slice(4));
    if (packed.length < 40) throw new Error('同步码内容不完整');
    var salt = packed.slice(0, 16);
    var iv = packed.slice(16, 28);
    var cipher = packed.slice(28);
    var key = await deriveSyncKey(pass, salt);
    var plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, cipher);
    var data = JSON.parse(new TextDecoder().decode(plain));
    if (!/^https?:\/\//i.test(data.url || '')) throw new Error('同步码里的服务器地址无效');
    return data;
  }
  function setSyncCodeMode(mode) {
    $$('#syncCodeTabs button').forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-code-mode') === mode); });
    $$('#syncCodeOverlay [data-code-pane]').forEach(function (p) { p.hidden = p.getAttribute('data-code-pane') !== mode; });
  }
  function openSyncCode(mode) {
    $('#syncCodePass').value = '';
    $('#syncCodeImportPass').value = '';
    $('#syncCodeOutput').value = '';
    $('#syncCodeInput').value = '';
    $('#syncCodeOutputWrap').hidden = true;
    setSyncCodeMode(mode || 'export');
    openOverlay('syncCodeOverlay');
  }

  /* ---------------- settings ---------------- */
  function setPane(name) {
    $$('.settings-nav button').forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-pane') === name); });
    $$('.settings-pane .pane').forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-pane') === name); });
  }
  function openSettings(pane) {
    renderSyncPane();
    applyBackground();
    applyIconSize();
    setPane(pane || 'sync');
    openOverlay('settingsOverlay');
  }
  var persistSync = debounce(persist, 300);

  /* ---------------- WebDAV bridge ---------------- */
  function isExtension() {
    return typeof chrome !== 'undefined' && !!(chrome.runtime && chrome.runtime.id);
  }
  function davConfig() {
    return { url: state.sync.url, user: state.sync.user, pass: state.sync.pass, dir: state.sync.dir };
  }
  function ensureDavPermission() {
    if (!isExtension() || !chrome.permissions) return Promise.resolve(true);
    var origin;
    try { origin = new URL(state.sync.url).origin + '/*'; }
    catch (e) { return Promise.reject(new Error('服务器地址格式不正确')); }
    return chrome.permissions.request({ origins: [origin] });
  }
  function davSend(message) {
    return new Promise(function (resolve, reject) {
      if (!isExtension()) { reject(new Error('当前不是扩展环境')); return; }
      var timer = setTimeout(function () { reject(new Error('WebDAV 请求超时')); }, 60000);
      chrome.runtime.sendMessage(message, function (res) {
        clearTimeout(timer);
        if (chrome.runtime.lastError) { reject(new Error(chrome.runtime.lastError.message)); return; }
        resolve(res);
      });
    });
  }
  function workspacePayload() {
    if (!state.sync.deviceId) state.sync.deviceId = 'dev_' + Math.random().toString(36).slice(2, 10);
    return {
      app: 'zhiqian', schema: 4, deviceId: state.sync.deviceId, updatedAt: Date.now(),
      categories: state.categories, bookmarks: state.bookmarks, tasks: state.tasks,
      events: state.events, notes: state.notes, profile: state.prefs.profile
    };
  }
  function applyWorkspace(data) {
    if (!data) return;
    ['categories', 'bookmarks', 'tasks', 'events', 'notes'].forEach(function (key) {
      if (Array.isArray(data[key])) state[key] = data[key];
    });
    if (!state.notes.length) {
      state.notes = [{ id: 'quick', title: '速记', body: '', tags: ['速记'], createdAt: Date.now(), updatedAt: 0 }];
    }
    if (data.profile && data.profile.name) state.prefs.profile = data.profile;
    if (!noteById(state.ui.noteId)) state.ui.noteId = state.notes[0].id;
    persist();
    renderAll();
  }
  function syncErrorText(err) {
    var msg = (err && err.message) || String(err);
    if (/401|unauthor/i.test(msg)) return '用户名或应用密码不正确';
    if (/403|forbidden/i.test(msg)) return '服务器拒绝访问，检查应用密码权限';
    if (/Failed to fetch|NetworkError/i.test(msg)) return '网络不可达，检查地址或代理';
    return msg;
  }
  function sizeText(bytes) {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  }
  async function realTestConnection() {
    var btn = $('#testConn');
    state.sync.connected = false;
    state.sync.status = 'syncing';
    $('#syncHero').setAttribute('data-state', 'idle');
    $('#syncStateText').textContent = '正在连接…';
    $('#syncStateMeta').textContent = hostOf(state.sync.url);
    persist();
    try {
      var allowed = await ensureDavPermission();
      if (!allowed) throw new Error('未授予该 WebDAV 域名的访问权限');
      var res = await davSend({ type: 'dav:test', config: davConfig() });
      if (!res || !res.ok) throw new Error((res && res.error) || '连接失败');
      state.sync.connected = true;
      state.sync.status = 'ok';
      state.sync.lastSync = Date.now();
      addLog('连接成功 · ' + hostOf(state.sync.url), true);
      toast('WebDAV 连接成功 · ' + hostOf(state.sync.url));
      setupAutoSync();
    } catch (e) {
      var msg = syncErrorText(e);
      state.sync.connected = false;
      state.sync.status = 'error';
      addLog('连接失败 · ' + msg, false);
      toast('连接失败 · ' + msg, 'warn');
    } finally {
      persist();
      renderSyncPane();
      renderSyncChip();
      btn.disabled = false;
      btn.innerHTML = '<svg class="ic"><use href="#i-refresh"></use></svg>测试连接';
    }
  }
  var autoSyncTimer = null;
  function setupAutoSync() {
    if (autoSyncTimer) { clearInterval(autoSyncTimer); autoSyncTimer = null; }
    if (!isExtension() || !state.sync.auto || !state.sync.connected) return;
    var mins = parseInt(state.sync.interval, 10);
    if (!mins || mins < 1) mins = 15;
    autoSyncTimer = setInterval(function () {
      if (state.sync.auto && state.sync.connected && state.sync.status !== 'syncing') realRunSync(true);
    }, mins * 60000);
  }
  async function realRunSync(silent) {
    if (state.sync.status === 'syncing') return;
    state.sync.status = 'syncing';
    $('#syncHero').setAttribute('data-state', 'idle');
    $('#syncStateText').textContent = '正在同步…';
    $('#syncStateMeta').textContent = '拉取云端 workspace.json，按 id 合并';
    $('#syncCardStatus').textContent = '同步中';
    $('#syncCardStatus').setAttribute('data-state', 'syncing');
    persist();
    try {
      var allowed = await ensureDavPermission();
      if (!allowed) throw new Error('未授予该 WebDAV 域名的访问权限');
      var payload = workspacePayload();
      var res = await davSend({ type: 'dav:sync', config: davConfig(), data: payload });
      if (!res || !res.ok) throw new Error((res && res.error) || '同步失败');
      applyWorkspace(res.merged);
      state.sync.connected = true;
      state.sync.status = 'ok';
      state.sync.lastSync = Date.now();
      state.sync.size = sizeText(res.size);
      addLog('同步完成 · 上传 ' + (res.uploaded || 0) + ' 条 / 下载 ' + (res.downloaded || 0) + ' 条' + (res.conflicts ? ' / 冲突 ' + res.conflicts : ''), true);
      setupAutoSync();
      toast('已同步到 ' + hostOf(state.sync.url));
    } catch (e) {
      var msg = syncErrorText(e);
      state.sync.status = 'error';
      addLog('同步失败 · ' + msg, false);
      toast('同步失败 · ' + msg, 'warn');
    } finally {
      persist();
      renderSyncPane();
      renderSyncChip();
    }
  }

  function testConnection() {
    var url = $('#davUrl').value.trim();
    if (!/^https?:\/\//i.test(url)) { toast('服务器地址需要以 http:// 或 https:// 开头', 'warn'); $('#davUrl').focus(); return; }
    if (!$('#davUser').value.trim()) { toast('请填写 WebDAV 用户名', 'warn'); $('#davUser').focus(); return; }
    if (!$('#davPass').value.trim()) { toast('请填写应用密码', 'warn'); $('#davPass').focus(); return; }
    state.sync.url = url;
    state.sync.user = $('#davUser').value.trim();
    state.sync.pass = $('#davPass').value;
    state.sync.dir = $('#davDir').value.trim() || '/zhiqian/workspace.json';
    persist();
    if (isExtension()) { realTestConnection(); return; }
    var btn = $('#testConn');
    btn.disabled = true;
    btn.innerHTML = '<svg class="ic spin"><use href="#i-refresh"></use></svg>测试中';
    state.sync.status = 'syncing';
    $('#syncHero').setAttribute('data-state', 'idle');
    $('#syncStateText').textContent = '正在连接…';
    $('#syncStateMeta').textContent = url;
    setTimeout(function () {
      var host = hostOf(url);
      state.sync.connected = true;
      state.sync.status = 'ok';
      state.sync.lastSync = Date.now();
      addLog('测试连接成功 · ' + host, true);
      renderSyncPane();
      renderSyncChip();
      btn.disabled = false;
      btn.innerHTML = '<svg class="ic"><use href="#i-refresh"></use></svg>测试连接';
      toast('WebDAV 连接成功 · ' + host);
    }, 950);
  }

  function runSync() {
    if (!state.sync.connected) { toast('请先完成 WebDAV 配置', 'warn'); setPane('sync'); return; }
    if (state.sync.status === 'syncing') return;
    if (isExtension()) { realRunSync(); return; }
    state.sync.status = 'syncing';
    $('#syncHero').setAttribute('data-state', 'idle');
    $('#syncStateText').textContent = '正在同步…';
    $('#syncStateMeta').textContent = '正在比较本地与云端数据';
    $('#syncCardStatus').textContent = '同步中';
    $('#syncCardStatus').setAttribute('data-state', 'syncing');
    addLog('开始同步 · 拉取云端 bookmarks.json', true, true);
    setTimeout(function () {
      addLog('ETag 校验通过 · 合并 35 条 / 冲突 0 条', true);
    }, 700);
    setTimeout(function () {
      state.sync.status = 'ok';
      state.sync.lastSync = Date.now();
      state.sync.size = '36 KB';
      addLog('同步完成 · 上传 1 条 / 下载 0 条', true);
      renderSyncPane();
      renderSyncChip();
      if (!silent) toast('已同步到 ' + davLabel());
    }, 1600);
  }

  /* ---------------- export / import ---------------- */
  function download(filename, content, type) {
    var blob = new Blob([content], { type: type || 'application/octet-stream' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1200);
  }
  function stamp() {
    var d = new Date();
    function p(n) { return n < 10 ? '0' + n : '' + n; }
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate());
  }
  function exportJson() {
    var payload = {
      app: 'zhiqian', version: 2, exportedAt: new Date().toISOString(),
      categories: state.categories, bookmarks: state.bookmarks,
      tasks: state.tasks, events: state.events, notes: state.notes
    };
    download('zhiqian-' + stamp() + '.json', JSON.stringify(payload, null, 2), 'application/json');
    toast('已导出 ' + state.bookmarks.length + ' 枚书签 · ' + state.tasks.length + ' 件待办 · ' + state.events.length + ' 个日程');
  }
  function exportHtml() {
    var lines = [];
    lines.push('<!DOCTYPE NETSCAPE-Bookmark-file-1>');
    lines.push('<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">');
    lines.push('<TITLE>稚签书签</TITLE>');
    lines.push('<H1>稚签书签</H1>');
    lines.push('<DL><p>');
    state.categories.forEach(function (c) {
      var items = state.bookmarks.filter(function (b) { return b.categoryId === c.id; });
      if (!items.length) return;
      lines.push('  <DT><H3>' + esc(c.name) + '</H3>');
      lines.push('  <DL><p>');
      items.forEach(function (b) {
        lines.push('    <DT><A HREF="' + esc(b.url) + '" ADD_DATE="' + Math.floor(b.createdAt / 1000) + '">' + esc(b.title) + '</A>');
      });
      lines.push('  </DL><p>');
    });
    lines.push('</DL><p>');
    download('zhiqian-bookmarks-' + stamp() + '.html', lines.join('\n'), 'text/html');
    toast('已导出浏览器书签格式');
  }
  function mergeImported(bookmarks, categories) {
    var catByName = {};
    state.categories.forEach(function (c) { catByName[c.name] = c.id; });
    var fallback = state.prefs.defaultShelf || (state.categories[0] && state.categories[0].id) || 'inbox';
    (categories || []).forEach(function (c) {
      if (!catByName[c.name]) {
        var nc = { id: uid('c'), name: c.name, color: c.color || 'slate' };
        state.categories.push(nc);
        catByName[c.name] = nc.id;
      }
    });
    var existing = {};
    state.bookmarks.forEach(function (b) { existing[b.url] = 1; });
    var added = 0;
    (bookmarks || []).forEach(function (raw) {
      var url = normalizeUrl(raw.url || '');
      if (!url || existing[url]) return;
      var catId = (raw.categoryId && catById(raw.categoryId)) ? raw.categoryId
        : (raw.categoryName && catByName[raw.categoryName]) ? catByName[raw.categoryName] : fallback;
      state.bookmarks.push({
        id: uid(), title: (raw.title || hostOf(url)).trim(), url: url, categoryId: catId,
        tags: Array.isArray(raw.tags) ? raw.tags.slice(0, 6) : [],
        note: raw.note || '', starred: !!raw.starred, visits: raw.visits || 0,
        createdAt: raw.createdAt || Date.now(), updatedAt: Date.now(),
        lastVisited: raw.lastVisited || Date.now(), source: raw.source || 'manual'
      });
      existing[url] = 1;
      added++;
    });
    persist();
    renderAll();
    toast(added ? '已导入 ' + added + ' 枚书签' : '没有发现新的书签（已去重）', added ? 'ok' : 'warn');
  }
  function importWorkspace(data) {
    var addedT = 0;
    var addedE = 0;
    if (Array.isArray(data.tasks)) {
      var ids = {};
      state.tasks.forEach(function (t) { ids[t.id] = 1; });
      data.tasks.forEach(function (raw) {
        if (!raw || !raw.title || ids[raw.id]) return;
        state.tasks.push({
          id: raw.id || uid('t'), title: raw.title, list: raw.list || '工作',
          priority: raw.priority || 'med', due: raw.due || dayKey(0), done: !!raw.done,
          note: raw.note || '', createdAt: raw.createdAt || Date.now(),
          updatedAt: raw.updatedAt || Date.now(), completedAt: raw.completedAt || null,
          subtasks: Array.isArray(raw.subtasks) ? raw.subtasks : [],
          repeat: raw.repeat || 'none', repeatUntil: raw.repeatUntil || '',
          remindAt: raw.remindAt || 0, reminderSent: !!raw.reminderSent
        });
        ids[raw.id] = 1;
        addedT++;
      });
    }
    if (Array.isArray(data.events)) {
      var eids = {};
      state.events.forEach(function (e) { eids[e.id] = 1; });
      data.events.forEach(function (raw) {
        if (!raw || !raw.title || eids[raw.id]) return;
        state.events.push({
          id: raw.id || uid('e'), title: raw.title, date: raw.date || dayKey(0),
          start: raw.start || '09:00', end: raw.end || '10:00', cat: raw.cat || 'work',
          location: raw.location || '', note: raw.note || '',
          repeat: raw.repeat || 'none', repeatUntil: raw.repeatUntil || ''
        });
        eids[raw.id] = 1;
        addedE++;
      });
    }
    if (Array.isArray(data.notes)) {
      var nids = {};
      state.notes.forEach(function (n) { nids[n.id] = 1; });
      data.notes.forEach(function (raw) {
        if (!raw || !raw.title || nids[raw.id]) return;
        state.notes.push({
          id: raw.id || uid('n'), title: raw.title, body: raw.body || '',
          tags: Array.isArray(raw.tags) ? raw.tags : [],
          createdAt: raw.createdAt || Date.now(), updatedAt: raw.updatedAt || Date.now()
        });
        nids[raw.id] = 1;
      });
    } else if (data.note && typeof data.note.text === 'string') {
      var q = quickNote();
      q.body = data.note.text;
      q.updatedAt = data.note.updatedAt || Date.now();
    }
    persist();
    return { tasks: addedT, events: addedE };
  }

  function handleFile(file) {
    var reader = new FileReader();
    reader.onload = function () {
      var text = String(reader.result || '');
      var trimmed = text.trim();
      if (trimmed.charAt(0) === '{' || trimmed.charAt(0) === '[') {
        try {
          var data = JSON.parse(trimmed);
          var list = Array.isArray(data) ? data : (data.bookmarks || []);
          var cats = Array.isArray(data.categories) ? data.categories : [];
          importWorkspace(data);
          mergeImported(list, cats);
        } catch (e) { toast('JSON 解析失败，请检查文件格式', 'error'); }
        return;
      }
      var re = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
      var out = [];
      var m;
      while ((m = re.exec(text)) !== null) {
        var title = m[2].replace(/<[^>]+>/g, '').trim();
        out.push({ title: title, url: m[1] });
      }
      if (!out.length) { toast('没有在文件中找到书签', 'warn'); return; }
      mergeImported(out, []);
    };
    reader.onerror = function () { toast('读取文件失败', 'error'); };
    reader.readAsText(file);
  }

  /* ---------------- confirm ---------------- */
  function askConfirm(title, sub, okLabel, cb) {
    $('#confirmHeading').textContent = title;
    $('#confirmSub').textContent = sub;
    $('#confirmOk').textContent = okLabel;
    state.confirmCb = cb;
    openOverlay('confirmOverlay');
  }

  /* ---------------- palette ---------------- */
  var ACTIONS = [
    { id: 'new', label: '新增书签', hint: '手动添加一个链接', icon: '#i-plus' },
    { id: 'collect', label: '收藏当前页面', hint: '抓取标题、图标并选择书架', icon: '#i-bookmark' },
    { id: 'new-task', label: '新建待办', hint: '把一件事放进今天', icon: '#i-check-square' },
    { id: 'new-event', label: '新建日程', hint: '给一段时间留个位置', icon: '#i-calendar' },
    { id: 'overview', label: '回到概览', hint: '看看今天的日程和待办', icon: '#i-home' },
    { id: 'search', label: '打开搜索页', hint: '在互联网和书房里一起找', icon: '#i-search' },
    { id: 'bookmarks', label: '打开书签库', hint: '搜索、整理所有书签', icon: '#i-bookmark' },
    { id: 'calendar', label: '打开日历', hint: '按月查看所有日程', icon: '#i-calendar' },
    { id: 'todos', label: '打开待办', hint: '查看今天和本周的任务', icon: '#i-check-square' },
    { id: 'sync', label: '打开 WebDAV 同步设置', hint: '配置云端与同步策略', icon: '#i-cloud' },
    { id: 'theme', label: '切换深浅色', hint: '在浅色与深色之间切换', icon: '#i-moon' },
    { id: 'export', label: '导出全部数据（JSON）', hint: '书签、日程、待办与笔记', icon: '#i-download' }
  ];
  function renderPalette(q) {
    var body = $('#palBody');
    body.innerHTML = '';
    state.paletteItems = [];
    var query = (q || '').trim().toLowerCase();
    var books = [];
    if (query) {
      books = state.bookmarks.filter(function (b) {
        var hay = (b.title + ' ' + b.url + ' ' + (b.tags || []).join(' ')).toLowerCase();
        return hay.indexOf(query) !== -1;
      }).slice(0, 6);
    } else {
      books = state.bookmarks.slice().sort(function (a, b) { return b.lastVisited - a.lastVisited; }).slice(0, 4);
    }
    var tasks = [];
    if (query) {
      tasks = state.tasks.filter(function (t) {
        if (t.done) return false;
        return (t.title + ' ' + t.list + ' ' + (t.note || '')).toLowerCase().indexOf(query) !== -1;
      }).slice(0, 4);
    }
    var acts = ACTIONS.filter(function (a) {
      if (!query) return true;
      return (a.label + ' ' + a.hint).toLowerCase().indexOf(query) !== -1;
    });
    if (!books.length && !tasks.length && !acts.length) {
      var empty = document.createElement('div');
      empty.className = 'pal-empty';
      empty.innerHTML = '<b>没有找到结果</b>换个关键词，或直接新增一枚书签。';
      body.appendChild(empty);
      return;
    }
    if (books.length) {
      var gh = document.createElement('div');
      gh.className = 'pal-group';
      gh.textContent = query ? '书签' : '最近访问';
      body.appendChild(gh);
      books.forEach(function (b) {
        var node = $('#tpl-pal-item').content.firstElementChild.cloneNode(true);
        setMono(node.querySelector('.mono'), b);
        node.querySelector('b').textContent = b.title;
        node.querySelector('.pal-copy span').textContent = hostOf(b.url) + ' · ' + (b.tags || []).join(' / ');
        node.setAttribute('data-index', state.paletteItems.length);
        state.paletteItems.push({ type: 'b', id: b.id });
        body.appendChild(node);
      });
    }
    if (tasks.length) {
      var ghT = document.createElement('div');
      ghT.className = 'pal-group';
      ghT.textContent = '待办';
      body.appendChild(ghT);
      tasks.forEach(function (t) {
        var nodeT = $('#tpl-pal-action').content.firstElementChild.cloneNode(true);
        nodeT.querySelector('.pal-glyph use').setAttribute('href', '#i-check-square');
        nodeT.querySelector('b').textContent = t.title;
        nodeT.querySelector('.pal-copy span').textContent = t.list + ' · ' + dueLabel(t);
        nodeT.querySelector('.pal-kind').textContent = '待办';
        nodeT.setAttribute('data-index', state.paletteItems.length);
        state.paletteItems.push({ type: 't', id: t.id });
        body.appendChild(nodeT);
      });
    }
    if (acts.length) {
      var gh2 = document.createElement('div');
      gh2.className = 'pal-group';
      gh2.textContent = '操作';
      body.appendChild(gh2);
      acts.forEach(function (a) {
        var node = $('#tpl-pal-action').content.firstElementChild.cloneNode(true);
        node.querySelector('.pal-glyph use').setAttribute('href', a.icon);
        node.querySelector('b').textContent = a.label;
        node.querySelector('.pal-copy span').textContent = a.hint;
        node.setAttribute('data-index', state.paletteItems.length);
        state.paletteItems.push({ type: 'a', id: a.id });
        body.appendChild(node);
      });
    }
    state.paletteIndex = 0;
    highlightPalette(0);
  }
  function highlightPalette(i) {
    var items = $$('.pal-item', $('#palBody'));
    if (!items.length) return;
    state.paletteIndex = (i + items.length) % items.length;
    items.forEach(function (n, idx) { n.classList.toggle('is-active', idx === state.paletteIndex); });
    var active = items[state.paletteIndex];
    if (active && active.scrollIntoView) active.scrollIntoView({ block: 'nearest' });
  }
  function activatePalette(index) {
    var item = state.paletteItems[index];
    if (!item) return;
    closeOverlay('paletteOverlay');
    if (item.type === 'b') { openInspector(item.id); return; }
    if (item.type === 't') { setPage('todos'); openTask(item.id); return; }
    if (item.id === 'new') openEditor();
    else if (item.id === 'collect') openCollectEntry();
    else if (item.id === 'new-task') openTask();
    else if (item.id === 'new-event') openEvent();
    else if (item.id === 'overview' || item.id === 'bookmarks' || item.id === 'calendar' || item.id === 'todos') setPage(item.id);
    else if (item.id === 'search') { setPage('search'); setTimeout(function () { if ($('#searchPageInput')) $('#searchPageInput').focus(); }, 140); }
    else if (item.id === 'sync') openSettings('sync');
    else if (item.id === 'theme') toggleTheme();
    else if (item.id === 'export') exportJson();
  }
  function openPalette() {
    $('#palInput').value = '';
    renderPalette('');
    openOverlay('paletteOverlay');
    setTimeout(function () { $('#palInput').focus(); }, 30);
  }
  function toggleTheme() {
    var keys = Object.keys(SKINS);
    var i = keys.indexOf(state.prefs.skin);
    setSkin(keys[(i + 1) % keys.length]);
  }

  /* ---------------- library interactions ---------------- */
  function toggleStar(id) {
    var b = bookById(id);
    if (!b) return;
    b.starred = !b.starred;
    b.updatedAt = Date.now();
    persist();
    renderNav();
    renderLibrary();
    renderStats();
    if (state.selectedId === id) setStar($('#inspStar'), b.starred);
    toast(b.starred ? '已加入标星' : '已取消标星');
  }

  /* ---------------- page + workspace actions ---------------- */
  function setPage(page) {
    state.ui.page = page;
    document.body.setAttribute('data-page', page);
    $$('.page').forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-page') === page); });
    $$('#pageNav .nav-item').forEach(function (btn) { btn.classList.toggle('is-active', btn.getAttribute('data-page') === page); });
    $$('#mobileNav button').forEach(function (btn) { btn.classList.toggle('is-active', btn.getAttribute('data-page') === page); });
    var names = { overview: '概览', search: '搜索', bookmarks: '书签库', calendar: '日历', todos: '待办', notes: '笔记' };
    if ($('#crumbTitle')) $('#crumbTitle').textContent = names[page] || '概览';
    if ($('#importBtn')) $('#importBtn').hidden = page !== 'bookmarks';
    if ($('#exportBtn')) $('#exportBtn').hidden = page !== 'bookmarks';
    renderNav();
    if (page === 'overview') renderDashboard();
    else if (page === 'search') {
      renderSearchPage();
      if (window.innerWidth > 760) setTimeout(function () { if ($('#searchPageInput')) $('#searchPageInput').focus(); }, 120);
    }
    else if (page === 'bookmarks') { renderRecents(); renderLibrary(); }
    else if (page === 'calendar') { renderCalendar(); renderAgenda(); }
    else if (page === 'todos') renderTodos();
    else if (page === 'notes') renderNotes();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function shiftMonth(delta) {
    if (state.ui.calView === 'week') {
      state.ui.calSelected = addDaysKey(state.ui.calSelected || dayKey(0), delta * 7);
      var wd = parseDayKey(state.ui.calSelected);
      state.ui.calMonth = new Date(wd.getFullYear(), wd.getMonth(), 1).getTime();
    } else {
      var d = new Date(state.ui.calMonth);
      d.setDate(1);
      d.setMonth(d.getMonth() + delta);
      state.ui.calMonth = d.getTime();
    }
    renderDashboard();
    if (state.ui.page === 'calendar') renderCalendar();
  }

  function openEvent(id, presetDate) {
    state.editingEventId = id || null;
    var ev = id ? eventById(id) : null;
    $('#eventHeading').textContent = ev ? '编辑日程' : '新建日程';
    $('#evTitle').value = ev ? ev.title : '';
    $('#evDate').value = ev ? ev.date : (presetDate || state.ui.calSelected || dayKey(0));
    $('#evCat').value = ev ? ev.cat : 'work';
    $('#evStart').value = ev ? ev.start : '09:00';
    $('#evEnd').value = ev ? ev.end : '10:00';
    $('#evRepeat').value = ev && ev.repeat ? ev.repeat : 'none';
    $('#evRepeatUntil').value = ev && ev.repeatUntil ? ev.repeatUntil : '';
    $('#evLocation').value = ev ? ev.location : '';
    $('#evNote').value = ev ? ev.note : '';
    $('#evDelete').hidden = !ev;
    openOverlay('eventOverlay');
    setTimeout(function () { $('#evTitle').focus(); }, 60);
  }

  function saveEvent() {
    var title = $('#evTitle').value.trim();
    if (!title) { toast('给这段时间起个名字', 'warn'); $('#evTitle').focus(); return; }
    var date = $('#evDate').value || dayKey(0);
    var start = $('#evStart').value || '09:00';
    var end = $('#evEnd').value || start;
    if (toMin(end) <= toMin(start)) { toast('结束时间要晚于开始时间', 'warn'); return; }
    var repeat = $('#evRepeat').value || 'none';
    var repeatUntil = $('#evRepeatUntil').value || '';
    if (repeat !== 'none' && repeatUntil && repeatUntil < date) {
      toast('重复截止不能早于开始日期', 'warn');
      return;
    }
    var data = {
      title: title, date: date, start: start, end: end,
      cat: $('#evCat').value, location: $('#evLocation').value.trim(), note: $('#evNote').value.trim(),
      repeat: repeat, repeatUntil: repeat === 'none' ? '' : repeatUntil
    };
    var ev = state.editingEventId ? eventById(state.editingEventId) : null;
    if (ev) {
      Object.assign(ev, data);
      toast('日程已更新');
    } else {
      state.events.push(Object.assign({ id: uid('e') }, data));
      toast('日程已添加');
    }
    var d = parseDayKey(date);
    state.ui.calMonth = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
    state.ui.calSelected = date;
    persist();
    closeOverlay('eventOverlay');
    renderAll();
  }

  function deleteEvent() {
    var ev = state.editingEventId ? eventById(state.editingEventId) : null;
    if (!ev) return;
    askConfirm('删除这个日程？', '「' + ev.title + '」会从日历中移除。', '删除日程', function () {
      state.events = state.events.filter(function (x) { return x.id !== ev.id; });
      persist();
      closeOverlay('eventOverlay');
      renderAll();
      toast('日程已删除');
    });
  }

  function toLocalInput(ts) {
    if (!ts) return '';
    var d = new Date(Number(ts));
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function notifyTask(t) {
    if (isExtension() && chrome.notifications) {
      chrome.notifications.create('zhiqian-task-' + t.id, {
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: '稚签 · 待办提醒',
        message: t.title,
        priority: 2
      });
      return;
    }
    if (typeof Notification !== 'undefined') {
      if (Notification.permission === 'granted') {
        new Notification('稚签 · 待办提醒', { body: t.title });
        return;
      }
      if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(function (p) {
          if (p === 'granted') new Notification('稚签 · 待办提醒', { body: t.title });
        });
        return;
      }
    }
    toast('待办提醒 · ' + t.title);
  }
  function checkTaskReminders() {
    var now = Date.now();
    var due = state.tasks.filter(function (t) {
      return !t.done && t.remindAt && Number(t.remindAt) <= now && !t.reminderSent;
    });
    if (!due.length) return;
    due.forEach(function (t) {
      t.reminderSent = true;
      notifyTask(t);
    });
    persist();
  }

  function openTask(id) {
    state.editingTaskId = id || null;
    var t = id ? taskById(id) : null;
    $('#taskHeading').textContent = t ? '编辑待办' : '新建待办';
    $('#tkTitle').value = t ? t.title : '';
    $('#tkDate').value = t ? t.due : dayKey(0);
    $('#tkRemind').value = t && t.remindAt ? toLocalInput(t.remindAt) : '';
    $('#tkPriority').value = t ? t.priority : 'med';
    $('#tkList').value = t ? t.list : '工作';
    $('#tkRepeat').value = t && t.repeat ? t.repeat : 'none';
    $('#tkRepeatUntil').value = t && t.repeatUntil ? t.repeatUntil : '';
    $('#tkNote').value = t ? t.note : '';
    state.subtaskDraft = t && Array.isArray(t.subtasks) ? t.subtasks.map(function (s) { return { id: s.id || uid('s'), title: s.title, done: !!s.done }; }) : [];
    renderSubtaskEditor();
    $('#tkDelete').hidden = !t;
    openOverlay('taskOverlay');
    setTimeout(function () { $('#tkTitle').focus(); }, 60);
  }

  function saveTask() {
    var title = $('#tkTitle').value.trim();
    if (!title) { toast('写下要做的事', 'warn'); $('#tkTitle').focus(); return; }
    var repeat = $('#tkRepeat').value || 'none';
    var repeatUntil = $('#tkRepeatUntil').value || '';
    var subtasks = state.subtaskDraft.filter(function (s) { return (s.title || '').trim(); }).map(function (s) {
      return { id: s.id || uid('s'), title: s.title.trim(), done: !!s.done };
    });
    var remindValue = $('#tkRemind').value;
    var remindAt = remindValue ? new Date(remindValue).getTime() : 0;
    if (remindAt && isNaN(remindAt)) remindAt = 0;
    var data = {
      title: title,
      due: $('#tkDate').value || dayKey(0),
      remindAt: remindAt,
      reminderSent: false,
      priority: $('#tkPriority').value,
      list: $('#tkList').value,
      note: $('#tkNote').value.trim(),
      subtasks: subtasks,
      repeat: repeat,
      repeatUntil: repeat === 'none' ? '' : repeatUntil
    };
    var t = state.editingTaskId ? taskById(state.editingTaskId) : null;
    if (t) {
      Object.assign(t, data);
      t.updatedAt = Date.now();
      toast('待办已更新');
    } else {
      state.tasks.push(Object.assign({
        id: uid('t'), done: false, createdAt: Date.now(), updatedAt: Date.now(), completedAt: null
      }, data));
      toast('待办已添加');
    }
    persist();
    closeOverlay('taskOverlay');
    renderAll();
  }

  function toggleTask(id) {
    var t = taskById(id);
    if (!t) return;
    var wasDone = t.done;
    t.done = !t.done;
    t.updatedAt = Date.now();
    t.completedAt = t.done ? Date.now() : null;
    var nextMsg = '';
    if (!wasDone && t.done && t.repeat && t.repeat !== 'none') {
      var nd = nextDue(t.due, t.repeat);
      if (nd && (!t.repeatUntil || nd <= t.repeatUntil)) {
        var copy = {
          id: uid('t'), title: t.title, list: t.list, priority: t.priority, due: nd,
          done: false, note: t.note || '', createdAt: Date.now(), updatedAt: Date.now(),
          completedAt: null, repeat: t.repeat, repeatUntil: t.repeatUntil || '',
          subtasks: (t.subtasks || []).map(function (s) { return { id: uid('s'), title: s.title, done: false }; })
        };
        state.tasks.push(copy);
        nextMsg = '，下次 ' + fmtDayCN(nd);
      }
    }
    persist();
    renderAll();
    toast((t.done ? '完成了一件' : '已恢复为未完成') + nextMsg);
  }

  function quickAddTask(title) {
    var v = (title || '').trim();
    if (!v) return;
    state.tasks.push({
      id: uid('t'), title: v, list: '工作', priority: 'med', due: dayKey(0),
      done: false, note: '', createdAt: Date.now(), updatedAt: Date.now(), completedAt: null,
      subtasks: [], repeat: 'none', repeatUntil: ''
    });
    persist();
    renderAll();
    toast('已加入今天的待办');
  }

  function deleteTask(id) {
    var t = taskById(id);
    if (!t) return;
    askConfirm('删除这件待办？', '「' + t.title + '」会从所有设备移除。', '删除待办', function () {
      state.tasks = state.tasks.filter(function (x) { return x.id !== id; });
      persist();
      renderAll();
      toast('待办已删除');
    });
  }

  function addTodoFromInput() {
    var input = $('#todoInput');
    var v = input.value.trim();
    if (!v) { input.focus(); return; }
    quickAddTask(v);
    input.value = '';
    input.focus();
  }

  function renderSubtaskEditor() {
    var host = $('#subtaskEditor');
    if (!host) return;
    host.innerHTML = '';
    state.subtaskDraft.forEach(function (s, idx) {
      var row = document.createElement('div');
      row.className = 'subtask-row';
      var check = document.createElement('button');
      check.type = 'button';
      check.className = 'check' + (s.done ? ' is-on' : '');
      check.setAttribute('aria-label', '切换子任务');
      check.innerHTML = '<svg class="ic"><use href="#i-check"></use></svg>';
      check.addEventListener('click', function () {
        state.subtaskDraft[idx].done = !state.subtaskDraft[idx].done;
        renderSubtaskEditor();
      });
      var input = document.createElement('input');
      input.type = 'text';
      input.value = s.title || '';
      input.placeholder = '子任务内容';
      input.addEventListener('input', function () { state.subtaskDraft[idx].title = this.value; });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); $('#subtaskInput').focus(); }
      });
      var del = document.createElement('button');
      del.type = 'button';
      del.setAttribute('aria-label', '删除子任务');
      del.innerHTML = '<svg class="ic" style="width:11px;height:11px"><use href="#i-x"></use></svg>';
      del.addEventListener('click', function () {
        state.subtaskDraft.splice(idx, 1);
        renderSubtaskEditor();
      });
      row.appendChild(check);
      row.appendChild(input);
      row.appendChild(del);
      host.appendChild(row);
    });
  }

  function addSubtaskDraft() {
    var input = $('#subtaskInput');
    var v = input.value.trim();
    if (!v) { input.focus(); return; }
    state.subtaskDraft.push({ id: uid('s'), title: v, done: false });
    input.value = '';
    renderSubtaskEditor();
    input.focus();
  }

  /* ---------------- pomodoro ---------------- */
  var focus = { mode: 'focus', remaining: 25 * 60, running: false, sessions: 0, today: 0 };
  function fmtFocus(sec) {
    sec = Math.max(0, sec);
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }
  function renderFocus() {
    var t = fmtFocus(focus.remaining);
    $$('[data-focus-time]').forEach(function (el) { el.textContent = t; });
    $$('#focusToggle, #focusToggleModal').forEach(function (b) { b.textContent = focus.running ? '暂停' : '开始'; });
    if ($('#focusMode')) $('#focusMode').textContent = focus.mode === 'focus' ? '专注时间' : '休息时间';
    if ($('#focusSessions')) $('#focusSessions').textContent = focus.sessions + ' 次';
    if ($('#focusSessionsModal')) $('#focusSessionsModal').textContent = focus.sessions;
    if ($('#focusToday')) $('#focusToday').textContent = focus.today;
    if ($('#focusTime')) $('#focusTime').classList.toggle('is-running', focus.running);
    if ($('#focusFab')) $('#focusFab').classList.toggle('is-running', focus.running);
    if ($('#mobileFocusBtn')) $('#mobileFocusBtn').classList.toggle('is-running', focus.running);
    if ($('#mobileMoreBtn')) $('#mobileMoreBtn').classList.toggle('is-running', focus.running);
  }
  function focusTick() {
    if (!focus.running) return;
    focus.remaining--;
    if (focus.remaining <= 0) {
      focus.running = false;
      if (focus.mode === 'focus') {
        focus.sessions++;
        focus.today++;
        focus.mode = 'break';
        focus.remaining = 5 * 60;
        toast('完成一轮专注，休息 5 分钟');
      } else {
        focus.mode = 'focus';
        focus.remaining = 25 * 60;
        toast('休息结束，开始下一轮');
      }
    }
    renderFocus();
  }
  function toggleFocus() {
    focus.running = !focus.running;
    renderFocus();
  }
  function resetFocus() {
    focus.running = false;
    focus.remaining = focus.mode === 'focus' ? 25 * 60 : 5 * 60;
    renderFocus();
  }
  setInterval(focusTick, 1000);

  /* ---------------- notes actions ---------------- */
  function newNote() {
    var n = { id: uid('n'), title: '无标题笔记', body: '', tags: [], createdAt: Date.now(), updatedAt: Date.now() };
    state.notes.unshift(n);
    state.ui.noteId = n.id;
    state.ui.noteQuery = '';
    persist();
    if (state.ui.page !== 'notes') setPage('notes');
    renderNotes();
    setTimeout(function () { if ($('#noteTitle')) { $('#noteTitle').focus(); $('#noteTitle').select(); } }, 80);
  }
  var saveNoteDebounced = debounce(function () {
    persist();
    renderNotes();
  }, 420);
  function bindNoteEditor() {
    var title = $('#noteTitle');
    var body = $('#noteBody');
    var tags = $('#noteTags');
    function touch(field, value) {
      var n = noteById(state.ui.noteId);
      if (!n) return;
      n[field] = value;
      n.updatedAt = Date.now();
      saveNoteDebounced();
    }
    if (title) title.addEventListener('input', function () { touch('title', this.value); });
    if (body) body.addEventListener('input', function () { touch('body', this.value); });
    if (tags) tags.addEventListener('input', function () {
      touch('tags', this.value.split(/[,，、]/).map(function (t) { return t.trim(); }).filter(Boolean));
    });
  }

  /* ---------------- search actions ---------------- */
  function rememberSearch(q) {
    state.searchHistory = [q].concat(state.searchHistory.filter(function (x) { return x !== q; })).slice(0, 8);
  }
  function doSearch(q) {
    q = (q || '').trim();
    if (!q) { if ($('#searchPageInput')) $('#searchPageInput').focus(); return; }
    var isUrl = looksLikeUrl(q);
    var url = isUrl ? (/^https?:\/\//i.test(q) ? q : 'https://' + q) : currentEngine().url + encodeURIComponent(q);
    state.ui.searchQuery = q;
    rememberSearch(q);
    persist();
    renderSearchPage();
    if ($('#searchSuggest')) $('#searchSuggest').hidden = true;
    window.open(url, '_blank', 'noopener');
    toast(isUrl ? '已打开网址' : '已用' + currentEngine().name + '搜索');
  }
  function openSearchResult(kind, id) {
    if (kind === 'bookmark') {
      var b = bookById(id);
      if (b) { window.open(b.url, '_blank', 'noopener'); toast('已打开 ' + b.title); }
    } else if (kind === 'task') {
      openTask(id);
    } else if (kind === 'note') {
      state.ui.noteId = id;
      setPage('notes');
    }
    if ($('#searchSuggest')) $('#searchSuggest').hidden = true;
  }
  function setSearchEngine(key) {
    if (!SEARCH_ENGINES[key]) return;
    state.prefs.searchEngine = key;
    persist();
    renderSearchPage();
    if ($('#searchPageInput')) $('#searchPageInput').focus();
  }

  function bindEvents() {
    /* top actions */
    $('#collectBtn').addEventListener('click', openCollectEntry);
    if ($('#collectBtn2')) $('#collectBtn2').addEventListener('click', openCollectEntry);
    if ($('#mobileSettingsBtn')) $('#mobileSettingsBtn').addEventListener('click', function () { openSettings('sync'); });
    if ($('#mobileMoreBtn')) $('#mobileMoreBtn').addEventListener('click', function () { openOverlay('moreOverlay'); renderFocus(); });
    if ($('#moreFocusBtn')) $('#moreFocusBtn').addEventListener('click', function () {
      closeOverlay('moreOverlay');
      openOverlay('focusOverlay');
      renderFocus();
    });
    if ($('#moreSettingsBtn')) $('#moreSettingsBtn').addEventListener('click', function () {
      closeOverlay('moreOverlay');
      openSettings('sync');
    });
    if ($('#newNoteBtn')) $('#newNoteBtn').addEventListener('click', newNote);
    if ($('#railNewNote')) $('#railNewNote').addEventListener('click', newNote);
    if ($('#railNotes')) $('#railNotes').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-note]');
      if (!btn) return;
      state.ui.noteId = btn.getAttribute('data-note');
      setPage('notes');
    });
    $('#newEventBtn').addEventListener('click', function () { openEvent(); });
    $('#newTaskBtn').addEventListener('click', function () { openTask(); });
    $('#importBtn').addEventListener('click', function () { $('#fileInput').click(); });
    $('#exportBtn').addEventListener('click', exportJson);
    $('#settingsBtn').addEventListener('click', function () { openSettings('sync'); });
    $('#syncCard').addEventListener('click', function () { openSettings('sync'); });
    $('#paletteBtn').addEventListener('click', openPalette);
    $('#themeToggle').addEventListener('click', toggleTheme);
    $('#addShelfBtn').addEventListener('click', openShelf);
    if ($('#addShelfBtnMobile')) $('#addShelfBtnMobile').addEventListener('click', openShelf);
    $('#searchClear').addEventListener('click', function () {
      $('#searchInput').value = '';
      state.ui.query = '';
      $('#searchWrap').classList.remove('has-value');
      renderLibrary();
      $('#searchInput').focus();
    });

    /* search page */
    $('#searchPageForm').addEventListener('submit', function (e) {
      e.preventDefault();
      doSearch($('#searchPageInput').value);
    });
    $('#searchPageInput').addEventListener('input', function () {
      state.ui.searchQuery = this.value;
      renderSearchSuggestions(this.value);
    });
    $('#searchPageInput').addEventListener('focus', function () {
      if (this.value.trim()) renderSearchSuggestions(this.value);
    });
    $('#searchPageInput').addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        $('#searchSuggest').hidden = true;
        this.blur();
      }
    });
    $('#searchEngines').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-engine]');
      if (btn) setSearchEngine(btn.getAttribute('data-engine'));
    });
    $('#searchSuggest').addEventListener('click', function (e) {
      var web = e.target.closest('[data-search-web]');
      if (web) { doSearch(web.getAttribute('data-search-web')); return; }
      var item = e.target.closest('[data-search-kind]');
      if (item) openSearchResult(item.getAttribute('data-search-kind'), item.getAttribute('data-search-id'));
    });
    $('#searchHistory').addEventListener('click', function (e) {
      var chip = e.target.closest('[data-search-history]');
      if (!chip) return;
      $('#searchPageInput').value = chip.getAttribute('data-search-history');
      doSearch(chip.getAttribute('data-search-history'));
    });
    $('#clearSearchHistory').addEventListener('click', function () {
      state.searchHistory = [];
      persist();
      renderSearchPage();
      toast('搜索记录已清空');
    });
    $('#searchQuickLinks').addEventListener('click', function (e) {
      var item = e.target.closest('[data-quick-url]');
      if (item) window.open(item.getAttribute('data-quick-url'), '_blank', 'noopener');
    });
    $('#searchAllBookmarks').addEventListener('click', function () { setPage('bookmarks'); });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.search-form')) {
        var s = $('#searchSuggest');
        if (s) s.hidden = true;
      }
    });

    /* page + bookmarks nav */
    function setFilter(f) {
      state.ui.filter = f;
      state.ui.query = '';
      $('#searchInput').value = '';
      $('#searchWrap').classList.remove('has-value');
      if (state.ui.page !== 'bookmarks') setPage('bookmarks');
      renderNav();
      renderLibrary();
    }
    document.addEventListener('click', function (e) {
      var pageBtn = e.target.closest('#pageNav [data-page], #mobileNav [data-page]');
      if (pageBtn) { setPage(pageBtn.getAttribute('data-page')); return; }
      var cat = e.target.closest('#catList [data-filter], #catListMobile [data-filter]');
      if (cat) { setFilter(cat.getAttribute('data-filter')); return; }
      var chip = e.target.closest('#filterRow [data-filter]');
      if (chip) { setFilter(chip.getAttribute('data-filter')); return; }
      var goto = e.target.closest('[data-goto]');
      if (goto) { setPage(goto.getAttribute('data-goto')); return; }
      var link = e.target.closest('.link-btn[data-filter]');
      if (link) { setFilter(link.getAttribute('data-filter')); }
    });

    /* search */
    $('#searchInput').addEventListener('input', function () {
      state.ui.query = this.value;
      $('#searchWrap').classList.toggle('has-value', !!this.value);
      renderLibrary();
    });
    $('#sortSelect').addEventListener('change', function () {
      state.ui.sort = this.value;
      renderLibrary();
    });
    $('#viewGrid').addEventListener('click', function () { setView('grid'); });
    $('#viewList').addEventListener('click', function () { setView('list'); });

    /* library */
    var lib = $('#library');
    lib.addEventListener('click', function (e) {
      var star = e.target.closest('.card-star, .row-star');
      var card = e.target.closest('.card, .row');
      if (star) {
        e.stopPropagation();
        if (card) toggleStar(card.getAttribute('data-id'));
        return;
      }
      if (e.target.closest('[data-action="new"]')) { openEditor(); return; }
      if (e.target.closest('[data-action="clear-search"]')) {
        $('#searchInput').value = '';
        state.ui.query = '';
        $('#searchWrap').classList.remove('has-value');
        renderLibrary();
        return;
      }
      if (card) openInspector(card.getAttribute('data-id'));
    });
    lib.addEventListener('dblclick', function (e) {
      var card = e.target.closest('.card, .row');
      if (!card) return;
      var b = bookById(card.getAttribute('data-id'));
      if (b) openUrl(b.url);
    });

    /* recents */
    var recentStrip = $('#recentStrip');
    if (recentStrip) recentStrip.addEventListener('click', function (e) {
      var chip = e.target.closest('.recent');
      if (chip) openInspector(chip.getAttribute('data-id'));
    });

    /* dashboard */
    $('#dashSearchBtn').addEventListener('click', openPalette);
    $('#quickTaskBtn').addEventListener('click', function () { openTask(); });
    $('#quickEventBtn').addEventListener('click', function () { openEvent(); });
    $('#dashEventAdd').addEventListener('click', function () { openEvent(null, dayKey(0)); });
    $('#dashTaskAdd').addEventListener('click', function () {
      var input = $('#dashTaskInput');
      quickAddTask(input.value);
      input.value = '';
    });
    $('#dashTaskInput').addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      quickAddTask(this.value);
      this.value = '';
    });
    $('#dashTimeline').addEventListener('click', function (e) {
      var item = e.target.closest('.timeline-item');
      if (item) openEvent(item.getAttribute('data-id'));
    });
    $('#dashTasks').addEventListener('click', function (e) {
      var row = e.target.closest('.mini-task');
      if (!row) return;
      if (e.target.closest('.check')) { toggleTask(row.getAttribute('data-id')); return; }
      openTask(row.getAttribute('data-id'));
    });
    $('#dashBookmarks').addEventListener('click', function (e) {
      var tile = e.target.closest('.bm-tile');
      if (tile) openUrl(tile.getAttribute('data-url'));
    });
    $('#miniPrev').addEventListener('click', function () { shiftMonth(-1); });
    $('#miniNext').addEventListener('click', function () { shiftMonth(1); });
    $('#miniCalGrid').addEventListener('click', function (e) {
      var day = e.target.closest('[data-date]');
      if (!day) return;
      var key = day.getAttribute('data-date');
      state.ui.calSelected = key;
      var d = parseDayKey(key);
      state.ui.calMonth = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      setPage('calendar');
    });
    var saveScratch = debounce(function () {
      var qn = quickNote();
      qn.body = $('#scratchpad').value;
      qn.updatedAt = Date.now();
      persist();
      if ($('#noteSaved')) $('#noteSaved').textContent = '已保存 ' + timeShort(Date.now());
      if (state.ui.page === 'notes') renderNotes();
    }, 450);
    $('#scratchpad').addEventListener('input', saveScratch);

    /* calendar page */
    $('#calPrev').addEventListener('click', function () { shiftMonth(-1); });
    $('#calNext').addEventListener('click', function () { shiftMonth(1); });
    $('#calViewSeg').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-cal-view]');
      if (!btn) return;
      state.ui.calView = btn.getAttribute('data-cal-view');
      if (state.ui.calView === 'week') state.ui.calWeekStart = weekStartKey(state.ui.calSelected || dayKey(0));
      renderCalendar();
    });
    $('#calTodayBtn').addEventListener('click', function () {
      var d = new Date();
      state.ui.calMonth = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      state.ui.calSelected = dayKey(0);
      state.ui.calWeekStart = weekStartKey(dayKey(0));
      renderCalendar();
    });
    $('#calGrid').addEventListener('click', function (e) {
      var chip = e.target.closest('[data-event]');
      if (chip) { e.stopPropagation(); openEvent(chip.getAttribute('data-event')); return; }
      var cell = e.target.closest('[data-date]');
      if (!cell) return;
      var key = cell.getAttribute('data-date');
      state.ui.calSelected = key;
      var picked = parseDayKey(key);
      var base = new Date(state.ui.calMonth);
      if (picked.getMonth() !== base.getMonth() || picked.getFullYear() !== base.getFullYear()) {
        state.ui.calMonth = new Date(picked.getFullYear(), picked.getMonth(), 1).getTime();
      }
      renderCalendar();
    });
    $('#weekHead').addEventListener('click', function (e) {
      var day = e.target.closest('[data-date]');
      if (!day) return;
      state.ui.calSelected = day.getAttribute('data-date');
      renderCalendar();
    });

    var weekDrag = null;
    $('#weekCanvas').addEventListener('pointerdown', function (e) {
      var el = e.target.closest('.week-event');
      if (!el) return;
      var ev = eventById(el.getAttribute('data-id'));
      if (!ev) return;
      var rect = $('#weekCanvas').getBoundingClientRect();
      weekDrag = {
        id: ev.id, el: el, startX: e.clientX, startY: e.clientY, rect: rect,
        date: el.getAttribute('data-date'), start: ev.start, end: ev.end, moved: false
      };
      try { el.setPointerCapture(e.pointerId); } catch (err) { }
      e.preventDefault();
    });
    document.addEventListener('pointermove', function (e) {
      if (!weekDrag) return;
      var dx = e.clientX - weekDrag.startX;
      var dy = e.clientY - weekDrag.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) weekDrag.moved = true;
      if (!weekDrag.moved) return;
      weekDrag.el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      weekDrag.el.classList.add('is-dragging');
    });
    document.addEventListener('pointerup', function (e) {
      if (!weekDrag) return;
      var d = weekDrag;
      weekDrag = null;
      d.el.classList.remove('is-dragging');
      d.el.style.transform = '';
      if (!d.moved) { openEvent(d.id); return; }
      var colW = (d.rect.width - 54) / 7;
      var dayDelta = Math.round((e.clientX - d.startX) / colW);
      var minDelta = Math.round(((e.clientY - d.startY) / 60) * 4) * 15;
      if (!dayDelta && !minDelta) return;
      var ev2 = eventById(d.id);
      if (!ev2) return;
      var startMin = Math.max(0, Math.min(23 * 60, toMin(d.start) + minDelta));
      var duration = Math.max(15, toMin(d.end) - toMin(d.start));
      var endMin = Math.min(24 * 60, startMin + duration);
      function f(min) {
        var h = Math.floor(min / 60);
        var m = min % 60;
        return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
      }
      var newDate = addDaysKey(d.date, dayDelta);
      ev2.date = newDate;
      ev2.start = f(startMin);
      ev2.end = f(endMin);
      ev2.updatedAt = Date.now();
      state.ui.calSelected = newDate;
      state.ui.calWeekStart = weekStartKey(newDate);
      persist();
      renderAll();
      toast('日程已移动到 ' + fmtDayCN(newDate) + ' ' + ev2.start);
    });

    $('#agendaAdd').addEventListener('click', function () { openEvent(null, state.ui.calSelected); });
    $('#agendaList').addEventListener('click', function (e) {
      var item = e.target.closest('[data-id]');
      if (item) openEvent(item.getAttribute('data-id'));
    });

    /* todos page */
    $('#todoAddBtn').addEventListener('click', addTodoFromInput);
    $('#todoInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); addTodoFromInput(); }
    });
    $('#todoFilters').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-tfilter]');
      if (!btn) return;
      state.ui.todoFilter = btn.getAttribute('data-tfilter');
      renderTodos();
    });
    $('#todoList').addEventListener('click', function (e) {
      var row = e.target.closest('.task-row');
      if (!row) return;
      var id = row.getAttribute('data-id');
      if (e.target.closest('.check')) { toggleTask(id); return; }
      if (e.target.closest('.task-del')) { deleteTask(id); return; }
      if (e.target.closest('.task-title')) { openTask(id); }
    });

    /* drag */
    document.addEventListener('dragstart', function (e) {
      var item = e.target.closest('.card, .row');
      if (!item) return;
      state.dragId = item.getAttribute('data-id');
      item.classList.add('is-drag');
      document.body.classList.add('is-dragging');
      try { e.dataTransfer.setData('text/plain', state.dragId); e.dataTransfer.effectAllowed = 'move'; } catch (err) { }
    });
    document.addEventListener('dragend', function () {
      state.dragId = null;
      document.body.classList.remove('is-dragging');
      $$('.is-drag').forEach(function (n) { n.classList.remove('is-drag'); });
      $$('.cat-item.is-drop').forEach(function (n) { n.classList.remove('is-drop'); });
    });
    $('#catList').addEventListener('dragover', function (e) {
      var cat = e.target.closest('.cat-item');
      if (!cat || !state.dragId) return;
      e.preventDefault();
      cat.classList.add('is-drop');
    });
    $('#catList').addEventListener('dragleave', function (e) {
      var cat = e.target.closest('.cat-item');
      if (cat) cat.classList.remove('is-drop');
    });
    $('#catList').addEventListener('drop', function (e) {
      var cat = e.target.closest('.cat-item');
      if (!cat || !state.dragId) return;
      e.preventDefault();
      cat.classList.remove('is-drop');
      var b = bookById(state.dragId);
      if (!b) return;
      var target = catById(cat.getAttribute('data-cat'));
      if (!target || b.categoryId === target.id) return;
      b.categoryId = target.id;
      b.updatedAt = Date.now();
      persist();
      renderAll();
      toast('已移动到「' + target.name + '」');
    });

    /* profile / onboarding / dashboard layout */
    $('#railAvatar').addEventListener('click', openProfile);
    if ($('#profileSettingsBtn')) $('#profileSettingsBtn').addEventListener('click', function () { closeOverlay('settingsOverlay'); openProfile(); });
    $('#profileNameInput').addEventListener('input', function () { renderProfile(); });
    $('#avatarColors').addEventListener('click', function (e) {
      var b = e.target.closest('[data-color]');
      if (!b) return;
      state.ui.profileColorDraft = b.getAttribute('data-color');
      renderProfile();
    });
    $('#profileUpload').addEventListener('click', function () { $('#avatarInput').click(); });
    $('#avatarInput').addEventListener('change', function () { readAvatarFile(this.files && this.files[0]); this.value = ''; });
    $('#profileRemove').addEventListener('click', function () { state.ui.profileAvatarDraft = ''; renderProfile(); });
    $('#profileSave').addEventListener('click', saveProfile);
    $('#onboardName').addEventListener('input', function () {
      $('#onboardAvatar').textContent = onboardInitials();
      $('#onboardAvatar').style.background = COLOR_VAR[state.prefs.profile && state.prefs.profile.color || 'indigo'] || COLOR_VAR.indigo;
    });
    $('#onboardSkins').addEventListener('click', function (e) {
      var b = e.target.closest('[data-onboard-skin]');
      if (!b) return;
      state.prefs.skin = b.getAttribute('data-onboard-skin');
      applyTheme();
      $$('#onboardSkins button').forEach(function (x) { x.classList.toggle('is-active', x === b); });
    });
    $('#onboardStart').addEventListener('click', function () { finishOnboarding(false); });
    $('#onboardSync').addEventListener('click', function () { finishOnboarding(true); });
    $('#startPageSeg').addEventListener('click', function (e) {
      var b = e.target.closest('[data-start]');
      if (!b) return;
      state.prefs.startPage = b.getAttribute('data-start') === 'search' ? 'search' : 'overview';
      persist();
      applyStartPagePref();
      toast(state.prefs.startPage === 'search' ? '下次打开先到搜索页' : '下次打开先到概览页');
    });
    $('#dashLayoutSeg').addEventListener('click', function (e) {
      var b = e.target.closest('[data-layout]');
      if (!b) return;
      state.prefs.dashboardLayout = b.getAttribute('data-layout');
      persist();
      applyDashboardLayout();
      $$('#dashLayoutSeg button').forEach(function (x) { x.classList.toggle('is-active', x === b); });
      toast('首页布局已切换');
    });
    /* sync code */
    $('#syncCodeExportBtn').addEventListener('click', function () { openSyncCode('export'); });
    $('#syncCodeImportBtn').addEventListener('click', function () { openSyncCode('import'); });
    $('#syncCodeTabs').addEventListener('click', function (e) {
      var b = e.target.closest('[data-code-mode]');
      if (b) setSyncCodeMode(b.getAttribute('data-code-mode'));
    });
    $('#syncCodeGenerate').addEventListener('click', async function () {
      var pass = $('#syncCodePass').value;
      if (pass.length < 6) { toast('同步密码至少 6 位', 'warn'); $('#syncCodePass').focus(); return; }
      try {
        var code = await exportSyncCode(pass);
        $('#syncCodeOutput').value = code;
        $('#syncCodeOutputWrap').hidden = false;
        toast('同步码已生成');
      } catch (e) { toast('生成失败 · ' + (e.message || '浏览器不支持加密'), 'warn'); }
    });
    $('#syncCodeCopy').addEventListener('click', function () { copyText($('#syncCodeOutput').value); });
    $('#syncCodeImportGo').addEventListener('click', async function () {
      var code = $('#syncCodeInput').value.trim();
      var pass = $('#syncCodeImportPass').value;
      if (!code) { toast('先粘贴同步码', 'warn'); return; }
      if (pass.length < 6) { toast('请输入生成时设置的同步密码', 'warn'); return; }
      try {
        var data = await importSyncCode(code, pass);
        state.sync.url = data.url;
        state.sync.user = data.user || '';
        state.sync.pass = data.pass || '';
        state.sync.dir = data.dir || '/zhiqian/workspace.json';
        state.sync.connected = false;
        state.sync.status = 'idle';
        state.sync.size = '—';
        persist();
        renderSyncPane();
        renderSyncChip();
        closeOverlay('syncCodeOverlay');
        toast('配置已填入，请点测试连接');
      } catch (e) { toast('导入失败 · ' + (e.message || '密码或同步码不正确'), 'warn'); }
    });

    /* inspector */
    $('#inspClose').addEventListener('click', closeInspector);
    $('#drawerScrim').addEventListener('click', closeInspector);
    $('#inspStar').addEventListener('click', function () {
      if (state.selectedId) toggleStar(state.selectedId);
    });
    $('#inspShelf').addEventListener('change', function () {
      var b = bookById(state.selectedId);
      if (!b) return;
      b.categoryId = this.value;
      b.updatedAt = Date.now();
      persist();
      renderNav();
      renderLibrary();
      renderRecents();
      var c = catById(this.value);
      toast('已移动到「' + (c ? c.name : '书架') + '」');
    });
    $('#inspTagInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); addInspTag(); }
    });
    var saveNote = debounce(function () {
      var b = bookById(state.selectedId);
      if (!b) return;
      b.note = $('#inspNote').value;
      b.updatedAt = Date.now();
      persist();
    }, 420);
    $('#inspNote').addEventListener('input', saveNote);
    var saveExcerpt = debounce(function () {
      var b = bookById(state.selectedId);
      if (!b) return;
      b.excerpt = $('#inspExcerpt').value;
      b.updatedAt = Date.now();
      persist();
      renderSearchPage();
    }, 420);
    $('#inspExcerpt').addEventListener('input', saveExcerpt);
    $('#inspRead').addEventListener('click', function () {
      if (state.selectedId) openReader(state.selectedId);
    });
    $('#inspArchive').addEventListener('click', function () {
      if (state.selectedId) toggleBookmarkArchive(state.selectedId);
    });
    $('#readerOpen').addEventListener('click', function () {
      var b = readerBookmark();
      if (b) openUrl(b.url);
    });
    $('#readerToggleRead').addEventListener('click', function () {
      if (state.selectedReaderId) toggleBookmarkRead(state.selectedReaderId);
    });
    $('#readerToggleArchive').addEventListener('click', function () {
      if (state.selectedReaderId) toggleBookmarkArchive(state.selectedReaderId);
    });
    $('#inspOpen').addEventListener('click', function () {
      var b = bookById(state.selectedId);
      if (b) openUrl(b.url);
    });
    $('#inspCopy').addEventListener('click', function () {
      var b = bookById(state.selectedId);
      if (!b) return;
      copyText(b.url);
    });
    $('#inspDelete').addEventListener('click', function () {
      var b = bookById(state.selectedId);
      if (!b) return;
      askConfirm('删除这枚书签？', '「' + b.title + '」将从本地书架移除，云端会在下次同步时同步删除。', '删除书签', function () {
        state.bookmarks = state.bookmarks.filter(function (x) { return x.id !== b.id; });
        persist();
        closeInspector();
        renderAll();
        toast('书签已删除');
      });
    });
    $('#inspEdit').addEventListener('click', function () {
      var id = state.selectedId;
      closeInspector();
      openEditor(id);
    });

    /* event modal */
    $('#evSave').addEventListener('click', saveEvent);
    $('#evDelete').addEventListener('click', deleteEvent);
    $('#evTitle').addEventListener('keydown', function (e) { if (e.key === 'Enter') saveEvent(); });

    /* task modal */
    $('#tkSave').addEventListener('click', saveTask);
    $('#tkDelete').addEventListener('click', function () {
      var id = state.editingTaskId;
      closeOverlay('taskOverlay');
      if (id) deleteTask(id);
    });
    $('#tkTitle').addEventListener('keydown', function (e) { if (e.key === 'Enter') saveTask(); });
    $('#subtaskAddBtn').addEventListener('click', addSubtaskDraft);
    $('#subtaskInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); addSubtaskDraft(); }
    });

    /* focus */
    $('#focusToggle').addEventListener('click', toggleFocus);
    $('#focusReset').addEventListener('click', resetFocus);
    $('#focusToggleModal').addEventListener('click', toggleFocus);
    $('#focusResetModal').addEventListener('click', resetFocus);
    $('#focusTime').addEventListener('click', function () { openOverlay('focusOverlay'); renderFocus(); });
    if ($('#mobileFocusBtn')) $('#mobileFocusBtn').addEventListener('click', function () { openOverlay('focusOverlay'); renderFocus(); });
    if ($('#mobileMoreBtn')) $('#mobileMoreBtn').classList.toggle('is-running', focus.running);

    /* notes */
    $('#notesList').addEventListener('click', function (e) {
      var item = e.target.closest('.note-item');
      if (!item) return;
      state.ui.noteId = item.getAttribute('data-id');
      renderNotes();
    });
    $('#noteSearchInput').addEventListener('input', function () {
      state.ui.noteQuery = this.value;
      renderNotes();
    });
    $('#noteDelete').addEventListener('click', function () {
      var n = noteById(state.ui.noteId);
      if (!n) return;
      askConfirm('删除这篇笔记？', '「' + (n.title || '无标题笔记') + '」会从所有设备移除。', '删除笔记', function () {
        state.notes = state.notes.filter(function (x) { return x.id !== n.id; });
        if (!state.notes.length) {
          state.notes.push({ id: 'quick', title: '速记', body: '', tags: ['速记'], createdAt: Date.now(), updatedAt: 0 });
        }
        state.ui.noteId = state.notes[0].id;
        persist();
        renderAll();
        toast('笔记已删除');
      });
    });
    bindNoteEditor();

    /* editor */
    $('#editorSave').addEventListener('click', saveEditor);
    $('#fUrl').addEventListener('keydown', function (e) { if (e.key === 'Enter') saveEditor(); });
    $('#fTitle').addEventListener('keydown', function (e) { if (e.key === 'Enter') saveEditor(); });

    /* shelf */
    $('#shelfCreate').addEventListener('click', createShelf);
    $('#shelfName').addEventListener('keydown', function (e) { if (e.key === 'Enter') createShelf(); });
    $('#shelfColors').addEventListener('click', function (e) {
      var sw = e.target.closest('.swatch');
      if (!sw) return;
      state.shelfColor = sw.getAttribute('data-color');
      $$('#shelfColors .swatch').forEach(function (x) { x.classList.toggle('is-active', x === sw); });
    });

    /* collect */
    $('#collectSave').addEventListener('click', saveCollect);
    $('#collectShelves').addEventListener('click', function (e) {
      var chip = e.target.closest('.shelf-chip');
      if (!chip) return;
      state.collect.catId = chip.getAttribute('data-cat');
      $$('#collectShelves .shelf-chip').forEach(function (x) { x.classList.toggle('is-active', x === chip); });
      var chosen = catById(state.collect.catId);
      if (chosen) $('#collectMono').style.setProperty('--mc', COLOR_VAR[chosen.color] || COLOR_VAR.slate);
      $('#collectWarn').classList.remove('is-on');
    });
    $('#collectTagInput').addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      var v = this.value.trim().replace(/^#/, '');
      if (!v) return;
      if (state.collect.tags.length >= 4) { toast('标签最多 4 个', 'warn'); return; }
      if (state.collect.tags.indexOf(v) === -1) state.collect.tags.push(v);
      this.value = '';
      renderCollectTags();
    });
    $('#collectRefetch').addEventListener('click', function () {
      var btn = this;
      btn.disabled = true;
      btn.innerHTML = '<svg class="ic spin"><use href="#i-refresh"></use></svg>抓取中…';
      setTimeout(function () {
        $('#collectTitle').value = '设计中的留白：从版式到呼吸感';
        $('#collectTitle').style.borderBottomColor = 'var(--line)';
        btn.disabled = false;
        btn.innerHTML = '<svg class="ic"><use href="#i-refresh"></use></svg>重新抓取图标与标题';
        toast('已从页面抓取标题与图标');
      }, 800);
    });

    /* settings */
    $$('.settings-nav button').forEach(function (btn) {
      btn.addEventListener('click', function () { setPane(btn.getAttribute('data-pane')); });
    });
    $('#railSkins').addEventListener('click', function (e) {
      var dot = e.target.closest('[data-skin]');
      if (dot) setSkin(dot.getAttribute('data-skin'));
    });
    $('#skinTiles').addEventListener('click', function (e) {
      var tile = e.target.closest('[data-skin]');
      if (!tile) return;
      setSkin(tile.getAttribute('data-skin'));
    });
    $('#accentSwatches').addEventListener('click', function (e) {
      var sw = e.target.closest('.swatch');
      if (!sw) return;
      state.prefs.accent = sw.getAttribute('data-swatch');
      applyTheme();
      persist();
      toast('强调色已切换为' + (COLOR_LABEL[state.prefs.accent] || ''));
    });
    $('#densitySeg').addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-density]');
      if (!btn) return;
      setView(btn.getAttribute('data-density'));
    });
    $('#iconSizeSeg').addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-icon-size]');
      if (!btn) return;
      state.prefs.iconSize = btn.getAttribute('data-icon-size');
      persist();
      applyIconSize();
    });
    $('#bgPresets').addEventListener('click', function (e) {
      var sw = e.target.closest('[data-bg]');
      if (sw) usePreset(sw.getAttribute('data-bg'));
    });
    $('#bgUploadBtn').addEventListener('click', function () { $('#bgFile').click(); });
    $('#bgFile').addEventListener('change', function () {
      var file = this.files && this.files[0];
      if (file) setBackgroundFromFile(file);
      this.value = '';
    });
    var saveBgPref = debounce(persist, 350);
    $('#bgBlur').addEventListener('input', function () {
      state.prefs.background.blur = Number(this.value) || 0;
      applyBackground();
      saveBgPref();
    });
    $('#bgDim').addEventListener('input', function () {
      state.prefs.background.dim = Number(this.value) || 0;
      applyBackground();
      saveBgPref();
    });
    $('#bgClear').addEventListener('click', clearBackground);
    var dragDepth = 0;
    document.addEventListener('dragenter', function (e) {
      if (!e.dataTransfer) return;
      var types = Array.prototype.slice.call(e.dataTransfer.types || []);
      if (types.indexOf('Files') === -1) return;
      dragDepth++;
      $('#dropHint').classList.add('is-on');
    });
    document.addEventListener('dragover', function (e) {
      if (dragDepth > 0) e.preventDefault();
    });
    document.addEventListener('dragleave', function () {
      dragDepth = Math.max(0, dragDepth - 1);
      if (dragDepth === 0) $('#dropHint').classList.remove('is-on');
    });
    document.addEventListener('drop', function (e) {
      dragDepth = 0;
      $('#dropHint').classList.remove('is-on');
      if (!e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files.length) return;
      e.preventDefault();
      var file = e.dataTransfer.files[0];
      if (file && /^image\//.test(file.type || '')) {
        setBackgroundFromFile(file);
      } else {
        toast('请拖入图片文件（JPG / PNG / WebP）', 'warn');
      }
    });
    $('#davUrl').addEventListener('input', function () { state.sync.url = this.value.trim(); persistSync(); });
    $('#davUser').addEventListener('input', function () { state.sync.user = this.value.trim(); persistSync(); });
    $('#davPass').addEventListener('input', function () { state.sync.pass = this.value; persistSync(); });
    $('#davDir').addEventListener('input', function () { state.sync.dir = this.value.trim(); persistSync(); });
    $('#davPassToggle').addEventListener('click', function () {
      var input = $('#davPass');
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      this.innerHTML = '<svg class="ic"><use href="' + (show ? '#i-eye-off' : '#i-eye') + '"></use></svg>';
    });
    $('#testConn').addEventListener('click', testConnection);
    $('#syncNow').addEventListener('click', runSync);
    $('#syncRules').addEventListener('click', function (e) {
      var rule = e.target.closest('.rule');
      if (!rule) return;
      var input = rule.querySelector('input');
      input.checked = true;
      state.sync.mode = input.value;
      $$('#syncRules .rule').forEach(function (r) { r.classList.toggle('is-on', r === rule); });
      persist();
    });
    $('#autoSync').addEventListener('change', function () { state.sync.auto = this.checked; persist(); setupAutoSync(); toast(this.checked ? '已开启自动同步' : '已关闭自动同步'); });
    $('#syncInterval').addEventListener('change', function () { state.sync.interval = this.value; persist(); setupAutoSync(); });
    $('#clearLog').addEventListener('click', function () { state.sync.logs = []; renderLogs(); persist(); });
    $('#defaultShelf').addEventListener('change', function () { state.prefs.defaultShelf = this.value; persist(); });
    $('#showTime').addEventListener('change', function () { state.prefs.showTime = this.checked; persist(); renderLibrary(); });
    $('#autoIcon').addEventListener('change', function () { state.prefs.autoIcon = this.checked; persist(); toast(this.checked ? '已开启图标抓取' : '已使用首字标记'); });
    $('#showGreeting').addEventListener('change', function () { state.prefs.showGreeting = this.checked; persist(); renderHero(); });

    /* data */
    $('#dataExportJson').addEventListener('click', exportJson);
    $('#dataExportHtml').addEventListener('click', exportHtml);
    $('#dataImport').addEventListener('click', function () { $('#fileInput').click(); });
    $('#fileInput').addEventListener('change', function () {
      var file = this.files && this.files[0];
      if (file) handleFile(file);
      this.value = '';
    });
    $('#dataReset').addEventListener('click', function () {
      askConfirm('清空本地数据？', '这会移除本机的全部书签、日程、待办与笔记。云端副本保持不变，可稍后重新拉取。', '清空数据', function () {
        state.bookmarks = [];
        state.tasks = [];
        state.events = [];
        state.notes = [{ id: 'quick', title: '速记', body: '', tags: ['速记'], createdAt: Date.now(), updatedAt: 0 }];
        state.ui.noteId = 'quick';
        state.categories = [{ id: 'inbox', name: '未分类', color: 'slate' }];
        state.prefs.defaultShelf = 'inbox';
        state.ui.filter = 'all';
        persist();
        renderAll();
        setPage('overview');
        toast('本地数据已清空');
      });
    });

    /* confirm */
    $('#confirmCancel').addEventListener('click', function () { closeOverlay('confirmOverlay'); });
    $('#confirmOk').addEventListener('click', function () {
      var cb = state.confirmCb;
      state.confirmCb = null;
      closeOverlay('confirmOverlay');
      if (typeof cb === 'function') cb();
    });

    /* palette */
    $('#paletteBtn').addEventListener('click', openPalette);
    $('#palInput').addEventListener('input', function () { renderPalette(this.value); });
    $('#palInput').addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); highlightPalette(state.paletteIndex + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); highlightPalette(state.paletteIndex - 1); }
      else if (e.key === 'Enter') { e.preventDefault(); activatePalette(state.paletteIndex); }
    });
    $('#palBody').addEventListener('click', function (e) {
      var item = e.target.closest('.pal-item');
      if (!item) return;
      activatePalette(parseInt(item.getAttribute('data-index'), 10));
    });
    $('#palBody').addEventListener('mousemove', function (e) {
      var item = e.target.closest('.pal-item');
      if (!item) return;
      highlightPalette(parseInt(item.getAttribute('data-index'), 10));
    });

    /* overlays */
    $$('.overlay').forEach(function (ov) {
      ov.addEventListener('click', function (e) { if (e.target === ov) closeOverlay(ov.id); });
    });
    $$('[data-close]').forEach(function (btn) {
      btn.addEventListener('click', function () { closeOverlay(btn.getAttribute('data-close')); });
    });

    /* keyboard */
    window.addEventListener('storage', function (e) {
      if (e.key !== KEY) return;
      restore();
      renderAll();
    });

    document.addEventListener('keydown', function (e) {
      var tag = (e.target.tagName || '').toLowerCase();
      var typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
      if (e.key === 'Escape') { closeTopLayer(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if ($('#paletteOverlay').classList.contains('is-open')) closeOverlay('paletteOverlay');
        else openPalette();
        return;
      }
      if (e.key === '/' && !typing) {
        e.preventDefault();
        setPage('search');
        setTimeout(function () { if ($('#searchPageInput')) $('#searchPageInput').focus(); }, 90);
        return;
      }
      if (e.key === 'n' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); openEditor(); }
    });


  }

  function setView(v) {
    state.ui.view = v;
    $('#viewGrid').classList.toggle('is-active', v === 'grid');
    $('#viewList').classList.toggle('is-active', v === 'list');
    $$('#densitySeg button').forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-density') === v); });
    renderLibrary();
  }

  function openUrl(url) {
    var b = null;
    state.bookmarks.forEach(function (x) { if (x.url === url) b = x; });
    if (b) {
      b.visits = (b.visits || 0) + 1;
      b.lastVisited = Date.now();
      persist();
      renderRecents();
      if (state.selectedId === b.id) fillInspector(b);
    }
    window.open(url, '_blank', 'noopener');
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast('链接已复制'); }, function () { toast('复制失败，请手动选择', 'warn'); });
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); toast('链接已复制'); } catch (e) { toast('复制失败', 'warn'); }
      ta.remove();
    }
  }

  function resetForExtensionFirstRun() {
    state.categories = [
      { id: 'read', name: '阅读清单', color: 'sage' },
      { id: 'design', name: '设计灵感', color: 'rose' },
      { id: 'later', name: '稍后读', color: 'amber' }
    ];
    state.bookmarks = [];
    state.tasks = [];
    state.events = [];
    state.notes = [{
      id: 'welcome', title: '欢迎使用稚签',
      body: '把想留下的页面拖进来，或点右上角「收藏当前页」。\n\n⌘K 打开快捷面板，/ 直接搜索；设置里可以连接坚果云 WebDAV。',
      tags: ['开始'], createdAt: Date.now(), updatedAt: Date.now()
    }];
    state.searchHistory = [];
    state.collect = { catId: 'read', tags: [], title: '', url: '', host: '' };
    state.ui.noteId = 'welcome';
    state.ui.page = 'overview';
    state.prefs.defaultShelf = 'read';
    state.prefs.profile = { name: 'YG', avatar: '', color: 'indigo', updatedAt: 0 };
    state.prefs.dashboardLayout = 'full';
    state.prefs.startPage = 'overview';
    state.prefs.onboarded = false;
    state.sync.connected = false;
    state.sync.status = 'idle';
    state.sync.lastSync = 0;
    state.sync.size = '—';
    state.sync.logs = [{ t: Date.now(), msg: '首次启动 · 还没有连接 WebDAV', ok: true }];
  }

  /* ---------------- boot ---------------- */
  var hadStored = !!(localStorage.getItem(KEY) || localStorage.getItem(OLD_KEY));
  restore();
  if (isExtension() && !hadStored) resetForExtensionFirstRun();
  if (!state.prefs.profile) state.prefs.profile = { name: 'YG', avatar: '', color: 'indigo', updatedAt: 0 };
  if (!state.prefs.profile.name) state.prefs.profile.name = 'YG';
  if (!state.prefs.dashboardLayout) state.prefs.dashboardLayout = 'full';
  if (state.prefs.startPage !== 'search') state.prefs.startPage = 'overview';
  if (!state.sync.deviceName) state.sync.deviceName = (isExtension() ? '这台设备' : '本机');
  persist();
  if (!state.categories.length) {
    state.categories = [{ id: 'inbox', name: '未分类', color: 'slate' }];
    state.prefs.defaultShelf = 'inbox';
  }
  if (!catById(state.prefs.defaultShelf)) {
    state.prefs.defaultShelf = state.categories[0].id;
  }
  applyTheme();
  applyBackground();
  applyIconSize();
  (function () {
    var bg0 = bgState();
    if (bg0.type === 'image' && !bg0.tone) {
      detectToneFromUrl(bg0.value, function (tone) {
        bg0.tone = tone;
        persist();
        applyBackground();
      });
    }
  })();
  renderFocus();
  renderAll();
  setView(state.ui.view);
  bindEvents();
  setupAutoSync();
  checkTaskReminders();
  setInterval(checkTaskReminders, 30000);
  if (isExtension()) {
    $$('.logo').forEach(function (el) {
      if (el.querySelector('img')) return;
      var img = document.createElement('img');
      img.src = 'icons/icon48.png';
      img.alt = '';
      el.textContent = '';
      el.classList.add('has-app-icon');
      el.appendChild(img);
    });
    if ($('#collectBtnText')) $('#collectBtnText').textContent = '用工具栏收藏';
    if ($('#appVersionFoot')) $('#appVersionFoot').innerHTML = '稚签 v1.1.2<br/>扩展 · 2026.10';
    if ($('#aboutVersion')) $('#aboutVersion').textContent = '扩展 v1.1.2 · 2026.10.23';
  }
  setPage(state.prefs.startPage === 'search' ? 'search' : 'overview');
  var bootParams = new URLSearchParams(location.search);
  if (isExtension() && !state.prefs.onboarded && bootParams.get('collect') !== '1') setTimeout(openOnboarding, 520);
  (function () {
    var qp = bootParams;
    if (qp.get('collect') !== '1') return;
    var url = qp.get('url') || '';
    if (!url) return;
    state.collect.url = url;
    state.collect.host = hostOf(url);
    state.collect.title = qp.get('title') || hostOf(url);
    state.collect.tags = [];
    document.body.classList.add('collect-window');
    setTimeout(openCollect, 260);
  })();
  window.__zhiqian = {
    state: state,
    openCollect: openCollect,
    openSettings: openSettings,
    openPalette: openPalette,
    openEditor: openEditor,
    openShelf: openShelf,
    openInspector: openInspector,
    openEvent: openEvent,
    openTask: openTask,
    toggleTask: toggleTask,
    quickAddTask: quickAddTask,
    setPage: setPage,
    checkTaskReminders: checkTaskReminders,
    applyBackground: applyBackground,
    applyIconSize: applyIconSize,
    closeAll: function () {
      $$('.overlay.is-open').forEach(function (o) { o.classList.remove('is-open'); });
      closeInspector();
      document.body.style.overflow = '';
    },
    applyTheme: applyTheme,
    renderAll: renderAll,
    toast: toast
  };
  window.__shiqian = window.__zhiqian;
  var hash = (location.hash || '').replace('#', '');
  if (!hash) {
    setTimeout(function () {
      toast(isExtension() ? '稚签已就绪 · 用工具栏收藏网页，按 ⌘K 快速搜索' : '稚签已就绪 · 按 ⌘K 快速搜索，拖拽书签到左侧书架');
    }, 700);
  }
  if (hash === 'collect') setTimeout(openCollectEntry, 250);
  else if (hash === 'settings') setTimeout(function () { openSettings('sync'); }, 250);
  else if (hash === 'appearance') setTimeout(function () { openSettings('appearance'); }, 250);
  else if (hash === 'data') setTimeout(function () { openSettings('data'); }, 250);
  else if (hash === 'palette') setTimeout(openPalette, 250);
  else if (hash === 'search') setTimeout(function () { setPage('search'); }, 250);
  else if (hash === 'dark') { state.prefs.skin = 'midnight'; state.prefs.accent = 'indigo'; applyTheme(); persist(); }
})();
