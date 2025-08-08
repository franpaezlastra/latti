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
      
      // Guardar token y usuario en localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', response.data.user);
      
      return response.data;
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
      const user = localStorage.getItem('user');
      
      if (!token || !user) {
        throw new Error('No hay sesión activa');
      }
      
      return {
        token,
        user: JSON.parse(user)
      };
    } catch (error) {
      return rejectWithValue("Sesión no válida");
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