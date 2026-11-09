import React from 'react';
import { HiTrendingUp, HiTrendingDown } from 'react-icons/hi';

const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-500',
    text: 'text-blue-600',
  },
  green: {
    bg: 'bg-emerald-50',
    icon: 'bg-emerald-500',
    text: 'text-emerald-600',
  },
  yellow: {
    bg: 'bg-amber-50',
    icon: 'bg-amber-500',
    text: 'text-amber-600',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'bg-red-500',
    text: 'text-red-600',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-500',
    text: 'text-purple-600',
  },
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'bg-indigo-500',
    text: 'text-indigo-600',
  },
};

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'blue', subtitle }) => {
  const colors = colorMap[color] || colorMap.blue;

  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              {trend === 'up' ? (
                <HiTrendingUp className="h-4 w-4 text-emerald-500" />
              ) : (
                <HiTrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span
                className={`text-xs font-medium ${
                  trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={`rounded-lg ${colors.bg} p-3`}>
          {Icon && <Icon className={`h-6 w-6 ${colors.text}`} />}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
