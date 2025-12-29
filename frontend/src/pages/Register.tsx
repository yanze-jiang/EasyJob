import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import api from '../services/api'
import './Register.css'

function Register() {
  const { language } = useLanguage()
  const isZh = language === 'zh'
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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

    if (!email || !username || !password || !confirmPassword || !captchaCode) {
      setError(isZh ? '请填写所有必填字段' : 'Please fill in all required fields')
      return
    }

    if (username.length < 2 || username.length > 20) {
      setError(isZh ? '用户名长度应在2-20个字符之间' : 'Username must be between 2 and 20 characters')
      return
    }

    if (password.length < 6) {
      setError(isZh ? '密码长度至少为6个字符' : 'Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError(isZh ? '两次输入的密码不一致' : 'Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await api.auth.register({
        email,
        username,
        password,
        confirmPassword,
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
        setError(response.error || (isZh ? '注册失败' : 'Registration failed'))
        // 注册失败后刷新验证码
        loadCaptcha()
      }
    } catch (err) {
      console.error('Register error:', err)
      setError(isZh ? '注册失败，请重试' : 'Registration failed, please try again')
      loadCaptcha()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isZh ? '注册' : 'Register'}</h2>
        <p className="auth-subtitle">
          {isZh ? '创建你的 EasyJob 账户' : 'Create your EasyJob account'}
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
            <label htmlFor="username">
              {isZh ? '用户名' : 'Username'}
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={isZh ? '请输入用户名（2-20个字符）' : 'Enter username (2-20 characters)'}
              minLength={2}
              maxLength={20}
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
              placeholder={isZh ? '请输入密码（至少6个字符）' : 'Enter password (at least 6 characters)'}
              minLength={6}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              {isZh ? '确认密码' : 'Confirm Password'}
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={isZh ? '请再次输入密码' : 'Confirm your password'}
              minLength={6}
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
              ? (isZh ? '注册中...' : 'Registering...')
              : isZh
              ? '注册'
              : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isZh ? '已有账户？' : 'Already have an account? '}
            <Link to="/login">
              {isZh ? '立即登录' : 'Login now'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
