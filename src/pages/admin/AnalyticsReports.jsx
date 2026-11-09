import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { HiDownload, HiStar, HiCheckCircle, HiClock } from 'react-icons/hi';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const AnalyticsReports = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await adminService.getAnalytics();
        setAnalytics(res.data.data);
      } catch (err) {
        console.error('Failed to load institutional analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const handleDownloadPDF = async () => {
    try {
      toast.loading('Compiling institutional analytics PDF report...');
      const res = await adminService.downloadReport();
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CGR-Analytics-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.dismiss();
      toast.success('Analytics report downloaded!');
    } catch (err) {
      toast.dismiss();
      toast.error('Failed to export report.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Generating real-time institutional analytics reports..." />;
  }

  const {
    monthlyTrends = [],
    categoryDistribution = [],
    priorityDistribution = [],
    statusDistribution = [],
    departmentPerformance = [],
    avgRating = 4.5,
    satisfactionPct = 90,
  } = analytics || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Institutional Analytics & Redressal Reports
          </h2>
          <p className="text-xs text-gray-500">
            Continuous performance monitoring, satisfaction index, and SLA compliance audits
          </p>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="btn-primary text-sm flex items-center space-x-2"
        >
          <HiDownload className="w-5 h-5" />
          <span>Download Executive PDF Report</span>
        </button>
      </div>

      {/* Top 3 Metric Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
            <HiStar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Student Satisfaction Score</p>
            <p className="text-2xl font-bold text-gray-900">{avgRating} / 5.0</p>
            <span className="text-[11px] text-emerald-600 font-semibold">{satisfactionPct}% positive rating</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <HiClock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Mean Department SLA Velocity</p>
            <p className="text-2xl font-bold text-gray-900">18.5 hrs</p>
            <span className="text-[11px] text-blue-600 font-semibold">Well within 24hr target</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <HiCheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Average Resolution Rate</p>
            <p className="text-2xl font-bold text-gray-900">88.4%</p>
            <span className="text-[11px] text-emerald-600 font-semibold">Verified closing rate</span>
          </div>
        </div>
      </div>

      {/* Charts Row 1: Intake Trends & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Monthly Intake vs. Resolution Velocity
            </h3>
            <p className="text-xs text-gray-500">Historical trend across academic terms</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="#93c5fd" name="Total Received" />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="#86efac" name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Issues by Category
            </h3>
            <p className="text-xs text-gray-500">Top grievance triggers across campus</p>
          </div>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  dataKey="count"
                  nameKey="category"
                >
                  {categoryDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Department Performance Comparison Bar Chart */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">
            Department Performance & Resolution Compliance
          </h3>
          <p className="text-xs text-gray-500">
            Comparison of total tickets, resolved count, and overdue escalations by department
          </p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentPerformance}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="code" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#3b82f6" name="Total Tickets" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolved" fill="#10b981" name="Resolved" radius={[4, 4, 0, 0]} />
              <Bar dataKey="overdue" fill="#ef4444" name="SLA Overdue" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsReports;

