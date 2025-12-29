# 下一步操作指南

## 🎯 当前状态

✅ 已完成：
- 数据库结构更新（统计字段）
- 用户统计跟踪系统
- Token 使用量跟踪
- 认证系统完善
- 前端路由保护
- 用户信息显示和登出功能
- 部署文档准备

## 📋 立即执行的步骤

### 1. 运行数据库迁移（必须）

在部署或测试新功能之前，必须先运行数据库迁移：

```bash
cd backend
npm run migrate
```

或者手动执行：

```bash
psql -d easyjob -f backend/src/db/migrate-stats.sql
```

**验证迁移是否成功：**
```sql
-- 连接到数据库检查字段是否存在
psql -d easyjob
\d users
-- 应该能看到新添加的字段：
-- projects_polished, cvs_edited, cover_letters_generated, total_tokens_used
```

### 2. 测试新功能

#### 2.1 启动服务

**终端 1 - 启动后端：**
```bash
cd backend
npm run dev
```

**终端 2 - 启动前端：**
```bash
cd frontend
npm run dev
```

#### 2.2 功能测试清单

- [ ] **登录/注册测试**
  - 注册新用户
  - 登录现有用户
  - 检查是否成功跳转到首页

- [ ] **路由保护测试**
  - 未登录时访问 `/project-polish`，应该重定向到登录页
  - 未登录时访问 `/cover-letter`，应该重定向到登录页
  - 未登录时访问 `/my-account`，应该重定向到登录页

- [ ] **用户信息显示测试**
  - 登录后，检查页面头部是否显示用户名
  - 打开侧边栏，检查是否有登出按钮

- [ ] **统计功能测试**
  - 使用项目润色功能，生成一个项目描述
  - 检查"我的账户"页面，`projects_polished` 应该 +1
  - 检查 `total_tokens_used` 是否有数值
  - 使用求职信生成功能
  - 检查 `cover_letters_generated` 是否 +1
  - 检查 token 使用量是否累加

- [ ] **登出功能测试**
  - 点击登出按钮
  - 检查是否清除 token 并跳转到登录页
  - 检查是否无法再访问受保护页面

### 3. 检查常见问题

#### 3.1 如果迁移失败

**错误：字段已存在**
- 这是正常的，迁移脚本会检查字段是否存在
- 如果字段已存在，脚本会跳过，不会报错

**错误：数据库连接失败**
- 检查 `DATABASE_URL` 环境变量是否正确
- 检查 PostgreSQL 服务是否运行
- 检查数据库 `easyjob` 是否存在

#### 3.2 如果 API 调用失败

**401 未授权错误**
- 检查 token 是否在 localStorage 中
- 检查 token 是否过期（默认 7 天）
- 尝试重新登录

**500 服务器错误**
- 检查后端日志
- 检查数据库连接
- 检查环境变量配置

#### 3.3 如果统计不更新

- 检查后端日志，确认统计更新函数是否被调用
- 检查数据库，直接查询用户表看字段是否有更新
- 确认 API 调用是否成功（检查网络请求）

### 4. 准备部署到生产环境

#### 4.1 环境变量配置

**后端 `.env` 文件（生产环境）：**
```env
PORT=4000
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/easyjob
JWT_SECRET=your-strong-random-secret-key-here  # 必须更改！
DASHSCOPE_API_KEY=your-dashscope-api-key
LLM_MODEL=qwen-plus
```

**前端 `.env.production` 文件：**
```env
VITE_API_BASE_URL=https://your-api-domain.com/api
```

#### 4.2 构建应用

```bash
# 构建后端
cd backend
npm install
npm run build

# 构建前端
cd frontend
npm install
npm run build
```

#### 4.3 部署检查清单

- [ ] 数据库迁移已运行
- [ ] 环境变量已正确配置
- [ ] JWT_SECRET 已更改为强随机密钥
- [ ] 前后端已构建成功
- [ ] 数据库连接正常
- [ ] API 密钥有效
- [ ] HTTPS 已配置（生产环境必须）
- [ ] CORS 配置正确

详细部署步骤请参考 `DEPLOYMENT.md`

## 🔍 代码检查

### 检查是否有编译错误

```bash
# 后端
cd backend
npm run build

# 前端
cd frontend
npm run build
```

### 检查 Lint 错误

```bash
# 后端
cd backend
npm run lint

# 前端
cd frontend
npm run lint
```

## 📝 已知待完善功能

以下功能是占位符，不影响当前部署：

1. **CV 编辑器** - 目前是占位符页面，统计功能已预留
2. **CV 建议功能** - `generateCvSuggestions` 函数待实现

这些可以在后续版本中完善。

## 🚀 快速开始测试

如果你想快速测试所有功能，按以下顺序操作：

1. **运行迁移：**
   ```bash
   cd backend && npm run migrate
   ```

2. **启动服务：**
   ```bash
   # 终端1
   cd backend && npm run dev
   
   # 终端2
   cd frontend && npm run dev
   ```

3. **测试流程：**
   - 访问 http://localhost:5173（或前端端口）
   - 注册一个新用户
   - 登录后使用项目润色功能
   - 使用求职信生成功能
   - 查看"我的账户"页面，确认统计数据正确

## ❓ 遇到问题？

1. 查看 `TROUBLESHOOTING.md` 故障排查指南
2. 检查后端和前端控制台日志
3. 检查数据库连接和表结构
4. 确认所有环境变量已正确配置

## 🎉 完成后的下一步

功能测试通过后，你可以：

1. **部署到生产环境** - 参考 `DEPLOYMENT.md`
2. **完善 CV 编辑器功能** - 实现完整的简历编辑和统计
3. **添加更多功能** - 根据用户需求扩展功能
4. **性能优化** - 优化数据库查询和 API 响应时间
5. **添加监控** - 添加日志、错误监控和性能监控

