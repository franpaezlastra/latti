export const MESSAGES = {
  // Mensajes de éxito
  SUCCESS: {
    LOGIN: 'Inicio de sesión exitoso',
    LOGOUT: 'Sesión cerrada correctamente',
    PRODUCT_CREATED: 'Producto creado exitosamente',
    PRODUCT_UPDATED: 'Producto actualizado exitosamente',
    PRODUCT_DELETED: 'Producto eliminado exitosamente',
    INSUMO_CREATED: 'Insumo creado exitosamente',
    INSUMO_UPDATED: 'Insumo actualizado exitosamente',
    INSUMO_DELETED: 'Insumo eliminado exitosamente',
    MOVEMENT_CREATED: 'Movimiento creado exitosamente',
    MOVEMENT_UPDATED: 'Movimiento actualizado exitosamente',
    MOVEMENT_DELETED: 'Movimiento eliminado exitosamente',
  },
  
  // Mensajes de error
  ERROR: {
    LOGIN_FAILED: 'Credenciales incorrectas',
    NETWORK_ERROR: 'Error de conexión. Verifica tu internet',
    SERVER_ERROR: 'Error del servidor. Intenta más tarde',
    UNAUTHORIZED: 'No tienes permisos para realizar esta acción',
    VALIDATION_ERROR: 'Por favor, verifica los datos ingresados',
    PRODUCT_NOT_FOUND: 'Producto no encontrado',
    INSUMO_NOT_FOUND: 'Insumo no encontrado',
    MOVEMENT_NOT_FOUND: 'Movimiento no encontrado',
    INSUFFICIENT_STOCK: 'Stock insuficiente para realizar la operación',
    INVALID_LOT_SELECTION: 'Selección de lotes inválida',
  },
  
  // Mensajes de confirmación
  CONFIRM: {
    DELETE_PRODUCT: '¿Estás seguro de que quieres eliminar este producto?',
    DELETE_INSUMO: '¿Estás seguro de que quieres eliminar este insumo?',
    DELETE_MOVEMENT: '¿Estás seguro de que quieres eliminar este movimiento?',
    LOGOUT: '¿Estás seguro de que quieres cerrar sesión?',
  },
  
  // Mensajes de validación
  VALIDATION: {
    REQUIRED_FIELD: 'Este campo es obligatorio',
    INVALID_EMAIL: 'Ingresa un email válido',
    INVALID_PASSWORD: 'La contraseña debe tener al menos 6 caracteres',
    INVALID_NUMBER: 'Ingresa un número válido',
    INVALID_DATE: 'Ingresa una fecha válida',
    MIN_LENGTH: (min) => `Mínimo ${min} caracteres`,
    MAX_LENGTH: (max) => `Máximo ${max} caracteres`,
    MIN_VALUE: (min) => `Valor mínimo: ${min}`,
    MAX_VALUE: (max) => `Valor máximo: ${max}`,
  },
  
  // Estados de lotes
  LOT_STATUS: {
    HIGH_STOCK: 'Alto stock',
    MEDIUM_STOCK: 'Stock medio',
    LOW_STOCK: 'Stock bajo',
    EXPIRED: 'Vencido',
    EXPIRING_SOON: 'Vence pronto',
  },
  
  // Tipos de movimiento
  MOVEMENT_TYPES: {
    ENTRADA: 'Entrada',
    SALIDA: 'Salida',
  },
}; 