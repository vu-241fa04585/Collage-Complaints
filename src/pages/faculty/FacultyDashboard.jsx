import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintService } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  HiClipboardList,
  HiClock,
  HiCheckCircle,
  HiExclamationCircle,
  HiArrowRight,
} from 'react-icons/hi';
import { formatDateTime, isOverdue } from '../../utils/helpers';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    overdue: 0,
  });

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        setLoading(true);
        const res = await complaintService.getDepartmentComplaints({ limit: 10 });
        const list = res.data.data || [];
        setComplaints(list);

        const assigned = list.filter((c) => c.status === 'assigned').length;
        const inProgress = list.filter((c) => c.status === 'in_progress').length;
        const resolved = list.filter((c) => c.status === 'resolved' || c.status === 'closed').length;
        const now = new Date();
        const overdue = list.filter(
          (c) => c.status !== 'resolved' && c.status !== 'closed' && isOverdue(c.dueDate)
        ).length;

        setStats({ assigned, inProgress, resolved, overdue });
      } catch (err) {
        console.error('Failed to load faculty dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading departmental complaint queue..." />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl text-white shadow-md border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest block mb-1">
            Faculty & Department Staff Portal • {user?.employeeId || 'Staff Member'}
          </span>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome, {user?.name}
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Review grievance tickets assigned to your department, update investigation status, upload resolution evidence, and meet SLA timelines.
          </p>
        </div>
        <Link
          to="/faculty/department-complaints"
          className="btn-primary text-sm flex items-center space-x-2 whitespace-nowrap shadow-lg shadow-blue-600/30"
        >
          <span>View All Dept Tickets</span>
          <HiArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Acceptance"
          value={stats.assigned}
          icon={HiClipboardList}
          color="blue"
          subtitle="New routed tickets"
        />
        <StatCard
          title="Under Investigation"
          value={stats.inProgress}
          icon={HiClock}
          color="yellow"
          subtitle="In active progress"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          icon={HiCheckCircle}
          color="green"
          subtitle="Redressed successfully"
        />
        <StatCard
          title="SLA Overdue"
          value={stats.overdue}
          icon={HiExclamationCircle}
          color="red"
          subtitle="Escalation risk"
        />
      </div>

      {/* Assigned Tickets Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Department Assigned Complaints
            </h3>
            <p className="text-xs text-gray-500">
              Complaints currently waiting for resolution or action
            </p>
          </div>
          <Link
            to="/faculty/department-complaints"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            View Full Queue →
          </Link>
        </div>

        {complaints.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Pending Grievances"
              description="Your department queue has no active unresolved complaints."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3">Tracking ID</th>
                  <th className="px-5 py-3">Grievance Title</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Target SLA</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {complaints.slice(0, 6).map((c) => {
                  const overdue = isOverdue(c.dueDate) && c.status !== 'resolved' && c.status !== 'closed';
                  return (
                    <tr
                      key={c._id}
                      onClick={() => navigate(`/complaint/${c._id}`)}
                      className={`hover:bg-blue-50/50 cursor-pointer transition ${
                        overdue ? 'bg-red-50/20' : ''
                      }`}
                    >
                      <td className="px-5 py-3.5 font-mono font-bold text-blue-700">
                        {c.trackingId}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-gray-800 max-w-xs truncate">
                        {c.title}
                      </td>
                      <td className="px-5 py-3.5">
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {formatDateTime(c.dueDate)}
                        {overdue && (
                          <span className="block text-[10px] text-red-600 font-bold">
                            OVERDUE
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium text-blue-600 hover:text-blue-800">
                        Investigate →
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;

