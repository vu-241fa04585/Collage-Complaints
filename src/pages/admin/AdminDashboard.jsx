import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminService } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  HiClipboardList,
  HiClock,
  HiCheckCircle,
  HiExclamationCircle,
  HiUsers,
  HiOfficeBuilding,
  HiDocumentReport,
  HiDownload,
  HiLightningBolt,
} from 'react-icons/hi';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatDateTime, isOverdue, timeAgo } from '../../utils/helpers';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [resDash, resAnalytics] = await Promise.all([
          adminService.getDashboard(),
          adminService.getAnalytics(),
        ]);
        setDashboard(resDash.data.data);
        setAnalytics(resAnalytics.data.data);
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleDownloadPDF = async () => {
    try {
      toast.loading('Generating institutional grievance PDF report...');
      const res = await adminService.downloadReport();
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CGR-Institutional-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.dismiss();
      toast.success('Report downloaded successfully!');
    } catch (err) {
      toast.dismiss();
      toast.error('Failed to generate PDF report.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Initializing institutional administration console..." />;
  }

  const d = dashboard || {};
  const monthlyTrends = analytics?.monthlyTrends || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-2xl text-white shadow-md border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest block mb-1">
            Institutional Administration • Central Control Unit
          </span>
          <h2 className="text-2xl font-bold tracking-tight">
            Campus Grievance Redressal Command Center
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Live oversight of all engineering departments, automated routing rules, SLA compliance matrices, and student grievance resolutions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadPDF}
            className="btn-secondary text-xs flex items-center space-x-1.5"
          >
            <HiDownload className="w-4 h-4 text-blue-600" />
            <span>Export PDF Report</span>
          </button>
          <Link
            to="/admin/complaints"
            className="btn-primary text-xs flex items-center space-x-1.5 shadow-md shadow-blue-600/30"
          >
            <HiClipboardList className="w-4 h-4" />
            <span>Manage All Tickets</span>
          </Link>
        </div>
      </div>

      {/* KPI 4-Card Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Institutional Grievances"
          value={d.totalComplaints || 0}
          icon={HiClipboardList}
          color="blue"
          subtitle={`${d.todayComplaints || 0} submitted today`}
        />
        <StatCard
          title="Under Active Resolution"
          value={d.inProgressComplaints || 0}
          icon={HiClock}
          color="yellow"
          subtitle="Staff currently assigned"
        />
        <StatCard
          title="Successfully Redressed"
          value={d.resolvedComplaints || 0}
          icon={HiCheckCircle}
          color="green"
          subtitle="Resolved & verified"
        />
        <StatCard
          title="SLA Escalations"
          value={d.overdueComplaints || 0}
          icon={HiExclamationCircle}
          color="red"
          subtitle="Breached SLA targets"
        />
      </div>

      {/* Chart & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Monthly Trend Area Chart (Span 2) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Grievance Intake & Resolution Velocity
              </h3>
              <p className="text-xs text-gray-500">
                12-Month institutional volume trends with resolution trajectory
              </p>
            </div>
            <Link
              to="/admin/analytics"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Full Analytics →
            </Link>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  name="Received Grievances"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorResolved)"
                  name="Resolved"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Departmental Snapshot */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">
              Department Queue
            </h3>
            <Link
              to="/admin/departments"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Manage →
            </Link>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {d.departmentStats && d.departmentStats.length > 0 ? (
              d.departmentStats.map((dept) => (
                <div
                  key={dept._id}
                  className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-gray-900 truncate max-w-[150px]">
                      {dept.name}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-mono font-bold">
                      {dept.code}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-blue-600 block">
                      {dept.pending} pending
                    </span>
                    <span className="text-[10px] text-emerald-600">
                      {dept.resolved} resolved
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-6">
                No department records found.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Central Complaints */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Recent Grievances Logged Across Campus
            </h3>
            <p className="text-xs text-gray-500">Latest complaints received in real-time</p>
          </div>
          <Link
            to="/admin/complaints"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            View Full Database →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3">Tracking ID</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Logged</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {d.recentComplaints && d.recentComplaints.length > 0 ? (
                d.recentComplaints.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => navigate(`/complaint/${c._id}`)}
                    className="hover:bg-blue-50/50 cursor-pointer transition"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-blue-700">
                      {c.trackingId}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800 max-w-xs truncate">
                      {c.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-medium truncate max-w-[140px]">
                      {c.assignedDepartment?.name || 'Pending Routing'}
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-400">{timeAgo(c.createdAt)}</td>
                    <td className="px-4 py-3 text-right text-blue-600 font-semibold">
                      Manage →
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-400">
                    No complaints available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

