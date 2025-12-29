import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../i18n/LanguageContext'
import './Sidebar.css'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { language } = useLanguage()

  const isZh = language === 'zh'

  // 登出功能
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    onClose()
    navigate('/login')
  }

  const menuItems = [
    { path: '/cv-editor', labelEn: 'CV Editor', labelZh: '简历编辑', icon: '📝' },
    { path: '/project-polish', labelEn: 'Project Polish', labelZh: '项目润色', icon: '✨' },
    { path: '/cover-letter', labelEn: 'Cover Letter', labelZh: '求职信助手', icon: '✉️' },
    { path: '/my-account', labelEn: 'My Account', labelZh: '我的账户', icon: '👤' },
  ]

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>{isZh ? '菜单' : 'Menu'}</h2>
          <button className="sidebar-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${
                location.pathname === item.path ? 'active' : ''
              }`}
              onClick={onClose}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">
                {isZh ? item.labelZh : item.labelEn}
              </span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            {isZh ? '登出' : 'Logout'}
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar

