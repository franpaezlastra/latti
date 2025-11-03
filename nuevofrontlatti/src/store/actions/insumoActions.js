import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api.js";
import { API_BASE_URL } from "../../constants/api.js";

const BASE_URL = "/insumos"; // Removido /api ya que está en la baseURL

// Obtener insumos (todos: base + compuestos)
export const loadInsumos = createAsyncThunk(
  "insumos/loadInsumos",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/insumos/todos');
      return response.data;
    } catch (error) {
      console.error("❌ Error cargando insumos:", error);
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      return rejectWithValue(
        error.response?.data?.error || "Error al cargar los insumos"
      );
    }
  }
);

// Crear insumo
export const createInsumo = createAsyncThunk(
  "insumos/createInsumo",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(BASE_URL, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al crear el insumo"
      );
    }
  }
);

// Eliminar insumo
export const deleteInsumo = createAsyncThunk(
  "insumos/deleteInsumo",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`${BASE_URL}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || `Error al eliminar insumo con ID: ${id}`
      );
    }
  }
);

// Actualizar insumo
export const updateInsumo = createAsyncThunk(
  "insumos/updateInsumo",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`${BASE_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error al actualizar el insumo"
      );
    }
  }
); 