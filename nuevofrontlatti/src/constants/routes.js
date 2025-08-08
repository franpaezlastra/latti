export const ROUTES = {
  // Rutas públicas
  LOGIN: '/',
  REGISTER: '/register',
  
  // Rutas protegidas (con layout admin)
  DASHBOARD: '/admin/dashboard',
  PRODUCTS: '/admin/productos',
  INSUMOS: '/admin/insumos',
  MOVEMENTS: '/admin/movimientos',
  LOTS: '/admin/lots',
  LOGOUT: '/admin/cerrar-sesion',
  
  // Subrutas
  PRODUCTS_CREATE: '/admin/productos/create',
  PRODUCTS_EDIT: '/admin/productos/:id/edit',
  PRODUCTS_DETAILS: '/admin/productos/:id',
  
  INSUMOS_CREATE: '/admin/insumos/create',
  INSUMOS_EDIT: '/admin/insumos/:id/edit',
  INSUMOS_DETAILS: '/admin/insumos/:id',
  
  MOVEMENTS_PRODUCTS: '/admin/movimientos/products',
  MOVEMENTS_INSUMOS: '/admin/movimientos/insumos',
  MOVEMENTS_CREATE_PRODUCT: '/admin/movimientos/products/create',
  MOVEMENTS_CREATE_INSUMO: '/admin/movimientos/insumos/create',
  
  LOTS_STOCK: '/admin/lots/stock',
  LOTS_SALES: '/admin/lots/sales',
};

export const PUBLIC_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER];
export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.PRODUCTS,
  ROUTES.INSUMOS,
  ROUTES.MOVEMENTS,
  ROUTES.LOTS,
  ROUTES.LOGOUT,
]; 