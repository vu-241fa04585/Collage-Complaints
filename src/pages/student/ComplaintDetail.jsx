import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintService, departmentService } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import ComplaintTimeline from '../../components/complaints/ComplaintTimeline';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FileUpload from '../../components/common/FileUpload';
import {
  categoryLabels,
  categoryIcons,
  formatDateTime,
  timeAgo,
  isOverdue,
  hoursRemaining,
  getAssetUrl,
} from '../../utils/helpers';
import toast from 'react-hot-toast';
import {
  HiOfficeBuilding,
  HiLocationMarker,
  HiClock,
  HiShieldCheck,
  HiUser,
  HiLockClosed,
  HiChatAlt2,
  HiCheckCircle,
  HiRefresh,
  HiArrowRight,
  HiDownload,
  HiStar,
  HiExclamationCircle,
} from 'react-icons/hi';

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Action States
  const [actionLoading, setActionLoading] = useState(false);
  const [resolveModal, setResolveModal] = useState(false);
  const [resolveComments, setResolveComments] = useState('');
  const [resolveEvidence, setResolveEvidence] = useState([]);

  const [feedbackModal, setFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState({ rating: 5, comments: '' });

  const [reopenModal, setReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');

  const [forwardModal, setForwardModal] = useState(false);
  const [forwardDept, setForwardDept] = useState('');
  const [forwardReason, setForwardReason] = useState('');

  const [newComment, setNewComment] = useState('');

  const fetchComplaintData = useCallback(async () => {
    try {
      setLoading(true);
      const [resComp, resHist] = await Promise.all([
        complaintService.getById(id),
        complaintService.getHistory(id),
      ]);
      setComplaint(resComp.data.data);
      setHistory(resHist.data.data || []);
    } catch (err) {
      console.error('Failed to load complaint:', err);
      toast.error('Unable to fetch complaint details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchComplaintData();
    departmentService.getAll().then((res) => {
      setDepartments(res.data.data || []);
    }).catch(() => {});
  }, [fetchComplaintData]);

  // Action: Accept complaint (Staff)
  const handleAccept = async () => {
    try {
      setActionLoading(true);
      await complaintService.acceptComplaint(complaint._id);
      toast.success('Complaint accepted and marked In Progress.');
      fetchComplaintData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to accept complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Resolve complaint (Staff)
  const handleResolve = async (e) => {
    e.preventDefault();
    if (!resolveComments.trim()) {
      toast.error('Please enter resolution summary.');
      return;
    }
    try {
      setActionLoading(true);
      const formData = new FormData();
      formData.append('comments', resolveComments.trim());
      resolveEvidence.forEach((file) => {
        formData.append('evidence', file);
      });

      await complaintService.resolveComplaint(complaint._id, formData);
      toast.success('Complaint marked as Resolved.');
      setResolveModal(false);
      fetchComplaintData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to resolve complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Forward complaint
  const handleForward = async (e) => {
    e.preventDefault();
    if (!forwardDept) {
      toast.error('Please select destination department.');
      return;
    }
    try {
      setActionLoading(true);
      await complaintService.forwardComplaint(complaint._id, {
        departmentId: forwardDept,
        reason: forwardReason,
      });
      toast.success('Complaint forwarded successfully.');
      setForwardModal(false);
      fetchComplaintData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to forward complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Submit Feedback (Student)
  const handleFeedback = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await complaintService.submitFeedback(complaint._id, feedbackData);
      toast.success('Thank you for rating our resolution service!');
      setFeedbackModal(false);
      fetchComplaintData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit feedback.');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Reopen Grievance (Student)
  const handleReopen = async (e) => {
    e.preventDefault();
    if (!reopenReason.trim()) {
      toast.error('Please state reason for reopening.');
      return;
    }
    try {
      setActionLoading(true);
      await complaintService.reopen(complaint._id, { reason: reopenReason });
      toast.success('Complaint has been reopened for investigation.');
      setReopenModal(false);
      fetchComplaintData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reopen complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Add Progress Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      setActionLoading(true);
      await complaintService.addComment(complaint._id, { comments: newComment });
      setNewComment('');
      toast.success('Progress remark posted.');
      fetchComplaintData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to post comment.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving complaint details and audit history..." />;
  }

  if (!complaint) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">Complaint record not found.</p>
        <button onClick={() => navigate(-1)} className="btn-secondary text-sm mt-4">
          Go Back
        </button>
      </div>
    );
  }

  const isStaffOrAdmin =
    user?.role === 'admin' ||
    user?.role === 'department_head' ||
    user?.role === 'faculty';

  const isStudentOwner = user?._id === complaint.student?._id;
  const isBreached =
    complaint.status !== 'resolved' &&
    complaint.status !== 'closed' &&
    isOverdue(complaint.dueDate);

  const remaining = hoursRemaining(complaint.dueDate);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1"
        >
          <span>← Back to Complaints Queue</span>
        </button>
        <span className="text-xs text-gray-400">
          Created on {formatDateTime(complaint.createdAt)}
        </span>
      </div>

      {/* SLA Breach Alert Banner */}
      {isBreached && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-800 text-sm">
          <div className="flex items-center space-x-2">
            <HiExclamationCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>
              <strong>Resolution SLA Overdue:</strong> Target deadline has lapsed. Automated escalation rules apply.
            </span>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider bg-red-100 px-2 py-0.5 rounded text-red-700">
            Escalation Level {complaint.escalationLevel || 1}
          </span>
        </div>
      )}

      {/* Main Grievance Details Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Header: Tracking ID, Category, Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-md border border-blue-200">
                {complaint.trackingId}
              </span>
              <span className="text-xs font-semibold text-gray-600 flex items-center space-x-1 bg-gray-100 px-2.5 py-1 rounded-md">
                <span>{categoryIcons[complaint.category] || '📋'}</span>
                <span>{categoryLabels[complaint.category] || complaint.category}</span>
              </span>
              {complaint.isConfidential && (
                <span className="text-amber-700 bg-amber-50 text-xs font-semibold px-2 py-1 rounded-md border border-amber-200 flex items-center space-x-1">
                  <HiLockClosed className="w-3.5 h-3.5" />
                  <span>Confidential</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 leading-snug">
              {complaint.title}
            </h1>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
          <div>
            <span className="text-gray-400 font-medium block">Complainant</span>
            <span className="font-semibold text-gray-800 flex items-center space-x-1 mt-0.5">
              <HiUser className="text-gray-400" />
              <span>
                {complaint.isConfidential && !isStaffOrAdmin
                  ? 'Anonymous / Protected'
                  : complaint.student?.name || 'Registered Student'}
              </span>
            </span>
            {complaint.student?.studentId && !complaint.isConfidential && (
              <span className="text-gray-400 text-[11px] block">
                ID: {complaint.student.studentId}
              </span>
            )}
          </div>

          <div>
            <span className="text-gray-400 font-medium block">Assigned Department</span>
            <span className="font-semibold text-gray-800 flex items-center space-x-1 mt-0.5">
              <HiOfficeBuilding className="text-gray-400" />
              <span>{complaint.assignedDepartment?.name || 'Pending Routing'}</span>
            </span>
          </div>

          <div>
            <span className="text-gray-400 font-medium block">Campus Location</span>
            <span className="font-semibold text-gray-800 flex items-center space-x-1 mt-0.5">
              <HiLocationMarker className="text-gray-400" />
              <span>{complaint.location || 'Not Specified'}</span>
            </span>
          </div>

          <div>
            <span className="text-gray-400 font-medium block">Target SLA Deadline</span>
            <span
              className={`font-semibold flex items-center space-x-1 mt-0.5 ${
                isBreached ? 'text-red-600' : 'text-gray-800'
              }`}
            >
              <HiClock className={isBreached ? 'text-red-500' : 'text-gray-400'} />
              <span>{formatDateTime(complaint.dueDate)}</span>
            </span>
            {!isBreached && remaining !== null && (
              <span className="text-emerald-600 text-[11px] block">
                {remaining > 0 ? `${remaining} hrs remaining` : 'Due soon'}
              </span>
            )}
          </div>
        </div>

        {/* Grievance Description */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
            Grievance Description
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-white p-4 rounded-xl border border-gray-100">
            {complaint.description}
          </p>
        </div>

        {/* Uploaded Attachments */}
        {complaint.attachments && complaint.attachments.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Supporting Attachments ({complaint.attachments.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {complaint.attachments.map((file, idx) => (
                <a
                  key={idx}
                  href={getAssetUrl(file.url || file.path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center space-x-1.5 transition"
                >
                  <HiDownload />
                  <span className="truncate max-w-[200px]">{file.originalName || file.filename}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Resolution Notes Section (if resolved) */}
        {complaint.resolutionComments && (
          <div className="p-5 bg-emerald-50/60 rounded-xl border border-emerald-200">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm mb-1">
              <HiCheckCircle className="w-5 h-5 text-emerald-600" />
              <span>Official Redressal & Resolution Notes</span>
            </div>
            <p className="text-sm text-gray-800 mt-2 leading-relaxed">
              {complaint.resolutionComments}
            </p>
            {complaint.resolvedDate && (
              <p className="text-xs text-emerald-700 mt-2">
                Resolved on {formatDateTime(complaint.resolvedDate)}
              </p>
            )}
          </div>
        )}

        {/* Existing Feedback (if submitted) */}
        {complaint.feedback && (
          <div className="p-5 bg-blue-50/60 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-blue-900">Student Feedback</span>
              <div className="flex items-center text-amber-500">
                {Array.from({ length: 5 }, (_, i) => (
                  <HiStar
                    key={i}
                    className={`w-4 h-4 ${
                      i < complaint.feedback.rating ? 'fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-700">{complaint.feedback.comments}</p>
          </div>
        )}

        {/* Action Controls Toolbar */}
        <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Staff / HOD Accept Button */}
            {isStaffOrAdmin && complaint.status === 'assigned' && (
              <button
                onClick={handleAccept}
                disabled={actionLoading}
                className="btn-primary text-xs py-2 px-3.5 flex items-center space-x-1"
              >
                <HiCheckCircle className="w-4 h-4" />
                <span>Accept Grievance</span>
              </button>
            )}

            {/* Staff / HOD Resolve Button */}
            {isStaffOrAdmin &&
              (complaint.status === 'in_progress' || complaint.status === 'assigned') && (
                <button
                  onClick={() => setResolveModal(true)}
                  disabled={actionLoading}
                  className="btn-success text-xs py-2 px-3.5 flex items-center space-x-1"
                >
                  <HiCheckCircle className="w-4 h-4" />
                  <span>Mark Resolved</span>
                </button>
              )}

            {/* Staff Forward Button */}
            {isStaffOrAdmin && complaint.status !== 'resolved' && complaint.status !== 'closed' && (
              <button
                onClick={() => setForwardModal(true)}
                disabled={actionLoading}
                className="btn-secondary text-xs py-2 px-3.5 flex items-center space-x-1"
              >
                <HiArrowRight className="w-4 h-4" />
                <span>Forward Department</span>
              </button>
            )}

            {/* Student Feedback Button */}
            {isStudentOwner && complaint.status === 'resolved' && !complaint.feedback && (
              <button
                onClick={() => setFeedbackModal(true)}
                className="btn-primary text-xs py-2 px-3.5 flex items-center space-x-1"
              >
                <HiStar className="w-4 h-4 text-amber-300" />
                <span>Submit Satisfaction Rating</span>
              </button>
            )}

            {/* Student Reopen Button */}
            {isStudentOwner && complaint.status === 'resolved' && complaint.reopenCount < (complaint.maxReopenAllowed || 2) && (
              <button
                onClick={() => setReopenModal(true)}
                className="btn-secondary text-xs py-2 px-3.5 text-orange-600 hover:text-orange-700 flex items-center space-x-1 border-orange-200"
              >
                <HiRefresh className="w-4 h-4" />
                <span>Reopen Grievance ({complaint.maxReopenAllowed - complaint.reopenCount} left)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Comments & Timeline Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Progress Remarks Form */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
            <HiChatAlt2 className="text-blue-600 w-5 h-5" />
            <span>Progress Remarks & Student Discussion</span>
          </h3>
          <p className="text-xs text-gray-500">
            Communicate status updates or clarify details between student and assigned staff.
          </p>

          <form onSubmit={handleAddComment} className="space-y-3">
            <textarea
              rows="3"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add official progress update or response..."
              className="input-field text-sm"
              required
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={actionLoading || !newComment.trim()}
                className="btn-primary text-xs py-2 px-4"
              >
                Post Update
              </button>
            </div>
          </form>
        </div>

        {/* Right: Full Audit Timeline */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
            <HiShieldCheck className="text-blue-600 w-5 h-5" />
            <span>Resolution Timeline & Audit Trail</span>
          </h3>
          <ComplaintTimeline history={history} />
        </div>
      </div>

      {/* Resolve Modal */}
      <Modal
        isOpen={resolveModal}
        onClose={() => setResolveModal(false)}
        title="Complete Grievance Resolution"
        size="md"
      >
        <form onSubmit={handleResolve} className="space-y-4">
          <div>
            <label className="label">Resolution Work Summary <span className="text-red-500">*</span></label>
            <textarea
              rows="4"
              value={resolveComments}
              onChange={(e) => setResolveComments(e.target.value)}
              placeholder="Detail actions taken, repairs made, parts replaced, or policy redressed..."
              required
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="label">Upload Completion Evidence (Optional)</label>
            <FileUpload files={resolveEvidence} setFiles={setResolveEvidence} maxFiles={3} />
          </div>
          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={() => setResolveModal(false)}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="btn-success text-sm px-5"
            >
              {actionLoading ? 'Saving...' : 'Confirm Resolution'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Forward Modal */}
      <Modal
        isOpen={forwardModal}
        onClose={() => setForwardModal(false)}
        title="Forward Grievance to Another Department"
        size="md"
      >
        <form onSubmit={handleForward} className="space-y-4">
          <div>
            <label className="label">Target Department <span className="text-red-500">*</span></label>
            <select
              value={forwardDept}
              onChange={(e) => setForwardDept(e.target.value)}
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
            <label className="label">Routing Reason</label>
            <textarea
              rows="3"
              value={forwardReason}
              onChange={(e) => setForwardReason(e.target.value)}
              placeholder="Explain why this falls outside current departmental jurisdiction..."
              className="input-field text-sm"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={() => setForwardModal(false)}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="btn-primary text-sm px-5"
            >
              {actionLoading ? 'Forwarding...' : 'Forward Grievance'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        isOpen={feedbackModal}
        onClose={() => setFeedbackModal(false)}
        title="Rate Grievance Redressal Quality"
        size="md"
      >
        <form onSubmit={handleFeedback} className="space-y-4">
          <div>
            <label className="label">Overall Satisfaction Rating (1 to 5 Stars)</label>
            <div className="flex items-center space-x-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setFeedbackData((prev) => ({ ...prev, rating: star }))}
                  className="p-1 text-2xl transition hover:scale-110 focus:outline-none"
                >
                  <HiStar
                    className={`${
                      star <= feedbackData.rating ? 'text-amber-400' : 'text-gray-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Your Comments / Suggestions</label>
            <textarea
              rows="3"
              value={feedbackData.comments}
              onChange={(e) =>
                setFeedbackData((prev) => ({ ...prev, comments: e.target.value }))
              }
              placeholder="How satisfied are you with the timeliness and resolution?"
              className="input-field text-sm"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={() => setFeedbackModal(false)}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="btn-primary text-sm px-5"
            >
              Submit Rating
            </button>
          </div>
        </form>
      </Modal>

      {/* Reopen Modal */}
      <Modal
        isOpen={reopenModal}
        onClose={() => setReopenModal(false)}
        title="Reopen Unresolved Grievance"
        size="md"
      >
        <form onSubmit={handleReopen} className="space-y-4">
          <p className="text-xs text-gray-500">
            If the problem persists or the resolution was unsatisfactory, please provide detailed reasons for reopening.
          </p>
          <div>
            <label className="label">Reopen Reason <span className="text-red-500">*</span></label>
            <textarea
              rows="4"
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="Describe why the issue is still unresolved..."
              required
              className="input-field text-sm"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={() => setReopenModal(false)}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="btn-danger text-sm px-5"
            >
              {actionLoading ? 'Reopening...' : 'Confirm Reopen'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ComplaintDetail;

