import { config } from '../config/env'
import OpenAI from 'openai'

// Type definitions for LLM service inputs/outputs
export interface CvInput {
  content: string
  targetRole?: string
}

export interface CvSuggestion {
  section: string
  original: string
  suggestion: string
  reason: string
}

export interface ProjectInput {
  description: string
  technologies?: string[]
  achievements?: string[]
  targetJobDescription?: string
  outputLanguage?: 'en' | 'zh'
  bulletPoints?: 2 | 3 | 4 | 5
  specialRequirements?: string
}

export interface CoverLetterInput {
  jobDescription: string
  resumeContent: string
  language?: 'en' | 'zh'
  specialRequirements?: string
  personalInfo?: {
    name?: string
    email?: string
  }
}

export interface ModifyCoverLetterInput {
  jobDescription: string
  resumeContent: string
  currentCoverLetter: string
  modificationRequirement: string
  language?: 'en' | 'zh'
}

// LLM调用结果，包含内容和token使用量
export interface LLMResult {
  content: string
  tokensUsed: number
}

/**
 * Generate CV suggestions based on input content
 * Placeholder implementation - will be replaced with actual LLM API calls
 */
export async function generateCvSuggestions(
  input: CvInput
): Promise<CvSuggestion[]> {
  // TODO: Implement actual LLM API integration
  // Example: OpenAI, Anthropic, or local model API call
  console.log('generateCvSuggestions called with:', input)
  
  return [
    {
      section: 'Summary',
      original: input.content.substring(0, 100),
      suggestion: 'Consider adding quantifiable achievements',
      reason: 'Quantifiable metrics make your CV more impactful',
    },
  ]
}

/**
 * Initialize OpenAI client for Qwen API
 */
function getOpenAIClient(): OpenAI | null {
  const apiKey = config.DASHSCOPE_API_KEY
  if (!apiKey) {
    console.warn('DASHSCOPE_API_KEY is not set. LLM features will not work.')
    return null
  }

  return new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  })
}

/**
 * Polish project description using LLM
 * Output format:
 * 1. Project Title
 * 2. Project Date/Time
 * 3. User Role (if applicable)
 * 4. Bullet points (number specified by user, last one should summarize skills, abilities, and outputs)
 */
export async function polishProjectDescription(
  input: ProjectInput
): Promise<LLMResult> {
  const {
    description,
    targetJobDescription,
    outputLanguage,
    bulletPoints = 3,
    specialRequirements,
  } = input

  // Build the prompt for LLM
  const isZh = outputLanguage === 'zh'
  
  let systemPrompt = isZh
    ? `你是一个专业的项目描述润色助手。请根据用户提供的信息，润色项目描述并按照指定格式输出。`
    : `You are a professional project description polishing assistant. Please polish the project description based on the user's information and output in the specified format.`

  let userPrompt = isZh
    ? `请根据以下信息润色项目描述，并按照指定格式输出：\n\n`
    : `Please polish the following project description and output in the specified format:\n\n`

  // Add special requirements if provided
  if (specialRequirements && specialRequirements.trim()) {
    userPrompt += isZh
      ? `特别要求：${specialRequirements}\n\n`
      : `Special Requirements: ${specialRequirements}\n\n`
  }

  // Add project description
  userPrompt += isZh
    ? `项目描述：\n${description}\n\n`
    : `Project Description:\n${description}\n\n`

  // Add target job description if provided
  if (targetJobDescription && targetJobDescription.trim()) {
    userPrompt += isZh
      ? `目标职位描述：\n${targetJobDescription}\n\n`
      : `Target Job Description:\n${targetJobDescription}\n\n`
  }

  // Add output format requirements
  const bulletCount = bulletPoints
  userPrompt += isZh
    ? `请严格按照以下结构化格式输出（使用${bulletCount}个要点，最后一个要点要总结锻炼的技能、能力和产出）：\n\n` +
      `**项目名称：** [项目标题]\n\n` +
      `**项目时间：** [项目时间日期]\n\n` +
      `**用户角色：** [用户角色，如果适用]\n\n` +
      `**项目要点：**\n` +
      `- [要点1]\n` +
      `- [要点2]\n` +
      `- ...\n` +
      `- [要点${bulletCount}：总结锻炼了什么技能、什么能力、有什么产出]\n\n` +
      `重要：必须使用上述格式，每个部分都要有明确的标签（**项目名称：**、**项目时间：**、**用户角色：**、**项目要点：**），要点使用 - 符号开头。`
    : `Please output strictly in the following structured format (use ${bulletCount} bullet points, the last one should summarize skills, abilities, and outputs):\n\n` +
      `**Project Name:** [Project Title]\n\n` +
      `**Project Period:** [Project Date/Time]\n\n` +
      `**User Role:** [User Role, if applicable]\n\n` +
      `**Project Highlights:**\n` +
      `- [Point 1]\n` +
      `- [Point 2]\n` +
      `- ...\n` +
      `- [Point ${bulletCount}: Summary of skills developed, abilities gained, and outputs/deliverables]\n\n` +
      `Important: You must use the above format with clear labels (**Project Name:**, **Project Period:**, **User Role:**, **Project Highlights:**), and use - symbol for bullet points.`

  // Call Qwen API
  const client = getOpenAIClient()
  if (!client) {
    console.error('LLM client initialization failed. DASHSCOPE_API_KEY:', config.DASHSCOPE_API_KEY ? 'Set' : 'Not set')
    throw new Error('LLM API is not configured. Please set DASHSCOPE_API_KEY in environment variables.')
  }

  console.log('Calling Qwen API with model:', config.LLM_MODEL || 'qwen-plus')
  console.log('Prompt length:', userPrompt.length)

  try {
    const completion = await client.chat.completions.create({
      model: config.LLM_MODEL || 'qwen-plus',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
    })

    console.log('API Response received:', {
      model: completion.model,
      usage: completion.usage,
      choicesCount: completion.choices.length,
    })

    const result = completion.choices[0]?.message?.content
    if (!result) {
      console.error('No content in API response:', JSON.stringify(completion, null, 2))
      throw new Error('No response from LLM API')
    }

    // 返回内容和token使用量
    const tokensUsed = completion.usage?.total_tokens || 0
    return {
      content: result.trim(),
      tokensUsed,
    }
  } catch (error) {
    console.error('Error calling LLM API:', error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      
      // Check for specific error types
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        throw new Error('API Key is invalid or unauthorized. Please check your DASHSCOPE_API_KEY.')
      }
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        throw new Error('API rate limit exceeded. Please try again later.')
      }
      if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
        throw new Error('Network error. Please check your internet connection.')
      }
    }
    
    throw new Error(
      error instanceof Error
        ? `LLM API error: ${error.message}`
        : 'Unknown error calling LLM API'
    )
  }
}

/**
 * Generate cover letter based on job description and resume
 */
export async function generateCoverLetter(
  input: CoverLetterInput
): Promise<LLMResult> {
  const { jobDescription, resumeContent, language = 'en', specialRequirements } = input

  // Build the prompt for LLM
  const isZh = language === 'zh'
  
  let systemPrompt = isZh
    ? `你是一个专业的求职信撰写助手。请根据用户提供的简历、职位描述和特殊要求，撰写一份专业、有针对性的求职信。`
    : `You are a professional cover letter writing assistant. Please write a professional and targeted cover letter based on the user's resume, job description, and special requirements.`

  let userPrompt = isZh
    ? `请根据以下信息撰写一份专业的求职信：\n\n`
    : `Please write a professional cover letter based on the following information:\n\n`

  // Add resume content
  userPrompt += isZh
    ? `简历内容：\n${resumeContent}\n\n`
    : `Resume Content:\n${resumeContent}\n\n`

  // Add job description
  userPrompt += isZh
    ? `职位描述：\n${jobDescription}\n\n`
    : `Job Description:\n${jobDescription}\n\n`

  // Add special requirements if provided
  if (specialRequirements && specialRequirements.trim()) {
    userPrompt += isZh
      ? `特殊要求：\n${specialRequirements}\n\n`
      : `Special Requirements:\n${specialRequirements}\n\n`
  }

  userPrompt += isZh
    ? `请撰写一份专业、有针对性的求职信，突出简历与职位描述的匹配点，并体现对目标公司的了解和兴趣。`
    : `Please write a professional and targeted cover letter that highlights the match between the resume and job description, and demonstrates understanding and interest in the target company.`

  // Call Qwen API
  const client = getOpenAIClient()
  if (!client) {
    console.error('LLM client initialization failed. DASHSCOPE_API_KEY:', config.DASHSCOPE_API_KEY ? 'Set' : 'Not set')
    throw new Error('LLM API is not configured. Please set DASHSCOPE_API_KEY in environment variables.')
  }

  console.log('Calling Qwen API for cover letter generation with model:', config.LLM_MODEL || 'qwen-plus')
  console.log('Prompt length:', userPrompt.length)

  try {
    const completion = await client.chat.completions.create({
      model: config.LLM_MODEL || 'qwen-plus',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
    })

    console.log('API Response received:', {
      model: completion.model,
      usage: completion.usage,
      choicesCount: completion.choices.length,
    })

    const result = completion.choices[0]?.message?.content
    if (!result) {
      console.error('No content in API response:', JSON.stringify(completion, null, 2))
      throw new Error('No response from LLM API')
    }

    // 返回内容和token使用量
    const tokensUsed = completion.usage?.total_tokens || 0
    return {
      content: result.trim(),
      tokensUsed,
    }
  } catch (error) {
    console.error('Error calling LLM API:', error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      
      // Check for specific error types
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        throw new Error('API Key is invalid or unauthorized. Please check your DASHSCOPE_API_KEY.')
      }
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        throw new Error('API rate limit exceeded. Please try again later.')
      }
      if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
        throw new Error('Network error. Please check your internet connection.')
      }
    }
    
    throw new Error(
      error instanceof Error
        ? `LLM API error: ${error.message}`
        : 'Unknown error calling LLM API'
    )
  }
}

/**
 * Modify cover letter based on modification requirements
 */
export async function modifyCoverLetter(
  input: ModifyCoverLetterInput
): Promise<LLMResult> {
  const { jobDescription, resumeContent, currentCoverLetter, modificationRequirement, language = 'en' } = input

  // Build the prompt for LLM
  const isZh = language === 'zh'
  
  let systemPrompt = isZh
    ? `你是一个专业的求职信修改助手。请根据用户提供的修改要求，对现有的求职信进行修改，保持专业性和针对性。`
    : `You are a professional cover letter modification assistant. Please modify the existing cover letter according to the user's modification requirements while maintaining professionalism and relevance.`

  let userPrompt = isZh
    ? `请根据以下信息修改求职信：\n\n`
    : `Please modify the cover letter based on the following information:\n\n`

  // Add resume content
  userPrompt += isZh
    ? `简历内容：\n${resumeContent}\n\n`
    : `Resume Content:\n${resumeContent}\n\n`

  // Add job description
  userPrompt += isZh
    ? `职位描述：\n${jobDescription}\n\n`
    : `Job Description:\n${jobDescription}\n\n`

  // Add current cover letter
  userPrompt += isZh
    ? `当前求职信：\n${currentCoverLetter}\n\n`
    : `Current Cover Letter:\n${currentCoverLetter}\n\n`

  // Add modification requirement
  userPrompt += isZh
    ? `修改要求：\n${modificationRequirement}\n\n`
    : `Modification Requirement:\n${modificationRequirement}\n\n`

  userPrompt += isZh
    ? `请根据修改要求对求职信进行修改，保持专业性和针对性，确保修改后的求职信符合要求。`
    : `Please modify the cover letter according to the modification requirements while maintaining professionalism and relevance, ensuring the modified cover letter meets the requirements.`

  // Call Qwen API
  const client = getOpenAIClient()
  if (!client) {
    console.error('LLM client initialization failed. DASHSCOPE_API_KEY:', config.DASHSCOPE_API_KEY ? 'Set' : 'Not set')
    throw new Error('LLM API is not configured. Please set DASHSCOPE_API_KEY in environment variables.')
  }

  console.log('Calling Qwen API for cover letter modification with model:', config.LLM_MODEL || 'qwen-plus')
  console.log('Prompt length:', userPrompt.length)

  try {
    const completion = await client.chat.completions.create({
      model: config.LLM_MODEL || 'qwen-plus',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
    })

    console.log('API Response received:', {
      model: completion.model,
      usage: completion.usage,
      choicesCount: completion.choices.length,
    })

    const result = completion.choices[0]?.message?.content
    if (!result) {
      console.error('No content in API response:', JSON.stringify(completion, null, 2))
      throw new Error('No response from LLM API')
    }

    // 返回内容和token使用量
    const tokensUsed = completion.usage?.total_tokens || 0
    return {
      content: result.trim(),
      tokensUsed,
    }
  } catch (error) {
    console.error('Error calling LLM API:', error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      
      // Check for specific error types
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        throw new Error('API Key is invalid or unauthorized. Please check your DASHSCOPE_API_KEY.')
      }
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        throw new Error('API rate limit exceeded. Please try again later.')
      }
      if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
        throw new Error('Network error. Please check your internet connection.')
      }
    }
    
    throw new Error(
      error instanceof Error
        ? `LLM API error: ${error.message}`
        : 'Unknown error calling LLM API'
    )
  }
}

