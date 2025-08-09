import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-Password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Reset link sent');
        setSubmitted(true);
      } else {
        toast.error(data.message || 'Error occurred');
      }
    } catch(error) {
       console.error('Forgot password request failed:', error);
       toast.error('Network error. Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="absolute w-full h-full object-cover z-0">
        <source src="/note.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Forgot Password</h2>
        
        {submitted ? (
          <div className="text-center space-y-4">
            <p className="text-gray-700">
              If your email is registered, you'll receive a reset link shortly.
            </p>
            <Link to="/login" className="text-blue-600 hover:underline text-lg">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        {!submitted && (
          <p className="mt-4 text-sm text-center text-gray-700">
            Remembered your password?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Login here
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
