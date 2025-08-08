import React, { useState, useEffect } from 'react';

const NumberInput = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  required = false, 
  disabled = false,
  step = "0.01",
  min = "0",
  className = "",
  error = false
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Función para formatear número con separadores de miles
  const formatNumber = (num) => {
    if (num === '' || num === null || num === undefined) return '';
    
    const number = parseFloat(num);
    if (isNaN(number)) return '';
    
    // Usar formato español con comas para decimales
    return number.toLocaleString('es-ES', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  // Función para limpiar formato y obtener solo números
  const unformatNumber = (formattedValue) => {
    if (!formattedValue) return '';
    
    // Remover separadores de miles (puntos) y cambiar comas por puntos para decimales
    return formattedValue
      .replace(/\./g, '') // Remover puntos (separadores de miles)
      .replace(/,/g, '.'); // Cambiar comas por puntos para decimales
  };

  // Actualizar displayValue cuando cambia el value externo
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatNumber(value));
    }
  }, [value, isFocused]);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    
    // Si está vacío, permitir
    if (inputValue === '') {
      setDisplayValue('');
      onChange('');
      return;
    }

    // Permitir números, puntos, comas y espacios
    const cleanValue = inputValue.replace(/[^\d.,\s]/g, '');
    
    // Si está enfocado, permitir entrada directa sin formatear
    if (isFocused) {
      // Validar que no tenga más de un separador decimal
      const decimalCount = (cleanValue.match(/[.,]/g) || []).length;
      if (decimalCount > 1) {
        return;
      }
      
      // Permitir entrada directa mientras está enfocado
      setDisplayValue(cleanValue);
      
      // Solo procesar si es un número válido
      const unformatted = unformatNumber(cleanValue);
      if (unformatted !== '' && !isNaN(parseFloat(unformatted))) {
        onChange(unformatted);
      } else {
        // Si no es válido pero tiene contenido, mantener el valor para permitir edición
        onChange(cleanValue);
      }
      return;
    }

    // Si no está enfocado, formatear normalmente
    const unformatted = unformatNumber(cleanValue);
    if (unformatted === '' || isNaN(parseFloat(unformatted))) {
      return;
    }

    // Validar que no tenga más de un separador decimal
    const decimalCount = (cleanValue.match(/[.,]/g) || []).length;
    if (decimalCount > 1) {
      return;
    }

    // Formatear el valor para mostrar
    const formattedValue = formatNumber(unformatted);
    setDisplayValue(formattedValue);
    onChange(unformatted);
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Mostrar el valor sin formato cuando se enfoca para facilitar la edición
    setDisplayValue(value || '');
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Formatear el valor cuando pierde el foco
    setDisplayValue(formatNumber(value));
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type="text"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        required={required}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
          error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
        } ${className}`}
      />
    </div>
  );
};

export default NumberInput;
