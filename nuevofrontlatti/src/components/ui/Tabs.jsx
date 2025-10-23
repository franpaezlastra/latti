import React from 'react';
import { TAB_VARIANTS } from '../../constants/design';

const Tabs = ({ 
  tabs = [], 
  activeTab, 
  onTabChange,
  variant = "default",
  className = "",
  ...props 
}) => {
  const variantClasses = TAB_VARIANTS[variant] || TAB_VARIANTS.default;
  
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
