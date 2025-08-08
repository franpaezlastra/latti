import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';
import { API_ENDPOINTS } from '../../constants/api.js';

// Async thunks
export const fetchInsumos = createAsyncThunk(
  'insumos/fetchInsumos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_ENDPOINTS.INSUMOS.BASE);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Error al cargar insumos'
      );
    }
  }
);

export const createInsumo = createAsyncThunk(
  'insumos/createInsumo',
  async (insumoData, { rejectWithValue }) => {
    try {
      const response = await api.post(API_ENDPOINTS.INSUMOS.BASE, insumoData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Error al crear insumo'
      );
    }
  }
);

export const updateInsumo = createAsyncThunk(
  'insumos/updateInsumo',
  async ({ id, insumoData }, { rejectWithValue }) => {
    try {
      const response = await api.put(API_ENDPOINTS.INSUMOS.BY_ID(id), insumoData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Error al actualizar insumo'
      );
    }
  }
);

export const deleteInsumo = createAsyncThunk(
  'insumos/deleteInsumo',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(API_ENDPOINTS.INSUMOS.BY_ID(id));
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Error al eliminar insumo'
      );
    }
  }
);

// Estado inicial
const initialState = {
  insumos: [],
  loading: false,
  error: null,
  selectedInsumo: null,
};

// Slice
const insumoSlice = createSlice({
  name: 'insumos',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCreateError: (state) => {
      // Limpiar solo errores de creación
      state.error = null;
    },
    setSelectedInsumo: (state, action) => {
      state.selectedInsumo = action.payload;
    },
    clearSelectedInsumo: (state) => {
      state.selectedInsumo = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch insumos
    builder
      .addCase(fetchInsumos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInsumos.fulfilled, (state, action) => {
        state.loading = false;
        state.insumos = action.payload;
        state.error = null;
      })
      .addCase(fetchInsumos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create insumo
      .addCase(createInsumo.pending, (state) => {
        state.loading = true;
        // No limpiar el error aquí para no afectar otros estados
      })
      .addCase(createInsumo.fulfilled, (state, action) => {
        state.loading = false;
        // El backend devuelve un objeto con mensaje e insumo, necesitamos acceder al insumo
        const nuevoInsumo = action.payload.insumo || action.payload;
        state.insumos.push(nuevoInsumo);
        // No limpiar el error aquí para no afectar otros estados
      })
      .addCase(createInsumo.rejected, (state, action) => {
        state.loading = false;
        // No guardar el error en el estado global, solo retornarlo
      })
      
      // Update insumo
      .addCase(updateInsumo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInsumo.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.insumos.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.insumos[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateInsumo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete insumo
      .addCase(deleteInsumo.pending, (state) => {
        state.loading = true;
        // No limpiar el error aquí para no afectar otros estados
      })
      .addCase(deleteInsumo.fulfilled, (state, action) => {
        state.loading = false;
        state.insumos = state.insumos.filter(i => i.id !== action.payload);
        // No limpiar el error aquí para no afectar otros estados
      })
      .addCase(deleteInsumo.rejected, (state, action) => {
        state.loading = false;
        // No guardar el error en el estado global, solo retornarlo
      });
  },
});

export const { clearError, clearCreateError, setSelectedInsumo, clearSelectedInsumo } = insumoSlice.actions;
export default insumoSlice.reducer; 