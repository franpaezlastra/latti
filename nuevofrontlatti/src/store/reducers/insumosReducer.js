import { createReducer } from "@reduxjs/toolkit";
import { loadInsumos, createInsumo, deleteInsumo, updateInsumo } from "../actions/insumoActions.js";

const initialState = {
  insumos: [],
  status: "idle",
  error: null,
  createStatus: "idle",
  createError: null,
  deleteStatus: "idle",
  deleteError: null,
  updateStatus: "idle",
  updateError: null,
};

const insumosReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(loadInsumos.pending, (state) => {
      state.status = "loading";
      state.error = null;
    })
    .addCase(loadInsumos.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.insumos = action.payload;
    })
    .addCase(loadInsumos.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    })

    .addCase(createInsumo.pending, (state) => {
      state.createStatus = "loading";
      state.createError = null;
    })
    .addCase(createInsumo.fulfilled, (state) => {
      state.createStatus = "succeeded";
    })
    .addCase(createInsumo.rejected, (state, action) => {
      state.createStatus = "failed";
      state.createError = action.payload;
    })

    // Eliminar insumo
    .addCase(deleteInsumo.pending, (state) => {
      state.deleteStatus = "loading";
      state.deleteError = null;
    })
    .addCase(deleteInsumo.fulfilled, (state, action) => {
      state.deleteStatus = "succeeded";
      state.insumos = state.insumos.filter(i => i.id !== action.payload);
    })
    .addCase(deleteInsumo.rejected, (state, action) => {
      state.deleteStatus = "failed";
      state.deleteError = action.payload;
    })

    // Actualizar insumo
    .addCase(updateInsumo.pending, (state) => {
      state.updateStatus = "loading";
      state.updateError = null;
    })
    .addCase(updateInsumo.fulfilled, (state, action) => {
      state.updateStatus = "succeeded";
      state.insumos = state.insumos.map(i =>
        i.id === action.payload.id ? action.payload : i
      );
    })
    .addCase(updateInsumo.rejected, (state, action) => {
      state.updateStatus = "failed";
      state.updateError = action.payload;
    });
});

export default insumosReducer; 