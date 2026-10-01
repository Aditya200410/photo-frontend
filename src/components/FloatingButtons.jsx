import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const FloatingButtons = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-8 left-8 z-50">
        <Link to="/contact-support" className="bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center" title="Contact Us">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </Link>
      </div>

      <div className={`fixed bottom-8 right-8 z-50 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <button onClick={scrollToTop} className="bg-slate-800 text-white w-14 h-14 rounded-full shadow-lg hover:bg-slate-700 hover:-translate-y-1 transition-all flex items-center justify-center" title="Scroll to Top">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>
    </>
  );
};

export default FloatingButtons;
