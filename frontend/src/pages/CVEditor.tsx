import './PagePlaceholder.css'
import { useLanguage } from '../i18n/LanguageContext'

function CVEditor() {
  const { language } = useLanguage()
  const isZh = language === 'zh'

  return (
    <div className="page-placeholder">
      <h1>{isZh ? 'CV 编辑器' : 'CV Editor'}</h1>
      <p className="placeholder-description">
        {isZh ? '此功能暂未开通' : 'This feature is not yet available'}
      </p>
      <div className="placeholder-content">
        <p>{isZh ? '我们正在努力开发此功能，敬请期待...' : 'We are working hard to develop this feature. Please stay tuned...'}</p>
      </div>
    </div>
  )
}

export default CVEditor

