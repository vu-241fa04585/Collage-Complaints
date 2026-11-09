import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiHome,
  HiPlusCircle,
  HiClipboardList,
  HiBell,
  HiUser,
  HiUsers,
  HiOfficeBuilding,
  HiChartBar,
  HiClock,
  HiDocumentReport,
  HiLogout,
  HiShieldCheck,
  HiX,
} from 'react-icons/hi';
import { getInitials, roleLabels } from '../../utils/helpers';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinks = () => {
    switch (user?.role) {
      case 'student':
        return [
          { to: '/student/dashboard', icon: HiHome, label: 'Dashboard' },
          { to: '/student/submit', icon: HiPlusCircle, label: 'Submit Complaint' },
          { to: '/student/complaints', icon: HiClipboardList, label: 'My Complaints' },
          { to: '/notifications', icon: HiBell, label: 'Notifications' },
          { to: '/profile', icon: HiUser, label: 'My Profile' },
        ];
      case 'faculty':
        return [
          { to: '/faculty/dashboard', icon: HiHome, label: 'Dashboard' },
          { to: '/faculty/department-complaints', icon: HiClipboardList, label: 'Dept Complaints' },
          { to: '/notifications', icon: HiBell, label: 'Notifications' },
          { to: '/profile', icon: HiUser, label: 'My Profile' },
        ];
      case 'department_head':
        return [
          { to: '/department/dashboard', icon: HiHome, label: 'Dashboard' },
          { to: '/department/complaints', icon: HiClipboardList, label: 'Complaints' },
          { to: '/department/staff', icon: HiUsers, label: 'Staff Workload' },
          { to: '/department/analytics', icon: HiChartBar, label: 'Analytics' },
          { to: '/notifications', icon: HiBell, label: 'Notifications' },
          { to: '/profile', icon: HiUser, label: 'My Profile' },
        ];
      case 'admin':
        return [
          { to: '/admin/dashboard', icon: HiHome, label: 'Dashboard' },
          { to: '/admin/complaints', icon: HiClipboardList, label: 'All Complaints' },
          { to: '/admin/users', icon: HiUsers, label: 'User Directory' },
          { to: '/admin/departments', icon: HiOfficeBuilding, label: 'Departments' },
          { to: '/admin/analytics', icon: HiChartBar, label: 'Analytics & Reports' },
          { to: '/admin/sla', icon: HiClock, label: 'SLA Config' },
          { to: '/admin/audit-logs', icon: HiDocumentReport, label: 'Audit Logs' },
          { to: '/notifications', icon: HiBell, label: 'Notifications' },
          { to: '/profile', icon: HiUser, label: 'My Profile' },
        ];
      case 'management':
        return [
          { to: '/management/dashboard', icon: HiHome, label: 'Executive Overview' },
          { to: '/management/performance', icon: HiChartBar, label: 'Performance Metrics' },
          { to: '/admin/analytics', icon: HiDocumentReport, label: 'College Analytics' },
          { to: '/notifications', icon: HiBell, label: 'Notifications' },
          { to: '/profile', icon: HiUser, label: 'My Profile' },
        ];
      default:
        return [];
    }
  };

  const navLinks = getLinks();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Logo */}
        <div>
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white font-bold">
                <HiShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-wide">CGR PORTAL</h1>
                <p className="text-[11px] text-blue-400 font-medium uppercase tracking-wider">
                  Grievance System
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>

          {/* User profile snippet */}
          <div className="px-5 py-4 mx-3 my-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-700/60 text-blue-200 flex items-center justify-center font-bold text-sm border border-blue-400/30">
              {getInitials(user?.name)}
            </div>
            <div className="overflow-hidden">
              <h2 className="text-sm font-semibold text-white truncate">{user?.name}</h2>
              <span className="inline-block text-[10px] font-semibold uppercase px-2 py-0.5 bg-blue-900/80 text-blue-300 rounded border border-blue-700/50">
                {roleLabels[user?.role] || user?.role}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-2 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-medium text-red-400 hover:text-white hover:bg-red-600/20 rounded-lg transition-colors border border-red-500/20"
          >
            <HiLogout className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

