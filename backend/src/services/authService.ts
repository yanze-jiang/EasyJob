import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import svgCaptcha from 'svg-captcha'
import { config } from '../config/env'
import { getDbPool } from '../config/db'

// 内存存储图形验证码（生产环境应使用Redis）
const captchaCodes = new Map<string, { code: string; expiresAt: number }>()

// 生成图形验证码
export function generateCaptcha() {
  const captcha = svgCaptcha.create({
    size: 4, // 验证码长度
    ignoreChars: '0o1il', // 排除容易混淆的字符
    noise: 2, // 干扰线条数
    color: true, // 彩色
    background: '#f0f0f0', // 背景色
    width: 120,
    height: 40,
    fontSize: 50,
  })
  
  // 生成唯一ID用于标识验证码
  const captchaId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  const expiresAt = Date.now() + 5 * 60 * 1000 // 5分钟有效期
  
  // 存储验证码答案（转换为小写以便验证时不区分大小写）
  captchaCodes.set(captchaId, { 
    code: captcha.text.toLowerCase(), 
    expiresAt 
  })
  
  // 清理过期验证码
  setTimeout(() => {
    captchaCodes.delete(captchaId)
  }, 5 * 60 * 1000)
  
  return {
    id: captchaId,
    svg: captcha.data,
  }
}

// 验证图形验证码
export function verifyCaptcha(captchaId: string, userInput: string): boolean {
  const stored = captchaCodes.get(captchaId)
  if (!stored) {
    return false
  }
  
  if (Date.now() > stored.expiresAt) {
    captchaCodes.delete(captchaId)
    return false
  }
  
  // 不区分大小写验证
  const isValid = stored.code === userInput.toLowerCase().trim()
  
  // 验证后删除验证码（无论成功或失败，都只能使用一次）
  captchaCodes.delete(captchaId)
  
  return isValid
}

// 加密密码
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

// 验证密码
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// 生成JWT token
export function generateToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, config.JWT_SECRET, {
    expiresIn: '7d', // 7天有效期
  })
}

// 验证JWT token
export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as {
      userId: string
      email: string
    }
    return decoded
  } catch (error) {
    return null
  }
}

// 根据邮箱查找用户
export async function findUserByEmail(email: string) {
  const pool = getDbPool()
  const result = await pool.query(
    'SELECT id, email, username, password_hash, created_at, updated_at FROM users WHERE email = $1',
    [email]
  )
  
  if (result.rows.length === 0) {
    return null
  }
  
  const row = result.rows[0]
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// 根据ID查找用户
export async function findUserById(id: string) {
  const pool = getDbPool()
  const result = await pool.query(
    'SELECT id, email, username, created_at, updated_at FROM users WHERE id = $1',
    [id]
  )
  
  if (result.rows.length === 0) {
    return null
  }
  
  const row = result.rows[0]
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// 创建用户
export async function createUser(
  email: string,
  username: string,
  passwordHash: string
) {
  const pool = getDbPool()
  const result = await pool.query(
    'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username, created_at, updated_at',
    [email, username, passwordHash]
  )
  
  const row = result.rows[0]
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// 检查邮箱是否已存在
export async function emailExists(email: string): Promise<boolean> {
  const pool = getDbPool()
  const result = await pool.query(
    'SELECT 1 FROM users WHERE email = $1',
    [email]
  )
  return result.rows.length > 0
}

// 检查用户名是否已存在
export async function usernameExists(username: string): Promise<boolean> {
  const pool = getDbPool()
  const result = await pool.query(
    'SELECT 1 FROM users WHERE username = $1',
    [username]
  )
  return result.rows.length > 0
}

// 检查用户名是否被其他用户使用（排除指定用户ID）
export async function usernameExistsForOtherUser(
  username: string,
  excludeUserId: string
): Promise<boolean> {
  const pool = getDbPool()
  const result = await pool.query(
    'SELECT 1 FROM users WHERE username = $1 AND id != $2',
    [username, excludeUserId]
  )
  return result.rows.length > 0
}

// 更新用户信息
export async function updateUser(
  userId: string,
  updates: {
    username?: string
    passwordHash?: string
  }
) {
  const pool = getDbPool()
  const updateFields: string[] = []
  const values: unknown[] = []
  let paramIndex = 1

  if (updates.username !== undefined) {
    updateFields.push(`username = $${paramIndex}`)
    values.push(updates.username)
    paramIndex++
  }

  if (updates.passwordHash !== undefined) {
    updateFields.push(`password_hash = $${paramIndex}`)
    values.push(updates.passwordHash)
    paramIndex++
  }

  if (updateFields.length === 0) {
    throw new Error('没有要更新的字段')
  }

  // 添加 updated_at 字段
  updateFields.push(`updated_at = CURRENT_TIMESTAMP`)
  values.push(userId)

  const query = `
    UPDATE users 
    SET ${updateFields.join(', ')} 
    WHERE id = $${paramIndex}
    RETURNING id, email, username, created_at, updated_at
  `

  const result = await pool.query(query, values)

  if (result.rows.length === 0) {
    return null
  }

  const row = result.rows[0]
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

