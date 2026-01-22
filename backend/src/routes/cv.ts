import { Router, Request, Response } from 'express'
import { authenticate } from '../middleware/auth'
import { extractCVModuleData, checkModuleCompleteness } from '../services/cvExtraction'
import { addTokensUsed } from '../services/userStatsService'
import { CVModule, StructuredData } from '../types/cv'

const router = Router()

// Get list of saved resumes for the current user (需要认证)
router.get('/list', authenticate, async (req: Request, res: Response) => {
  try {
    // TODO: Implement actual database query to get user's saved resumes
    // For now, return placeholder data
    // In production, this should:
    // 1. Get user ID from authentication token
    // 2. Query database for resumes belonging to that user
    // 3. Return list of resumes with id, name, createdAt, updatedAt
    
    res.json({
      success: true,
      data: [
        // Placeholder data - remove when implementing actual database query
        // {
        //   id: '1',
        //   name: 'My Resume 2024',
        //   createdAt: new Date().toISOString(),
        //   updatedAt: new Date().toISOString(),
        // },
      ],
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// Placeholder endpoint for CV preview (需要认证)
router.post('/preview', authenticate, async (req: Request, res: Response) => {
  try {
    // Placeholder response - will be implemented with actual CV processing logic
    res.json({
      success: true,
      data: {
        message: 'CV preview endpoint - placeholder',
        input: req.body,
        suggestions: [],
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// Extract module information from raw text (需要认证)
router.post('/extract-module', authenticate, async (req: Request, res: Response) => {
  const requestId = `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  try {
    console.log(`[CV Route] ${requestId} - Extract module request received`)
    console.log(`[CV Route] ${requestId} - User ID: ${req.userId || 'unknown'}`)
    
    const { moduleType, rawText, language = 'en' } = req.body

    // Log request body (sanitized for sensitive data)
    console.log(`[CV Route] ${requestId} - Request params: moduleType=${moduleType}, language=${language}, rawText length=${rawText?.length || 0}`)
    if (isDevelopment && rawText) {
      console.log(`[CV Route] ${requestId} - Raw text preview (first 200 chars): ${rawText.substring(0, 200)}...`)
    }

    if (!moduleType || !rawText) {
      const error = 'moduleType and rawText are required'
      console.error(`[CV Route] ${requestId} - Validation error: ${error}`)
      return res.status(400).json({
        success: false,
        error,
      })
    }

    if (!['basicInfo', 'education', 'working', 'project', 'publications', 'leadership', 'skills'].includes(moduleType)) {
      const error = `Invalid moduleType: ${moduleType}. Valid types: education, working, project, publications, leadership, skills`
      console.error(`[CV Route] ${requestId} - Validation error: ${error}`)
      return res.status(400).json({
        success: false,
        error: 'Invalid moduleType',
      })
    }

    console.log(`[CV Route] ${requestId} - Calling extractCVModuleData...`)
    const result = await extractCVModuleData(moduleType as CVModule, rawText, language)
    console.log(`[CV Route] ${requestId} - Extraction successful. Tokens used: ${result.tokensUsed}`)

    // Update user statistics
    if (req.userId) {
      try {
        await addTokensUsed(req.userId, result.tokensUsed)
        console.log(`[CV Route] ${requestId} - User statistics updated`)
      } catch (statsError) {
        console.error(`[CV Route] ${requestId} - Failed to update user statistics:`, statsError)
        // Don't fail the request if stats update fails
      }
    }

    res.json({
      success: true,
      data: {
        data: result.data,
        completeness: result.completeness,
      },
    })
  } catch (error) {
    // Enhanced error logging
    console.error(`[CV Route] ${requestId} - Error extracting module:`)
    console.error(`[CV Route] ${requestId} - Error type:`, error instanceof Error ? error.constructor.name : typeof error)
    console.error(`[CV Route] ${requestId} - Error message:`, error instanceof Error ? error.message : String(error))
    
    if (error instanceof Error) {
      if (error.stack) {
        console.error(`[CV Route] ${requestId} - Error stack:`, error.stack)
      }
      
      // Categorize error types
      if (error.message.includes('LLM API') || error.message.includes('DASHSCOPE_API_KEY')) {
        console.error(`[CV Route] ${requestId} - Error category: API Configuration Error`)
      } else if (error.message.includes('parse') || error.message.includes('JSON')) {
        console.error(`[CV Route] ${requestId} - Error category: JSON Parsing Error`)
      } else if (error.message.includes('network') || error.message.includes('fetch') || error.message.includes('ECONNREFUSED')) {
        console.error(`[CV Route] ${requestId} - Error category: Network Error`)
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.error(`[CV Route] ${requestId} - Error category: Authentication Error`)
      } else if (error.message.includes('429') || error.message.includes('rate limit')) {
        console.error(`[CV Route] ${requestId} - Error category: Rate Limit Error`)
      } else {
        console.error(`[CV Route] ${requestId} - Error category: Unknown Error`)
      }
    }
    
    // Log request context for debugging
    console.error(`[CV Route] ${requestId} - Request context:`, {
      moduleType: req.body?.moduleType,
      language: req.body?.language,
      rawTextLength: req.body?.rawText?.length,
      userId: req.userId,
    })

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({
      success: false,
      error: errorMessage,
      // Include request ID in development mode for easier debugging
      ...(isDevelopment && { requestId, errorType: error instanceof Error ? error.constructor.name : typeof error }),
    })
  }
})

// Check completeness of module data (需要认证)
router.post('/check-completeness', authenticate, async (req: Request, res: Response) => {
  const requestId = `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  try {
    console.log(`[CV Route] ${requestId} - Check completeness request received`)
    const { moduleType, data, language = 'en' } = req.body

    if (!moduleType || !data) {
      const error = 'moduleType and data are required'
      console.error(`[CV Route] ${requestId} - Validation error: ${error}`)
      return res.status(400).json({
        success: false,
        error,
      })
    }

    if (!['basicInfo', 'education', 'working', 'project', 'publications', 'leadership', 'skills'].includes(moduleType)) {
      const error = `Invalid moduleType: ${moduleType}`
      console.error(`[CV Route] ${requestId} - Validation error: ${error}`)
      return res.status(400).json({
        success: false,
        error: 'Invalid moduleType',
      })
    }

    const result = await checkModuleCompleteness(moduleType as CVModule, data as StructuredData, language)
    console.log(`[CV Route] ${requestId} - Completeness check successful. Is complete: ${result.completeness.isComplete}`)

    res.json({
      success: true,
      data: result.completeness,
    })
  } catch (error) {
    console.error(`[CV Route] ${requestId} - Error checking completeness:`)
    console.error(`[CV Route] ${requestId} - Error type:`, error instanceof Error ? error.constructor.name : typeof error)
    console.error(`[CV Route] ${requestId} - Error message:`, error instanceof Error ? error.message : String(error))
    if (error instanceof Error && error.stack) {
      console.error(`[CV Route] ${requestId} - Error stack:`, error.stack)
    }
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// Generate Word document (需要认证)
router.post('/generate-word', authenticate, async (req: Request, res: Response) => {
  const requestId = `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  try {
    console.log(`[CV Route] ${requestId} - Generate Word document request received`)
    const { modules, language = 'en' } = req.body

    if (!modules || typeof modules !== 'object') {
      const error = 'modules object is required'
      console.error(`[CV Route] ${requestId} - Validation error: ${error}`)
      return res.status(400).json({
        success: false,
        error,
      })
    }

    console.log(`[CV Route] ${requestId} - Module keys: ${Object.keys(modules).join(', ')}`)
    
    // Import document generator dynamically to avoid issues if dependencies are not installed
    const { generateCVWord } = await import('../services/documentGenerator')
    console.log(`[CV Route] ${requestId} - Generating Word document...`)
    const buffer = await generateCVWord(modules, language)
    console.log(`[CV Route] ${requestId} - Word document generated. Size: ${buffer.length} bytes`)

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    res.setHeader('Content-Disposition', 'attachment; filename="cv.docx"')
    res.send(buffer)
  } catch (error) {
    console.error(`[CV Route] ${requestId} - Error generating Word document:`)
    console.error(`[CV Route] ${requestId} - Error type:`, error instanceof Error ? error.constructor.name : typeof error)
    console.error(`[CV Route] ${requestId} - Error message:`, error instanceof Error ? error.message : String(error))
    if (error instanceof Error && error.stack) {
      console.error(`[CV Route] ${requestId} - Error stack:`, error.stack)
    }
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

export default router

