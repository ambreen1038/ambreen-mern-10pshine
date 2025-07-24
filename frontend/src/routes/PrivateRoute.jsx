// src/routes/PrivateRoute.jsx

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function PrivateRoute() {
  const token = localStorage.getItem('token');
  const location = useLocation();

  return token ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
}
