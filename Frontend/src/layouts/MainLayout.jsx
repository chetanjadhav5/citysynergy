"use client"

import { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import DevSidebar from "../components/dev/Sidebar"
import DeptSidebar from "../components/dept/Sidebar"

const MainLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { user } = useAuth()
  
  // Initialize darkMode based on user type
  const [darkMode, setDarkMode] = useState(() => {
 
    
    // For dept users, check localStorage
    const savedMode = localStorage.getItem("darkMode")
    if (savedMode !== null) {
      return savedMode === "true"
    }
    // Then check system preference
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
    }
    return false
  })

  // Remove the user type check in useEffect for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = (e) => {
      if (localStorage.getItem("darkMode") === null) {
        setDarkMode(e.matches)
      }
    }
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  // Modify the dark mode effect to save for all users
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode)
    localStorage.setItem("darkMode", darkMode.toString())
  }, [darkMode])

  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 768
      setIsMobile(isMobileView)
      if (isMobileView && !isSidebarCollapsed) {
        setIsSidebarCollapsed(true)
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize()
    return () => window.removeEventListener("resize", handleResize)
  }, [isSidebarCollapsed])

  const toggleSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(!isSidebarOpen)
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed)
    }
  }

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev)
  }

  return (
    
    <div className={`flex h-screen ${darkMode ? "dark" : ""}`}>
      {/* Render sidebar based on user type */}
      {user?.type === "dev" ? (
        <DevSidebar
          isMobile={isMobile}
          isCollapsed={isSidebarCollapsed}
          isOpen={isSidebarOpen}
          onToggleCollapse={toggleSidebar}
          darkMode={darkMode}        // Allow dark mode for dev users
          toggleDarkMode={toggleDarkMode}  // Allow toggling for dev users
        />
      ) : (
        <DeptSidebar
          isMobile={isMobile}
          isCollapsed={isSidebarCollapsed}
          isOpen={isSidebarOpen}
          onToggleCollapse={toggleSidebar}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
      )}

      <div
        className={`flex flex-col flex-1 overflow-hidden ${
          isMobile ? "w-full" : isSidebarCollapsed ? "w-[calc(100%-5rem)]" : "w-[calc(100%-16rem)]"
        }`}
      >
        {/* Mobile Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm px-4 py-2 flex items-center md:hidden">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent ml-2">
            AdminPanel
          </h1>
        </div>
      {/* Custom scrollbar styles */}
      <style jsx global>{`
        /* For Webkit browsers like Chrome/Safari/Edge */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5); /* gray-400 with opacity */
          border-radius: 20px;~
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(107, 114, 128, 0.7); /* gray-500 with opacity */
        }
        
        /* For dark mode */
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(75, 85, 99, 0.5); /* gray-600 with opacity */
        }
        
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(107, 114, 128, 0.7); /* gray-500 with opacity */
        }
        
        /* For Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
        }
        
        .dark .custom-scrollbar {
          scrollbar-color: rgba(75, 85, 99, 0.5) transparent;
        }
      `}</style>
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout