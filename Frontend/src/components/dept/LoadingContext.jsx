"use client"

import { createContext, useContext, useState } from "react"

// Create a context for loading state
const LoadingContext = createContext()

// Custom hook to use the loading context
export const useLoading = () => useContext(LoadingContext)

// Provider component for loading state
export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false)

  // Value to be provided to consuming components
  const value = {
    isLoading,
    setLoading: (loading) => setIsLoading(loading),
  }

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-700 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  )
}

