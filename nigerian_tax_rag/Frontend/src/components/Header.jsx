import React from 'react';
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

function Header({ isAuthenticated, user, isDarkMode, onNavigate }) {
  const borderClass = isDarkMode ? 'border-green-700' : 'border-green-300';

  return (
    <div className={`border-b ${borderClass} p-4 ${isDarkMode?"bg-gray-300":"bg-white"}  `}>
      <div className="max-w-6xl mx-auto flex items-center justify-between md:pl-64 lg:pl-72">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => onNavigate('home')}
        >
         <img src= {logo} alt="TaxQA NG logo" className='w-10 h-10' />
          
        </div>

        {!isAuthenticated ? (
          <div className="flex gap-4">
            <button
              onClick={() => onNavigate("login")}
              className="text-green-600 font-medium hover:text-green-700"
            >
              Login
            </button>
            <button
              onClick={() => onNavigate("signup")}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Signup
            </button>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
            {user?.email ? user.email[0].toUpperCase() : 'U'}
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;
