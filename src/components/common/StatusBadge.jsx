import React from 'react';
import { statusConfig } from '../../utils/helpers';

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || {
    label: status,
    color: 'bg-gray-100 text-gray-700',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.color}`}
    >
      {config.icon && <span>{config.icon}</span>}
      {config.label}
    </span>
  );
};

export default StatusBadge;
