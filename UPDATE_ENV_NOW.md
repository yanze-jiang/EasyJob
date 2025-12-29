# 🔧 立即更新环境变量 - 手动操作指南

## ⚡ 快速操作（请在终端执行）

### 步骤 1: 更新后端 .env 文件

打开 `backend/.env` 文件，**添加以下内容**：

```env
# JWT Secret (Generated for production)
JWT_SECRET=FxOUWLkvTp6gmL1JNs4A14mFpIrAfC+KdqAD9nqJ2y4=
```

**同时修改：**
```env
NODE_ENV=production  # 从 development 改为 production
```

**完整的 .env 文件应该是：**
```env
# Server Configuration
PORT=4000
NODE_ENV=production

# Database Configuration
DATABASE_URL=postgresql://localhost:5432/easyjob

# JWT Secret (Generated for production)
JWT_SECRET=FxOUWLkvTp6gmL1JNs4A14mFpIrAfC+KdqAD9nqJ2y4=

# Qwen API Configuration
DASHSCOPE_API_KEY=sk-d722fe109dd3467482cf6c494fcfd0ef
LLM_MODEL=qwen-plus
```

### 步骤 2: 创建前端环境变量文件

在终端执行：

```bash
cd frontend
echo "VITE_API_BASE_URL=/api" > .env.production
```

或者手动创建 `frontend/.env.production` 文件，内容：
```
VITE_API_BASE_URL=/api
```

## ✅ 完成后告诉我

更新完成后，告诉我：
1. ✅ 后端 .env 已更新（添加了 JWT_SECRET，NODE_ENV 改为 production）
2. ✅ 前端 .env.production 已创建

然后我会继续下一步：**数据库迁移和构建应用**！

