import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isUserLoggedIn } from '../utils/auth';

const UserProtectedRoute = ({ children }) => {
  const location = useLocation();

  if (!isUserLoggedIn()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default UserProtectedRoute;
