import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/solid';
import dayjs from 'dayjs';
import { downloadTextFile } from '../../services/download'; // <-- import your download helper

const COLORS = [
  'from-pink-100 to-pink-200 border-pink-300',
  'from-blue-100 to-blue-200 border-blue-300',
  'from-green-100 to-green-200 border-green-300',
  'from-yellow-100 to-yellow-200 border-yellow-300',
  'from-purple-100 to-purple-200 border-purple-300',
  'from-red-100 to-red-200 border-red-300',
];

// Simple Pin Icon SVG Component
function PinIcon({ filled, className }) {
  return filled ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M12 2C10 2 9 5 9 5L6 6l2 7-3 5 2 1 3-3 3 3 2-1-3-5 2-7-3-1s-1-3-3-3z" />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M12 2C10 2 9 5 9 5L6 6l2 7-3 5 2 1 3-3 3 3 2-1-3-5 2-7-3-1s-1-3-3-3z" />
    </svg>
  );
}

export default function NoteCard({ note, onDelete, onTagClick, onTogglePin, viewMode }) {
  const navigate = useNavigate();

  // Handle color rotation for string
  const colorClass = COLORS[
    typeof note.id === 'number'
      ? note.id % COLORS.length
      : [...String(note.id)].reduce((acc, char) => acc + char.charCodeAt(0), 0) % COLORS.length
  ];

  // Clean content preview
  const stripped = note.content ? note.content.replace(/<[^>]*>/g, '') : '';
  const preview = stripped.length > 100 ? `${stripped.slice(0, 100)}...` : stripped;

  // Keyboard handler for accessibility
  const onKeyDownHandler = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      navigate(`/notes/${note.id}`);
    }
  };

  return (
    <div
      className={`relative group rounded-xl bg-gradient-to-br ${colorClass} p-4 shadow-md hover:shadow-xl transition-transform ${
        viewMode === 'grid' ? 'hover:scale-[1.02]' : ''
      } border`}
    >
      {/* Title & Preview */}
      <div
        onClick={() => navigate(`/notes/${note.id}`)}
        className="cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={onKeyDownHandler}
      >
        <h3 className="text-lg font-bold text-gray-800">{note.title || 'Untitled Note'}</h3>
        <p className="text-sm mt-1 whitespace-pre-wrap line-clamp-3 text-gray-700">{preview}</p>
      </div>

      {/* Tags */}
      {note.tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {note.tags.map((tag) => (
            <span
              key={tag}
              onClick={(e) => {
                e.stopPropagation();
                onTagClick?.(tag);
              }}
              className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded cursor-pointer hover:bg-blue-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Category */}
      {note.category && (
        <p
          onClick={(e) => {
            e.stopPropagation();
            onTagClick?.(note.category);
          }}
          className="mt-2 text-xs text-purple-800 bg-purple-200 inline-block px-2 py-1 rounded cursor-pointer hover:bg-purple-300"
        >
          📁 {note.category}
        </p>
      )}

      {/* Dates */}
      <div className="text-xs text-gray-600 mt-3">
        <p>Created: {note.createdAt ? dayjs(note.createdAt).format('DD MMM YYYY') : '—'}</p>
        <p>Updated: {note.updatedAt ? dayjs(note.updatedAt).format('DD MMM YYYY') : '—'}</p>
      </div>

      {/* Pin, Edit, Delete & Download buttons */}
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(note.id);
          }}
          className={`p-1 rounded ${
            note.pinned ? 'text-yellow-400' : 'text-gray-400'
          } hover:text-yellow-500 transition`}
          title={note.pinned ? 'Unpin Note' : 'Pin Note'}
          aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
        >
          <PinIcon filled={note.pinned} className="h-5 w-5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/notes/${note.id}`);
          }}
          className="text-yellow-600 hover:text-yellow-500"
          title="Edit"
          aria-label="Edit note"
        >
          <PencilIcon className="h-5 w-5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
          }}
          className="text-red-600 hover:text-red-500"
          title="Delete"
          aria-label="Delete note"
        >
          <TrashIcon className="h-5 w-5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            const filename = `${note.title ? note.title.replace(/\s+/g, '_') : 'note'}_${note.id}.txt`;
            const content = note.content ? note.content.replace(/<[^>]*>/g, '') : '';
            downloadTextFile(filename, content);
          }}
          className="text-green-600 hover:text-green-500"
          title="Download"
          aria-label="Download note"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v8m0 0l-4-4m4 4l4-4M12 4v8"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
