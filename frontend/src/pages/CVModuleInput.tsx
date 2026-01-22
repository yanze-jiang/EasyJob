import { useState, useEffect } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import type { CVModule } from '../types/cv'
import './CVModuleInput.css'

interface CVModuleInputProps {
  selectedModules: CVModule[]
  onComplete: (moduleData: Partial<Record<CVModule, { rawText: string }>>) => void
  onBack: () => void
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

// 需要多输入框的模块
const multiInputModules: CVModule[] = ['education', 'working', 'project', 'publications', 'leadership']

const modulePlaceholders: Record<CVModule, { en: string; zh: string }> = {
  basicInfo: {
    en: 'Enter your basic information...\n\nExample:\nJohn Doe\n+1 (555) 123-4567\njohn.doe@email.com\nLinkedIn: linkedin.com/in/johndoe\nGitHub: github.com/johndoe',
    zh: '请输入您的基本信息...\n\n示例：\n张三\n+86 138-0000-0000\nzhangsan@email.com\nLinkedIn: linkedin.com/in/zhangsan\nGitHub: github.com/zhangsan',
  },
  education: {
    en: 'Enter your education background information...\n\nExample:\nBachelor of Science in Computer Science\nTsinghua University\n2020-2024\nBeijing, China\nGPA: 3.8/4.0',
    zh: '请输入您的教育背景信息...\n\n示例：\n学士学位，计算机科学与技术\n清华大学\n2020年9月至2024年6月\n北京\nGPA: 3.8/4.0',
  },
  working: {
    en: 'Enter your working experience...\n\nExample:\nSoftware Engineer\nAlibaba Group\nJune 2022 - August 2023\nHangzhou, China\nResponsibilities:\n- Developed backend APIs\n- Optimized database queries',
    zh: '请输入您的工作经历...\n\n示例：\n软件工程师\n阿里巴巴集团\n2022年6月至2023年8月\n杭州\n主要职责：\n- 负责后端API开发\n- 优化数据库查询性能',
  },
  project: {
    en: 'Enter your project experience...\n\nExample:\nE-commerce Platform\nJan 2023 - Jun 2023\nRole: Full-stack Developer\n- Built user authentication system\n- Implemented payment integration',
    zh: '请输入您的项目经历...\n\n示例：\n电商平台\n2023年1月至2023年6月\n角色：全栈开发工程师\n- 开发用户认证系统\n- 实现支付集成',
  },
  publications: {
    en: 'Enter your publications...\n\nExample:\n"Deep Learning for Image Recognition"\nAuthors: John Doe, Jane Smith\nJournal: AI Research\nYear: 2023\nDOI: 10.1234/example',
    zh: '请输入您的论文发表...\n\n示例：\n"深度学习在图像识别中的应用"\n作者：张三，李四\n期刊：人工智能研究\n年份：2023\nDOI: 10.1234/example',
  },
  leadership: {
    en: 'Enter your leadership experience...\n\nExample:\nPresident\nStudent Union\n2021-2022\n- Organized campus events\n- Led team of 20 members',
    zh: '请输入您的领导经验...\n\n示例：\n主席\n学生会\n2021年至2022年\n- 组织校园活动\n- 领导20人团队',
  },
  skills: {
    en: 'Enter your skills...\n\nExample:\nLanguages: English (Fluent), Chinese (Native)\nProgramming: Java, Python, JavaScript\nFrameworks: React, Spring Boot\nDatabases: PostgreSQL, MySQL\nTools: Git, Docker',
    zh: '请输入您的技能...\n\n示例：\n语言：中文（母语）、英文（流利）\n编程语言：Java, Python, JavaScript\n框架：React, Spring Boot\n数据库：PostgreSQL, MySQL\n工具：Git, Docker',
  },
}

function CVModuleInput({ selectedModules, onComplete, onBack }: CVModuleInputProps) {
  const { language } = useLanguage()
  const isZh = language === 'zh'
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0)
  const [moduleTexts, setModuleTexts] = useState<Record<CVModule, string>>({} as Record<CVModule, string>)
  // 存储每个模块的数量选择（仅用于多输入模块）
  const [moduleCounts, setModuleCounts] = useState<Record<CVModule, number>>({} as Record<CVModule, number>)
  // 存储每个模块的多个输入框内容（仅用于多输入模块）
  const [moduleMultiTexts, setModuleMultiTexts] = useState<Record<CVModule, string[]>>({} as Record<CVModule, string[]>)
  // 存储滑块临时值（用于多输入模块的数量选择）
  const [sliderValue, setSliderValue] = useState(1)

  const currentModule = selectedModules[currentModuleIndex]
  const isMultiInputModule = multiInputModules.includes(currentModule)
  const currentCount = moduleCounts[currentModule] || 0
  const currentMultiTexts = moduleMultiTexts[currentModule] || []
  const currentText = isMultiInputModule ? '' : (moduleTexts[currentModule] || '')

  const translations = {
    en: {
      title: 'Enter Information',
      description: 'Please enter the information for each selected module',
      currentModule: 'Current Module',
      nextButton: 'Next',
      previousButton: 'Previous',
      finishButton: 'Finish',
      continueButton: 'Continue',
      backButton: 'Back',
      progress: 'Progress',
      selectCount: 'Number of {module} module:',
      confirmCount: 'Confirm',
      itemLabel: 'Item {index}',
    },
    zh: {
      title: '输入信息',
      description: '请为每个选中的模块输入信息',
      currentModule: '当前模块',
      nextButton: '下一步',
      previousButton: '上一步',
      finishButton: '完成',
      continueButton: '继续',
      backButton: '返回',
      progress: '进度',
      selectCount: '{module}模块数量：',
      confirmCount: '确认',
      itemLabel: '第 {index} 项',
    },
  }

  const t = translations[language]

  // 当切换模块时，重置滑块值
  useEffect(() => {
    setSliderValue(1)
  }, [currentModule])

  const handleTextChange = (text: string) => {
    setModuleTexts((prev) => ({
      ...prev,
      [currentModule]: text,
    }))
  }

  const handleCountChange = (count: number) => {
    setModuleCounts((prev) => ({
      ...prev,
      [currentModule]: count,
    }))
    // 初始化对应数量的输入框数组
    setModuleMultiTexts((prev) => {
      const existing = prev[currentModule] || []
      const newArray = Array(count).fill('').map((_, index) => existing[index] || '')
      return {
        ...prev,
        [currentModule]: newArray,
      }
    })
  }

  const handleMultiTextChange = (index: number, text: string) => {
    setModuleMultiTexts((prev) => {
      const current = prev[currentModule] || []
      const newArray = [...current]
      newArray[index] = text
      return {
        ...prev,
        [currentModule]: newArray,
      }
    })
  }

  const handleNext = () => {
    if (currentModuleIndex < selectedModules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1)
    } else {
      handleFinish()
    }
  }

  const handlePrevious = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1)
    }
  }

  const handleFinish = () => {
    // 验证所有模块都已填写
    const unfilledModules: CVModule[] = []
    selectedModules.forEach((module) => {
      if (multiInputModules.includes(module)) {
        // 多输入模块：检查是否选择了数量且所有输入框都已填写
        const count = moduleCounts[module] || 0
        const texts = moduleMultiTexts[module] || []
        if (count === 0 || texts.some((text) => !text.trim())) {
          unfilledModules.push(module)
        }
      } else {
        // 单输入模块：检查是否有文本
        if (!moduleTexts[module]?.trim()) {
          unfilledModules.push(module)
        }
      }
    })

    if (unfilledModules.length > 0) {
      const moduleNames = unfilledModules
        .map((m) => (isZh ? moduleLabels[m].zh : moduleLabels[m].en))
        .join(', ')
      alert(
        isZh
          ? `请完成以下模块的填写：${moduleNames}`
          : `Please complete the following modules: ${moduleNames}`
      )
      return
    }

    const moduleData: Partial<Record<CVModule, { rawText: string }>> = {}
    selectedModules.forEach((module) => {
      if (multiInputModules.includes(module)) {
        // 多输入模块：合并所有输入框内容
        const texts = moduleMultiTexts[module] || []
        const combinedText = texts.filter((text) => text.trim()).join('\n\n---\n\n')
        if (combinedText.trim()) {
          moduleData[module] = { rawText: combinedText }
        }
      } else {
        // 单输入模块
        if (moduleTexts[module]?.trim()) {
          moduleData[module] = { rawText: moduleTexts[module] }
        }
      }
    })
    
    // Debug logging
    if (import.meta.env.DEV) {
      console.log('[CVModuleInput] Finished, sending module data:', {
        modules: Object.keys(moduleData),
        data: moduleData,
      })
    }
    
    onComplete(moduleData)
  }

  const handleModuleClick = (module: CVModule) => {
    const index = selectedModules.indexOf(module)
    if (index !== -1) {
      setCurrentModuleIndex(index)
    }
  }

  const getModuleStatus = (module: CVModule): 'completed' | 'current' | 'pending' => {
    if (module === currentModule) {
      return 'current'
    }
    if (multiInputModules.includes(module)) {
      // 多输入模块：检查是否选择了数量且所有输入框都已填写
      const count = moduleCounts[module] || 0
      const texts = moduleMultiTexts[module] || []
      if (count > 0 && texts.length === count && texts.every((text) => text.trim())) {
        return 'completed'
      }
    } else {
      // 单输入模块
      if (moduleTexts[module]?.trim()) {
        return 'completed'
      }
    }
    return 'pending'
  }

  const progress = ((currentModuleIndex + 1) / selectedModules.length) * 100
  const isLastModule = currentModuleIndex === selectedModules.length - 1
  const isFirstModule = currentModuleIndex === 0
  
  // 检查所有模块是否都已填写（用于Continue按钮）
  const allModulesFilled = selectedModules.every((module) => {
    if (multiInputModules.includes(module)) {
      // 多输入模块：检查是否选择了数量且所有输入框都已填写
      const count = moduleCounts[module] || 0
      const texts = moduleMultiTexts[module] || []
      return count > 0 && texts.length === count && texts.every((text) => text.trim())
    } else {
      // 单输入模块
      return moduleTexts[module]?.trim().length > 0
    }
  })

  return (
    <div className="cv-module-input">
      <div className="cv-module-input-header">
        <h1>{t.title}</h1>
        <p className="cv-module-input-description">{t.description}</p>
      </div>

      <div className="cv-module-input-container">
        <div className="progress-section">
          <div className="progress-label">
            {t.progress}: {currentModuleIndex + 1} / {selectedModules.length}
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="module-navigation">
          <div className="module-navigation-label">
            {isZh ? '模块导航' : 'Module Navigation'}
          </div>
          <div className="module-navigation-list">
            {selectedModules.map((module) => {
              const status = getModuleStatus(module)
              const moduleLabel = isZh ? moduleLabels[module].zh : moduleLabels[module].en
              return (
                <button
                  key={module}
                  className={`module-nav-item module-nav-${status}`}
                  onClick={() => handleModuleClick(module)}
                  title={moduleLabel}
                >
                  {moduleLabel}
                </button>
              )
            })}
          </div>
        </div>

        <div className="module-input-section">
          <div className="current-module-label">
            {t.currentModule}: {isZh ? moduleLabels[currentModule].zh : moduleLabels[currentModule].en}
          </div>

          {isMultiInputModule ? (
            // 多输入模块：显示数量选择器或多个输入框
            currentCount === 0 ? (
              <div className="count-selector">
                <div className="count-input-container">
                  <div className="count-selector-label">
                    {t.selectCount.replace('{module}', isZh ? moduleLabels[currentModule].zh : moduleLabels[currentModule].en)}
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={sliderValue}
                    onChange={(e) => {
                      const value = Math.max(1, Math.min(10, Number(e.target.value) || 1))
                      setSliderValue(value)
                    }}
                    className="count-input"
                  />
                </div>
                <button
                  className="confirm-count-button"
                  onClick={() => handleCountChange(sliderValue)}
                >
                  {t.confirmCount}
                </button>
              </div>
            ) : (
              <div className="multi-input-container">
                {currentMultiTexts.map((text, index) => (
                  <div key={index} className="multi-input-item">
                    <div className="multi-input-label">
                      {t.itemLabel.replace('{index}', String(index + 1))}
                    </div>
                    <textarea
                      className="module-textarea"
                      value={text}
                      onChange={(e) => handleMultiTextChange(index, e.target.value)}
                      placeholder={isZh ? modulePlaceholders[currentModule].zh : modulePlaceholders[currentModule].en}
                      rows={10}
                    />
                  </div>
                ))}
                <button
                  className="change-count-button"
                  onClick={() => handleCountChange(0)}
                >
                  {isZh ? '重新选择数量' : 'Change Count'}
                </button>
              </div>
            )
          ) : (
            // 单输入模块：显示单个输入框
            <textarea
              className="module-textarea"
              value={currentText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={isZh ? modulePlaceholders[currentModule].zh : modulePlaceholders[currentModule].en}
              rows={12}
            />
          )}

          <div className="input-actions">
            <div className="navigation-buttons">
              {isFirstModule ? (
                <button className="action-button back-button" onClick={onBack}>
                  {t.backButton}
                </button>
              ) : (
                <button className="action-button previous-button" onClick={handlePrevious}>
                  {t.previousButton}
                </button>
              )}
              <button
                className={`action-button ${isLastModule ? 'continue-button' : 'next-button'}`}
                onClick={isLastModule ? handleFinish : handleNext}
                disabled={isLastModule && !allModulesFilled}
              >
                {isLastModule ? t.continueButton : t.nextButton}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CVModuleInput
