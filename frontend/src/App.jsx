// src/App.jsx
import React from 'react';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import Dashboard from './pages/Dashboard';
import NoteEditor from './pages/NoteEditor';
import PrivateRoute from './routes/PrivateRoute';

export default function App() {
  return (
    <div className="App">
      <Navbar />
      <ToastContainer position="top-center" autoClose={3000} />
      <main className="App-content">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/notes/new" element={<NoteEditor />} />
            <Route path="/notes/:id" element={<NoteEditor />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}
