import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService, departmentService, complaintService } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import SearchFilter from '../../components/common/SearchFilter';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import Modal from '../../components/common/Modal';
import { formatDateTime, isOverdue, categoryLabels } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { HiUserAdd, HiOfficeBuilding, HiDownload } from 'react-icons/hi';

const AllComplaints = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    department: '',
  });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 10 });

  // Assign Modal
  const [assignModal, setAssignModal] = useState({
    open: false,
    complaintId: null,
    trackingId: '',
  });
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [staffOptions, setStaffOptions] = useState([]);
  const [assignComments, setAssignComments] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: search || undefined,
        status: filters.status || undefined,
        category: filters.category || undefined,
        priority: filters.priority || undefined,
        department: filters.department || undefined,
      };

      const res = await adminService.getAllComplaints(params);
      setComplaints(res.data.data || []);
      setPagination(
        res.data.pagination || { total: res.data.data?.length || 0, pages: 1, limit: 10 }
      );
    } catch (err) {
      console.error('Failed to load all complaints:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => {
    fetchComplaints();
    departmentService.getAll().then((res) => {
      setDepartments(res.data.data || []);
    }).catch(() => {});
  }, [fetchComplaints]);

  // When selected department changes in assign modal, load that dept's staff
  useEffect(() => {
    if (selectedDept) {
      departmentService.getStaff(selectedDept).then((res) => {
        setStaffOptions(res.data.data || []);
      }).catch(() => setStaffOptions([]));
    } else {
      setStaffOptions([]);
    }
  }, [selectedDept]);

  const handleOpenAssignModal = (complaint, e) => {
    e.stopPropagation();
    setAssignModal({
      open: true,
      complaintId: complaint._id,
      trackingId: complaint.trackingId,
    });
    setSelectedDept(complaint.assignedDepartment?._id || '');
    setSelectedStaff(complaint.assignedStaff?._id || '');
    setAssignComments('');
  };

  const handleSaveAssign = async (e) => {
    e.preventDefault();
    if (!selectedDept) {
      toast.error('Please select an assigned department.');
      return;
    }
    try {
      setAssignLoading(true);
      await adminService.assignComplaint(assignModal.complaintId, {
        departmentId: selectedDept,
        staffId: selectedStaff || undefined,
        comments: assignComments || 'Manual administrative routing override',
      });
      toast.success(`Complaint ${assignModal.trackingId} reassigned successfully.`);
      setAssignModal({ open: false, complaintId: null, trackingId: '' });
      fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reassign complaint.');
    } finally {
      setAssignLoading(false);
    }
  };

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
      label: 'Title & Category',
      render: (val, row) => (
        <div className="max-w-xs">
          <p className="font-semibold text-gray-800 truncate">{val}</p>
          <span className="text-[11px] text-gray-500">
            {categoryLabels[row.category] || row.category}
          </span>
        </div>
      ),
    },
    {
      key: 'student',
      label: 'Student / Complainant',
      render: (val, row) => (
        <div className="text-xs">
          <p className="font-medium text-gray-800">
            {row.isConfidential ? 'Protected Identity' : val?.name || 'Student'}
          </p>
          <span className="text-[11px] text-gray-400">
            {row.isConfidential ? 'Confidential' : val?.studentId || val?.email}
          </span>
        </div>
      ),
    },
    {
      key: 'assignedDepartment',
      label: 'Assigned Department',
      render: (val) => (
        <span className="text-xs font-semibold text-gray-700">
          {val?.name || 'Unassigned'}
        </span>
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
      label: 'SLA Target',
      render: (val, row) => {
        const overdue = isOverdue(val) && row.status !== 'resolved' && row.status !== 'closed';
        return (
          <div className="text-xs">
            <span className={overdue ? 'text-red-600 font-bold' : 'text-gray-600'}>
              {formatDateTime(val)}
            </span>
            {overdue && (
              <span className="block text-[10px] text-red-500 font-bold uppercase">
                Overdue
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'Controls',
      render: (_, row) => (
        <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => handleOpenAssignModal(row, e)}
            className="text-xs text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-md font-semibold transition flex items-center space-x-1"
            title="Override Assignment"
          >
            <HiUserAdd className="w-3.5 h-3.5" />
            <span>Route</span>
          </button>
          <button
            onClick={() => navigate(`/complaint/${row._id}`)}
            className="text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-md font-semibold transition"
          >
            Inspect
          </button>
        </div>
      ),
    },
  ];

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
      key: 'priority',
      label: 'Priority',
      options: [
        { label: 'Critical', value: 'critical' },
        { label: 'High', value: 'high' },
        { label: 'Medium', value: 'medium' },
        { label: 'Low', value: 'low' },
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
      key: 'department',
      label: 'Department',
      options: departments.map((d) => ({
        label: d.name,
        value: d._id,
      })),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Central Institutional Complaints Directory
          </h2>
          <p className="text-xs text-gray-500">
            Search, filter, inspect, and manually reassign grievances across all departments
          </p>
        </div>
      </div>

      <SearchFilter
        searchPlaceholder="Search by tracking ID, student name, keyword..."
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
          setFilters({ status: '', category: '', priority: '', department: '' });
          setPage(1);
        }}
      />

      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={complaints}
          loading={loading}
          emptyMessage="No institutional grievance records match your query."
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

      {/* Manual Assign / Reassign Modal */}
      <Modal
        isOpen={assignModal.open}
        onClose={() => setAssignModal({ open: false, complaintId: null, trackingId: '' })}
        title={`Reassign Grievance: ${assignModal.trackingId}`}
        size="md"
      >
        <form onSubmit={handleSaveAssign} className="space-y-4">
          <div>
            <label className="label">Responsible Department <span className="text-red-500">*</span></label>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setSelectedStaff('');
              }}
              required
              className="input-field text-sm"
            >
              <option value="">Select Department...</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Designated Staff Officer (Optional)</label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="input-field text-sm"
              disabled={!selectedDept}
            >
              <option value="">Auto-Assign to Department Head / General Queue</option>
              {staffOptions.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.employeeId || 'Faculty'}) - {s.assignedCount || 0} active
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Administrative Reassignment Note</label>
            <textarea
              rows="3"
              value={assignComments}
              onChange={(e) => setAssignComments(e.target.value)}
              placeholder="Reason for manual reassignment or administrative intervention..."
              className="input-field text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={() =>
                setAssignModal({ open: false, complaintId: null, trackingId: '' })
              }
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assignLoading}
              className="btn-primary text-sm px-5"
            >
              {assignLoading ? 'Saving...' : 'Update Assignment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AllComplaints;

