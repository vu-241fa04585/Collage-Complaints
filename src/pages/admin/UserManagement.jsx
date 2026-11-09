import React, { useState, useEffect, useCallback } from 'react';
import { adminService, departmentService } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import SearchFilter from '../../components/common/SearchFilter';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { roleLabels, getInitials } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { HiUserAdd, HiTrash, HiPencilAlt, HiCheck, HiBan } from 'react-icons/hi';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 12 });

  // Create / Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: '',
    studentId: '',
    employeeId: '',
    phone: '',
  });

  // Confirm delete / toggle modal
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    userId: null,
    action: 'toggle',
    title: '',
    message: '',
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers({
        page,
        limit: 12,
        search: search || undefined,
        role: roleFilter || undefined,
      });
      setUsers(res.data.data || []);
      setPagination(
        res.data.pagination || { total: res.data.data?.length || 0, pages: 1, limit: 12 }
      );
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
    departmentService.getAll().then((res) => {
      setDepartments(res.data.data || []);
    }).catch(() => {});
  }, [fetchUsers]);

  const handleOpenCreate = () => {
    setEditingUserId(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'student',
      department: '',
      studentId: '',
      employeeId: '',
      phone: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUserId(user._id);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Leave blank unless changing
      role: user.role,
      department: user.department?._id || user.department || '',
      studentId: user.studentId || '',
      employeeId: user.employeeId || '',
      phone: user.phone || '',
    });
    setModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (editingUserId) {
        await adminService.updateUser(editingUserId, formData);
        toast.success('User updated successfully');
      } else {
        if (!formData.password) {
          toast.error('Password is required for new accounts');
          return;
        }
        await adminService.createUser(formData);
        toast.success('User created successfully');
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save user account');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await adminService.toggleUserStatus(user._id);
      toast.success(`User account marked as ${user.isActive ? 'Inactive' : 'Active'}`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'User Name',
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
      key: 'role',
      label: 'Institutional Role',
      render: (val) => (
        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          {roleLabels[val] || val}
        </span>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      render: (val) => (
        <span className="text-xs text-gray-600 font-medium">
          {val?.name || 'Central / None'}
        </span>
      ),
    },
    {
      key: 'idNumber',
      label: 'ID Number',
      render: (_, row) => (
        <span className="text-xs font-mono text-gray-600">
          {row.studentId || row.employeeId || '—'}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (val) => (
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            val
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {val ? 'Active' : 'Deactivated'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Edit User"
          >
            <HiPencilAlt className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleStatus(row)}
            className={`p-1.5 rounded-lg transition ${
              row.isActive
                ? 'text-amber-600 hover:bg-amber-50'
                : 'text-emerald-600 hover:bg-emerald-50'
            }`}
            title={row.isActive ? 'Deactivate Account' : 'Activate Account'}
          >
            {row.isActive ? <HiBan className="w-4 h-4" /> : <HiCheck className="w-4 h-4" />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Institutional User Management
          </h2>
          <p className="text-xs text-gray-500">
            Provision, inspect, and configure access for Students, Faculty, HODs, and Administrators
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn-primary text-sm flex items-center space-x-2"
        >
          <HiUserAdd className="w-5 h-5" />
          <span>Provision New User</span>
        </button>
      </div>

      <SearchFilter
        searchPlaceholder="Search users by name, email, or student ID..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        filters={[
          {
            key: 'role',
            label: 'Role',
            options: Object.entries(roleLabels).map(([k, v]) => ({
              label: v,
              value: k,
            })),
          },
        ]}
        filterValues={{ role: roleFilter }}
        onFilterChange={(_, val) => {
          setRoleFilter(val);
          setPage(1);
        }}
        onReset={() => {
          setSearch('');
          setRoleFilter('');
          setPage(1);
        }}
      />

      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          emptyMessage="No user profiles matching query."
        />

        <Pagination
          currentPage={page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>

      {/* User Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUserId ? 'Edit Institutional User' : 'Provision New Institutional User'}
        size="md"
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div>
            <label className="label">Full Legal Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="input-field text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Institutional Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="label">
                {editingUserId ? 'New Password (Optional)' : 'Password *'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUserId}
                placeholder="••••••••"
                className="input-field text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Role Assignment <span className="text-red-500">*</span></label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="input-field text-sm"
              >
                {Object.entries(roleLabels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="input-field text-sm"
              >
                <option value="">None / General</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Student ID / Employee ID</label>
              <input
                type="text"
                value={formData.role === 'student' ? formData.studentId : formData.employeeId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [formData.role === 'student' ? 'studentId' : 'employeeId']: e.target.value,
                  })
                }
                placeholder={formData.role === 'student' ? 'STU-2026-001' : 'EMP-IT-001'}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="label">Phone Contact</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="input-field text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary text-sm px-5">
              {editingUserId ? 'Save User Profile' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;

