"use client"

import { useState, useRef } from "react"
import { X, Upload, Camera, RefreshCcw } from "lucide-react"
import PropTypes from "prop-types"
import apiClient from "../../utils/apiClient"

const ProfileImageModal = ({ isOpen, onClose, currentUser, onImageUpdate }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  if (!isOpen) return null

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append("image", selectedFile)

      const response = await apiClient.post("/profile/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.success) {
        onImageUpdate(response.data.data.imageUrl)
        onClose()
      }
    } catch (error) {
      console.error("Error uploading profile image:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Profile Image</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex flex-col items-center space-y-6">
              {/* Profile Image Preview */}
              <div className="relative group">
                <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                  {previewUrl ? (
                    <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
                  ) : currentUser?.profileImage ? (
                    <img
                      src={currentUser.profileImage || "/placeholder.svg"}
                      alt="Current profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-medium">
                      {currentUser?.name?.substring(0, 2).toUpperCase() || "U"}
                    </div>
                  )}
                </div>

                {/* Camera Icon Overlay */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                >
                  <Camera className="h-8 w-8 text-white" />
                </button>
              </div>

              {/* User Info */}
              <div className="text-center">
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">{currentUser?.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
              </div>

              {/* Hidden File Input */}
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

              {/* Upload Button */}
              {selectedFile && (
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                    flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <RefreshCcw className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload New Image
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

ProfileImageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
  onImageUpdate: PropTypes.func.isRequired,
}

export default ProfileImageModal

