import { config } from '../config/env'
import OpenAI from 'openai'
import {
  CVModule,
  StructuredData,
  BasicInfoData,
  EducationData,
  WorkingExperienceData,
  ProjectExperienceData,
  PublicationData,
  LeadershipData,
  SkillsData,
  CompletenessCheck,
} from '../types/cv'

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
 * Generate a unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Extract structured data from raw text for a CV module
 */
export async function extractCVModuleData(
  moduleType: CVModule,
  rawText: string,
  language: 'en' | 'zh'
): Promise<{ data: StructuredData; completeness: CompletenessCheck; tokensUsed: number }> {
  const requestId = generateRequestId()
  const isZh = language === 'zh'
  const isDevelopment = config.NODE_ENV === 'development'
  const client = getOpenAIClient()
  
  // Log request parameters
  console.log(`[CV Extraction] Request ID: ${requestId}`)
  console.log(`[CV Extraction] Module Type: ${moduleType}, Language: ${language}, Text Length: ${rawText.length}`)
  
  if (!client) {
    const error = 'LLM API is not configured. Please set DASHSCOPE_API_KEY in environment variables.'
    console.error(`[CV Extraction] ${requestId} - Error: ${error}`)
    throw new Error(error)
  }

  // Build module-specific prompts
  const { systemPrompt, userPrompt } = buildExtractionPrompt(moduleType, rawText, isZh)

  // Log prompts in development mode
  if (isDevelopment) {
    console.log(`[CV Extraction] ${requestId} - System Prompt Length: ${systemPrompt.length}`)
    console.log(`[CV Extraction] ${requestId} - User Prompt Length: ${userPrompt.length}`)
    if (userPrompt.length < 500) {
      console.log(`[CV Extraction] ${requestId} - User Prompt Preview: ${userPrompt.substring(0, 200)}...`)
    }
  }

  try {
    console.log(`[CV Extraction] ${requestId} - Calling LLM API with model: ${config.LLM_MODEL || 'qwen-plus'}`)
    
    const completion = await client.chat.completions.create({
      model: config.LLM_MODEL || 'qwen-plus',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3, // Lower temperature for more consistent JSON output
    })

    const tokensUsed = completion.usage?.total_tokens || 0
    console.log(`[CV Extraction] ${requestId} - LLM API Response received. Tokens used: ${tokensUsed}`)
    console.log(`[CV Extraction] ${requestId} - Token breakdown: prompt=${completion.usage?.prompt_tokens || 0}, completion=${completion.usage?.completion_tokens || 0}`)

    const result = completion.choices[0]?.message?.content
    if (!result) {
      const error = 'No response from LLM API'
      console.error(`[CV Extraction] ${requestId} - Error: ${error}`)
      console.error(`[CV Extraction] ${requestId} - API Response:`, JSON.stringify(completion, null, 2))
      throw new Error(error)
    }

    console.log(`[CV Extraction] ${requestId} - Raw response length: ${result.length}`)
    if (isDevelopment && result.length < 1000) {
      console.log(`[CV Extraction] ${requestId} - Raw response preview: ${result.substring(0, 500)}...`)
    }

    // Parse JSON response - handle markdown code blocks if present
    let jsonString = result.trim()
    const hadMarkdownBlock = jsonString.startsWith('```')
    
    // Remove markdown code blocks if present (```json ... ``` or ``` ... ```)
    if (hadMarkdownBlock) {
      console.log(`[CV Extraction] ${requestId} - Detected markdown code block, removing...`)
      const lines = jsonString.split('\n')
      // Remove first line (```json or ```)
      lines.shift()
      // Remove last line (```)
      if (lines.length > 0 && lines[lines.length - 1].trim() === '```') {
        lines.pop()
      }
      jsonString = lines.join('\n').trim()
      console.log(`[CV Extraction] ${requestId} - After markdown removal, length: ${jsonString.length}`)
    }

    let parsedData: StructuredData
    try {
      const jsonData = JSON.parse(jsonString)
      parsedData = jsonData as StructuredData
      console.log(`[CV Extraction] ${requestId} - JSON parsed successfully`)
      
      // Validate parsed data structure
      if (isDevelopment) {
        console.log(`[CV Extraction] ${requestId} - Parsed data structure:`, JSON.stringify(parsedData, null, 2).substring(0, 1000))
      }
      
      // Check if items array exists and is populated for array-based modules
      if (moduleType === 'education' || moduleType === 'working' || moduleType === 'project' || 
          moduleType === 'publications' || moduleType === 'leadership') {
        // Skip validation for basicInfo as it's not an array-based module
        const dataWithItems = parsedData as EducationData | WorkingExperienceData | ProjectExperienceData | PublicationData | LeadershipData
        if (!dataWithItems.items || !Array.isArray(dataWithItems.items) || dataWithItems.items.length === 0) {
          console.error(`[CV Extraction] ${requestId} - WARNING: items array is missing or empty!`)
          console.error(`[CV Extraction] ${requestId} - Parsed data:`, JSON.stringify(parsedData, null, 2))
          console.error(`[CV Extraction] ${requestId} - Raw JSON string:`, jsonString.substring(0, 1000))
          // Try to fix: if data is directly an array, wrap it
          if (Array.isArray(jsonData)) {
            console.log(`[CV Extraction] ${requestId} - Attempting to fix: data is array, wrapping in items`)
            parsedData = { items: jsonData } as StructuredData
          } else if (jsonData && typeof jsonData === 'object' && !('items' in jsonData)) {
            // If data has fields but no items, try to create items array
            console.log(`[CV Extraction] ${requestId} - Attempting to fix: data has fields but no items array`)
            // This is a fallback - we'll let validation handle the error
          }
        } else {
          console.log(`[CV Extraction] ${requestId} - Items array validated: ${dataWithItems.items.length} item(s) found`)
        }
      }
    } catch (parseError) {
      const errorMsg = 'Failed to parse AI response as JSON. The AI may have returned invalid JSON format. Please try again.'
      console.error(`[CV Extraction] ${requestId} - JSON Parse Error:`)
      console.error(`[CV Extraction] ${requestId} - Raw response (first 1000 chars):`, result.substring(0, 1000))
      console.error(`[CV Extraction] ${requestId} - Cleaned JSON string (first 1000 chars):`, jsonString.substring(0, 1000))
      console.error(`[CV Extraction] ${requestId} - Parse error details:`, parseError)
      if (parseError instanceof Error) {
        console.error(`[CV Extraction] ${requestId} - Parse error message:`, parseError.message)
        console.error(`[CV Extraction] ${requestId} - Parse error stack:`, parseError.stack)
      }
      throw new Error(errorMsg)
    }

    // Validate and check completeness
    const completeness = validateAndCheckCompleteness(moduleType, parsedData, isZh)
    console.log(`[CV Extraction] ${requestId} - Validation complete. Is complete: ${completeness.isComplete}, Missing fields: ${completeness.missingFields.length}`)
    
    return {
      data: parsedData,
      completeness,
      tokensUsed,
    }
  } catch (error) {
    console.error(`[CV Extraction] ${requestId} - Error extracting CV module data:`)
    console.error(`[CV Extraction] ${requestId} - Error type:`, error instanceof Error ? error.constructor.name : typeof error)
    console.error(`[CV Extraction] ${requestId} - Error message:`, error instanceof Error ? error.message : String(error))
    if (error instanceof Error && error.stack) {
      console.error(`[CV Extraction] ${requestId} - Error stack:`, error.stack)
    }
    
    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.error(`[CV Extraction] ${requestId} - API Key authentication failed`)
      } else if (error.message.includes('429') || error.message.includes('rate limit')) {
        console.error(`[CV Extraction] ${requestId} - Rate limit exceeded`)
      } else if (error.message.includes('network') || error.message.includes('ECONNREFUSED') || error.message.includes('fetch')) {
        console.error(`[CV Extraction] ${requestId} - Network error`)
      }
    }
    
    throw error instanceof Error ? error : new Error('Unknown error extracting CV module data')
  }
}

/**
 * Check completeness of a CV module's structured data
 */
export async function checkModuleCompleteness(
  moduleType: CVModule,
  data: StructuredData,
  language: 'en' | 'zh'
): Promise<{ completeness: CompletenessCheck; tokensUsed: number }> {
  const isZh = language === 'zh'
  
  // Use validation function (no need for LLM call if we can validate programmatically)
  const completeness = validateAndCheckCompleteness(moduleType, data, isZh)
  
  // For now, return programmatic validation. Can enhance with LLM-based suggestions later
  return {
    completeness,
    tokensUsed: 0,
  }
}

/**
 * Build extraction prompt for different module types
 */
function buildExtractionPrompt(
  moduleType: CVModule,
  rawText: string,
  isZh: boolean
): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = isZh
    ? `你是一个专业的简历信息提取助手。请从用户提供的文本中提取结构化信息，并严格按照JSON格式返回。`
    : `You are a professional CV information extraction assistant. Please extract structured information from the user's text and return it strictly in JSON format.`

  let userPrompt = ''
  let jsonSchema = ''

  switch (moduleType) {
    case 'basicInfo':
      jsonSchema = JSON.stringify({
        name: 'string (required)',
        phone: 'string (required)',
        email: 'string (required)',
        linkedin: 'string (optional)',
        github: 'string (optional)',
      }, null, 2)
      userPrompt = isZh
        ? `请从以下文本中提取基本信息，返回JSON格式：\n\n${rawText}\n\n必需字段：name（姓名，可能包含中英文，如"JIANG, Yanze Robert (江彥澤)"）、phone（电话号码，可能包含空格或分隔符，如"5950 4201"或"+86 138-0000-0000"）、email（邮箱地址，如"1155215100@link.cuhk.edu.hk"）。可选字段：linkedin（LinkedIn链接，可能包含www.前缀，如"www.linkedin.com/in/yanze-jiang/"或"linkedin.com/in/yanze-jiang"）、github（GitHub链接，可能包含https://前缀，如"https://github.com/yanze-jiang"或"github.com/yanze-jiang"）。\n\n注意：\n1. 姓名可能包含逗号、括号等，请完整保留\n2. 电话号码可能包含空格、连字符等分隔符，请保留原始格式\n3. 邮箱地址请完整提取\n4. LinkedIn和GitHub链接可能包含或不包含协议前缀（http://或https://）和www.前缀，请提取完整链接\n5. 文本可能使用"|"或其他分隔符分隔不同信息，请正确识别`
        : `Please extract basic information from the following text and return in JSON format:\n\n${rawText}\n\nRequired fields: name (full name, may contain both English and Chinese, e.g., "JIANG, Yanze Robert (江彥澤)"), phone (phone number, may contain spaces or separators, e.g., "5950 4201" or "+86 138-0000-0000"), email (email address, e.g., "1155215100@link.cuhk.edu.hk"). Optional fields: linkedin (LinkedIn URL, may contain www. prefix, e.g., "www.linkedin.com/in/yanze-jiang/" or "linkedin.com/in/yanze-jiang"), github (GitHub URL, may contain https:// prefix, e.g., "https://github.com/yanze-jiang" or "github.com/yanze-jiang").\n\nNote:\n1. Name may contain commas, parentheses, etc., please preserve the full name\n2. Phone number may contain spaces, hyphens, or other separators, please preserve the original format\n3. Email address should be extracted completely\n4. LinkedIn and GitHub links may or may not contain protocol prefix (http:// or https://) and www. prefix, please extract the complete link\n5. Text may use "|" or other separators to separate different information, please identify correctly`
      break

    case 'education':
      jsonSchema = JSON.stringify({
        items: [{
          degree: 'string (required)',
          school: 'string (required)',
          major: 'string (required)',
          period: 'string (required, format: YYYY-MM to YYYY-MM or Sep YYYY - Jul YYYY)',
          location: 'string (required)',
          gpa: 'string (optional, can be CGPA, GPA, or similar format like 3.83/4.00)',
          honors: ['string (optional array, e.g., Dean\'s List, Scholarship)'],
          relevantCoursework: ['string (optional array, list of course names)'],
          status: 'string (optional, e.g., anticipated, completed)',
        }],
      }, null, 2)
      userPrompt = isZh
        ? `请从以下文本中提取教育背景信息，返回JSON格式：\n\n${rawText}\n\n重要提示：\n1. 如果文本中包含"---"分隔符，这表示多个独立的教育经历，每个"---"分隔的部分应该提取为items数组中的一个独立对象。\n2. 如果文本中没有"---"分隔符，但包含多条教育信息（例如多行、多个段落），也应该提取为多个items。\n3. 如果文本中只有一条教育信息，items数组应包含一个对象。\n\n必需字段：degree（学位，如Bachelor of Science）、school（学校名称）、major（专业，可能包含多个专业用&或and连接）、period（时间，格式化为Sep YYYY - Jul YYYY或YYYY-MM to YYYY-MM，如果包含[anticipated]等状态信息，请提取到status字段）、location（地点，如城市或国家）。可选字段：gpa（GPA或CGPA，保留原始格式如3.83/4.00）、honors（荣誉奖项数组，如Dean's List、Scholarship等）、relevantCoursework（相关课程数组，从"Relevant coursework"或类似描述中提取）、status（状态，如anticipated、completed等，如果period中包含[anticipated]等，请提取到这里）。\n\n注意：\n- 文本可能包含制表符对齐，请忽略格式，只提取内容\n- 每个教育经历必须包含所有必需字段，不能为空字符串\n- 如果某个字段在文本中找不到，请仔细检查文本内容，不要返回空字符串\n\n重要：必须返回一个包含items数组的JSON对象，items数组必须包含至少一条完整的教育记录（所有必需字段都有值）。如果文本中有多个教育经历（用"---"分隔），items数组应包含对应数量的对象。`
        : `Please extract education background information from the following text and return in JSON format:\n\n${rawText}\n\nImportant Notes:\n1. If the text contains "---" separators, this indicates multiple independent education entries. Each section separated by "---" should be extracted as a separate object in the items array.\n2. If the text does not contain "---" separators but contains multiple education entries (e.g., multiple lines, multiple paragraphs), they should also be extracted as multiple items.\n3. If the text contains only one education entry, the items array should contain one object.\n\nRequired fields: degree (e.g., Bachelor of Science), school (school name), major (major field, may contain multiple majors connected with & or and), period (time period, format as Sep YYYY - Jul YYYY or YYYY-MM to YYYY-MM, if it contains status like [anticipated], extract to status field), location (city or country). Optional fields: gpa (GPA or CGPA, keep original format like 3.83/4.00), honors (array of honors like Dean's List, Scholarship, etc.), relevantCoursework (array of course names, extract from "Relevant coursework" or similar descriptions), status (e.g., anticipated, completed, if period contains [anticipated] etc., extract here).\n\nNote:\n- The text may contain tab alignment, please ignore formatting and extract content only\n- Each education entry must contain all required fields, cannot be empty strings\n- If a field cannot be found in the text, please carefully check the text content, do not return empty strings\n\nImportant: You must return a JSON object with an items array, and the items array must contain at least one complete education record (all required fields have values). If there are multiple education entries in the text (separated by "---"), the items array should contain the corresponding number of objects.`
      break

    case 'working':
      jsonSchema = JSON.stringify({
        items: [{
          company: 'string (required)',
          position: 'string (required)',
          period: 'string (required)',
          location: 'string (required)',
          responsibilities: ['string (required, at least 1)'],
          achievements: ['string (optional array)'],
        }],
      }, null, 2)
      userPrompt = isZh
        ? `请从以下文本中提取工作经历信息，返回JSON格式：\n\n${rawText}\n\n重要提示：\n1. 如果文本中包含"---"分隔符，这表示多个独立的工作经历，每个"---"分隔的部分应该提取为items数组中的一个独立对象。\n2. 如果文本中没有"---"分隔符，但包含多条工作信息（例如多行、多个段落），也应该提取为多个items。\n3. 如果文本中只有一条工作信息，items数组应包含一个对象。\n\n必需字段：company（公司）、position（职位）、period（时间）、location（地点）、responsibilities（职责数组，至少1条）。可选字段：achievements（成就数组）。\n\n注意：每个工作经历必须包含所有必需字段，不能为空字符串。如果某个字段在文本中找不到，请仔细检查文本内容，不要返回空字符串。`
        : `Please extract working experience information from the following text and return in JSON format:\n\n${rawText}\n\nImportant Notes:\n1. If the text contains "---" separators, this indicates multiple independent work experiences. Each section separated by "---" should be extracted as a separate object in the items array.\n2. If the text does not contain "---" separators but contains multiple work entries (e.g., multiple lines, multiple paragraphs), they should also be extracted as multiple items.\n3. If the text contains only one work entry, the items array should contain one object.\n\nRequired fields: company, position, period, location, responsibilities (array, at least 1). Optional fields: achievements (array).\n\nNote: Each work experience must contain all required fields, cannot be empty strings. If a field cannot be found in the text, please carefully check the text content, do not return empty strings.`
      break

    case 'project':
      jsonSchema = JSON.stringify({
        items: [{
          name: 'string (required)',
          period: 'string (required)',
          role: 'string (optional)',
          description: ['string (required, at least 1)'],
          technologies: ['string (optional array)'],
        }],
      }, null, 2)
      userPrompt = isZh
        ? `请从以下文本中提取项目经历信息，返回JSON格式：\n\n${rawText}\n\n重要提示：\n1. 如果文本中包含"---"分隔符，这表示多个独立的项目经历，每个"---"分隔的部分应该提取为items数组中的一个独立对象。\n2. 如果文本中没有"---"分隔符，但包含多条项目信息（例如多行、多个段落），也应该提取为多个items。\n3. 如果文本中只有一条项目信息，items数组应包含一个对象。\n\n必需字段：name（项目名称）、period（时间）、description（描述数组，至少1条）。可选字段：role（角色）、technologies（技术栈数组）。\n\n注意：每个项目经历必须包含所有必需字段，不能为空字符串。如果某个字段在文本中找不到，请仔细检查文本内容，不要返回空字符串。`
        : `Please extract project experience information from the following text and return in JSON format:\n\n${rawText}\n\nImportant Notes:\n1. If the text contains "---" separators, this indicates multiple independent project experiences. Each section separated by "---" should be extracted as a separate object in the items array.\n2. If the text does not contain "---" separators but contains multiple project entries (e.g., multiple lines, multiple paragraphs), they should also be extracted as multiple items.\n3. If the text contains only one project entry, the items array should contain one object.\n\nRequired fields: name, period, description (array, at least 1). Optional fields: role, technologies (array).\n\nNote: Each project experience must contain all required fields, cannot be empty strings. If a field cannot be found in the text, please carefully check the text content, do not return empty strings.`
      break

    case 'publications':
      jsonSchema = JSON.stringify({
        items: [{
          title: 'string (required)',
          authors: ['string (required array)'],
          journal: 'string (optional)',
          year: 'string (required)',
          doi: 'string (optional)',
          status: 'string (optional: published/submitted/in-preparation)',
        }],
      }, null, 2)
      userPrompt = isZh
        ? `请从以下文本中提取论文发表信息，返回JSON格式：\n\n${rawText}\n\n重要提示：\n1. 如果文本中包含"---"分隔符，这表示多篇独立的论文，每个"---"分隔的部分应该提取为items数组中的一个独立对象。\n2. 如果文本中没有"---"分隔符，但包含多篇论文信息（例如多行、多个段落），也应该提取为多个items。\n3. 如果文本中只有一篇论文，items数组应包含一个对象。\n\n必需字段：title（论文标题）、authors（作者数组）、year（年份）。可选字段：journal（期刊/会议）、doi（DOI）、status（状态）。\n\n注意：每篇论文必须包含所有必需字段，不能为空字符串。如果某个字段在文本中找不到，请仔细检查文本内容，不要返回空字符串。`
        : `Please extract paper publication information from the following text and return in JSON format:\n\n${rawText}\n\nImportant Notes:\n1. If the text contains "---" separators, this indicates multiple independent publications. Each section separated by "---" should be extracted as a separate object in the items array.\n2. If the text does not contain "---" separators but contains multiple publication entries (e.g., multiple lines, multiple paragraphs), they should also be extracted as multiple items.\n3. If the text contains only one publication, the items array should contain one object.\n\nRequired fields: title, authors (array), year. Optional fields: journal, doi, status.\n\nNote: Each publication must contain all required fields, cannot be empty strings. If a field cannot be found in the text, please carefully check the text content, do not return empty strings.`
      break

    case 'leadership':
      jsonSchema = JSON.stringify({
        items: [{
          title: 'string (required)',
          organization: 'string (required)',
          period: 'string (required)',
          location: 'string (optional)',
          description: ['string (required, at least 1)'],
        }],
      }, null, 2)
      userPrompt = isZh
        ? `请从以下文本中提取领导经验信息，返回JSON格式：\n\n${rawText}\n\n重要提示：\n1. 如果文本中包含"---"分隔符，这表示多个独立的领导经验，每个"---"分隔的部分应该提取为items数组中的一个独立对象。\n2. 如果文本中没有"---"分隔符，但包含多条领导经验信息（例如多行、多个段落），也应该提取为多个items。\n3. 如果文本中只有一条领导经验，items数组应包含一个对象。\n\n必需字段：title（职位/活动名称）、organization（组织）、period（时间）、description（描述数组，至少1条）。可选字段：location（地点）。\n\n注意：每个领导经验必须包含所有必需字段，不能为空字符串。如果某个字段在文本中找不到，请仔细检查文本内容，不要返回空字符串。`
        : `Please extract leadership experience information from the following text and return in JSON format:\n\n${rawText}\n\nImportant Notes:\n1. If the text contains "---" separators, this indicates multiple independent leadership experiences. Each section separated by "---" should be extracted as a separate object in the items array.\n2. If the text does not contain "---" separators but contains multiple leadership entries (e.g., multiple lines, multiple paragraphs), they should also be extracted as multiple items.\n3. If the text contains only one leadership entry, the items array should contain one object.\n\nRequired fields: title, organization, period, description (array, at least 1). Optional fields: location.\n\nNote: Each leadership experience must contain all required fields, cannot be empty strings. If a field cannot be found in the text, please carefully check the text content, do not return empty strings.`
      break

    case 'skills':
      jsonSchema = JSON.stringify({
        languages: 'string (required)',
        skills: 'string (required)',
        interests: 'string (required)',
      }, null, 2)
      userPrompt = isZh
        ? `请从以下文本中提取技能信息，返回JSON格式：\n\n${rawText}\n\n请将信息提炼成三个方面：\n1. languages（语言）：提炼所有语言相关的信息，整合成一段文字描述\n2. skills（技能）：提炼所有技能相关的信息（如编程语言、工具、框架等），整合成一段文字描述\n3. interests（兴趣）：提炼所有兴趣相关的信息，整合成一段文字描述\n\n每个字段应该是一段完整的文字描述，不需要使用bullet points或列表格式。`
        : `Please extract skills information from the following text and return in JSON format:\n\n${rawText}\n\nPlease refine the information into three aspects:\n1. languages: Refine all language-related information into a text description\n2. skills: Refine all skill-related information (such as programming languages, tools, frameworks, etc.) into a text description\n3. interests: Refine all interest-related information into a text description\n\nEach field should be a complete text description, no need to use bullet points or list format.`
      break
  }

      // Add format instructions based on module type
      if (moduleType === 'basicInfo' || moduleType === 'skills') {
        // For non-array modules, don't mention items array
        userPrompt += isZh
          ? `\n\n请严格按照以下JSON格式返回，只返回JSON对象，不要添加任何markdown代码块标记、说明文字或其他内容：\n${jsonSchema}\n\n重要：\n1. 直接返回JSON对象，不要使用\`\`\`json或\`\`\`标记\n2. 必须包含所有必需字段`
          : `\n\nPlease return strictly in the following JSON format, only the JSON object without any markdown code blocks, explanations, or other content:\n${jsonSchema}\n\nImportant:\n1. Return the JSON object directly, do not use \`\`\`json or \`\`\` markers\n2. Must include all required fields`
      } else {
        // For array-based modules
        userPrompt += isZh
          ? `\n\n请严格按照以下JSON格式返回，只返回JSON对象，不要添加任何markdown代码块标记、说明文字或其他内容：\n${jsonSchema}\n\n重要：\n1. 直接返回JSON对象，不要使用\`\`\`json或\`\`\`标记\n2. 必须包含items数组，且items数组不能为空\n3. 如果文本中有多条记录，items数组应包含所有记录\n4. 如果文本中只有一条记录，items数组也应包含这一条记录`
          : `\n\nPlease return strictly in the following JSON format, only the JSON object without any markdown code blocks, explanations, or other content:\n${jsonSchema}\n\nImportant:\n1. Return the JSON object directly, do not use \`\`\`json or \`\`\` markers\n2. Must include an items array, and the items array must not be empty\n3. If there are multiple records in the text, the items array should contain all records\n4. If there is only one record in the text, the items array should still contain that one record`
      }

  return { systemPrompt, userPrompt }
}

/**
 * Validate structured data and check completeness
 */
function validateAndCheckCompleteness(
  moduleType: CVModule,
  data: StructuredData,
  isZh: boolean
): CompletenessCheck {
  const missingFields: Array<{ field: string; message: string }> = []
  const suggestions: string[] = []

  switch (moduleType) {
    case 'basicInfo': {
      const basicData = data as BasicInfoData
      if (!basicData.name) missingFields.push({ field: 'name', message: isZh ? '姓名是必需的' : 'Name is required' })
      if (!basicData.phone) missingFields.push({ field: 'phone', message: isZh ? '电话是必需的' : 'Phone is required' })
      if (!basicData.email) missingFields.push({ field: 'email', message: isZh ? '邮件是必需的' : 'Email is required' })
      break
    }

    case 'education': {
      const eduData = data as EducationData
      if (!eduData.items || eduData.items.length === 0) {
        missingFields.push({
          field: 'items',
          message: isZh ? '至少需要一条教育背景记录' : 'At least one education record is required',
        })
      } else {
        eduData.items.forEach((item, index) => {
          if (!item.degree) missingFields.push({ field: `items[${index}].degree`, message: isZh ? '学位是必需的' : 'Degree is required' })
          if (!item.school) missingFields.push({ field: `items[${index}].school`, message: isZh ? '学校是必需的' : 'School is required' })
          if (!item.major) missingFields.push({ field: `items[${index}].major`, message: isZh ? '专业是必需的' : 'Major is required' })
          if (!item.period) missingFields.push({ field: `items[${index}].period`, message: isZh ? '时间是必需的' : 'Period is required' })
          if (!item.location) missingFields.push({ field: `items[${index}].location`, message: isZh ? '地点是必需的' : 'Location is required' })
        })
      }
      break
    }

    case 'working': {
      const workData = data as WorkingExperienceData
      if (!workData.items || workData.items.length === 0) {
        missingFields.push({
          field: 'items',
          message: isZh ? '至少需要一条工作经历记录' : 'At least one work experience record is required',
        })
      } else {
        workData.items.forEach((item, index) => {
          if (!item.company) missingFields.push({ field: `items[${index}].company`, message: isZh ? '公司是必需的' : 'Company is required' })
          if (!item.position) missingFields.push({ field: `items[${index}].position`, message: isZh ? '职位是必需的' : 'Position is required' })
          if (!item.period) missingFields.push({ field: `items[${index}].period`, message: isZh ? '时间是必需的' : 'Period is required' })
          if (!item.location) missingFields.push({ field: `items[${index}].location`, message: isZh ? '地点是必需的' : 'Location is required' })
          if (!item.responsibilities || item.responsibilities.length === 0) {
            missingFields.push({ field: `items[${index}].responsibilities`, message: isZh ? '至少需要一条职责描述' : 'At least one responsibility is required' })
          }
        })
      }
      break
    }

    case 'project': {
      const projData = data as ProjectExperienceData
      if (!projData.items || projData.items.length === 0) {
        missingFields.push({
          field: 'items',
          message: isZh ? '至少需要一条项目经历记录' : 'At least one project record is required',
        })
      } else {
        projData.items.forEach((item, index) => {
          if (!item.name) missingFields.push({ field: `items[${index}].name`, message: isZh ? '项目名称是必需的' : 'Project name is required' })
          if (!item.period) missingFields.push({ field: `items[${index}].period`, message: isZh ? '时间是必需的' : 'Period is required' })
          if (!item.description || item.description.length === 0) {
            missingFields.push({ field: `items[${index}].description`, message: isZh ? '至少需要一条项目描述' : 'At least one description is required' })
          }
        })
      }
      break
    }

    case 'publications': {
      const pubData = data as PublicationData
      if (!pubData.items || pubData.items.length === 0) {
        missingFields.push({
          field: 'items',
          message: isZh ? '至少需要一条论文记录' : 'At least one publication record is required',
        })
      } else {
        pubData.items.forEach((item, index) => {
          if (!item.title) missingFields.push({ field: `items[${index}].title`, message: isZh ? '论文标题是必需的' : 'Title is required' })
          if (!item.authors || item.authors.length === 0) {
            missingFields.push({ field: `items[${index}].authors`, message: isZh ? '至少需要一位作者' : 'At least one author is required' })
          }
          if (!item.year) missingFields.push({ field: `items[${index}].year`, message: isZh ? '年份是必需的' : 'Year is required' })
        })
      }
      break
    }

    case 'leadership': {
      const leadData = data as LeadershipData
      if (!leadData.items || leadData.items.length === 0) {
        missingFields.push({
          field: 'items',
          message: isZh ? '至少需要一条领导经验记录' : 'At least one leadership record is required',
        })
      } else {
        leadData.items.forEach((item, index) => {
          if (!item.title) missingFields.push({ field: `items[${index}].title`, message: isZh ? '职位/活动名称是必需的' : 'Title is required' })
          if (!item.organization) missingFields.push({ field: `items[${index}].organization`, message: isZh ? '组织是必需的' : 'Organization is required' })
          if (!item.period) missingFields.push({ field: `items[${index}].period`, message: isZh ? '时间是必需的' : 'Period is required' })
          if (!item.description || item.description.length === 0) {
            missingFields.push({ field: `items[${index}].description`, message: isZh ? '至少需要一条描述' : 'At least one description is required' })
          }
        })
      }
      break
    }

    case 'skills': {
      const skillsData = data as SkillsData
      if (!skillsData.languages) {
        missingFields.push({ field: 'languages', message: isZh ? '语言是必需的' : 'Languages is required' })
      }
      if (!skillsData.skills) {
        missingFields.push({ field: 'skills', message: isZh ? '技能是必需的' : 'Skills is required' })
      }
      if (!skillsData.interests) {
        missingFields.push({ field: 'interests', message: isZh ? '兴趣是必需的' : 'Interests is required' })
      }
      break
    }
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    suggestions,
  }
}
