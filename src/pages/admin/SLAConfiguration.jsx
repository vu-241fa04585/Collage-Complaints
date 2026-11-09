import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { HiClock, HiPencilAlt, HiShieldCheck } from 'react-icons/hi';

const SLAConfiguration = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal
  const [editModal, setEditModal] = useState({ open: false, dept: null });
  const [slaData, setSlaData] = useState({
    critical: 4,
    high: 24,
    medium: 72,
    low: 168,
  });
  const [saving, setSaving] = useState(false);

  const fetchSLA = async () => {
    try {
      setLoading(true);
      const res = await adminService.getSLAConfig();
      setDepartments(res.data.data || []);
    } catch (err) {
      console.error('Failed to load SLA matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSLA();
  }, []);

  const handleOpenEdit = (dept) => {
    setEditModal({ open: true, dept });
    setSlaData(dept.slaSettings || { critical: 4, high: 24, medium: 72, low: 168 });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await adminService.updateSLAConfig({
        departmentId: editModal.dept._id,
        slaSettings: slaData,
      });
      toast.success(`SLA for ${editModal.dept.name} updated.`);
      setEditModal({ open: false, dept: null });
      fetchSLA();
    } catch (err) {
      toast.error('Failed to update SLA configuration.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Department & Code',
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
      key: 'critical',
      label: 'Critical Priority Target',
      render: (_, row) => (
        <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
          {row.slaSettings?.critical || 4} Hours
        </span>
      ),
    },
    {
      key: 'high',
      label: 'High Priority Target',
      render: (_, row) => (
        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200">
          {row.slaSettings?.high || 24} Hours
        </span>
      ),
    },
    {
      key: 'medium',
      label: 'Medium Priority Target',
      render: (_, row) => (
        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
          {row.slaSettings?.medium || 72} Hours
        </span>
      ),
    },
    {
      key: 'low',
      label: 'Low Priority Target',
      render: (_, row) => (
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
          {row.slaSettings?.low || 168} Hours
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Configure',
      render: (_, row) => (
        <button
          onClick={() => handleOpenEdit(row)}
          className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1"
        >
          <HiPencilAlt className="w-3.5 h-3.5" />
          <span>Adjust SLA</span>
        </button>
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner message="Loading resolution SLA rules..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Resolution SLA Target Matrix & Escalation Rules
        </h2>
        <p className="text-xs text-gray-500">
          Define automated resolution deadlines per priority tier. Exceeded deadlines automatically notify department heads.
        </p>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs space-y-1">
        <p className="font-bold flex items-center space-x-1">
          <HiShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Automated Escalation Policy:</span>
        </p>
        <p className="text-blue-800">
          When a student grievance remains unresolved past the configured target hours, the system raises its escalation level, flags it as OVERDUE, and delivers immediate in-app and email alerts to the Department Head and Chief Proctor.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={departments}
        loading={loading}
        emptyMessage="No departments configured for SLA matrix."
      />

      {/* Adjust SLA Modal */}
      <Modal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, dept: null })}
        title={`Adjust SLA Rules: ${editModal.dept?.name}`}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <p className="text-xs text-gray-500">
            Set maximum allowed resolution duration in hours for each priority tier.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label text-xs">
                Critical Emergency SLA (Hours)
              </label>
              <input
                type="number"
                min="1"
                value={slaData.critical}
                onChange={(e) =>
                  setSlaData({ ...slaData, critical: parseInt(e.target.value) || 1 })
                }
                required
                className="input-field text-sm font-semibold"
              />
              <span className="text-[10px] text-gray-400">e.g., Anti-ragging, fire, power failure</span>
            </div>

            <div>
              <label className="label text-xs">
                High Priority SLA (Hours)
              </label>
              <input
                type="number"
                min="1"
                value={slaData.high}
                onChange={(e) =>
                  setSlaData({ ...slaData, high: parseInt(e.target.value) || 1 })
                }
                required
                className="input-field text-sm font-semibold"
              />
              <span className="text-[10px] text-gray-400">e.g., Wi-Fi lab outage, drinking water</span>
            </div>

            <div>
              <label className="label text-xs">
                Medium Priority SLA (Hours)
              </label>
              <input
                type="number"
                min="1"
                value={slaData.medium}
                onChange={(e) =>
                  setSlaData({ ...slaData, medium: parseInt(e.target.value) || 1 })
                }
                required
                className="input-field text-sm font-semibold"
              />
              <span className="text-[10px] text-gray-400">e.g., Classroom furniture, bus route delay</span>
            </div>

            <div>
              <label className="label text-xs">
                Low Priority SLA (Hours)
              </label>
              <input
                type="number"
                min="1"
                value={slaData.low}
                onChange={(e) =>
                  setSlaData({ ...slaData, low: parseInt(e.target.value) || 1 })
                }
                required
                className="input-field text-sm font-semibold"
              />
              <span className="text-[10px] text-gray-400">e.g., Routine suggestion, library book request</span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={() => setEditModal({ open: false, dept: null })}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-sm px-5"
            >
              {saving ? 'Updating...' : 'Save SLA Rules'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SLAConfiguration;

