import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api.js";
import { API_BASE_URL } from "../../constants/api.js";

const BASE_URL = "/movimiento-insumo"; // Corregido para coincidir con el backend

// Crear movimiento
export const createMovimientoInsumo = createAsyncThunk(
  "movimientosInsumo/create",
  async (data, { rejectWithValue }) => {
    try {
      console.log('🚀 createMovimientoInsumo - Enviando datos:', data);
      console.log('🚀 createMovimientoInsumo - URL:', BASE_URL);
      const response = await api.post(BASE_URL, data);
      console.log('✅ createMovimientoInsumo - Respuesta del servidor:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ createMovimientoInsumo - Error:', error);
      console.error('❌ createMovimientoInsumo - Error response:', error.response?.data);
      console.error('❌ createMovimientoInsumo - Error status:', error.response?.status);
      const errorMessage = error.response?.data?.error || "Error al registrar movimiento de insumo";
      return rejectWithValue(errorMessage);
    }
  }
);

// Obtener movimientos
export const loadMovimientosInsumo = createAsyncThunk(
  "movimientosInsumo/load",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🔄 Intentando cargar movimientos de insumo desde:", `${API_BASE_URL}${BASE_URL}`);
      const response = await api.get(BASE_URL);
      console.log("✅ Movimientos de insumo cargados:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error cargando movimientos de insumo:", error);
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      return rejectWithValue(
        error.response?.data?.error || "Error al cargar los movimientos de insumo"
      );
    }
  }
);

export const fetchMovimientosInsumo = createAsyncThunk(
  'movimientosInsumo/fetchMovimientosInsumo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(BASE_URL);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al cargar los movimientos de insumo"
      );
    }
  }
);

export const deleteMovimientoInsumo = createAsyncThunk(
  'movimientosInsumo/deleteMovimientoInsumo',
  async (id, { rejectWithValue }) => {
    try {
      console.log("🗑️ Intentando eliminar movimiento de insumo ID:", id);
      const response = await api.delete(`${BASE_URL}/${id}`);
      console.log("✅ Movimiento de insumo eliminado exitosamente");
      return response.data;
    } catch (error) {
      console.error("❌ Error eliminando movimiento de insumo:", error);
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Extraer el mensaje de error del backend
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          "Error al eliminar el movimiento de insumo";
      
      return rejectWithValue(errorMessage);
    }
  }
); 