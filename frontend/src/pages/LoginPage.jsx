import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import "react-toastify/dist/ReactToastify.css";

// Toast container config to match dashboard
const toastConfig = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  newestOnTop: true,
  closeOnClick: true,
  rtl: false,
  pauseOnFocusLoss: true,
  draggable: true,
  pauseOnHover: true,
  theme: "colored",
};

const LoginPage = () => {
  const { login, user, authLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirectPath = location.state?.from?.pathname || "/dashboard";
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, location.state]);

  // Show error toast on auth error
  useEffect(() => {
    if (error && !authLoading) {
      let errorMessage = error.message || "Login failed. Please try again.";

      if (error.type === "SESSION_EXPIRED") {
        errorMessage = "Your session has expired. Please login again.";
      }

      toast.error(errorMessage, toastConfig);
      setFormData((prev) => ({ ...prev, password: "" }));
    }
  }, [error, authLoading]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitDisabled(true);

    if (!formData.email || !formData.password) {
      toast.error("All fields are required", toastConfig);
      setSubmitDisabled(false);
      return;
    }

    try {
      const result = await login(
        formData.email,
        formData.password,
        formData.remember
      );
      if (result?.success) {
        toast.success(`Welcome back, ${result.user?.name || "User"}!`, {
          ...toastConfig,
          style: { background: "#4BB543", color: "#fff" },
        });
      }
    } catch {
      toast.error("Unexpected error occurred. Please try again.", toastConfig);
    } finally {
      setSubmitDisabled(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <>
      {/* Toast container for all toast notifications */}

      <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/note-poster.jpg"
          className="absolute w-full h-full object-cover z-0"
        >
          <source src="/note.mp4" type="video/mp4" />
        </video>

        <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Login
          </h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                value={formData.email}
                onChange={handleChange}
                autoComplete="username"
                required
              />
            </div>

            <div className="relative">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none pr-10"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
                minLength={6}
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {/*{showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}*/}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-gray-700">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="text-sm text-blue-500 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={authLoading || submitDisabled}
              className={`w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition ${
                authLoading || submitDisabled
                  ? "opacity-70 cursor-not-allowed"
                  : ""
              }`}
            >
              {authLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-4 text-sm text-center text-gray-700">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
