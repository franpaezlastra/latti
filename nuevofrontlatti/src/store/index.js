import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/authReducer.js";
import productosReducer from "./reducers/productosReducer.js";
import insumoSlice from "./slices/insumoSlice.js";
import movimientoInsumoReducer from "./reducers/movimientoInsumoReducer.js";
import movimientoProductoReducer from "./reducers/movimientoProductoReducer.js";

const store = configureStore({
  reducer: {
    auth: authReducer,
    productos: productosReducer,
    insumos: insumoSlice,
    movimientosInsumo: movimientoInsumoReducer,
    movimientosProducto: movimientoProductoReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store; 