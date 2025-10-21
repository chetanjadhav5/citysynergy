"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

export default function EditUser() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    type: "dev",
  })
  const [error, setError] = useState("")

  useEffect(() => {
    // Simulate fetching user data
    setFormData({
      username: "john_doe",
      email: "john_doe@example.com",
      type: "dev",
    })
  }, [id])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.username || !formData.email) {
      setError("All fields are required")
      return
    }
    // Handle form submission
    console.log("Updating user:", formData)
    navigate("/dashboard/dev/users")
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      {/* Back button */}
      <button
        onClick={() => navigate("/dashboard/dev/users")}
        className="mb-4 flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Users
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Edit User {id}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              User Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="dev">Dev</option>
              <option value="dept">Department</option>
            </select>
          </div>

          {error && <div className="text-red-500 dark:text-red-400 text-sm">{error}</div>}

          <button 
            type="submit" 
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 
              text-white rounded-md transition-colors"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  )
}

