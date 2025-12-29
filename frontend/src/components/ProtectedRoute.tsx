import { ReactNode, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'

interface ProtectedRouteProps {
  children: ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const { language } = useLanguage()
  const isZh = language === 'zh'

  useEffect(() => {
    // 检查是否有token
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
  }, [])

  // 正在检查认证状态
  if (isAuthenticated === null) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div>{isZh ? '正在验证身份...' : 'Verifying authentication...'}</div>
      </div>
    )
  }

  // 未认证，重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // 已认证，渲染子组件
  return <>{children}</>
}

export default ProtectedRoute

