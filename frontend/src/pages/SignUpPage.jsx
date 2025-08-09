import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import "react-toastify/dist/ReactToastify.css";

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

const SignUpPage = () => {
  const { signup, authLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("All fields are required", toastConfig);
      return;
    }

    try {
      await signup({ name, email, password });
      toast.success("Account created successfully! Redirecting...", {
        ...toastConfig,
        autoClose: 2000,
        style: { background: "#4BB543", color: "#fff" },
        onClose: () => navigate("/dashboard"),
      });
    } catch (err) {
      let errorMessage = "Registration failed. Please try again.";
      if (err.response) {
        switch (err.response.status) {
          case 400:
            errorMessage = err.response.data?.message || "Invalid input";
            break;
          case 409:
            errorMessage = "Email already exists";
            break;
          default:
            errorMessage = err.response.data?.message || errorMessage;
            break;
        }
      }
      toast.error(errorMessage, toastConfig);
      setPassword("");
    }
  };

  return (
    <>
        {/*<ToastContainer {...toastConfig} />*/}

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
            Create an Account
          </h2>
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="relative">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={6}
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className={`w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition ${
                authLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {authLoading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-4 text-sm text-center text-gray-700">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default SignUpPage;
