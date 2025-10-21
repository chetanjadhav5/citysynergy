"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Loader2, CheckCircle, AlertCircle, User } from "lucide-react"
import Button from "../../components/dept/Button"
import DeptPermissionGuard from "../../components/dept/DeptPermissionGuard"
import apiClient from "../../utils/apiClient"
import { useToast } from "../../context/ToastContext"
import { useLoading } from "../../context/LoadingContext"
import ProfileImage from "../../components/common/ProfileImage"
import CustomRoleDropdown from "../../components/common/CustomRoleDropdown" // Import the new component

// Update validation functions to handle responses correctly
const validateEmail = async (email) => {
  if (!email) return { valid: false, message: "Email is required" }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, message: "Invalid email format" }
  }

  try {
    const response = await apiClient.post("/users/check-email", { email })
    if (!response.data.success) {
      // Directly return the API message
      return { valid: false, message: response.data.message }
    }
    return { valid: true, message: "" }
  } catch (error) {
    // Handle error response format
    if (error.response?.data?.message) {
      return { valid: false, message: error.response.data.message }
    }
    return { valid: false, message: "Error checking email" }
  }
}

const validateUsername = async (username) => {
  if (!username) return { valid: false, message: "Username is required" }
  
  // Prevent whitespace in username
  if (/\s/.test(username)) {
    return { valid: false, message: "Username cannot contain spaces" }
  }
  
  if (username.length < 3) return { valid: false, message: "Username must be at least 3 characters" }

  try {
    // Check if username already exists
    const response = await apiClient.post("/users/check-username", { username })
    console.log("Username check response:", response.data)
    if (!response.data.success) {
      return { valid: false, message: "Error checking username" }
    }
    return { valid: true, message: "" }
  } catch (error) {
    console.error("Error checking username:", error)
    return { valid: false, message: "Error checking username" }
  }
}

const CreateUser = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const loadingContext = useLoading()
  const setLoading = loadingContext?.setLoading || (() => {})
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    roleId: "",
  })
  
  const [roles, setRoles] = useState([])
  const [isValidating, setIsValidating] = useState(false)
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [usernameError, setUsernameError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [roleError, setRoleError] = useState("")
  const [usernameAvailable, setUsernameAvailable] = useState(null)
  const [emailAvailable, setEmailAvailable] = useState(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)

  // Fetch roles on component mount
  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get("/roles/department")
      console.log("Roles API Response:", response.data)
  
      if (response.data.success) {
        // Adjust this line based on actual API response structure
        const receivedRoles = response.data.data.roles || response.data.roles
        
        if (receivedRoles && receivedRoles.length > 0) {
          setRoles(receivedRoles)
        } else {
          showToast("No roles available", "warning")
        }
      }
    } catch (error) {
      console.error("Error fetching roles:", error)
      showToast(error.response?.data?.message || "Error fetching roles", "error")
    } finally {
      setLoading(false)
    }
  }
  

  // Handle input change with validation
  const handleChange = async (e) => {
    const { name, value } = e.target
    
    // Prevent spaces in username field
    if (name === 'username' && value.includes(' ')) {
      setUsernameAvailable(false)
      setUsernameError("Username cannot contain spaces")
      setFormData(prev => ({ ...prev, [name]: value.replace(/\s/g, '') }))
      return
    }
    
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear errors
    if (name === 'username') setUsernameError("")
    if (name === 'email') setEmailError("")
    if (name === 'roleId') setRoleError("")

    // Reset availability status
    if (name === 'username') setUsernameAvailable(null)
    if (name === 'email') setEmailAvailable(null)

    // Validate username and email as user types
    if (name === 'username' && value.length >= 3) {
      setCheckingUsername(true)
      setUsernameAvailable(null)
      const validation = await validateUsername(value)
      if (validation.valid) {
        setUsernameAvailable(true)
        setUsernameError("")
      } else {
        setUsernameAvailable(false)
        setUsernameError(validation.message)
      }
      setCheckingUsername(false)
    } else if (name === 'username' && value.length > 0 && value.length < 3) {
      setUsernameAvailable(false)
      setUsernameError("Username must be at least 3 characters")
    }

    if (name === 'email' && value.includes('@')) {
      setCheckingEmail(true)
      setEmailAvailable(null)
      const validation = await validateEmail(value)
      if (validation.valid) {
        setEmailAvailable(true)
        setEmailError("")
      } else {
        setEmailAvailable(false)
        setEmailError(validation.message)
      }
      setCheckingEmail(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsValidating(true)

    // Validate all fields
    const emailValidation = await validateEmail(formData.email)
    const usernameValidation = await validateUsername(formData.username)

    if (!formData.roleId) {
      setRoleError("Role is required")
      setIsValidating(false)
      return
    }

    if (!emailValidation.valid || !usernameValidation.valid) {
      setEmailError(emailValidation.message)
      setUsernameError(usernameValidation.message)
      setIsValidating(false)
      return
    }

    // Create user
    setIsCreatingUser(true)
    try {
      // Get department ID from localStorage
      const userData = JSON.parse(localStorage.getItem("userData"))
      const deptId = userData?.deptId

      if (!deptId) {
        showToast("Department ID not found", "error")
        return
      }

      const response = await apiClient.post("/users/department", {
        username: formData.username,
        email: formData.email,
        type: "dept",
        deptId: deptId,
        roleId: formData.roleId,
      })

      if (response.data.success) {
        showToast("User created successfully", "success")
        navigate("/dashboard/dept/users")
      } else {
        // Display specific error from API response
        const errorMessage = response.data.message || "Failed to create user"
        
        // Handle specific error types if needed
        if (errorMessage.toLowerCase().includes("email")) {
          setEmailError(errorMessage)
        } else if (errorMessage.toLowerCase().includes("username")) {
          setUsernameError(errorMessage)
        } else {
          showToast(errorMessage, "error")
        }
        setIsCreatingUser(false)
        setIsValidating(false)
      }
    } catch (error) {
      console.error("Error creating user:", error)
      const errorMessage = error.response?.data?.message || "Error creating user"
      showToast(errorMessage, "error")
      setIsCreatingUser(false)
      setIsValidating(false)
    }
  }

  return (
    <DeptPermissionGuard
      featureId="FEAT_USER_MGMT"
      permissionType="write"
      fallback={<div className="p-6 text-center">You don't have permission to create users.</div>}
    >
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/dashboard/dept/users")}
            className="p-2 mr-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Create New User</h1>
            <p className="text-gray-600 dark:text-gray-400">Add a new user to your department</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username*
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  pattern="[^\s]+"
                  title="Username cannot contain spaces"
                  className={`w-full px-3 py-2 border ${
                    usernameError ? "border-red-500" : usernameAvailable ? "border-green-500" : "border-gray-300 dark:border-gray-600"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white`}
                  placeholder="Enter username"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {checkingUsername && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                  {!checkingUsername && usernameAvailable && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {!checkingUsername && usernameError && <AlertCircle className="h-4 w-4 text-red-500" />}
                </div>
              </div>
              {usernameError && <p className="text-sm text-red-500">{usernameError}</p>}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email*
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    emailError ? "border-red-500" : emailAvailable ? "border-green-500" : "border-gray-300 dark:border-gray-600"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white`}
                  placeholder="Enter email"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {checkingEmail && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                  {!checkingEmail && emailAvailable && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {!checkingEmail && emailError && <AlertCircle className="h-4 w-4 text-red-500" />}
                </div>
              </div>
              {emailError && <p className="text-sm text-red-500">{emailError}</p>}
            </div>

            {/* Role Field - Replaced with CustomRoleDropdown */}
            <div className="space-y-2">
              <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role*
              </label>
              <CustomRoleDropdown
                options={roles}
                value={formData.roleId}
                onChange={handleChange}
                placeholder="Select a role"
                error={!!roleError}
                errorMessage={roleError}
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                A temporary password will be generated and sent to the user's email address. The user will be required
                to change their password on first login.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/dashboard/dept/users")}
                disabled={isCreatingUser}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreatingUser || isValidating || !formData.username || !formData.email || !formData.roleId}
              >
                {isValidating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : isCreatingUser ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DeptPermissionGuard>
  )
}

export default CreateUser