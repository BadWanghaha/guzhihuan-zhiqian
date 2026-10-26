# 稚签 · Chrome / Edge 扩展

版本 **1.1.2**，Manifest V3。新标签页就是稚签工作台，工具栏和右键菜单负责快速收藏。

## 安装

1. 打开 edge://extensions 或 chrome://extensions
2. 打开右上角「开发人员模式」
3. 点「加载解压缩的扩展」，选择本目录 extension
4. 新开一个标签页；把「稚签」固定到工具栏

Edge 和 Chrome 的 Manifest V3 都可用，最低 Chrome 116。首次启动会先走一页新手引导：名字、底色、首页风格，再进入空工作台。

## 已实现

- **新标签页**：完整工作台，概览、搜索、书签、日程、待办、笔记、专注、设置
- **工具栏弹窗**：读取当前标签页，一键「收藏当前页」；也可以打开工作台或设置
- **右键菜单**：页面、链接、选中文字上出现「收藏到稚签」，打开 460×720 的收藏窗
- **独立搜索页**：必应 / Google / 百度 / DuckDuckGo / Perplexity；网址直接打开，本地结果与最近搜索
- **个人资料**：名字、头像上传/裁剪/压缩、底色；首页问候和左下角头像同步变化
- **新手引导**：首次启动设置名字、底色和四套皮肤之一；同步可以稍后
- **WebDAV 同步**：真实 PROPFIND / GET / PUT / MKCOL，支持 ETag 乐观锁、412 重试、按 id 与 updatedAt 合并
- **同步码**：把 URL、用户名、路径和应用密码 AES-GCM 加密成 ZQ1 码；新设备粘贴 + 同步密码即可填好
- **启动页**：设置里选择新标签页先打开概览还是搜索；搜索页在桌面自动聚焦
- **首页布局**：完整 / 安静 / 专注三套；安静隐藏周统计和月历，专注只留待办和速记
- **待办提醒**：日期时间、到点浏览器通知、已过提醒标记
- **稍后读与归档**：摘录、阅读器、已读、归档筛选；摘录参与搜索
- **页面打开时的自动同步**：15 分钟默认间隔；新标签页关闭后不会后台运行
- **本地优先**：没有账号、没有遥测；数据在扩展自己的 localStorage 里

## WebDAV 坚果云

1. 打开工作台 → 设置 → WebDAV
2. 服务器：https://dav.jianguoyun.com/dav/
3. 用户名：坚果云登录邮箱
4. 应用密码：坚果云「账户信息 → 安全选项 → 添加应用密码」生成，不是登录密码
5. 远程路径：/zhiqian/workspace.json
6. 点「测试连接」，成功后点「立即同步」

换设备时也可以点「生成同步码」：设置一个同步密码，复制 ZQ1 码；新设备点「导入同步码」，粘贴并输入同一个密码，配置会自动填好。同步码里包含应用密码，按密码级别保管。

坚果云域名已在 manifest 里预授权。其它 WebDAV 服务第一次测试时会弹出域名授权，同意后才能访问；权限只覆盖你填的那一个 origin。

## 数据边界

- 工作台数据：localStorage 键 zhiqian.proto.v1；旧 shiqian.proto.v1 会自动读取并重写
- WebDAV 同步：categories / bookmarks / tasks / events / notes / profile（schema 4）
- 书签带 read / archived / excerpt，待办带 remindAt / reminderSent
- 不同步：搜索记录、皮肤、壁纸、番茄钟设置、设备 ID
- 合并策略：按 id 取 updatedAt / createdAt 较新的一份；两边都有但时间相同取本地
- 删除暂时没有墓碑，删除不会跨设备传播；下一次同步可能把另一台设备上的旧条目带回来

## 权限说明

- tabs：读取当前标签页标题和网址，用于收藏与右键菜单
- contextMenus：右键「收藏到稚签」
- storage / unlimitedStorage：扩展本地数据
- notifications：待办到点提醒
- host_permissions：仅 https://dav.jianguoyun.com/*
- optional_host_permissions：其它 WebDAV 域名，点击测试时按需申请

没有 content script，不注入网页，不读取浏览历史。

## 已知限制

- 仍是 localStorage，不是 IndexedDB；数据量很大时（尤其壁纸）可能触及浏览器配额
- 自动同步只在新标签页打开时运行，没有后台 alarm
- 搜索页不请求外部搜索建议 API；网页结果在搜索引擎新标签页打开
- 删除同步需要墓碑，当前版本未实现
- 提醒只在页面打开时检查，没有后台 alarm
- “阅读”是摘录 + 备注的阅读器，不是全文抓取/离线归档；全文归档下一版再做
- 收藏窗使用完整工作台页面，首次打开会加载约 430 KB 的资源

## 目录

- manifest.json
- newtab.html / app.css / app.js：由 prototype/index.html 导出，脚本外置以满足 MV3 CSP
- background.js：右键菜单、收藏窗、WebDAV 消息
- webdav.js：WebDAV 客户端与合并逻辑
- popup.html / popup.css / popup.js：工具栏弹窗
- icons/：16 / 32 / 48 / 128

## 开发

工作台源文件仍在 ../prototype/index.html。修改后重新导出 newtab.html、app.css、app.js；不要直接改 app.js，下一次导出会覆盖。
