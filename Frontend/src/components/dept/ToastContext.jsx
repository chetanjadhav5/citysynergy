"use client"

import { createContext, useContext, useState } from "react"

// Create a context for toast notifications
const ToastContext = createContext()

// Custom hook to use the toast context
export const useToast = () => useContext(ToastContext)

// Provider component for toast notifications
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  // Function to show a toast notification
  const showToast = (message, type = "info", duration = 3000) => {
    const id = Date.now()
    setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }])

    // Automatically remove the toast after the specified duration
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    }, duration)
  }

  // Function to manually close a toast
  const closeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

  // Value to be provided to consuming components
  const value = {
    showToast,
    closeToast,
  }

  // Get the appropriate color based on toast type
  const getToastColor = (type) => {
    switch (type) {
      case "success":
        return "bg-green-100 border-green-500 text-green-800 dark:bg-green-900/30 dark:border-green-600 dark:text-green-400"
      case "error":
        return "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/30 dark:border-red-600 dark:text-red-400"
      case "warning":
        return "bg-yellow-100 border-yellow-500 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-600 dark:text-yellow-400"
      default:
        return "bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-400"
    }
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-3 rounded-md shadow-md border-l-4 max-w-md transition-all duration-300 ${getToastColor(
              toast.type,
            )}`}
          >
            <div className="flex justify-between items-center">
              <p>{toast.message}</p>
              <button
                onClick={() => closeToast(toast.id)}
                className="ml-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                &times;
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

