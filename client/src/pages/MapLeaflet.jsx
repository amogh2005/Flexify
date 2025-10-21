import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import L from 'leaflet'

// Custom hook to handle map updates
function MapUpdater({ center, zoom }) {
  const map = useMap()
  
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom)
    }
  }, [center, zoom, map])
  
  return null
}

export default function MapLeaflet() {
  const [position, setPosition] = useState([51.505, -0.09])
  const [providers, setProviders] = useState([])
  const [currentProvider, setCurrentProvider] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { role } = useAuth()

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setPosition([lat, lng])
        
        try {
          // Fetch nearby providers
          const { data } = await api.get('/providers/nearby', { 
            params: { lat, lng, radiusMeters: 10000 } 
          })
          setProviders(data)
          
          // If current user is a provider, fetch their info
          if (role === 'provider') {
            try {
              const { data: providerData } = await api.get('/providers/me')
              setCurrentProvider(providerData)
            } catch (error) {
              console.log('Could not fetch current provider data')
            }
          }
        } catch (error) {
          console.log('Could not fetch providers')
        } finally {
          setIsLoading(false)
        }
      }, (error) => {
        console.log('Geolocation error:', error)
        setIsLoading(false)
      })
    } else {
      setIsLoading(false)
    }
  }, [role])

  const getMarkerIcon = (provider) => {
    // Different colors for different verification statuses
    if (provider.verified) {
      return '🟢' // Green for verified
    } else if (provider._id === currentProvider?._id) {
      return '🔵' // Blue for current provider
    } else {
      return '🟡' // Yellow for unverified
    }
  }

  const getMarkerColor = (provider) => {
    if (provider.verified) {
      return '#10b981' // Green
    } else if (provider._id === currentProvider?._id) {
      return '#3b82f6' // Blue
    } else {
      return '#f59e0b' // Yellow
    }
  }

  if (isLoading) {
    return (
      <div style={{ 
        height: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f8fafc',
        borderRadius: '0.5rem',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗺️</div>
          <div>Loading map...</div>
        </div>
      </div>
    )
  }

  console.log('MapLeaflet rendering with position:', position, 'providers:', providers.length)

  return (
    <div style={{ position: 'relative' }}>
      {/* Debug info */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '0.5rem',
        borderRadius: '0.25rem',
        fontSize: '0.75rem',
        zIndex: 1000
      }}>
        Map Status: Ready | Position: {position[0].toFixed(4)}, {position[1].toFixed(4)} | Providers: {providers.length}
      </div>
      
      {/* Map Legend */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'white',
        padding: '0.75rem',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        fontSize: '0.875rem',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Map Legend</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ color: '#10b981' }}>🟢</span>
          <span>Verified Providers</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ color: '#f59e0b' }}>🟡</span>
          <span>Unverified Providers</span>
        </div>
        {role === 'provider' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#3b82f6' }}>🔵</span>
            <span>Your Location</span>
          </div>
        )}
      </div>

      <MapContainer 
        center={position} 
        zoom={13} 
        style={{ height: '500px', borderRadius: '0.5rem' }}
        className="map-container"
        fallback={
          <div style={{
            height: '500px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ fontSize: '3rem' }}>🗺️</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>Map Loading...</div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Please wait while we load the map</div>
          </div>
        }
      >
        <MapUpdater center={position} zoom={13} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User's current location */}
        <Marker position={position}>
          <Popup>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>📍 You are here</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                {position[0].toFixed(6)}, {position[1].toFixed(6)}
              </div>
            </div>
          </Popup>
        </Marker>
        
        {/* Provider markers */}
        {providers.map(p => {
          const [lng, lat] = p.location?.coordinates || []
          if (lat == null || lng == null) return null
          
          const isCurrentProvider = p._id === currentProvider?._id
          const markerColor = getMarkerColor(p)
          
          return (
            <Marker 
              key={p._id} 
              position={[lat, lng]}
              icon={L.divIcon({
                html: `<div style="
                  background: ${markerColor};
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: 12px;
                  font-weight: bold;
                ">${isCurrentProvider ? 'U' : p.category.charAt(0).toUpperCase()}</div>`,
                className: 'custom-marker',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })}
            >
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ 
                      fontSize: '1.5rem',
                      color: markerColor
                    }}>
                      {getMarkerIcon(p)}
                    </span>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                        {p.category.charAt(0).toUpperCase() + p.category.slice(1)}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        {p.verified ? '✅ Verified' : '⏳ Pending'}
                      </div>
                    </div>
                  </div>
                  
                  {p.description && (
                    <div style={{ 
                      marginBottom: '0.75rem',
                      padding: '0.5rem',
                      background: '#f8fafc',
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem'
                    }}>
                      {p.description}
                    </div>
                  )}
                  
                  <div style={{ 
                    display: 'flex', 
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      📍 {lat.toFixed(6)}, {lng.toFixed(6)}
                    </span>
                  </div>
                  
                  {!isCurrentProvider && (
                    <Link 
                      to={`/booking/${p._id}`}
                      style={{
                        display: 'block',
                        background: '#1e40af',
                        color: 'white',
                        textDecoration: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.25rem',
                        textAlign: 'center',
                        fontWeight: '500',
                        marginTop: '0.5rem'
                      }}
                    >
                      Book Service
                    </Link>
                  )}
                  
                  {isCurrentProvider && (
                    <div style={{
                      background: '#dbeafe',
                      color: '#1e40af',
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      textAlign: 'center',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      marginTop: '0.5rem'
                    }}>
                      This is your location
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
      
      {/* Provider Dashboard Link */}
      {role === 'provider' && (
        <div style={{
          marginTop: '1rem',
          textAlign: 'center'
        }}>
          <Link 
            to="/dashboard/provider"
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            ⚙️ Manage Your Profile
          </Link>
        </div>
      )}
    </div>
  )
}


