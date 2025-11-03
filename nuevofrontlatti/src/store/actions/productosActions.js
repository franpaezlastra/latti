import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api.js";
import { API_BASE_URL } from "../../constants/api.js";

const BASE_URL = "/productos"; // Removido /api ya que está en la baseURL

// Cargar todos los productos
export const loadProductos = createAsyncThunk(
  "productos/loadProductos",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(BASE_URL);
      return response.data;
    } catch (error) {
      console.error("❌ Error cargando productos:", error);
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      return rejectWithValue(error.response?.data || "Error al cargar productos");
    }
  }
);

// Obtener producto por ID
export const getProductoById = createAsyncThunk(
  "productos/getProductoById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || `Error al obtener producto con ID: ${id}`);
    }
  }
);

// Crear producto
export const crearProducto = createAsyncThunk(
  "productos/crearProducto",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(BASE_URL, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error al crear el producto");
    }
  }
);

// Eliminar producto
export const deleteProducto = createAsyncThunk(
  "productos/deleteProducto",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`${BASE_URL}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || `Error al eliminar producto con ID: ${id}`);
    }
  }
);

// Actualizar producto
export const updateProducto = createAsyncThunk(
  "productos/updateProducto",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`${BASE_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error al actualizar el producto");
    }
  }
);

// Obtener stock por lotes de un producto
export const loadStockPorLotes = createAsyncThunk(
  "productos/loadStockPorLotes",
  async (productoId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/productos/${productoId}/stock-por-lotes`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al cargar stock por lotes"
      );
    }
  }
); 