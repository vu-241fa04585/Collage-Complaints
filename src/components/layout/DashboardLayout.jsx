import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Dynamic header title based on current path
  const getPageTitle = (pathname) => {
    if (pathname.includes('/submit')) return 'Submit New Grievance';
    if (pathname.includes('/complaint/')) return 'Complaint Investigation & Redressal';
    if (pathname.includes('/student/complaints')) return 'My Grievance History';
    if (pathname.includes('/faculty/department-complaints')) return 'Department Complaint Queue';
    if (pathname.includes('/department/staff')) return 'Faculty & Staff Workload Allocation';
    if (pathname.includes('/department/analytics')) return 'Department Performance Metrics';
    if (pathname.includes('/admin/complaints')) return 'Central Complaint Redressal Console';
    if (pathname.includes('/admin/users')) return 'Institutional User Management';
    if (pathname.includes('/admin/departments')) return 'Department & Committee Setup';
    if (pathname.includes('/admin/analytics')) return 'Institutional Analytics & SLA Reports';
    if (pathname.includes('/admin/sla')) return 'Resolution SLA Target Matrix';
    if (pathname.includes('/admin/audit-logs')) return 'System Security & Redressal Audit Trail';
    if (pathname.includes('/management/performance')) return 'Departmental KPIs & Resolution Times';
    if (pathname.includes('/notifications')) return 'System Alerts & Redressal Feed';
    if (pathname.includes('/profile')) return 'Account & Security Preferences';
    return 'Dashboard Overview';
  };

  const title = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <Header title={title} onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* Dynamic Page Routed Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fadeIn">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

