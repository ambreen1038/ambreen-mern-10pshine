import { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';

export default function PrivateRoute() {
  const location = useLocation();
  const { isAuthenticated, loading, error } = useAuth();
  const toastShownRef = useRef(false);

  useEffect(() => {
    // Only show toast once and when loading is complete
    if (!loading && !isAuthenticated && !toastShownRef.current) {
      const isSessionExpired = location.state?.sessionExpired || 
                             error?.message?.includes('session');
      
      toast.error(
        isSessionExpired
          ? 'Your session has expired. Please login again.'
          : 'Please login to access this page.',
        { toastId: 'auth-error' } // Prevent duplicates
      );

      toastShownRef.current = true;
    }
  }, [loading, isAuthenticated, location.state, error]);

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (error && !loading) {
    console.error('Authentication error:', error);
    // Immediate redirect if there's an auth error
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
          sessionExpired: true,
          error: error.message
        }}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
          // Only mark as expired if it's a session-related issue
          sessionExpired: error?.message?.includes('session') || false
        }}
      />
    );
  }

  return <Outlet />;
}