# 买前审批 · 部署到微信用（方案一：H5 链接）

> 把这个 Next.js 应用部署成公网 HTTPS 网址，在微信里点链接就能用，无需做微信小程序。

---

## 一、选一条部署路线

| 路线 | 难度 | 费用 | 适合 |
|------|------|------|------|
| **A. Vercel** | ⭐ 最简单 | 免费额度够用 | 想最快上线、不想折腾服务器 |
| **B. 自己的服务器/VPS** | ⭐⭐⭐ | 需备案域名+服务器 | 已有服务器、想数据完全自控 |

**重要：两条路都需要 HTTPS + 已备案域名**（微信里打开 http 或未备案域名会被拦截/提示风险）。

---

## 二、路线 A：Vercel 部署（推荐，5 分钟）

### 步骤 1：把代码推到 GitHub
```bash
git init
git add .
git commit -m "买前审批 H5"
# 在 GitHub 新建一个仓库，比如 buy-approval
git remote add origin https://github.com/<你的用户名>/buy-approval.git
git push -u origin main
```

### 步骤 2：在 Vercel 导入
1. 打开 https://vercel.com ，用 GitHub 账号登录
2. 点 **Add New → Project**，选刚推上去的 `buy-approval` 仓库
3. Framework Preset 会自动识别为 **Next.js**，不用改
4. **Environment Variables** 里加一条：
   ```
   DATABASE_URL = file:./db/custom.db
   ```
   （Vercel 用的是临时文件系统，每次部署数据库会重置——见下方「⚠️ Vercel 数据持久化问题」）
5. 点 **Deploy**，等 1~2 分钟拿到网址，比如 `https://buy-approval.vercel.app`

### ⚠️ Vercel 数据持久化问题
Vercel 是 Serverless，**文件系统不持久**，SQLite 文件和上传的图片会在每次冷启动后丢失。
要持久化数据，二选一：

**选项 1（推荐，免费）：换 Turso（云 SQLite）**
1. 注册 https://turso.tech ，新建一个数据库，拿到 `libsql` 连接串和 token
2. 改 Prisma schema 的 datasource：
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
     directUrl = env("DATABASE_DIRECT_URL")   // Turso 需要
   }
   ```
   实际 Turso 要用 `@prisma/adapter-libsql`，详见 https://www.prisma.io/docs/orm/overview/databases/turso
3. 上传的图片改成存到对象存储（如七牛云/OSS）或直接存 base64 到数据库

**选项 2（简单，但图片会丢）：接受重置**
只是两个人玩、不在乎历史记录，可以不处理，每次部署后重新提交。

### 步骤 3：绑定自定义域名（可选，但微信里更好看）
Vercel 默认域名 `*.vercel.app` 在微信里能打开，但分享卡片不好看。
建议绑定自己的备案域名：
1. Vercel 项目 → Settings → Domains → 添加你的域名
2. 按提示去域名服务商加 CNAME 记录
3. 等 DNS 生效，Vercel 自动签 HTTPS 证书

---

## 三、路线 B：自己的服务器 / VPS 部署

适合有备案域名 + Linux 服务器的同学。数据完全持久，图片也不会丢。

### 步骤 1：服务器准备
```bash
# 安装 Node 20+ 和 Bun
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
curl -fsSL https://bun.sh/install | bash

# 安装 Nginx（反向代理 + HTTPS）
sudo apt install -y nginx
```

### 步骤 2：把代码弄到服务器
```bash
git clone https://github.com/<你>/buy-approval.git
cd buy-approval
bun install
```

### 步骤 3：配置数据库路径（持久化）
确保 `db/` 目录和 `public/uploads/` 目录可写：
```bash
mkdir -p db public/uploads
chmod -R 755 db public/uploads
```
`.env` 文件里：
```
DATABASE_URL=file:/home/你的用户/buy-approval/db/custom.db
```

### 步骤 4：构建 + 启动
```bash
bun run db:push        # 初始化数据库表
bun run build          # 构建生产包
bun run start          # 启动，默认监听 3000 端口
```
用 `pm2` 守护进程：
```bash
npm install -g pm2
pm2 start "bun run start" --name buy-approval
pm2 save
pm2 startup            # 开机自启
```

### 步骤 5：Nginx 反向代理 + HTTPS
新建 `/etc/nginx/conf.d/buy-approval.conf`：
```nginx
server {
    listen 80;
    server_name your-domain.com;       # 换成你的备案域名

    client_max_body_size 10M;          # 允许上传截图（默认 1M 太小）

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
申请 HTTPS（用 Let's Encrypt 免费证书）：
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```
证书自动续期，搞定后访问 `https://your-domain.com` 即可。

---

## 四、在微信里怎么用 📱

部署完拿到 `https://你的域名` 后：

### 1. 发给自己/对方
在微信聊天框粘贴链接发送，点开即可使用。

### 2. 加浮窗（推荐）
点开链接 → 右上角 `···` → **浮窗**，下次从微信左上角头像处一键进入。

### 3. 添加到桌面（像 App 一样）
- **安卓**：微信里打开 → 右上角 `···` → **添加到桌面**（部分机型要在系统设置里允许微信创建快捷方式）
- **iOS**：用 Safari 打开链接 → 分享 → **添加到主屏幕**（我们已配好 PWA manifest，会显示小熊图标）

### 4. 收藏
右上角 `···` → **收藏**，从「我-收藏」随时进。

### 5. 公众号菜单（可选）
注册服务号 → 后台「自定义菜单」把链接挂上去，点菜单直接进。

---

## 五、微信里可能遇到的问题 ❓

| 现象 | 原因 | 解决 |
|------|------|------|
| 提示「已停止访问该网页」 | 域名未备案 / 被举报 | 用已备案域名 |
| 打开是白屏 | http 而非 https | 配 HTTPS 证书 |
| 图片上传失败 | Nginx `client_max_body_size` 太小 | 调到 10M |
| 分享卡片没图 | 没配 OpenGraph 图片 | 已配 mascot-bear.png，需域名一致 |
| 苹果手机下拉刷新 | 浏览器默认行为 | 正常现象，不影响使用 |

---

## 六、下一步要不要做真小程序？

如果用一段时间觉得 H5 不够「小程序味」，可以再用 **Taro** 把这个项目迁移成微信原生小程序：
- 前端页面结构基本能复用
- 后端 API 保留这套，小程序前端调接口
- 需要注册小程序账号 + 备案 + 配 request 合法域名

要迁移的时候跟我说一声，我帮你把代码改成 Taro 版本 🐻

---

## 快速自检清单 ✅

部署前确认：
- [ ] 代码已推到 GitHub
- [ ] 有 HTTPS 域名（Vercel 默认有 / VPS 用 certbot）
- [ ] 数据库路径配置正确
- [ ] 图片上传目录可写（VPS）
- [ ] Nginx `client_max_body_size` ≥ 10M（VPS）

部署后在微信里测试：
- [ ] 链接能打开，不报风险
- [ ] 申请人能上传截图 + 提交
- [ ] 审批人能改名字、通过/驳回、打赏
- [ ] 记录页能筛选、看详情
