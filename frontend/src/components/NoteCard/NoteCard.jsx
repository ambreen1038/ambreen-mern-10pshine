// src/components/NoteCard/NoteCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NoteCard.module.css';

export default function NoteCard({ note }) {
  return (
    <article className={styles.card}>
      <Link to={`/notes/${note.id}`} className={styles.link}>
        <h3>{note.title || 'Untitled'}</h3>
        <div
          className={styles.excerpt}
          dangerouslySetInnerHTML={{ __html: note.body.substring(0, 100) + '...' }}
        />
      </Link>
    </article>
  );
}
