import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [lang, setLang] = useState('en');

  useEffect(() => {
    // Check if there's already a cookie explicitly for hindi
    const isHi = document.cookie.includes('googtrans=/en/hi');
    
    if (isHi) {
      setLang('hi');
    } else {
      // Force clear any unwanted googtrans cookies (like /auto/hi) to prevent random auto-translation
      const domain = window.location.hostname;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain}`;
    }

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
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false
            },
            'google_translate_element'
          );
        }
      };
    }
  }, []);

  const changeLanguage = (targetLang) => {
    if (targetLang === lang) return;
    
    const domain = window.location.hostname;
    
    if (targetLang === 'en') {
      // Clear cookies to revert from Google Translate
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain}`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `googtrans=/en/en; path=/; domain=${domain}`;
      document.cookie = `googtrans=/en/en; path=/;`;
    } else {
      // Set cookie to automatically translate to target language on load
      document.cookie = `googtrans=/en/${targetLang}; path=/;`;
      document.cookie = `googtrans=/en/${targetLang}; path=/; domain=${domain}`;
      document.cookie = `googtrans=/en/${targetLang}; path=/; domain=.${domain}`;
    }
    
    // Reloading is the most reliable way to force Google Translate to apply/remove the language
    window.location.reload();
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
          {/* Custom Language Dropdown */}
          <div className="relative group">
            <select
              value={lang}
              onChange={(e) => changeLanguage(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 cursor-pointer shadow-sm group-hover:shadow"
            >
              <option value="en">English (EN)</option>
              <option value="hi">हिंदी (HI)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 group-hover:text-blue-500 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
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
