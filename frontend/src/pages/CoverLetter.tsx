import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import api from '../services/api'
import './CoverLetter.css'

type CoverLetterLanguage = 'en' | 'zh'
type ResumeSource = 'saved' | 'upload'

interface SavedResume {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

function CoverLetter() {
  const { language } = useLanguage()
  const [coverLetterLang, setCoverLetterLang] = useState<CoverLetterLanguage>('en')
  const [targetJobJD, setTargetJobJD] = useState('')
  const [specialRequirements, setSpecialRequirements] = useState('')
  const [resumeSource, setResumeSource] = useState<ResumeSource>('upload')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([])
  const [selectedSavedResumeId, setSelectedSavedResumeId] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [loadingResumes, setLoadingResumes] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [coverLetterResult, setCoverLetterResult] = useState<string>('')
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [showModifyModal, setShowModifyModal] = useState(false)
  const [modifyRequirement, setModifyRequirement] = useState('')
  // Store the original data used to generate the current cover letter
  const [originalJobJD, setOriginalJobJD] = useState<string>('')
  const [originalSpecialRequirements, setOriginalSpecialRequirements] = useState<string>('')
  const [originalResumeContent, setOriginalResumeContent] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const translations = {
    en: {
      title: 'Write Cover Letter',
      description: 'Create professional cover letters tailored to your job applications',
      languageLabel: 'Cover Letter Language',
      languageEn: 'English',
      languageZh: 'Chinese',
      targetJobLabel: 'Target Job Description',
      targetJobPlaceholder: 'Enter the target job description here...',
      resumeLabel: 'Upload Resume',
      resumePlaceholder: 'Click to upload or drag and drop',
      resumeAcceptedFormats: 'PDF or Word (PDF, DOC, DOCX)',
      resumeSelectFile: 'Select File',
      resumeRemoveFile: 'Remove',
      resumeFileError: 'Please upload a PDF or Word document',
      resumeFileSizeError: 'File size must be less than 10MB',
      resumeSourceLabel: 'Resume Source',
      resumeSourceSaved: 'Use Saved Resume',
      resumeSourceUpload: 'Upload New Resume',
      resumeSelectSaved: 'Select Saved Resume',
      resumeNoSaved: 'No saved resumes found',
      resumeLoading: 'Loading saved resumes...',
      specialRequirementsLabel: 'Special Requirements (Optional)',
      specialRequirementsPlaceholder: 'Enter any special requirements or preferences here...',
      generateButton: 'Generate Cover Letter',
      generating: 'Generating...',
      resultLabel: 'Generated Cover Letter',
      noResult: 'Your generated cover letter will appear here',
      error: 'An error occurred while generating your cover letter',
      errorNoJD: 'Please enter a target job description',
      errorNoResume: 'Please upload a resume or select a saved resume',
      regenerateButton: 'Regenerate',
      modifyButton: 'Modify',
      saveButton: 'Save',
      modifyModalTitle: 'Modify Cover Letter',
      modifyModalLabel: 'Modification Requirements',
      modifyModalPlaceholder: 'Please describe how you would like to modify the cover letter...',
      modifyModalCancel: 'Cancel',
      modifyModalConfirm: 'Confirm Modification',
      modifyModalError: 'Please enter modification requirements',
    },
    zh: {
      title: '求职信',
      description: '为您的求职申请创建专业的求职信',
      languageLabel: '求职信语言',
      languageEn: '英文',
      languageZh: '中文',
      targetJobLabel: '目标职位描述',
      targetJobPlaceholder: '请输入目标职位描述...',
      resumeLabel: '上传简历',
      resumePlaceholder: '点击上传或拖拽文件',
      resumeAcceptedFormats: 'PDF 或 Word (PDF, DOC, DOCX)',
      resumeSelectFile: '选择文件',
      resumeRemoveFile: '移除',
      resumeFileError: '请上传 PDF 或 Word 文档',
      resumeFileSizeError: '文件大小必须小于 10MB',
      resumeSourceLabel: '简历来源',
      resumeSourceSaved: '使用已保存的简历',
      resumeSourceUpload: '上传新简历',
      resumeSelectSaved: '选择已保存的简历',
      resumeNoSaved: '未找到已保存的简历',
      resumeLoading: '正在加载已保存的简历...',
      specialRequirementsLabel: '特别要求（可选）',
      specialRequirementsPlaceholder: '请输入您的特别要求或偏好...',
      generateButton: '生成求职信',
      generating: '正在生成...',
      resultLabel: '生成的求职信',
      noResult: '生成的求职信将显示在这里',
      error: '生成求职信时发生错误',
      errorNoJD: '请输入目标职位描述',
      errorNoResume: '请上传简历或选择已保存的简历',
      regenerateButton: '重新生成',
      modifyButton: '修改',
      saveButton: '保存',
      modifyModalTitle: '修改求职信',
      modifyModalLabel: '修改要求',
      modifyModalPlaceholder: '请描述您希望如何修改求职信...',
      modifyModalCancel: '取消',
      modifyModalConfirm: '确认修改',
      modifyModalError: '请输入修改要求',
    },
  }

  const t = translations[language]

  // Load saved resumes on component mount
  useEffect(() => {
    const loadSavedResumes = async () => {
      setLoadingResumes(true)
      try {
        const response = await api.cv.list()
        if (response.success && response.data) {
          setSavedResumes(response.data)
          // If there are saved resumes, default to using saved resume
          if (response.data.length > 0) {
            setResumeSource('saved')
            setSelectedSavedResumeId(response.data[0].id)
          }
        }
      } catch (error) {
        console.error('Failed to load saved resumes:', error)
      } finally {
        setLoadingResumes(false)
      }
    }

    loadSavedResumes()
  }, [])

  const handleResumeSourceChange = (source: ResumeSource) => {
    setResumeSource(source)
    if (source === 'saved') {
      setResumeFile(null)
      setFileError(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      // Select first saved resume if available
      if (savedResumes.length > 0 && !selectedSavedResumeId) {
        setSelectedSavedResumeId(savedResumes[0].id)
      }
    } else {
      setSelectedSavedResumeId(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setResumeFile(null)
      setFileError(null)
      return
    }

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    const validExtensions = ['.pdf', '.doc', '.docx']

    if (
      !validTypes.includes(file.type) &&
      !validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
    ) {
      setFileError(t.resumeFileError)
      setResumeFile(null)
      return
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setFileError(t.resumeFileSizeError)
      setResumeFile(null)
      return
    }

    setResumeFile(file)
    setFileError(null)
  }

  const handleRemoveFile = () => {
    setResumeFile(null)
    setFileError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      const fakeEvent = {
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>
      handleFileChange(fakeEvent)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const extractResumeText = async (file: File): Promise<string> => {
    try {
      // Upload file to backend for text extraction
      const formData = new FormData()
      formData.append('resumeFile', file)

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
      const response = await fetch(`${apiBaseUrl}/resume/extract-text`, {
        method: 'POST',
        body: formData,
      })

      let responseData
      try {
        responseData = await response.json()
      } catch (parseError) {
        throw new Error('Failed to parse server response')
      }
      
      if (!response.ok || !responseData.success) {
        throw new Error(responseData.error || 'Failed to extract text from resume')
      }

      if (!responseData.data || !responseData.data.text) {
        throw new Error('No text content extracted from resume')
      }

      return responseData.data.text
    } catch (error) {
      console.error('Error extracting resume text:', error)
      throw error instanceof Error ? error : new Error('Failed to extract text from resume file')
    }
  }

  const prepareResumeData = async () => {
    let resumeData: any = {}
    if (resumeSource === 'saved') {
      resumeData.resumeId = selectedSavedResumeId
      resumeData.resumeContent = 'Resume content will be fetched from database'
    } else if (resumeFile) {
      // Extract text from uploaded file
      try {
        const extractedText = await extractResumeText(resumeFile)
        resumeData.resumeContent = extractedText
      } catch (error) {
        console.error('Error in prepareResumeData:', error)
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Failed to extract text from resume file'
        throw new Error(errorMessage)
      }
    }
    return resumeData
  }

  const handleGenerate = async (isRegenerate = false) => {
    // Validate inputs
    if (!targetJobJD.trim()) {
      setGenerateError(t.errorNoJD)
      return
    }

    if (resumeSource === 'upload' && !resumeFile) {
      setGenerateError(t.errorNoResume)
      return
    }

    if (resumeSource === 'saved' && !selectedSavedResumeId) {
      setGenerateError(t.errorNoResume)
      return
    }

    setIsGenerating(true)
    setGenerateError(null)
    if (!isRegenerate) {
      setCoverLetterResult('')
    }

    try {
      // Prepare request data
      const resumeData = await prepareResumeData()
      let requestData: any = {
        jobDescription: targetJobJD.trim(),
        language: coverLetterLang,
        specialRequirements: specialRequirements.trim() || undefined,
        ...resumeData,
      }

      // Call API
      const response = await api.coverLetter.generate(requestData)

      if (response.success && response.data) {
        setCoverLetterResult(response.data)
        // Store the original data used for generation (for Modify function)
        setOriginalJobJD(targetJobJD.trim())
        setOriginalSpecialRequirements(specialRequirements.trim())
        // Store resume content
        if (resumeData.resumeContent) {
          setOriginalResumeContent(resumeData.resumeContent)
        }
      } else {
        setGenerateError(response.error || t.error)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t.error
      setGenerateError(errorMessage)
      console.error('Error generating cover letter:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerate = () => {
    handleGenerate(true)
  }

  const handleModify = () => {
    if (!coverLetterResult) {
      setGenerateError(language === 'en' ? 'Please generate a cover letter first' : '请先生成求职信')
      return
    }
    setShowModifyModal(true)
    setModifyRequirement('')
  }

  const handleModifyConfirm = async () => {
    if (!modifyRequirement.trim()) {
      setGenerateError(t.modifyModalError)
      return
    }

    if (!originalJobJD || !originalResumeContent) {
      setGenerateError(language === 'en' ? 'Original data not found. Please regenerate the cover letter first.' : '未找到原始数据，请先重新生成求职信')
      setShowModifyModal(false)
      return
    }

    setIsGenerating(true)
    setGenerateError(null)
    setShowModifyModal(false)

    try {
      // Use the original data (JD, CV, special requirements) that was used to generate the current cover letter
      let requestData: any = {
        jobDescription: originalJobJD,
        resumeContent: originalResumeContent,
        language: coverLetterLang,
        currentCoverLetter: coverLetterResult,
        modificationRequirement: modifyRequirement.trim(),
        specialRequirements: originalSpecialRequirements || undefined,
      }

      // Call modify API
      const response = await api.coverLetter.modify(requestData)

      if (response.success && response.data) {
        setCoverLetterResult(response.data)
        setModifyRequirement('')
      } else {
        setGenerateError(response.error || t.error)
      }
    } catch (err) {
      setGenerateError(t.error)
      console.error('Error modifying cover letter:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = () => {
    if (!coverLetterResult) {
      setGenerateError(language === 'en' ? 'No cover letter to save' : '没有可保存的求职信')
      return
    }

    // Create a blob with the cover letter content
    const blob = new Blob([coverLetterResult], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `cover_letter_${new Date().getTime()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="cover-letter">
      <div className="cover-letter-header">
        <h1>{t.title}</h1>
        <p className="cover-letter-description">{t.description}</p>
      </div>

      <div className="cover-letter-container">
        <div className="cover-letter-config">
          <div className="config-section">
            <label className="config-label">{t.languageLabel}</label>
            <div className="lang-selector">
              <button
                className={`lang-button ${coverLetterLang === 'en' ? 'active' : ''}`}
                onClick={() => setCoverLetterLang('en')}
              >
                {t.languageEn}
              </button>
              <button
                className={`lang-button ${coverLetterLang === 'zh' ? 'active' : ''}`}
                onClick={() => setCoverLetterLang('zh')}
              >
                {t.languageZh}
              </button>
            </div>
          </div>
        </div>

        <div className="cover-letter-input-section">
          <div className="input-group">
            <label className="input-label">{t.targetJobLabel}</label>
            <textarea
              className="cover-letter-textarea"
              value={targetJobJD}
              onChange={(e) => setTargetJobJD(e.target.value)}
              placeholder={t.targetJobPlaceholder}
              rows={10}
            />
          </div>

          <div className="input-group">
            <label className="input-label">{t.resumeLabel}</label>
            
            {/* Resume Source Selection */}
            {savedResumes.length > 0 && (
              <div className="resume-source-selector">
                <button
                  className={`source-button ${resumeSource === 'saved' ? 'active' : ''}`}
                  onClick={() => handleResumeSourceChange('saved')}
                >
                  {t.resumeSourceSaved}
                </button>
                <button
                  className={`source-button ${resumeSource === 'upload' ? 'active' : ''}`}
                  onClick={() => handleResumeSourceChange('upload')}
                >
                  {t.resumeSourceUpload}
                </button>
              </div>
            )}

            {/* Saved Resume Selection */}
            {resumeSource === 'saved' && savedResumes.length > 0 && (
              <div className="saved-resume-selector">
                {loadingResumes ? (
                  <div className="loading-message">{t.resumeLoading}</div>
                ) : (
                  <>
                    <select
                      className="saved-resume-select"
                      value={selectedSavedResumeId || ''}
                      onChange={(e) => setSelectedSavedResumeId(e.target.value)}
                    >
                      <option value="">{t.resumeSelectSaved}</option>
                      {savedResumes.map((resume) => (
                        <option key={resume.id} value={resume.id}>
                          {resume.name} (Updated: {new Date(resume.updatedAt).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            )}

            {/* File Upload Area */}
            {resumeSource === 'upload' && (
              <div
                className="file-upload-area"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  className="file-input"
                  id="resume-upload"
                />
                {!resumeFile ? (
                  <label htmlFor="resume-upload" className="file-upload-label">
                    <div className="file-upload-content">
                      <span className="file-upload-icon">📄</span>
                      <span className="file-upload-text">{t.resumePlaceholder}</span>
                      <span className="file-upload-formats">{t.resumeAcceptedFormats}</span>
                      <button type="button" className="file-select-button">
                        {t.resumeSelectFile}
                      </button>
                    </div>
                  </label>
                ) : (
                  <div className="file-selected">
                    <span className="file-icon">📄</span>
                    <span className="file-name">{resumeFile.name}</span>
                    <span className="file-size">
                      ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                    <button
                      type="button"
                      className="file-remove-button"
                      onClick={handleRemoveFile}
                    >
                      {t.resumeRemoveFile}
                    </button>
                  </div>
                )}
              </div>
            )}

            {fileError && <div className="error-message">{fileError}</div>}
          </div>

          <div className="input-group">
            <label className="input-label">{t.specialRequirementsLabel}</label>
            <textarea
              className="cover-letter-textarea"
              value={specialRequirements}
              onChange={(e) => setSpecialRequirements(e.target.value)}
              placeholder={t.specialRequirementsPlaceholder}
              rows={6}
            />
          </div>

          <button
            className="generate-button"
            onClick={() => handleGenerate()}
            disabled={isGenerating}
          >
            {isGenerating ? t.generating : t.generateButton}
          </button>

          {generateError && <div className="error-message">{generateError}</div>}
        </div>

        <div className="cover-letter-result-section">
          <label className="result-label">{t.resultLabel}</label>
          <div className="result-container">
            {coverLetterResult ? (
              <div className="result-content">{coverLetterResult}</div>
            ) : (
              <div className="result-placeholder">{t.noResult}</div>
            )}
          </div>
          
          {coverLetterResult && (
            <div className="result-actions">
              <button
                className="action-button regenerate-button"
                onClick={handleRegenerate}
                disabled={isGenerating}
              >
                {t.regenerateButton}
              </button>
              <button
                className="action-button modify-button"
                onClick={handleModify}
                disabled={isGenerating}
              >
                {t.modifyButton}
              </button>
              <button
                className="action-button save-button"
                onClick={handleSave}
                disabled={isGenerating}
              >
                {t.saveButton}
              </button>
            </div>
          )}
        </div>

        {/* Modify Modal */}
        {showModifyModal && (
          <div className="modal-overlay" onClick={() => setShowModifyModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{t.modifyModalTitle}</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowModifyModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <label className="input-label">{t.modifyModalLabel}</label>
                <textarea
                  className="cover-letter-textarea"
                  value={modifyRequirement}
                  onChange={(e) => setModifyRequirement(e.target.value)}
                  placeholder={t.modifyModalPlaceholder}
                  rows={6}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="modal-button cancel-button"
                  onClick={() => setShowModifyModal(false)}
                >
                  {t.modifyModalCancel}
                </button>
                <button
                  className="modal-button confirm-button"
                  onClick={handleModifyConfirm}
                  disabled={isGenerating}
                >
                  {isGenerating ? t.generating : t.modifyModalConfirm}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CoverLetter

