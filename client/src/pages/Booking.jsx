import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Booking() {
  const { id: providerId } = useParams()
  const navigate = useNavigate()
  const { user, role } = useAuth()
  const [provider, setProvider] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  // Booking form state
  const [serviceType, setServiceType] = useState('')
  const [description, setDescription] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [urgency, setUrgency] = useState('normal')
  const [budget, setBudget] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => {
    if (!user || role !== 'user') {
      navigate('/login/user')
      return
    }
    fetchProvider()
  }, [providerId, user, role, navigate])

  async function fetchProvider() {
    try {
      setLoading(true)
      const { data } = await api.get(`/providers/${providerId}`)
      setProvider(data)
      setServiceType(data.category || '')
      setContactPhone(user.phone || '')
      setAddress(user.address || '')
    } catch (error) {
      setError('Could not load provider information')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (!serviceType || !description || !preferredDate || !preferredTime || !address) {
      setError('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const bookingData = {
        providerId,
        serviceType,
        description,
        preferredDate,
        preferredTime,
        urgency,
        budget: budget ? Number(budget) : undefined,
        contactPhone,
        address,
        amount: 5000 // Default $50.00, will be updated by provider
      }

      await api.post('/bookings', bookingData)
      
      // Redirect to user's bookings page
      navigate('/bookings', { 
        state: { 
          message: 'Booking submitted successfully! The provider will review and respond within 24 hours.' 
        } 
      })
    } catch (error) {
      console.error('Booking submission error:', error)
      if (error.response?.data?.error) {
        setError(error.response.data.error)
      } else {
        setError('Failed to submit booking. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading provider information...</div>
        </div>
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="dashboard-container">
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
          <h3>Provider not found</h3>
          <p>The service provider you're looking for doesn't exist or has been removed.</p>
          <Link to="/services" className="btn btn-primary">
            Browse Other Services
          </Link>
        </div>
      </div>
    )
  }

  const urgencyOptions = [
    { value: 'low', label: 'Low Priority', icon: '🐌', description: 'Can wait a few days' },
    { value: 'normal', label: 'Normal Priority', icon: '⏰', description: 'Within 1-2 days' },
    { value: 'high', label: 'High Priority', icon: '🚨', description: 'Same day or urgent' }
  ]

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ]

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Book Service</h1>
        <p className="dashboard-subtitle">Schedule your service with {provider.name || 'Service Provider'}</p>
      </div>

      <div className="booking-container">
        {/* Provider Information Card */}
        <div className="provider-info-card">
          <div className="provider-header">
            <div className="provider-icon">
              {provider.category === 'driver' && '🚗'}
              {provider.category === 'cook' && '👨‍🍳'}
              {provider.category === 'plumber' && '🔧'}
              {provider.category === 'electrician' && '⚡'}
              {provider.category === 'cleaner' && '🧹'}
              {!['driver', 'cook', 'plumber', 'electrician', 'cleaner'].includes(provider.category) && '🔧'}
            </div>
            <div className="provider-details">
              <h3>{provider.name || 'Service Provider'}</h3>
              <div className="provider-category">
                {provider.category?.charAt(0).toUpperCase() + provider.category?.slice(1)}
              </div>
              <div className="provider-status">
                {provider.verified ? (
                  <span className="status-verified">✅ Verified Provider</span>
                ) : (
                  <span className="status-pending">⏳ Pending Verification</span>
                )}
                {provider.available ? (
                  <span className="status-available">🟢 Available</span>
                ) : (
                  <span className="status-unavailable">🔴 Unavailable</span>
                )}
              </div>
              {provider.rating && (
                <div className="provider-rating">
                  {'⭐'.repeat(Math.floor(provider.rating))}
                  {provider.rating % 1 !== 0 && '⭐'}
                  <span className="rating-text">({provider.rating.toFixed(1)})</span>
                </div>
              )}
            </div>
          </div>
          
          {provider.description && (
            <p className="provider-description">{provider.description}</p>
          )}
          
          {provider.location?.coordinates && (
            <div className="provider-location">
              📍 Location: {provider.location.coordinates[1].toFixed(4)}, {provider.location.coordinates[0].toFixed(4)}
            </div>
          )}
        </div>

        {/* Booking Form */}
        <div className="booking-form-container">
          <h2>Service Details</h2>
          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="serviceType" className="form-label">Service Type *</label>
                <input
                  id="serviceType"
                  type="text"
                  className="form-input"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  placeholder="e.g., Plumbing repair, Electrical installation"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="urgency" className="form-label">Urgency Level *</label>
                <div className="urgency-options">
                  {urgencyOptions.map(option => (
                    <label key={option.value} className={`urgency-option ${urgency === option.value ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="urgency"
                        value={option.value}
                        checked={urgency === option.value}
                        onChange={(e) => setUrgency(e.target.value)}
                        required
                      />
                      <div className="urgency-content">
                        <span className="urgency-icon">{option.icon}</span>
                        <div>
                          <div className="urgency-label">{option.label}</div>
                          <div className="urgency-description">{option.description}</div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">Service Description *</label>
              <textarea
                id="description"
                className="form-input"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe the service you need in detail..."
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="preferredDate" className="form-label">Preferred Date *</label>
                <input
                  id="preferredDate"
                  type="date"
                  className="form-input"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="preferredTime" className="form-label">Preferred Time *</label>
                <select
                  id="preferredTime"
                  className="form-input"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  required
                >
                  <option value="">Select time</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="budget" className="form-label">Budget (Optional)</label>
                <input
                  id="budget"
                  type="number"
                  className="form-input"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="Your budget in dollars"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="contactPhone" className="form-label">Contact Phone</label>
                <input
                  id="contactPhone"
                  type="tel"
                  className="form-input"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Your phone number"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address" className="form-label">Service Address *</label>
              <textarea
                id="address"
                className="form-input"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Please provide the complete address where the service is needed..."
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button 
                type="submit" 
                className="form-submit"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Booking Request'}
              </button>
              
              <Link to="/services" className="btn btn-outline">
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Booking Tips */}
        <div className="booking-tips">
          <h3>💡 Booking Tips</h3>
          <ul>
            <li>Be specific about the service you need</li>
            <li>Provide accurate contact information</li>
            <li>Choose a convenient time for both parties</li>
            <li>Include any special requirements or preferences</li>
            <li>The provider will review and respond within 24 hours</li>
            <li>You can cancel the booking before it's accepted</li>
          </ul>
        </div>
      </div>
    </div>
  )
}


