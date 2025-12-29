import { useEffect, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import api from '../services/api'
import './MyAccount.css'

interface UserData {
  id: string
  email: string
  username: string
  createdAt: string
}

interface UserStats {
  projectsPolished: number
  cvsEdited: number
  coverLettersGenerated: number
  totalTokensUsed: number
}

function MyAccount() {
  const { language } = useLanguage()
  const [user, setUser] = useState<UserData | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const translations = {
    en: {
      title: 'My Account',
      profile: 'Profile',
      email: 'Email',
      name: 'Name',
      memberSince: 'Member Since',
      settings: 'Settings',
      preferences: 'Preferences',
      language: 'Language',
      notifications: 'Notifications',
      statistics: 'Statistics',
      totalProjects: 'Total Projects Polished',
      totalCVs: 'Total CVs Edited',
      totalCoverLetters: 'Total Cover Letters Generated',
      editProfile: 'Edit Profile',
      saveChanges: 'Save Changes',
      cancel: 'Cancel',
    },
    zh: {
      title: '我的账户',
      profile: '个人资料',
      email: '邮箱',
      name: '姓名',
      memberSince: '注册时间',
      settings: '设置',
      preferences: '偏好设置',
      language: '语言',
      notifications: '通知',
      statistics: '统计信息',
      totalProjects: '已润色项目总数',
      totalCVs: '已编辑简历总数',
      totalCoverLetters: '已生成求职信总数',
      editProfile: '编辑资料',
      saveChanges: '保存更改',
      cancel: '取消',
    },
  }

  const t = translations[language]

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.user.getMe()
        
        if (response.success && response.data) {
          setUser(response.data.user)
          setStats(response.data.stats)
        } else {
          setError(response.error || (language === 'zh' ? '获取用户信息失败' : 'Failed to fetch user data'))
        }
      } catch (err) {
        console.error('Error fetching user data:', err)
        setError(language === 'zh' ? '获取用户信息失败，请重试' : 'Failed to fetch user data, please try again')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [language])

  // 格式化日期
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch (e) {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="my-account">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          {language === 'zh' ? '加载中...' : 'Loading...'}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="my-account">
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="my-account">
      <h1 className="account-title">{t.title}</h1>

      <div className="account-content">
        <div className="account-section">
          <h2>{t.profile}</h2>
          <div className="profile-info">
            <div className="info-item">
              <label>{t.email}</label>
              <span>{user?.email || '-'}</span>
            </div>
            <div className="info-item">
              <label>{t.name}</label>
              <span>{user?.username || '-'}</span>
            </div>
            <div className="info-item">
              <label>{t.memberSince}</label>
              <span>{user?.createdAt ? formatDate(user.createdAt) : '-'}</span>
            </div>
          </div>
          <button className="edit-button">{t.editProfile}</button>
        </div>

        <div className="account-section">
          <h2>{t.settings}</h2>
          <div className="settings-list">
            <div className="setting-item">
              <label>{t.language}</label>
              <span>{language === 'en' ? 'English' : '中文'}</span>
            </div>
            <div className="setting-item">
              <label>{t.notifications}</label>
              <span>{language === 'en' ? 'Enabled' : '已启用'}</span>
            </div>
          </div>
        </div>

        <div className="account-section">
          <h2>{t.statistics}</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats?.projectsPolished || 0}</div>
              <div className="stat-label">{t.totalProjects}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.cvsEdited || 0}</div>
              <div className="stat-label">{t.totalCVs}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.coverLettersGenerated || 0}</div>
              <div className="stat-label">{t.totalCoverLetters}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.totalTokensUsed.toLocaleString() || 0}</div>
              <div className="stat-label">{language === 'zh' ? '总Token使用量' : 'Total Tokens Used'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyAccount

