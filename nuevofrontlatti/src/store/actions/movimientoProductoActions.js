import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api.js";
import { API_BASE_URL } from "../../constants/api.js";

const BASE_URL = "/movimiento-productos"; // Corregido para coincidir con el backend

// Crear movimiento de producto
export const createMovimientoProducto = createAsyncThunk(
  "movimientosProducto/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(BASE_URL, data);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Error al registrar el movimiento del producto";
      return rejectWithValue(errorMessage);
    }
  }
);

// Obtener lista de movimientos
export const loadMovimientosProducto = createAsyncThunk(
  "movimientosProducto/load",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🔄 Intentando cargar movimientos de productos desde:", `${API_BASE_URL}${BASE_URL}`);
      const response = await api.get(BASE_URL);
      console.log("✅ Movimientos de productos cargados:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error cargando movimientos de productos:", error);
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      return rejectWithValue(
        error.response?.data?.error || "Error al cargar los movimientos del producto"
      );
    }
  }
);

export const fetchMovimientosProducto = createAsyncThunk(
  'movimientosProducto/fetchMovimientosProducto',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(BASE_URL);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al cargar los movimientos de productos"
      );
    }
  }
);

export const deleteMovimientoProducto = createAsyncThunk(
  'movimientosProducto/deleteMovimientoProducto',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al eliminar el movimiento de producto"
      );
    }
  }
);

// Crear venta por lotes
export const createVentaPorLotes = createAsyncThunk(
  "movimientosProducto/createVentaPorLotes",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/movimiento-productos/venta-por-lotes", data);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Error al registrar la venta por lotes";
      return rejectWithValue(errorMessage);
    }
  }
); 