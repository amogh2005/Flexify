import { useEffect, useState } from 'react'
import { api } from '../api/client'
import './ProviderBookings.css'

export default function ProviderBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.get('/bookings/provider/me')
      .then(r => setBookings(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true
    return booking.status === filter
  })

  const getStatusBadge = (status) => {
    const statusClasses = {
      'pending': 'status-pending',
      'confirmed': 'status-confirmed',
      'in-progress': 'status-in-progress',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled'
    }
    return `status-badge ${statusClasses[status] || 'status-pending'}`
  }

  const handleAcceptBooking = async (bookingId) => {
    try {
      // Update booking status to confirmed
      await api.put(`/bookings/${bookingId}/status`, { status: 'confirmed' })
      
      // Reload bookings
      const response = await api.get('/bookings/provider/me')
      setBookings(response.data)
      
      alert('Booking accepted successfully!')
    } catch (error) {
      console.error('Error accepting booking:', error)
      alert('Failed to accept booking. Please try again.')
    }
  }

  const handleStartJob = async (bookingId) => {
    try {
      // Update booking status to in-progress
      await api.put(`/bookings/${bookingId}/status`, { status: 'in-progress' })
      
      // Reload bookings
      const response = await api.get('/bookings/provider/me')
      setBookings(response.data)
      
      alert('Job started successfully!')
    } catch (error) {
      console.error('Error starting job:', error)
      alert('Failed to start job. Please try again.')
    }
  }

  const handleCompleteJob = async (bookingId, amount) => {
    try {
      // Process payment
      await api.post('/payments/process-payment', {
        bookingId,
        bookingAmount: amount,
        workCompleted: true
      })
      
      // Update booking status to completed
      await api.put(`/bookings/${bookingId}/status`, { status: 'completed' })
      
      // Reload bookings
      const response = await api.get('/bookings/provider/me')
      setBookings(response.data)
      
      alert('Job completed and payment processed successfully!')
    } catch (error) {
      console.error('Error completing job:', error)
      alert('Failed to complete job. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="provider-bookings-container">
        <div className="loading">Loading bookings...</div>
      </div>
    )
  }

  return (
    <div className="provider-bookings-container">
      <div className="bookings-header">
        <h1>My Bookings</h1>
        <p>Manage your service bookings and track your earnings</p>
      </div>

      <div className="bookings-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({bookings.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({bookings.filter(b => b.status === 'pending').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
          onClick={() => setFilter('confirmed')}
        >
          Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({bookings.filter(b => b.status === 'completed').length})
        </button>
      </div>

      <div className="bookings-grid">
        {filteredBookings.length === 0 ? (
          <div className="no-bookings">
            <div className="no-bookings-icon">📋</div>
            <h3>No bookings found</h3>
            <p>You don't have any bookings for the selected filter.</p>
          </div>
        ) : (
          filteredBookings.map(booking => (
            <div key={booking._id} className="booking-card">
              <div className="booking-header">
                <div className="booking-id">#{booking._id.slice(-8)}</div>
                <div className={getStatusBadge(booking.status)}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </div>
              </div>
              
              <div className="booking-details">
                <div className="detail-row">
                  <span className="label">Service:</span>
                  <span className="value">{booking.serviceCategory || 'General Service'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Customer:</span>
                  <span className="value">{booking.user?.name || 'Unknown'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Date:</span>
                  <span className="value">{new Date(booking.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Time:</span>
                  <span className="value">{new Date(booking.createdAt).toLocaleTimeString()}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Location:</span>
                  <span className="value">{booking.location || 'Not specified'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Description:</span>
                  <span className="value">{booking.description || 'No description provided'}</span>
                </div>
              </div>

              <div className="booking-footer">
                <div className="booking-amount">
                  <span className="amount">${booking.amount || '0'}</span>
                  <span className="currency">{booking.currency || 'USD'}</span>
                </div>
                <div className="booking-actions">
                  {booking.status === 'pending' && (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAcceptBooking(booking._id)}
                    >
                      Accept
                    </button>
                  )}
                  {booking.status === 'confirmed' && (
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => handleStartJob(booking._id)}
                    >
                      Start Job
                    </button>
                  )}
                  {booking.status === 'in-progress' && (
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => handleCompleteJob(booking._id, booking.amount)}
                    >
                      Complete & Process Payment
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}


