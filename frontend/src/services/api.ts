const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem('token')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string> || {}),
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const url = `${API_BASE_URL}${endpoint}`
    console.log(`API Request: ${options?.method || 'GET'} ${url}`)
    
    const response = await fetch(url, {
      headers,
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const responseData = await response.json()
    
    // Backend returns { success: true, data: ... } or { success: false, error: ... }
    if (responseData.success) {
      return { success: true, data: responseData.data }
    } else {
      return {
        success: false,
        error: responseData.error || 'Unknown error',
      }
    }
  } catch (error) {
    console.error('API Request Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // 如果是网络错误，提供更友好的提示
    if (errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch') || errorMessage.includes('-102')) {
      return {
        success: false,
        error: '无法连接到服务器，请确保后端服务正在运行 (http://localhost:4000)',
      }
    }
    
    return {
      success: false,
      error: errorMessage,
    }
  }
}

export const api = {
  health: () => request<{ status: string; timestamp: string }>('/health'),

  auth: {
    getCaptcha: () =>
      request<{ captchaId: string; captchaSvg: string }>('/auth/captcha', {
        method: 'GET',
      }),
    register: (data: {
      email: string
      username: string
      password: string
      confirmPassword: string
      captchaId: string
      captchaCode: string
    }) =>
      request<{ token: string; user: { id: string; email: string; username: string } }>(
        '/auth/register',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      ),
    login: (data: {
      email: string
      password: string
      captchaId: string
      captchaCode: string
    }) =>
      request<{ token: string; user: { id: string; email: string; username: string } }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      ),
  },

  cv: {
    preview: (data: unknown) =>
      request('/cv/preview', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    list: () =>
      request<Array<{ id: string; name: string; createdAt: string; updatedAt: string }>>(
        '/cv/list',
        {
          method: 'GET',
        }
      ),
  },

  project: {
    polish: (data: unknown) =>
      request<string>('/project/polish', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  coverLetter: {
    generate: (data: unknown) =>
      request<string>('/cover-letter/generate', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    modify: (data: unknown) =>
      request<string>('/cover-letter/modify', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  user: {
    getMe: () =>
      request<{
        user: { id: string; email: string; username: string; createdAt: string }
        stats: {
          projectsPolished: number
          cvsEdited: number
          coverLettersGenerated: number
          totalTokensUsed: number
        }
      }>('/user/me', {
        method: 'GET',
      }),
    updateMe: (data: {
      username?: string
      password?: string
      newPassword?: string
    }) =>
      request<{
        user: { id: string; email: string; username: string; createdAt: string }
      }>('/user/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },
}

export default api

