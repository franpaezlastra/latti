import { createReducer } from "@reduxjs/toolkit";
import {
  createMovimientoProducto,
  loadMovimientosProducto,
  fetchMovimientosProducto,
  deleteMovimientoProducto,
  createVentaPorLotes,
} from "../actions/movimientoProductoActions.js";

const initialState = {
  movimientos: [],
  loading: false,
  error: null,
};

const movimientoProductoReducer = createReducer(initialState, (builder) => {
  builder
    // Cargar movimientos
    .addCase(loadMovimientosProducto.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(loadMovimientosProducto.fulfilled, (state, action) => {
      state.loading = false;
      state.movimientos = action.payload;
    })
    .addCase(loadMovimientosProducto.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error.message;
    })

    // Crear movimiento
    .addCase(createMovimientoProducto.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(createMovimientoProducto.fulfilled, (state, action) => {
      state.loading = false;
      // No agregamos el payload porque el backend solo devuelve {mensaje, id}
      // La lista se recargará desde el componente
    })
    .addCase(createMovimientoProducto.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error.message;
    })

    // Fetch movimientos
    .addCase(fetchMovimientosProducto.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchMovimientosProducto.fulfilled, (state, action) => {
      state.loading = false;
      state.movimientos = action.payload;
    })
    .addCase(fetchMovimientosProducto.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error.message;
    })

    // Eliminar movimiento
    .addCase(deleteMovimientoProducto.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(deleteMovimientoProducto.fulfilled, (state, action) => {
      state.loading = false;
      state.movimientos = state.movimientos.filter(mov => mov.id !== action.payload.id);
    })
    .addCase(deleteMovimientoProducto.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error.message;
    })

    // Crear venta por lotes
    .addCase(createVentaPorLotes.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(createVentaPorLotes.fulfilled, (state, action) => {
      state.loading = false;
      // No agregamos el payload porque el backend solo devuelve {mensaje, id}
      // La lista se recargará desde el componente
    })
    .addCase(createVentaPorLotes.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error.message;
    });
});

export default movimientoProductoReducer; 