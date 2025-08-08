// Función para formatear números con separadores de miles
export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }
  
  return Number(number).toLocaleString('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

// Función para formatear precios con separadores de miles
export const formatPrice = (price, decimals = 2) => {
  if (price === null || price === undefined || isNaN(price)) {
    return '$0,00';
  }
  
  return `$${Number(price).toLocaleString('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
};

// Función para formatear cantidades con separadores de miles
export const formatQuantity = (quantity, unit = '') => {
  if (quantity === null || quantity === undefined || isNaN(quantity)) {
    return `0${unit ? ` ${unit}` : ''}`;
  }
  
  const formattedNumber = Number(quantity).toLocaleString('es-ES');
  return `${formattedNumber}${unit ? ` ${unit}` : ''}`;
};
