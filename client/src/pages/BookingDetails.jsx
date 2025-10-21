import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function BookingDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { role } = useAuth()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const { data } = await api.get(`/bookings/${id}`)
        setBooking(data)
      } catch (e) {
        console.error('Failed to load booking', e)
        setError('Failed to load booking details')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="dashboard-container" style={{ textAlign: 'center', padding: '3rem' }}>Loading booking…</div>
    )
  }

  if (error || !booking) {
    return (
      <div className="dashboard-container" style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
        <div>{error || 'Booking not found'}</div>
        <div style={{ marginTop: '1rem' }}>
          <Link to={role === 'provider' ? '/dashboard/provider' : '/dashboard/user'} className="btn btn-outline">Go Back</Link>
        </div>
      </div>
    )
  }

  const statusColor = (s) => ({
    pending: '#f59e0b',
    accepted: '#10b981',
    in_progress: '#3b82f6',
    completed: '#059669',
    cancelled: '#ef4444',
    rejected: '#dc2626'
  })[s] || '#6b7280'

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Booking Details</h1>
        <p className="dashboard-subtitle">ID: {booking._id}</p>
      </div>

      <div className="booking-card" style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
        <div style={{ marginBottom: 12 }}>
          <span className="status-badge" style={{ backgroundColor: statusColor(booking.status), padding: '4px 8px', borderRadius: 6, color: '#fff' }}>
            {booking.status.replace('_',' ')}
          </span>
        </div>
        <div><strong>Service:</strong> {booking.serviceType || booking.serviceCategory}</div>
        <div><strong>Date:</strong> {new Date(booking.preferredDate).toLocaleString()}</div>
        <div><strong>Address:</strong> {booking.address}</div>
        {booking.description && <div><strong>Description:</strong> {booking.description}</div>}
        {role === 'user' && (
          <div style={{ marginTop: 8 }}>
            <strong>Provider:</strong> {booking.providerId?.category} {booking.providerId?.description ? `- ${booking.providerId.description}` : ''}
          </div>
        )}
        {role === 'provider' && (
          <div style={{ marginTop: 8 }}>
            <strong>Customer:</strong> {booking.userId?.name} ({booking.userId?.email})
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>Back</button>
      </div>
    </div>
  )
}


