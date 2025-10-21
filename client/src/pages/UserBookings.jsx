import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function UserBookings() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, role } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [ratingData, setRatingData] = useState({ rating: 5, review: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user || role !== 'user') {
      navigate('/login/user')
      return
    }
    loadBookings()
  }, [user, role, navigate])

  useEffect(() => {
    // Show success message if redirected from booking creation
    if (location.state?.message) {
      alert(location.state.message)
      // Clear the message from state
      navigate(location.pathname, { replace: true })
    }
  }, [location, navigate])

  async function loadBookings() {
    try {
      setLoading(true)
      const { data } = await api.get('/bookings/me')
      setBookings(data)
    } catch (error) {
      console.error('Failed to load bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    try {
      await api.patch(`/bookings/${bookingId}/cancel`)
      await loadBookings() // Reload data
      alert('Booking cancelled successfully')
    } catch (error) {
      console.error('Failed to cancel booking:', error)
      alert('Failed to cancel booking. Please try again.')
    }
  }

  function openRatingModal(booking) {
    setSelectedBooking(booking)
    setRatingData({ rating: 5, review: '' })
    setShowRatingModal(true)
  }

  async function submitRating() {
    if (!selectedBooking || !ratingData.review.trim()) {
      alert('Please provide both a rating and review')
      return
    }

    setSubmitting(true)
    try {
      await api.patch(`/bookings/${selectedBooking._id}/review`, ratingData)
      await loadBookings() // Reload data
      setShowRatingModal(false)
      alert('Thank you for your review!')
    } catch (error) {
      console.error('Failed to submit rating:', error)
      alert('Failed to submit rating. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'pending': return '#f59e0b'
      case 'accepted': return '#10b981'
      case 'in_progress': return '#3b82f6'
      case 'completed': return '#059669'
      case 'cancelled': return '#ef4444'
      case 'rejected': return '#dc2626'
      default: return '#6b7280'
    }
  }

  function getStatusIcon(status) {
    switch (status) {
      case 'pending': return '⏳'
      case 'accepted': return '✅'
      case 'in_progress': return '🔄'
      case 'completed': return '🎉'
      case 'cancelled': return '❌'
      case 'rejected': return '🚫'
      default: return '❓'
    }
  }

  function getStatusText(status) {
    switch (status) {
      case 'pending': return 'Pending Provider Response'
      case 'accepted': return 'Accepted by Provider'
      case 'in_progress': return 'Work in Progress'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled'
      case 'rejected': return 'Rejected by Provider'
      default: return 'Unknown'
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  function formatTime(timeString) {
    return timeString || 'Not specified'
  }

  function getFilteredBookings() {
    if (activeTab === 'all') return bookings
    
    return bookings.filter(booking => {
      switch (activeTab) {
        case 'pending': return booking.status === 'pending'
        case 'active': return ['accepted', 'in_progress'].includes(booking.status)
        case 'completed': return booking.status === 'completed'
        case 'cancelled': return ['cancelled', 'rejected'].includes(booking.status)
        default: return true
      }
    })
  }

  const filteredBookings = getFilteredBookings()
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    active: bookings.filter(b => ['accepted', 'in_progress'].includes(b.status)).length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => ['cancelled', 'rejected'].includes(b.status)).length
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading your bookings...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">My Bookings</h1>
        <p className="dashboard-subtitle">Track and manage your service bookings</p>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Bookings</h3>
          <p className="stat-number">{stats.total}</p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-number warning">{stats.pending}</p>
        </div>
        <div className="stat-card">
          <h3>Active</h3>
          <p className="stat-number info">{stats.active}</p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p className="stat-number success">{stats.completed}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All ({stats.total})
        </button>
        <button 
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending ({stats.pending})
        </button>
        <button 
          className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active ({stats.active})
        </button>
        <button 
          className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed ({stats.completed})
        </button>
        <button 
          className={`tab-button ${activeTab === 'cancelled' ? 'active' : ''}`}
          onClick={() => setActiveTab('cancelled')}
        >
          Cancelled ({stats.cancelled})
        </button>
      </div>

      {/* Bookings List */}
      <div className="bookings-container">
        {filteredBookings.length === 0 ? (
          <div className="no-bookings">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
            <h3>No bookings found</h3>
            <p>
              {activeTab === 'all' && 'You haven\'t made any bookings yet.'}
              {activeTab === 'pending' && 'No pending bookings.'}
              {activeTab === 'active' && 'No active bookings.'}
              {activeTab === 'completed' && 'No completed bookings.'}
              {activeTab === 'cancelled' && 'No cancelled bookings.'}
            </p>
            {activeTab === 'all' && (
              <button 
                onClick={() => navigate('/services')}
                className="btn btn-primary"
              >
                Browse Services
              </button>
            )}
          </div>
        ) : (
          <div className="bookings-list">
            {filteredBookings.map(booking => (
              <div key={booking._id} className={`booking-card ${booking.status}`}>
                <div className="booking-header">
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(booking.status) }}>
                    {getStatusIcon(booking.status)} {getStatusText(booking.status)}
                  </span>
                  <span className="booking-date">{formatDate(booking.createdAt)}</span>
                </div>
                
                <div className="booking-details">
                  <h4>{booking.serviceType}</h4>
                  <p><strong>Provider:</strong> {booking.providerId?.category || 'Unknown'}</p>
                  <p><strong>Date:</strong> {formatDate(booking.preferredDate)} at {formatTime(booking.preferredTime)}</p>
                  <p><strong>Urgency:</strong> {booking.urgency}</p>
                  <p><strong>Address:</strong> {booking.address}</p>
                  <p><strong>Description:</strong> {booking.description}</p>
                  
                  {booking.providerNotes && (
                    <p><strong>Provider Notes:</strong> {booking.providerNotes}</p>
                  )}
                  
                  {booking.estimatedDuration && (
                    <p><strong>Estimated Duration:</strong> {booking.estimatedDuration}</p>
                  )}
                  
                  {booking.finalAmount && (
                    <p><strong>Final Amount:</strong> ${(booking.finalAmount / 100).toFixed(2)}</p>
                  )}
                  
                  {booking.rejectionReason && (
                    <p><strong>Rejection Reason:</strong> {booking.rejectionReason}</p>
                  )}
                  
                  {booking.rating && (
                    <div className="rating-display">
                      <strong>Your Rating:</strong> 
                      {'⭐'.repeat(Math.floor(booking.rating))}
                      {booking.rating % 1 !== 0 && '⭐'}
                      <span className="rating-text">({booking.rating.toFixed(1)})</span>
                    </div>
                  )}
                  
                  {booking.review && (
                    <p><strong>Your Review:</strong> "{booking.review}"</p>
                  )}
                </div>
                
                <div className="booking-actions">
                  {booking.status === 'pending' && (
                    <button 
                      onClick={() => cancelBooking(booking._id)}
                      className="btn btn-danger"
                    >
                      Cancel Booking
                    </button>
                  )}
                  
                  {booking.status === 'completed' && !booking.rating && (
                    <button 
                      onClick={() => openRatingModal(booking)}
                      className="btn btn-primary"
                    >
                      Rate & Review
                    </button>
                  )}
                  
                  <button 
                    onClick={() => navigate(`/booking/${booking._id}`)}
                    className="btn btn-outline"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Rate Your Experience</h3>
              <button 
                onClick={() => setShowRatingModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="rating">Rating *</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className={`star-button ${ratingData.rating >= star ? 'active' : ''}`}
                      onClick={() => setRatingData(prev => ({ ...prev, rating: star }))}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                <p className="rating-text">Selected: {ratingData.rating} star{ratingData.rating !== 1 ? 's' : ''}</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="review">Review *</label>
                <textarea
                  id="review"
                  value={ratingData.review}
                  onChange={(e) => setRatingData(prev => ({ ...prev, review: e.target.value }))}
                  placeholder="Share your experience with this service provider..."
                  rows={4}
                  required
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={() => setShowRatingModal(false)}
                className="btn btn-outline"
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                onClick={submitRating}
                className="btn btn-primary"
                disabled={submitting || !ratingData.review.trim()}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


