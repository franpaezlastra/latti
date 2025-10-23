import React from 'react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = "primary",
  className = "",
  ...props
}) => {
  const colorClasses = {
    primary: {
      icon: 'text-blue-600',
      bg: 'bg-blue-100',
      value: 'text-blue-900',
    },
    success: {
      icon: 'text-green-600',
      bg: 'bg-green-100',
      value: 'text-green-900',
    },
    warning: {
      icon: 'text-yellow-600',
      bg: 'bg-yellow-100',
      value: 'text-yellow-900',
    },
    danger: {
      icon: 'text-red-600',
      bg: 'bg-red-100',
      value: 'text-red-900',
    },
    purple: {
      icon: 'text-purple-600',
      bg: 'bg-purple-100',
      value: 'text-purple-900',
    },
  };

  const colors = colorClasses[color] || colorClasses.primary;

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow duration-200 ${className}`} {...props}>
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colors.bg}`}>
          <div className={`${colors.icon}`}>
            {icon}
          </div>
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${colors.value}`}>{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                trend === 'up' ? 'bg-green-100 text-green-800' : 
                trend === 'down' ? 'bg-red-100 text-red-800' : 
                'bg-gray-100 text-gray-800'
              }`}>
                {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
