# 部署前检查清单

在开始部署之前，请完成以下检查项：

## ✅ 代码检查

- [x] 代码编译无错误（已通过 lint 检查）
- [x] 所有核心功能已实现
- [x] 数据库迁移脚本已准备
- [x] 部署文档已完善

## 📋 部署前必须完成的步骤

### 1. 数据库迁移（必须）

**在部署前，必须先在生产数据库上运行迁移：**

```bash
# 方法1: 使用迁移脚本运行器（推荐）
cd backend
npm run migrate

# 方法2: 直接执行 SQL
psql -d easyjob -f backend/src/db/migrate-stats.sql
```

**验证迁移成功：**
```sql
-- 连接到数据库
psql -d easyjob

-- 检查表结构
\d users

-- 应该看到以下新字段：
-- projects_polished | integer | default 0
-- cvs_edited | integer | default 0
-- cover_letters_generated | integer | default 0
-- total_tokens_used | bigint | default 0
```

### 2. 环境变量配置（必须）

#### 后端 `.env` 文件

创建 `backend/.env` 文件，包含以下内容：

```env
# 服务器配置
PORT=4000
NODE_ENV=production

# 数据库配置（必须指向生产数据库）
DATABASE_URL=postgresql://username:password@host:5432/easyjob

# JWT 密钥（⚠️ 必须更改！使用强随机字符串）
JWT_SECRET=your-strong-random-secret-key-at-least-32-characters-long

# LLM API 配置
DASHSCOPE_API_KEY=your-dashscope-api-key
LLM_MODEL=qwen-plus
```

**⚠️ 重要安全提示：**
- `JWT_SECRET` 必须是一个强随机字符串（建议使用 `openssl rand -base64 32` 生成）
- 不要使用默认值 `your-secret-key-change-in-production`
- 不要将 `.env` 文件提交到 Git

#### 前端 `.env.production` 文件

创建 `frontend/.env.production` 文件：

```env
# API 基础 URL
# 如果前后端部署在同一域名，使用：
VITE_API_BASE_URL=/api

# 如果前后端部署在不同域名，使用：
# VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### 3. 构建应用（必须）

```bash
# 构建后端
cd backend
npm install --production=false  # 确保安装所有依赖包括 devDependencies
npm run build

# 检查构建产物
ls -la dist/  # 应该看到编译后的 .js 文件

# 构建前端
cd ../frontend
npm install
npm run build

# 检查构建产物
ls -la dist/  # 应该看到 index.html 和静态资源
```

### 4. 测试构建产物（推荐）

```bash
# 测试后端构建
cd backend
npm start  # 应该能正常启动，检查日志

# 测试前端构建（使用预览模式）
cd frontend
npm run preview  # 应该能在浏览器中正常访问
```

## 🚀 部署选项

### 选项 A: 使用 PM2（推荐用于 VPS/云服务器）

```bash
# 安装 PM2
npm install -g pm2

# 启动后端
cd backend
pm2 start dist/server.js --name easyjob-backend

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs easyjob-backend
```

### 选项 B: 使用 Nginx + Systemd（推荐用于生产环境）

**后端服务（Systemd）：**

创建 `/etc/systemd/system/easyjob-backend.service`：

```ini
[Unit]
Description=EasyJob Backend API
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/EasyJob/backend
Environment="NODE_ENV=production"
EnvironmentFile=/path/to/EasyJob/backend/.env
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

启动服务：
```bash
sudo systemctl daemon-reload
sudo systemctl enable easyjob-backend
sudo systemctl start easyjob-backend
sudo systemctl status easyjob-backend
```

**前端（Nginx）：**

Nginx 配置示例：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/EasyJob/frontend/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 选项 C: 使用 Docker（可选）

可以创建 Dockerfile 进行容器化部署。

## 🔒 安全检查清单

- [ ] JWT_SECRET 已更改为强随机字符串
- [ ] 数据库密码足够强
- [ ] HTTPS 已配置（生产环境必须）
- [ ] CORS 配置正确（限制允许的域名）
- [ ] 环境变量文件（.env）未提交到 Git
- [ ] API 密钥已正确配置
- [ ] 数据库访问权限已限制

## ✅ 部署后验证

部署完成后，执行以下验证：

1. **健康检查：**
   ```bash
   curl http://your-domain.com/api/health
   # 应该返回: {"status":"ok",...}
   ```

2. **功能测试：**
   - [ ] 访问前端页面，能正常加载
   - [ ] 注册新用户功能正常
   - [ ] 登录功能正常
   - [ ] 项目润色功能正常
   - [ ] 求职信生成功能正常
   - [ ] 我的账户页面显示统计数据
   - [ ] 登出功能正常

3. **检查日志：**
   ```bash
   # PM2
   pm2 logs easyjob-backend
   
   # Systemd
   sudo journalctl -u easyjob-backend -f
   ```

## 🐛 常见问题

### 问题1: 数据库连接失败
- 检查 `DATABASE_URL` 是否正确
- 检查数据库服务是否运行
- 检查防火墙设置

### 问题2: 401 未授权错误
- 检查 JWT_SECRET 是否正确配置
- 检查 token 是否过期
- 检查认证中间件是否正常工作

### 问题3: 前端无法连接后端
- 检查 API_BASE_URL 配置
- 检查 CORS 设置
- 检查 Nginx 代理配置

### 问题4: 统计不更新
- 检查数据库迁移是否成功
- 检查后端日志，确认统计更新函数被调用
- 检查数据库表结构

## 📞 需要帮助？

如果遇到问题：
1. 查看 `DEPLOYMENT.md` 详细部署指南
2. 查看 `TROUBLESHOOTING.md` 故障排查
3. 检查后端和前端日志
4. 验证环境变量配置

## ✨ 完成部署后

部署成功后，建议：
1. 设置监控和日志收集
2. 配置自动备份（数据库）
3. 设置错误监控（如 Sentry）
4. 配置性能监控
5. 定期检查日志和统计

