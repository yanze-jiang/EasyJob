import { useState, useEffect } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import api from '../services/api'
import type { CVModule, StructuredData, CompletenessCheck, BasicInfoData, EducationData, WorkingExperienceData, ProjectExperienceData, PublicationData, LeadershipData, SkillsData } from '../types/cv'
import './CVStructuredEdit.css'

interface CVStructuredEditProps {
  moduleType: CVModule
  rawText: string
  onSave: (data: StructuredData) => void
  onBack: () => void
  onNext?: () => void
  onPrevious?: () => void
  currentIndex: number
  totalModules: number
}

const moduleLabels: Record<CVModule, { en: string; zh: string }> = {
  basicInfo: { en: 'Basic Information', zh: '基本信息' },
  education: { en: 'Education', zh: '教育背景' },
  working: { en: 'Working Experience', zh: '工作经历' },
  project: { en: 'Project Experience', zh: '项目经历' },
  publications: { en: 'Paper Publication', zh: '论文发表' },
  leadership: { en: 'Leadership Experience/ Other Achievements', zh: '其他/领导经验' },
  skills: { en: 'Languages, Skills & Interests', zh: '技能' },
}

function CVStructuredEdit({ 
  moduleType, 
  rawText, 
  onSave, 
  onBack, 
  onNext,
  onPrevious,
  currentIndex,
  totalModules
}: CVStructuredEditProps) {
  const { language } = useLanguage()
  const isZh = language === 'zh'
  const isDevelopment = import.meta.env.DEV
  const [isExtracting, setIsExtracting] = useState(true)
  const [extractError, setExtractError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [showErrorDetails, setShowErrorDetails] = useState(false)
  const [structuredData, setStructuredData] = useState<StructuredData | null>(null)
  const [completeness, setCompleteness] = useState<CompletenessCheck | null>(null)
  const [viewMode, setViewMode] = useState<'json' | 'friendly'>('json')

  const translations = {
    en: {
      title: 'Review and Edit',
      extracting: 'Extracting information...',
      error: 'Failed to extract information',
      errorDetails: 'Error Details',
      hideDetails: 'Hide Details',
      showDetails: 'Show Details',
      retry: 'Retry',
      saveButton: 'Save and Continue',
      backButton: 'Back',
      nextButton: 'Next',
      previousButton: 'Previous',
      continueButton: 'Continue',
      completenessTitle: 'Completeness Check',
      complete: 'All required fields are filled',
      incomplete: 'Some required fields are missing',
      missingFields: 'Missing Fields',
      suggestions: 'Suggestions',
      errorTips: 'Tips: Check the backend terminal for detailed error logs. The error may be due to API configuration, network issues, or invalid input format.',
      viewMode: 'View Mode',
      jsonView: 'JSON (Editable)',
      friendlyView: 'Friendly View (Read-only)',
    },
    zh: {
      title: '审核和编辑',
      extracting: '正在提取信息...',
      error: '信息提取失败',
      errorDetails: '错误详情',
      hideDetails: '隐藏详情',
      showDetails: '查看详情',
      retry: '重试',
      saveButton: '保存并继续',
      backButton: '返回',
      nextButton: '下一步',
      previousButton: '上一步',
      continueButton: '继续',
      completenessTitle: '完整性检查',
      complete: '所有必需字段已填写',
      incomplete: '部分必需字段缺失',
      missingFields: '缺失字段',
      suggestions: '建议',
      errorTips: '提示：请查看后端终端中的详细错误日志。错误可能是由于API配置、网络问题或输入格式无效导致的。',
      viewMode: '视图模式',
      jsonView: 'JSON（可编辑）',
      friendlyView: '友好视图（只读）',
    },
  }

  const t = translations[language]

  useEffect(() => {
    // Reset state when module type or raw text changes
    setStructuredData(null)
    setCompleteness(null)
    setExtractError(null)
    setErrorDetails(null)
    setShowErrorDetails(false)
    setIsExtracting(true)
    
    extractData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleType, rawText, language])

  const extractData = async () => {
    setIsExtracting(true)
    setExtractError(null)
    setErrorDetails(null)
    setShowErrorDetails(false)

    try {
      const response = await api.cv.extractModule(moduleType, rawText, language)
      
      // Debug logging in development mode
      if (isDevelopment) {
        console.log('[CVStructuredEdit] Extract response:', {
          success: response.success,
          hasData: response.success ? !!response.data : false,
          hasCompleteness: response.success && 'completeness' in response,
          error: response.success ? undefined : response.error,
        })
      }
      
      if (response.success && response.data) {
        setStructuredData(response.data)
        if ('completeness' in response && response.completeness) {
          setCompleteness(response.completeness)
        }
      } else {
        const errorMsg = response.success ? t.error : (response.error || t.error)
        if (isDevelopment) {
          console.error('[CVStructuredEdit] Extract failed:', errorMsg, response)
        }
        setExtractError(errorMsg)
        
        // Store detailed error information
        if (isDevelopment) {
          const details = JSON.stringify({
            error: errorMsg,
            moduleType,
            rawTextLength: rawText.length,
            timestamp: new Date().toISOString(),
          }, null, 2)
          setErrorDetails(details)
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : t.error
      setExtractError(errorMsg)
      
      // Store detailed error information
      if (isDevelopment) {
        const details = JSON.stringify({
          error: errorMsg,
          errorType: error instanceof Error ? error.constructor.name : typeof error,
          stack: error instanceof Error ? error.stack : undefined,
          moduleType,
          rawTextLength: rawText.length,
          timestamp: new Date().toISOString(),
        }, null, 2)
        setErrorDetails(details)
      } else {
        // In production, still show basic error details
        setErrorDetails(error instanceof Error ? error.message : String(error))
      }
    } finally {
      setIsExtracting(false)
    }
  }


  const handleNext = () => {
    if (structuredData) {
      onSave(structuredData)
      if (onNext) {
        onNext()
      }
    }
  }

  const handlePrevious = () => {
    if (onPrevious) {
      onPrevious()
    }
  }

  const isFirstModule = currentIndex === 0
  const isLastModule = currentIndex === totalModules - 1

  // Debug logging
  if (import.meta.env.DEV) {
    console.log('[CVStructuredEdit] Module info:', {
      moduleType,
      currentIndex,
      totalModules,
      isFirstModule,
      isLastModule,
    })
  }

  if (isExtracting) {
    return (
      <div className="cv-structured-edit">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t.extracting}</p>
        </div>
      </div>
    )
  }

  if (extractError) {
    return (
      <div className="cv-structured-edit">
        <div className="error-container">
          <div className="error-header">
            <h2 className="error-title">{t.error}</h2>
            <p className="error-message">{extractError}</p>
          </div>
          
          {errorDetails && (
            <div className="error-details-section">
              <button
                className="error-details-toggle"
                onClick={() => setShowErrorDetails(!showErrorDetails)}
              >
                {showErrorDetails ? t.hideDetails : t.showDetails}
              </button>
              {showErrorDetails && (
                <div className="error-details-content">
                  <pre className="error-details-text">{errorDetails}</pre>
                </div>
              )}
            </div>
          )}
          
          <div className="error-tips">
            <p>{t.errorTips}</p>
          </div>
          
          <div className="error-actions">
            <button className="retry-button" onClick={extractData}>
              {t.retry}
            </button>
            {isFirstModule && (
              <button className="back-button" onClick={onBack}>
                {t.backButton}
              </button>
            )}
            {!isFirstModule && onPrevious && (
              <button className="previous-button" onClick={handlePrevious}>
                {t.previousButton}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!structuredData) {
    return null
  }

  return (
    <div className="cv-structured-edit">
      <div className="cv-structured-edit-header">
        <h1>{t.title}</h1>
        <p className="module-name">
          {isZh ? moduleLabels[moduleType].zh : moduleLabels[moduleType].en}
        </p>
      </div>

      <div className="cv-structured-edit-container">
        {completeness && (
          <div className={`completeness-section ${completeness.isComplete ? 'complete' : 'incomplete'}`}>
            <h3>{t.completenessTitle}</h3>
            <p className="completeness-status">
              {completeness.isComplete ? t.complete : t.incomplete}
            </p>
            {!completeness.isComplete && completeness.missingFields.length > 0 && (
              <div className="missing-fields">
                <h4>{t.missingFields}:</h4>
                <ul>
                  {completeness.missingFields.map((field, index) => (
                    <li key={index}>{field.message}</li>
                  ))}
                </ul>
              </div>
            )}
            {completeness.suggestions.length > 0 && (
              <div className="suggestions">
                <h4>{t.suggestions}:</h4>
                <ul>
                  {completeness.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="view-mode-selector">
          <label className="view-mode-label">{t.viewMode}:</label>
          <div className="view-mode-buttons">
            <button
              className={`view-mode-button ${viewMode === 'json' ? 'active' : ''}`}
              onClick={() => setViewMode('json')}
            >
              {t.jsonView}
            </button>
            <button
              className={`view-mode-button ${viewMode === 'friendly' ? 'active' : ''}`}
              onClick={() => setViewMode('friendly')}
            >
              {t.friendlyView}
            </button>
          </div>
        </div>

        {viewMode === 'json' ? (
          <StructuredDataEditor
            data={structuredData}
            onChange={setStructuredData}
            isZh={isZh}
          />
        ) : (
          <FriendlyDataView
            moduleType={moduleType}
            data={structuredData}
            isZh={isZh}
          />
        )}

        <div className="action-buttons">
          {isFirstModule ? (
            <button className="back-button" onClick={onBack}>
              {t.backButton}
            </button>
          ) : (
            <button className="previous-button" onClick={handlePrevious}>
              {t.previousButton}
            </button>
          )}
          {isLastModule ? (
            <button className="continue-button" onClick={handleNext}>
              {t.continueButton}
            </button>
          ) : (
            <button className="next-button" onClick={handleNext}>
              {t.nextButton}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

interface StructuredDataEditorProps {
  data: StructuredData
  onChange: (data: StructuredData) => void
  isZh: boolean
}

function StructuredDataEditor({ data, onChange, isZh }: StructuredDataEditorProps) {
  const [jsonText, setJsonText] = useState(JSON.stringify(data, null, 2))
  const [jsonError, setJsonError] = useState<string | null>(null)

  // Update JSON text when data changes externally
  useEffect(() => {
    setJsonText(JSON.stringify(data, null, 2))
  }, [data])

  const handleJsonChange = (text: string) => {
    setJsonText(text)
    try {
      const parsed = JSON.parse(text)
      onChange(parsed as StructuredData)
      setJsonError(null)
    } catch (error) {
      setJsonError(isZh ? 'JSON格式错误' : 'Invalid JSON format')
    }
  }

  return (
    <div className="structured-data-editor">
      <label className="editor-label">
        {isZh ? '结构化数据（JSON格式）' : 'Structured Data (JSON Format)'}
      </label>
      <textarea
        className="json-editor"
        value={jsonText}
        onChange={(e) => handleJsonChange(e.target.value)}
        rows={20}
      />
      {jsonError && <div className="json-error">{jsonError}</div>}
    </div>
  )
}

interface FriendlyDataViewProps {
  moduleType: CVModule
  data: StructuredData
  isZh: boolean
}

function FriendlyDataView({ moduleType, data, isZh }: FriendlyDataViewProps) {
  const renderBasicInfo = (info: BasicInfoData) => (
    <div className="friendly-view-section">
      <div className="friendly-field">
        <span className="field-label">{isZh ? '姓名' : 'Name'}:</span>
        <span className="field-value">{info.name || '-'}</span>
      </div>
      <div className="friendly-field">
        <span className="field-label">{isZh ? '电话' : 'Phone'}:</span>
        <span className="field-value">{info.phone || '-'}</span>
      </div>
      <div className="friendly-field">
        <span className="field-label">{isZh ? '邮箱' : 'Email'}:</span>
        <span className="field-value">{info.email || '-'}</span>
      </div>
      {info.linkedin && (
        <div className="friendly-field">
          <span className="field-label">LinkedIn:</span>
          <span className="field-value">
            <a href={info.linkedin.startsWith('http') ? info.linkedin : `https://${info.linkedin}`} target="_blank" rel="noopener noreferrer">
              {info.linkedin}
            </a>
          </span>
        </div>
      )}
      {info.github && (
        <div className="friendly-field">
          <span className="field-label">GitHub:</span>
          <span className="field-value">
            <a href={info.github.startsWith('http') ? info.github : `https://${info.github}`} target="_blank" rel="noopener noreferrer">
              {info.github}
            </a>
          </span>
        </div>
      )}
    </div>
  )

  const renderEducation = (edu: EducationData) => (
    <div className="friendly-view-section">
      {edu.items.map((item, index) => (
        <div key={index} className="friendly-item">
          <h4 className="item-title">{isZh ? `教育经历 ${index + 1}` : `Education ${index + 1}`}</h4>
          <div className="friendly-field">
            <span className="field-label">{isZh ? '学位' : 'Degree'}:</span>
            <span className="field-value">{item.degree || '-'}</span>
          </div>
          <div className="friendly-field">
            <span className="field-label">{isZh ? '学校' : 'School'}:</span>
            <span className="field-value">{item.school || '-'}</span>
          </div>
          <div className="friendly-field">
            <span className="field-label">{isZh ? '专业' : 'Major'}:</span>
            <span className="field-value">{item.major || '-'}</span>
          </div>
          <div className="friendly-field">
            <span className="field-label">{isZh ? '时间' : 'Period'}:</span>
            <span className="field-value">{item.period || '-'}</span>
          </div>
          <div className="friendly-field">
            <span className="field-label">{isZh ? '地点' : 'Location'}:</span>
            <span className="field-value">{item.location || '-'}</span>
          </div>
          {item.gpa && (
            <div className="friendly-field">
              <span className="field-label">GPA:</span>
              <span className="field-value">{item.gpa}</span>
            </div>
          )}
          {item.honors && item.honors.length > 0 && (
            <div className="friendly-field">
              <span className="field-label">{isZh ? '荣誉' : 'Honors'}:</span>
              <span className="field-value">{item.honors.join(', ')}</span>
            </div>
          )}
          {item.relevantCoursework && item.relevantCoursework.length > 0 && (
            <div className="friendly-field">
              <span className="field-label">{isZh ? '相关课程' : 'Relevant Coursework'}:</span>
              <span className="field-value">{item.relevantCoursework.join(', ')}</span>
            </div>
          )}
          {item.status && (
            <div className="friendly-field">
              <span className="field-label">{isZh ? '状态' : 'Status'}:</span>
              <span className="field-value">{item.status}</span>
            </div>
          )}
          {index < edu.items.length - 1 && <hr className="item-divider" />}
        </div>
      ))}
    </div>
  )

  const renderWorking = (work: WorkingExperienceData) => (
    <div className="friendly-view-section">
      {work.items.map((item, index) => (
        <div key={index} className="friendly-item">
          <h4 className="item-title">{isZh ? `工作经历 ${index + 1}` : `Work Experience ${index + 1}`}</h4>
          <div className="friendly-field">
            <span className="field-label">{isZh ? '公司' : 'Company'}:</span>
            <span className="field-value">{item.company || '-'}</span>
          </div>
          <div className="friendly-field">
            <span className="field-label">{isZh ? '职位' : 'Position'}:</span>
            <span className="field-value">{item.position || '-'}</span>
          </div>
          <div className="friendly-field">
            <span className="field-label">{isZh ? '时间' : 'Period'}:</span>
            <span className="field-value">{item.period || '-'}</span>
          </div>
          <div className="friendly-field">
            <span className="field-label">{isZh ? '地点' : 'Location'}:</span>
            <span className="field-value">{item.location || '-'}</span>
          </div>
          {item.responsibilities && item.responsibilities.length > 0 && (
            <div className="friendly-field">
              <span className="field-label">{isZh ? '职责' : 'Responsibilities'}:</span>
              <ul className="field-list">
                {item.responsibilities.map((resp, i) => (
                  <li key={i}>{resp}</li>
                ))}
              </ul>
            </div>
          )}
          {item.achievements && item.achievements.length > 0 && (
            <div className="friendly-field">
              <span className="field-label">{isZh ? '成就' : 'Achievements'}:</span>
              <ul className="field-list">
                {item.achievements.map((ach, i) => (
                  <li key={i}>{ach}</li>
                ))}
              </ul>
            </div>
          )}
          {index < work.items.length - 1 && <hr className="item-divider" />}
        </div>
      ))}
    </div>
  )

  const renderProject = (proj: ProjectExperienceData) => (
    <div className="friendly-view-section">
      {proj.items.map((item, index) => (
        <div key={index} className="friendly-item">
          <h4 className="item-title">{isZh ? `项目 ${index + 1}` : `Project ${index + 1}`}</h4>
          <div className="friendly-field">
            <span className="field-label">{isZh ? '项目名称' : 'Project Name'}:</span>
            <span className="field-value">{item.name || '-'}</span>
          </div>
          <div className="friendly-field">
            <span className="field-label">{isZh ? '时间' : 'Period'}:</span>
            <span className="field-value">{item.period || '-'}</span>
          </div>
          {item.role && (
            <div className="friendly-field">
              <span className="field-label">{isZh ? '角色' : 'Role'}:</span>
              <span className="field-value">{item.role}</span>
            </div>
          )}
          {item.description && item.description.length > 0 && (
            <div className="friendly-field">
              <span className="field-label">{isZh ? '描述' : 'Description'}:</span>
              <ul className="field-list">
                {item.description.map((desc, i) => (
                  <li key={i}>{desc}</li>
                ))}
              </ul>
            </div>
          )}
          {item.technologies && item.technologies.length > 0 && (
            <div className="friendly-field">
              <span className="field-label">{isZh ? '技术栈' : 'Technologies'}:</span>
              <span className="field-value">{item.technologies.join(', ')}</span>
            </div>
          )}
          {index < proj.items.length - 1 && <hr className="item-divider" />}
        </div>
      ))}
    </div>
  )

  const renderPublications = (pub: PublicationData) => (
    <div className="friendly-view-section">
      {pub.items.map((item, index) => (
        <div key={index} className="friendly-item">
          <h4 className="item-title">{isZh ? `论文 ${index + 1}` : `Publication ${index + 1}`}</h4>
          <div className="friendly-field">
            <span className="field-label">{isZh ? '标题' : 'Title'}:</span>
            <span className="field-value">{item.title || '-'}</span>
          </div>
          {item.authors && item.authors.length > 0 && (
            <div className="friendly-field">
              <span className="field-label">{isZh ? '作者' : 'Authors'}:</span>
              <span className="field-value">{item.authors.join(', ')}</span>
            </div>
          )}
          <div className="friendly-field">
            <span className="field-label">{isZh ? '年份' : 'Year'}:</span>
            <span className="field-value">{item.year || '-'}</span>
          </div>
          {item.journal && (
            <div className="friendly-field">
              <span className="field-label">{isZh ? '期刊/会议' : 'Journal/Conference'}:</span>
              <span className="field-value">{item.journal}</span>
            </div>
          )}
          {item.doi && (
            <div className="friendly-field">
              <span className="field-label">DOI:</span>
              <span className="field-value">{item.doi}</span>
            </div>
          )}
          {item.status && (
            <div className="friendly-field">
              <span className="field-label">{isZh ? '状态' : 'Status'}:</span>
              <span className="field-value">{item.status}</span>
            </div>
          )}
          {index < pub.items.length - 1 && <hr className="item-divider" />}
        </div>
      ))}
    </div>
  )

  const renderLeadership = (lead: LeadershipData) => (
    <div className="friendly-view-section">
      {lead.items.map((item, index) => (
        <div key={index} className="friendly-item">
          <h4 className="item-title">{isZh ? `领导经验 ${index + 1}` : `Leadership ${index + 1}`}</h4>
          <div className="friendly-field">
            <span className="field-label">{isZh ? '职位/活动' : 'Title'}:</span>
            <span className="field-value">{item.title || '-'}</span>
          </div>
          <div className="friendly-field">
            <span className="field-label">{isZh ? '组织' : 'Organization'}:</span>
            <span className="field-value">{item.organization || '-'}</span>
          </div>
          {item.location && (
            <div className="friendly-field">
              <span className="field-label">{isZh ? '地点' : 'Location'}:</span>
              <span className="field-value">{item.location}</span>
            </div>
          )}
          <div className="friendly-field">
            <span className="field-label">{isZh ? '时间' : 'Period'}:</span>
            <span className="field-value">{item.period || '-'}</span>
          </div>
          {item.description && item.description.length > 0 && (
            <div className="friendly-field">
              <span className="field-label">{isZh ? '描述' : 'Description'}:</span>
              <ul className="field-list">
                {item.description.map((desc, i) => (
                  <li key={i}>{desc}</li>
                ))}
              </ul>
            </div>
          )}
          {index < lead.items.length - 1 && <hr className="item-divider" />}
        </div>
      ))}
    </div>
  )

  const renderSkills = (skills: SkillsData) => (
    <div className="friendly-view-section">
      <div className="friendly-field">
        <span className="field-label">{isZh ? '语言' : 'Language'}:</span>
        <span className="field-value">{skills.language || '-'}</span>
      </div>
      {skills.categories && skills.categories.length > 0 && (
        <div className="friendly-field">
          <span className="field-label">{isZh ? '技能类别' : 'Skill Categories'}:</span>
          <div className="skills-categories">
            {skills.categories.map((cat, index) => (
              <div key={index} className="skill-category">
                <strong>{cat.category}:</strong>
                <span>{cat.items.join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  switch (moduleType) {
    case 'basicInfo':
      return renderBasicInfo(data as BasicInfoData)
    case 'education':
      return renderEducation(data as EducationData)
    case 'working':
      return renderWorking(data as WorkingExperienceData)
    case 'project':
      return renderProject(data as ProjectExperienceData)
    case 'publications':
      return renderPublications(data as PublicationData)
    case 'leadership':
      return renderLeadership(data as LeadershipData)
    case 'skills':
      return renderSkills(data as SkillsData)
    default:
      return <div>{isZh ? '未知模块类型' : 'Unknown module type'}</div>
  }
}

export default CVStructuredEdit
