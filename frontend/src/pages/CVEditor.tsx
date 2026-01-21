import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import './CVEditor.css'

type CVModule = 
  | 'education'
  | 'working'
  | 'project'
  | 'publications'
  | 'leadership'
  | 'skills'

interface CVModuleOption {
  id: CVModule
  labelEn: string
  labelZh: string
  icon: string
}

const cvModules: CVModuleOption[] = [
  {
    id: 'education',
    labelEn: 'Education Background',
    labelZh: '教育背景',
    icon: '🎓',
  },
  {
    id: 'working',
    labelEn: 'Working Experience',
    labelZh: '工作经历',
    icon: '💼',
  },
  {
    id: 'project',
    labelEn: 'Project Experience',
    labelZh: '项目经历',
    icon: '🚀',
  },
  {
    id: 'publications',
    labelEn: 'Paper Publications',
    labelZh: '论文发表',
    icon: '📄',
  },
  {
    id: 'leadership',
    labelEn: 'Other/Leadership Experience',
    labelZh: '其他/领导经验',
    icon: '👥',
  },
  {
    id: 'skills',
    labelEn: 'Skills',
    labelZh: '技能',
    icon: '⚡',
  },
]

function CVEditor() {
  const { language } = useLanguage()
  const isZh = language === 'zh'
  const [selectedModules, setSelectedModules] = useState<Set<CVModule>>(
    new Set(['education', 'working', 'project', 'skills'])
  )

  const translations = {
    en: {
      title: 'CV Editor',
      description: 'Select the modules you want to include in your CV',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      continueButton: 'Continue',
      atLeastOne: 'Please select at least one module',
    },
    zh: {
      title: 'CV 编辑器',
      description: '选择您希望在简历中包含的模块',
      selectAll: '全选',
      deselectAll: '全不选',
      continueButton: '继续',
      atLeastOne: '请至少选择一个模块',
    },
  }

  const t = translations[language]

  const handleModuleToggle = (moduleId: CVModule) => {
    setSelectedModules((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId)
      } else {
        newSet.add(moduleId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    setSelectedModules(new Set(cvModules.map((m) => m.id)))
  }

  const handleDeselectAll = () => {
    setSelectedModules(new Set())
  }

  const handleContinue = () => {
    if (selectedModules.size === 0) {
      alert(t.atLeastOne)
      return
    }
    // TODO: Navigate to next step with selected modules
    console.log('Selected modules:', Array.from(selectedModules))
  }

  return (
    <div className="cv-editor">
      <div className="cv-editor-header">
        <h1>{t.title}</h1>
        <p className="cv-editor-description">{t.description}</p>
      </div>

      <div className="cv-editor-container">
        <div className="module-selection-section">
          <div className="selection-actions">
            <button
              className="action-button select-all-button"
              onClick={handleSelectAll}
            >
              {t.selectAll}
            </button>
            <button
              className="action-button deselect-all-button"
              onClick={handleDeselectAll}
            >
              {t.deselectAll}
            </button>
          </div>

          <div className="module-grid">
            {cvModules.map((module) => {
              const isSelected = selectedModules.has(module.id)
              return (
                <div
                  key={module.id}
                  className={`module-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleModuleToggle(module.id)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleModuleToggle(module.id)}
                    className="module-checkbox"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="module-icon">{module.icon}</div>
                  <div className="module-label">
                    {isZh ? module.labelZh : module.labelEn}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="continue-section">
            <button
              className="continue-button"
              onClick={handleContinue}
              disabled={selectedModules.size === 0}
            >
              {t.continueButton}
            </button>
            {selectedModules.size === 0 && (
              <p className="selection-hint">{t.atLeastOne}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CVEditor
