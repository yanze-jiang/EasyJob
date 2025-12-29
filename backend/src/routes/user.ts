import { Router, Request, Response } from 'express'
import { authenticate } from '../middleware/auth'
import { findUserById } from '../services/authService'
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

export default router

