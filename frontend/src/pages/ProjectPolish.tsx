import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import api from '../services/api'
import './ProjectPolish.css'

type PolishMode = 'without-job' | 'with-job'
type OutputLanguage = 'en' | 'zh'
type BulletPoints = 2 | 3 | 4 | 5

function ProjectPolish() {
  const { language } = useLanguage()
  const [mode, setMode] = useState<PolishMode>('without-job')
  const [outputLang, setOutputLang] = useState<OutputLanguage>('en')
  const [bulletPoints, setBulletPoints] = useState<BulletPoints>(3)
  const [projectInput, setProjectInput] = useState('')
  const [targetJob, setTargetJob] = useState('')
  const [specialRequirements, setSpecialRequirements] = useState('')
  const [polishedResult, setPolishedResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const translations = {
    en: {
      title: 'Polish Project',
      description: 'Enhance your project descriptions with professional language and structure',
      hint: 'Try intern, research, competition or even course project!',
      modeLabel: 'Select Mode',
      modeWithoutJob: 'Polish Project without Target Job',
      modeWithJob: 'Polish Project with Target Job',
      outputLangLabel: 'Output Language',
      outputLangEn: 'English',
      outputLangZh: 'Chinese',
      bulletPointsLabel: 'Number of Bullet Points',
      bulletPoints2: '2',
      bulletPoints3: '3',
      bulletPoints4: '4',
      bulletPoints5: '5',
      projectInputLabel: 'Project Description',
      projectInputPlaceholder: 'Enter your project description here...',
      targetJobLabel: 'Target Job Description',
      targetJobPlaceholder: 'Enter the target job description here...',
      specialRequirementsLabel: 'Special Requirements (Optional)',
      specialRequirementsPlaceholder: 'Enter any special requirements or preferences here...',
      polishButton: 'Polish Project',
      polishing: 'Polishing...',
      resultLabel: 'Polished Result',
      noResult: 'Your polished project description will appear here',
      error: 'An error occurred while polishing your project',
    },
    zh: {
      title: '项目润色',
      description: '使用专业的语言和结构来增强您的项目描述',
      hint: '试试实习、研究、竞赛甚至课程项目！',
      modeLabel: '选择模式',
      modeWithoutJob: '无目标职位的项目润色',
      modeWithJob: '针对目标职位的项目润色',
      outputLangLabel: '输出语言',
      outputLangEn: '英文',
      outputLangZh: '中文',
      bulletPointsLabel: '要点行数',
      bulletPoints2: '2',
      bulletPoints3: '3',
      bulletPoints4: '4',
      bulletPoints5: '5',
      projectInputLabel: '项目描述',
      projectInputPlaceholder: '请输入您的项目描述...',
      targetJobLabel: '目标职位描述',
      targetJobPlaceholder: '请输入目标职位描述...',
      specialRequirementsLabel: '特别要求（可选）',
      specialRequirementsPlaceholder: '请输入您的特别要求或偏好...',
      polishButton: '润色项目',
      polishing: '正在润色...',
      resultLabel: '润色结果',
      noResult: '润色后的项目描述将显示在这里',
      error: '润色项目时发生错误',
    },
  }

  const t = translations[language]

  // Parse markdown-like structured text to HTML
  const parseStructuredText = (text: string): string => {
    let html = text
    // Convert **label:** or **label：** (both English and Chinese colon) to <strong>label:</strong>
    // Match both English colon (:) and Chinese colon (：)
    html = html.replace(/\*\*([^*]+?)([:：])\*\*/g, '<strong>$1$2</strong>')
    // Convert - list items to proper list items
    // First, group consecutive lines starting with - into a list
    const lines = html.split('\n')
    const result: string[] = []
    let inList = false
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.trim().startsWith('- ')) {
        if (!inList) {
          result.push('<ul>')
          inList = true
        }
        const content = line.replace(/^-\s*/, '')
        result.push(`<li>${content}</li>`)
      } else {
        if (inList) {
          result.push('</ul>')
          inList = false
        }
        if (line.trim()) {
          result.push(line)
        } else {
          result.push('<br/>')
        }
      }
    }
    
    if (inList) {
      result.push('</ul>')
    }
    
    return result.join('\n')
  }

  const handlePolish = async () => {
    if (!projectInput.trim()) {
      setError(language === 'en' ? 'Please enter a project description' : '请输入项目描述')
      return
    }

    if (mode === 'with-job' && !targetJob.trim()) {
      setError(language === 'en' ? 'Please enter a target job description' : '请输入目标职位描述')
      return
    }

    setIsLoading(true)
    setError(null)
    setPolishedResult('')

    try {
      const response = await api.project.polish({
        mode,
        outputLanguage: outputLang,
        bulletPoints,
        projectDescription: projectInput,
        targetJobDescription: mode === 'with-job' ? targetJob : undefined,
        specialRequirements: specialRequirements.trim() || undefined,
      })

      if (response.success && response.data) {
        console.log('Polish result received:', response.data)
        setPolishedResult(response.data)
      } else {
        console.error('Polish failed:', response.error)
        setError(response.error || t.error)
      }
    } catch (err) {
      setError(t.error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="project-polish">
      <div className="polish-header">
        <h1>{t.title}</h1>
        <p className="polish-description">{t.description}</p>
        <p className="polish-hint">{t.hint}</p>
      </div>

      <div className="polish-container">
        <div className="polish-config">
          <div className="config-section">
            <label className="config-label">{t.modeLabel}</label>
            <div className="mode-selector">
              <button
                className={`mode-button ${mode === 'without-job' ? 'active' : ''}`}
                onClick={() => {
                  setMode('without-job')
                  setTargetJob('')
                }}
              >
                {t.modeWithoutJob}
              </button>
              <button
                className={`mode-button ${mode === 'with-job' ? 'active' : ''}`}
                onClick={() => setMode('with-job')}
              >
                {t.modeWithJob}
              </button>
            </div>
          </div>

          <div className="config-section">
            <label className="config-label">{t.outputLangLabel}</label>
            <div className="lang-selector">
              <button
                className={`lang-button ${outputLang === 'en' ? 'active' : ''}`}
                onClick={() => setOutputLang('en')}
              >
                {t.outputLangEn}
              </button>
              <button
                className={`lang-button ${outputLang === 'zh' ? 'active' : ''}`}
                onClick={() => setOutputLang('zh')}
              >
                {t.outputLangZh}
              </button>
            </div>
          </div>

          <div className="config-section">
            <label className="config-label">{t.bulletPointsLabel}</label>
            <div className="bullet-points-selector">
              <button
                className={`bullet-button ${bulletPoints === 2 ? 'active' : ''}`}
                onClick={() => setBulletPoints(2)}
              >
                {t.bulletPoints2}
              </button>
              <button
                className={`bullet-button ${bulletPoints === 3 ? 'active' : ''}`}
                onClick={() => setBulletPoints(3)}
              >
                {t.bulletPoints3}
              </button>
              <button
                className={`bullet-button ${bulletPoints === 4 ? 'active' : ''}`}
                onClick={() => setBulletPoints(4)}
              >
                {t.bulletPoints4}
              </button>
              <button
                className={`bullet-button ${bulletPoints === 5 ? 'active' : ''}`}
                onClick={() => setBulletPoints(5)}
              >
                {t.bulletPoints5}
              </button>
            </div>
          </div>
        </div>

        <div className="polish-input-section">
          <div className="input-group">
            <label className="input-label">{t.specialRequirementsLabel}</label>
            <textarea
              className="project-textarea"
              value={specialRequirements}
              onChange={(e) => setSpecialRequirements(e.target.value)}
              placeholder={t.specialRequirementsPlaceholder}
              rows={4}
            />
          </div>

          {mode === 'with-job' && (
            <div className="input-group">
              <label className="input-label">{t.targetJobLabel}</label>
              <textarea
                className="project-textarea"
                value={targetJob}
                onChange={(e) => setTargetJob(e.target.value)}
                placeholder={t.targetJobPlaceholder}
                rows={6}
              />
            </div>
          )}

          <div className="input-group">
            <label className="input-label">{t.projectInputLabel}</label>
            <textarea
              className="project-textarea"
              value={projectInput}
              onChange={(e) => setProjectInput(e.target.value)}
              placeholder={t.projectInputPlaceholder}
              rows={8}
            />
          </div>

          <button
            className="polish-submit-button"
            onClick={handlePolish}
            disabled={isLoading}
          >
            {isLoading ? t.polishing : t.polishButton}
          </button>

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="polish-result-section">
          <label className="result-label">{t.resultLabel}</label>
          <div className="result-container">
            {polishedResult ? (
              <div 
                className="result-content" 
                dangerouslySetInnerHTML={{ __html: parseStructuredText(polishedResult) }}
              />
            ) : (
              <div className="result-placeholder">{t.noResult}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectPolish
