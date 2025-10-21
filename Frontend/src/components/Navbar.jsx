"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useLoading } from "../context/LoadingContext"
import { useToast } from "../context/ToastContext"
import ProfileImage from "./common/ProfileImage"
import apiClient from "../utils/apiClient"
import { LogOut, LayoutDashboard } from "lucide-react"
import { ScrollLink } from "react-scroll"

const Navbar = () => {
  const navigate = useNavigate()
  const { setIsLoading } = useLoading()
  const { showToast } = useToast()
  const [profileImage, setProfileImage] = useState(null)
  const [username, setUsername] = useState("User")
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSticky, setIsSticky] = useState(false)

  const navLinks = [
    { to: "home", label: "Home" },
    { to: "about", label: "About" }
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50)
    }

    const checkAuth = () => {
      const token = localStorage.getItem("token")
      setIsAuthenticated(!!token)
    }

    window.addEventListener("scroll", handleScroll)
    checkAuth()
    window.addEventListener("storage", checkAuth)
    
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("storage", checkAuth)
    }
  }, [])

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        if (isAuthenticated) {
          const response = await apiClient.get("/profile/image/current")
          if (response.data?.data?.imageUrl) setProfileImage(response.data.data.imageUrl)
          if (response.data?.data?.username) setUsername(response.data.data.username)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      }
    }

    fetchProfileImage()
  }, [isAuthenticated])

  const toggleMenu = () => setIsOpen(!isOpen)

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      await apiClient.post("/auth/logout")
      localStorage.removeItem("token")
      localStorage.removeItem("userData")
      localStorage.removeItem("permissions")
      localStorage.removeItem("profileImage")
      setIsAuthenticated(false)
      navigate("/login")
      showToast("Logged out successfully", "success")
    } catch (error) {
      console.error("Error logging out:", error)
      showToast("Failed to log out", "error")
    } finally {
      setIsLoading(false)
      setIsOpen(false)
    }
  }

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isSticky 
          ? "bg-[#dee2e6] dark:bg-gray-800 rounded-full mt-4 mx-2 w-[calc(100%-1rem)] shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2">
          <div className="flex  items-center space-x-2">
            <img 
              src="gclm.png" 
              alt="Logo" 
              className="w-16 h-12 p-2  xs:w-20 xs:h-16 sm:w-24 sm:h-20" 
            />
            <h1 className={`text-xl xs:text-2xl font-semibold cursor-pointer ${
              isSticky ? "text-gray-800 dark:text-white" : "text-white"
            }`}>
              City Synergy
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <ScrollLink
                key={link.to}
                to={link.to}
                smooth={true}
                duration={500}
                className={`font-semibold hover:text-[#343a40] cursor-pointer ${
                  isSticky ? "text-gray-800 dark:text-white" : "text-white"
                }`}
              >
                {link.label}
              </ScrollLink>
            ))}

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
                <ProfileImage username={username} profileImage={profileImage} size="sm" />
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Login
                </Link>

              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <button onClick={toggleMenu} className="focus:outline-none">
                  <ProfileImage 
                    username={username} 
                    profileImage={profileImage} 
                    size="sm" 
                    className={isSticky ? "border-2 border-gray-800" : "border-2 border-white"}
                  />
                </button>

                {isOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50">
                    <div className="py-2">
                      <button
                        onClick={() => {
                          toggleMenu()
                          navigate("/dashboard")
                        }}
                        className="w-full px-4 py-3 text-left text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                >
                  Login
                </Link>

              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar