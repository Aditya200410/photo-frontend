import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [lang, setLang] = useState('en');

  useEffect(() => {
    // Add Google Translate script if it doesn't exist
    if (!document.getElementById('google-translate-script')) {
      const addScript = document.createElement('script');
      addScript.setAttribute('src', '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit');
      addScript.id = 'google-translate-script';
      document.body.appendChild(addScript);

      window.googleTranslateElementInit = () => {
        if (window.google && window.google.translate) {
          new window.google.translate.TranslateElement(
            { 
              pageLanguage: 'en', 
              includedLanguages: 'en,hi', // Only English and Hindi
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE 
            },
            'google_translate_element'
          );
        }
      };
    }
    
    // Check if there's already a cookie for hindi
    if (document.cookie.includes('googtrans=/en/hi')) {
      setLang('hi');
    }
  }, []);

  const changeLanguage = (targetLang) => {
    if (targetLang === lang) return;
    
    if (targetLang === 'en') {
      // To reliably revert from Google Translate, clear cookies and reload
      const domain = window.location.hostname;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      window.location.reload();
    } else {
      const selectField = document.querySelector('.goog-te-combo');
      if (selectField) {
        selectField.value = targetLang;
        selectField.dispatchEvent(new Event('change'));
        setLang(targetLang);
      }
    }
  };

  return (
    <nav className="w-full bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
            VD
          </div>
          <span className="hidden sm:block text-xl font-bold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">Voter Directory</span>
        </Link>
        
        <div className="flex items-center gap-4 md:gap-6 ml-auto">
          {/* Custom Language Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button 
              onClick={() => changeLanguage('en')}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${lang === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              EN
            </button>
            <button 
              onClick={() => changeLanguage('hi')}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${lang === 'hi' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              HI
            </button>
          </div>

          {/* Hidden Google Translate Widget */}
          <div id="google_translate_element" className="absolute opacity-0 pointer-events-none -z-10 w-0 h-0 overflow-hidden"></div>
          
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className={`text-sm font-semibold transition-colors ${isHome ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}>Home</Link>
            <Link to="/photo" className={`text-sm font-semibold transition-colors ${location.pathname.includes('/photo') && location.pathname !== '/' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}>Voter Slips</Link>
            <Link to="/contact-support" className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 hover:shadow-lg transition-all hover:-translate-y-0.5">Contact Us</Link>
          </div>

          <div className="md:hidden flex items-center">
            <Link to="/contact-support" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition-all">Contact</Link>
          </div>
        </div>
      </div>
      
      <style>{`
        /* Hide the top Google Translate toolbar */
        .skiptranslate iframe { display: none !important; }
        body { top: 0px !important; }
        /* Style the select dropdown */
        .goog-te-combo {
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background-color: #f8fafc;
          color: #334155;
          font-size: 0.875rem;
          font-weight: 600;
          outline: none;
          cursor: pointer;
          max-width: 130px;
        }
        .goog-te-combo:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
        /* Hide powered by Google logo */
        .goog-logo-link { display: none !important; }
        .goog-te-gadget { color: transparent !important; font-size: 0 !important; }
        
        /* Fix mobile padding bug introduced by Google Translate */
        .goog-te-banner-frame { display: none !important; }
      `}</style>
    </nav>
  );
};

export default Navbar;
