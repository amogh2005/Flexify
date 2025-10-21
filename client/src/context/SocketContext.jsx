import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user, token } = useAuth();

  useEffect(() => {
    if (token && user) {
      // Connect to WebSocket server
      const newSocket = io(import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_ORIGIN || 'http://localhost:4000', {
        auth: { token }
      });

      newSocket.on('connect', () => {
        console.log('Connected to WebSocket server');
        // Ask for notification permission on first connect
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission().catch(() => {});
        }
        
        // Join appropriate room based on user role
        if (user.role === 'provider') {
          newSocket.emit('join-provider-room');
        } else if (user.role === 'user') {
          newSocket.emit('join-user-room');
        }
      });

      newSocket.on('connect_error', (err) => {
        console.error('WebSocket connection error:', err?.message || err);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });

      // Handle real-time notifications
      newSocket.on('new-booking', (data) => {
        console.log('Socket event: new-booking', data)
        addNotification(data);
      });

      newSocket.on('booking-status-update', (data) => {
        console.log('Socket event: booking-status-update', data)
        addNotification(data);
      });

      newSocket.on('payment-confirmed', (data) => {
        addNotification(data);
      });

      newSocket.on('payment-received', (data) => {
        addNotification(data);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [token, user]);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep last 10 notifications
    
    // Show browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Flexify', {
        body: notification.message,
        icon: '/favicon.ico'
      });
    }
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  };

  const value = {
    socket,
    notifications,
    addNotification,
    clearNotification,
    clearAllNotifications,
    requestNotificationPermission
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
