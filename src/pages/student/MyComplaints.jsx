import React, { useState, useEffect, useCallback } from 'react';
import { complaintService } from '../../services/api';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import SearchFilter from '../../components/common/SearchFilter';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { categoryLabels } from '../../utils/helpers';
import { Link } from 'react-router-dom';
import { HiPlusCircle } from 'react-icons/hi';

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
  });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    limit: 9,
  });

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 9,
        search: search || undefined,
        status: filters.status || undefined,
        category: filters.category || undefined,
        priority: filters.priority || undefined,
      };

      const res = await complaintService.getMyComplaints(params);
      setComplaints(res.data.data || []);
      setPagination(
        res.data.pagination || { total: res.data.data?.length || 0, pages: 1, limit: 9 }
      );
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleFilterChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setFilters({ status: '', category: '', priority: '' });
    setPage(1);
  };

  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'Submitted', value: 'submitted' },
        { label: 'Assigned', value: 'assigned' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Resolved', value: 'resolved' },
        { label: 'Closed', value: 'closed' },
        { label: 'Escalated', value: 'escalated' },
      ],
    },
    {
      key: 'category',
      label: 'Category',
      options: Object.entries(categoryLabels).map(([k, v]) => ({
        label: v,
        value: k,
      })),
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
      {/* Page Title & New Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Grievances</h2>
          <p className="text-xs text-gray-500">
            Monitor real-time progress and tracking history for your submissions
          </p>
        </div>
        <Link
          to="/student/submit"
          className="btn-primary text-sm flex items-center space-x-2"
        >
          <HiPlusCircle className="w-5 h-5" />
          <span>Lodge Complaint</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <SearchFilter
        searchPlaceholder="Search by tracking ID or keyword..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        filters={filterOptions}
        filterValues={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Complaint Cards Grid */}
      {loading ? (
        <LoadingSpinner message="Fetching grievances..." />
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <EmptyState
            title="No Grievances Found"
            description="No complaints matched your search keywords or filter criteria."
            actionLabel="Reset Search Filters"
            onAction={handleResetFilters}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complaints.map((c) => (
              <ComplaintCard key={c._id} complaint={c} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}
    </div>
  );
};

export default MyComplaints;

