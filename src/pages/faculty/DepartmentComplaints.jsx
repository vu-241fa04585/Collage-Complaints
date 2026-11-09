import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintService } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import SearchFilter from '../../components/common/SearchFilter';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import { formatDateTime, isOverdue } from '../../utils/helpers';

const DepartmentComplaints = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 10 });

  const fetchDepartmentComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: search || undefined,
        status: filters.status || undefined,
        priority: filters.priority || undefined,
      };

      const res = await complaintService.getDepartmentComplaints(params);
      setComplaints(res.data.data || []);
      setPagination(
        res.data.pagination || { total: res.data.data?.length || 0, pages: 1, limit: 10 }
      );
    } catch (err) {
      console.error('Failed to load department complaints:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => {
    fetchDepartmentComplaints();
  }, [fetchDepartmentComplaints]);

  const columns = [
    {
      key: 'trackingId',
      label: 'Tracking ID',
      render: (val) => (
        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {val}
        </span>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      render: (val, row) => (
        <div className="max-w-xs">
          <p className="font-semibold text-gray-800 truncate">{val}</p>
          <span className="text-[11px] text-gray-500">{row.location || 'Campus'}</span>
        </div>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (val) => <PriorityBadge priority={val} />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'dueDate',
      label: 'Resolution SLA',
      render: (val, row) => {
        const overdue = isOverdue(val) && row.status !== 'resolved' && row.status !== 'closed';
        return (
          <div className="text-xs">
            <span className={overdue ? 'text-red-600 font-bold' : 'text-gray-600'}>
              {formatDateTime(val)}
            </span>
            {overdue && (
              <span className="block text-[10px] text-red-500 font-extrabold uppercase">
                Overdue
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/complaint/${row._id}`);
          }}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition"
        >
          Investigate
        </button>
      ),
    },
  ];

  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'Assigned', value: 'assigned' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Resolved', value: 'resolved' },
        { label: 'Closed', value: 'closed' },
        { label: 'Escalated', value: 'escalated' },
      ],
    },
    {
      key: 'priority',
      label: 'Priority',
      options: [
        { label: 'Critical', value: 'critical' },
        { label: 'High', value: 'high' },
        { label: 'Medium', value: 'medium' },
        { label: 'Low', value: 'low' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Department Grievance Queue
        </h2>
        <p className="text-xs text-gray-500">
          All complaints assigned to your department for processing and evidence verification
        </p>
      </div>

      <SearchFilter
        searchPlaceholder="Search complaints..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        filters={filterOptions}
        filterValues={filters}
        onFilterChange={(key, val) => {
          setFilters((prev) => ({ ...prev, [key]: val }));
          setPage(1);
        }}
        onReset={() => {
          setSearch('');
          setFilters({ status: '', priority: '' });
          setPage(1);
        }}
      />

      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={complaints}
          loading={loading}
          emptyMessage="No complaints assigned to this department match the criteria."
          onRowClick={(row) => navigate(`/complaint/${row._id}`)}
        />

        <Pagination
          currentPage={page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>
    </div>
  );
};

export default DepartmentComplaints;

