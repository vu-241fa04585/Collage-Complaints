import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintService } from '../../services/api';
import FileUpload from '../common/FileUpload';
import Modal from '../common/Modal';
import { categoryLabels } from '../../utils/helpers';
import toast from 'react-hot-toast';
import {
  HiCheckCircle,
  HiShieldCheck,
  HiExclamationCircle,
  HiClipboardCopy,
} from 'react-icons/hi';

const ComplaintForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'internet_wifi',
    subcategory: '',
    priority: 'medium',
    location: '',
    description: '',
    isConfidential: false,
  });

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState({
    open: false,
    trackingId: '',
    complaintId: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in both title and detailed grievance description.');
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('category', formData.category);
      data.append('subcategory', formData.subcategory.trim());
      data.append('priority', formData.priority);
      data.append('location', formData.location.trim());
      data.append('description', formData.description.trim());
      data.append('isConfidential', formData.isConfidential);

      files.forEach((file) => {
        data.append('attachments', file);
      });

      const res = await complaintService.create(data);
      const createdComplaint = res.data.data;

      setSuccessModal({
        open: true,
        trackingId: createdComplaint.trackingId,
        complaintId: createdComplaint._id,
      });

      toast.success(`Complaint registered: ${createdComplaint.trackingId}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to lodge complaint.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTrackingId = () => {
    navigator.clipboard.writeText(successModal.trackingId);
    toast.success('Tracking ID copied to clipboard!');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 max-w-4xl mx-auto">
      <div className="mb-6 pb-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">
          Institutional Grievance Registration
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Submit your complaint with evidence. Our smart automated routing engine assigns it directly to the responsible college department.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="label">
            Grievance Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Projector display flickering in Seminar Hall B"
            required
            className="input-field"
          />
        </div>

        {/* Category & Subcategory */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-field"
            >
              {Object.entries(categoryLabels).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Subcategory / Specific Equipment</label>
            <input
              type="text"
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              placeholder="e.g., Access Point 4B, Food Hygiene, Bus 12"
              className="input-field"
            />
          </div>
        </div>

        {/* Priority & Campus Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">
              Priority Urgency <span className="text-red-500">*</span>
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="input-field"
            >
              <option value="critical">Critical (Emergency / Immediate 4hr SLA)</option>
              <option value="high">High (Urgent Campus Service 24hr SLA)</option>
              <option value="medium">Medium (Standard Issue 3 Days SLA)</option>
              <option value="low">Low (Routine Observation 7 Days SLA)</option>
            </select>
          </div>

          <div>
            <label className="label">Specific Campus Location / Room</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Block 3, 2nd Floor, Room 204"
              className="input-field"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="label mb-0">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-gray-400">
              {formData.description.length} characters
            </span>
          </div>
          <textarea
            name="description"
            rows="5"
            value={formData.description}
            onChange={handleChange}
            placeholder="Please detail the problem clearly including date, time, affected students, and any prior communication..."
            required
            className="input-field resize-y"
          />
        </div>

        {/* Confidential Grievance Option */}
        <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/70 flex items-start space-x-3">
          <input
            type="checkbox"
            id="isConfidential"
            name="isConfidential"
            checked={formData.isConfidential}
            onChange={handleChange}
            className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="isConfidential" className="text-xs text-gray-700 cursor-pointer select-none">
            <span className="font-semibold text-amber-900 block text-sm">
              Confidential Complaint (Identity Protection)
            </span>
            Check this if your grievance involves sensitive personal safety, ragging, or faculty misconduct. Your student identity will be protected and disclosed strictly to authorized grievance inquiry officers.
          </label>
        </div>

        {/* File Attachments */}
        <div>
          <label className="label">Supporting Evidence / Photographs / Documents</label>
          <FileUpload files={files} setFiles={setFiles} maxFiles={5} />
        </div>

        {/* Form Action Buttons */}
        <div className="pt-4 flex items-center justify-end space-x-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary text-sm flex items-center space-x-2"
          >
            {loading ? (
              <span>Submitting Grievance...</span>
            ) : (
              <>
                <HiShieldCheck className="w-5 h-5" />
                <span>Submit Complaint</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      <Modal
        isOpen={successModal.open}
        onClose={() => navigate(`/complaint/${successModal.complaintId}`)}
        title="Grievance Registered Successfully"
        size="md"
      >
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <HiCheckCircle className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Your Complaint Has Been Logged
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Your grievance has been validated and auto-routed to the department staff. You can track progress anytime with your tracking ID.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="text-left">
              <span className="text-[11px] text-gray-400 font-semibold uppercase block">
                Official Tracking ID
              </span>
              <span className="text-base font-mono font-bold text-blue-700">
                {successModal.trackingId}
              </span>
            </div>
            <button
              onClick={handleCopyTrackingId}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition"
              title="Copy Tracking ID"
            >
              <HiClipboardCopy className="w-5 h-5" />
            </button>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => {
                setSuccessModal({ open: false, trackingId: '', complaintId: '' });
                setFormData({
                  title: '',
                  category: 'internet_wifi',
                  subcategory: '',
                  priority: 'medium',
                  location: '',
                  description: '',
                  isConfidential: false,
                });
                setFiles([]);
              }}
              className="btn-secondary text-sm"
            >
              Submit Another Grievance
            </button>
            <button
              onClick={() => navigate(`/complaint/${successModal.complaintId}`)}
              className="btn-primary text-sm"
            >
              View Complaint Details
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ComplaintForm;

