import { useDispatch } from 'react-redux';
import { clearAuthState } from '../store/slices/authSlice';

/**
 * Hook personalizado para manejar el logout y limpieza de estado
 */
export const useLogout = () => {
  const dispatch = useDispatch();

  const logout = () => {
    // Limpiar estado de Redux
    dispatch(clearAuthState());
    
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Limpiar sessionStorage
    sessionStorage.clear();
    
    // Redirigir al login
    window.location.href = '/login';
  };

  return { logout };
};

export default useLogout;
