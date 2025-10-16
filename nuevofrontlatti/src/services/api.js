import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../constants/api.js';

// Variable para evitar múltiples redirecciones
let isRedirecting = false;

// Función para limpiar sesión y redirigir
const clearSessionAndRedirect = () => {
  // Evitar múltiples redirecciones
  if (isRedirecting) return;
  isRedirecting = true;
  
  // Limpiar localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Limpiar sessionStorage por si acaso
  sessionStorage.clear();
  
  // Limpiar todos los toasts existentes
  toast.dismiss();
  
  // Mostrar mensaje
  toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
  
  // Redirigir al login
  setTimeout(() => {
    window.location.href = '/login';
  }, 1500); // Delay para que se vea el toast
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // Aumentado a 15 segundos
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Agregar timestamp para evitar cache
    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() };
    }
    
    return config;
  },
  (error) => {
    console.error('Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    // Log de respuestas exitosas en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    const { response, request, message } = error;
    
    // Log de errores en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: response?.status,
        message: response?.data?.message || message,
        data: response?.data
      });
    }

    // Manejo específico por tipo de error
    if (response) {
      // El servidor respondió con un código de error
      switch (response.status) {
        case 400:
          // Bad Request - Validación fallida
          const validationErrors = response.data?.errors || response.data?.message;
          if (validationErrors) {
            toast.error(Array.isArray(validationErrors) ? validationErrors.join(', ') : validationErrors);
          }
          break;
          
        case 401:
          // Unauthorized - Token expirado o inválido
          clearSessionAndRedirect();
          break;
          
        case 403:
          // Forbidden - Sin permisos o token expirado
          // Verificar si el error es por token expirado
          const errorMessage = response.data?.message || response.data?.error || '';
          if (errorMessage.includes('token') || errorMessage.includes('expired') || errorMessage.includes('invalid') || errorMessage.includes('permisos')) {
            // Es un error de autenticación, cerrar sesión
            clearSessionAndRedirect();
          } else {
            // Es realmente un error de permisos
            toast.error('No tienes permisos para realizar esta acción.');
          }
          break;
          
        case 404:
          // Not Found
          toast.error('Recurso no encontrado.');
          break;
          
        case 422:
          // Unprocessable Entity - Errores de validación
          const errors = response.data?.errors;
          if (errors && typeof errors === 'object') {
            Object.values(errors).forEach(error => {
              if (Array.isArray(error)) {
                error.forEach(msg => toast.error(msg));
              } else {
                toast.error(error);
              }
            });
          } else {
            toast.error(response.data?.message || 'Error de validación');
          }
          break;
          
        case 429:
          // Too Many Requests
          toast.error('Demasiadas peticiones. Por favor, espera un momento.');
          break;
          
        case 500:
        case 502:
        case 503:
        case 504:
          // Errores del servidor
          toast.error('Error del servidor. Por favor, intenta más tarde.');
          break;
          
        default:
          // Otros errores
          toast.error(response.data?.message || 'Error inesperado');
      }
    } else if (request) {
      // La petición fue hecha pero no se recibió respuesta
      toast.error('No se pudo conectar con el servidor. Verifica tu conexión.');
    } else {
      // Error al configurar la petición
      toast.error('Error al procesar la petición.');
    }
    
    return Promise.reject(error);
  }
);

// Funciones helper para peticiones comunes
export const apiHelpers = {
  // GET con manejo de errores
  async get(url, config = {}) {
    try {
      const response = await api.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // POST con manejo de errores
  async post(url, data = {}, config = {}) {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT con manejo de errores
  async put(url, data = {}, config = {}) {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE con manejo de errores
  async delete(url, config = {}) {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PATCH con manejo de errores
  async patch(url, data = {}, config = {}) {
    try {
      const response = await api.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default api; 