import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintService } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  HiPlusCircle,
  HiClipboardList,
  HiCheckCircle,
  HiClock,
  HiExclamationCircle,
} from 'react-icons/hi';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    overdue: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await complaintService.getMyComplaints({ limit: 6 });
        const list = res.data.data || [];
        setComplaints(list);

        const total = res.data.pagination?.total || list.length;
        const resolved = list.filter((c) => c.status === 'resolved' || c.status === 'closed').length;
        const pending = list.filter((c) => c.status !== 'resolved' && c.status !== 'closed').length;
        const now = new Date();
        const overdue = list.filter(
          (c) => c.status !== 'resolved' && c.status !== 'closed' && new Date(c.dueDate) < now
        ).length;

        setStats({ total, pending, resolved, overdue });
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your student grievance dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl text-white shadow-md border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest block mb-1">
            Student Portal • {user?.studentId || 'Enrolled Student'}
          </span>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Track your submitted grievances, monitor automated department assignments, and review SLA resolution milestones.
          </p>
        </div>
        <Link
          to="/student/submit"
          className="btn-primary text-sm flex items-center space-x-2 whitespace-nowrap shadow-lg shadow-blue-600/30"
        >
          <HiPlusCircle className="w-5 h-5" />
          <span>Lodge New Grievance</span>
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Submitted"
          value={stats.total}
          icon={HiClipboardList}
          color="blue"
          subtitle="All grievances logged"
        />
        <StatCard
          title="In Progress / Assigned"
          value={stats.pending}
          icon={HiClock}
          color="yellow"
          subtitle="Currently with staff"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          icon={HiCheckCircle}
          color="green"
          subtitle="Successfully redressed"
        />
        <StatCard
          title="SLA Attention"
          value={stats.overdue}
          icon={HiExclamationCircle}
          color="red"
          subtitle="Escalated / Past target"
        />
      </div>

      {/* Recent Grievances Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Recent Grievances</h3>
            <p className="text-xs text-gray-500">Your latest logged complaints and status</p>
          </div>
          {complaints.length > 0 && (
            <Link
              to="/student/complaints"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              View all ({stats.total}) →
            </Link>
          )}
        </div>

        {complaints.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <EmptyState
              title="No Grievances Submitted Yet"
              description="Have an issue with lab equipment, classroom AC, cafeteria, or Wi-Fi? Submit your first grievance now."
              actionLabel="Lodge Grievance"
              onAction={() => navigate('/student/submit')}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complaints.map((complaint) => (
              <ComplaintCard key={complaint._id} complaint={complaint} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;

