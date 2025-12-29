import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import api from '../services/api'
import './Login.css'

function Login() {
  const { language } = useLanguage()
  const isZh = language === 'zh'
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [captchaCode, setCaptchaCode] = useState('')
  const [captchaId, setCaptchaId] = useState('')
  const [captchaSvg, setCaptchaSvg] = useState('')
  const [loading, setLoading] = useState(false)
  const [captchaLoading, setCaptchaLoading] = useState(false)
  const [error, setError] = useState('')

  // 加载验证码
  const loadCaptcha = async () => {
    setCaptchaLoading(true)
    setError('')
    
    const response = await api.auth.getCaptcha()
    
    if (response.success && response.data) {
      setCaptchaId(response.data.captchaId)
      setCaptchaSvg(response.data.captchaSvg)
      setCaptchaCode('') // 清空之前的输入
    } else {
      setError(response.error || (isZh ? '加载验证码失败' : 'Failed to load captcha'))
    }
    
    setCaptchaLoading(false)
  }

  // 组件加载时获取验证码
  useEffect(() => {
    loadCaptcha()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password || !captchaCode) {
      setError(isZh ? '请填写所有必填字段' : 'Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const response = await api.auth.login({
        email,
        password,
        captchaId,
        captchaCode,
      })

      if (response.success && response.data) {
        // 存储token和用户信息
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        
        // 跳转到首页
        navigate('/')
      } else {
        setError(response.error || (isZh ? '登录失败' : 'Login failed'))
        // 登录失败后刷新验证码
        loadCaptcha()
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(isZh ? '登录失败，请重试' : 'Login failed, please try again')
      loadCaptcha()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isZh ? '登录' : 'Login'}</h2>
        <p className="auth-subtitle">
          {isZh ? '欢迎回到 EasyJob' : 'Welcome back to EasyJob'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">
              {isZh ? '邮箱' : 'Email'}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isZh ? '请输入邮箱地址' : 'Enter your email'}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              {isZh ? '密码' : 'Password'}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isZh ? '请输入密码' : 'Enter your password'}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="captcha">
              {isZh ? '验证码' : 'Verification Code'}
            </label>
            <div className="captcha-group">
              <input
                id="captcha"
                type="text"
                value={captchaCode}
                onChange={(e) => setCaptchaCode(e.target.value.toUpperCase())}
                placeholder={isZh ? '请输入验证码' : 'Enter verification code'}
                maxLength={4}
                required
                style={{ flex: 1 }}
              />
              <div className="captcha-image-container">
                {captchaLoading ? (
                  <div className="captcha-loading">
                    {isZh ? '加载中...' : 'Loading...'}
                  </div>
                ) : (
                  <div
                    className="captcha-image"
                    dangerouslySetInnerHTML={{ __html: captchaSvg }}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      loadCaptcha()
                    }}
                    title={isZh ? '点击刷新验证码' : 'Click to refresh'}
                  />
                )}
              </div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading
              ? (isZh ? '登录中...' : 'Logging in...')
              : isZh
              ? '登录'
              : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isZh ? '还没有账户？' : "Don't have an account? "}
            <Link to="/register">
              {isZh ? '立即注册' : 'Register now'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
