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
      base: 'px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out',
      active: 'bg-white text-blue-600 shadow-md ring-1 ring-blue-100',
      inactive: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80',
      badge: {
        active: 'bg-blue-100 text-blue-700',
        inactive: 'bg-gray-200 text-gray-600'
      }
    },
    pills: {
      base: 'px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-200 ease-in-out',
      active: 'bg-blue-600 text-white shadow-md',
      inactive: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
      badge: {
        active: 'bg-blue-500 text-white',
        inactive: 'bg-gray-200 text-gray-600'
      }
    },
    underline: {
      base: 'px-5 py-2.5 text-sm font-medium border-b-2 transition-all duration-200 ease-in-out',
      active: 'border-blue-600 text-blue-600',
      inactive: 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300',
      badge: {
        active: 'bg-blue-100 text-blue-700',
        inactive: 'bg-gray-200 text-gray-600'
      }
    },
  }[variant] || {
    base: 'px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out',
    active: 'bg-white text-blue-600 shadow-md ring-1 ring-blue-100',
    inactive: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80',
    badge: {
      active: 'bg-blue-100 text-blue-700',
      inactive: 'bg-gray-200 text-gray-600'
    }
  };
  
  return (
    <div className={`flex space-x-2 ${className}`} {...props}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center justify-center gap-2
              ${variantClasses.base}
              ${isActive ? variantClasses.active : variantClasses.inactive}
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            disabled={tab.disabled}
          >
            {tab.icon && (
              <span className="flex items-center justify-center">
                {tab.icon}
              </span>
            )}
            <span className="font-semibold">
              {tab.label}
            </span>
            {tab.badge !== undefined && (
              <span className={`
                px-2 py-0.5 text-xs font-bold rounded-full
                ${isActive ? variantClasses.badge.active : variantClasses.badge.inactive}
              `}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
