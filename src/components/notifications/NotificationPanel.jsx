import React from 'react';
import { timeAgo } from '../../utils/helpers';
import { HiCheck, HiBell, HiChatAlt2, HiExclamation } from 'react-icons/hi';

const getNotifIcon = (type) => {
  switch (type) {
    case 'escalation':
      return <HiExclamation className="text-red-500 w-5 h-5 flex-shrink-0" />;
    case 'feedback_request':
      return <HiChatAlt2 className="text-emerald-500 w-5 h-5 flex-shrink-0" />;
    default:
      return <HiBell className="text-blue-500 w-5 h-5 flex-shrink-0" />;
  }
};

const NotificationPanel = ({
  notifications = [],
  onMarkRead,
  onMarkAllRead,
  onSelectNotification,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Notifications</h2>
          <p className="text-xs text-gray-500">Live system updates, SLA escalations & replies</p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={onMarkAllRead}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            No notifications in your feed.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => {
                onMarkRead(n._id);
                if (onSelectNotification) onSelectNotification(n);
              }}
              className={`p-4 flex items-start space-x-3.5 transition-colors cursor-pointer hover:bg-gray-50/80 ${
                !n.isRead ? 'bg-blue-50/40' : 'bg-white'
              }`}
            >
              <div className="mt-0.5">{getNotifIcon(n.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {n.title}
                  </h4>
                  <span className="text-[11px] text-gray-400 flex-shrink-0">
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {n.message}
                </p>
                {n.relatedComplaint && (
                  <span className="inline-block mt-2 text-[10px] font-mono font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded border border-blue-200">
                    {n.relatedComplaint.trackingId || 'View Complaint'}
                  </span>
                )}
              </div>
              {!n.isRead && (
                <span
                  className="w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0 mt-1.5"
                  title="Unread"
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;

