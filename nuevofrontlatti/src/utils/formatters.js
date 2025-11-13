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

/**
 * ✅ CORREGIDO: Formatea una fecha a formato YYYY-MM-DD usando hora LOCAL (no UTC)
 * Evita el problema de que toISOString() convierte a UTC y puede cambiar el día
 * 
 * @param {Date|string} date - Fecha a formatear (puede ser Date object o string)
 * @returns {string} - Fecha en formato YYYY-MM-DD en hora local
 */
export const formatDateToLocalString = (date) => {
  if (!date) return '';
  
  let fechaObj;
  
  // Si es un string, intentar parsearlo
  if (typeof date === 'string') {
    // Si ya está en formato YYYY-MM-DD, usarlo directamente
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // Si tiene tiempo incluido, parsearlo
    if (date.includes('T')) {
      fechaObj = new Date(date);
    } else {
      // Si es un string sin formato específico, intentar crear Date
      fechaObj = new Date(date + 'T00:00:00'); // Agregar hora media para evitar problemas de zona horaria
    }
  } else if (date instanceof Date) {
    fechaObj = date;
  } else {
    return '';
  }
  
  // Validar que sea una fecha válida
  if (isNaN(fechaObj.getTime())) {
    return '';
  }
  
  // ✅ CRÍTICO: Usar métodos de hora LOCAL, no UTC
  // getFullYear(), getMonth(), getDate() usan hora local
  const year = fechaObj.getFullYear();
  const month = String(fechaObj.getMonth() + 1).padStart(2, '0'); // getMonth() devuelve 0-11
  const day = String(fechaObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Obtiene la fecha de hoy en formato YYYY-MM-DD usando hora LOCAL
 * @returns {string} - Fecha actual en formato YYYY-MM-DD
 */
export const getTodayLocalString = () => {
  const hoy = new Date();
  return formatDateToLocalString(hoy);
};

/**
 * Convierte un string de fecha (YYYY-MM-DD) a un objeto Date en hora local
 * Evita problemas de zona horaria al interpretar como medianoche local
 * 
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {Date|null} - Objeto Date o null si es inválido
 */
export const parseLocalDateString = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return null;
  
  // Si ya está en formato YYYY-MM-DD, parsearlo correctamente
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // getMonth() usa 0-11
    const day = parseInt(match[3], 10);
    
    // ✅ CRÍTICO: Crear fecha usando hora local (sin 'Z' al final)
    const fecha = new Date(year, month, day);
    
    // Validar que sea válida
    if (isNaN(fecha.getTime())) {
      return null;
    }
    
    return fecha;
  }
  
  // Si no está en el formato esperado, intentar parsearlo normalmente
  return new Date(dateString);
};

/**
 * ✅ CORREGIDO: Formatea una fecha (Date, string YYYY-MM-DD, o cualquier formato) 
 * a formato de fecha local español (DD/MM/YYYY) sin problemas de zona horaria
 * 
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} - Fecha formateada como DD/MM/YYYY o string vacío si es inválida
 */
export const formatDateToDisplay = (date) => {
  if (!date) return '';
  
  // Si es un string en formato YYYY-MM-DD, parsearlo correctamente
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      const day = parseInt(match[3], 10);
      // Formatear directamente sin crear Date object para evitar problemas de zona horaria
      return `${day}/${month}/${year}`;
    }
  }
  
  // Si es un objeto Date o string con otro formato, usar parseLocalDateString
  let fechaObj;
  if (date instanceof Date) {
    fechaObj = date;
  } else {
    fechaObj = parseLocalDateString(date);
  }
  
  if (!fechaObj || isNaN(fechaObj.getTime())) {
    return '';
  }
  
  // Formatear usando métodos de hora local
  const day = String(fechaObj.getDate()).padStart(2, '0');
  const month = String(fechaObj.getMonth() + 1).padStart(2, '0');
  const year = fechaObj.getFullYear();
  
  return `${day}/${month}/${year}`;
};