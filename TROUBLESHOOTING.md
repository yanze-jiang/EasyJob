# 故障排除指南

## 错误代码 -102

错误代码 -102 表示网络连接失败。这通常意味着前端无法连接到后端服务。

### 解决步骤：

#### 1. 检查后端服务是否运行

打开终端，检查后端是否正在运行：

```bash
# 查看4000端口是否被占用
lsof -i :4000

# 或者在浏览器访问
curl http://localhost:4000/health
```

如果没有运行，启动后端：

```bash
cd backend
npm run dev
```

你应该看到类似这样的输出：
```
🚀 Server is running on http://localhost:4000
📝 Health check: http://localhost:4000/health
🔌 API endpoint: http://localhost:4000/api
```

#### 2. 检查前端服务是否运行

```bash
# 查看5173端口是否被占用
lsof -i :5173

# 如果没有运行，启动前端
cd frontend
npm run dev
```

#### 3. 检查数据库连接

确保 PostgreSQL 服务正在运行，并且数据库已初始化：

```bash
# 检查PostgreSQL是否运行（macOS）
brew services list | grep postgresql

# 或者检查进程
ps aux | grep postgres

# 初始化数据库（如果还没有）
cd backend
npm run init-db
```

#### 4. 检查环境变量

确保 `backend/.env` 文件存在且配置正确：

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/easyjob
JWT_SECRET=your-secret-key-change-in-production
```

#### 5. 检查浏览器控制台

打开浏览器的开发者工具（F12），查看：
- **Network 标签**：查看API请求是否失败
- **Console 标签**：查看是否有错误信息

#### 6. 验证API代理配置

前端使用 Vite 代理将 `/api` 请求转发到 `http://localhost:4000`。

检查 `frontend/vite.config.ts`：

```typescript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:4000',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

如果修改了配置，需要**重启前端服务**才能生效。

#### 7. 手动测试API

在浏览器控制台或使用 curl 测试：

```javascript
// 在浏览器控制台测试
fetch('http://localhost:4000/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

或者使用 curl：

```bash
curl http://localhost:4000/api/health
```

### 常见问题：

#### Q: 后端启动失败，提示端口被占用

```bash
# 查找占用4000端口的进程
lsof -i :4000

# 杀死进程（替换PID为实际进程ID）
kill -9 PID

# 或者修改端口
# 在 backend/.env 中设置 PORT=4001
```

#### Q: 数据库连接失败

```bash
# 检查PostgreSQL服务
brew services start postgresql

# 检查数据库是否存在
psql -l | grep easyjob

# 如果不存在，创建数据库
createdb easyjob
```

#### Q: 前端代理不工作

1. 确保 `vite.config.ts` 中的代理配置正确
2. 重启前端开发服务器
3. 清除浏览器缓存或使用无痕模式

#### Q: CORS 错误

后端已经配置了 CORS，如果仍然遇到问题，检查：

```typescript
// backend/src/server.ts
app.use(cors())
```

#### Q: 验证码发送失败

1. 检查后端控制台是否有错误
2. 确保邮箱格式正确
3. 检查验证码服务的日志

### 调试技巧：

1. **启用详细日志**：
   - 前端：查看浏览器控制台
   - 后端：查看终端输出

2. **使用网络工具**：
   - Chrome DevTools Network 标签
   - Postman 测试API

3. **检查端口占用**：
   ```bash
   lsof -i :4000  # 后端端口
   lsof -i :5173  # 前端端口
   ```

4. **查看完整错误信息**：
   - 浏览器控制台的完整错误堆栈
   - 后端终端的错误日志

### 快速检查清单：

- [ ] 后端服务运行在 http://localhost:4000
- [ ] 前端服务运行在 http://localhost:5173
- [ ] PostgreSQL 服务正在运行
- [ ] 数据库 `easyjob` 已创建
- [ ] 数据库表已初始化（运行过 `npm run init-db`）
- [ ] `backend/.env` 文件配置正确
- [ ] 浏览器控制台没有CORS错误
- [ ] 网络请求能看到API调用


