import { ReactNode, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Layout.css'
import { useLanguage } from '../../i18n/LanguageContext'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: ReactNode
}

function Layout({ children }: LayoutProps) {
  const { language, toggleLanguage } = useLanguage()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [username, setUsername] = useState<string | null>(null)

  const isZh = language === 'zh'

  // 从localStorage获取用户信息
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setUsername(user.username || null)
      } catch (e) {
        console.error('Failed to parse user data:', e)
      }
    }
  }, [])


  return (
    <div className="layout">
      <header className="header">
        <div className="header-top">
          <Link to="/" className="logo">
            <h1>EasyJob</h1>
            <p className="tagline">
              {isZh ? '你的 AI 求职助手' : 'Your AI-powered career assistant'}
            </p>
          </Link>
          <div className="header-right">
            {username && (
              <span className="username-display" style={{ marginRight: '1rem' }}>
                {isZh ? `欢迎, ${username}` : `Welcome, ${username}`}
              </span>
            )}
            <button
              type="button"
              className="menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label={isZh ? '打开菜单' : 'Open menu'}
            >
              ☰
            </button>
            <button
              type="button"
              className="lang-switch"
              onClick={toggleLanguage}
            >
              {isZh ? 'EN' : '中'}
            </button>
          </div>
        </div>
      </header>
      <main className="main-content">{children}</main>
      <footer className="footer">
        <p>
          &copy; 2025 EasyJob.{' '}
          {isZh ? '保留所有权利。' : 'All rights reserved.'}
        </p>
      </footer>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  )
}

export default Layout

