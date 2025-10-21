import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function AdminProviders() {
  const navigate = useNavigate()
  const { user, role } = useAuth()
  const [loading, setLoading] = useState(true)
  const [providers, setProviders] = useState([])
  const [filter, setFilter] = useState('all') // all, verified, pending, rejected
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    if (!user || role !== 'admin') {
      navigate('/login/admin')
      return
    }
    loadProviders()
  }, [user, role, navigate])

  async function loadProviders() {
    try {
      setLoading(true)
      const response = await api.get('/admin/providers')
      setProviders(response.data)
    } catch (error) {
      console.error('Failed to load providers:', error)
    } finally {
      setLoading(false)
    }
  }

  async function verifyProvider(providerId) {
    try {
      await api.post(`/admin/providers/${providerId}/verify`)
      await loadProviders() // Reload data
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
      await loadProviders() // Reload data
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredProviders = providers.filter(provider => {
    const verificationMatch = filter === 'all' || 
      (filter === 'verified' && provider.verified) ||
      (filter === 'pending' && !provider.verified && !provider.rejectionReason) ||
      (filter === 'rejected' && provider.rejectionReason)
    
    const categoryMatch = categoryFilter === 'all' || provider.category === categoryFilter
    
    return verificationMatch && categoryMatch
  })

  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading providers...</div>
        </div>
      </div>
      )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Provider Management</h1>
        <p className="dashboard-subtitle">Manage all service providers and their verification status</p>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <div className="filter-group">
          <label>Verification Status:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Category:</label>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">All Categories</option>
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
        
        <div className="filter-stats">
          <span>Showing {filteredProviders.length} of {providers.length} providers</span>
        </div>
      </div>

      {/* Providers List */}
      <div className="admin-list">
        {filteredProviders.length === 0 ? (
          <div className="no-data">
            <p>No providers found matching the current filters</p>
          </div>
        ) : (
          <div className="providers-grid">
            {filteredProviders.map(provider => (
              <div key={provider._id} className={`provider-card ${provider.verified ? 'verified' : provider.rejectionReason ? 'rejected' : 'pending'}`}>
                <div className="provider-info">
                  <h4>{provider.userId?.name || 'Unknown'}</h4>
                  <p><strong>Email:</strong> {provider.userId?.email || 'Unknown'}</p>
                  <p><strong>Category:</strong> 
                    <span className="category-badge">{provider.category}</span>
                  </p>
                  <p><strong>Phone:</strong> {provider.phone || 'Not provided'}</p>
                  <p><strong>Description:</strong> {provider.description || 'No description'}</p>
                  <p><strong>Joined:</strong> {formatDate(provider.createdAt)}</p>
                  
                  {/* Verification Status */}
                  <p><strong>Status:</strong> 
                    <span className={`status-badge ${provider.verified ? 'verified' : provider.rejectionReason ? 'rejected' : 'pending'}`}>
                      {provider.verified ? 'Verified' : provider.rejectionReason ? 'Rejected' : 'Pending'}
                    </span>
                  </p>
                  
                  {/* ID Document Section */}
                  <div className="id-document-section">
                    <p><strong>ID Proof:</strong> 
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
                  
                  {provider.rejectionReason && (
                    <div className="rejection-reason">
                      <p><strong>Rejection Reason:</strong> {provider.rejectionReason}</p>
                    </div>
                  )}
                </div>
                
                <div className="provider-actions">
                  {!provider.verified && !provider.rejectionReason && (
                    <>
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
                    </>
                  )}
                  {provider.rejectionReason && (
                    <button 
                      onClick={() => verifyProvider(provider._id)}
                      className="btn btn-success"
                    >
                      Re-verify
                    </button>
                  )}
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
