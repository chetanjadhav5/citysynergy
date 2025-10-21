"use client"

import { useState } from "react"
import PropTypes from "prop-types"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import {
  LayoutDashboard,
  AlertTriangle,
  FolderTree,
  Users,
  Shield,
  Settings,
  ChevronRight,
  ChevronLeft,
  LogOut,
  X,
  Sun,
  Home,
  Moon,
} from "lucide-react"
import ProfileImageModal from "../common/ProfileImageModal"
import ProfileImage from "../common/ProfileImage"

const navItems = [
  { path: "/dashboard/dev", label: "Dashboard", icon: LayoutDashboard, featureId: "FEAT_DASHBOARD" },
  { path: "/dashboard/dev/users", label: "Users", icon: Users, featureId: "FEAT001" },
  { path: "/dashboard/dev/departments", label: "Departments", icon: FolderTree, featureId: "FEAT002" },
  { path: "/dashboard/dev/roles", label: "Roles", icon: Shield, featureId: "FEAT003" },
  { path: "/dashboard/dev/features", label: "Features", icon: Settings, featureId: "FEAT004" },
]

const quickLinks = [{ label: "Logout", icon: LogOut }]

const Sidebar = ({ isMobile, isCollapsed, isOpen, onToggleCollapse, darkMode, toggleDarkMode }) => {
  
  const location = useLocation()
  const [hoverIndex, setHoverIndex] = useState(null)
  const { logout, user, hasPermission } = useAuth()

  const [ setUser] = useState({
    name: "John Doe",
    profileImage: "https://via.placeholder.com/150",
    permissions: {
      roles: [{ roleName: "Admin" }],
    },
  })
  const [showProfileModal, setShowProfileModal] = useState(false)



  // Get the user's role name from permissions
  const userRoleName = user?.permissions?.roles?.[0]?.roleName || "User"

  // Handle sidebar visibility based on props
  const sidebarVisible = isMobile ? isOpen : true

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
    localStorage.removeItem("profileImage") 
    localStorage.removeItem("viewMode")
  }


  // Handle profile image update
  const handleImageUpdate = (imageUrl) => {
    // Update user profile image in context if needed
    if (user) {
      user.profileImage = imageUrl
    }
  }

  // Filter nav items based on user permissions
  const filteredNavItems = navItems.filter((item) => {
    // Dashboard is always accessible
    if (item.path === "/dashboard/dev") return true
    
    // Check if user has at least read permission for this feature
    if (!item.featureId) return true
    
    // Use the hasPermission function from AuthContext
    return hasPermission(item.featureId, "read")
  })

  if (!sidebarVisible) {
    return null
  }

  return (
    <>
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
          border-radius: 20px;
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

        {/* Main navigation - with custom scrollbar class */}
        <nav className="p-3 flex-grow overflow-y-auto custom-scrollbar">
          <div className={`${!isCollapsed || isMobile ? "mb-3 px-3" : "mb-2"}`}>
            {(!isCollapsed || isMobile) && (
              <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold">Main Navigation</p>
            )}
            {isCollapsed && !isMobile && <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>}
          </div>

          <div className="space-y-1">
            {filteredNavItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={`flex items-center px-3 py-2.5 rounded-lg transition-all ${
                  location.pathname === item.path
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                } ${hoverIndex === index ? "shadow-sm" : ""}`}
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
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
            ))}
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
            <div onClick={() => setShowProfileModal(true)} className="cursor-pointer">
              <ProfileImage username={user?.name} profileImage={user?.profileImage} size="sm" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.name || "User"}</p>
             <p className="text-xs text-gray-500 dark:text-gray-400">
  {JSON.parse(localStorage.permissions)?.roles[0]?.roleName || "role"}
</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 border-t border-gray-100 dark:border-gray-700 flex justify-center">
          <div onClick={() => setShowProfileModal(true)} className="cursor-pointer">
            <ProfileImage username={user?.name} profileImage={user?.profileImage} size="sm" />
          </div>
        </div>
      )}
      </aside>

      {/* Profile Image Modal - Rendered outside the sidebar */}
      {showProfileModal && (
        <ProfileImageModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          currentUser={user}
          onImageUpdate={handleImageUpdate}
        />
      )}
    </>
  )
}

Sidebar.propTypes = {
  isMobile: PropTypes.bool.isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggleCollapse: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
  toggleDarkMode: PropTypes.func.isRequired,
}

export default Sidebar

