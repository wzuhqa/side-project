import { useEffect } from 'react';
import { useLocation, Routes, Route } from 'react-router-dom';

// ScrollToTop component
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Routes component (wrapper for react-router-dom Routes)
export { Routes, Route } from 'react-router-dom';
