import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { departmentService, complaintService } from '../../services/api';
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
  HiArrowRight,
} from 'react-icons/hi';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { formatDateTime, isOverdue } from '../../utils/helpers';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#6b7280', '#ef4444'];

const DeptHeadDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const fetchDeptData = async () => {
      try {
        setLoading(true);
        if (user?.department) {
          const deptId = typeof user.department === 'object' ? user.department._id : user.department;
          const [resDash, resComp] = await Promise.all([
            departmentService.getDashboard(deptId),
            complaintService.getDepartmentComplaints({ limit: 6 }),
          ]);
          setDashboardData(resDash.data.data);
          setComplaints(resComp.data.data || []);
        } else {
          // Fallback if not populated
          const resComp = await complaintService.getDepartmentComplaints({ limit: 6 });
          setComplaints(resComp.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load dept head dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeptData();
  }, [user]);

  if (loading) {
    return <LoadingSpinner message="Loading departmental oversight console..." />;
  }

  const stats = dashboardData?.stats || {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'assigned').length,
    inProgress: complaints.filter((c) => c.status === 'in_progress').length,
    resolved: complaints.filter((c) => c.status === 'resolved' || c.status === 'closed').length,
    overdue: complaints.filter(
      (c) => c.status !== 'resolved' && c.status !== 'closed' && isOverdue(c.dueDate)
    ).length,
  };

  const chartData = [
    { name: 'Assigned', value: stats.pending || 0 },
    { name: 'In Progress', value: stats.inProgress || 0 },
    { name: 'Resolved', value: stats.resolved || 0 },
    { name: 'Overdue', value: stats.overdue || 0 },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-2xl text-white shadow-md border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest block mb-1">
            Department Head Administration • {dashboardData?.department?.name || 'Department Oversight'}
          </span>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome, {user?.name}
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Monitor resolution velocity, oversee staff ticket allocation, prevent SLA escalations, and maintain academic satisfaction.
          </p>
        </div>
        <div className="flex space-x-2">
          <Link
            to="/department/staff"
            className="btn-secondary text-sm flex items-center space-x-1.5"
          >
            <HiUsers className="w-4 h-4" />
            <span>Staff Workload</span>
          </Link>
          <Link
            to="/department/complaints"
            className="btn-primary text-sm flex items-center space-x-1.5"
          >
            <span>All Tickets</span>
            <HiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Assigned"
          value={stats.total}
          icon={HiClipboardList}
          color="blue"
          subtitle="Department lifetime"
        />
        <StatCard
          title="Active Progress"
          value={stats.inProgress + stats.pending}
          icon={HiClock}
          color="yellow"
          subtitle="Currently investigated"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          icon={HiCheckCircle}
          color="green"
          subtitle="Closed satisfactorily"
        />
        <StatCard
          title="SLA Breaches"
          value={stats.overdue}
          icon={HiExclamationCircle}
          color="red"
          subtitle="Immediate action required"
        />
      </div>

      {/* Charts & Staff Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Resolution Status Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-900 mb-1">
            Status Breakdown
          </h3>
          <p className="text-xs text-gray-500 mb-4">Grievance distribution across resolution lifecycle</p>

          <div className="h-64 flex items-center justify-center">
            {chartData.length === 0 ? (
              <span className="text-xs text-gray-400">No grievance data available</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right: Staff Allocation Workload (Span 2) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Staff Allocation & Workload
              </h3>
              <p className="text-xs text-gray-500">Active tickets assigned to faculty members</p>
            </div>
            <Link
              to="/department/staff"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Manage Staff →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Staff Name</th>
                  <th className="px-4 py-2.5">Active Complaints</th>
                  <th className="px-4 py-2.5">Resolved Total</th>
                  <th className="px-4 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {dashboardData?.staffWorkload && dashboardData.staffWorkload.length > 0 ? (
                  dashboardData.staffWorkload.map((staff, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {staff.name}
                      </td>
                      <td className="px-4 py-3 font-bold text-blue-600">
                        {staff.assigned} active
                      </td>
                      <td className="px-4 py-3 text-emerald-600 font-semibold">
                        {staff.resolved} resolved
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-gray-400">
                      No staff members assigned to this department yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Department Complaints */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Recent Grievance Submissions
            </h3>
            <p className="text-xs text-gray-500">Latest tickets routed to department</p>
          </div>
          <Link
            to="/department/complaints"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            View all ({stats.total}) →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3">Tracking ID</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Target SLA</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {complaints.slice(0, 5).map((c) => (
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
                  <td className="px-4 py-3">
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDateTime(c.dueDate)}</td>
                  <td className="px-4 py-3 text-right text-blue-600 font-semibold">
                    Review →
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DeptHeadDashboard;

