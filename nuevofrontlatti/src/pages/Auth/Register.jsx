import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { registerUser } from '../../store/actions/authActions.js';
import { ROUTES } from '../../constants/routes.js';
import { MESSAGES } from '../../constants/messages.js';
import { Button, Input } from 'src/components/ui';
import logo from '../../assets/logoazul.png';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { registerStatus, registerError } = useSelector((state) => state.auth);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      await dispatch(registerUser({
        username: data.username,
        password: data.password
      })).unwrap();
      
      toast.success('Usuario registrado exitosamente');
      navigate(ROUTES.LOGIN);
    } catch (error) {
      toast.error(error || 'Error al registrar usuario');
    }
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-600 via-blue-400 to-blue-200 px-4">
      <div className="flex flex-col items-center w-full max-w-md bg-white/90 p-10 rounded-2xl shadow-2xl backdrop-blur-md">
        <img src={logo} alt="Logo Latti" className="w-[180px] mb-8 drop-shadow-lg" />
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold font-maderon text-gray-900">Crear Cuenta</h2>
          <p className="text-gray-600 mt-2">Regístrate en el sistema</p>
        </div>
        
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

          <Input
            label="Confirmar Contraseña"
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword')}
          />

          <div>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={registerStatus === 'loading'}
              disabled={registerStatus === 'loading'}
            >
              {registerStatus === 'loading' ? 'Registrando...' : 'Registrarse'}
            </Button>
          </div>

          {registerError && (
            <div className="text-sm text-danger-600 text-center">
              {registerError}
            </div>
          )}
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link
              to={ROUTES.LOGIN}
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 