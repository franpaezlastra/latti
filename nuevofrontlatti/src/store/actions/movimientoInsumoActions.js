import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api.js";
import { API_BASE_URL } from "../../constants/api.js";

const BASE_URL = "/movimiento-insumo"; // Corregido para coincidir con el backend

// Crear movimiento
export const createMovimientoInsumo = createAsyncThunk(
  "movimientosInsumo/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(BASE_URL, data);
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
      const response = await api.get(BASE_URL);
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
      const response = await api.delete(`${BASE_URL}/${id}`);
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

// Validar si se puede editar un movimiento
export const validarEdicionMovimiento = createAsyncThunk(
  'movimientosInsumo/validarEdicion',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`${BASE_URL}/${id}/validar-edicion`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          "Error al validar edición";
      return rejectWithValue(errorMessage);
    }
  }
);

// Actualizar movimiento de insumo
export const updateMovimientoInsumo = createAsyncThunk(
  'movimientosInsumo/update',
  async (data, { rejectWithValue }) => {
    try {
      // Preparar el payload con el ID (el DTO lo requiere aunque el backend lo sobrescriba con el del path)
      const payload = {
        id: data.id, // El DTO lo requiere para deserialización
        fecha: data.fecha,
        descripcion: data.descripcion,
        tipoMovimiento: data.tipoMovimiento,
        detalles: data.detalles
      };
      
      console.log('📤 Enviando PUT a:', `${BASE_URL}/${data.id}`);
      console.log('📦 Payload completo:', JSON.stringify(payload, null, 2));
      
      const response = await api.put(`${BASE_URL}/${data.id}`, payload);
      return response.data;
    } catch (error) {
      console.error("❌ Error actualizando movimiento de insumo:", error);
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Extraer el mensaje de error del backend
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          "Error al actualizar el movimiento de insumo";
      
      return rejectWithValue(errorMessage);
    }
  }
); 