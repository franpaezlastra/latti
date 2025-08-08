import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header/Header.jsx';

const MainLayout = () => {
  return (
    <div className="flex h-screen">
      <div className="w-[15%] h-full">
        <Header />
      </div>
      <div className="w-[85%] bg-gray-50 overflow-hidden h-full">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout; 