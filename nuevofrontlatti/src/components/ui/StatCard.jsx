import React from 'react';
import Card from './Card';
import Badge from './Badge';

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
    <Card className={`hover:shadow-md transition-shadow duration-200 ${className}`} {...props}>
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
              <Badge
                variant={trend === 'up' ? 'success' : trend === 'down' ? 'danger' : 'default'}
                size="sm"
              >
                {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
