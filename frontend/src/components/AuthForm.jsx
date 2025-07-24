// src/components/AuthForm/AuthForm.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AuthForm.module.css';

export default function AuthForm({ title, fields, onSubmit, footerText, footerLink }) {
  return (
    <div className={`${styles.wrapper} bg-light`}>
      <div className={`${styles.inner} bg-white shadow`}>
        <h2 className="text-center mb-4">{title}</h2>
        <form onSubmit={onSubmit}>
          {fields.map((f, i) => (
            <div key={i} className="mb-3">
              <label htmlFor={`field-${i}`} className="form-label">
                {f.label}
              </label>
              <input
                id={`field-${i}`}
                type={f.type}
                className="form-control"
                value={f.value}
                onChange={f.onChange}
                required
                autoFocus={i === 0}
              />
            </div>
          ))}
          <button type="submit" className="btn btn-primary w-100">
            {title}
          </button>
        </form>

        <div className="mt-3 text-center">
          {footerText}{' '}
          <Link to={footerLink.href}>{footerLink.label}</Link>
        </div>
      </div>
    </div>
  );
}
