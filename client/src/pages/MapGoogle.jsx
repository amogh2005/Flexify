import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'

const containerStyle = { width: '100%', height: '420px' }

export default function MapGoogle() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: apiKey || '' })
  const [center, setCenter] = useState({ lat: 51.505, lng: -0.09 })
  const [providers, setProviders] = useState([])
  const [category, setCategory] = useState('')

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setCenter({ lat, lng })
        await fetchProviders(lat, lng, category)
      })
    }
  }, [])

  async function fetchProviders(lat, lng, cat) {
    try {
      const { data } = await api.get('/providers/nearby', { params: { lat, lng, radiusMeters: 6000, category: cat || undefined } })
      setProviders(data)
    } catch {}
  }

  function onFilterChange(e) {
    const cat = e.target.value
    setCategory(cat)
    fetchProviders(center.lat, center.lng, cat)
  }

  const markers = useMemo(() => providers.map(p => {
    const [lng, lat] = p.location?.coordinates || []
    if (lat == null || lng == null) return null
    return { id: p._id, position: { lat, lng }, title: p.category }
  }).filter(Boolean), [providers])

  if (!isLoaded) return <div>Loading map...</div>
  return (
    <div style={{ padding: 12 }}>
      <div style={{ marginBottom: 8 }}>
        <label>Category: <input value={category} onChange={onFilterChange} placeholder="plumber, electrician, cook..." /></label>
      </div>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
        {markers.map(m => (
          <Marker key={m.id} position={m.position} title={m.title} />
        ))}
      </GoogleMap>
    </div>
  )
}


