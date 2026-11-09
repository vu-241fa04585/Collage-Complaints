import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import NotificationPanel from '../../components/notifications/NotificationPanel';

const NotificationsPage = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Notifications & Alerts</h2>
          <p className="text-xs text-gray-500">
            Real-time feed of complaint tracking, SLA warnings, and staff replies
          </p>
        </div>

        <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === 'all'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === 'unread'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Unread ({notifications.filter((n) => !n.isRead).length})
          </button>
        </div>
      </div>

      <NotificationPanel
        notifications={filteredNotifications}
        onMarkRead={markAsRead}
        onMarkAllRead={markAllAsRead}
        onSelectNotification={(n) => {
          if (n.relatedComplaint) {
            navigate(`/complaint/${n.relatedComplaint._id || n.relatedComplaint}`);
          }
        }}
      />
    </div>
  );
};

export default NotificationsPage;

