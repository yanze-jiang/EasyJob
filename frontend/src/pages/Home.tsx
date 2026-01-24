import { Link } from 'react-router-dom'
import { useState } from 'react'
import './Home.css'
import { useLanguage } from '../i18n/LanguageContext'

function Home() {
  const [showTipModal, setShowTipModal] = useState(false)
  const { language } = useLanguage()
  const isZh = language === 'zh'

  return (
    <div className="home">
      <div className="home-content">
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
        </div>

        <div className="info-section">
          <div className="info-block">
            <h3 className="info-title">
              {isZh ? '可用功能：' : 'Available Functions:'}
            </h3>
            <div className="info-details">
              <div className="detail-item">
                <span className="highlight-text">
                  {isZh ? '编辑简历' : 'Edit CV'} {isZh ? '[最新发布]' : '[Newly released!]'}
                </span>
              </div>
              <div className="detail-item">
                <span className="highlight-text">
                  {isZh ? '项目润色' : 'Polish Project'}
                </span>
              </div>
              <div className="detail-item">
                <span className="highlight-text">
                  {isZh ? '求职信' : 'Write Cover Letter'}
                </span>
              </div>
            </div>
          </div>

          <div className="info-block">
            <h3 className="info-title">
              {isZh ? '技术详情：' : 'Technical Details:'}
            </h3>
            <div className="info-details">
              <div className="detail-item">
                <strong>{isZh ? '模型：' : 'Model: '}</strong>
                <span className="model-name">qwen3-plus</span>
              </div>
              <div className="detail-item">
                <strong>
                  {isZh ? '数据收集：' : 'Data Collected: '}
                </strong>
                {isZh
                  ? '邮箱地址、用户名、加密后的密码、各功能使用次数和 Token 消耗'
                  : 'Email address, username, encrypted password, usage frequency of each function, and token consumption'}
              </div>
              <div className="detail-item">
                <strong>
                  {isZh ? '您的简历信息不会被收集。' : 'All information about your CV will not be collected.'}
                </strong>
              </div>
            </div>
          </div>

          <div className="info-block">
            <h3 className="info-title">{isZh ? '关于我们：' : 'About Us:'}</h3>
            <p className="about-text">
              {isZh ? (
                <>
                  EasyJob 由 robertyz666 独立开发，于 2025年12月发布。我们欢迎您的反馈和建议，请发送至{' '}
                  <span
                    className="email-link"
                    onClick={() => {
                      navigator.clipboard.writeText('robertyanzejiang@outlook.com')
                      alert('邮箱已复制到剪贴板')
                    }}
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    robertyanzejiang@outlook.com
                  </span>
                  。
                </>
              ) : (
                <>
                  EasyJob is independently developed by{' '}
                  <strong className="brand-name">robertyz666</strong> and launched
                  in December 2025. We welcome your feedback and suggestions at{' '}
                  <span
                    className="email-link"
                    onClick={() => {
                      navigator.clipboard.writeText('robertyanzejiang@outlook.com')
                      alert('Email copied to clipboard')
                    }}
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    robertyanzejiang@outlook.com
                  </span>
                  .
                </>
              )}
            </p>
            <div className="info-details" style={{ marginTop: '0.75rem' }}>
              <div className="detail-item">
                <span
                  className="highlight-text tip-link"
                  onClick={() => setShowTipModal(true)}
                  style={{ cursor: 'pointer' }}
                >
                  {isZh ? '打赏开发者' : 'Sponsor EasyJob'}
                </span>
              </div>
            </div>
            <div className="info-details" style={{ marginTop: '0.75rem' }}>
              <div className="detail-item">
                <strong>{isZh ? '致谢：' : 'Acknowledgement: '}</strong>
                <span>
                  {isZh ? 'CV的模版源于CUHK Coop Team' : 'CV template is sourced from CUHK Coop Team'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="feature-cards">
          <div className="feature-card">
            <div className="card-icon">📝</div>
            <h3>{isZh ? '简历编辑' : 'Edit CV'}</h3>
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
            <h3>{isZh ? '项目润色' : 'Polish Project'}</h3>
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
            <h3>{isZh ? '求职信助手' : 'Write Cover Letter'}</h3>
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

      {showTipModal && (
        <div className="modal-overlay" onClick={() => setShowTipModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowTipModal(false)}
            >
              ×
            </button>
            <h3 className="modal-title">
              {isZh ? '打赏开发者' : 'Sponsor EasyJob'}
            </h3>
            <p className="modal-text">
              {isZh
                ? '感谢您的支持！如果您觉得 EasyJob 对您有帮助，欢迎打赏开发者。'
                : 'Thank you for your support! If EasyJob has been helpful to you, we welcome tips for the developer.'}
            </p>
            {/* 打赏二维码图片 - 将图片放在 public/ 文件夹，命名为 tip.jpg */}
            <div className="tip-image-container" style={{ textAlign: 'center', margin: '1.5rem 0' }}>
              <img 
                src="/tip.jpg" 
                alt={isZh ? '打赏二维码' : 'Tip QR Code'} 
                style={{ 
                  maxWidth: '300px', 
                  width: '100%', 
                  height: 'auto', 
                  borderRadius: '8px',
                  display: 'block',
                  margin: '0 auto'
                }}
              />
            </div>
            <p className="modal-text">
              {isZh
                ? '如有任何问题或建议，请发送邮件至：'
                : 'For any questions or suggestions, please email:'}
            </p>
            <p className="modal-email">
              <span
                className="email-link"
                onClick={() => {
                  navigator.clipboard.writeText('robertyanzejiang@outlook.com')
                  alert(isZh ? '邮箱已复制到剪贴板' : 'Email copied to clipboard')
                }}
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
              >
                robertyanzejiang@outlook.com
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home

