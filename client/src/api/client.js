import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api/v1'

export const api = axios.create({
  baseURL: API_BASE,
})

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    localStorage.setItem('sf_token', token)
  } else {
    delete api.defaults.headers.common['Authorization']
    localStorage.removeItem('sf_token')
  }
}

// Initialize from storage
const existing = localStorage.getItem('sf_token')
if (existing) setAuthToken(existing)

// Add response interceptor for automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('sf_refresh_token')
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        // Call refresh endpoint
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken })
        
        // Update token in storage and headers
        setAuthToken(data.accessToken)
        
        // Retry original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('sf_token')
        localStorage.removeItem('sf_refresh_token')
        localStorage.removeItem('sf_user')
        localStorage.removeItem('sf_role')
        
        // Redirect to login page
        if (window.location.pathname !== '/login/user' && 
            window.location.pathname !== '/login/provider' && 
            window.location.pathname !== '/login/admin') {
          window.location.href = '/login/user'
        }
        
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)


