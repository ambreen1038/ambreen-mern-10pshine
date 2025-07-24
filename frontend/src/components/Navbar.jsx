// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Include Link
import styles from './Navbar.module.css';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className={styles.navbar}>
      <Link to="/dashboard" className={styles.brand}>
        📝 NoteApp
      </Link>

      <div>
        {token ? (
          <button className={styles.logoutBtn} onClick={logout}>
            Logout
          </button>
        ) : (
          <Link to="/login" className={styles.logoutBtn}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
