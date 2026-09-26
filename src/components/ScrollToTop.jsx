import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // A small timeout ensures that the DOM has updated before we scroll
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 10);
    
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
