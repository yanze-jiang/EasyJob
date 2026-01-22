import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import api from '../services/api'
import type { CVModule, StructuredData, BasicInfoData, EducationData, WorkingExperienceData, ProjectExperienceData, PublicationData, LeadershipData, SkillsData } from '../types/cv'
import './CVPreview.css'

interface CVPreviewProps {
  modules: Partial<Record<CVModule, StructuredData>>
  onBack: () => void
  onUpdateModules?: (modules: Partial<Record<CVModule, StructuredData>>) => void
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

function CVPreview({ modules, onBack, onUpdateModules }: CVPreviewProps) {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const isZh = language === 'zh'
  const [isGeneratingWord, setIsGeneratingWord] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'json' | 'friendly'>('friendly')
  const [localModules, setLocalModules] = useState<Partial<Record<CVModule, StructuredData>>>(modules)

  // 当外部modules更新时，同步到本地状态
  useEffect(() => {
    setLocalModules(modules)
  }, [modules])

  const translations = {
    en: {
      title: 'Preview and Export',
      description: 'Review your CV information and export as Word document',
      previewTitle: 'CV Preview',
      viewMode: 'Review Mode',
      jsonView: 'JSON (Editable)',
      friendlyView: 'Friendly View (Read-only)',
      generateWord: 'Generate Word Document',
      generating: 'Generating...',
      backButton: 'Back',
      exitButton: 'Exit',
      error: 'Failed to generate document',
      jsonFormatError: 'Invalid JSON format',
    },
    zh: {
      title: '预览和导出',
      description: '预览您的简历信息并导出为Word文档',
      previewTitle: '简历预览',
      viewMode: '审阅模式',
      jsonView: 'JSON（可编辑）',
      friendlyView: '友好视图（只读）',
      generateWord: '生成Word文档',
      generating: '正在生成...',
      backButton: '返回',
      exitButton: '退出',
      error: '文档生成失败',
      jsonFormatError: 'JSON格式错误',
    },
  }

  const t = translations[language]

  const handleModuleUpdate = (moduleType: CVModule, data: StructuredData) => {
    const updatedModules = { ...localModules, [moduleType]: data }
    setLocalModules(updatedModules)
    if (onUpdateModules) {
      onUpdateModules(updatedModules)
    }
  }

  const handleGenerateWord = async () => {
    setIsGeneratingWord(true)
    setGenerateError(null)

    try {
      // 使用最新的localModules数据
      const response = await api.cv.generateWord(localModules as Record<CVModule, StructuredData>, language)
      
      if (response.success && response.data) {
        // 下载文件
        const url = URL.createObjectURL(response.data)
        const link = document.createElement('a')
        link.href = url
        link.download = `cv.${new Date().getTime()}.docx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } else {
        setGenerateError(response.error || t.error)
      }
    } catch (error) {
      setGenerateError(error instanceof Error ? error.message : t.error)
    } finally {
      setIsGeneratingWord(false)
    }
  }

  const handleExit = () => {
    navigate('/')
  }

  return (
    <div className="cv-preview">
      <div className="cv-preview-header">
        <h1>{t.title}</h1>
        <p className="cv-preview-description">{t.description}</p>
      </div>

      <div className="cv-preview-container">
        <div className="preview-section">
          <h2>{t.previewTitle}</h2>
          
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

          <div className="preview-content">
            {viewMode === 'json' ? (
              // JSON可编辑模式
              Object.entries(localModules).map(([moduleType, data]) => (
                <JSONEditor
                  key={moduleType}
                  moduleType={moduleType as CVModule}
                  data={data}
                  onUpdate={(updatedData) => handleModuleUpdate(moduleType as CVModule, updatedData)}
                  isZh={isZh}
                />
              ))
            ) : (
              // 友好视图只读模式
              Object.entries(localModules).map(([moduleType, data]) => (
                <FriendlyDataView
                  key={moduleType}
                  moduleType={moduleType as CVModule}
                  data={data}
                  isZh={isZh}
                />
              ))
            )}
          </div>
        </div>

        <div className="export-section">
          <div className="export-buttons">
            <button
              className="export-button word-button"
              onClick={handleGenerateWord}
              disabled={isGeneratingWord}
            >
              {isGeneratingWord ? t.generating : t.generateWord}
            </button>
          </div>

          {generateError && (
            <div className="error-message">{generateError}</div>
          )}

          <div className="back-section">
            <button className="back-button" onClick={onBack}>
              {t.backButton}
            </button>
            <button className="exit-button" onClick={handleExit}>
              {t.exitButton}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// JSON编辑器组件
interface JSONEditorProps {
  moduleType: CVModule
  data: StructuredData
  onUpdate: (data: StructuredData) => void
  isZh: boolean
}

function JSONEditor({ moduleType, data, onUpdate, isZh }: JSONEditorProps) {
  const [jsonText, setJsonText] = useState(JSON.stringify(data, null, 2))
  const [jsonError, setJsonError] = useState<string | null>(null)

  useEffect(() => {
    setJsonText(JSON.stringify(data, null, 2))
  }, [data])

  const handleJsonChange = (text: string) => {
    setJsonText(text)
    try {
      const parsed = JSON.parse(text)
      onUpdate(parsed as StructuredData)
      setJsonError(null)
    } catch (error) {
      setJsonError(isZh ? 'JSON格式错误' : 'Invalid JSON format')
    }
  }

  return (
    <div className="preview-module">
      <h3 className="module-title">
        {isZh ? moduleLabels[moduleType].zh : moduleLabels[moduleType].en}
      </h3>
      <div className="structured-data-editor">
        <textarea
          className="json-editor"
          value={jsonText}
          onChange={(e) => handleJsonChange(e.target.value)}
          rows={15}
        />
        {jsonError && <div className="json-error">{jsonError}</div>}
      </div>
    </div>
  )
}

// 友好视图组件（只读）
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

  return (
    <div className="preview-module">
      <h3 className="module-title">
        {isZh ? moduleLabels[moduleType].zh : moduleLabels[moduleType].en}
      </h3>
      {(() => {
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
      })()}
    </div>
  )
}

export default CVPreview
