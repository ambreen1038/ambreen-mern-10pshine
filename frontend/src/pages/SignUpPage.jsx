import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/auth';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    try {
      await register({ name, email, password });
      alert('Registered successfully! Please log in.');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div style={pageStyle}>
      <h2>Sign Up</h2>
      <form onSubmit={submit} style={formStyle}>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Sign Up</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

const pageStyle = { maxWidth: 400, margin: '4rem auto', textAlign: 'center' };
const formStyle = { display: 'grid', gap: '1rem', padding: '2rem', border: '1px solid #ccc', borderRadius: 8 };
