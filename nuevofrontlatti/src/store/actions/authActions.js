import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api.js";
import { loadInsumos } from "./insumoActions.js";
import { loadProductos } from "./productosActions.js";

const BASE_URL = "/auth"; // Removido /api ya que está en la baseURL

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post(`${BASE_URL}/login`, credentials);
      
      // El backend solo retorna el token, extraemos el username de las credenciales
      const user = {
        username: credentials.username
      };
      
      // Guardar token y usuario en localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return {
        token: response.data.token,
        user: user
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error al iniciar sesión"
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post(`${BASE_URL}/register`, userData);
      
      // Guardar token y usuario en localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', response.data.user);
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error al registrar usuario"
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      return { success: true };
    } catch (error) {
      return rejectWithValue("Error al cerrar sesión");
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  "auth/checkStatus",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (!token) {
        // Si no hay token, no es un error, simplemente no hay sesión
        return {
          token: null,
          user: null,
          isValid: false
        };
      }
      
      // Si no hay user pero hay token, intentar extraer username del token
      let user = null;
      try {
        if (userStr && userStr !== 'null' && userStr !== 'undefined') {
          user = JSON.parse(userStr);
        }
      } catch (parseError) {
        console.warn('Error parsing user from localStorage:', parseError);
      }
      
      // Si no hay user, intentar extraer del token (el JWT contiene el username)
      if (!user || !user.username) {
        try {
          // Decodificar el payload del JWT (sin verificar firma)
          const payload = JSON.parse(atob(token.split('.')[1]));
          user = { username: payload.sub || payload.username };
        } catch (jwtError) {
          console.warn('No se pudo extraer username del token:', jwtError);
        }
      }
      
      // Validar token con el servidor con timeout
      try {
        // Crear una petición especial que no active el interceptor de redirección
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          // Agregar flag para que el interceptor sepa que es una validación
          _skipAuthRedirect: true,
          timeout: 5000 // ✅ Timeout de 5 segundos
        };
        
        const response = await api.get('/auth/validate', config);
        
        return {
          token,
          user: user || { username: 'Usuario' },
          isValid: true
        };
      } catch (serverError) {
        // Si el servidor responde con 401 o 403, el token es inválido
        if (serverError.response?.status === 401 || serverError.response?.status === 403) {
          // Limpiar sesión local solo si realmente es un error de autenticación
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          throw new Error('Token expirado o inválido');
        }
        // Para otros errores (red, timeout, etc), mantener la sesión local
        // pero marcar como no validado - NO lanzar error para que loading se ponga en false
        console.warn('Error al validar token (posible problema de conectividad):', serverError.message);
        // ✅ En lugar de lanzar error, retornar un resultado válido pero con isValid: false
        return {
          token,
          user: user || { username: 'Usuario' },
          isValid: false
        };
      }
    } catch (error) {
      // ✅ Si hay un error crítico, limpiar y retornar estado no autenticado
      console.error('Error en checkAuthStatus:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return rejectWithValue(error.message || "Sesión no válida");
    }
  }
);

// Action para cargar datos críticos después del login
export const loadCriticalData = createAsyncThunk(
  "auth/loadCriticalData",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Cargar datos críticos en paralelo
      const promises = [
        dispatch(loadInsumos()),
        dispatch(loadProductos())
      ];
      
      await Promise.all(promises);
      
      return { success: true };
    } catch (error) {
      return rejectWithValue("Error al cargar datos críticos");
    }
  }
); 