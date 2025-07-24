// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate} from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { login } from '../services/auth';
import { toast } from 'react-toastify';
import bg from '../assets/bg.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    try {
      const { data } = await login({ email, password });
      localStorage.setItem('token', data.token);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
      console.error('Login error:', err);
    }
  };

  return (
    <div
      className="auth-background"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="auth-overlay">
        <AuthForm
          title="Sign In"
          fields={[
            { label: 'Email address', type: 'email', value: email, onChange: e => setEmail(e.target.value) },
            { label: 'Password', type: 'password', value: password, onChange: e => setPassword(e.target.value) },
          ]}
          onSubmit={submit}
          footerText="Don't have an account?"
          footerLink={{ href: '/signup', label: 'Create one' }}
        />
      </div>
    </div>
  );
}
