import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {authService} from '../services/auth';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // ✅ Manage auth status

  const navigate = useNavigate();
  const location = useLocation();
  const isMounted = useRef(true);
  const isRefreshing = useRef(false);

  const safeSetUser = useCallback((newUser) => {
    if (!isMounted.current) return;
    setUser(prev =>
      prev?.id === newUser?.id && prev?.email === newUser?.email ? prev : newUser
    );
    setIsAuthenticated(!!newUser?.id); // ✅ Set auth state
  }, []);

  const logout = useCallback(
    async ({ message = 'Logged out', redirect = true } = {}) => {
      try {
        await authService.logout();
      } catch (err) {
        console.error('Logout error:', err);
        if (isMounted.current) {
          setError({ type: 'LOGOUT_FAILED', message: 'Failed to logout' });
        }
      } finally {
        if (isMounted.current) {
          safeSetUser(null);
          setError(null);
          setIsAuthenticated(false);
        }
        toast.info(message);

        if (redirect) {
          const redirectPath =
            location.pathname !== '/login'
              ? `/login?redirect=${encodeURIComponent(location.pathname)}`
              : '/login';
          navigate(redirectPath, { replace: true });
        }
      }
    },
    [navigate, safeSetUser, location.pathname]
  );

  const refreshSession = useCallback(async () => {
    if (isRefreshing.current || !isMounted.current) return;

    isRefreshing.current = true;
    try {
      const newToken = await authService.refreshToken();
      if (newToken) {
        const userData = await authService.getCurrentUser();
        safeSetUser(userData);
        setError(null);
      }
    } catch (refreshErr) {
      await logout({
        message: 'Session expired. Please log in again.',
        redirect: true
      });
      if (isMounted.current) {
        setError({ type: 'SESSION_EXPIRED', message: refreshErr.message });
      }
    } finally {
      isRefreshing.current = false;
    }
  }, [logout, safeSetUser]);

  const loadUser = useCallback(async () => {
    if (!isMounted.current) return;

    try {
      setLoading(true);
      const userData = await authService.getCurrentUser();
      if (typeof userData?.id === 'undefined') throw new Error('Invalid user data');
      safeSetUser(userData);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        await refreshSession(); // ✅ Try to refresh token
      } else {
        if (isMounted.current) {
          setError({ type: 'AUTH_ERROR', message: err.message });
          safeSetUser(null);
        }
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setInitialized(true);
      }
    }
  }, [refreshSession, safeSetUser]);

  useEffect(() => {
    isMounted.current = true;
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (token) {
      loadUser();
    } else {
      setLoading(false);
      setInitialized(true);
    }

    return () => {
      isMounted.current = false;
    };
  }, [loadUser]);

  const login = async (email, password, remember) => {
    try {
      setAuthLoading(true);
      setError(null);
      const result = await authService.login(email, password, remember);
       console.log("🟡 AuthContext login triggered:", email, password, result);
      if (!result?.user?.id) throw new Error('Invalid login response');

      safeSetUser(result.user);
      toast.success(`Welcome back, ${result.user.name || 'User'}!`);

      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });

      return { success: true, user: result.user };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Login failed';
      if (isMounted.current) {
        setError({ type: 'LOGIN_FAILED', message: errorMsg });
      }
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setAuthLoading(false);
    }
  };

  const signup = async (formData) => {
    console.log("🟢 AuthContext.signup() entered with:", formData);
    try {
      setAuthLoading(true);
      const result = await authService.signup(formData);
      console.log("🟡 AuthContext.signup triggered:", result);
      if (!result?.user?.id) throw new Error('Invalid signup response');

      safeSetUser(result.user);
      toast.success(`Welcome, ${result.user.name || 'User'}!`);
      navigate('/dashboard');
      return { success: true, user: result.user };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Signup failed';
      if (isMounted.current) {
        setError({ type: 'SIGNUP_FAILED', message: errorMsg });
      }
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setAuthLoading(false);
    }
  };
const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  return (
    <AuthContext.Provider
      value={{
        user,
        error,
        isAuthenticated,
        loading,
        authLoading,
        initialized,
        login,
        logout,
        signup,
        refreshSession,
        safeSetUser,
        setError,
        token
      }}
    >
      {!initialized ? <LoadingSpinner fullPage /> : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
