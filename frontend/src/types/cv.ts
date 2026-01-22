// CV模块类型定义
export type CVModule = 
  | 'basicInfo'
  | 'education'
  | 'working'
  | 'project'
  | 'publications'
  | 'leadership'
  | 'skills'

// 教育背景数据结构
export interface EducationData {
  items: Array<{
    degree: string          // 学位（必需）
    school: string          // 学校（必需）
    major: string           // 专业（必需）
    period: string          // 时间（必需，格式：YYYY-MM 至 YYYY-MM 或 Sep YYYY - Jul YYYY）
    location: string        // 地点（必需）
    gpa?: string            // GPA/CGPA（可选，格式如：3.83/4.00）
    honors?: string[]       // 荣誉奖项（可选，如：Dean's List, Scholarship等）
    relevantCoursework?: string[] // 相关课程（可选）
    status?: string         // 状态（可选，如：anticipated, completed等）
  }>
}

// 工作经历数据结构
export interface WorkingExperienceData {
  items: Array<{
    company: string         // 公司（必需）
    position: string        // 职位（必需）
    period: string          // 时间（必需）
    location: string        // 地点（必需）
    responsibilities: string[] // 职责（必需，至少1条）
    achievements?: string[]   // 成就（可选）
  }>
}

// 项目经历数据结构
export interface ProjectExperienceData {
  items: Array<{
    name: string           // 项目名称（必需）
    period: string          // 时间（必需）
    role?: string          // 角色（可选）
    description: string[]  // 项目描述（必需，至少1条）
    technologies?: string[] // 技术栈（可选）
  }>
}

// 论文发表数据结构
export interface PublicationData {
  items: Array<{
    title: string          // 论文标题（必需）
    authors: string[]      // 作者列表（必需）
    journal?: string       // 期刊/会议（可选）
    year: string           // 年份（必需）
    doi?: string           // DOI（可选）
    status?: string        // 状态：published/submitted/in-preparation（可选）
  }>
}

// 其他/领导经验数据结构
export interface LeadershipData {
  items: Array<{
    title: string          // 职位/活动名称（必需）
    organization: string   // 组织（必需）
    period: string         // 时间（必需）
    location?: string       // 地点（可选）
    description: string[]  // 描述（必需，至少1条）
  }>
}

// 技能数据结构
export interface SkillsData {
  languages: string        // 语言（必需，提炼后的文字描述）
  skills: string          // 技能（必需，提炼后的文字描述）
  interests: string       // 兴趣（必需，提炼后的文字描述）
}

// 基本信息数据结构
export interface BasicInfoData {
  name: string            // 姓名（必需）
  phone: string           // 电话（必需）
  email: string           // 邮件（必需）
  linkedin?: string       // 领英（可选）
  github?: string         // GitHub（可选）
}

// 联合类型：所有模块的数据结构
export type StructuredData = 
  | BasicInfoData
  | EducationData
  | WorkingExperienceData
  | ProjectExperienceData
  | PublicationData
  | LeadershipData
  | SkillsData

// 完整性检查结果
export interface CompletenessCheck {
  isComplete: boolean
  missingFields: Array<{
    field: string
    message: string
  }>
  suggestions: string[]
}

// CV模块提取响应
export interface ExtractModuleResponse {
  data: StructuredData
  completeness: CompletenessCheck
}
