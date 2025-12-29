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
        <h2 className="hero-title">
          {isZh ? (
            <>
              欢迎来到 EasyJob
              <br />
              <span className="hero-subtitle">AI 助您优化简历，提升职业发展！</span>
            </>
          ) : (
            <>
              Welcome to EasyJob
              <br />
              <span className="hero-subtitle">where AI helps refine your resume and boost your career!</span>
            </>
          )}
        </h2>
        <div className="hero-content">
          <div className="info-row">
            <div className="info-item">
              <strong>
                {isZh ? '解锁功能：' : 'Function avaliable: '}
              </strong>
              {isZh ? (
                <>
                  <span className="highlight-text">项目润色</span> 和{' '}
                  <span className="highlight-text">求职信</span>
                </>
              ) : (
                <>
                  <span className="highlight-text">Project Polish</span> and{' '}
                  <span className="highlight-text">Cover Letter</span>
                </>
              )}
            </div>
            <div className="info-item">
              <strong>{isZh ? '使用模型：' : 'Model used: '}</strong>
              <span className="model-name">qwen3-plus</span>
            </div>
          </div>
          <div className="info-item">
            <strong>{isZh ? '数据收集：' : 'Data collected: '}</strong>
            {isZh
              ? '您的邮箱地址、用户名、加密后的密码、各功能使用频率和 Token 消耗。'
              : 'Your email address, username, encrypted password, usage frequency, and token consumption.'}
          </div>
          <div className="info-item">
            {isZh
              ? 'EasyJob 由 robertyz666 于 2025年12月开发'
              : 'EasyJob is developed by robertyz666 in Dec 2025'}
          </div>
          <div className="info-item">
            {isZh
              ? '如有建议，请发送至 robertyanzejiang@outlook.com'
              : 'Any suggestions, please send to robertyanzejiang@outlook.com'}
          </div>
          <div className="info-item">
            <button className="tip-button">
              {isZh ? '打赏创作者' : 'Tip the creator'}
            </button>
          </div>
        </div>
        <div className="backend-status">
          <span className={`status-indicator ${backendStatus}`}>
            {backendStatus === 'checking' &&
              (isZh ? '🔄 正在检查后端连接…' : '🔄 Checking backend...')}
            {backendStatus === 'connected' &&
              (isZh ? '✅ 已连接到服务器，可以开始使用了。' : '✅ Connected to the server, you can try now.')}
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

