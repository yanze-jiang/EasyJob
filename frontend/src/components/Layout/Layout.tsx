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
  const [username, setUsername] = useState<string | null>(null)

  const isZh = language === 'zh'

  // 从localStorage获取用户信息
  const updateUsername = () => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setUsername(user.username || null)
      } catch (e) {
        console.error('Failed to parse user data:', e)
      }
    }
  }

  useEffect(() => {
    // 初始加载
    updateUsername()

    // 监听用户名更新事件
    const handleUsernameUpdate = (event: CustomEvent) => {
      setUsername(event.detail.username)
    }

    window.addEventListener('usernameUpdated', handleUsernameUpdate as EventListener)

    return () => {
      window.removeEventListener('usernameUpdated', handleUsernameUpdate as EventListener)
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
              className="lang-switch"
              onClick={toggleLanguage}
            >
              {isZh ? 'EN' : '中'}
            </button>
          </div>
        </div>
      </header>
      <div className="layout-body">
        <Sidebar />
        <main className="main-content">{children}</main>
      </div>
      <footer className="footer">
        <p>
          &copy; 2026 EasyJob.{' '}
          {isZh ? '保留所有权利。' : 'All rights reserved.'}
        </p>
      </footer>
    </div>
  )
}

export default Layout

