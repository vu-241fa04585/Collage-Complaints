import React from 'react';
import { priorityConfig } from '../../utils/helpers';

const PriorityBadge = ({ priority }) => {
  const config = priorityConfig[priority] || {
    label: priority,
    emoji: '📋',
    color: 'bg-gray-100 text-gray-700',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.color}`}
    >
      <span>{config.emoji}</span>
      {config.label}
    </span>
  );
};

export default PriorityBadge;
