import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import './WorkerRegistration.css'

export default function RegisterProvider() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    category: '',
    description: '',
    languages: ['English'],
    backgroundCheck: false,
    skillTestCompleted: false,
    serviceRadius: 10,
    emergencyWork: false,
    emergencyCharge: 0,
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      accountHolderName: ''
    },
    upiId: '',
    referralCode: '',
    membershipTier: 'basic',
    insuranceOpted: false,
    idDocumentFile: null,
    idDocumentUrl: ''
  })
  
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const nav = useNavigate()
  const auth = useAuth()

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateNestedFormData = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }))
  }

  const handleFileUpload = async (event, field) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG, and PDF files are allowed')
      return
    }

    try {
      setError('')
      
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'idDocument')

      // Upload file to server
      const response = await api.post('/uploads/document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Update form with file info
      setFormData(prev => ({
        ...prev,
        [field + 'File']: file,
        [field + 'Url']: response.data.url
      }))

    } catch (error) {
      console.error('File upload error:', error)
      setError('Failed to upload file. Please try again.')
    }
  }

  const handleRemoveFile = (field) => {
    setFormData(prev => ({
      ...prev,
      [field + 'File']: null,
      [field + 'Url']: null
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (isLoading) {
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'provider',
        phone: formData.phone,
        category: formData.category,
        description: formData.description,
        languages: formData.languages,
        backgroundCheck: formData.backgroundCheck,
        skillTestCompleted: formData.skillTestCompleted,
        serviceRadius: formData.serviceRadius,
        emergencyWork: formData.emergencyWork,
        emergencyCharge: formData.emergencyCharge,
        bankDetails: formData.bankDetails,
        upiId: formData.upiId,
        referralCode: formData.referralCode,
        membershipTier: formData.membershipTier,
        insuranceOpted: formData.insuranceOpted,
        idDocumentUrl: formData.idDocumentUrl
      }
      
      console.log('Registering provider with data:', registrationData)
      
      const response = await api.post('/auth/register', registrationData)
      console.log('Registration response:', response.data)
      
      if (!response.data) {
        throw new Error('No response data received')
      }
      
      // Auto-login after successful registration
      console.log('Registration successful! Auto-login in progress...')
      
      try {
        const loginResult = await auth.login(formData.email, formData.password)
        console.log('Auto-login successful:', loginResult)
        
        // Give a moment for auth context to update, then navigate to dashboard
        setTimeout(() => {
          console.log('Navigating to provider dashboard...')
          nav('/dashboard/provider')
        }, 1000)
        
      } catch (loginError) {
        console.error('Auto-login failed:', loginError)
        // If auto-login fails, redirect to login page
        nav('/login/provider', { 
          state: { message: 'Registration successful! Please login with your credentials.' } 
        })
      }
    } catch (e) {
      console.error('Registration error:', e)
      if (e.response?.data?.message) {
        setError(e.response.data.message)
      } else if (e.response?.data?.error) {
        setError(e.response.data.error)
      } else {
        setError(`Registration failed: ${e.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="worker-registration-container">
      <div className="registration-header">
        <h1>Worker Registration Portal</h1>
        <p>Join thousands of trusted service providers and start earning today</p>
      </div>
      
      <div className="registration-form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Basic Information</h2>
            
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
              <label htmlFor="category" className="form-label">Service Category</label>
              <select
                id="category"
                className="form-input"
                value={formData.category}
                onChange={e => updateFormData('category', e.target.value)}
                required
              >
                <option value="">Select your service category</option>
                <option value="driver">Driver</option>
                <option value="cook">Cook</option>
                <option value="plumber">Plumber</option>
                <option value="electrician">Electrician</option>
                <option value="cleaner">Cleaner</option>
                <option value="maid">Maid</option>
                <option value="gardener">Gardener</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="description" className="form-label">Service Description</label>
              <textarea
                id="description"
                className="form-input"
                rows={4}
                placeholder="Describe your services, experience, and expertise"
                value={formData.description}
                onChange={e => updateFormData('description', e.target.value)}
              />
            </div>
            
            <div className="form-row">
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
                    {showPassword ? '👁️‍🗨️' : '👁️'}
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
                    {showConfirmPassword ? '👁️‍🗨️' : '👁️'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>ID Proof & Verification</h2>
            
            <div className="form-group">
              <label htmlFor="idDocument" className="form-label">ID Proof Document *</label>
              <div className="file-upload-container">
                <input
                  type="file"
                  id="idDocument"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, 'idDocument')}
                  className="file-input"
                  required
                />
                <label htmlFor="idDocument" className="file-upload-label">
                  <span className="upload-icon">📁</span>
                  <span>Choose ID Proof Document</span>
                  <small>Accepted formats: JPG, PNG, PDF (Max 5MB)</small>
                </label>
                {formData.idDocumentFile && (
                  <div className="file-preview">
                    <span className="file-name">{formData.idDocumentFile.name}</span>
                    <button 
                      type="button"
                      onClick={() => handleRemoveFile('idDocument')}
                      className="remove-file-btn"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
              <p className="form-help">
                Upload a clear photo of your government-issued ID (Aadhaar, PAN, Driving License, etc.)
              </p>
            </div>

            <div className="verification-info">
              <h4>Verification Process</h4>
              <ul>
                <li>Admin will verify your identity within 24-48 hours</li>
                <li>Ensure all text is clearly visible and readable</li>
                <li>You'll receive notification once verification is complete</li>
                <li>Account will be activated after successful verification</li>
              </ul>
            </div>
          </div>
          
          <div className="form-section">
            <h2>Additional Information</h2>
            
            <div className="form-group">
              <label className="form-label">Languages</label>
              <div className="checkbox-group">
                {['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Gujarati'].map(lang => (
                  <label key={lang} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={formData.languages.includes(lang)}
                      onChange={e => {
                        if (e.target.checked) {
                          updateFormData('languages', [...formData.languages, lang])
                        } else {
                          updateFormData('languages', formData.languages.filter(l => l !== lang))
                        }
                      }}
                    />
                    <span>{lang}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={formData.backgroundCheck}
                  onChange={e => updateFormData('backgroundCheck', e.target.checked)}
                />
                <span>I agree to background verification</span>
              </label>
            </div>
            
            <div className="form-group">
              <label htmlFor="serviceRadius" className="form-label">Service Radius (km)</label>
              <input
                id="serviceRadius"
                type="range"
                min="1"
                max="50"
                value={formData.serviceRadius}
                onChange={e => updateFormData('serviceRadius', parseInt(e.target.value))}
                className="radius-slider"
              />
              <span>{formData.serviceRadius} km</span>
            </div>
            
            <div className="form-group">
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={formData.emergencyWork}
                  onChange={e => updateFormData('emergencyWork', e.target.checked)}
                />
                <span>Available for emergency work</span>
              </label>
            </div>
            
            {formData.emergencyWork && (
              <div className="form-group">
                <label htmlFor="emergencyCharge" className="form-label">Emergency Charge</label>
                <input
                  id="emergencyCharge"
                  type="number"
                  className="form-input"
                  placeholder="Additional charge for emergency work"
                  value={formData.emergencyCharge}
                  onChange={e => updateFormData('emergencyCharge', parseInt(e.target.value))}
                />
              </div>
            )}
          </div>
          
          <div className="form-section">
            <h2>Financial Information</h2>
            
            <div className="form-group">
              <label className="form-label">Account Holder Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Account holder name"
                value={formData.bankDetails.accountHolderName}
                onChange={e => updateNestedFormData('bankDetails', 'accountHolderName', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Account Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="Bank account number"
                value={formData.bankDetails.accountNumber}
                onChange={e => updateNestedFormData('bankDetails', 'accountNumber', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">IFSC Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="Bank IFSC code"
                value={formData.bankDetails.ifscCode}
                onChange={e => updateNestedFormData('bankDetails', 'ifscCode', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">UPI ID</label>
              <input
                type="text"
                className="form-input"
                placeholder="Your UPI ID for instant payments"
                value={formData.upiId}
                onChange={e => updateFormData('upiId', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="referralCode" className="form-label">Referral Code (Optional)</label>
              <input
                id="referralCode"
                type="text"
                className="form-input"
                placeholder="Referral code (optional)"
                value={formData.referralCode}
                onChange={e => updateFormData('referralCode', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={formData.insuranceOpted}
                  onChange={e => updateFormData('insuranceOpted', e.target.checked)}
                />
                <span>I want worker insurance coverage</span>
              </label>
            </div>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-navigation">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Worker Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}