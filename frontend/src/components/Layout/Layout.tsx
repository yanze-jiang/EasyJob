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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  const isZh = language === 'zh'

  // 从localStorage获取用户信息和认证状态
  const updateAuthState = () => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        setUsername(user.username || null)
        setIsAuthenticated(true)
      } catch (e) {
        console.error('Failed to parse user data:', e)
        setUsername(null)
        setIsAuthenticated(false)
      }
    } else {
      setUsername(null)
      setIsAuthenticated(false)
    }
  }

  useEffect(() => {
    // 初始加载
    updateAuthState()

    // 监听用户名更新事件
    const handleUsernameUpdate = () => {
      updateAuthState()
    }

    // 监听 localStorage 变化（用于检测登出，跨标签页同步）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        updateAuthState()
      }
    }

    // 监听自定义事件
    window.addEventListener('usernameUpdated', handleUsernameUpdate as EventListener)
    
    // 监听 storage 事件（跨标签页同步）
    window.addEventListener('storage', handleStorageChange)
    
    // 定期检查认证状态（处理同标签页的 localStorage 变化）
    const intervalId = setInterval(() => {
      updateAuthState()
    }, 500)

    return () => {
      window.removeEventListener('usernameUpdated', handleUsernameUpdate as EventListener)
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(intervalId)
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
            {isAuthenticated && username ? (
              <span className="username-display" style={{ marginRight: '1rem' }}>
                {isZh ? `欢迎, ${username}` : `Welcome, ${username}`}
              </span>
            ) : (
              <span className="username-display" style={{ marginRight: '1rem' }}>
                {isZh ? '请先登录' : 'Please log in first'}
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

