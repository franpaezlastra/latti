import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Box, 
  TrendingUp, 
  Layers,
  X
} from 'lucide-react';
import { ROUTES } from '../../../constants/routes.js';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: ROUTES.DASHBOARD,
      icon: Home,
    },
    {
      name: 'Productos',
      href: ROUTES.PRODUCTS,
      icon: Package,
    },
    {
      name: 'Insumos',
      href: ROUTES.INSUMOS,
      icon: Box,
    },
    {
      name: 'Movimientos',
      href: ROUTES.MOVEMENTS,
      icon: TrendingUp,
    },
    {
      name: 'Lotes',
      href: ROUTES.LOTS,
      icon: Layers,
    },
  ];

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 lg:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Menú</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-5 px-2 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={({ isActive: active }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    active
                      ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon
                  className={`mr-3 h-5 w-5 ${
                    isActive(item.href)
                      ? 'text-primary-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Información adicional */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Sistema de Gestión de Stock
            <br />
            v1.0.0
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 