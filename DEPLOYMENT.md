# EasyJob 部署指南

本文档说明如何将 EasyJob 应用部署到生产环境。

## 📋 部署前准备清单

### 1. 数据库迁移

在部署新版本之前，需要运行数据库迁移脚本以添加用户统计字段：

```bash
# 连接到数据库并运行迁移脚本
psql -d easyjob -f backend/src/db/migrate-stats.sql
```

或者如果使用数据库管理工具，直接执行 `backend/src/db/migrate-stats.sql` 文件中的 SQL 语句。

**迁移脚本会：**
- 添加 `projects_polished` 字段（INTEGER，默认值 0）
- 添加 `cvs_edited` 字段（INTEGER，默认值 0）
- 添加 `cover_letters_generated` 字段（INTEGER，默认值 0）
- 添加 `total_tokens_used` 字段（BIGINT，默认值 0）
- 更新现有用户的统计字段为默认值

### 2. 环境变量配置

#### 后端环境变量

创建 `backend/.env` 文件（生产环境不要提交到 Git）：

```env
# 服务器配置
PORT=4000
NODE_ENV=production

# 数据库配置
DATABASE_URL=postgresql://username:password@host:5432/easyjob

# JWT 密钥（生产环境必须使用强随机密钥）
JWT_SECRET=your-strong-random-secret-key-here

# LLM API 配置（阿里云 DashScope）
DASHSCOPE_API_KEY=your-dashscope-api-key
LLM_MODEL=qwen-plus
```

**重要：**
- `JWT_SECRET` 必须是一个强随机字符串（建议至少 32 个字符）
- `DATABASE_URL` 必须指向生产数据库
- `DASHSCOPE_API_KEY` 必须有效

#### 前端环境变量

创建 `frontend/.env.production` 文件：

```env
VITE_API_BASE_URL=https://your-api-domain.com/api
```

或者如果前后端部署在同一域名下：

```env
VITE_API_BASE_URL=/api
```

### 3. 构建应用

#### 构建后端

```bash
cd backend
npm install
npm run build
```

构建产物在 `backend/dist/` 目录。

#### 构建前端

```bash
cd frontend
npm install
npm run build
```

构建产物在 `frontend/dist/` 目录。

### 4. 部署步骤

#### 选项 A: 使用 PM2 部署（推荐）

**后端：**

```bash
# 安装 PM2
npm install -g pm2

# 启动后端服务
cd backend
pm2 start dist/server.js --name easyjob-backend

# 设置开机自启
pm2 startup
pm2 save
```

**前端：**

使用 Nginx 或其他 Web 服务器部署前端静态文件：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 选项 B: 使用 Docker（可选）

可以创建 Dockerfile 和 docker-compose.yml 进行容器化部署。

### 5. 部署后验证

1. **健康检查：**
   ```bash
   curl http://your-api-domain.com/api/health
   ```

2. **测试登录：**
   - 访问前端页面
   - 尝试注册/登录
   - 检查用户信息是否正确显示

3. **测试功能：**
   - 测试项目润色功能
   - 测试求职信生成功能
   - 检查统计数据是否正确更新

4. **检查日志：**
   ```bash
   # PM2 日志
   pm2 logs easyjob-backend
   ```

### 6. 安全建议

1. **HTTPS：** 生产环境必须使用 HTTPS
2. **CORS：** 确保后端 CORS 配置正确
3. **JWT 密钥：** 使用强随机密钥，不要使用默认值
4. **数据库：** 使用强密码，限制数据库访问权限
5. **环境变量：** 不要将 `.env` 文件提交到 Git
6. **API 密钥：** 保护 LLM API 密钥，不要暴露在前端代码中

### 7. 监控和维护

1. **日志监控：** 定期检查应用日志
2. **数据库备份：** 定期备份数据库
3. **性能监控：** 监控 API 响应时间和错误率
4. **Token 使用：** 监控 LLM API 的 token 使用量

### 8. 故障排查

如果遇到问题：

1. 检查环境变量是否正确设置
2. 检查数据库连接是否正常
3. 检查 API 密钥是否有效
4. 查看应用日志
5. 检查网络和防火墙设置

## 📝 更新日志

- **2024-01-XX:** 添加用户统计功能
  - 添加数据库统计字段
  - 实现统计跟踪功能
  - 添加用户信息 API
  - 完善前端用户界面

