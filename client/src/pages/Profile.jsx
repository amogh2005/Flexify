import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import './Profile.css'

export default function Profile() {
  const { user, role } = useAuth()
  const [profile, setProfile] = useState(null)
  const [provider, setProvider] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError('')
      const { data } = await api.get('/auth/profile')
      setProfile(data.user)
      setProvider(data.providerProfile || null)
      
      // Initialize edit form with current data
      setEditForm({
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone || '',
        ...(data.providerProfile ? {
          category: data.providerProfile.category || '',
          description: data.providerProfile.description || '',
          phone: data.providerProfile.phone || '',
          serviceRadius: data.providerProfile.serviceRadius || 10,
          emergencyWork: data.providerProfile.emergencyWork || false,
          emergencyCharge: data.providerProfile.emergencyCharge || 0,
          upiId: data.providerProfile.upiId || '',
          languages: data.providerProfile.languages || ['English'],
          skillLevel: data.providerProfile.skillLevel || 'beginner',
          yearsOfExperience: data.providerProfile.yearsOfExperience || 0
        } : {})
      })
    } catch (e) {
      console.error('Failed to load profile', e)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setSuccessMessage('')
  }

  const handleCancel = () => {
    setIsEditing(false)
    setError('')
    setSuccessMessage('')
    // Reset form to original data
    loadProfile()
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      
      const updateData = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone
      }

      // Add provider-specific fields if user is a provider
      if (role === 'provider' && provider) {
        updateData.category = editForm.category
        updateData.description = editForm.description
        updateData.serviceRadius = editForm.serviceRadius
        updateData.emergencyWork = editForm.emergencyWork
        updateData.emergencyCharge = editForm.emergencyCharge
        updateData.upiId = editForm.upiId
        updateData.languages = editForm.languages
        updateData.skillLevel = editForm.skillLevel
        updateData.yearsOfExperience = editForm.yearsOfExperience
        
        // Include ID document URL if uploaded
        if (editForm.idDocumentUrl) {
          updateData.idDocumentUrl = editForm.idDocumentUrl
        }
      }

      await api.put('/auth/profile', updateData)
      
      setSuccessMessage('Profile updated successfully!')
      setIsEditing(false)
      
      // Reload profile data
      await loadProfile()
      
    } catch (e) {
      console.error('Failed to update profile', e)
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLanguageChange = (language, checked) => {
    setEditForm(prev => ({
      ...prev,
      languages: checked 
        ? [...(prev.languages || []), language]
        : (prev.languages || []).filter(l => l !== language)
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
      setEditForm(prev => ({
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
    setEditForm(prev => ({
      ...prev,
      [field + 'File']: null,
      [field + 'Url']: null
    }))
  }

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error && !isEditing) {
    return (
      <div className="profile-container">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={loadProfile} className="btn btn-primary">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-info">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {profile?.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>
          <div className="profile-details">
            <h1 className="profile-name">{profile?.name}</h1>
            <p className="profile-email">{profile?.email}</p>
            <span className={`role-badge role-${role}`}>
              {role?.charAt(0).toUpperCase() + role?.slice(1)}
            </span>
          </div>
        </div>
        <div className="profile-actions">
          {!isEditing ? (
            <button onClick={handleEdit} className="btn btn-primary">
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="btn btn-success"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                onClick={handleCancel} 
                disabled={saving}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="success-message">
          <span className="success-icon">✓</span>
          {successMessage}
        </div>
      )}

      {error && isEditing && (
        <div className="error-message">
          <span className="error-icon">⚠</span>
          {error}
        </div>
      )}

      <div className="profile-content">
        <div className="profile-section">
          <h2 className="section-title">Basic Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  id="name"
                  value={editForm.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="form-input"
                  placeholder="Enter your full name"
                />
              ) : (
                <div className="form-display">{profile?.name || 'Not provided'}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  id="email"
                  value={editForm.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="form-input"
                  placeholder="Enter your email"
                />
              ) : (
                <div className="form-display">{profile?.email || 'Not provided'}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  id="phone"
                  value={editForm.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="form-input"
                  placeholder="Enter your phone number"
                />
              ) : (
                <div className="form-display">{profile?.phone || provider?.phone || 'Not provided'}</div>
              )}
            </div>
          </div>
        </div>

        {role === 'provider' && provider && (
          <>
            <div className="profile-section">
              <h2 className="section-title">Service Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="category">Service Category</label>
                  {isEditing ? (
                    <select
                      id="category"
                      value={editForm.category || ''}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="form-input"
                    >
                      <option value="">Select category</option>
                      <option value="driver">Driver</option>
                      <option value="cleaner">Cleaner</option>
                      <option value="plumber">Plumber</option>
                      <option value="electrician">Electrician</option>
                      <option value="cook">Cook</option>
                      <option value="gardener">Gardener</option>
                      <option value="mechanic">Mechanic</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <div className="form-display">{provider.category || 'Not specified'}</div>
                  )}
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description">Service Description</label>
                  {isEditing ? (
                    <textarea
                      id="description"
                      value={editForm.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="form-input"
                      rows="3"
                      placeholder="Describe your services"
                    />
                  ) : (
                    <div className="form-display">{provider.description || 'No description provided'}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="skillLevel">Skill Level</label>
                  {isEditing ? (
                    <select
                      id="skillLevel"
                      value={editForm.skillLevel || 'beginner'}
                      onChange={(e) => handleInputChange('skillLevel', e.target.value)}
                      className="form-input"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="expert">Expert</option>
                    </select>
                  ) : (
                    <div className="form-display">
                      <span className={`skill-badge skill-${provider.skillLevel}`}>
                        {provider.skillLevel?.charAt(0).toUpperCase() + provider.skillLevel?.slice(1)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="experience">Years of Experience</label>
                  {isEditing ? (
                    <input
                      type="number"
                      id="experience"
                      value={editForm.yearsOfExperience || 0}
                      onChange={(e) => handleInputChange('yearsOfExperience', parseInt(e.target.value) || 0)}
                      className="form-input"
                      min="0"
                      max="50"
                    />
                  ) : (
                    <div className="form-display">{provider.yearsOfExperience || 0} years</div>
                  )}
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h2 className="section-title">Service Settings</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="serviceRadius">Service Radius (km)</label>
                  {isEditing ? (
                    <input
                      type="range"
                      id="serviceRadius"
                      value={editForm.serviceRadius || 10}
                      onChange={(e) => handleInputChange('serviceRadius', parseInt(e.target.value))}
                      className="form-range"
                      min="1"
                      max="50"
                    />
                  ) : (
                    <div className="form-display">{provider.serviceRadius || 10} km</div>
                  )}
                  {isEditing && (
                    <div className="range-value">{editForm.serviceRadius || 10} km</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={editForm.emergencyWork || false}
                        onChange={(e) => handleInputChange('emergencyWork', e.target.checked)}
                        className="form-checkbox"
                      />
                    ) : (
                      <div className="form-display">
                        <span className={`status-badge ${provider.emergencyWork ? 'available' : 'unavailable'}`}>
                          {provider.emergencyWork ? 'Available' : 'Not Available'}
                        </span>
                      </div>
                    )}
                    <span>Emergency Work Available</span>
                  </label>
                </div>

                {editForm.emergencyWork && isEditing && (
                  <div className="form-group">
                    <label htmlFor="emergencyCharge">Emergency Charge (₹)</label>
                    <input
                      type="number"
                      id="emergencyCharge"
                      value={editForm.emergencyCharge || 0}
                      onChange={(e) => handleInputChange('emergencyCharge', parseInt(e.target.value) || 0)}
                      className="form-input"
                      min="0"
                      placeholder="Additional charge for emergency work"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="profile-section">
              <h2 className="section-title">Languages & Communication</h2>
              <div className="form-group">
                <label>Languages You Speak</label>
                {isEditing ? (
                  <div className="language-checkboxes">
                    {['English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'].map(lang => (
                      <label key={lang} className="language-checkbox">
                        <input
                          type="checkbox"
                          checked={(editForm.languages || []).includes(lang)}
                          onChange={(e) => handleLanguageChange(lang, e.target.checked)}
                          className="form-checkbox"
                        />
                        <span>{lang}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="form-display">
                    <div className="language-tags">
                      {(provider.languages || ['English']).map(lang => (
                        <span key={lang} className="language-tag">{lang}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-section">
              <h2 className="section-title">Payment Information</h2>
              <div className="form-group">
                <label htmlFor="upiId">UPI ID</label>
                {isEditing ? (
                  <input
                    type="text"
                    id="upiId"
                    value={editForm.upiId || ''}
                    onChange={(e) => handleInputChange('upiId', e.target.value)}
                    className="form-input"
                    placeholder="yourname@upi"
                  />
                ) : (
                  <div className="form-display">{provider.upiId || 'Not provided'}</div>
                )}
              </div>
            </div>

            <div className="profile-section">
              <h2 className="section-title">Account Status</h2>
              <div className="status-grid">
                <div className="status-item">
                  <span className="status-label">Verification Status</span>
                  <span className={`status-badge ${provider.verified ? 'verified' : 'pending'}`}>
                    {provider.verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">Membership Tier</span>
                  <span className={`tier-badge tier-${provider.membershipTier || 'basic'}`}>
                    {provider.membershipTier || 'Basic'}
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">ID Proof Status</span>
                  <span className={`status-badge ${provider.idDocumentUrl ? 'verified' : 'pending'}`}>
                    {provider.idDocumentUrl ? 'Uploaded' : 'Not Uploaded'}
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">Background Check</span>
                  <span className={`status-badge ${provider.backgroundCheck ? 'verified' : 'pending'}`}>
                    {provider.backgroundCheck ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h2 className="section-title">ID Proof & Verification</h2>
              <div className="form-group">
                <label htmlFor="idDocument">ID Proof Document</label>
                {isEditing ? (
                  <div className="file-upload-container">
                    <input
                      type="file"
                      id="idDocument"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(e, 'idDocument')}
                      className="file-input"
                    />
                    <label htmlFor="idDocument" className="file-upload-label">
                      <span className="upload-icon">📁</span>
                      <span>Choose ID Proof Document</span>
                      <small>Accepted formats: JPG, PNG, PDF (Max 5MB)</small>
                    </label>
                    {editForm.idDocumentFile && (
                      <div className="file-preview">
                        <span className="file-name">{editForm.idDocumentFile.name}</span>
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
                ) : (
                  <div className="form-display">
                    {provider.idDocumentUrl ? (
                      <div className="document-display">
                        <span className="document-icon">📄</span>
                        <span>ID Proof uploaded</span>
                        <div className="document-debug">
                          <small>URL: {provider.idDocumentUrl}</small>
                        </div>
                        <a 
                          href={provider.idDocumentUrl.startsWith('http') ? provider.idDocumentUrl : `http://localhost:4000${provider.idDocumentUrl}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="view-document-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            const url = provider.idDocumentUrl.startsWith('http') ? provider.idDocumentUrl : `http://localhost:4000${provider.idDocumentUrl}`;
                            console.log('Opening document:', url);
                            console.log('Original URL:', provider.idDocumentUrl);
                            window.open(url, '_blank');
                          }}
                        >
                          View Document
                        </a>
                      </div>
                    ) : (
                      <span className="no-document">No ID proof uploaded</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="verification-info">
                <h4>Verification Process</h4>
                <ul>
                  <li>Upload a clear photo of your government-issued ID (Aadhaar, PAN, Driving License, etc.)</li>
                  <li>Ensure all text is clearly visible and readable</li>
                  <li>Admin will verify your identity within 24-48 hours</li>
                  <li>You'll receive notification once verification is complete</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}


