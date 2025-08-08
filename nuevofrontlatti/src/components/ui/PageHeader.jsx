import React from 'react';
import Button from './Button';

const PageHeader = ({ title, subtitle, children, actionButton }) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm border-b border-blue-100 shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-blue-700 font-[TransformaSans_Trial-Bold] tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-blue-600 mt-1 font-medium">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {actionButton && (
              <Button
                onClick={actionButton.onClick}
                variant="primary"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
              >
                {actionButton.icon}
                {actionButton.label}
              </Button>
            )}
            {children && children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader; 