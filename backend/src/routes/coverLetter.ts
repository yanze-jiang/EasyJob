import { Router, Request, Response } from 'express'
import { generateCoverLetter, modifyCoverLetter, CoverLetterInput } from '../services/llmService'
import { authenticate } from '../middleware/auth'
import { incrementCoverLettersGenerated, addTokensUsed } from '../services/userStatsService'

const router = Router()

interface CoverLetterRequest {
  jobDescription: string
  resumeId?: string
  resumeContent?: string
  language?: 'en' | 'zh'
  specialRequirements?: string
}

// Cover letter generation endpoint (需要认证)
router.post('/generate', authenticate, async (req: Request, res: Response) => {
  try {
    const {
      jobDescription,
      resumeId,
      resumeContent,
      language = 'en',
      specialRequirements,
    } = req.body as CoverLetterRequest

    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Job description is required',
      })
    }

    // TODO: If resumeId is provided, fetch resume content from database
    // For now, we'll use resumeContent if provided, or placeholder
    const actualResumeContent = resumeContent || 'Resume content will be fetched from database using resumeId'

    const coverLetterInput: CoverLetterInput = {
      jobDescription: jobDescription.trim(),
      resumeContent: actualResumeContent,
      specialRequirements: specialRequirements?.trim(),
      language,
    }

    const llmResult = await generateCoverLetter(coverLetterInput)

    // 更新用户统计
    if (req.userId) {
      await incrementCoverLettersGenerated(req.userId)
      await addTokensUsed(req.userId, llmResult.tokensUsed)
    }

    res.json({
      success: true,
      data: llmResult.content,
    })
  } catch (error) {
    console.error('Error generating cover letter:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// Modify cover letter endpoint (需要认证)
router.post('/modify', authenticate, async (req: Request, res: Response) => {
  try {
    const {
      jobDescription,
      resumeId,
      resumeContent,
      currentCoverLetter,
      modificationRequirement,
      language = 'en',
    } = req.body

    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Job description is required',
      })
    }

    if (!currentCoverLetter || !currentCoverLetter.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Current cover letter is required',
      })
    }

    if (!modificationRequirement || !modificationRequirement.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Modification requirement is required',
      })
    }

    // TODO: If resumeId is provided, fetch resume content from database
    const actualResumeContent = resumeContent || 'Resume content will be fetched from database using resumeId'

    const llmResult = await modifyCoverLetter({
      jobDescription: jobDescription.trim(),
      resumeContent: actualResumeContent,
      currentCoverLetter: currentCoverLetter.trim(),
      modificationRequirement: modificationRequirement.trim(),
      language,
    })

    // 更新用户统计（修改也算生成一次）
    if (req.userId) {
      await incrementCoverLettersGenerated(req.userId)
      await addTokensUsed(req.userId, llmResult.tokensUsed)
    }

    res.json({
      success: true,
      data: llmResult.content,
    })
  } catch (error) {
    console.error('Error modifying cover letter:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

export default router

