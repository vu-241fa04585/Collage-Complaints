import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { departmentService } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getInitials } from '../../utils/helpers';

const StaffManagement = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        if (user?.department) {
          const deptId =
            typeof user.department === 'object' ? user.department._id : user.department;
          const res = await departmentService.getStaff(deptId);
          setStaff(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load staff list:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [user]);

  const columns = [
    {
      key: 'name',
      label: 'Staff Member',
      render: (val, row) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
            {getInitials(val)}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{val}</p>
            <span className="text-[11px] text-gray-400">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'employeeId',
      label: 'Employee ID',
      render: (val) => (
        <span className="font-mono text-xs font-semibold text-gray-700">
          {val || '—'}
        </span>
      ),
    },
    {
      key: 'assignedCount',
      label: 'Active Tickets Assigned',
      render: (val) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
          {val || 0} In Progress
        </span>
      ),
    },
    {
      key: 'resolvedCount',
      label: 'Total Resolved',
      render: (val) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
          {val || 0} Resolved
        </span>
      ),
    },
    {
      key: 'phone',
      label: 'Phone Contact',
      render: (val) => <span className="text-xs text-gray-600">{val || '—'}</span>,
    },
  ];

  if (loading) {
    return <LoadingSpinner message="Loading departmental staff directory..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Faculty & Staff Workload Allocation
        </h2>
        <p className="text-xs text-gray-500">
          Monitor assigned ticket distribution across departmental officers to balance redressal velocity
        </p>
      </div>

      <DataTable
        columns={columns}
        data={staff}
        loading={loading}
        emptyMessage="No staff members are presently enrolled under your department."
      />
    </div>
  );
};

export default StaffManagement;

