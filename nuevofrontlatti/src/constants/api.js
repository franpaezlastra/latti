export const API_BASE_URL = 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  
  // Productos
  PRODUCTS: {
    BASE: '/productos',
    BY_ID: (id) => `/productos/${id}`,
    STOCK_BY_LOTES: (id) => `/productos/${id}/stock-por-lotes`,
  },
  
  // Insumos
  INSUMOS: {
    BASE: '/insumos',
    BY_ID: (id) => `/insumos/${id}`,
  },
  
  // Movimientos
  MOVEMENTS: {
    PRODUCTS: {
      BASE: '/movimiento-productos',
      BY_ID: (id) => `/movimiento-productos/${id}`,
      VENTA_POR_LOTES: '/movimiento-productos/venta-por-lotes',
    },
    INSUMOS: {
      BASE: '/movimiento-insumo',
      BY_ID: (id) => `/movimiento-insumo/${id}`,
    },
  },
};

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
};

export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
}; 