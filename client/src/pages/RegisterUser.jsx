import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function RegisterUser() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const nav = useNavigate()
  const auth = useAuth()

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }
    
    setIsLoading(true)
    
    try {
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'user'
      }
      
      await api.post('/auth/register', registrationData)
      await auth.login(formData.email, formData.password)
      nav('/dashboard/user')
    } catch (e) {
      setError('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="form-container fade-in">
      <h1 className="form-title">Create User Account</h1>
      <p className="text-center mb-4" style={{ color: '#64748b' }}>
        Join thousands of satisfied customers
      </p>
      
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="name" className="form-label">Full Name</label>
          <input
            id="name"
            type="text"
            className="form-input"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={e => updateFormData('name', e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email Address</label>
          <input
            id="email"
            type="email"
            className="form-input"
            placeholder="Enter your email"
            value={formData.email}
            onChange={e => updateFormData('email', e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phone" className="form-label">Phone Number</label>
          <input
            id="phone"
            type="tel"
            className="form-input"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={e => updateFormData('phone', e.target.value)}
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
              placeholder="Create a password"
              value={formData.password}
              onChange={e => updateFormData('password', e.target.value)}
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
        
        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
          <div className="password-input-group">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              className="form-input"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={e => updateFormData('confirmPassword', e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button 
          type="submit" 
          className="form-submit btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      
      <div className="form-footer">
        <p>Already have an account? <Link to="/login/user">Sign in here</Link></p>
        <p>Want to provide services? <Link to="/register/provider">Register as Provider</Link></p>
      </div>
    </div>
  )
}