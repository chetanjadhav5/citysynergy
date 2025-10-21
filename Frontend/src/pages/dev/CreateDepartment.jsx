"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Loader2, Check, X, User } from "lucide-react"
import apiClient from "../../utils/apiClient"
import { useToast } from "../../context/ToastContext"

export default function CreateDepartment() {
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [formData, setFormData] = useState({
    deptName: "",
    deptCode: "",
    headUserId: "",
  })

  const [formErrors, setFormErrors] = useState({
    deptName: "",
    deptCode: "",
    headUserId: "",
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestedUsers, setSuggestedUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)

  const [isCheckingCode, setIsCheckingCode] = useState(false)
  const [isCodeAvailable, setIsCodeAvailable] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)

  const searchTimeoutRef = useRef(null)
  const suggestionsRef = useRef(null)
  const formRef = useRef(null)

  // Handle clicks outside the suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Check if department code is available
  const checkDeptCode = async (code) => {
    if (code.length < 3) {
      setIsCodeAvailable(null)
      setFormErrors((prev) => ({ ...prev, deptCode: "Department code must be at least 3 characters" }))
      return
    }

    try {
      setIsCheckingCode(true)
      const response = await apiClient.post(`/departments/checkdeptcode/${code}`)

      if (response.data.success) {
        setIsCodeAvailable(response.data.data.isAvailable)

        if (!response.data.data.isAvailable) {
          setFormErrors((prev) => ({ ...prev, deptCode: "Department code is already taken" }))
        } else {
          setFormErrors((prev) => ({ ...prev, deptCode: "" }))
        }
      }
    } catch (error) {
      console.error("Error checking department code:", error)
    } finally {
      setIsCheckingCode(false)
    }
  }

  // Handle department code change with debounce
  const handleDeptCodeChange = (e) => {
    const code = e.target.value.toUpperCase() // Convert to uppercase
    setFormData((prev) => ({ ...prev, deptCode: code }))

    if (code.length < 3) {
      setIsCodeAvailable(null)
      setFormErrors((prev) => ({ ...prev, deptCode: "Department code must be at least 3 characters" }))
      return
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Set new timeout for debounce
    searchTimeoutRef.current = setTimeout(() => {
      checkDeptCode(code)
    }, 500)
  }

  // Search for unassigned users
  const searchUsers = async (query) => {
    if (!query || query.length < 2) {
      setSuggestedUsers([])
      return
    }

    try {
      setIsLoadingUsers(true)
      const response = await apiClient.get(`/users/unassigned?search=${query}`)

      if (response.data.success) {
        setSuggestedUsers(response.data.data)
      } else {
        setSuggestedUsers([])
      }
    } catch (error) {
      console.error("Error searching users:", error)
      setSuggestedUsers([])
    } finally {
      setIsLoadingUsers(false)
    }
  }

  // Handle search input change with debounce
  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchTerm(query)
    setShowSuggestions(true)

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Set new timeout for debounce
    searchTimeoutRef.current = setTimeout(() => {
      searchUsers(query)
    }, 300)
  }

  // Select a user from suggestions
  const selectUser = (user) => {
    setSelectedUser(user)
    setSearchTerm(user.username)
    setFormData((prev) => ({ ...prev, headUserId: user.id }))
    setFormErrors((prev) => ({ ...prev, headUserId: "" }))
    setShowSuggestions(false)
  }

  // Clear selected user
  const clearSelectedUser = () => {
    setSelectedUser(null)
    setSearchTerm("")
    setFormData((prev) => ({ ...prev, headUserId: "" }))
  }

  // Validate form
  const validateForm = () => {
    const errors = {
      deptName: "",
      deptCode: "",
      headUserId: "",
    }

    let isValid = true

    if (!formData.deptName.trim()) {
      errors.deptName = "Department name is required"
      isValid = false
    }

    if (!formData.deptCode.trim()) {
      errors.deptCode = "Department code is required"
      isValid = false
    } else if (formData.deptCode.length < 3) {
      errors.deptCode = "Department code must be at least 3 characters"
      isValid = false
    } else if (isCodeAvailable === false) {
      errors.deptCode = "Department code is already taken"
      isValid = false
    }

    if (!formData.headUserId) {
      errors.headUserId = "Department head is required"
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)

      const response = await apiClient.post("/departments", {
        deptName: formData.deptName,
        deptCode: formData.deptCode,
        headUserId: formData.headUserId,
      })

      if (response.data.success) {
        addToast(response.data.message || "Department created successfully", "success")
        navigate("/dashboard/dev/departments")
      }
    } catch (error) {
      console.error("Error creating department:", error)
      addToast(error.response?.data?.message || "Failed to create department", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 px-4">
      {/* Back button */}
      <button
        onClick={() => navigate("/dashboard/dev/departments")}
        className="mb-4 flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Departments
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Create Department</h2>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Department Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.deptName}
              onChange={(e) => {
                setFormData({ ...formData, deptName: e.target.value })
                if (e.target.value.trim()) {
                  setFormErrors((prev) => ({ ...prev, deptName: "" }))
                }
              }}
              className={`w-full px-3 py-2 border ${formErrors.deptName ? "border-red-300 dark:border-red-600" : "border-gray-300 dark:border-gray-600"} 
                rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
            />
            {formErrors.deptName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.deptName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Department Code <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.deptCode}
                onChange={handleDeptCodeChange}
                className={`w-full px-3 py-2 border ${formErrors.deptCode ? "border-red-300 dark:border-red-600" : "border-gray-300 dark:border-gray-600"} 
                  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 pr-10`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {isCheckingCode ? (
                  <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                ) : isCodeAvailable === true ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : isCodeAvailable === false ? (
                  <X className="h-4 w-4 text-red-500" />
                ) : null}
              </div>
            </div>
            {formErrors.deptCode && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.deptCode}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Department code must be at least 3 characters and unique
            </p>
          </div>

          <div className="relative" ref={suggestionsRef}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assign Admin <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div
                className={`flex items-center w-full px-3 py-2 border ${formErrors.headUserId ? "border-red-300 dark:border-red-600" : "border-gray-300 dark:border-gray-600"} 
                rounded-md focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
              >
                {selectedUser ? (
                  <>
                    <div className="flex-1 flex items-center">
                      <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-xs mr-2">
                        {selectedUser.username.substring(0, 2).toUpperCase()}
                      </div>
                      <span>{selectedUser.username}</span>
                    </div>
                    <button
                      type="button"
                      onClick={clearSelectedUser}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="Search for users..."
                      className="flex-1 bg-transparent border-none focus:outline-none p-0"
                    />
                    {isLoadingUsers && <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />}
                  </>
                )}
              </div>

              {showSuggestions && !selectedUser && (
                <div
                  className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border 
                  dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto"
                >
                  {isLoadingUsers ? (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Searching users...
                    </div>
                  ) : suggestedUsers.length > 0 ? (
                    suggestedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 
                          cursor-pointer text-gray-900 dark:text-gray-100 flex items-center"
                        onClick={() => selectUser(user)}
                      >
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-xs mr-2">
                          {user.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div>{user.username}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    ))
                  ) : searchTerm.length > 1 ? (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">No unassigned users found</div>
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      Type at least 2 characters to search
                    </div>
                  )}
                </div>
              )}
            </div>
            {formErrors.headUserId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.headUserId}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md 
              hover:bg-blue-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed
              flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Department...
              </>
            ) : (
              "Create Department"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

