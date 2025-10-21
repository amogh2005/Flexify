import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Add this import
import { useSocket } from '../context/SocketContext';
import './NotificationBell.css';

export default function NotificationBell() {
  const { role, loading } = useAuth(); // Add auth check
  const { notifications, clearNotification, clearAllNotifications, requestNotificationPermission } = useSocket();
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (role) { // Only check permissions if authenticated
      checkNotificationPermission();
    }
  }, [role]);

  // Don't render if not authenticated or still loading
  if (loading || !role) {
    return null;
  }

  const checkNotificationPermission = async () => {
    const permission = await requestNotificationPermission();
    setHasPermission(permission);
  };

  const unreadCount = notifications.length;

  const handleNotificationClick = (notification) => {
    // Handle notification click based on type
    switch (notification.type) {
      case 'new-booking':
        // Navigate to provider dashboard
        window.location.href = '/dashboard/provider';
        break;
      case 'booking-status-update':
        // Navigate to user bookings
        window.location.href = '/bookings';
        break;
      case 'payment-confirmed':
      case 'payment-received':
        // Navigate to appropriate page
        window.location.href = '/bookings';
        break;
      default:
        break;
    }
    
    clearNotification(notification.id);
    setShowDropdown(false);
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new-booking': return '📋';
      case 'booking-status-update': return '🔄';
      case 'payment-confirmed': return '✅';
      case 'payment-received': return '💰';
      default: return '🔔';
    }
  };

  return (
    <div className="notification-bell">
      <button 
        className="notification-button"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={clearAllNotifications}
                className="clear-all-btn"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className="notification-item"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">
                      {formatTime(notification.timestamp)}
                    </span>
                  </div>
                  <button 
                    className="notification-close"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(notification.id);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          {!hasPermission && (
            <div className="notification-permission">
              <p>Enable notifications for real-time updates</p>
              <button 
                onClick={checkNotificationPermission}
                className="enable-notifications-btn"
              >
                Enable
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}