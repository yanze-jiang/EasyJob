import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import './Sidebar.css'

function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { language } = useLanguage()
  const [collapsed, setCollapsed] = useState(false)

  const isZh = language === 'zh'

  // 登出功能
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const menuItems = [
    { path: '/', labelEn: 'Home', labelZh: '首页', icon: '🏠' },
    { path: '/cv-editor', labelEn: 'CV Editor', labelZh: '简历编辑', icon: '📝' },
    { path: '/project-polish', labelEn: 'Project Polish', labelZh: '项目润色', icon: '✨' },
    { path: '/cover-letter', labelEn: 'Cover Letter', labelZh: '求职信助手', icon: '✉️' },
    { path: '/my-account', labelEn: 'My Account', labelZh: '我的账户', icon: '👤' },
  ]

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && <h2>{isZh ? '菜单' : 'Menu'}</h2>}
      </div>
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
      <div className="sidebar-footer">
        {!collapsed && (
          <button className="sidebar-logout" onClick={handleLogout}>
            {isZh ? '登出' : 'Logout'}
          </button>
        )}
        {collapsed && (
          <button 
            className="sidebar-logout-icon" 
            onClick={handleLogout}
            title={isZh ? '登出' : 'Logout'}
          >
            🚪
          </button>
        )}
      </div>
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

