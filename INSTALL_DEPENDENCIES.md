# 安装依赖说明

## 问题

后端服务启动时出现错误：`Error: Cannot find module 'bcrypt'`

这是因为新添加的依赖包还没有安装。

## 解决方案

请在终端中运行以下命令来安装依赖：

### 后端依赖

```bash
cd backend
npm install
```

这会安装以下新添加的依赖：
- `bcrypt` - 用于密码加密
- `jsonwebtoken` - 用于JWT token生成和验证
- `@types/bcrypt` - TypeScript类型定义
- `@types/jsonwebtoken` - TypeScript类型定义

### 如果安装遇到权限问题

如果遇到权限错误，可以尝试：

1. **使用sudo（不推荐，除非必要）**：
   ```bash
   sudo npm install
   ```

2. **修复npm权限**（推荐）：
   ```bash
   # 创建npm全局目录（如果不存在）
   mkdir -p ~/.npm-global
   
   # 配置npm使用新目录
   npm config set prefix '~/.npm-global'
   
   # 添加到PATH（添加到 ~/.zshrc 或 ~/.bash_profile）
   echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
   source ~/.zshrc
   ```

3. **使用yarn替代npm**（如果已安装）：
   ```bash
   cd backend
   yarn install
   ```

### 验证安装

安装完成后，检查 `node_modules` 目录：

```bash
ls backend/node_modules | grep -E "bcrypt|jsonwebtoken"
```

应该能看到 `bcrypt` 和 `jsonwebtoken` 目录。

### 然后启动后端

```bash
cd backend
npm run dev
```

你应该能看到：
```
🚀 Server is running on http://localhost:4000
```

