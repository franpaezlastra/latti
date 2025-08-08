import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './constants/routes.js';
import ProtectedRoute from './components/layout/ProtectedRoute/ProtectedRoute.jsx';
import MainLayout from './components/layout/MainLayout/MainLayout.jsx';
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import ProductosPage from './components/features/productos/ProductosPage.jsx';
import Movements from './pages/Movements/Movements.jsx';
import { useAuth } from './hooks/useAuth.js';

// Páginas temporales para las otras secciones
const Insumos = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Insumos</h1>
      <p className="mt-1 text-sm text-gray-500">
        Gestión de insumos y materias primas
      </p>
    </div>
    <div className="card p-6">
      <p className="text-gray-500 text-center">
        Página de insumos en desarrollo...
      </p>
    </div>
  </div>
);

const Lots = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Lotes</h1>
      <p className="mt-1 text-sm text-gray-500">
        Gestión de lotes y control de vencimientos
      </p>
    </div>
    <div className="card p-6">
      <p className="text-gray-500 text-center">
        Página de lotes en desarrollo...
      </p>
    </div>
  </div>
);

const App = () => {
  const { isAuthenticated, loading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Ruta de login (página principal) */}
      <Route 
        path={ROUTES.LOGIN} 
        element={
          isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Login />
        } 
      />
      
      {/* Ruta de registro */}
      <Route 
        path={ROUTES.REGISTER} 
        element={
          isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Register />
        } 
      />
      
      {/* Layout Admin con rutas protegidas */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="productos" element={<ProductosPage />} />
        <Route path="insumos" element={<Insumos />} />
        <Route path="movimientos" element={<Movements />} />
        <Route path="lots" element={<Lots />} />
      </Route>
      
      {/* Redirección por defecto */}
      <Route
        path="*"
        element={
          isAuthenticated ? (
            <Navigate to={ROUTES.DASHBOARD} replace />
          ) : (
            <Navigate to={ROUTES.LOGIN} replace />
          )
        }
      />
    </Routes>
  );
};

export default App;
