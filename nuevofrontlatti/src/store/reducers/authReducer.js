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
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    localStorage.removeItem('user');
    return null;
  }
};

const initialState = {
  user: getStoredUser(),
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
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