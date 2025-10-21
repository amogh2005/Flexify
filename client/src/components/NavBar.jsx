import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'
import './NavBar.css'

export default function NavBar() {
  const { user, role, logout, loading } = useAuth()

  // Simple logout handler - AuthContext handles everything
  function handleLogout() {
    console.log('Logout clicked') // Debug log
    logout() // AuthContext will handle redirect
  }

  console.log('NavBar render:', { user: user?.name, role, loading })

  if (loading) {
    return (
      <header className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">Flexify</Link>
          <nav className="navbar-nav">
            <div>Loading...</div>
          </nav>
        </div>
      </header>
    )
  }

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="navbar-logo">Flexify</Link>
        </div>

        <nav className="navbar-nav">
          {!role ? (
            <>
              <Link to="/services" className="nav-link book-now-link">🚀 Book Now</Link>
              <div className="nav-dropdown">
                <span className="nav-link dropdown-toggle">
                  🔍 Find Services ▼
                </span>
                <div className="dropdown-menu">
                  <Link to="/services" className="dropdown-item">Browse All Services</Link>
                  <Link to="/services/driver" className="dropdown-item">Drivers</Link>
                  <Link to="/services/cook" className="dropdown-item">Cooks</Link>
                  <Link to="/services/plumber" className="dropdown-item">Plumbers</Link>
                  <Link to="/services/electrician" className="dropdown-item">Electricians</Link>
                  <Link to="/services/cleaner" className="dropdown-item">Cleaners</Link>
                </div>
              </div>
              
              <div className="nav-dropdown dropdown-client">
                <span className="nav-link dropdown-toggle">User ▼</span>
                <div className="dropdown-menu">
                  <Link to="/register/user" className="dropdown-item">New Customer<span> Sign Up</span></Link>
                  <Link to="/login/user" className="dropdown-item">Account Exists<span> Log In</span></Link>
                </div>
              </div>
              <div className="nav-dropdown dropdown-client">
                <span className="nav-link dropdown-toggle">Provider ▼</span>
                <div className="dropdown-menu">
                  <Link to="/register/provider" className="dropdown-item">New Customer<span> Sign Up</span></Link>
                  <Link to="/login/provider" className="dropdown-item">Account Exists<span> Log In</span></Link>
                </div>
              </div>
            </>
          ) : (
            <>
              {role === 'user' && (
                <>
                  <Link to="/services" className="nav-link book-now-link">🚀 Book Now</Link>
                  <div className="nav-dropdown">
                    <span className="nav-link dropdown-toggle">🔍 Find Services ▼</span>
                    <div className="dropdown-menu">
                      <Link to="/services" className="dropdown-item">Browse All Services</Link>
                      <Link to="/services/driver" className="dropdown-item">Drivers</Link>
                      <Link to="/services/cook" className="dropdown-item">Cooks</Link>
                      <Link to="/services/plumber" className="dropdown-item">Plumbers</Link>
                      <Link to="/services/electrician" className="dropdown-item">Electricians</Link>
                      <Link to="/services/cleaner" className="dropdown-item">Cleaners</Link>
                    </div>
                  </div>
                  
                  <Link to="/bookings" className="nav-link">📋 My Bookings</Link>
                  <div className="nav-dropdown">
                    <span className="nav-link dropdown-toggle">{user?.name || 'User'} ▼</span>
                    <div className="dropdown-menu">
                      <Link to="/dashboard/user" className="dropdown-item">Dashboard</Link>
                      <Link to="/profile" className="dropdown-item">Profile</Link>
                      <button onClick={handleLogout} className="dropdown-item">Logout</button>
                    </div>
                  </div>
                </>
              )}
              
              {role === 'provider' && (
                <>
                  <Link to="/provider/bookings" className="nav-link">📋 Bookings</Link>
                  <Link to="/map" className="nav-link">🗺️ View Map</Link>
                  <div className="nav-dropdown">
                    <span className="nav-link dropdown-toggle">💰 Payments ▼</span>
                    <div className="dropdown-menu">
                      <Link to="/provider/payments" className="dropdown-item">Payment Settings</Link>
                      <Link to="/provider/location" className="dropdown-item">Location Settings</Link>
                    </div>
                  </div>
                  <div className="nav-dropdown">
                    <span className="nav-link dropdown-toggle">{user?.name || 'Provider'} ▼</span>
                    <div className="dropdown-menu">
                      <Link to="/dashboard/provider" className="dropdown-item">Dashboard</Link>
                      <Link to="/profile" className="dropdown-item">Profile</Link>
                      <button onClick={handleLogout} className="dropdown-item">Logout</button>
                    </div>
                  </div>
                </>
              )}
              
              {role === 'admin' && (
                <>
                  <Link to="/dashboard/admin" className="nav-link">⚙️ Admin Panel</Link>
                  <Link to="/users" className="nav-link">👥 Users</Link>
                  <Link to="/providers" className="nav-link">🏢 Providers</Link>
                  <div className="nav-dropdown">
                    <span className="nav-link dropdown-toggle">{user?.name || 'Admin'} ▼</span>
                    <div className="dropdown-menu">
                      <Link to="/analytics" className="dropdown-item">Analytics</Link>
                      <button onClick={handleLogout} className="dropdown-item">Logout</button>
                    </div>
                  </div>
                </>
              )}

              <NotificationBell />
            </>
          )}
        </nav>
      </div>
    </header>
  )
}