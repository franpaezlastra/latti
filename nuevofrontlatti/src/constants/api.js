export const API_BASE_URL = 'https://lattibackend-mkxnm2-158d88-72-60-11-86.traefik.me/api';

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
    BASE: '/insumos',                    // Insumos base (simples)
    COMPUESTOS: '/insumos-compuestos',   // Insumos compuestos
    TODOS: '/insumos/todos',             // Todos los insumos (base + compuestos)
    BY_ID: (id) => `/insumos/${id}`,
    COMPUESTO_BY_ID: (id) => `/insumos-compuestos/${id}`,
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