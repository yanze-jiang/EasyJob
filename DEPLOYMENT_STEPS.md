# 🚀 EasyJob 部署步骤 - 逐步执行指南

## 当前进度

✅ **步骤 0: 准备工作**
- Node.js 和 npm 已安装
- 项目结构完整
- 代码已通过 lint 检查

⏳ **步骤 1: 环境变量配置** ← 当前步骤

## 📋 详细步骤

### 步骤 1: 环境变量配置 ⏳

#### 1.1 后端环境变量

请打开 `backend/.env` 文件，确认以下配置：

```env
PORT=4000
NODE_ENV=production
DATABASE_URL=postgresql://用户名:密码@主机:5432/easyjob
JWT_SECRET=你的强随机密钥（至少32字符）
DASHSCOPE_API_KEY=你的API密钥
LLM_MODEL=qwen-plus
```

**重要检查项：**
- [ ] `JWT_SECRET` 不是默认值（如果是默认值，运行 `openssl rand -base64 32` 生成新密钥）
- [ ] `DATABASE_URL` 指向正确的生产数据库
- [ ] `DASHSCOPE_API_KEY` 已配置

#### 1.2 前端环境变量

✅ 我已为你创建了 `frontend/.env.production` 文件，内容为：
```
VITE_API_BASE_URL=/api
```

如果前后端部署在不同域名，请修改为完整 URL。

**完成后告诉我，我们继续下一步！**

---

### 步骤 2: 安装依赖（待执行）

### 步骤 3: 数据库迁移（待执行）

### 步骤 4: 构建应用（待执行）

### 步骤 5: 测试构建（待执行）

### 步骤 6: 部署应用（待执行）

---

## 💡 提示

- 每一步完成后，我会检查并确认
- 如果遇到问题，随时告诉我
- 所有步骤都会逐步执行，不会跳过

