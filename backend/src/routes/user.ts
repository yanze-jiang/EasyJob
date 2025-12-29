import { Router, Request, Response } from 'express'
import { authenticate } from '../middleware/auth'
import {
  findUserById,
  findUserByEmail,
  updateUser,
  usernameExistsForOtherUser,
  hashPassword,
  comparePassword,
} from '../services/authService'
import { getUserStats } from '../services/userStatsService'

const router = Router()

// 获取当前用户信息和统计数据（需要认证）
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: '未认证',
      })
    }

    // 获取用户基本信息
    const user = await findUserById(req.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在',
      })
    }

    // 获取用户统计数据
    const stats = await getUserStats(req.userId)
    if (!stats) {
      return res.status(404).json({
        success: false,
        error: '无法获取用户统计',
      })
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          createdAt: user.createdAt,
        },
        stats: {
          projectsPolished: stats.projectsPolished,
          cvsEdited: stats.cvsEdited,
          coverLettersGenerated: stats.coverLettersGenerated,
          totalTokensUsed: stats.totalTokensUsed,
        },
      },
    })
  } catch (error) {
    console.error('获取用户信息错误:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    })
  }
})

// 更新用户信息（需要认证）
router.put('/me', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: '未认证',
      })
    }

    const { username, password, newPassword } = req.body

    // 验证至少提供一个要更新的字段
    if (!username && !password && !newPassword) {
      return res.status(400).json({
        success: false,
        error: '请提供要更新的字段',
      })
    }

    // 如果要更新用户名，验证用户名
    if (username !== undefined) {
      if (username.length < 2 || username.length > 20) {
        return res.status(400).json({
          success: false,
          error: '用户名长度应在2-20个字符之间',
        })
      }

      // 检查用户名是否被其他用户使用
      if (await usernameExistsForOtherUser(username, req.userId)) {
        return res.status(400).json({
          success: false,
          error: '该用户名已被使用',
        })
      }
    }

    // 如果要更新密码，验证旧密码和新密码
    if (newPassword !== undefined) {
      if (!password) {
        return res.status(400).json({
          success: false,
          error: '请提供当前密码',
        })
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: '新密码长度至少为6个字符',
        })
      }

      // 验证当前密码
      const user = await findUserById(req.userId)
      if (!user) {
        return res.status(404).json({
          success: false,
          error: '用户不存在',
        })
      }

      // 需要获取密码哈希来验证
      const userWithPassword = await findUserByEmail(user.email)
      if (!userWithPassword) {
        return res.status(404).json({
          success: false,
          error: '用户不存在',
        })
      }

      const isPasswordValid = await comparePassword(
        password,
        userWithPassword.passwordHash
      )

      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          error: '当前密码错误',
        })
      }
    }

    // 构建更新对象
    const updates: { username?: string; passwordHash?: string } = {}

    if (username !== undefined) {
      updates.username = username
    }

    if (newPassword !== undefined) {
      updates.passwordHash = await hashPassword(newPassword)
    }

    // 更新用户信息
    const updatedUser = await updateUser(req.userId, updates)

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: '用户不存在',
      })
    }

    res.json({
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          username: updatedUser.username,
          createdAt: updatedUser.createdAt,
        },
      },
    })
  } catch (error) {
    console.error('更新用户信息错误:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    })
  }
})

export default router

