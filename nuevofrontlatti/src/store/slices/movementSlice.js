import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';
import { API_ENDPOINTS } from '../../constants/api.js';

// Async thunks
export const fetchProductMovements = createAsyncThunk(
  'movements/fetchProductMovements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_ENDPOINTS.MOVEMENTS.PRODUCTS.BASE);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al cargar movimientos de productos'
      );
    }
  }
);

export const fetchInsumoMovements = createAsyncThunk(
  'movements/fetchInsumoMovements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_ENDPOINTS.MOVEMENTS.INSUMOS.BASE);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al cargar movimientos de insumos'
      );
    }
  }
);

export const createProductMovement = createAsyncThunk(
  'movements/createProductMovement',
  async (movementData, { rejectWithValue }) => {
    try {
      const response = await api.post(API_ENDPOINTS.MOVEMENTS.PRODUCTS.BASE, movementData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al crear movimiento de producto'
      );
    }
  }
);

export const createInsumoMovement = createAsyncThunk(
  'movements/createInsumoMovement',
  async (movementData, { rejectWithValue }) => {
    try {
      const response = await api.post(API_ENDPOINTS.MOVEMENTS.INSUMOS.BASE, movementData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al crear movimiento de insumo'
      );
    }
  }
);

// Estado inicial
const initialState = {
  productMovements: [],
  insumoMovements: [],
  loading: false,
  error: null,
  selectedMovement: null,
};

// Slice
const movementSlice = createSlice({
  name: 'movements',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedMovement: (state, action) => {
      state.selectedMovement = action.payload;
    },
    clearSelectedMovement: (state) => {
      state.selectedMovement = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch product movements
    builder
      .addCase(fetchProductMovements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductMovements.fulfilled, (state, action) => {
        state.loading = false;
        state.productMovements = action.payload;
        state.error = null;
      })
      .addCase(fetchProductMovements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch insumo movements
      .addCase(fetchInsumoMovements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInsumoMovements.fulfilled, (state, action) => {
        state.loading = false;
        state.insumoMovements = action.payload;
        state.error = null;
      })
      .addCase(fetchInsumoMovements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create product movement
      .addCase(createProductMovement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProductMovement.fulfilled, (state, action) => {
        state.loading = false;
        state.productMovements.push(action.payload);
        state.error = null;
      })
      .addCase(createProductMovement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create insumo movement
      .addCase(createInsumoMovement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInsumoMovement.fulfilled, (state, action) => {
        state.loading = false;
        state.insumoMovements.push(action.payload);
        state.error = null;
      })
      .addCase(createInsumoMovement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setSelectedMovement, clearSelectedMovement } = movementSlice.actions;
export default movementSlice.reducer; 