# Render 部署指南

## ✅ 部署成功后的验证步骤

### 1. 检查 Render 部署状态

在 Render Dashboard 中：
1. 进入你的后端服务页面
2. 查看 **Events** 或 **Logs** 标签
3. 确认最新的部署显示为 **Live** 状态
4. 检查构建日志中是否有错误

### 2. 验证后端 API 健康状态

在浏览器或使用 curl 测试：

```bash
# 测试健康检查端点
curl https://your-backend-service.onrender.com/api/health

# 应该返回类似：
# {"success":true,"data":{"status":"ok","timestamp":"...","message":"EasyJob API is healthy"}}
```

### 3. 验证新的 CV 路由

```bash
# 测试 CV 路由（会返回 401 未授权，这是正常的，说明路由存在）
curl -X POST https://your-backend-service.onrender.com/api/cv/extract-module \
  -H "Content-Type: application/json" \
  -d '{"moduleType":"education","rawText":"test"}'

# 如果返回 401，说明路由存在 ✅
# 如果返回 404，说明路由不存在 ❌
```

### 4. 检查前端环境变量

确保前端服务在 Render 上配置了正确的环境变量：

**前端服务需要的环境变量：**
```
VITE_API_BASE_URL=https://your-backend-service.onrender.com/api
```

或者如果前后端在同一个域名下：
```
VITE_API_BASE_URL=/api
```

### 5. 重新构建前端（如果需要）

如果前端是单独的服务：
1. 在 Render Dashboard 中进入前端服务
2. 点击 **Manual Deploy** → **Deploy latest commit**
3. 等待构建完成

## 🔍 故障排查

### 问题 1: 404 错误仍然存在

**可能原因：**
- 后端服务没有正确重启
- 构建过程中有错误
- 路由没有正确注册

**解决步骤：**

1. **检查 Render 构建日志：**
   - 进入后端服务页面
   - 查看 **Logs** 标签
   - 查找是否有 TypeScript 编译错误或运行时错误

2. **手动触发重新部署：**
   - 在 Render Dashboard 中
   - 点击 **Manual Deploy** → **Deploy latest commit**
   - 等待部署完成

3. **检查服务是否运行：**
   - 查看 **Metrics** 标签
   - 确认服务状态为 **Live**
   - 检查 CPU 和内存使用情况

### 问题 2: 前端无法连接到后端

**检查：**
1. 前端环境变量 `VITE_API_BASE_URL` 是否正确
2. 后端服务的 URL 是否正确
3. CORS 配置是否正确

### 问题 3: 构建失败

**常见原因：**
- TypeScript 编译错误
- 缺少依赖
- 环境变量未配置

**解决：**
1. 查看构建日志中的错误信息
2. 检查 `package.json` 中的依赖
3. 确保所有必需的环境变量都已配置

## 📝 Render 配置检查清单

### 后端服务配置

- [ ] **Root Directory**: `backend`（如果后端在子目录）
- [ ] **Build Command**: `npm install && npm run build`
- [ ] **Start Command**: `npm start` 或 `node dist/server.js`
- [ ] **Environment**: `Node`
- [ ] **Environment Variables**:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT` (Render 会自动设置，通常不需要手动配置)
  - [ ] `DATABASE_URL`
  - [ ] `JWT_SECRET`
  - [ ] `DASHSCOPE_API_KEY`
  - [ ] `LLM_MODEL` (可选，默认 qwen-plus)

### 前端服务配置

- [ ] **Root Directory**: `frontend`（如果前端在子目录）
- [ ] **Build Command**: `npm install && npm run build`
- [ ] **Publish Directory**: `dist`
- [ ] **Environment**: `Static Site`
- [ ] **Environment Variables**:
  - [ ] `VITE_API_BASE_URL` (指向后端 API URL)

## 🚀 快速验证脚本

在本地测试 Render 部署：

```bash
# 替换为你的实际 Render URL
BACKEND_URL="https://your-backend-service.onrender.com"

# 测试健康检查
echo "测试健康检查..."
curl "$BACKEND_URL/api/health"

# 测试 CV 路由（应该返回 401）
echo -e "\n\n测试 CV 路由..."
curl -X POST "$BACKEND_URL/api/cv/extract-module" \
  -H "Content-Type: application/json" \
  -d '{"moduleType":"education","rawText":"test"}'
```

## 📞 需要帮助？

如果问题仍然存在：
1. 查看 Render 的构建和运行时日志
2. 检查浏览器控制台的网络请求
3. 确认所有环境变量都已正确配置
4. 验证代码确实已推送到 GitHub 并成功部署
