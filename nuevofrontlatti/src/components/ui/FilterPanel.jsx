import React from 'react';
import { FaFilter, FaSearch, FaTimes } from 'react-icons/fa';

const FilterPanel = ({
  isOpen = false,
  onClose,
  filters = [],
  onFilterChange,
  onClearFilters,
  className = "",
  ...props
}) => {
  if (!isOpen) return null;

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6 ${className}`} {...props}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-600" size={16} />
          <h3 className="text-sm font-medium text-gray-900">Filtros</h3>
        </div>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FaTimes size={14} />
          Cerrar
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filters.map((filter, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {filter.label}
            </label>
            {filter.type === 'search' ? (
              <div className="relative">
                <FaSearch className="absolute left-3 top-2.5 text-gray-400" size={14} />
                <input
                  type="text"
                  value={filter.value || ''}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                  placeholder={filter.placeholder}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            ) : filter.type === 'select' ? (
              <select
                value={filter.value || ''}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{filter.placeholder || 'Todos'}</option>
                {filter.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : filter.type === 'date' ? (
              <input
                type="date"
                value={filter.value || ''}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <input
                type={filter.type || 'text'}
                value={filter.value || ''}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                placeholder={filter.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>
        ))}
      </div>
      
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={onClearFilters}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-transparent border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 transition-colors"
        >
          Limpiar
        </button>
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          Aplicar
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
