# 404 错误故障排查指南

## 错误信息
```
Failed to extract information
HTTP error! status: 404
```

## 问题分析

404 错误表示服务器找不到请求的路由。根据代码分析，正确的路由应该是：
- **前端请求**: `/api/cv/extract-module`
- **后端路由**: `/api` (server.ts) → `/cv` (routes/index.ts) → `/extract-module` (routes/cv.ts)

**重要提示**: 如果 "Polish Project" 功能可以正常使用，说明后端服务和 Nginx 配置都是正常的，问题很可能是：
1. ✅ 服务器上的代码没有更新（没有拉取最新代码）
2. ✅ 后端服务没有重启（即使代码更新了，也需要重启才能生效）

## 🚀 快速解决方案（推荐）

**如果代码已经推送到 GitHub，在服务器上执行：**

```bash
# 方法 1: 使用自动部署脚本（推荐）
cd /path/to/EasyJob
./deploy-update.sh

# 方法 2: 手动执行以下命令
cd /path/to/EasyJob
git pull origin main
cd backend
npm install  # 如果有新依赖
npm run build
pm2 restart easyjob-backend
cd ../frontend
npm install  # 如果有新依赖
npm run build
```

## 排查步骤

### 1. 检查服务器上的代码是否最新

**在服务器上执行：**

```bash
# 进入项目目录
cd /path/to/EasyJob

# 检查当前分支和状态
git status

# 拉取最新代码
git pull origin main

# 确认新文件是否存在
ls -la backend/src/routes/cv.ts
ls -la backend/src/services/cvExtraction.ts
ls -la backend/src/services/documentGenerator.ts
```

**如果文件不存在，说明代码没有更新，需要：**
1. 确认已推送到 GitHub
2. 在服务器上执行 `git pull`

### 2. 检查后端服务是否运行

```bash
# 检查 PM2 进程
pm2 list

# 检查后端服务状态
pm2 status easyjob-backend

# 查看后端日志
pm2 logs easyjob-backend --lines 50
```

**如果服务没有运行，需要：**
```bash
cd backend
npm install  # 如果有新的依赖
npm run build
pm2 restart easyjob-backend
# 或者
pm2 start dist/server.js --name easyjob-backend
```

### 3. 检查后端路由是否正确注册

**在服务器上测试 API 端点：**

```bash
# 测试健康检查
curl http://localhost:4000/api/health

# 测试 CV 路由（需要认证，会返回 401 是正常的）
curl -X POST http://localhost:4000/api/cv/extract-module \
  -H "Content-Type: application/json" \
  -d '{"moduleType":"education","rawText":"test"}'
```

**如果返回 404，说明：**
- 路由没有正确注册
- 需要检查 `backend/src/routes/index.ts` 是否包含 `router.use('/cv', cvRoutes)`
- 需要检查 `backend/src/server.ts` 是否包含 `app.use('/api', routes)`

### 4. 检查 Nginx 配置

**检查 Nginx 配置文件（通常在 `/etc/nginx/sites-available/` 或 `/etc/nginx/conf.d/`）：**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/EasyJob/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 代理 - 确保这个配置存在且正确
    location /api {
        proxy_pass http://localhost:4000;  # 注意：不要加 /api 后缀
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

**重要：**
- `proxy_pass http://localhost:4000;` 后面**不要**加 `/api`
- 如果写成 `proxy_pass http://localhost:4000/api;` 会导致路径错误

**测试 Nginx 配置：**
```bash
# 检查配置语法
sudo nginx -t

# 重新加载配置
sudo nginx -s reload
# 或
sudo systemctl reload nginx
```

### 5. 检查前端构建是否包含最新代码

**在服务器上：**

```bash
cd frontend
git pull origin main
npm install  # 如果有新的依赖
npm run build

# 确认构建成功
ls -la dist/
```

### 6. 检查浏览器网络请求

**在浏览器中打开开发者工具（F12）：**

1. 打开 **Network** 标签
2. 尝试触发错误操作
3. 查看失败的请求：
   - **请求 URL**: 应该是 `https://your-domain.com/api/cv/extract-module`
   - **请求方法**: 应该是 `POST`
   - **状态码**: 404
   - **响应内容**: 查看服务器返回的具体错误信息

### 7. 检查后端日志

**查看详细错误日志：**

```bash
# PM2 日志
pm2 logs easyjob-backend --lines 100

# 或者如果使用 systemd
sudo journalctl -u easyjob-backend -f
```

**查找：**
- 是否有路由注册的日志
- 是否有请求到达后端的日志
- 是否有错误堆栈信息

## 常见问题和解决方案

### 问题 1: 代码没有更新

**症状**: 服务器上的 `backend/src/routes/cv.ts` 文件不存在或内容不对

**解决**:
```bash
cd /path/to/EasyJob
git pull origin main
cd backend
npm install
npm run build
pm2 restart easyjob-backend
```

### 问题 2: Nginx 代理配置错误

**症状**: 请求路径变成 `/api/api/cv/extract-module` 或直接 404

**解决**: 检查 `proxy_pass` 配置，确保是 `http://localhost:4000;` 而不是 `http://localhost:4000/api;`

### 问题 3: 后端服务没有重启

**症状**: 代码已更新，但路由仍然不存在

**解决**:
```bash
pm2 restart easyjob-backend
# 或
pm2 delete easyjob-backend
cd backend
pm2 start dist/server.js --name easyjob-backend
```

### 问题 4: 依赖没有安装

**症状**: 后端启动失败或导入错误

**解决**:
```bash
cd backend
npm install
npm run build
pm2 restart easyjob-backend
```

## 快速修复脚本

在服务器上执行以下脚本可以快速修复大部分问题：

```bash
#!/bin/bash
cd /path/to/EasyJob

# 拉取最新代码
echo "拉取最新代码..."
git pull origin main

# 更新后端
echo "更新后端..."
cd backend
npm install
npm run build

# 重启服务
echo "重启后端服务..."
pm2 restart easyjob-backend || pm2 start dist/server.js --name easyjob-backend

# 更新前端
echo "更新前端..."
cd ../frontend
npm install
npm run build

echo "完成！请检查服务状态："
pm2 status
```

## 验证步骤

修复后，按以下步骤验证：

1. **检查后端健康状态**:
   ```bash
   curl http://localhost:4000/api/health
   ```

2. **检查后端路由**:
   ```bash
   curl -X POST http://localhost:4000/api/cv/extract-module \
     -H "Content-Type: application/json" \
     -d '{"moduleType":"education","rawText":"test"}'
   ```
   应该返回 401（未授权）而不是 404（未找到）

3. **检查前端 API 调用**:
   在浏览器中测试功能，查看 Network 标签中的请求

## 如果问题仍然存在

如果按照以上步骤仍然无法解决，请提供以下信息：

1. 服务器上的 `backend/src/routes/cv.ts` 文件内容（前 10 行）
2. `pm2 logs easyjob-backend` 的输出
3. Nginx 配置文件中 `location /api` 部分
4. 浏览器 Network 标签中失败请求的详细信息
5. `curl http://localhost:4000/api/health` 的输出
