"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5";
import { useAuth } from "../context/AuthContext";
import { useLoading } from "../context/LoadingContext";
import mhlogo from "../assets/gclm.png";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { setIsLoading } = useLoading();

  useEffect(() => {
    // Check if dark mode is enabled in localStorage or system preference
    const isDarkMode =
      localStorage.getItem("darkMode") === "true" ||
      (window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    setDarkMode(isDarkMode);

    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setIsLoading(true);

      const result = await login(email, password);
      if (result.requiresOTP) {
        navigate("/verify-otp", { state: { email, isFirstLogin: true } });
      }
      // If login is successful, the AuthContext will handle the redirection
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-svh md:min-h-screen  scroll-disable flex flex-col md:flex-row bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Left side - Branding Panel (Hidden on small screens, flex on medium and up) */}
      <div className="hidden md:flex md:w-1/2 p-8 flex-col justify-center items-center bg-gradient-to-br from-blue-600 to-indigo-800 text-white">
        <div className="max-w-md mx-auto py-12 px-4 text-center">
          <div className="relative w-full h-64 ">
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="./gclm.png"
                alt="City Synergy"
                className="w-40 h-auto"
              />
            </div>
          </div>
          <div className="mb-10">
            <h1 className="text-5xl font-bold mb-6">City Synergy</h1>
            <p className="text-xl opacity-90">
              Streamlining urban management for a better tomorrow
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm opacity-80">
            <div className="bg-white/10 p-4 rounded-lg">
              <p className="font-semibold">Modern Solutions</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <p className="font-semibold">Smart Governance</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <p className="font-semibold">Connected Citizens</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form (Takes full width on small screens, half on medium and up) */}

      <div className="w-full h-screen md:h-auto  md:w-1/2 md:px-4 md:p-6 md:flex items-center  justify-center">
        {/* Removed max-w-md for mobile, added md:max-w-md for larger screens */}
        <div className="w-full h-svh md:h-auto  md:max-w-md bg-white dark:bg-gray-900 md:rounded-2xl md:shadow-xl p-8 relative">
          <button
            onClick={toggleDarkMode}
            className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {darkMode ? (
              <IoSunnyOutline className="h-5 w-5" />
            ) : (
              <IoMoonOutline className="h-5 w-5" />
            )}
          </button>

          <div className="flex flex-col items-center mb-8">
            <img
              src={mhlogo || "/placeholder.svg"}
              alt="Logo"
              className="w-20 h-20 mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              CITY SYNERGY
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Access your dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5" />
                  ) : (
                    <FaEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <div
                  className={`relative w-11 h-6 transition-colors duration-300 rounded-full ${
                    rememberMe ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                  onClick={() => setRememberMe(!rememberMe)}
                >
                  <span
                    className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 transform ${
                      rememberMe ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Remember me
                </span>
              </label>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm border border-red-200 dark:border-red-800/30">
                <p className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition duration-200 font-medium shadow-md hover:shadow-lg"
            >
              Sign in to account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
