"use client";

import React, { useState, useEffect, useCallback } from "react";
import NoteCard from "../components/NoteCard/NoteCard";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Particles from "react-tsparticles";
import { debounce } from "lodash";
import api from "../services/auth"; // axios instance
import NavBar from "../components/NavBardash";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function NoteDashboard() {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  const [deleteNoteId, setDeleteNoteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading: authLoading, logout } = useAuth();

 const doSearch = useCallback(
  debounce(async (q) => {
    setSearchQuery(q);
    if (!q) {
      await fetchNotes();
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/notes", { params: { q } });
      setNotes(data.notes || []); // <-- use data.notes here
    } catch (err) {
      console.error("Search error:", err);
      toast.error("Failed to search notes");
      setError("search_failed");
    } finally {
      setLoading(false);
    }
  }, 350),
  []
);


  const fetchNotes = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      setError(null);
     const { data } = await api.get("/notes");
const notesArray = data.notes || [];
const sorted = [...notesArray].sort((a, b) => {
  if (a.pinned && !b.pinned) return -1;
  if (!a.pinned && b.pinned) return 1;
  return new Date(b.updatedAt) - new Date(a.updatedAt);
});
setNotes(sorted);

    } catch (err) {
      console.error("Error fetching notes:", err);
      setError("load_failed");
      if (err?.status === 401 || err?.response?.status === 401) {
        logout && logout({ message: "Session expired. Please login again." });
        toast.error("Session expired. Please login again.");
      } else {
        toast.error("Failed to load notes");
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, logout]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { state: { from: location } });
    }
  }, [authLoading, isAuthenticated, navigate, location]);

  const handleAddNote = () => navigate("/notes/new");

  const handleClearFilters = async () => {
    setSearchQuery("");
    await fetchNotes();
  };

  const confirmDelete = (id) => setDeleteNoteId(id);

  const handleDelete = async () => {
    if (!deleteNoteId) return;
    setDeleting(true);
    try {
      await api.delete(`/notes/${deleteNoteId}`);
      setNotes((prev) => prev.filter((note) => note.id !== deleteNoteId));
      setDeleteNoteId(null);
      toast.success("Note deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete note");
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePin = async (noteId) => {
    try {
      const note = notes.find((n) => n.id === noteId);
      if (!note) return;
      const updatedPinned = !note.pinned;
      const { data } = await api.patch(`/notes/${noteId}`, { pinned: updatedPinned });
      const updatedNotes = notes.map((n) =>
        n.id === noteId ? { ...n, pinned: data.pinned } : n
      );
      setNotes(
        [...updatedNotes].sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        })
      );
      toast.info(`Note ${updatedPinned ? "pinned" : "unpinned"}`);
    } catch (err) {
      console.error("Pin toggle error:", err);
      toast.error("Failed to update pin status");
    }
  };

  const handleNoteCreated = (newNote) => {
    setNotes((prev) =>
      [...prev, newNote].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      })
    );
    toast.success("Note created successfully");
  };

  const handleNoteUpdated = (updatedNote) => {
    setNotes((prev) =>
      prev
        .map((note) => (note.id === updatedNote.id ? updatedNote : note))
        .sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        })
    );
    toast.success("Note updated successfully");
  };

  if (authLoading) {
    return <div className="min-h-screen grid place-items-center">Loading…</div>;
  }
  if (!isAuthenticated) return null;

  const EmptyState = ({ title, message }) => (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
      <div className="p-6 bg-white/80 rounded-2xl shadow flex flex-col items-center text-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-600 max-w-md">{message}</p>
        {title === "No notes found" && (
          <div className="mt-4">
            <button
              onClick={handleAddNote}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + Create your first note
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100 relative overflow-hidden">
        <NavBar
          onSearch={(q) => doSearch(q)}
          onClearFilters={handleClearFilters}
          initialQuery={searchQuery}
          onToggleView={(mode) => setViewMode(mode)}
          currentView={viewMode}
        />

        <Particles
          options={{
            fullScreen: { enable: false },
            particles: {
              number: { value: 30 },
              size: { value: 2 },
              color: { value: "#60A5FA" },
              move: { enable: true, speed: 1 },
            },
          }}
          className="absolute top-16 left-0 w-full h-[calc(100%-4rem)] -z-10"
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 sticky top-0">
          {!loading && !error && notes.length > 0 && (
            <div className="mb-6 flex justify-end">
              <div className="px-6 py-3 bg-gradient-to-r from-blue-500 to-sky-400 text-white font-semibold rounded-xl shadow-lg backdrop-blur-sm border border-blue-200 animate-pulse">
                Total Notes: {notes.length}
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center text-gray-600 mt-24">Loading notes...</div>
          ) : error ? (
            <EmptyState
              title="Could not load notes"
              message="Something went wrong while loading your notes. Please try again later."
            />
          ) : notes.length === 0 ? (
            <EmptyState
              title="No notes found"
              message="You don't have any notes yet. Click Add Note to create your first one."
            />
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                  : "flex flex-col gap-4"
              }
            >
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`transition-all ${
                    note.pinned
                      ? "ring-2 ring-yellow-400 shadow-lg bg-yellow-50"
                      : ""
                  }`}
                >
                  <NoteCard
                    note={note}
                    onDelete={confirmDelete}
                    onTagClick={(tag) => console.log("Tag clicked:", tag)}
                    onTogglePin={handleTogglePin}
                    viewMode={viewMode}
                  />
                </div>
              ))}
            </div>
          )}
        </main>

        {deleteNoteId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Confirm Delete
              </h2>
              <p className="mb-6 text-gray-600">
                Are you sure you want to delete this note? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setDeleteNoteId(null)}
                  className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

     {/* <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />*/}
    </>
  );
}
