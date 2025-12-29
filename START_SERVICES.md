# 启动服务指南

## 错误信息

如果你看到以下错误：
```
http proxy error: /api/auth/captcha
AggregateError [ECONNREFUSED]
```

这说明**后端服务没有运行**。

## 解决步骤

### 1. 安装后端依赖（如果还没安装）

```bash
cd backend
npm install
```

这会安装所有依赖，包括新添加的 `svg-captcha`。

### 2. 确保数据库已初始化

```bash
cd backend
npm run init-db
```

### 3. 启动后端服务

打开**新的终端窗口**，运行：

```bash
cd backend
npm run dev
```

你应该看到：
```
🚀 Server is running on http://localhost:4000
📝 Health check: http://localhost:4000/health
🔌 API endpoint: http://localhost:4000/api
```

### 4. 验证后端服务运行正常

在浏览器访问：`http://localhost:4000/health`

或者在终端运行：
```bash
curl http://localhost:4000/health
```

应该返回：
```json
{"status":"ok","message":"EasyJob backend is running"}
```

### 5. 保持两个服务运行

你需要**同时运行两个服务**：

**终端1 - 后端服务：**
```bash
cd backend
npm run dev
```

**终端2 - 前端服务：**
```bash
cd frontend
npm run dev
```

### 6. 访问前端

在浏览器访问：`http://localhost:5173/login` 或 `http://localhost:5173/register`

## 常见问题

### Q: 后端启动失败，提示找不到模块 'bcrypt' 或 'svg-captcha'？

A: 需要先安装依赖：
```bash
cd backend
npm install
```

### Q: 后端启动失败，提示数据库连接错误？

A: 
1. 确保 PostgreSQL 服务正在运行
2. 确保数据库 `easyjob` 已创建
3. 运行 `npm run init-db` 初始化数据库表

### Q: 前端还是显示代理错误？

A: 
1. 确认后端服务正在运行（检查 `http://localhost:4000/health`）
2. 重启前端服务
3. 清除浏览器缓存（Ctrl+Shift+R 或 Cmd+Shift+R）

