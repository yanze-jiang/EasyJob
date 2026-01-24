import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import api from '../../services/api'
import './Sidebar.css'

function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { language } = useLanguage()
  const [collapsed, setCollapsed] = useState(false)
  const [backendStatus, setBackendStatus] = useState<
    'checking' | 'connected' | 'disconnected'
  >('checking')

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

  // 登出功能
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // 触发自定义事件通知 Layout 更新
    window.dispatchEvent(new CustomEvent('usernameUpdated'))
    navigate('/login')
  }

  const menuItems = [
    { path: '/', labelEn: 'Home', labelZh: '首页', icon: '🏠' },
    { path: '/cv-editor', labelEn: 'Edit CV', labelZh: '简历编辑', icon: '📝' },
    { path: '/project-polish', labelEn: 'Polish Project', labelZh: '项目润色', icon: '✨' },
    { path: '/cover-letter', labelEn: 'Write Cover Letter', labelZh: '求职信助手', icon: '✉️' },
    { path: '/my-account', labelEn: 'My Account', labelZh: '我的账户', icon: '👤' },
  ]

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && <h2>{isZh ? '菜单' : 'Menu'}</h2>}
      </div>
      {!collapsed && (
        <div className="sidebar-status">
          <span className={`status-indicator ${backendStatus}`}>
            {backendStatus === 'checking' &&
              (isZh ? '🔄 正在检查后端连接…' : '🔄 Checking backend...')}
            {backendStatus === 'connected' &&
              (isZh ? '✅ 已连至云端，现可使用。' : '✅ Connected to the server, you can try now.')}
            {backendStatus === 'disconnected' &&
              (isZh ? '⚠️ 后端未连接' : '⚠️ Backend disconnected')}
          </span>
        </div>
      )}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${
              location.pathname === item.path ? 'active' : ''
            }`}
            title={collapsed ? (isZh ? item.labelZh : item.labelEn) : ''}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {!collapsed && (
              <span className="sidebar-label">
                {isZh ? item.labelZh : item.labelEn}
              </span>
            )}
          </Link>
        ))}
      </nav>
      {!collapsed && (
        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            {isZh ? '登出' : 'Logout'}
          </button>
        </div>
      )}
      <button
        className="sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={isZh ? '切换菜单' : 'Toggle menu'}
      >
        <span className={`toggle-icon ${collapsed ? 'collapsed' : ''}`}>
          ◀
        </span>
      </button>
    </aside>
  )
}

export default Sidebar

