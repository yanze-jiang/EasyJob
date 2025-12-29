// @ts-ignore - pdf-parse doesn't have proper TypeScript definitions
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

/**
 * Extract text from PDF file
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer)
    const text = data.text || ''
    if (!text.trim()) {
      throw new Error('PDF file appears to be empty or contains no extractable text')
    }
    return text
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    if (error instanceof Error && error.message.includes('empty')) {
      throw error
    }
    throw new Error(`Failed to extract text from PDF file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Extract text from Word document (.docx)
 */
export async function extractTextFromWord(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer })
    const text = result.value || ''
    if (!text.trim()) {
      throw new Error('Word document appears to be empty or contains no extractable text')
    }
    return text
  } catch (error) {
    console.error('Error extracting text from Word document:', error)
    if (error instanceof Error && error.message.includes('empty')) {
      throw error
    }
    throw new Error(`Failed to extract text from Word document: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Extract text from resume file based on file type
 */
export async function extractResumeText(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  
  switch (extension) {
    case '.pdf':
      return await extractTextFromPDF(buffer)
    case '.docx':
      return await extractTextFromWord(buffer)
    case '.doc':
      // .doc files require different handling, for now throw an error
      throw new Error('DOC format is not supported. Please convert to DOCX or PDF.')
    default:
      throw new Error(`Unsupported file format: ${extension}`)
  }
}

