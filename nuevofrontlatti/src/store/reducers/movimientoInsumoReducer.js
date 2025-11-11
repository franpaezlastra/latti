import { createReducer } from "@reduxjs/toolkit";
import { 
  loadMovimientosInsumo, 
  createMovimientoInsumo, 
  fetchMovimientosInsumo, 
  deleteMovimientoInsumo,
  validarEdicionMovimiento,
  updateMovimientoInsumo
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
      // Mantener el estado actual para no disparar el spinner global
      state.loading = state.loading;
      // ✅ NO limpiar el error aquí para que la página no se actualice
    })
    .addCase(createMovimientoInsumo.fulfilled, (state, action) => {
      state.loading = false;
      // No agregamos el payload porque el backend solo devuelve {mensaje, id}
      // La lista se recargará desde el componente
    })
    .addCase(createMovimientoInsumo.rejected, (state, action) => {
      state.loading = false;
      // ✅ NO guardar el error en el estado global - el modal lo maneja localmente
      // state.error = action.payload || action.error.message;
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
      // Mantener el estado actual para no disparar el spinner global
      state.loading = state.loading;
      // ✅ NO limpiar el error aquí
    })
    .addCase(deleteMovimientoInsumo.fulfilled, (state, action) => {
      state.loading = false;
      state.movimientos = state.movimientos.filter(mov => mov.id !== action.payload.id);
    })
    .addCase(deleteMovimientoInsumo.rejected, (state, action) => {
      state.loading = false;
      // ✅ NO guardar el error en el estado global - el componente lo maneja localmente
      // state.error = action.payload || action.error.message;
    })

    // Validar edición - NO cambiar el estado global para evitar re-renders
    // Las validaciones se manejan completamente en el componente
    .addCase(validarEdicionMovimiento.pending, (state) => {
      // No cambiar loading para evitar re-renders innecesarios
      // La validación es solo para el componente
    })
    .addCase(validarEdicionMovimiento.fulfilled, (state, action) => {
      // No cambiar loading para evitar re-renders innecesarios
      // La validación se maneja en el componente
    })
    .addCase(validarEdicionMovimiento.rejected, (state, action) => {
      // No cambiar loading para evitar re-renders innecesarios
      // El error se maneja en el componente
    })

    // Actualizar movimiento
    .addCase(updateMovimientoInsumo.pending, (state) => {
      // Mantener el estado actual para no disparar el spinner global
      state.loading = state.loading;
      // ✅ NO limpiar el error aquí
    })
    .addCase(updateMovimientoInsumo.fulfilled, (state, action) => {
      state.loading = false;
      // No actualizamos directamente porque el backend puede devolver solo {mensaje}
      // La lista se recargará desde el componente
    })
    .addCase(updateMovimientoInsumo.rejected, (state, action) => {
      state.loading = false;
      // ✅ NO guardar el error en el estado global - el componente lo maneja localmente
      // state.error = action.payload || action.error.message;
    });
});

export default movimientoInsumoReducer; 