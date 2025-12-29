import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../services/api'
import './Home.css'
import { useLanguage } from '../i18n/LanguageContext'

function Home() {
  const [backendStatus, setBackendStatus] = useState<
    'checking' | 'connected' | 'disconnected'
  >('checking')
  const { language } = useLanguage()
  const isZh = language === 'zh'

  useEffect(() => {
    // Test backend connection on component mount
    api
      .health()
      .then((response) => {
        if (response.success) {
          setBackendStatus('connected')
        } else {
          setBackendStatus('disconnected')
        }
      })
      .catch(() => {
        setBackendStatus('disconnected')
      })
  }, [])

  return (
    <div className="home">
      <div className="hero">
        <h2>{isZh ? '欢迎来到 EasyJob' : 'Welcome to EasyJob'}</h2>
        <p className="hero-description">
          {isZh ? (
            <>
              使用 AI 来优化你的简历！试试 <strong>Qwen3-plus</strong>！！！
              <br />
              由 robertyz666 开发。
              <br />
              已解锁<strong>项目润色</strong>和<strong>求职信</strong>功能！
            </>
          ) : (
            <>
              Using AI to revise your CV! Try <strong>Qwen3-plus</strong>!
              <br />
              Already unlock <strong>Project Polish</strong> and <strong>Cover Letter</strong>!
              <br />
              Developed by robertyz666 in Dec 2025
            </>
          )}
        </p>
        <div className="backend-status">
          <span className={`status-indicator ${backendStatus}`}>
            {backendStatus === 'checking' &&
              (isZh ? '🔄 正在检查后端连接…' : '🔄 Checking backend...')}
            {backendStatus === 'connected' &&
              (isZh ? '✅ 后端已连接' : '✅ Backend connected')}
            {backendStatus === 'disconnected' &&
              (isZh ? '⚠️ 后端未连接' : '⚠️ Backend disconnected')}
          </span>
        </div>
      </div>

      <div className="feature-cards">
        <div className="feature-card">
          <div className="card-icon">📝</div>
          <h3>{isZh ? '简历编辑' : 'CV Editor'}</h3>
          <p>
            {isZh
              ? '利用 AI 优化你的简历内容和表达方式，让亮点更突出。'
              : 'Create and refine your resume with AI-powered suggestions and improvements.'}
          </p>
          <Link to="/cv-editor" className="card-button">
            {isZh ? '开始使用' : 'Get Started'}
          </Link>
        </div>

        <div className="feature-card">
          <div className="card-icon">✨</div>
          <h3>{isZh ? '项目润色' : 'Project Polish'}</h3>
          <p>
            {isZh
              ? '用专业、清晰的语言包装你的项目经历，让面试官一眼看懂价值。'
              : 'Enhance your project descriptions with professional language and structure.'}
          </p>
          <Link to="/project-polish" className="card-button">
            {isZh ? '开始使用' : 'Get Started'}
          </Link>
        </div>

        <div className="feature-card">
          <div className="card-icon">✉️</div>
          <h3>{isZh ? '求职信助手' : 'Cover Letter'}</h3>
          <p>
            {isZh
              ? '根据职位 JD 和你的背景，一键生成个性化求职信。'
              : 'Generate personalized cover letters tailored to specific job applications.'}
          </p>
          <Link to="/cover-letter" className="card-button">
            {isZh ? '开始使用' : 'Get Started'}
          </Link>
        </div>

        <div className="feature-card">
          <div className="card-icon">👤</div>
          <h3>{isZh ? '我的账户' : 'My Account'}</h3>
          <p>
            {isZh
              ? '查看你的使用统计和个人偏好设置，管理 EasyJob 相关信息。'
              : 'View your usage statistics and preferences, and manage your EasyJob account.'}
          </p>
          <Link to="/my-account" className="card-button">
            {isZh ? '进入账户' : 'Go to Account'}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home

