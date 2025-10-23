import React from 'react';

const Tabs = ({ 
  tabs = [], 
  activeTab, 
  onTabChange,
  variant = "default",
  className = "",
  ...props 
}) => {
  const variantClasses = {
    default: {
      base: 'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
      active: 'bg-white text-blue-600 shadow-sm',
      inactive: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
    },
    pills: {
      base: 'px-4 py-2 text-sm font-medium rounded-full transition-colors',
      active: 'bg-blue-600 text-white',
      inactive: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
    },
    underline: {
      base: 'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
      active: 'border-blue-600 text-blue-600',
      inactive: 'border-transparent text-gray-600 hover:text-gray-900',
    },
  }[variant] || {
    base: 'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
    active: 'bg-white text-blue-600 shadow-sm',
    inactive: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
  };
  
  return (
    <div className={`flex space-x-1 ${className}`} {...props}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            ${variantClasses.base}
            ${activeTab === tab.id ? variantClasses.active : variantClasses.inactive}
            ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          disabled={tab.disabled}
        >
          {tab.icon && <span className="mr-2">{tab.icon}</span>}
          {tab.label}
          {tab.badge && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
