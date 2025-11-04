import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthStatus } from '../store/actions/authActions.js';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Si no hay token, no hacer nada - mostrar login inmediatamente
    if (!token) {
      return;
    }
    
    // Solo verificar una vez si hay token
    if (token && !hasCheckedRef.current) {
      hasCheckedRef.current = true;
      dispatch(checkAuthStatus());
    }
  }, [dispatch]);

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