import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { logoutUser } from '../../../store/actions/authActions.js';
import { ROUTES } from '../../../constants/routes.js';
import { MESSAGES } from '../../../constants/messages.js';

const NavItem = ({ to, icon: Icon, text }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isActive = location.pathname === to;
  const isLogout = text.toLowerCase() === "cerrar sesión";

  const handleLogout = async (e) => {
    if (isLogout) {
      e.preventDefault();
      try {
        await dispatch(logoutUser()).unwrap();
        toast.success(MESSAGES.SUCCESS.LOGOUT);
        navigate(ROUTES.LOGIN);
      } catch (error) {
        toast.error('Error al cerrar sesión');
      }
    }
  };

  // Clase base
  let className = "flex items-center gap-2 px-4 py-2 rounded transition-colors duration-200 text-white";

  // Agregar clase si está activo
  if (isActive) {
    className += " bg-[#aab4ff] text-black";
  } else if (isLogout) {
    className += " hover:bg-red-500 hover:text-white";
  } else {
    className += " hover:bg-[#aab4ff] hover:text-black";
  }

  return (
    <Link to={to} className={className} onClick={handleLogout}>
      {Icon && <Icon size={20} />}
      <span className="text-sm font-medium">{text}</span>
    </Link>
  );
};

export default NavItem; 