import { createReducer } from "@reduxjs/toolkit";
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  checkAuthStatus 
} from "../actions/authActions.js";

const getStoredUser = () => {
  try {
    const user = localStorage.getItem('user');
    // Verificar que no sea null, undefined o la cadena "undefined"
    if (user && user !== 'null' && user !== 'undefined') {
      return JSON.parse(user);
    }
    return null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    localStorage.removeItem('user');
    return null;
  }
};

const storedToken = localStorage.getItem('token');
const storedUser = getStoredUser();

// Si hay token y usuario en localStorage, asumir sesión válida inicialmente
// Esto previene redirecciones innecesarias al login durante la carga inicial
// La validación real se hará con checkAuthStatus
const hasValidLocalStorage = storedToken && storedUser && storedUser.username;

const initialState = {
  user: storedUser,
  token: storedToken || null,
  // Si hay token y usuario en localStorage, asumir autenticado temporalmente
  // Esto evita la redirección al login durante la carga inicial
  // checkAuthStatus validará con el backend y actualizará este estado
  isAuthenticated: hasValidLocalStorage,
  // Si hay token, arrancamos en loading hasta validar con checkAuthStatus
  loading: !!storedToken,
  error: null,
  loginStatus: "idle",
  loginError: null,
  registerStatus: "idle",
  registerError: null,
  logoutStatus: "idle",
  logoutError: null,
};

const authReducer = createReducer(initialState, (builder) => {
  builder
    // Login
    .addCase(loginUser.pending, (state) => {
      state.loginStatus = "loading";
      state.loginError = null;
      state.loading = true;
    })
    .addCase(loginUser.fulfilled, (state, action) => {
      state.loginStatus = "succeeded";
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      // Guardar user en localStorage
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    })
    .addCase(loginUser.rejected, (state, action) => {
      state.loginStatus = "failed";
      state.loading = false;
      state.loginError = action.payload;
      state.error = action.payload;
    })

    // Register
    .addCase(registerUser.pending, (state) => {
      state.registerStatus = "loading";
      state.registerError = null;
      state.loading = true;
    })
    .addCase(registerUser.fulfilled, (state, action) => {
      state.registerStatus = "succeeded";
      state.loading = false;
      state.user = action.payload.user;
      state.error = null;
      // Guardar user en localStorage
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    })
    .addCase(registerUser.rejected, (state, action) => {
      state.registerStatus = "failed";
      state.loading = false;
      state.registerError = action.payload;
      state.error = action.payload;
    })

    // Logout
    .addCase(logoutUser.pending, (state) => {
      state.logoutStatus = "loading";
      state.logoutError = null;
      state.loading = true;
    })
    .addCase(logoutUser.fulfilled, (state) => {
      state.logoutStatus = "succeeded";
      state.loading = false;
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    })
    .addCase(logoutUser.rejected, (state, action) => {
      state.logoutStatus = "failed";
      state.loading = false;
      state.logoutError = action.payload;
      state.error = action.payload;
    })

    // Check Auth Status
    .addCase(checkAuthStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(checkAuthStatus.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    })
    .addCase(checkAuthStatus.rejected, (state, action) => {
      state.loading = false;
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = action.payload;
    });
});

export default authReducer; 