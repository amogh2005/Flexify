import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { api, setAuthToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)

  // Create logout function with useCallback to avoid dependency issues
  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('sf_token')
      if (token) {
        await api.post('/auth/logout')
      }
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      // Always clean up local state
      setAuthToken(null)
      setRole(null)
      setUser(null)
      setIsAuthenticated(false)
      
      // Clear all localStorage items
      localStorage.removeItem('sf_role')
      localStorage.removeItem('sf_user')
      localStorage.removeItem('sf_token')
      localStorage.removeItem('sf_refresh_token')
      
      console.log('Logout complete - state cleared') // Debug log
      
      // Force redirect after state cleanup
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
    }
  }, [])

  useEffect(() => {
    const r = localStorage.getItem('sf_role')
    const u = localStorage.getItem('sf_user')
    const token = localStorage.getItem('sf_token')
    
    if (u && token) {
      try {
        const userData = JSON.parse(u)
        const userRole = r || userData.role // Try stored role first, then user.role
        
        if (userRole && userRole !== 'undefined' && userRole !== 'null') {
          setRole(userRole)
          setUser(userData)
          setIsAuthenticated(true)
          setAuthToken(token)
          setToken(token)
          console.log('Auth state restored:', { role: userRole, user: userData })
        } else {
          console.log('Invalid role found, clearing auth data')
          localStorage.removeItem('sf_role')
          localStorage.removeItem('sf_user')
          localStorage.removeItem('sf_token')
          localStorage.removeItem('sf_refresh_token')
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error)
        localStorage.removeItem('sf_role')
        localStorage.removeItem('sf_user')
        localStorage.removeItem('sf_token')
        localStorage.removeItem('sf_refresh_token')
      }
    }
    setLoading(false)
  }, []) // Remove logout from dependencies to avoid issues

  const value = useMemo(() => ({
    user,
    role,
    isAuthenticated,
    loading,
    async login(email, password) {
      try {
        const { data } = await api.post('/auth/login', { email, password })
        
        // DEBUG: Log the entire response to see the structure
        console.log('Full login response:', data)
        console.log('data.role:', data.role)
        console.log('data.user:', data.user)
        console.log('data.user.role:', data.user?.role)
        
        setAuthToken(data.accessToken || data.token)
        setToken(data.accessToken || data.token)
        
        // Role is likely in data.user.role based on localStorage
        const userRole = data.user?.role || data.role
        console.log('Setting role after login:', userRole)
        setRole(userRole)
        setUser(data.user)
        setIsAuthenticated(true)
        
        console.log('Setting role to:', userRole)
        
        localStorage.setItem('sf_role', userRole)
        localStorage.setItem('sf_user', JSON.stringify(data.user))
        localStorage.setItem('sf_token', data.accessToken || data.token)
        localStorage.setItem('sf_refresh_token', data.refreshToken || '')
        
        return data
      } catch (error) {
        throw error
      }
    },
    async refreshToken() {
      try {
        const refreshToken = localStorage.getItem('sf_refresh_token')
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const { data } = await api.post('/auth/refresh', { refreshToken })
        setAuthToken(data.accessToken)
        localStorage.setItem('sf_token', data.accessToken)
        return data.accessToken
      } catch (error) {
        console.error('Token refresh failed:', error)
        await logout() // Await logout
        throw error
      }
    },
    logout,
    token
  }), [user, role, isAuthenticated, loading, logout])

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}