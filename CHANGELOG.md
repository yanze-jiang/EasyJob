# EasyJob 更新日志

## 2024-01-XX - 用户统计与认证完善版本

### ✨ 新增功能

#### 1. 用户统计跟踪系统
- **数据库增强：** 在用户表中添加了以下统计字段：
  - `projects_polished` - 项目润色总数
  - `cvs_edited` - 简历编辑总数
  - `cover_letters_generated` - 求职信生成总数
  - `total_tokens_used` - 总 Token 使用量

- **自动统计更新：** 
  - 每次使用项目润色功能时，自动增加 `projects_polished` 计数
  - 每次使用简历编辑功能时，自动增加 `cvs_edited` 计数
  - 每次生成或修改求职信时，自动增加 `cover_letters_generated` 计数
  - 每次调用 LLM API 时，自动累加 `total_tokens_used`

#### 2. Token 使用量跟踪
- LLM 服务现在返回每次 API 调用的 token 使用量
- 所有 token 使用量自动累加到用户统计中
- 在"我的账户"页面显示总 token 使用量

#### 3. 认证系统完善
- **认证中间件：** 创建了 `authenticate` 中间件保护需要登录的路由
- **路由保护：** 所有功能页面（项目润色、求职信、简历编辑、我的账户）现在都需要登录
- **用户信息 API：** 新增 `/api/user/me` 端点，返回用户信息和统计数据

#### 4. 前端用户体验改进
- **路由保护：** 未登录用户访问受保护页面时自动重定向到登录页
- **用户信息显示：** 在页面头部显示当前登录用户名
- **登出功能：** 在侧边栏添加登出按钮
- **我的账户页面：** 
  - 显示真实的用户信息（邮箱、用户名、注册时间）
  - 显示真实的统计数据（项目数、简历数、求职信数、Token 使用量）
  - 数据从后端 API 实时获取

### 🔧 技术改进

#### 后端
1. **新增文件：**
   - `backend/src/middleware/auth.ts` - 认证中间件
   - `backend/src/services/userStatsService.ts` - 用户统计服务
   - `backend/src/routes/user.ts` - 用户信息路由
   - `backend/src/db/migrate-stats.sql` - 数据库迁移脚本
   - `backend/src/db/run-migration.ts` - 迁移脚本运行器

2. **更新的文件：**
   - `backend/src/services/llmService.ts` - 返回 token 使用量
   - `backend/src/routes/project.ts` - 添加认证和统计更新
   - `backend/src/routes/coverLetter.ts` - 添加认证和统计更新
   - `backend/src/routes/cv.ts` - 添加认证保护
   - `backend/src/routes/index.ts` - 添加用户路由
   - `backend/src/db/init.sql` - 更新数据库结构

#### 前端
1. **新增文件：**
   - `frontend/src/components/ProtectedRoute.tsx` - 路由保护组件

2. **更新的文件：**
   - `frontend/src/App.tsx` - 添加路由保护
   - `frontend/src/services/api.ts` - 添加用户信息 API
   - `frontend/src/components/Layout/Layout.tsx` - 显示用户信息
   - `frontend/src/components/Layout/Sidebar.tsx` - 添加登出功能
   - `frontend/src/pages/MyAccount.tsx` - 显示真实数据
   - `frontend/src/components/Layout/Layout.css` - 用户信息样式
   - `frontend/src/components/Layout/Sidebar.css` - 登出按钮样式

### 📝 数据库迁移

在部署新版本之前，**必须**运行数据库迁移：

```bash
# 方法 1: 使用迁移脚本运行器
cd backend
npm run migrate

# 方法 2: 直接执行 SQL
psql -d easyjob -f backend/src/db/migrate-stats.sql
```

### 🚀 部署准备

已创建 `DEPLOYMENT.md` 文档，包含：
- 数据库迁移步骤
- 环境变量配置说明
- 构建和部署指南
- 安全建议
- 故障排查指南

### 🔒 安全改进

- 所有功能 API 端点现在都需要认证
- JWT token 验证更加严格
- 用户数据与统计信息隔离，只能访问自己的数据

### 📊 统计功能说明

- **项目润色：** 每次成功调用 `/api/project/polish` 时计数 +1
- **简历编辑：** 每次成功调用 `/api/cv/preview` 时计数 +1（待实现完整功能）
- **求职信生成：** 每次成功调用 `/api/cover-letter/generate` 或 `/api/cover-letter/modify` 时计数 +1
- **Token 使用：** 每次 LLM API 调用后累加实际使用的 token 数量

### ⚠️ 注意事项

1. **数据库迁移：** 部署前必须运行迁移脚本
2. **环境变量：** 确保生产环境正确配置所有必需的环境变量
3. **JWT 密钥：** 生产环境必须使用强随机密钥
4. **API 密钥：** 确保 DashScope API 密钥有效且有足够配额

### 🐛 已知问题

- CV 编辑功能目前还是占位符，统计功能已预留但待实现

### 📚 相关文档

- `DEPLOYMENT.md` - 部署指南
- `README.md` - 项目说明
- `TEST_LOGIN.md` - 登录测试指南

