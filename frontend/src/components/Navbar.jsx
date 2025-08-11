import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  StickyNote,
  Plus,
  Grid3X3,
  List,
  UserCircle,
  Search,
  Tag
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">

        {/* Left: Brand */}
        <Link to="/" className="flex items-center gap-2 text-white transition hover:scale-105">
          <StickyNote className="w-8 h-8 animate-pulse text-yellow-300 drop-shadow" />
          <span className="text-2xl font-extrabold tracking-tight animate-text bg-gradient-to-r from-yellow-200 via-white to-pink-300 bg-clip-text text-transparent">
            NoteVerse
          </span>
        </Link>

        {/* Center: Search */}
        {user && (
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 rounded hover:bg-white/20 text-white" title="Grid View">
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button className="p-2 rounded hover:bg-white/20 text-white" title="List View">
              <List className="w-5 h-5" />
            </button>
            <button className="p-2 rounded hover:bg-white/20 text-white" title="Filter by Tag">
              <Tag className="w-5 h-5" />
            </button>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-300" />
              <input
                type="text"
                placeholder="Search notes..."
                className="pl-8 pr-3 py-1.5 rounded-md border border-white/30 bg-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 text-white placeholder-white/70"
              />
            </div>
          </div>
        )}

        {/* Right: Auth Actions */}
        <div className="flex items-center space-x-3">
          {user ? (
            <>
              <Link
                to="/new"
                className="flex items-center gap-1 px-3 py-2 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-semibold rounded-md shadow transition"
              >
                <Plus className="w-4 h-4" />
                New Note
              </Link>

              <button
                onClick={() => navigate('/profile')}
                className="p-2 rounded-full hover:bg-white/20 text-white"
                title="Profile"
              >
                <UserCircle className="w-6 h-6" />
              </button>

              <button
                onClick={() => {
                  logout('You have been logged out');
                  navigate('/login');
                }}
                className="text-sm px-3 py-2 border border-white text-white rounded-md hover:bg-white/20 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/signup"
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded-md shadow transition"
              >
                Sign Up
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 border border-white text-white hover:bg-white/20 font-medium rounded-md transition"
              >
                Log In
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
