# 🔧 修复环境变量配置

## 发现的问题

根据你的 `.env` 文件，需要修复以下问题：

### 1. 缺少 JWT_SECRET

你的 `.env` 文件中缺少 `JWT_SECRET` 配置。这是必需的！

### 2. NODE_ENV 需要改为 production

当前是 `development`，部署时需要改为 `production`。

## 修复步骤

### 步骤 1: 生成 JWT_SECRET

我已经为你生成了强随机密钥（见下方）。请复制它。

### 步骤 2: 更新 .env 文件

打开 `backend/.env` 文件，添加或修改以下配置：

```env
# Server Configuration
PORT=4000
NODE_ENV=production  # 改为 production

# Database Configuration
DATABASE_URL=postgresql://localhost:5432/easyjob

# JWT Secret (添加这一行)
JWT_SECRET=生成的密钥（见下方）

# Qwen API Configuration
DASHSCOPE_API_KEY=sk-d722fe109dd3467482cf6c494fcfd0ef
LLM_MODEL=qwen-plus
```

### 步骤 3: 创建前端环境变量

创建 `frontend/.env.production` 文件，内容：
```
VITE_API_BASE_URL=/api
```

## 关于 PostgreSQL

如果 PostgreSQL 未安装，你有两个选择：

1. **安装 PostgreSQL**（推荐用于生产环境）
2. **使用远程数据库**（如果已有云数据库）

告诉我你的选择，我会继续协助！

