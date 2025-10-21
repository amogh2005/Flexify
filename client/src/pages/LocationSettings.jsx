import { useState, useEffect } from 'react'
import { api } from '../api/client'
import './LocationSettings.css'

export default function LocationSettings() {
  const [location, setLocation] = useState({
    coordinates: [0, 0],
    address: null,
    serviceRadius: 10
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    longitude: '',
    latitude: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    serviceRadius: 10
  })

  useEffect(() => {
    loadLocation()
  }, [])

  const loadLocation = async () => {
    try {
      const response = await api.get('/providers/location')
      setLocation(response.data)
      
      // Pre-fill form with existing data
      if (response.data.coordinates) {
        setFormData(prev => ({
          ...prev,
          longitude: response.data.coordinates[0] || '',
          latitude: response.data.coordinates[1] || '',
          serviceRadius: response.data.serviceRadius || 10
        }))
      }
      
      if (response.data.address) {
        setFormData(prev => ({
          ...prev,
          address: response.data.address.street || '',
          city: response.data.address.city || '',
          state: response.data.address.state || '',
          country: response.data.address.country || '',
          postalCode: response.data.address.postalCode || ''
        }))
      }
    } catch (error) {
      console.error('Error loading location:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser')
      return
    }

    setSaving(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }))
        setSaving(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('Error getting your location. Please enter coordinates manually.')
        setSaving(false)
      }
    )
  }

  const handleSaveLocation = async () => {
    if (!formData.longitude || !formData.latitude) {
      alert('Please enter longitude and latitude')
      return
    }

    setSaving(true)
    try {
      await api.put('/providers/location', {
        longitude: parseFloat(formData.longitude),
        latitude: parseFloat(formData.latitude),
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postalCode: formData.postalCode
      })
      
      alert('Location updated successfully!')
      await loadLocation()
    } catch (error) {
      console.error('Error saving location:', error)
      alert('Failed to save location. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveServiceRadius = async () => {
    if (!formData.serviceRadius || formData.serviceRadius < 1 || formData.serviceRadius > 50) {
      alert('Service radius must be between 1 and 50 kilometers')
      return
    }

    setSaving(true)
    try {
      await api.put('/providers/service-radius', {
        radius: parseInt(formData.serviceRadius)
      })
      
      alert('Service radius updated successfully!')
      await loadLocation()
    } catch (error) {
      console.error('Error saving service radius:', error)
      alert('Failed to save service radius. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="location-settings-container">
        <div className="loading">Loading location settings...</div>
      </div>
    )
  }

  return (
    <div className="location-settings-container">
      <div className="location-header">
        <h1>Location Settings</h1>
        <p>Manage your service location and coverage area</p>
      </div>

      {/* Current Location Display */}
      <div className="current-location">
        <h2>Current Location</h2>
        <div className="location-info">
          <div className="location-item">
            <span className="label">Coordinates:</span>
            <span className="value">
              {location.coordinates[0]}, {location.coordinates[1]}
            </span>
          </div>
          <div className="location-item">
            <span className="label">Service Radius:</span>
            <span className="value">{location.serviceRadius} km</span>
          </div>
          {location.address && (
            <div className="location-item">
              <span className="label">Address:</span>
              <span className="value">
                {location.address.street}, {location.address.city}, {location.address.state}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Location Update Form */}
      <div className="location-form">
        <h2>Update Location</h2>
        
        <div className="form-section">
          <h3>Coordinates</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Latitude</label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => handleInputChange('latitude', e.target.value)}
                placeholder="Enter latitude"
              />
            </div>
            <div className="form-group">
              <label>Longitude</label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => handleInputChange('longitude', e.target.value)}
                placeholder="Enter longitude"
              />
            </div>
            <div className="form-group">
              <label>Auto-detect</label>
              <button 
                className="btn btn-outline"
                onClick={getCurrentLocation}
                disabled={saving}
              >
                {saving ? 'Detecting...' : 'Get Current Location'}
              </button>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Address Details (Optional)</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Street Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter street address"
              />
            </div>
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Enter city"
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="Enter state"
              />
            </div>
            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder="Enter country"
              />
            </div>
            <div className="form-group">
              <label>Postal Code</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                placeholder="Enter postal code"
              />
            </div>
          </div>
        </div>

        <button 
          className="btn btn-primary"
          onClick={handleSaveLocation}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Update Location'}
        </button>
      </div>

      {/* Service Radius */}
      <div className="service-radius">
        <h2>Service Coverage</h2>
        <div className="radius-control">
          <div className="form-group">
            <label>Service Radius (kilometers)</label>
            <div className="radius-input-group">
              <input
                type="range"
                min="1"
                max="50"
                value={formData.serviceRadius}
                onChange={(e) => handleInputChange('serviceRadius', e.target.value)}
                className="radius-slider"
              />
              <span className="radius-value">{formData.serviceRadius} km</span>
            </div>
            <p className="radius-help">
              This determines how far you're willing to travel for jobs
            </p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={handleSaveServiceRadius}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Update Service Radius'}
          </button>
        </div>
      </div>

      {/* Map Preview */}
      <div className="map-preview">
        <h2>Location Preview</h2>
        <div className="map-placeholder">
          <div className="map-icon">🗺️</div>
          <p>Location: {formData.latitude}, {formData.longitude}</p>
          <p>Service Area: {formData.serviceRadius} km radius</p>
        </div>
      </div>
    </div>
  )
}
