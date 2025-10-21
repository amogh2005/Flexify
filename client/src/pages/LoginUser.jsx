import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginUser() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const nav = useNavigate()
  const auth = useAuth()

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      await auth.login(email, password)
      nav('/dashboard/user')
    } catch (e) {
      console.error('Login error:', e)
      if (e.response?.data?.message) {
        setError(e.response.data.message)
      } else if (e.response?.data?.error) {
        setError(e.response.data.error)
      } else {
        setError('Invalid email or password. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="form-container fade-in">
      <h1 className="form-title">Welcome Back</h1>
      <p className="text-center mb-4" style={{ color: '#64748b' }}>
        Sign in to your account to continue
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
        
        {error && <div className="error-message">{error}</div>}
        
        <button 
          type="submit" 
          className="form-submit btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
      
      <div className="form-footer">
        <p>Don't have an account? <Link to="/register/user">Sign up here</Link></p>
      </div>
    </div>
  )
}


