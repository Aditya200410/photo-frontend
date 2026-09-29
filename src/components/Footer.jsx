import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-auto text-slate-300 py-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="col-span-1 md:col-span-6 lg:col-span-4">
          <Link to="/" className="flex items-center gap-3 mb-6 group inline-flex">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              VD
            </div>
            <span className="text-xl font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">Voter Directory Sys</span>
          </Link>
          <p className="text-slate-400 text-sm leading-relaxed mb-6 pr-4">
            Empowering electoral bodies with seamless data management, slip generation, and directory structuring across all administrative levels.
          </p>
        </div>

        <div className="col-span-1 md:col-span-3 lg:col-span-4 lg:justify-self-center">
          <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Services</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li><Link to="/?view=assembly" className="hover:text-blue-400 transition-colors">Assembly Directories</Link></li>
            <li><Link to="/?view=nagar-nigam" className="hover:text-emerald-400 transition-colors">Nagar Nigam Directories</Link></li>
            <li><Link to="/?view=gram-panchayat" className="hover:text-violet-400 transition-colors">Panchayat Directories</Link></li>
            <li><Link to="/photo" className="hover:text-white transition-colors">Print Voter Slips</Link></li>
          </ul>
        </div>

        <div className="col-span-1 md:col-span-3 lg:col-span-4 lg:justify-self-end">
          <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Legal & Support</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
            <li><Link to="/contact-support" className="hover:text-white transition-colors">Contact Support</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
        <div>
          &copy; {new Date().getFullYear()} Voter Directory System. All rights reserved.
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Twitter</a>
          <a href="#" className="hover:text-white transition-colors">Instagram</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
