import React from "react";
import { ShoppingCart, BarChart3, Home, LogOut } from "lucide-react";
import NavItem from "./NavItem.jsx";
import { ROUTES } from "../../../constants/routes.js";

const NavBar = () => {
  return (
    <nav className="h-full flex flex-col px-2 py-4">
      <div className="flex flex-col justify-between h-full">
        <div className="flex flex-col gap-2 text-white">
          <NavItem to={ROUTES.DASHBOARD} icon={Home} text="Dashboard" />
          <NavItem to={ROUTES.PRODUCTS} icon={ShoppingCart} text="Productos e insumos" />
          <NavItem to={ROUTES.MOVEMENTS} icon={BarChart3} text="Movimientos" />
        </div>

        <div className="text-white">
          <NavItem to={ROUTES.LOGOUT} icon={LogOut} text="Cerrar sesión" />
        </div>
      </div>
    </nav>
  );
};

export default NavBar; 