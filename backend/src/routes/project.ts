import { Router, Request, Response } from 'express'
import { polishProjectDescription } from '../services/llmService'
import { authenticate } from '../middleware/auth'
import { incrementProjectsPolished, addTokensUsed } from '../services/userStatsService'

const router = Router()

interface PolishRequest {
  mode: 'without-job' | 'with-job'
  outputLanguage: 'en' | 'zh'
  bulletPoints?: 2 | 3 | 4 | 5
  projectDescription: string
  targetJobDescription?: string
  specialRequirements?: string
}

// Endpoint for project polishing (需要认证)
router.post('/polish', authenticate, async (req: Request, res: Response) => {
  try {
    const { mode, outputLanguage, bulletPoints, projectDescription, targetJobDescription, specialRequirements }: PolishRequest = req.body

    // Validate required fields
    if (!projectDescription || !projectDescription.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Project description is required',
      })
    }

    if (mode === 'with-job' && (!targetJobDescription || !targetJobDescription.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Target job description is required for "with-job" mode',
      })
    }

    // Call LLM service to polish the project description
    const llmResult = await polishProjectDescription({
      description: projectDescription,
      targetJobDescription: mode === 'with-job' ? targetJobDescription : undefined,
      outputLanguage,
      bulletPoints: bulletPoints || 3,
      specialRequirements: specialRequirements || undefined,
    })

    console.log('Polished result length:', llmResult.content.length)
    console.log('Polished result preview:', llmResult.content.substring(0, 100))
    console.log('Tokens used:', llmResult.tokensUsed)

    // 更新用户统计
    if (req.userId) {
      await incrementProjectsPolished(req.userId)
      await addTokensUsed(req.userId, llmResult.tokensUsed)
    }

    res.json({
      success: true,
      data: llmResult.content,
    })
  } catch (error) {
    console.error('Error polishing project:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
    })
    
    res.status(500).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? errorStack : undefined,
    })
  }
})

export default router

