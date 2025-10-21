"use client"

import { useState, useEffect } from "react"
import { RefreshCcw } from "lucide-react"
import PropTypes from "prop-types"

const ProfileImage = ({ username, userId, profileImage, size = "md", onClick }) => {
  const [userInitials, setUserInitials] = useState("JD")
  const [isLoading, setIsLoading] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Set user initials based on username
  useEffect(() => {
    if (username) {
      // Extract initials from username (up to 2 characters)
      const initials = username.substring(0, 2).toUpperCase()
      setUserInitials(initials)
    }
  }, [username])

  // Size classes
  const sizeClasses = {
    sm: "h-9 w-9",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  }

  // Handle image load error
  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full overflow-hidden ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      {isLoading ? (
        <div className="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <RefreshCcw className="h-4 w-4 text-gray-400 dark:text-gray-500 animate-spin" />
        </div>
      ) : profileImage && !imageError ? (
        <img
          src={profileImage || "/placeholder.svg"}
          alt={username || "User"}
          className="h-full w-full object-cover"
          onError={handleImageError}
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
          {userInitials}
        </div>
      )}
    </div>
  )
}

ProfileImage.propTypes = {
  username: PropTypes.string,
  userId: PropTypes.string,
  profileImage: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  onClick: PropTypes.func,
}

export default ProfileImage

