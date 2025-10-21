import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'

export default function Services() {
  const navigate = useNavigate()
  const { user, role } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState('')
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const serviceCategories = {
    'maid': {
      name: 'Housekeeping & Cleaning',
      icon: '🧹',
      basePrice: 200,
      skills: ['Deep Cleaning', 'Laundry', 'Cooking', 'Pet Care', 'Elder Care'],
      description: 'Professional housekeeping and cleaning services'
    },
    'plumber': {
      name: 'Plumbing Services',
      icon: '🔧',
      basePrice: 300,
      skills: ['Pipe Repair', 'Drain Cleaning', 'Fixture Installation', 'Water Heater', 'Emergency Repair'],
      description: 'Expert plumbing and water system services'
    },
    'electrician': {
      name: 'Electrical Services',
      icon: '⚡',
      basePrice: 350,
      skills: ['Wiring', 'Fixture Installation', 'Safety Inspection', 'Emergency Repair', 'Smart Home Setup'],
      description: 'Certified electrical installation and repair'
    },
    'cook': {
      name: 'Cooking & Catering',
      icon: '👨‍🍳',
      basePrice: 400,
      skills: ['Indian Cuisine', 'International Cuisine', 'Vegan Cooking', 'Party Catering', 'Dietary Specialties'],
      description: 'Professional cooking and catering services'
    },
    'driver': {
      name: 'Transportation',
      icon: '🚗',
      basePrice: 250,
      skills: ['City Driving', 'Highway Driving', 'Luxury Cars', 'Commercial Vehicles', 'Emergency Transport'],
      description: 'Safe and reliable transportation services'
    },
    'cleaner': {
      name: 'Specialized Cleaning',
      icon: '🧽',
      basePrice: 250,
      skills: ['Carpet Cleaning', 'Window Cleaning', 'Deep Cleaning', 'Post-Construction', 'Commercial Cleaning'],
      description: 'Specialized cleaning and maintenance services'
    }
  }

  // NOTE: We no longer render static service cards here. We focus on available providers.

  async function loadProviders(category) {
    if (!user) {
      setProviders([])
      return
    }
    try {
      setLoading(true)
      setError('')
      const params = { available: true, verified: true }
      if (category) params.category = category
      const { data } = await api.get('/providers', { params })
      setProviders(data.providers || [])
    } catch (e) {
      console.error('Failed to load providers:', e)
      setError('Failed to load providers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProviders(selectedCategory)
  }, [selectedCategory, user])

  return (
    <div className="services-container">
      <div className="services-header">
        <h1>Our Services</h1>
        <p>Professional services at your doorstep. Choose from our range of verified service providers.</p>
      </div>

      {/* Available Services (computed from providers) */}
      <div className="services-header" style={{ marginTop: '0.5rem' }}>
        <h2>Available Services</h2>
      </div>
      <div className="services-grid">
        {Object.entries(serviceCategories).map(([key, category]) => (
          <div key={key} className="service-card" onClick={() => setSelectedCategory(key)}>
            <div className="service-icon">{category.icon}</div>
            <h3>{category.name}</h3>
            <p className="service-description">{category.description}</p>
            {!user ? (
              <button className="btn btn-primary service-select-btn" onClick={() => navigate('/login/user')}>Login to View Providers</button>
            ) : (
              <button className="btn btn-primary service-select-btn">View Providers</button>
            )}
          </div>
        ))}
      </div>

      {/* Optional: Simple category filter to narrow providers */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ marginRight: 8 }}>Filter by category:</label>
        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
          <option value="">All</option>
          {Object.keys(serviceCategories).map((k) => (
            <option key={k} value={k}>{serviceCategories[k].name}</option>
          ))}
        </select>
      </div>

      <div className="services-header" style={{ marginTop: '2rem' }}>
        <h2>Available Providers {selectedCategory ? `for ${serviceCategories[selectedCategory]?.name}` : ''}</h2>
      </div>
      {user && loading ? (
        <div>Loading providers...</div>
      ) : user && error ? (
        <div className="error-message">{error}</div>
      ) : user ? (
        <div className="services-grid">
          {providers.map(p => (
            <div key={p._id} className="service-card" onClick={() => navigate('/booking/new', { state: { providerId: p._id, selectedCategory: p.category } })}>
              <div className="service-icon">{serviceCategories[p.category]?.icon || '👤'}</div>
              <h3>{p.userId?.name || 'Provider'}</h3>
              <p className="service-description">{serviceCategories[p.category]?.name || p.category}</p>
              <div className="service-price">Rating: {p.rating?.toFixed?.(1) || 0} ★</div>
              <div className="service-skills">
                <h4>Languages</h4>
                <div className="skills-list">
                  {(p.languages || []).slice(0, 3).map(lang => (
                    <span key={lang} className="skill-tag">{lang}</span>
                  ))}
                </div>
              </div>
              <button className="btn btn-primary service-select-btn">Book Now</button>
            </div>
          ))}
          {providers.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', opacity: 0.7 }}>No providers found</div>
          )}
        </div>
      ) : null}

      {/* Keep marketing section minimal or remove if unwanted */}

      {!user && (
        <div className="cta-section">
          <h2>Ready to Book?</h2>
          <p>Create an account to start booking services</p>
          <div className="cta-buttons">
            <button 
              onClick={() => navigate('/register/user')}
              className="btn btn-outline"
            >
              Sign Up
            </button>
            <button 
              onClick={() => navigate('/login/user')}
              className="btn btn-outline"
            >
              Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  )
}