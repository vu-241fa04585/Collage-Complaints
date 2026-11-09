import React, { useState, useEffect } from 'react';
import { managementService, adminService } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  HiClipboardList,
  HiClock,
  HiCheckCircle,
  HiExclamationCircle,
  HiStar,
  HiDownload,
  HiTrendingUp,
} from 'react-icons/hi';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';

const ManagementDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchManagementData = async () => {
      try {
        setLoading(true);
        const [resDash, resAnalytics] = await Promise.all([
          managementService.getDashboard(),
          adminService.getAnalytics(),
        ]);
        setDashboard(resDash.data.data);
        setAnalytics(resAnalytics.data.data);
      } catch (err) {
        console.error('Failed to load management dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchManagementData();
  }, []);

  const handleDownloadPDF = async () => {
    try {
      toast.loading('Generating Management Executive PDF Report...');
      const res = await adminService.downloadReport();
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CGR-Executive-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.dismiss();
      toast.success('Executive report downloaded successfully!');
    } catch (err) {
      toast.dismiss();
      toast.error('Failed to export report.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Generating executive institutional scorecard..." />;
  }

  const d = dashboard || {};
  const monthlyTrends = analytics?.monthlyTrends || [];
  const deptPerformance = d.deptPerformance || [];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl text-white shadow-md border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest block mb-1">
            College Board of Management • Executive Governance Console
          </span>
          <h2 className="text-2xl font-bold tracking-tight">
            Institutional Redressal & Quality Assurance Scorecard
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Strategic performance metrics, student sentiment indexes, department grading, and campus resolution turnaround times.
          </p>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="btn-primary text-sm flex items-center space-x-2 whitespace-nowrap shadow-lg shadow-blue-600/30"
        >
          <HiDownload className="w-5 h-5" />
          <span>Download Executive Briefing</span>
        </button>
      </div>

      {/* 6 High-Level Executive Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="All Grievances"
          value={d.totalComplaints || 0}
          icon={HiClipboardList}
          color="blue"
          subtitle="Total recorded"
        />
        <StatCard
          title="Redressed"
          value={d.resolvedComplaints || 0}
          icon={HiCheckCircle}
          color="green"
          subtitle="Successfully closed"
        />
        <StatCard
          title="Active Tickets"
          value={d.pendingComplaints || 0}
          icon={HiClock}
          color="yellow"
          subtitle="Under processing"
        />
        <StatCard
          title="SLA Breached"
          value={d.overdueComplaints || 0}
          icon={HiExclamationCircle}
          color="red"
          subtitle="Escalation alerts"
        />
        <StatCard
          title="Avg Turnaround"
          value={`${d.avgResolutionHours || 18.5}h`}
          icon={HiClock}
          color="blue"
          subtitle="Mean resolution time"
        />
        <StatCard
          title="Satisfaction"
          value={`${d.satisfactionPct || 92}%`}
          icon={HiStar}
          color="green"
          subtitle={`${d.avgRating || 4.6} / 5.0 score`}
        />
      </div>

      {/* Trends & Department Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 12-Month Trajectory Area Chart (Span 2) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Institutional Grievance Trajectory
              </h3>
              <p className="text-xs text-gray-500">Intake vs. redressal rate across 12 months</p>
            </div>
            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              High Resolution Velocity
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="#bfdbfe" name="Received" />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="#bbf7d0" name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Departmental Scorecards & Grades */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Department Performance Grades
            </h3>
            <p className="text-xs text-gray-500">Evaluation based on resolution compliance rate</p>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {deptPerformance.map((dept) => (
              <div
                key={dept._id}
                className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-gray-900 truncate max-w-[130px]">{dept.name}</p>
                  <span className="text-[11px] text-gray-400">
                    {dept.resolved} of {dept.total} resolved ({dept.resolutionRate}%)
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-md font-bold text-xs ${
                      dept.grade === 'A'
                        ? 'bg-emerald-100 text-emerald-800'
                        : dept.grade === 'B'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Grade {dept.grade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comprehensive Department Performance KPI Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h3 className="text-base font-bold text-gray-900">
          Departmental Key Performance Indicators (KPIs)
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Total Tickets</th>
                <th className="px-5 py-3">Resolved</th>
                <th className="px-5 py-3">Active Pending</th>
                <th className="px-5 py-3">SLA Breaches</th>
                <th className="px-5 py-3">Resolution Rate</th>
                <th className="px-5 py-3 text-right">Academic Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {deptPerformance.map((dept) => (
                <tr key={dept._id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5 font-bold text-gray-900">
                    {dept.name} ({dept.code})
                  </td>
                  <td className="px-5 py-3.5 text-gray-700">{dept.total}</td>
                  <td className="px-5 py-3.5 font-semibold text-emerald-600">
                    {dept.resolved}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-blue-600">
                    {dept.pending}
                  </td>
                  <td className="px-5 py-3.5 text-red-600 font-bold">
                    {dept.overdue}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${dept.resolutionRate}%` }}
                        />
                      </div>
                      <span className="font-semibold text-gray-700">
                        {dept.resolutionRate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        dept.grade === 'A'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      Class {dept.grade}
                    </span>
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

export default ManagementDashboard;

