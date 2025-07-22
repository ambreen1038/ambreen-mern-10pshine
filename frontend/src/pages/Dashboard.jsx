import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const token = localStorage.getItem('token');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Could fetch user profile, for now mock
    setUser({ name: 'Test User', email: 'test@example.com' });
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>Dashboard</h2>
      <p>Welcome, {user?.name}!</p>
      <p>🎉 You are successfully logged in.</p>
      <Link to="#">Go build your Notes (coming soon)&rarr;</Link>
    </div>
  );
}
