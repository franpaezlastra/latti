import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';
import { API_ENDPOINTS } from '../../constants/api.js';

// Async thunks
export const fetchInsumos = createAsyncThunk(
  'insumos/fetchInsumos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_ENDPOINTS.INSUMOS.TODOS);
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

export const updateInsumoCompuesto = createAsyncThunk(
  'insumos/updateInsumoCompuesto',
  async ({ id, insumoData }, { rejectWithValue }) => {
    try {
      const response = await api.put(API_ENDPOINTS.INSUMOS.COMPUESTO_BY_ID(id), insumoData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Error al actualizar insumo compuesto'
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
  createStatus: 'idle', // Agregado para tracking del estado de creación
  createError: null,    // Agregado para errores de creación
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
      state.createError = null;
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
        state.createStatus = 'loading';
        state.createError = null;
        state.loading = true;
      })
      .addCase(createInsumo.fulfilled, (state, action) => {
        state.createStatus = 'succeeded';
        state.loading = false;
        // El backend devuelve un objeto con mensaje e insumo
        const nuevoInsumo = action.payload.insumo || action.payload;
        
        // ✅ ARREGLADO: Agregar el nuevo insumo al estado local
        // Esto hará que aparezca inmediatamente en el dashboard
        if (nuevoInsumo && nuevoInsumo.id) {
          // Verificar que no esté duplicado
          const existe = state.insumos.find(i => i.id === nuevoInsumo.id);
          if (!existe) {
            state.insumos.push(nuevoInsumo);
          }
        }
        
        state.createError = null;
      })
      .addCase(createInsumo.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.loading = false;
        state.createError = action.payload;
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
      
      // Update insumo compuesto
      .addCase(updateInsumoCompuesto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInsumoCompuesto.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.insumos.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.insumos[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateInsumoCompuesto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete insumo
      .addCase(deleteInsumo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInsumo.fulfilled, (state, action) => {
        state.loading = false;
        state.insumos = state.insumos.filter(i => i.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteInsumo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCreateError, setSelectedInsumo, clearSelectedInsumo } = insumoSlice.actions;
export default insumoSlice.reducer; 