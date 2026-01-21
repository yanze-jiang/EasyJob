# 测试登录功能指南

## 准备工作

### 1. 安装依赖

```bash
# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

### 2. 初始化数据库

```bash
cd backend
npm run init-db
```

### 3. 配置环境变量

确保 `backend/.env` 文件存在并包含：

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/easyjob
JWT_SECRET=your-secret-key-change-in-production
```

### 4. 启动服务

**终端1 - 启动后端：**
```bash
cd backend
npm run dev
```

**终端2 - 启动前端：**
```bash
cd frontend
npm run dev
```

## 测试步骤

### 方法1：通过前端界面测试（推荐）

1. **访问注册页面**
   - 打开浏览器，访问 `http://localhost:5173/register`（或你的前端地址）
   
2. **填写注册信息**
   - 邮箱：例如 `test@example.com`
   - 用户名：例如 `testuser`
   - 密码：至少6位，例如 `123456`
   - 确认密码：与密码相同
   
3. **获取验证码**
   - 点击"发送验证码"按钮
   - **在开发环境下，验证码会自动填充到输入框** ✅
   - 验证码也会在后端控制台输出：`验证码 for test@example.com: 123456`
   
4. **提交注册**
   - 验证码已自动填充，直接点击"注册"按钮
   - 注册成功后会自动跳转到首页
   - Token 和用户信息会保存在 `localStorage` 中

5. **测试登录**
   - 访问 `http://localhost:5173/login`
   - 输入刚才注册的邮箱和密码
   - 点击"发送验证码"（验证码会自动填充）
   - 点击"登录"按钮

### 方法2：通过 API 直接测试

#### 1. 注册用户

```bash
# 1. 发送验证码
curl -X POST http://localhost:4000/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 响应示例：
# {
#   "success": true,
#   "message": "验证码已发送",
#   "data": {
#     "code": "123456"  // 开发环境下会返回验证码
#   }
# }

# 2. 注册（使用上一步获取的验证码）
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "123456",
    "confirmPassword": "123456",
    "code": "123456"
  }'

# 响应示例：
# {
#   "success": true,
#   "data": {
#     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#     "user": {
#       "id": "uuid",
#       "email": "test@example.com",
#       "username": "testuser"
#     }
#   }
# }
```

#### 2. 登录

```bash
# 1. 发送验证码
curl -X POST http://localhost:4000/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 2. 登录（使用上一步获取的验证码）
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456",
    "code": "123456"
  }'

# 响应示例：
# {
#   "success": true,
#   "data": {
#     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#     "user": {
#       "id": "uuid",
#       "email": "test@example.com",
#       "username": "testuser"
#     }
#   }
# }
```

#### 3. 使用 Token 访问受保护的路由（如果需要）

```bash
# 将 YOUR_TOKEN 替换为上面获取的 token
curl -X GET http://localhost:4000/api/some-protected-route \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 验证登录状态

登录成功后，可以在浏览器控制台检查：

```javascript
// 查看 token
localStorage.getItem('token')

// 查看用户信息
localStorage.getItem('user')

// 清除登录状态（退出登录）
localStorage.removeItem('token')
localStorage.removeItem('user')
```

## 注意事项

1. **验证码有效期**：验证码在5分钟后过期
2. **验证码使用**：每个验证码只能使用一次，使用后会被删除
3. **开发环境**：在开发环境下，验证码会在API响应中返回，前端会自动填充
4. **生产环境**：在生产环境下，验证码应该通过邮件发送，不会在API响应中返回

## 常见问题

### Q: 验证码发送失败？
A: 检查后端服务是否正常运行，查看后端控制台的错误信息。

### Q: 注册失败，提示"该邮箱已被注册"？
A: 该邮箱已经被使用，可以尝试使用其他邮箱，或者先登录。

### Q: 登录失败，提示"验证码错误或已过期"？
A: 验证码可能已过期（5分钟）或已使用，请重新发送验证码。

### Q: 数据库连接失败？
A: 确保 PostgreSQL 服务正在运行，并且 `DATABASE_URL` 配置正确。


