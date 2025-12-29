import { Router, Request, Response } from 'express'
import {
  generateCaptcha,
  verifyCaptcha,
  hashPassword,
  comparePassword,
  generateToken,
  createUser,
  findUserByEmail,
  emailExists,
  usernameExists,
} from '../services/authService'

const router = Router()

// 获取图形验证码
router.get('/captcha', async (req: Request, res: Response) => {
  try {
    const captcha = generateCaptcha()
    
    res.json({
      success: true,
      data: {
        captchaId: captcha.id,
        captchaSvg: captcha.svg,
      },
    })
  } catch (error) {
    console.error('生成验证码错误:', error)
    res.status(500).json({
      success: false,
      error: '生成验证码失败',
    })
  }
})

// 用户注册
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, username, password, confirmPassword, captchaId, captchaCode } = req.body

    // 验证必填字段
    if (!email || !username || !password || !confirmPassword || !captchaId || !captchaCode) {
      return res.status(400).json({
        success: false,
        error: '请填写所有必填字段',
      })
    }

    // 验证邮箱格式
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: '请提供有效的邮箱地址',
      })
    }

    // 验证用户名长度
    if (username.length < 2 || username.length > 20) {
      return res.status(400).json({
        success: false,
        error: '用户名长度应在2-20个字符之间',
      })
    }

    // 验证密码长度
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: '密码长度至少为6个字符',
      })
    }

    // 验证密码确认
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: '两次输入的密码不一致',
      })
    }

    // 验证图形验证码
    if (!verifyCaptcha(captchaId, captchaCode)) {
      return res.status(400).json({
        success: false,
        error: '验证码错误或已过期',
      })
    }

    // 检查邮箱是否已存在
    if (await emailExists(email)) {
      return res.status(400).json({
        success: false,
        error: '该邮箱已被注册',
      })
    }

    // 检查用户名是否已存在
    if (await usernameExists(username)) {
      return res.status(400).json({
        success: false,
        error: '该用户名已被使用',
      })
    }

    // 加密密码
    const passwordHash = await hashPassword(password)

    // 创建用户
    const user = await createUser(email, username, passwordHash)

    // 生成token
    const token = generateToken(user.id, user.email)

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      },
    })
  } catch (error) {
    console.error('注册错误:', error)
    res.status(500).json({
      success: false,
      error: '注册失败，请稍后重试',
    })
  }
})

// 用户登录
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, captchaId, captchaCode } = req.body

    // 验证必填字段
    if (!email || !password || !captchaId || !captchaCode) {
      return res.status(400).json({
        success: false,
        error: '请填写所有必填字段',
      })
    }

    // 验证图形验证码
    if (!verifyCaptcha(captchaId, captchaCode)) {
      return res.status(400).json({
        success: false,
        error: '验证码错误或已过期',
      })
    }

    // 查找用户
    const user = await findUserByEmail(email)
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '邮箱或密码错误',
      })
    }

    // 验证密码
    const isPasswordValid = await comparePassword(password, user.passwordHash)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: '邮箱或密码错误',
      })
    }

    // 生成token
    const token = generateToken(user.id, user.email)

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      },
    })
  } catch (error) {
    console.error('登录错误:', error)
    res.status(500).json({
      success: false,
      error: '登录失败，请稍后重试',
    })
  }
})

export default router

