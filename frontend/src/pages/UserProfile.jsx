import React, { useState } from "react";
import { LogOut, KeyRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function UserProfile() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/change-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Password updated");
        setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setMessage(`❌ ${data.message || "Error updating password"}`);
      }
    } catch (error) {
      setMessage("❌ Server error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 px-4">
      <div className="w-full max-w-sm bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 space-y-6">
        
        {/* Profile Header */}
        <div className="flex items-center space-x-4 border-b pb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {user?.name || user?.username || "User"}
            </h2>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
        </div>

        {/* Change Password */}
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <KeyRound size={16} /> Change Password
          </h3>
          <input
            type="password"
            name="currentPassword"
            placeholder="Current password"
            value={formData.currentPassword}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="password"
            name="newPassword"
            placeholder="New password"
            value={formData.newPassword}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-2 rounded-lg hover:opacity-90 transition"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        {message && (
          <p className={`text-sm text-center ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );
}
