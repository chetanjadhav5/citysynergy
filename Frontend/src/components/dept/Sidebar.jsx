"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import PropTypes from "prop-types"
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  AlertCircle,
  Package,
  Users,
  Shield,
  Settings,
  ChevronRight,
  ChevronLeft,
  LogOut,
  X,
  Sun,
  Moon,
  RefreshCcw,
  Home,
} from "lucide-react"
import apiClient from "../../utils/apiClient"
import ProfileImageModal from "../common/ProfileImageModal"

// Map navigation items to feature IDs
const navItems = [
  { path: "/dashboard/dept", label: "Dashboard", icon: LayoutDashboard, featureId: null }, // Dashboard is always accessible
  { path: "/dashboard/dept/tenders", label: "Tenders", icon: FileText, featureId: "FEAT_TENDERS" },
  { path: "/dashboard/dept/clashes", label: "Clashes", icon: AlertTriangle, featureId: "FEAT_CLASHES" },
  { path: "/dashboard/dept/issues", label: "Issues", icon: AlertCircle, featureId: "FEAT_ISSUES" },
  { path: "/dashboard/dept/inventory", label: "Inventory", icon: Package, featureId: "FEAT_INVENTORY" },
  { path: "/dashboard/dept/users", label: "Users", icon: Users, featureId: "FEAT_USER_MGMT" },
  { path: "/dashboard/dept/roles", label: "Roles", icon: Shield, featureId: "FEAT_ROLE_MGMT" },
  { path: "/dashboard/dept/features", label: "Features", icon: Settings, featureId: "FEAT_DEPT_MGMT" },
]

const quickLinks = [{ label: "Logout", icon: LogOut }]

const Sidebar = ({ isMobile, isCollapsed, isOpen, onToggleCollapse, darkMode, toggleDarkMode }) => {
  const location = useLocation()
  const { logout, user,  hasPermission } = useAuth()

  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [loadingProfileImage, setLoadingProfileImage] = useState(false)
  const [userInitials, setUserInitials] = useState("JD")

  // Add a function to fetch the current user's profile image
  const fetchProfileImage = async () => {
    try {
      setLoadingProfileImage(true)

      // First check localStorage
      const cachedImage = localStorage.getItem("profileImage")
      if (cachedImage) {
        setProfileImage(cachedImage)
        setLoadingProfileImage(false)
        return
      }

      const response = await apiClient.get("/profile/image/current")

      if (response.data.success && response.data.data) {
        setProfileImage(response.data.data.imageUrl)
        // Cache the image URL
        localStorage.setItem("profileImage", response.data.data.imageUrl)
      }
    } catch (error) {
      console.error("Error fetching profile image:", error)
    } finally {
      setLoadingProfileImage(false)
    }
  }

  // Set user initials based on user name
  useEffect(() => {
    if (user && user.name) {
      // Extract initials from name (up to 2 characters)
      const initials = user.name.substring(0, 2).toUpperCase()
      setUserInitials(initials)
    }
  }, [user])

  // Call this function when the component mounts
  useEffect(() => {
    fetchProfileImage()
  }, [])

  // Handle closing sidebar when clicking a link on mobile
  const handleLinkClick = () => {
    if (isMobile && isOpen) {
      onToggleCollapse(false)
    }
  }

  // Handle logout
  const handleLogout = () => {
    logout()
    handleLinkClick()
  }

  // Handle profile image update
  const handleImageUpdate = (imageUrl) => {
    setProfileImage(imageUrl)
  }

  // Filter nav items based on user permissions
  const filteredNavItems = navItems.filter((item) => {
    // Dashboard is always accessible
    if (!item.featureId) {
      return true
    }
    
    // Check if user has at least read permission for this feature
    return hasPermission(item.featureId, "read")
  })

  return (
    <>
      {/* Custom scrollbar styles */}
      <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 20px;
          border: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.8);
        }
        
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(75, 85, 99, 0.5);
        }
        
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(75, 85, 99, 0.8);
        }
        
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
        }
        
        .dark .custom-scrollbar {
          scrollbar-color: rgba(75, 85, 99, 0.5) transparent;
        }
      `}</style>

      {/* Backdrop for mobile - with animation */}
      {isMobile && (
        <div
          className={`fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-20 dark:bg-black/40 transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => onToggleCollapse(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Always render but translate off-screen when closed on mobile */}
      <aside
        className={`
          ${isMobile ? "fixed inset-y-0 left-0 z-30" : "relative"} 
          ${isCollapsed && !isMobile ? "w-20" : "w-64"} 
          bg-white dark:bg-gray-800 min-h-screen shadow-md flex flex-col
          transition-all duration-300 ease-in-out
          ${isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        {/* Logo area */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          {(!isCollapsed || isMobile) && (
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AdminPanel
            </h2>
          )}

          <button
            onClick={() => onToggleCollapse(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isMobile ? (
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            ) : isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            )}
          </button>
        </div>

        {/* Main navigation */}
        <nav className="p-3 flex-grow overflow-y-auto custom-scrollbar">
          <div className={`${!isCollapsed || isMobile ? "mb-3 px-3" : "mb-2"}`}>
            {(!isCollapsed || isMobile) && (
              <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold">Main Navigation</p>
            )}
            {isCollapsed && !isMobile && <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>}
          </div>

          <div className="space-y-1">
            {filteredNavItems.map((item, index) => {
              // Determine permissions for this feature
              const canRead = !item.featureId || hasPermission(item.featureId, "read")
              const canWrite = !item.featureId || hasPermission(item.featureId, "write")
              const canUpdate = !item.featureId || hasPermission(item.featureId, "update")
              const canDelete = !item.featureId || hasPermission(item.featureId, "delete")

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleLinkClick}
                  className={`flex items-center px-3 py-2.5 rounded-lg transition-all ${
                    location.pathname === item.path
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  } ${!canRead && "opacity-50 pointer-events-none"}`}
                >
                  <div
                    className={`${
                      location.pathname === item.path ? "bg-blue-100 dark:bg-blue-800" : "bg-gray-100 dark:bg-gray-700"
                    } p-2 rounded-lg mr-3`}
                  >
                    <item.icon
                      className={`h-5 w-5 ${
                        location.pathname === item.path
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    />
                  </div>
                  {(!isCollapsed || isMobile) && (
                    <span className={`font-medium ${location.pathname === item.path && "font-semibold"}`}>
                      {item.label}
                    </span>
                  )}
                  {(!isCollapsed || isMobile) && location.pathname === item.path && (
                    <div className="ml-auto w-1.5 h-5 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Quick links / footer */}
        <div className="mt-auto p-3 border-t border-gray-100 dark:border-gray-700">
          {(!isCollapsed || isMobile) && (
            <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold px-3 mb-2">Quick Links</p>
          )}
          <div className="space-y-1">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center px-3 py-2.5 rounded-lg transition-all text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg mr-3">
                {darkMode ? (
                  <Sun className="h-5 w-5 text-amber-500" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                )}
              </div>
              {(!isCollapsed || isMobile) && (
                <span className="font-medium">{darkMode ? "Light Mode" : "Dark Mode"}</span>
              )}
            </button>

            <Link
              to="/home"
              onClick={handleLinkClick}
              className="flex items-center px-3 py-2.5 rounded-lg transition-all text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg mr-3">
                <Home className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
              {(!isCollapsed || isMobile) && <span className="font-medium">Home</span>}
            </Link>

            {quickLinks.map((item) => (
              <a
                key={item.label}
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (item.label === "Logout") {
                    handleLogout()
                  } else {
                    handleLinkClick()
                  }
                }}
                className="flex items-center px-3 py-2.5 rounded-lg transition-all text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg mr-3">
                  <item.icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </div>
                {(!isCollapsed || isMobile) && <span className="font-medium">{item.label}</span>}
              </a>
            ))}
          </div>
        </div>

        {/* User profile */}
        {!isCollapsed || isMobile ? (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div
                className="h-9 w-9 rounded-full overflow-hidden cursor-pointer"
                onClick={() => setShowProfileModal(true)}
              >
                {loadingProfileImage ? (
                  <div className="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <RefreshCcw className="h-4 w-4 text-gray-400 dark:text-gray-500 animate-spin" />
                  </div>
                ) : profileImage ? (
                  <img src={profileImage || "/placeholder.svg"} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                    {userInitials}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.name || "John Doe"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.type === "dev" ? "Developer" : "Department User"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 border-t border-gray-100 dark:border-gray-700 flex justify-center">
            <div
              className="h-9 w-9 rounded-full overflow-hidden cursor-pointer"
              onClick={() => setShowProfileModal(true)}
            >
              {loadingProfileImage ? (
                <div className="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <RefreshCcw className="h-4 w-4 text-gray-400 dark:text-gray-500 animate-spin" />
                </div>
              ) : profileImage ? (
                <img src={profileImage || "/placeholder.svg"} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                  {userInitials}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Image Modal */}
        <ProfileImageModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          currentUser={user}
          onImageUpdate={handleImageUpdate}
        />
      </aside>
    </>
  )
}

export default Sidebar

Sidebar.propTypes = {
  isMobile: PropTypes.bool.isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggleCollapse: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
  toggleDarkMode: PropTypes.func.isRequired,
  setHoverIndex: PropTypes.func,
}