# 步骤 1: 环境变量配置

## 🔧 后端环境变量配置

你的 `backend/.env` 文件已存在。请打开它并确认包含以下配置：

### 必需配置项：

1. **DATABASE_URL** - 数据库连接字符串
   ```
   DATABASE_URL=postgresql://用户名:密码@主机:5432/easyjob
   ```

2. **JWT_SECRET** - JWT 密钥（⚠️ 必须更改！）
   - 如果还是默认值，需要生成新的强随机密钥
   - 生成方法：`openssl rand -base64 32`

3. **DASHSCOPE_API_KEY** - 阿里云 DashScope API 密钥

4. **NODE_ENV** - 设置为 `production`

### 检查清单：

请打开 `backend/.env` 文件，确认：
- [ ] DATABASE_URL 已配置并指向正确的数据库
- [ ] JWT_SECRET 不是默认值（已更改为强随机字符串）
- [ ] DASHSCOPE_API_KEY 已配置
- [ ] NODE_ENV=production

## 🔧 前端环境变量配置

需要创建 `frontend/.env.production` 文件。

### 操作步骤：

1. 在 `frontend` 目录下创建 `.env.production` 文件
2. 添加以下内容：

```env
VITE_API_BASE_URL=/api
```

如果前后端部署在不同域名，使用完整 URL：
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

## ✅ 完成检查

配置完成后，告诉我：
1. 后端 .env 文件是否已正确配置？
2. 是否需要我帮你创建前端 .env.production 文件？

准备好后，我们继续下一步！

