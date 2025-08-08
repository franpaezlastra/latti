import { createReducer } from "@reduxjs/toolkit";
import { 
  loadMovimientosInsumo, 
  createMovimientoInsumo, 
  fetchMovimientosInsumo, 
  deleteMovimientoInsumo 
} from "../actions/movimientoInsumoActions.js";

const initialState = {
  movimientos: [],
  loading: false,
  error: null,
};

const movimientoInsumoReducer = createReducer(initialState, (builder) => {
  builder
    // Cargar movimientos
    .addCase(loadMovimientosInsumo.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(loadMovimientosInsumo.fulfilled, (state, action) => {
      state.loading = false;
      state.movimientos = action.payload;
    })
    .addCase(loadMovimientosInsumo.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error.message;
    })

    // Crear movimiento
    .addCase(createMovimientoInsumo.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(createMovimientoInsumo.fulfilled, (state, action) => {
      state.loading = false;
      // No agregamos el payload porque el backend solo devuelve {mensaje, id}
      // La lista se recargará desde el componente
    })
    .addCase(createMovimientoInsumo.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error.message;
    })

    // Fetch movimientos
    .addCase(fetchMovimientosInsumo.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchMovimientosInsumo.fulfilled, (state, action) => {
      state.loading = false;
      state.movimientos = action.payload;
    })
    .addCase(fetchMovimientosInsumo.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error.message;
    })

    // Eliminar movimiento
    .addCase(deleteMovimientoInsumo.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(deleteMovimientoInsumo.fulfilled, (state, action) => {
      state.loading = false;
      state.movimientos = state.movimientos.filter(mov => mov.id !== action.payload.id);
    })
    .addCase(deleteMovimientoInsumo.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error.message;
    });
});

export default movimientoInsumoReducer; 