# EasyJob - Your AI-powered career assistant

一个全栈 Web 应用，提供 AI 辅助的简历编辑、项目描述优化和求职信生成功能。

A full-stack web application for CV editing, project polishing, and cover letter writing with AI assistance.

## 项目结构 / Project Structure

```
EasyJob/
├── frontend/          # React + Vite + TypeScript 前端
├── backend/           # Node.js + Express + TypeScript 后端
├── README.md          # 本文件
├── DEPLOYMENT.md      # 部署文档
├── TROUBLESHOOTING.md # 故障排除指南
└── PRE_DEPLOYMENT_CHECKLIST.md  # 部署前检查清单
```

## 技术栈 / Tech Stack

### 前端 / Frontend
- React 18
- TypeScript
- Vite
- React Router
- CSS Modules

### 后端 / Backend
- Node.js
- Express
- TypeScript
- PostgreSQL
- JWT 认证
- 阿里云 DashScope API (Qwen 模型)

## 前置要求 / Prerequisites

- Node.js (v18 或更高版本)
- npm / yarn / pnpm
- PostgreSQL (用于数据库)

## 安装说明 / Setup Instructions

### 1. 数据库设置 / Database Setup

确保 PostgreSQL 正在运行并创建数据库：

```bash
createdb easyjob
```

或使用 psql：
```sql
CREATE DATABASE easyjob;
```

### 2. 后端设置 / Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# 编辑 .env 文件，更新 DATABASE_URL、JWT_SECRET 和 DASHSCOPE_API_KEY
npm run init-db  # 初始化数据库表
npm run migrate  # 运行数据库迁移（如果需要）
npm run dev
```

后端将运行在 `http://localhost:4000`

### 3. 前端设置 / Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# 编辑 .env 文件，如果需要更改 API 基础 URL
npm run dev
```

前端将运行在 `http://localhost:3000`

## 环境变量 / Environment Variables

### 后端 (.env)

```env
# 服务器配置
PORT=4000
NODE_ENV=development

# 数据库配置
DATABASE_URL=postgresql://localhost:5432/easyjob

# JWT 密钥（必须更改！）
JWT_SECRET=your-secret-key-change-in-production

# LLM API 配置（必需，用于 AI 功能）
DASHSCOPE_API_KEY=your-dashscope-api-key
LLM_MODEL=qwen-plus
```

### 前端 (.env)

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

## 开发 / Development

- **前端**: `cd frontend && npm run dev`
- **后端**: `cd backend && npm run dev`

## 主要功能 / Features

### ✅ 已实现功能

1. **用户认证 / User Authentication**
   - 用户注册（带邮箱验证码）
   - 用户登录
   - JWT Token 认证
   - 密码加密（bcrypt）
   - 用户统计（项目优化次数、CV 编辑次数、求职信生成次数、Token 使用量）

2. **编辑简历 / Edit CV**
   - 支持上传 PDF/Word 简历文件并提取文本
   - AI 辅助提取结构化信息，支持以下模块：
     - 基本信息（姓名、电话、邮箱、LinkedIn、GitHub）
     - 教育背景
     - 工作经历
     - 项目经历
     - 论文发表
     - 领导经验
     - **语言、技能与兴趣**（Languages, Skills & Interests）
       - AI 自动将信息提炼为三个方面：
         - Languages（语言）：整合所有语言相关信息
         - Skills（技能）：整合所有技能相关信息（编程语言、工具、框架等）
         - Interests（兴趣）：整合所有兴趣相关信息
       - 输出格式：每个方面各占一个 bullet point，内部不再细分
   - 结构化编辑界面
   - 实时预览
   - 导出为 Word (.docx) 或 PDF 格式
   - 保存简历到数据库

3. **优化项目描述 / Polish Project**
   - AI 辅助优化项目描述
   - 支持两种模式：
     - 基础模式：仅优化项目描述
     - 针对职位模式：根据目标职位描述优化项目描述
   - 可自定义要点数量
   - 支持特殊要求输入
   - 支持中英文输出

4. **生成求职信 / Write Cover Letter**
   - AI 自动生成个性化求职信
   - 支持上传简历文件或使用已保存的简历
   - 根据职位描述和简历内容生成匹配的求职信
   - 支持中英文输出

5. **我的账户 / My Account**
   - 查看用户统计信息
   - 查看已保存的简历列表
   - 管理账户信息

## API 端点 / API Endpoints

### 认证相关 / Authentication
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/verify-email` - 验证邮箱验证码

### 简历相关 / CV
- `POST /api/cv/extract` - 提取简历模块信息
- `POST /api/cv/check-completeness` - 检查模块完整性
- `POST /api/cv/generate-document` - 生成 Word/PDF 文档
- `GET /api/cv/list` - 获取已保存的简历列表
- `POST /api/cv/save` - 保存简历
- `GET /api/cv/:id` - 获取指定简历
- `DELETE /api/cv/:id` - 删除简历

### 项目优化 / Project Polish
- `POST /api/project/polish` - 优化项目描述（需要认证）

### 求职信 / Cover Letter
- `POST /api/cover-letter/generate` - 生成求职信（需要认证）

### 用户相关 / User
- `GET /api/user/stats` - 获取用户统计信息（需要认证）

## 数据库迁移 / Database Migration

如果需要运行数据库迁移（添加统计字段）：

```bash
cd backend
npm run migrate
```

## 部署 / Deployment

项目已配置支持部署到云服务器或 Docker 容器。详细部署说明请参考：

- [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署文档
- [PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md) - 部署前检查清单
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 故障排除指南

## 许可证 / License

本项目为私有项目。

## 贡献 / Contributing

欢迎提交 Issue 和 Pull Request。

