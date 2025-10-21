import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import MapLeaflet from './pages/MapLeaflet'
import MapGoogle from './pages/MapGoogle'
import LoginAdmin from './pages/LoginAdmin'
import LoginProvider from './pages/LoginProvider'
import LoginUser from './pages/LoginUser'
import ProtectedRoute from './components/ProtectedRoute'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminProviders from './pages/AdminProviders'
import AdminBookings from './pages/AdminBookings'
import ProviderDashboard from './pages/ProviderDashboard'
import UserDashboard from './pages/UserDashboard'
import Booking from './pages/Booking'
import BookingDetails from './pages/BookingDetails'
import UserBookings from './pages/UserBookings'
import UserBooking from './pages/UserBooking'
import Profile from './pages/Profile'
import ProviderBookings from './pages/ProviderBookings'
import RegisterUser from './pages/RegisterUser'
import RegisterProvider from './pages/RegisterProvider'
import Services from './pages/Services'
import PaymentSettings from './pages/PaymentSettings'
import LocationSettings from './pages/LocationSettings'
import NavBar from './components/NavBar'
import ProviderOnboarding from './pages/ProviderOnboarding'
import './App.css'

function Home() {
  const { role, user } = useAuth()
  // Role-aware home content
  if (role === 'user') {
    return (
      <div className="home-container">
        <div className="hero-section">
          <h1 className="hero-title">Welcome back, {user?.name || 'User'}</h1>
          <p className="hero-subtitle">Find and book trusted providers fast</p>
          <div className="cta-buttons">
            <Link to="/services" className="btn btn-outline">Browse Services</Link>
            <Link to="/bookings" className="btn btn-outline">My Bookings</Link>
            <Link to="/profile" className="btn btn-outline">Profile</Link>
          </div>
        </div>
        {/* Light content below to avoid dark gap and make page feel complete */}
        <div className="features-section">
          <h2>Why Flexify works for you</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🧑‍🔧</div>
              <h3>Curated Providers</h3>
              <p>Only verified, active providers appear when you browse.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>Real‑time Updates</h3>
              <p>Instant notifications for accept, reject and status changes.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🗓️</div>
              <h3>Easy Management</h3>
              <p>Track all bookings from your dashboard in one place.</p>
            </div>
          </div>
        </div>
        <div className="cta-section">
          <h2>Ready to book?</h2>
          <p>Browse services and pick a trusted provider near you.</p>
          <div className="cta-buttons" style={{ justifyContent: 'center' }}>
            <Link to="/services" className="btn btn-outline">Browse Services</Link>
            <Link to="/bookings" className="btn btn-outline">View My Bookings</Link>
          </div>
        </div>
      </div>
    )
  }
  if (role === 'provider') {
    return (
      <div className="home-container">
        <div className="hero-section">
          <h1 className="hero-title">Welcome, {user?.name || 'Provider'}</h1>
          <p className="hero-subtitle">Manage your bookings and profile</p>
          <div className="cta-buttons">
            <Link to="/dashboard/provider" className="btn btn-outline">Provider Dashboard</Link>
            <Link to="/provider/bookings" className="btn btn-outline">View Bookings</Link>
            <Link to="/profile" className="btn btn-outline">Profile</Link>
          </div>
        </div>
        <div className="features-section">
          <h2>Grow with Flexify</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>Build Trust</h3>
              <p>Complete onboarding to boost trust score and visibility.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Fast Response</h3>
              <p>Accept requests in real‑time and keep your calendar full.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Performance Insights</h3>
              <p>Track earnings and performance on your dashboard.</p>
            </div>
          </div>
        </div>
        <div className="cta-section">
          <h2>Keep your profile up‑to‑date</h2>
          <p>Higher trust scores lead to more bookings and better visibility.</p>
          <div className="cta-buttons" style={{ justifyContent: 'center' }}>
            <Link to="/dashboard/provider" className="btn btn-outline">Open Dashboard</Link>
            <Link to="/profile" className="btn btn-outline">Edit Profile</Link>
          </div>
        </div>
      </div>
    )
  }
  if (role === 'admin') {
    return (
      <div className="home-container">
        <div className="hero-section">
          <h1 className="hero-title">Admin Console</h1>
          <p className="hero-subtitle">Manage users, providers, and verification</p>
          <div className="cta-buttons">
            <Link to="/dashboard/admin" className="btn btn-secondary">Open Admin Panel</Link>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">Flexify</h1>
        <p className="hero-subtitle">Find and book the best service providers in your area</p>
        
        <div className="cta-buttons">
          <Link 
            to="/services" 
            className="btn btn-secondary"
          >
            Browse Services
          </Link>
          <Link 
            to="/register/user" 
            className="btn btn-secondary"
          >
            Sign Up
          </Link>
        </div>
      </div>

      <div className="features-section">
        <h2>Why Choose Flexify?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>Local Services</h3>
            <p>Find verified service providers in your neighborhood</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Verified Providers</h3>
            <p>All providers are thoroughly vetted and reviewed</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💳</div>
            <h3>Secure Booking</h3>
            <p>Book services safely with our secure payment system</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Easy Management</h3>
            <p>Manage your bookings and services effortlessly</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Join thousands of users who trust Flexify</p>
        <div className="cta-buttons">
          <Link to="/services" className="btn btn-outline">Book Now</Link>
          <Link to="/register/user" className="btn btn-outline">Sign Up as User</Link>
          <Link to="/register/provider" className="btn btn-outline">Become a Provider</Link>
        </div>
      </div>

      {/* Quick Service Categories */}
      <div className="quick-services">
        <h2>Popular Services</h2>
        <div className="service-categories">
          <Link to="/services/driver" className="service-category">
            <span className="service-icon">🚗</span>
            <span>Drivers</span>
          </Link>
          <Link to="/services/cook" className="service-category">
            <span className="service-icon">👨‍🍳</span>
            <span>Cooks</span>
          </Link>
          <Link to="/services/plumber" className="service-category">
            <span className="service-icon">🔧</span>
            <span>Plumbers</span>
          </Link>
          <Link to="/services/electrician" className="service-category">
            <span className="service-icon">⚡</span>
            <span>Electricians</span>
          </Link>
          <Link to="/services/cleaner" className="service-category">
            <span className="service-icon">🧹</span>
            <span>Cleaners</span>
          </Link>
          <Link to="/services/maid" className="service-category">
            <span className="service-icon">👩‍💼</span>
            <span>Maids</span>
          </Link>
        </div>
        <div className='quick-service-links' style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/services" className="btn btn-primary">Book a Service Now</Link>
          <Link to="/services" className="btn btn-primary">View All Services</Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>About Us</h3>
            <p>Flexify connects you with trusted, verified service providers in your area. We make it easy to find and book quality services for all your needs.</p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">Facebook</a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">Twitter</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">LinkedIn</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">Instagram</a>
            </div>
          </div>
          
          <div className="footer-section">
            <h3>Support</h3>
            <ul className="footer-links">
              <li><a href="mailto:support@flexify.com">Contact Us</a></li>
              <li><a href="tel:+1234567890">Call Us: +1 (234) 567-890</a></li>
              <li><Link to="/services">Browse Services</Link></li>
              <li><Link to="/register/user">Sign Up</Link></li>
              <li><Link to="/register/provider">Become a Provider</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 Flexify. All rights reserved.</p>
          <p>Made with ❤️ for better service experiences</p>
        </div>
      </footer>
    </div>
  )
}

function LoginPage({ role }) {
  return (
    <div style={{ padding: 24 }}>
      <h3>{role} Login</h3>
      {/* TODO: implement forms and API calls */}
    </div>
  )
}

function Dashboard({ role }) {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome to Your Dashboard</h1>
        <p className="dashboard-subtitle">Manage your account and services</p>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Profile Information</h3>
          <p>Update your personal details and preferences</p>
          <button className="btn btn-outline">Edit Profile</button>
        </div>
        
        <div className="dashboard-card">
          <h3>Recent Activity</h3>
          <p>View your latest bookings and interactions</p>
          <button className="btn btn-outline">View Activity</button>
        </div>
        
        <div className="dashboard-card">
          <h3>Settings</h3>
          <p>Configure your account settings and notifications</p>
          <button className="btn btn-outline">Manage Settings</button>
        </div>
      </div>
    </div>
  )
}

function MapPage() {
  console.log('MapPage component rendered')
  return (
    <div style={{ padding: 24 }}>
      <h3>🗺️ Interactive Map</h3>
      <p style={{ marginBottom: '1rem', color: '#666' }}>This is the map page - if you can see this, routing is working!</p>
      <div style={{ border: '2px solid #e2e8f0', borderRadius: '8px', marginTop: '16px' }}>
        <MapLeaflet />
      </div>
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <button 
          onClick={() => window.history.back()} 
          className="btn btn-outline"
        >
          ← Go Back
        </button>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <NavBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register/user" element={<RegisterUser />} />
            <Route path="/register/provider" element={<RegisterProvider />} />
            <Route path="/login/user" element={<LoginUser />} />
            <Route path="/login/provider" element={<LoginProvider />} />
            <Route path="/login/admin" element={<LoginAdmin />} />
            <Route path="/dashboard/user" element={<ProtectedRoute allow={["user"]}><UserDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/provider" element={<ProtectedRoute allow={["provider"]}><ProviderDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/admin" element={<ProtectedRoute allow={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allow={["admin"]}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/providers" element={<ProtectedRoute allow={["admin"]}><AdminProviders /></ProtectedRoute>} />
            <Route path="/admin/bookings" element={<ProtectedRoute allow={["admin"]}><AdminBookings /></ProtectedRoute>} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/map-google" element={<MapGoogle />} />
            <Route path="/bookings" element={<ProtectedRoute allow={["user"]}><UserBookings /></ProtectedRoute>} />
            <Route path="/booking/new" element={<ProtectedRoute allow={["user"]}><UserBooking /></ProtectedRoute>} />
            <Route path="/provider/bookings" element={<ProtectedRoute allow={["provider"]}><ProviderBookings /></ProtectedRoute>} />
            <Route path="/provider/payments" element={<ProtectedRoute allow={["provider"]}><PaymentSettings /></ProtectedRoute>} />
            <Route path="/provider/location" element={<ProtectedRoute allow={["provider"]}><LocationSettings /></ProtectedRoute>} />
            <Route path="/onboarding/provider" element={<ProtectedRoute allow={["provider"]}><ProviderOnboarding /></ProtectedRoute>} />
            <Route path="/booking/:id" element={<ProtectedRoute allow={["user","provider"]}><BookingDetails /></ProtectedRoute>} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:category" element={<Services />} />
            <Route path="/profile" element={<ProtectedRoute allow={["user","provider","admin"]}><Profile /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  )
}
