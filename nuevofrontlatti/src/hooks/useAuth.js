import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthStatus } from '../store/actions/authActions.js';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    // Verificar si hay un token al cargar la aplicación
    const token = localStorage.getItem('token');
    if (token && !auth.isAuthenticated) {
      dispatch(checkAuthStatus());
    }
  }, [dispatch, auth.isAuthenticated]);

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
    error: auth.error,
    loginStatus: auth.loginStatus,
    registerStatus: auth.registerStatus,
    logoutStatus: auth.logoutStatus,
  };
}; 