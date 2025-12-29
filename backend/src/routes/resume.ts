import { Router, Request, Response } from 'express'
import multer from 'multer'
import { extractResumeText } from '../services/fileExtraction'

const router = Router()
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
})

// Extract text from resume file
router.post('/extract-text', upload.single('resumeFile'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      })
    }

    const { buffer, originalname } = req.file

    // Validate file type
    const validExtensions = ['.pdf', '.doc', '.docx']
    const extension = originalname.toLowerCase().substring(originalname.lastIndexOf('.'))
    
    if (!validExtensions.includes(extension)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file type. Please upload a PDF or Word document.',
      })
    }

    // Extract text from file
    const extractedText = await extractResumeText(buffer, originalname)

    res.json({
      success: true,
      data: {
        text: extractedText,
        filename: originalname,
      },
    })
  } catch (error) {
    console.error('Error extracting text from resume:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

export default router

