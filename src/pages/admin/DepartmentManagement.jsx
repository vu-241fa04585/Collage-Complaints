import React, { useState, useEffect } from 'react';
import { departmentService, adminService } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { HiOfficeBuilding, HiPlus, HiPencilAlt, HiTrash } from 'react-icons/hi';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    head: '',
    slaSettings: { critical: 4, high: 24, medium: 72, low: 168 },
  });

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const [resDepts, resUsers] = await Promise.all([
        departmentService.getAll(),
        adminService.getUsers({ limit: 100 }),
      ]);
      setDepartments(resDepts.data.data || []);
      setUsers(resUsers.data.data || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenCreate = () => {
    setEditingDeptId(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      head: '',
      slaSettings: { critical: 4, high: 24, medium: 72, low: 168 },
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDeptId(dept._id);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      head: dept.head?._id || dept.head || '',
      slaSettings: dept.slaSettings || { critical: 4, high: 24, medium: 72, low: 168 },
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingDeptId) {
        await departmentService.update(editingDeptId, formData);
        toast.success('Department updated successfully');
      } else {
        await departmentService.create(formData);
        toast.success('Department created successfully');
      }
      setModalOpen(false);
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save department');
    }
  };

  const handleDelete = async (dept) => {
    if (!window.confirm(`Are you sure you want to deactivate department "${dept.name}"?`)) {
      return;
    }
    try {
      await departmentService.delete(dept._id);
      toast.success('Department deactivated');
      fetchDepartments();
    } catch (err) {
      toast.error('Failed to deactivate department');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Department Name & Code',
      render: (val, row) => (
        <div>
          <p className="font-semibold text-gray-900">{val}</p>
          <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            {row.code}
          </span>
        </div>
      ),
    },
    {
      key: 'head',
      label: 'Department Head',
      render: (val) => (
        <span className="text-xs font-semibold text-gray-800">
          {val?.name || 'Unassigned'}
        </span>
      ),
    },
    {
      key: 'totalComplaints',
      label: 'All-Time Tickets',
      render: (val) => (
        <span className="font-bold text-gray-800">{val || 0}</span>
      ),
    },
    {
      key: 'pendingComplaints',
      label: 'Active Queue',
      render: (val) => (
        <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {val || 0} active
        </span>
      ),
    },
    {
      key: 'slaSettings',
      label: 'SLA Matrix (Crit / High / Med / Low)',
      render: (val) => (
        <span className="text-xs text-gray-600 font-mono">
          {val?.critical}h / {val?.high}h / {val?.medium}h / {val?.low}h
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Edit Department"
          >
            <HiPencilAlt className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
            title="Deactivate Department"
          >
            <HiTrash className="w-4 h-4" />
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
            Institutional Departments & Grievance Routing Units
          </h2>
          <p className="text-xs text-gray-500">
            Configure college departments, automated routing categories, and SLA resolution hours
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn-primary text-sm flex items-center space-x-2"
        >
          <HiPlus className="w-5 h-5" />
          <span>Add Department</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={departments}
        loading={loading}
        emptyMessage="No departments configured."
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDeptId ? 'Edit Department' : 'Create New Department'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Department Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Information Technology"
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="label">Short Code <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
                placeholder="e.g., IT"
                className="input-field text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="label">Department Head (HOD)</label>
            <select
              value={formData.head}
              onChange={(e) => setFormData({ ...formData, head: e.target.value })}
              className="input-field text-sm"
            >
              <option value="">Select Faculty / HOD...</option>
              {users
                .filter((u) => u.role === 'department_head' || u.role === 'faculty')
                .map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="label">Jurisdiction & Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Scope of complaints handled by this department..."
              className="input-field text-sm"
            />
          </div>

          {/* SLA Hours Configuration */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Resolution Target SLA Matrix (Hours)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <label className="block text-gray-600 mb-1">Critical (hrs)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.slaSettings.critical}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slaSettings: { ...formData.slaSettings, critical: parseInt(e.target.value) || 4 },
                    })
                  }
                  className="input-field text-xs py-1"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">High (hrs)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.slaSettings.high}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slaSettings: { ...formData.slaSettings, high: parseInt(e.target.value) || 24 },
                    })
                  }
                  className="input-field text-xs py-1"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Medium (hrs)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.slaSettings.medium}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slaSettings: { ...formData.slaSettings, medium: parseInt(e.target.value) || 72 },
                    })
                  }
                  className="input-field text-xs py-1"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Low (hrs)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.slaSettings.low}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slaSettings: { ...formData.slaSettings, low: parseInt(e.target.value) || 168 },
                    })
                  }
                  className="input-field text-xs py-1"
                />
              </div>
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
              Save Department
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DepartmentManagement;

