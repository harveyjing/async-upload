import { useState, useCallback } from 'react';

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error', 
  INFO: 'info',
  WARNING: 'warning'
};

// Create notification object
const createNotification = (type, message, duration = 5000) => ({
  id: Date.now() + Math.random(),
  type,
  message,
  duration,
  createdAt: new Date().toISOString()
});

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  // Add a new notification
  const addNotification = useCallback((type, message, duration) => {
    const notification = createNotification(type, message, duration);
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, duration);
    }
    
    return notification.id;
  }, []);

  // Remove a notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods for different notification types
  const showSuccess = useCallback((message, duration) => {
    return addNotification(NOTIFICATION_TYPES.SUCCESS, message, duration);
  }, [addNotification]);

  const showError = useCallback((message, duration) => {
    return addNotification(NOTIFICATION_TYPES.ERROR, message, duration);
  }, [addNotification]);

  const showInfo = useCallback((message, duration) => {
    return addNotification(NOTIFICATION_TYPES.INFO, message, duration);
  }, [addNotification]);

  const showWarning = useCallback((message, duration) => {
    return addNotification(NOTIFICATION_TYPES.WARNING, message, duration);
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showInfo,
    showWarning
  };
};
