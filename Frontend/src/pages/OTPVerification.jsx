"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate, Navigate } from "react-router-dom"
import { IoArrowBackOutline, IoCheckmarkCircleOutline, IoLockClosedOutline } from "react-icons/io5"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { useAuth } from "../context/AuthContext"
import { useLoading } from "../context/LoadingContext"
import mhlogo from "../assets/mhgovlogo.png"

export const OTPVerification = () => {
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [timer, setTimer] = useState(120)
  const [error, setError] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { state } = useLocation()
  const navigate = useNavigate()
  const { verifyOtp } = useAuth()
  const { setIsLoading } = useLoading()

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!state?.email) {
    return <Navigate to="/login" replace />
  }

  // Handle resend OTP
  const handleResend = async () => {
    try {
      setIsLoading(true)
      // Implement resend OTP logic here
      setTimer(120)
    } catch (error) {
      console.error("Resend failed:", error)
      setError("Failed to resend OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle verification
  const handleVerify = async (e) => {
    e.preventDefault()
    setError("")

    if (state.isFirstLogin && (!newPassword || newPassword !== confirmPassword)) {
      setError("Passwords do not match or are empty")
      return
    }

    try {
      setIsLoading(true)
      const result = await verifyOtp(state.email, otp, newPassword)

      if (result.success) {
        navigate("/login", { replace: true })
      }
    } catch (error) {
      setError(error.message || "Verification failed")
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Left side - Branding Panel */}
      <div className="md:w-1/2 p-8 flex flex-col justify-center items-center bg-gradient-to-br from-blue-600 to-indigo-800 text-white">
        <div className="max-w-md mx-auto py-12 px-4 text-center">
          <div className="mb-10">
            <h1 className="text-5xl font-bold mb-6">City Synergy</h1>
            <p className="text-xl opacity-90">Streamlining urban management for a better tomorrow</p>
          </div>
          
          <div className="relative w-full h-64 mb-12">
            <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <IoLockClosedOutline className="w-20 h-20 mx-auto mb-4 text-white/80" />
                <h3 className="text-2xl font-semibold mb-2">Secure Verification</h3>
                <p className="text-white/80">We've sent a verification code to your email for added security</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 text-sm opacity-80">
            <div className="bg-white/10 p-4 rounded-lg flex items-center">
              <IoCheckmarkCircleOutline className="w-5 h-5 mr-2" />
              <p className="font-semibold">Enhanced Security Protocols</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg flex items-center">
              <IoCheckmarkCircleOutline className="w-5 h-5 mr-2" />
              <p className="font-semibold">Multi-factor Authentication</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg flex items-center">
              <IoCheckmarkCircleOutline className="w-5 h-5 mr-2" />
              <p className="font-semibold">Data Protection Standards</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Verification Form */}
      <div className="md:w-1/2 p-6 flex items-center justify-center">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 relative">
          <button 
            onClick={() => navigate('/login')}
            className="absolute top-6 left-6 p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Go back to login"
          >
            <IoArrowBackOutline className="h-5 w-5" />
          </button>
          
          <div className="flex flex-col items-center mb-8">
            <img src={mhlogo || "/placeholder.svg"} alt="Logo" className="w-16 h-16 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {state.isFirstLogin ? "FIRST LOGIN" : "VERIFICATION"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Enter the verification code sent to
            </p>
            <p className="text-blue-600 dark:text-blue-400 font-medium mt-1">
              {state.email}
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit code"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-center text-lg tracking-widest"
                maxLength={6}
                required
              />
            </div>

            {state.isFirstLogin && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Create a secure password"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm border border-red-200 dark:border-red-800/30">
                <p className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition duration-200 font-medium shadow-md hover:shadow-lg"
            >
              {state.isFirstLogin ? "Verify & Set Password" : "Verify Code"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              {timer > 0 ? `Resend code in ${formatTime(timer)}` : "Didn't receive code?"}
            </p>
            <button
              onClick={handleResend}
              disabled={timer > 0}
              className={`px-4 py-2 rounded-md text-sm ${
                timer > 0 
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed" 
                  : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
              }`}
            >
              Resend Code
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}