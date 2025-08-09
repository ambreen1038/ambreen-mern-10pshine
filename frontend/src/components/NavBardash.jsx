import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Search as SearchIcon, LayoutGrid, List } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function NavBar({ onSearch, onClearFilters, onToggleView, currentView, initialQuery = "" }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery || "");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    setQuery(initialQuery || "");
  }, [initialQuery]);

  const handleSearch = (e) => {
    setQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <header className="w-full bg-gradient-to-r from-sky-500 to-blue-600 shadow sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 text-white">
          {/* Left: Brand */}
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-wide">NoteVerse</span>
            </Link>
            <button
              onClick={() => onClearFilters && onClearFilters()}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm border border-white/30 hover:bg-white/10 transition"
            >
              All Notes
            </button>
          </div>

          {/* Center: Search */}
          <div className="flex-1 mx-4 max-w-2xl">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" size={18} />
              <input
                value={query}
                onChange={handleSearch}
                placeholder="Search notes..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          </div>

          {/* Right: View Toggle + Add Note + Profile */}
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex gap-1">
              <button
                onClick={() => onToggleView && onToggleView("grid")}
                className={`p-2 rounded-lg transition ${
                  currentView === "grid" ? "bg-white text-blue-600" : "bg-white/20"
                }`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => onToggleView && onToggleView("list")}
                className={`p-2 rounded-lg transition ${
                  currentView === "list" ? "bg-white text-blue-600" : "bg-white/20"
                }`}
              >
                <List size={18} />
              </button>
            </div>

            <button
              onClick={() => navigate("/notes/new")}
              className="hidden sm:inline-flex items-center gap-2 bg-white text-blue-600 px-3 py-2 rounded-lg shadow hover:bg-blue-100 transition"
            >
              + Add Note
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-white/10 transition"
              >
                <User />
                <span className="hidden sm:inline text-sm font-medium">
                  {user?.name || user?.username || "Profile"}
                </span>
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white text-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-40">
                  <div className="p-4 border-b">
                    <p className="text-sm font-semibold">{user?.name || user?.username}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <div className="flex flex-col py-2">
                    <Link
                      to="/profile"
                      className="px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() => setOpen(false)}
                    >
                      View profile
                    </Link>
                    <button
                      onClick={() => {
                        setOpen(false);
                        logout && logout();
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
