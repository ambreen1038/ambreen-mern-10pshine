import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  // Optional: Validate token on mount by calling backend (can be skipped if backend rejects invalid token on submit)
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
    }
  }, [token]);

  const validatePassword = (pwd) =>
    pwd.length >= 6 &&
    /[a-z]/.test(pwd) &&
    /[A-Z]/.test(pwd) &&
    /\d/.test(pwd) &&
    /\W/.test(pwd);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword(password)) {
      toast.error(
        'Password must be at least 6 characters and include uppercase, lowercase, number, and special character.'
      );
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (!token) {
      toast.error('Reset token is missing or invalid.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password }),
});


      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Password reset successful');
        navigate('/login');
      } else {
        toast.error(data.message || 'Failed to reset password');
        setTokenValid(false);
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-4">
        <h2 className="text-2xl font-semibold mb-4 text-red-600">Invalid or Expired Token</h2>
        <p className="mb-6 text-center">The password reset link is invalid or has expired.</p>
        <Link to="/forgot-password" className="text-blue-600 hover:underline">
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="absolute w-full h-full object-cover z-0">
        <source src="/note.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Reset Password</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-700">
          Remembered your password?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
