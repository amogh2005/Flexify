import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function AdminUsers() {
  const navigate = useNavigate()
  const { user, role } = useAuth()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [filter, setFilter] = useState('all') // all, user, provider, admin
  const [blockedFilter, setBlockedFilter] = useState('all') // all, blocked, active

  useEffect(() => {
    if (!user || role !== 'admin') {
      navigate('/login/admin')
      return
    }
    loadUsers()
  }, [user, role, navigate])

  async function loadUsers() {
    try {
      setLoading(true)
      const response = await api.get('/admin/users')
      setUsers(response.data)
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleUserBlock(userId, currentBlockedStatus) {
    try {
      await api.patch(`/admin/users/${userId}`, { blocked: !currentBlockedStatus })
      await loadUsers() // Reload data
      alert(`User ${!currentBlockedStatus ? 'blocked' : 'unblocked'} successfully`)
    } catch (error) {
      console.error('Failed to toggle user block:', error)
      alert('Failed to update user status')
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

  const filteredUsers = users.filter(user => {
    const roleMatch = filter === 'all' || user.role === filter
    const blockedMatch = blockedFilter === 'all' || 
      (blockedFilter === 'blocked' && user.blocked) ||
      (blockedFilter === 'active' && !user.blocked)
    return roleMatch && blockedMatch
  })

  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading users...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">User Management</h1>
        <p className="dashboard-subtitle">Manage all platform users and their accounts</p>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <div className="filter-group">
          <label>Role Filter:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="provider">Providers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Status Filter:</label>
          <select value={blockedFilter} onChange={(e) => setBlockedFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
        
        <div className="filter-stats">
          <span>Showing {filteredUsers.length} of {users.length} users</span>
        </div>
      </div>

      {/* Users List */}
      <div className="admin-list">
        {filteredUsers.length === 0 ? (
          <div className="no-data">
            <p>No users found matching the current filters</p>
          </div>
        ) : (
          <div className="users-grid">
            {filteredUsers.map(user => (
              <div key={user._id} className={`user-card ${user.blocked ? 'blocked' : ''}`}>
                <div className="user-info">
                  <h4>{user.name}</h4>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Role:</strong> 
                    <span className={`role-badge role-${user.role}`}>
                      {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                    </span>
                  </p>
                  <p><strong>Phone:</strong> {user.phone || 'Not provided'}</p>
                  <p><strong>Joined:</strong> {formatDate(user.createdAt)}</p>
                  <p><strong>Status:</strong> 
                    <span className={`status-badge ${user.blocked ? 'blocked' : 'active'}`}>
                      {user.blocked ? 'Blocked' : 'Active'}
                    </span>
                  </p>
                </div>
                
                <div className="user-actions">
                  <button 
                    onClick={() => toggleUserBlock(user._id, user.blocked)}
                    className={`btn ${user.blocked ? 'btn-success' : 'btn-danger'}`}
                  >
                    {user.blocked ? 'Unblock' : 'Block'}
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
