import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav className="w-full bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
            VD
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">Voter Directory Sys</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className={`text-sm font-semibold transition-colors ${isHome ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}>Home</Link>
          <Link to="/photo" className={`text-sm font-semibold transition-colors ${location.pathname.includes('/photo') && location.pathname !== '/' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}>Voter Slips</Link>
          <Link to="/help-center" className={`text-sm font-semibold transition-colors ${location.pathname === '/help-center' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}>Help Center</Link>
          <Link to="/contact-support" className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 hover:shadow-lg transition-all hover:-translate-y-0.5">Contact Us</Link>
        </div>
        {/* Mobile menu button could go here */}
        <div className="md:hidden flex items-center">
          <Link to="/contact-support" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition-all">Contact</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
