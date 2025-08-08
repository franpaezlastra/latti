import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { loginUser, loadCriticalData } from '../../store/actions/authActions.js';
import { ROUTES } from '../../constants/routes.js';
import { MESSAGES } from '../../constants/messages.js';
import Button from '../../components/common/Button/Button.jsx';
import Input from '../../components/common/Input/Input.jsx';
import logo from '../../assets/logoazul.png';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loginStatus, loginError, loading } = useSelector((state) => state.auth);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      // Login
      await dispatch(loginUser({
        username: data.username,
        password: data.password
      })).unwrap();
      
      // Cargar datos críticos en background
      dispatch(loadCriticalData());
      
      toast.success(MESSAGES.SUCCESS.LOGIN);
      
      // Redirigir al dashboard después del login exitoso
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (error) {
      toast.error(error || MESSAGES.ERROR.LOGIN_FAILED);
    }
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-600 via-blue-400 to-blue-200 px-4">
      <div className="flex flex-col items-center w-full max-w-md bg-white/90 p-10 rounded-2xl shadow-2xl backdrop-blur-md">
        <img src={logo} alt="Logo Latti" className="w-[180px] mb-8 drop-shadow-lg" />
        
        <form className="w-full space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Usuario"
            type="text"
            placeholder="Ingrese su usuario"
            {...register('username')}
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            {...register('password')}
          />

          <div>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loginStatus === 'loading'}
              disabled={loginStatus === 'loading'}
            >
              {loginStatus === 'loading' ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
            </Button>
          </div>

          {loginError && (
            <div className="text-sm text-danger-600 text-center">
              {loginError}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login; 