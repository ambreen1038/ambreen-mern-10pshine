import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav style={navStyle}>
      <span>📝 NoteApp</span>
      {token ? <button onClick={logout}>Logout</button> : null}
    </nav>
  );
}

const navStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '1rem 2rem',
  background: '#333',
  color: 'white'
};
