import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import PriorityBadge from '../common/PriorityBadge';
import {
  categoryLabels,
  categoryIcons,
  timeAgo,
  formatDate,
  isOverdue,
} from '../../utils/helpers';
import { HiClock, HiOfficeBuilding, HiLocationMarker, HiLockClosed } from 'react-icons/hi';

const ComplaintCard = ({ complaint }) => {
  const navigate = useNavigate();

  const overdue =
    complaint.status !== 'resolved' &&
    complaint.status !== 'closed' &&
    isOverdue(complaint.dueDate);

  return (
    <div
      onClick={() => navigate(`/complaint/${complaint._id}`)}
      className={`bg-white rounded-xl border transition-all duration-200 p-5 shadow-sm hover:shadow-md cursor-pointer relative overflow-hidden ${
        overdue
          ? 'border-red-300 hover:border-red-400 bg-red-50/20'
          : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      {/* Top Banner if Overdue */}
      {overdue && (
        <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-lg tracking-wider uppercase">
          SLA Overdue
        </div>
      )}

      {/* Header: Tracking ID, Category, Badges */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            {complaint.trackingId}
          </span>
          <span className="text-xs text-gray-500 flex items-center space-x-1">
            <span>{categoryIcons[complaint.category] || '📋'}</span>
            <span className="font-medium text-gray-700 truncate max-w-[150px]">
              {categoryLabels[complaint.category] || complaint.category}
            </span>
          </span>
          {complaint.isConfidential && (
            <span className="text-amber-600 bg-amber-50 text-[11px] font-medium px-1.5 py-0.5 rounded flex items-center space-x-0.5 border border-amber-200" title="Confidential Identity">
              <HiLockClosed className="w-3 h-3" />
              <span>Confidential</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1.5 flex-shrink-0">
          <PriorityBadge priority={complaint.priority} />
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      {/* Complaint Title */}
      <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-1 hover:text-blue-600 transition-colors">
        {complaint.title}
      </h3>

      {/* Short Description */}
      <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
        {complaint.description}
      </p>

      {/* Footer Info: Department, Location, Time */}
      <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          {complaint.assignedDepartment && (
            <span className="flex items-center space-x-1">
              <HiOfficeBuilding className="text-gray-400" />
              <span className="truncate max-w-[140px]">
                {complaint.assignedDepartment.name || 'Assigned Dept'}
              </span>
            </span>
          )}
          {complaint.location && (
            <span className="hidden sm:flex items-center space-x-1 text-gray-400">
              <HiLocationMarker />
              <span className="truncate max-w-[120px]">{complaint.location}</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1 text-gray-400">
          <HiClock />
          <span>{timeAgo(complaint.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default ComplaintCard;

