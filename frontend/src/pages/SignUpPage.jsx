// src/pages/SignUpPage.jsx

import React, { useState } from 'react';
import { useNavigate} from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { register } from '../services/auth';
import { toast } from 'react-toastify'; // Using toast notifications
import bg from '../assets/bg.png';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    try {
      await register({ name, email, password });
      toast.success('Registered successfully! You can now log in.'); // success toast
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sign-up failed'); // error toast
      console.error('Signup error:', err);
    }
  };

  return (
    <div
      className="auth-background"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="auth-overlay">
        <AuthForm
          title="Sign Up"
          fields={[
            { label: 'Name', type: 'text', value: name, onChange: e => setName(e.target.value) },
            { label: 'Email address', type: 'email', value: email, onChange: e => setEmail(e.target.value) },
            { label: 'Password', type: 'password', value: password, onChange: e => setPassword(e.target.value) },
          ]}
          onSubmit={submit}
          footerText="Already have an account?"
          footerLink={{ href: '/login', label: 'Login here' }}
        />
      </div>
    </div>
  );
}
