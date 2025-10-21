import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user, role } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProviders: 0,
    totalBookings: 0,
    pendingProviders: 0
  })
  const [pendingProviders, setPendingProviders] = useState([])

  useEffect(() => {
    if (!user || role !== 'admin') {
      navigate('/login/admin')
      return
    }
    loadAdminData()
  }, [user, role, navigate])

  async function loadAdminData() {
    try {
      setLoading(true)
      
      // Load stats and pending providers in parallel
      const [usersRes, providersRes, bookingsRes, pendingRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/providers'),
        api.get('/admin/bookings'),
        api.get('/admin/providers/pending')
      ])

      setStats({
        totalUsers: usersRes.data.length,
        totalProviders: providersRes.data.length,
        totalBookings: bookingsRes.data.length,
        pendingProviders: pendingRes.data.length
      })
      
      setPendingProviders(pendingRes.data)
    } catch (error) {
      console.error('Failed to load admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function verifyProvider(providerId) {
    try {
      await api.post(`/admin/providers/${providerId}/verify`)
      await loadAdminData() // Reload data
      alert('Provider verified successfully')
    } catch (error) {
      console.error('Failed to verify provider:', error)
      alert('Failed to verify provider')
    }
  }

  async function rejectProvider(providerId) {
    const reason = prompt('Please provide a reason for rejection:')
    if (!reason) return

    try {
      await api.post(`/admin/providers/${providerId}/reject`, { reason })
      await loadAdminData() // Reload data
      alert('Provider rejected successfully')
    } catch (error) {
      console.error('Failed to reject provider:', error)
      alert('Failed to reject provider')
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
          <div>Loading admin dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <p className="dashboard-subtitle">Manage users, providers, and platform operations</p>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Providers</h3>
          <p className="stat-number">{stats.totalProviders}</p>
        </div>
        <div className="stat-card">
          <h3>Total Bookings</h3>
          <p className="stat-number">{stats.totalBookings}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Verifications</h3>
          <p className="stat-number warning">{stats.pendingProviders}</p>
        </div>
      </div>

      {/* Pending Provider Verifications */}
      <div className="pending-section">
        <h2>Pending Provider Verifications</h2>
        {pendingProviders.length === 0 ? (
          <div className="no-pending">
            <p>No pending provider verifications</p>
          </div>
        ) : (
          <div className="providers-list">
            {pendingProviders.map(provider => (
              <div key={provider._id} className="provider-card">
                <div className="provider-info">
                  <h4>{provider.userId?.name || 'Unknown'}</h4>
                  <p><strong>Email:</strong> {provider.userId?.email || 'Unknown'}</p>
                  <p><strong>Category:</strong> {provider.category}</p>
                  <p><strong>Phone:</strong> {provider.phone || 'Not provided'}</p>
                  <p><strong>Description:</strong> {provider.description || 'No description'}</p>
                  <p><strong>Applied:</strong> {formatDate(provider.createdAt)}</p>
                  
                  {/* ID Document Section */}
                  <div className="id-document-section">
                    <p><strong>ID Proof Status:</strong> 
                      <span className={`status-badge ${provider.idDocumentUrl ? 'uploaded' : 'missing'}`}>
                        {provider.idDocumentUrl ? 'Uploaded' : 'Not Uploaded'}
                      </span>
                    </p>
                    {provider.idDocumentUrl && (
                      <div className="document-actions">
                        <a 
                          href={`http://localhost:4000${provider.idDocumentUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline btn-sm"
                        >
                          📄 View ID Document
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="provider-actions">
                  <button 
                    onClick={() => verifyProvider(provider._id)}
                    className="btn btn-success"
                  >
                    Verify
                  </button>
                  <button 
                    onClick={() => rejectProvider(provider._id)}
                    className="btn btn-danger"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button 
          onClick={() => navigate('/admin/users')}
          className="btn btn-outline"
        >
          👥 Manage Users
        </button>
        <button 
          onClick={() => navigate('/admin/providers')}
          className="btn btn-outline"
        >
          🛠️ Manage Providers
        </button>
        <button 
          onClick={() => navigate('/admin/bookings')}
          className="btn btn-outline"
        >
          📋 View Bookings
        </button>
      </div>
    </div>
  )
}