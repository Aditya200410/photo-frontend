import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
                V
              </div>
              <span className="font-bold text-xl text-slate-800 tracking-tight hidden sm:block">
                VoterDir
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link to="/account" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Account
            </Link>
            <button 
              onClick={handleLogout}
              className="text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
