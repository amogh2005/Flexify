import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, allow }) {
  const { role } = useAuth()
  console.log('ProtectedRoute - role:', role, 'allow:', allow)
  if (!role) {
    console.log('ProtectedRoute - No role, redirecting to home')
    return <Navigate to="/" replace />
  }
  if (allow && !allow.includes(role)) {
    console.log('ProtectedRoute - Role not allowed, redirecting to home')
    return <Navigate to="/" replace />
  }
  console.log('ProtectedRoute - Access granted')
  return children
}


