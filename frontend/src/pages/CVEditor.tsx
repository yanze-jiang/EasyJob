import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import type { CVModule, StructuredData } from '../types/cv'
import CVModuleInput from './CVModuleInput'
import CVStructuredEdit from './CVStructuredEdit'
import CVPreview from './CVPreview'
import './CVEditor.css'

interface CVModuleOption {
  id: CVModule
  labelEn: string
  labelZh: string
}

const cvModules: CVModuleOption[] = [
  {
    id: 'basicInfo',
    labelEn: 'Basic Information',
    labelZh: '基本信息',
  },
  {
    id: 'education',
    labelEn: 'Education',
    labelZh: '教育背景',
  },
  {
    id: 'working',
    labelEn: 'Working Experience',
    labelZh: '工作经历',
  },
  {
    id: 'project',
    labelEn: 'Project Experience',
    labelZh: '项目经历',
  },
  {
    id: 'publications',
    labelEn: 'Paper Publication',
    labelZh: '论文发表',
  },
  {
    id: 'leadership',
    labelEn: 'Leadership Experience/ Other Achievements',
    labelZh: '其他/领导经验',
  },
  {
    id: 'skills',
    labelEn: 'Languages, Skills & Interests',
    labelZh: '技能',
  },
]

type EditorStep = 'selection' | 'input' | 'edit' | 'preview'

function CVEditor() {
  const { language } = useLanguage()
  const isZh = language === 'zh'
  const [step, setStep] = useState<EditorStep>('selection')
  const [selectedModules, setSelectedModules] = useState<Set<CVModule>>(
    new Set()
  )
  const [moduleTexts, setModuleTexts] = useState<Record<CVModule, { rawText: string }>>({} as Record<CVModule, { rawText: string }>)
  const [currentEditModule, setCurrentEditModule] = useState<CVModule | null>(null)
  const [moduleData, setModuleData] = useState<Partial<Record<CVModule, StructuredData>>>({})
  const [currentEditIndex, setCurrentEditIndex] = useState(0)

  const translations = {
    en: {
      title: 'Edit CV',
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
    setStep('input')
  }

  const handleInputComplete = (texts: Partial<Record<CVModule, { rawText: string }>>) => {
    // Debug logging
    if (import.meta.env.DEV) {
      console.log('[CVEditor] Input complete, received texts:', {
        modules: Object.keys(texts),
        texts: texts,
      })
    }
    
    setModuleTexts(texts as Record<CVModule, { rawText: string }>)
    // 只处理有文本输入的模块
    const modulesWithText = Object.keys(texts).filter(
      (key) => texts[key as CVModule]?.rawText?.trim()
    ) as CVModule[]
    
    if (import.meta.env.DEV) {
      console.log('[CVEditor] Modules with text:', modulesWithText)
    }
    
    if (modulesWithText.length > 0) {
      setCurrentEditModule(modulesWithText[0])
      setCurrentEditIndex(0)
      setStep('edit')
    } else {
      // 如果没有模块有文本，直接跳到预览（虽然不会有数据）
      setStep('preview')
    }
  }

  const handleEditSave = (data: StructuredData) => {
    if (currentEditModule) {
      // Debug logging
      if (import.meta.env.DEV) {
        console.log('[CVEditor] Saving data for module:', currentEditModule, data)
      }
      
      setModuleData((prev) => {
        const updated = {
          ...prev,
          [currentEditModule]: data,
        }
        
        if (import.meta.env.DEV) {
          console.log('[CVEditor] Updated moduleData:', updated)
        }
        
        return updated
      })
    }
  }

  const handleEditNext = () => {
    if (currentEditModule) {
      // 只处理有文本输入的模块
      const modulesWithText = Object.keys(moduleTexts).filter(
        (key) => moduleTexts[key as CVModule]?.rawText?.trim()
      ) as CVModule[]
      
      const nextIndex = currentEditIndex + 1

      if (nextIndex < modulesWithText.length) {
        const nextModule = modulesWithText[nextIndex]
        if (import.meta.env.DEV) {
          console.log('[CVEditor] Moving to next module:', nextModule, 'index:', nextIndex)
        }
        setCurrentEditModule(nextModule)
        setCurrentEditIndex(nextIndex)
      } else {
        if (import.meta.env.DEV) {
          console.log('[CVEditor] All modules processed, moving to preview')
        }
        setStep('preview')
      }
    }
  }

  const handleBackFromInput = () => {
    setStep('selection')
  }

  const handleBackToSelection = () => {
    // 返回到模块选择页面（第一个模块的Back按钮）
    setStep('selection')
  }

  const handleEditPrevious = () => {
    // 只处理有文本输入的模块
    const modulesWithText = Object.keys(moduleTexts).filter(
      (key) => moduleTexts[key as CVModule]?.rawText?.trim()
    ) as CVModule[]
    
    if (currentEditIndex > 0) {
      const prevIndex = currentEditIndex - 1
      setCurrentEditIndex(prevIndex)
      setCurrentEditModule(modulesWithText[prevIndex])
    }
  }

  const handleBackFromPreview = () => {
    // 只处理有文本输入的模块
    const modulesWithText = Object.keys(moduleTexts).filter(
      (key) => moduleTexts[key as CVModule]?.rawText?.trim()
    ) as CVModule[]
    
    if (modulesWithText.length > 0) {
      setCurrentEditModule(modulesWithText[modulesWithText.length - 1])
      setCurrentEditIndex(modulesWithText.length - 1)
      setStep('edit')
    } else {
      setStep('input')
    }
  }

  const handlePreviewUpdate = (updatedModules: Partial<Record<CVModule, StructuredData>>) => {
    setModuleData(updatedModules)
  }

  // Render based on current step
  if (step === 'input') {
    return (
      <CVModuleInput
        selectedModules={Array.from(selectedModules)}
        onComplete={handleInputComplete}
        onBack={handleBackFromInput}
      />
    )
  }

  if (step === 'edit' && currentEditModule && moduleTexts[currentEditModule]) {
    // 只处理有文本输入的模块
    const modulesWithText = Object.keys(moduleTexts).filter(
      (key) => moduleTexts[key as CVModule]?.rawText?.trim()
    ) as CVModule[]
    
    return (
      <CVStructuredEdit
        moduleType={currentEditModule}
        rawText={moduleTexts[currentEditModule].rawText}
        onSave={handleEditSave}
        onBack={handleBackToSelection}
        onNext={handleEditNext}
        onPrevious={handleEditPrevious}
        currentIndex={currentEditIndex}
        totalModules={modulesWithText.length}
      />
    )
  }

  if (step === 'preview') {
    return (
      <CVPreview
        modules={moduleData}
        onBack={handleBackFromPreview}
        onUpdateModules={handlePreviewUpdate}
      />
    )
  }

  // Default: selection step
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

          <div className="module-list">
            {cvModules.map((module) => {
              const isSelected = selectedModules.has(module.id)
              return (
                <label
                  key={module.id}
                  className={`module-item ${isSelected ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleModuleToggle(module.id)}
                    className="module-checkbox"
                  />
                  <span className="module-label">
                    {isZh ? module.labelZh : module.labelEn}
                  </span>
                </label>
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
