import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './quill-custom.css';
import { getNoteById, createNote, updateNote } from '../services/notes';
import { toast } from 'react-toastify';

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getNoteById(id)
        .then((note) => {
          setTitle(note.title || '');
          setContent(note.content || '');
        })
        .catch(() => {
          toast.error('Error loading note');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!content.trim()) {
      toast.error('Content is required');
      return;
    }

    setSaving(true);
    try {
      const noteData = { title, content };
      if (id) {
        await updateNote(id, noteData);
        toast.success('Note updated');
      } else {
        await createNote(noteData);
        toast.success('Note created');
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.response?.data?.message || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-sky-50">
        <p className="text-center text-sky-600 py-10">Loading note...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-sky-50">
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-sky-100">
          <h1 className="text-3xl font-bold mb-6 text-sky-600">
            {id ? 'Edit Note' : 'Create Note'}
          </h1>

          <input
            type="text"
            placeholder="Enter title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 text-lg border border-sky-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 mb-4"
          />

          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            placeholder="Start writing your note..."
            className="mb-6 bg-white rounded-md border border-sky-200"
          />

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-6 py-2 rounded-md text-white font-medium transition-all shadow-sm ${
                saving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-sky-500 hover:bg-sky-600'
              }`}
            >
              {saving ? 'Saving...' : 'Save Note'}
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
