import React from 'react';
import logo from "../../../assets/logoblanco.png";
import NavBar from './NavBar.jsx';

const Header = () => {
  return (
    <header className="bg-[#2536dd] flex flex-col h-full">
      <div className="flex justify-center py-2">
        <img src={logo} alt="Logo" className="w-[150px] object-contain" />
      </div>
      <div className="flex-1 flex flex-col">
        <NavBar />
      </div>
    </header>
  );
};

export default Header; 