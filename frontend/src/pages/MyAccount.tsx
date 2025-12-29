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
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    username: '',
    password: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const translations = {
    en: {
      title: 'My Account',
      profile: 'Profile',
      email: 'Email',
      name: 'User Name',
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
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      passwordRequired: 'Please enter current password to change password',
      passwordsNotMatch: 'New passwords do not match',
      updateSuccess: 'Profile updated successfully',
    },
    zh: {
      title: '我的账户',
      profile: '个人资料',
      email: '邮箱',
      name: '用户名',
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
      currentPassword: '当前密码',
      newPassword: '新密码',
      confirmPassword: '确认新密码',
      passwordRequired: '修改密码需要输入当前密码',
      passwordsNotMatch: '两次输入的新密码不一致',
      updateSuccess: '资料更新成功',
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

  // 开始编辑
  const handleEdit = () => {
    setIsEditing(true)
    setEditForm({
      username: user?.username || '',
      password: '',
      newPassword: '',
      confirmPassword: '',
    })
    setSaveError(null)
  }

  // 取消编辑
  const handleCancel = () => {
    setIsEditing(false)
    setEditForm({
      username: '',
      password: '',
      newPassword: '',
      confirmPassword: '',
    })
    setSaveError(null)
  }

  // 保存更改
  const handleSave = async () => {
    try {
      setSaving(true)
      setSaveError(null)

      // 验证：如果要修改密码，必须输入当前密码
      if (editForm.newPassword && !editForm.password) {
        setSaveError(t.passwordRequired)
        setSaving(false)
        return
      }

      // 验证：新密码和确认密码必须一致
      if (editForm.newPassword && editForm.newPassword !== editForm.confirmPassword) {
        setSaveError(t.passwordsNotMatch)
        setSaving(false)
        return
      }

      // 构建更新数据
      const updateData: {
        username?: string
        password?: string
        newPassword?: string
      } = {}

      if (editForm.username !== user?.username) {
        updateData.username = editForm.username
      }

      if (editForm.newPassword) {
        updateData.password = editForm.password
        updateData.newPassword = editForm.newPassword
      }

      // 如果没有要更新的内容
      if (Object.keys(updateData).length === 0) {
        setIsEditing(false)
        setSaving(false)
        return
      }

      // 调用 API
      const response = await api.user.updateMe(updateData)

      if (response.success && response.data) {
        // 更新本地用户数据
        setUser(response.data.user)
        setIsEditing(false)
        setEditForm({
          username: '',
          password: '',
          newPassword: '',
          confirmPassword: '',
        })
        setSaveError(null)
        // 可以显示成功消息
        alert(t.updateSuccess)
      } else {
        setSaveError(response.error || (language === 'zh' ? '更新失败' : 'Update failed'))
      }
    } catch (err) {
      console.error('Error updating user:', err)
      setSaveError(
        language === 'zh' ? '更新失败，请重试' : 'Failed to update, please try again'
      )
    } finally {
      setSaving(false)
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
          {!isEditing ? (
            <>
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
              <button className="edit-button" onClick={handleEdit}>
                {t.editProfile}
              </button>
            </>
          ) : (
            <div className="edit-form">
              <div className="form-item">
                <label>{t.email}</label>
                <input type="email" value={user?.email || ''} disabled />
                <small>{language === 'zh' ? '邮箱不可修改' : 'Email cannot be changed'}</small>
              </div>
              <div className="form-item">
                <label>{t.name}</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm({ ...editForm, username: e.target.value })
                  }
                  placeholder={t.name}
                />
              </div>
              <div className="form-item">
                <label>{t.currentPassword}</label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) =>
                    setEditForm({ ...editForm, password: e.target.value })
                  }
                  placeholder={
                    language === 'zh'
                      ? '仅在修改密码时需要'
                      : 'Required only when changing password'
                  }
                />
              </div>
              <div className="form-item">
                <label>{t.newPassword}</label>
                <input
                  type="password"
                  value={editForm.newPassword}
                  onChange={(e) =>
                    setEditForm({ ...editForm, newPassword: e.target.value })
                  }
                  placeholder={
                    language === 'zh'
                      ? '留空则不修改密码'
                      : 'Leave empty to keep current password'
                  }
                />
              </div>
              {editForm.newPassword && (
                <div className="form-item">
                  <label>{t.confirmPassword}</label>
                  <input
                    type="password"
                    value={editForm.confirmPassword}
                    onChange={(e) =>
                      setEditForm({ ...editForm, confirmPassword: e.target.value })
                    }
                    placeholder={t.confirmPassword}
                  />
                </div>
              )}
              {saveError && (
                <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
                  {saveError}
                </div>
              )}
              <div className="form-actions">
                <button
                  className="save-button"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving
                    ? language === 'zh'
                      ? '保存中...'
                      : 'Saving...'
                    : t.saveChanges}
                </button>
                <button
                  className="cancel-button"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          )}
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

