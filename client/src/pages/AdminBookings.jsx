import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function AdminBookings() {
  const navigate = useNavigate()
  const { user, role } = useAuth()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState('all') // all, pending, confirmed, completed, cancelled

  useEffect(() => {
    if (!user || role !== 'admin') {
      navigate('/login/admin')
      return
    }
    loadBookings()
  }, [user, role, navigate])

  async function loadBookings() {
    try {
      setLoading(true)
      const response = await api.get('/admin/bookings')
      setBookings(response.data)
    } catch (error) {
      console.error('Failed to load bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const filteredBookings = bookings.filter(booking => {
    return filter === 'all' || booking.status === filter
  })

  const statusColors = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    completed: '#10b981',
    cancelled: '#ef4444',
    in_progress: '#8b5cf6'
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading bookings...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Booking Management</h1>
        <p className="dashboard-subtitle">Monitor all platform bookings and their status</p>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <div className="filter-group">
          <label>Status Filter:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <div className="filter-stats">
          <span>Showing {filteredBookings.length} of {bookings.length} bookings</span>
        </div>
      </div>

      {/* Bookings List */}
      <div className="admin-list">
        {filteredBookings.length === 0 ? (
          <div className="no-data">
            <p>No bookings found matching the current filters</p>
          </div>
        ) : (
          <div className="bookings-grid">
            {filteredBookings.map(booking => (
              <div key={booking._id} className="booking-card">
                <div className="booking-info">
                  <h4>Booking #{booking._id.slice(-8)}</h4>
                  
                  <div className="booking-details">
                    <p><strong>Customer:</strong> {booking.userId?.name || 'Unknown'}</p>
                    <p><strong>Email:</strong> {booking.userId?.email || 'Unknown'}</p>
                    <p><strong>Provider:</strong> {booking.providerId?.userId?.name || 'Unknown'}</p>
                    <p><strong>Service:</strong> {booking.providerId?.category || 'Unknown'}</p>
                    <p><strong>Description:</strong> {booking.description || 'No description'}</p>
                    <p><strong>Location:</strong> {booking.location || 'Not specified'}</p>
                    <p><strong>Amount:</strong> {formatCurrency(booking.amount || 0)}</p>
                    <p><strong>Created:</strong> {formatDate(booking.createdAt)}</p>
                    <p><strong>Scheduled:</strong> {booking.scheduledDate ? formatDate(booking.scheduledDate) : 'Not scheduled'}</p>
                  </div>
                  
                  <div className="booking-status">
                    <p><strong>Status:</strong> 
                      <span 
                        className="status-badge" 
                        style={{ 
                          backgroundColor: statusColors[booking.status] || '#6b7280',
                          color: 'white'
                        }}
                      >
                        {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="booking-actions">
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

      {/* Back Button */}
      <div className="admin-actions">
        <button 
          onClick={() => navigate('/dashboard/admin')}
          className="btn btn-outline"
        >
          ← Back to Admin Dashboard
        </button>
      </div>
    </div>
  )
}
