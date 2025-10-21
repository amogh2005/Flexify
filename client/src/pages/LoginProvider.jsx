import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './providerLogin.css';

export default function LoginProvider() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const nav = useNavigate()
  const location = useLocation()
  const auth = useAuth()

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
      // Clear the message from location state
      nav(location.pathname, { replace: true })
    }
  }, [location.state, nav, location.pathname])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      const res = await auth.login(email, password)
      const resRole = res?.user?.role || res?.role
      if (resRole !== 'provider') throw new Error('Not a provider')
      nav('/dashboard/provider')
    } catch (e) {
      console.error('Login error:', e)
      if (e.response?.data?.message) {
        setError(e.response.data.message)
      } else if (e.response?.data?.error) {
        setError(e.response.data.error)
      } else {
        setError('Invalid credentials or account type. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="form-container fade-in">
      <h1 className="form-title">Provider Login</h1>
      <p className="text-center mb-4" style={{ color: '#64748b' }}>
        Sign in to your provider account to manage services
      </p>
      
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email Address</label>
          <input
            id="email"
            type="email"
            className="form-input"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <div className="password-input-group">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        
        {successMessage && (
          <div className="success-message" style={{ 
            background: '#f0f9ff', 
            border: '1px solid #0ea5e9', 
            color: '#0369a1', 
            padding: '0.875rem', 
            borderRadius: 'var(--radius-lg)', 
            marginBottom: '1rem', 
            fontWeight: '500' 
          }}>
            {successMessage}
          </div>
        )}
        {error && <div className="error-message">{error}</div>}
        
        <button 
          type="submit" 
          className="form-submit btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'Sign In as Provider'}
        </button>
      </form>
      
      <div className="form-footer">
        <p>Don't have a provider account? <Link to="/register/provider">Sign up here</Link></p>
      </div>
    </div>
  )
}


