import { createReducer } from "@reduxjs/toolkit";
import {
  loadProductos,
  getProductoById,
  crearProducto,
  deleteProducto,
  updateProducto,
  loadStockPorLotes,
} from "../actions/productosActions.js";

const initialState = {
  productos: [],
  productoSeleccionado: null,
  stockPorLotes: [],
  status: "idle",
  error: null,
  createStatus: "idle",
  createError: null,
  deleteStatus: "idle",
  deleteError: null,
  findStatus: "idle",
  findError: null,
  updateStatus: "idle",
  updateError: null,
  stockPorLotesStatus: "idle",
  stockPorLotesError: null,
};

const productosReducer = createReducer(initialState, (builder) => {
  builder
    // Cargar todos
    .addCase(loadProductos.pending, (state) => {
      state.status = "loading";
      state.error = null;
    })
    .addCase(loadProductos.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.productos = action.payload;
    })
    .addCase(loadProductos.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    })

    // Obtener uno por ID
    .addCase(getProductoById.pending, (state) => {
      state.findStatus = "loading";
      state.findError = null;
    })
    .addCase(getProductoById.fulfilled, (state, action) => {
      state.findStatus = "succeeded";
      state.productoSeleccionado = action.payload;
    })
    .addCase(getProductoById.rejected, (state, action) => {
      state.findStatus = "failed";
      state.findError = action.payload;
    })

    // Crear
    .addCase(crearProducto.pending, (state) => {
      state.createStatus = "loading";
      state.createError = null;
    })
    .addCase(crearProducto.fulfilled, (state, action) => {
      state.createStatus = "succeeded";
      // ✅ ARREGLADO: Agregar el nuevo producto al estado local inmediatamente
      // Esto hará que aparezca inmediatamente en el dashboard
      const nuevoProducto = action.payload.producto || action.payload;
      if (nuevoProducto && nuevoProducto.id) {
        // Verificar que no esté duplicado
        const existe = state.productos.find(p => p.id === nuevoProducto.id);
        if (!existe) {
          state.productos.push(nuevoProducto);
          console.log('✅ Producto agregado al estado local:', nuevoProducto.nombre);
        }
      }
    })
    .addCase(crearProducto.rejected, (state, action) => {
      state.createStatus = "failed";
      state.createError = action.payload;
    })

    // Eliminar
    .addCase(deleteProducto.pending, (state) => {
      state.deleteStatus = "loading";
      state.deleteError = null;
    })
    .addCase(deleteProducto.fulfilled, (state, action) => {
      state.deleteStatus = "succeeded";
      state.productos = state.productos.filter(p => p.id !== action.payload);
    })
    .addCase(deleteProducto.rejected, (state, action) => {
      state.deleteStatus = "failed";
      state.deleteError = action.payload;
    })

    // Actualizar producto
    .addCase(updateProducto.pending, (state) => {
      state.updateStatus = "loading";
      state.updateError = null;
    })
    .addCase(updateProducto.fulfilled, (state, action) => {
      state.updateStatus = "succeeded";
      state.productos = state.productos.map(p =>
        p.id === action.payload.id ? action.payload : p
      );
    })
    .addCase(updateProducto.rejected, (state, action) => {
      state.updateStatus = "failed";
      state.updateError = action.payload;
    })

    // Stock por lotes
    .addCase(loadStockPorLotes.pending, (state) => {
      state.stockPorLotesStatus = "loading";
      state.stockPorLotesError = null;
    })
    .addCase(loadStockPorLotes.fulfilled, (state, action) => {
      state.stockPorLotesStatus = "succeeded";
      state.stockPorLotes = action.payload;
    })
    .addCase(loadStockPorLotes.rejected, (state, action) => {
      state.stockPorLotesStatus = "failed";
      state.stockPorLotesError = action.payload;
    });
});

export default productosReducer; 