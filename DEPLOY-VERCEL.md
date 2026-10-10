# 🚀 把「买前审批」部署到 Vercel —— 手机/微信都能打开

> 目标：拿到一个永久公网网址（如 `https://buy-approval-liuhaiyuu.vercel.app`），
> 发给任何人，手机微信里点开就能用。
>
> 全程约 10 分钟，完全免费。

---

## 第一步：在 GitHub 创建空仓库（2 分钟）

1. 打开 https://github.com/new
2. **Repository name** 填：`buy-approval`（或者你喜欢的名字）
3. 选 **Private**（私有，只有你能看）或 **Public** 都行
4. ⚠️ **不要勾选** "Add a README file"、"Add .gitignore"、"Choose a license" —— 保持空仓库
5. 点 **Create repository**

创建后页面会显示一个仓库地址，长这样（复制下来备用）：
```
https://github.com/liuhaiyuu/buy-approval.git
```

---

## 第二步：把代码推到 GitHub（3 分钟）

在本地终端（就是现在这个项目目录）执行下面命令。
**把 `<你的仓库地址>` 换成第一步复制的那个地址**：

```bash
cd /home/z/my-project

# 关联你的 GitHub 仓库
git remote add origin https://github.com/liuhaiyuu/buy-approval.git

# 推送所有代码和历史
git push -u origin main
```

> 如果提示输入账号密码：
> - 用户名：你的 GitHub 用户名 `liuhaiyuu`
> - 密码：**不能用 GitHub 登录密码**，要用 Personal Access Token
>   - 去 https://github.com/settings/tokens 生成一个
>   - 勾选 `repo` 权限，过期时间选 90 天
>   - 生成后复制 token，当密码粘贴

推送成功后，刷新你的 GitHub 仓库页面，能看到所有代码文件就对了 ✅

---

## 第三步：在 Vercel 部署（3 分钟）

1. 打开 https://vercel.com ，点右上角 **Sign Up / Log In**
2. 选 **Continue with GitHub**，用 GitHub 账号登录，授权
3. 登录后点 **Add New... → Project**
4. 在 "Import Git Repository" 列表里找到 `buy-approval` 仓库，点 **Import**
5. **配置环境变量**（重要！这一步不能漏）：
   - 展开下方的 **Environment Variables**
   - 加第一条：
     - Name: `DATABASE_URL`
     - Value: `file:./db/custom.db`
   - 加第二条（可选，用于分享卡片）：
     - Name: `NEXT_PUBLIC_SITE_URL`
     - Value: 先留空，部署后拿到域名再回来填
6. 其他都不用改（Framework Preset 会自动识别成 Next.js）
7. 点 **Deploy** 🎉

等 1-2 分钟，出现满屏撒花就部署成功了！页面会给你一个网址：
```
https://buy-approval-liuhaiyuu.vercel.app
```

点开它，在手机微信里发给自己，就能用了！🎉🎉🎉

---

## 第四步（可选但推荐）：让数据不丢失

Vercel 免费版是 Serverless，**每次冷启动后文件系统会重置**——
意味着你提交的申请单和上传的截图，过一段时间会消失。

### 如果只是两人玩、不在乎历史记录
直接用上面的网址就行，重新提交也很快。

### 如果想数据永久保留
按 `DEPLOY.md` 文档里的「Turso 云 SQLite」方案配置，大约再加 10 分钟。
简单说就是：
1. 注册 https://turso.tech （免费）
2. 建个数据库，拿到连接串
3. 在 Vercel 环境变量里把 `DATABASE_URL` 换成 Turso 的连接串

---

## 常见问题

**Q: 推送代码时报错 `Permission denied` / `Authentication failed`？**
A: 用 Personal Access Token 当密码，不是 GitHub 登录密码。见第二步说明。

**Q: Vercel 部署报错 `build failed`？**
A: 检查环境变量 `DATABASE_URL` 是否配了。如果还报错，把错误信息发给我看。

**Q: 部署成功但打开是白屏？**
A: 按 F12 看浏览器控制台报什么错，截图发我。

**Q: 微信里打开提示风险？**
A: `*.vercel.app` 域名偶尔会被微信提示，点"继续访问"即可。
   想完全无提示，绑定自己的备案域名（Vercel 项目设置 → Domains）。

**Q: 想改个更短的网址？**
A: Vercel 项目 → Settings → Domains，可以加自定义域名，
   或者改 Vercel 默认的子域名（在 Domains 里编辑）。

---

## 部署成功后

拿到永久网址后：
- 📱 微信里发给自己/对方，加浮窗随时用
- 📲 安卓：微信里打开 → 右上角 ··· → 添加到桌面
- 🍎 iOS：Safari 打开 → 分享 → 添加到主屏幕
- ⭐ 收藏，从「我-收藏」随时进

有任何步骤卡住，截图发我，我帮你看 🐻
