import React from 'react';
import { formatDateTime } from '../../utils/helpers';
import {
  HiCheckCircle,
  HiClock,
  HiUserAdd,
  HiExclamationCircle,
  HiChatAlt2,
  HiRefresh,
  HiArrowRight,
  HiFolderDownload,
} from 'react-icons/hi';

const getActionDetails = (action) => {
  switch (action) {
    case 'created':
      return {
        icon: HiClock,
        color: 'text-blue-600 bg-blue-100 border-blue-300',
        label: 'Complaint Lodged',
      };
    case 'assigned':
      return {
        icon: HiUserAdd,
        color: 'text-purple-600 bg-purple-100 border-purple-300',
        label: 'Routed & Assigned',
      };
    case 'status_changed':
      return {
        icon: HiArrowRight,
        color: 'text-amber-600 bg-amber-100 border-amber-300',
        label: 'Status Updated',
      };
    case 'resolved':
      return {
        icon: HiCheckCircle,
        color: 'text-emerald-600 bg-emerald-100 border-emerald-300',
        label: 'Resolved & Redressed',
      };
    case 'escalated':
      return {
        icon: HiExclamationCircle,
        color: 'text-red-600 bg-red-100 border-red-300',
        label: 'SLA Escalated',
      };
    case 'reopened':
      return {
        icon: HiRefresh,
        color: 'text-orange-600 bg-orange-100 border-orange-300',
        label: 'Grievance Reopened',
      };
    case 'commented':
      return {
        icon: HiChatAlt2,
        color: 'text-gray-600 bg-gray-100 border-gray-300',
        label: 'Progress Remark Added',
      };
    case 'evidence_added':
      return {
        icon: HiFolderDownload,
        color: 'text-teal-600 bg-teal-100 border-teal-300',
        label: 'Resolution Evidence Uploaded',
      };
    default:
      return {
        icon: HiClock,
        color: 'text-blue-600 bg-blue-100 border-blue-300',
        label: 'Action Recorded',
      };
  }
};

const ComplaintTimeline = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-gray-500">
        No progress events recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
      {history.map((item, index) => {
        const details = getActionDetails(item.action);
        const Icon = details.icon;

        return (
          <div key={item._id || index} className="relative flex items-start space-x-4">
            {/* Timeline node icon */}
            <div
              className={`absolute -left-6 top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 ${details.color} shadow-sm z-10`}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>

            {/* Content card */}
            <div className="flex-1 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                  {details.label}
                </span>
                <span className="text-[11px] text-gray-400 font-medium">
                  {formatDateTime(item.createdAt)}
                </span>
              </div>

              {/* Performer info */}
              {item.performedBy && (
                <p className="text-xs text-blue-700 font-medium mb-2">
                  By {item.performedBy.name || 'System Auto-Router'} ({item.performedBy.role?.replace('_', ' ') || 'Staff'})
                </p>
              )}

              {/* Comments / Notes */}
              {item.comments && (
                <p className="text-sm text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-100 mt-1 whitespace-pre-wrap leading-relaxed">
                  {item.comments}
                </p>
              )}

              {/* Evidence attachments if any */}
              {item.attachments && item.attachments.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {item.attachments.map((att, attIdx) => (
                    <a
                      key={attIdx}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 hover:underline flex items-center space-x-1"
                    >
                      <HiFolderDownload />
                      <span>{att.filename || 'View Evidence File'}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ComplaintTimeline;

