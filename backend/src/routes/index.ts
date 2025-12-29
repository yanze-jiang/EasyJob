import { Router } from 'express'
import cvRoutes from './cv'
import projectRoutes from './project'
import coverLetterRoutes from './coverLetter'
import resumeRoutes from './resume'
import authRoutes from './auth'
import userRoutes from './user'

const router = Router()

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'EasyJob API is healthy',
  })
})

// Auth routes
router.use('/auth', authRoutes)

// User routes (需要认证)
router.use('/user', userRoutes)

// Feature routes
router.use('/cv', cvRoutes)
router.use('/project', projectRoutes)
router.use('/cover-letter', coverLetterRoutes)
router.use('/resume', resumeRoutes)

export default router

