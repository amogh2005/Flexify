import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginAdmin() {
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
      const res = await auth.login(email, password)
      if (res.user?.role !== 'admin') throw new Error('Not an admin')
      nav('/dashboard/admin')
    } catch (e) {
      setError('Invalid credentials or insufficient permissions. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="form-container fade-in">
      <h1 className="form-title">Admin Login</h1>
      <p className="text-center mb-4" style={{ color: '#64748b' }}>
        Sign in to your admin account to manage the platform
      </p>
      
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email Address</label>
          <input
            id="email"
            type="email"
            className="form-input"
            placeholder="Enter your admin email"
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
          {isLoading ? 'Signing In...' : 'Sign In as Admin'}
        </button>
      </form>
      
      <div className="form-footer">
        <p>Not an admin? <Link to="/login/user">Sign in as User</Link> or <Link to="/login/provider">Sign in as Provider</Link></p>
      </div>
    </div>
  )
}