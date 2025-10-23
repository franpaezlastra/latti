import React from 'react';
import { FaFilter, FaSearch, FaTimes } from 'react-icons/fa';
import Button from './Button';
import Input from './Input';
import Card from './Card';

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
    <Card className={`mb-6 ${className}`} {...props}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-600" size={16} />
          <h3 className="text-sm font-medium text-gray-900">Filtros</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          leftIcon={<FaTimes size={14} />}
        >
          Cerrar
        </Button>
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
                <Input
                  type="text"
                  value={filter.value || ''}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                  placeholder={filter.placeholder}
                  className="pl-10"
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
              <Input
                type="date"
                value={filter.value || ''}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
              />
            ) : (
              <Input
                type={filter.type || 'text'}
                value={filter.value || ''}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                placeholder={filter.placeholder}
              />
            )}
          </div>
        ))}
      </div>
      
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
        >
          Limpiar
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onClose}
        >
          Aplicar
        </Button>
      </div>
    </Card>
  );
};

export default FilterPanel;
