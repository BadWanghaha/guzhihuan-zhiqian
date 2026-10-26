(function (root) {
  'use strict';

  function trimBase(url) {
    if (!/^https?:\/\//i.test(String(url || ''))) throw new Error('服务器地址需要以 http:// 或 https:// 开头');
    return String(url).replace(/\/+$/, '') + '/';
  }
  function fileUrl(config) {
    var base = trimBase(config.url);
    var path = String(config.dir || '/zhiqian/workspace.json').replace(/^\/+/, '');
    return new URL(path, base).toString();
  }
  function authHeader(config) {
    var raw = String(config.user || '') + ':' + String(config.pass || '');
    var bytes = new TextEncoder().encode(raw);
    var bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return 'Basic ' + btoa(bin);
  }
  function statusError(status, what) {
    if (status === 401) return new Error('401 Unauthorized · 用户名或应用密码不正确');
    if (status === 403) return new Error('403 Forbidden · 应用密码没有访问权限');
    if (status === 404) return new Error('404 Not Found · 远程目录或文件不存在');
    if (status === 409) return new Error('409 Conflict · 远程目录不存在');
    if (status === 412) return new Error('412 Precondition Failed · 云端文件已被其他设备修改');
    return new Error((what || 'WebDAV 请求失败') + ' · HTTP ' + status);
  }
  function mkdirp(url, auth) {
    return fetch(url, { method: 'MKCOL', headers: { Authorization: auth } }).then(function (res) {
      if (res.status === 201 || res.status === 200 || res.status === 405) return true;
      if (res.status === 409) throw new Error('409 Conflict · 上级目录不存在');
      if (res.status === 401 || res.status === 403) throw statusError(res.status, '创建目录失败');
      throw statusError(res.status, '创建目录失败');
    });
  }
  async function ensureParent(config, file) {
    var base = trimBase(config.url);
    var basePath = new URL(base).pathname;
    var filePath = new URL(file).pathname;
    var parent = filePath.slice(0, filePath.lastIndexOf('/') + 1);
    if (parent.indexOf(basePath) !== 0) throw new Error('远程路径必须位于服务器地址之下');
    var rel = parent.slice(basePath.length);
    var acc = basePath;
    var segments = rel.split('/').filter(Boolean);
    for (var i = 0; i < segments.length; i++) {
      acc += segments[i] + '/';
      var u = new URL(base);
      u.pathname = acc;
      await mkdirp(u.toString(), authHeader(config));
    }
  }
  function stamp(item) {
    return Number(item && (item.updatedAt || item.createdAt || 0)) || 0;
  }
  function mergeList(local, remote) {
    var map = new Map();
    (local || []).forEach(function (x) { if (x && x.id) map.set(x.id, { local: x }); });
    (remote || []).forEach(function (x) {
      if (!x || !x.id) return;
      var slot = map.get(x.id);
      if (slot) slot.remote = x; else map.set(x.id, { remote: x });
    });
    var list = [];
    var uploaded = 0, downloaded = 0, conflicts = 0;
    map.forEach(function (slot) {
      if (slot.local && slot.remote) {
        var lt = stamp(slot.local), rt = stamp(slot.remote);
        if (lt > rt) { list.push(slot.local); uploaded++; }
        else if (rt > lt) { list.push(slot.remote); downloaded++; }
        else { list.push(slot.local); }
      } else if (slot.local) { list.push(slot.local); uploaded++; }
      else { list.push(slot.remote); downloaded++; }
    });
    return { list: list, uploaded: uploaded, downloaded: downloaded, conflicts: conflicts };
  }
  function merge(local, remote) {
    local = local || {};
    remote = remote || {};
    var out = {
      app: 'zhiqian', schema: 4,
      deviceId: local.deviceId || remote.deviceId || '',
      updatedAt: Math.max(Number(local.updatedAt) || 0, Number(remote.updatedAt) || 0, Date.now()),
      categories: [], bookmarks: [], tasks: [], events: [], notes: []
    };
    var uploaded = 0, downloaded = 0, conflicts = 0;
    ['categories', 'bookmarks', 'tasks', 'events', 'notes'].forEach(function (key) {
      var m = mergeList(local[key], remote[key]);
      out[key] = m.list;
      uploaded += m.uploaded;
      downloaded += m.downloaded;
      conflicts += m.conflicts;
    });
    if (local.profile || remote.profile) {
      var lp = local.profile, rp = remote.profile;
      if (!lp) out.profile = rp;
      else if (!rp) out.profile = lp;
      else {
        out.profile = stamp(lp) >= stamp(rp) ? lp : rp;
        if (stamp(lp) > stamp(rp)) uploaded++; else if (stamp(rp) > stamp(lp)) downloaded++;
      }
    }
    return { data: out, uploaded: uploaded, downloaded: downloaded, conflicts: conflicts };
  }
  async function test(config) {
    var base = trimBase(config.url);
    var res = await fetch(base, {
      method: 'PROPFIND',
      headers: {
        Authorization: authHeader(config),
        Depth: '0',
        'Content-Type': 'application/xml; charset=utf-8',
        'Content-Length': '0'
      }
    });
    if (res.status === 401 || res.status === 403) throw statusError(res.status, '连接失败');
    if (![200, 207, 404, 405].includes(res.status)) throw statusError(res.status, '连接失败');
    return { status: res.status, server: res.headers.get('Server') || '' };
  }
  async function sync(config, local) {
    var file = fileUrl(config);
    var auth = authHeader(config);
    for (var attempt = 0; attempt < 3; attempt++) {
      var get = await fetch(file, { headers: { Authorization: auth } });
      var remote = null;
      var etag = null;
      if (get.status === 200) {
        etag = get.headers.get('ETag');
        var text = await get.text();
        if (text.trim()) {
          try { remote = JSON.parse(text); }
          catch (e) { throw new Error('云端 workspace.json 不是合法 JSON'); }
        }
      } else if (get.status !== 404 && get.status !== 204) {
        if (get.status === 401 || get.status === 403) throw statusError(get.status, '读取云端失败');
        throw statusError(get.status, '读取云端失败');
      }
      var merged = merge(local, remote);
      var body = JSON.stringify(merged.data);
      var headers = { Authorization: auth, 'Content-Type': 'application/json' };
      if (etag) headers['If-Match'] = etag;
      else headers['If-None-Match'] = '*';
      var put = await fetch(file, { method: 'PUT', headers: headers, body: body });
      if (put.status === 409) {
        await ensureParent(config, file);
        put = await fetch(file, { method: 'PUT', headers: headers, body: body });
      }
      if (put.status === 412) { await new Promise(function (r) { setTimeout(r, 160); }); continue; }
      if (!put.ok) {
        if (put.status === 401 || put.status === 403) throw statusError(put.status, '写入云端失败');
        throw statusError(put.status, '写入云端失败');
      }
      return {
        ok: true, merged: merged.data,
        uploaded: merged.uploaded, downloaded: merged.downloaded, conflicts: merged.conflicts,
        size: new TextEncoder().encode(body).length,
        etag: put.headers.get('ETag') || etag || ''
      };
    }
    throw new Error('412 Precondition Failed · 云端数据连续被修改，重试 3 次仍未同步');
  }

  root.ZHIQIAN_DAV = { test: test, sync: sync, merge: merge, fileUrl: fileUrl };
})(typeof self !== 'undefined' ? self : globalThis);
