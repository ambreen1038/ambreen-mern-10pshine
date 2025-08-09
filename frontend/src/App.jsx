import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard from './pages/Dashboard';
import NoteEditor from './pages/NoteEditor';
import NotFoundPage from './pages/NotFoundPage';
import PrivateRoute from './routes/PrivateRoute';
import UserProfile from './pages/UserProfile';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import './index.css';

export default function App() {
  const { loading, initialized, isAuthenticated } = useAuth();

  if (!initialized || loading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignUpPage />}
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/notes/new" element={<NoteEditor />} />
          <Route path="/notes/:id" element={<NoteEditor />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Toast Container should be outside Routes */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
