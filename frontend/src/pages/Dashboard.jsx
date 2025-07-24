// src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import './Dashboard.css'; // for layout

export default function Dashboard() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/notes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(res.data);
    } catch (err) {
      toast.error('Failed to load notes');
      console.error('Fetch notes error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h2>Your Notes</h2>
          <button onClick={() => navigate('/notes/new')} className="btn btn-primary">
            + New Note
          </button>
        </header>

        {loading ? (
          <p>Loading your notes...</p>
        ) : notes.length === 0 ? (
          <p>No notes yet. Click “+ New Note” to start.</p>
        ) : (
          <ul className="notes-list">
            {notes.map(note => (
              <li key={note.id} className="note-item">
                <Link to={`/notes/${note.id}`} className="note-link">
                  <h3>{note.title || 'Untitled'}</h3>
                  <p dangerouslySetInnerHTML={{ __html: note.body.substring(0, 100) + '...' }} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
