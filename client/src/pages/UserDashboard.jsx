import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function UserDashboard() {
  const navigate = useNavigate()
  const { user, role } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    completed: 0,
    cancelled: 0
  })

  useEffect(() => {
    if (!user || role !== 'user') {
      navigate('/login/user')
      return
    }
    loadUserData()
  }, [user, role, navigate])

  async function loadUserData() {
    try {
      setLoading(true)
      const { data } = await api.get('/bookings/me?limit=10')
      setBookings(data)
      
      // Calculate stats
      const stats = {
        total: data.length,
        pending: data.filter(b => b.status === 'pending').length,
        active: data.filter(b => ['accepted', 'in_progress'].includes(b.status)).length,
        completed: data.filter(b => b.status === 'completed').length,
        cancelled: data.filter(b => ['cancelled', 'rejected'].includes(b.status)).length
      }
      setStats(stats)
    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      setLoading(false)
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

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading your dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome back, {user?.name || 'User'}!</h1>
        <p className="dashboard-subtitle">Manage your service bookings and explore new opportunities</p>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button 
          onClick={() => navigate('/services')}
          className="btn btn-primary"
        >
          🛠️ Book a Service
        </button>
        <button 
          onClick={() => navigate('/bookings')}
          className="btn btn-outline"
        >
          📋 View All Bookings
        </button>
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

      {/* Recent Bookings */}
      <div className="recent-section">
        <h2>Recent Bookings</h2>
        {bookings.length === 0 ? (
          <div className="no-bookings">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
            <h3>No bookings yet</h3>
            <p>Start by booking your first service!</p>
            <button 
              onClick={() => navigate('/services')}
              className="btn btn-primary"
            >
              Browse Services
            </button>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.slice(0, 5).map(booking => (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(booking.status) }}>
                    {getStatusIcon(booking.status)} {booking.status.replace('_', ' ')}
                  </span>
                  <span className="booking-date">{formatDate(booking.createdAt)}</span>
                </div>
                <div className="booking-details">
                  <h4>{booking.serviceType}</h4>
                  <p><strong>Provider:</strong> {booking.providerId?.category || 'Unknown'}</p>
                  <p><strong>Date:</strong> {formatDate(booking.preferredDate)}</p>
                  <p><strong>Address:</strong> {booking.address}</p>
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
        
        {bookings.length > 5 && (
          <div className="view-all">
            <button 
              onClick={() => navigate('/bookings')}
              className="btn btn-outline"
            >
              View All Bookings
            </button>
          </div>
        )}
      </div>

      {/* Service Categories */}
      <div className="service-categories-section">
        <h2>Popular Services</h2>
        <div className="service-categories">
          <div className="service-category" onClick={() => navigate('/services')}>
            <div className="service-icon">🧹</div>
            <span>Housekeeping</span>
          </div>
          <div className="service-category" onClick={() => navigate('/services')}>
            <div className="service-icon">🔧</div>
            <span>Plumbing</span>
          </div>
          <div className="service-category" onClick={() => navigate('/services')}>
            <div className="service-icon">⚡</div>
            <span>Electrical</span>
          </div>
          <div className="service-category" onClick={() => navigate('/services')}>
            <div className="service-icon">👨‍🍳</div>
            <span>Cooking</span>
          </div>
          <div className="service-category" onClick={() => navigate('/services')}>
            <div className="service-icon">🚗</div>
            <span>Transportation</span>
          </div>
          <div className="service-category" onClick={() => navigate('/services')}>
            <div className="service-icon">🧽</div>
            <span>Cleaning</span>
          </div>
        </div>
      </div>
    </div>
  )
}
