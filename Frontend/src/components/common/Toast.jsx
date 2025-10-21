"use client"

import { useEffect, useState } from "react"
import { CheckCircle, AlertCircle, X } from "lucide-react"

export default function Toast({ message, type, onClose }) {
  const [isExiting, setIsExiting] = useState(false)
  const [progress, setProgress] = useState(100)
  const duration = 3000 // 3 seconds
  const updateInterval = 30 // Update progress every 30ms

  useEffect(() => {
    // Set up progress bar timer
    const progressInterval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress - (100 * updateInterval) / duration
        return newProgress > 0 ? newProgress : 0
      })
    }, updateInterval)

    // Set up exit timer
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(onClose, 300) // Wait for exit animation to complete
    }, duration)

    return () => {
      clearTimeout(timer)
      clearInterval(progressInterval)
    }
  }, [onClose, duration])

  return (
    <div className={`${isExiting ? "animate-slide-out-right" : "animate-slide-in-left"} max-w-md`}>
      <div
        className={`flex items-center p-4 rounded-lg shadow-lg mb-2 transition-all duration-300 relative overflow-hidden ${
          type === "success"
            ? "bg-green-50 text-green-800 border border-green-200"
            : "bg-red-50 text-red-800 border border-red-200"
        }`}
      >
        <div className="flex-1 flex items-center">
          {type === "success" ? (
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          )}
          <span className="text-sm font-medium">{message}</span>
        </div>
        <button
          onClick={() => {
            setIsExiting(true)
            setTimeout(onClose, 300)
          }}
          className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Progress bar */}
        <div
          className={`absolute bottom-0 left-0 h-1 ${type === "success" ? "bg-green-500" : "bg-red-500"}`}
          style={{ width: `${progress}%`, transition: "width 30ms linear" }}
        />
      </div>
    </div>
  )
}

