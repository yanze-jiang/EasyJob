import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../services/authService'

// 扩展 Express Request 类型以包含用户信息
declare global {
  namespace Express {
    interface Request {
      userId?: string
      userEmail?: string
    }
  }
}

/**
 * 认证中间件：验证JWT token并提取用户信息
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    // 从请求头获取 token
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: '未提供认证token，请先登录',
      })
    }

    const token = authHeader.substring(7) // 移除 'Bearer ' 前缀
    
    // 验证 token
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: '无效的token，请重新登录',
      })
    }

    // 将用户信息添加到请求对象
    req.userId = decoded.userId
    req.userEmail = decoded.email
    
    next()
  } catch (error) {
    console.error('认证中间件错误:', error)
    return res.status(401).json({
      success: false,
      error: '认证失败，请重新登录',
    })
  }
}

