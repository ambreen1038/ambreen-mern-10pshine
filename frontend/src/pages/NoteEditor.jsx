// src/pages/NoteEditor.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getNote, createNote, updateNote } from '../services/notes';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import './NoteEditor.css';

export default function NoteEditor() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (isEdit) {
      getNote(id)
        .then(res => {
          setTitle(res.data.title);
          setBody(res.data.body);
        })
        .catch(() => navigate('/dashboard'));
    }
  }, [id, isEdit, navigate]);

  const submit = async e => {
    e.preventDefault();
    try {
      if (isEdit) await updateNote(id, { title, body });
      else await createNote({ title, body });
      toast.success(`Note ${isEdit ? 'updated' : 'created'} successfully!`);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="editor-container">
        <form onSubmit={submit}>
          <input
            id="note-title"
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="form-control mb-3"
          />
          <ReactQuill theme="snow" value={body} onChange={setBody} />
          <div className="editor-actions">
            <button type="submit" className="btn btn-primary">
              {isEdit ? 'Update Note' : 'Create Note'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
