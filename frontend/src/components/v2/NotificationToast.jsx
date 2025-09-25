import { useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { NOTIFICATION_TYPES } from './hooks/useNotifications';

const NotificationToast = ({ notifications }) => {
  const { notifications: notificationList, removeNotification } = notifications;

  const getNotificationIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return <CheckCircle className="h-4 w-4" />;
      case NOTIFICATION_TYPES.ERROR:
        return <XCircle className="h-4 w-4" />;
      case NOTIFICATION_TYPES.WARNING:
        return <AlertCircle className="h-4 w-4" />;
      case NOTIFICATION_TYPES.INFO:
        return <Info className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getNotificationVariant = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.ERROR:
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getNotificationStyles = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return 'border-green-200 bg-green-50 text-green-800';
      case NOTIFICATION_TYPES.WARNING:
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case NOTIFICATION_TYPES.INFO:
        return 'border-blue-200 bg-blue-50 text-blue-800';
      default:
        return '';
    }
  };

  if (notificationList.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notificationList.map((notification) => (
        <Alert
          key={notification.id}
          variant={getNotificationVariant(notification.type)}
          className={`relative transition-all duration-300 ease-in-out animate-in slide-in-from-right-full shadow-lg ${
            notification.type === NOTIFICATION_TYPES.ERROR 
              ? '' 
              : getNotificationStyles(notification.type)
          }`}
        >
          {getNotificationIcon(notification.type)}
          <AlertDescription className="pr-8">
            {notification.message}
          </AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeNotification(notification.id)}
            className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-transparent"
          >
            <X className="h-3 w-3" />
          </Button>
        </Alert>
      ))}
    </div>
  );
};

export default NotificationToast;
