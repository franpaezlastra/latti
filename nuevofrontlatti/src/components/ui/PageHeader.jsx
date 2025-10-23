import React from 'react';
import Button from './Button';

const PageHeader = ({ 
  title, 
  subtitle, 
  children, 
  actionButton,
  breadcrumbs = [],
  className = "" 
}) => {
  return (
    <div className={`bg-white border-b border-gray-200 shadow-sm ${className}`}>
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="inline-flex items-center">
                  {index > 0 && (
                    <svg className="w-4 h-4 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {crumb.href ? (
                    <a
                      href={crumb.href}
                      className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span className={`text-sm font-medium ${
                      index === breadcrumbs.length - 1 ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Header content */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 font-[TransformaSans_Trial-Bold] tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-600 max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            {children && (
              <div className="flex items-center gap-2">
                {children}
              </div>
            )}
            {actionButton && (
              <Button
                onClick={actionButton.onClick}
                variant={actionButton.variant || "primary"}
                size={actionButton.size || "md"}
                leftIcon={actionButton.icon}
                rightIcon={actionButton.rightIcon}
                className={actionButton.className}
                disabled={actionButton.disabled}
                loading={actionButton.loading}
              >
                {actionButton.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;