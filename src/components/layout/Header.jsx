import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useSocket } from '../../context/SocketContext';
import {
  HiMenuAlt2,
  HiBell,
  HiCheckCircle,
  HiUserCircle,
} from 'react-icons/hi';
import { getInitials, timeAgo } from '../../utils/helpers';

const Header = ({ title = 'Dashboard', onToggleSidebar }) => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { connected } = useSocket();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Left side: Hamburger + Page Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none"
        >
          <HiMenuAlt2 className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h1>
        </div>
      </div>

      {/* Right side: Live status, Notification bell, User info */}
      <div className="flex items-center space-x-4">
        {/* Real-time Socket Indicator */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
          <span
            className={`w-2 h-2 rounded-full ${
              connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span>{connected ? 'Live Sync' : 'Reconnecting'}</span>
        </div>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu((prev) => !prev)}
            className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition focus:outline-none"
            aria-label="Notifications"
          >
            <HiBell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-bounce">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Card */}
          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-fadeIn">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                <span className="font-semibold text-gray-800 text-sm">
                  Notifications ({unreadCount} unread)
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => {
                      markAllAsRead();
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                  >
                    <HiCheckCircle className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-500">
                    No new notifications
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n._id}
                      onClick={() => {
                        markAsRead(n._id);
                        setShowNotifMenu(false);
                        if (n.relatedComplaint) {
                          navigate(`/complaint/${n.relatedComplaint._id || n.relatedComplaint}`);
                        }
                      }}
                      className={`p-3 text-left cursor-pointer transition hover:bg-blue-50/50 ${
                        !n.isRead ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-gray-100 px-4 py-2 text-center bg-gray-50/80 rounded-b-xl">
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifMenu(false)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Name */}
        <Link
          to="/profile"
          className="flex items-center space-x-2 pl-2 border-l border-gray-200 hover:opacity-85 transition"
        >
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center shadow-sm">
            {getInitials(user?.name)}
          </div>
          <div className="hidden md:block text-left">
            <span className="text-xs font-semibold text-gray-800 block leading-tight truncate max-w-[120px]">
              {user?.name}
            </span>
            <span className="text-[10px] text-gray-500 capitalize block leading-tight">
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;

