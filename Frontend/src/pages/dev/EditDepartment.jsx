"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react" // Add this import

export default function EditDepartment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    code: "",
  })

  useEffect(() => {
    // Simulate fetching department data
    setFormData({
      name: "Engineering",
      code: "ENG",
    })
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Updating department:", formData)
    navigate("/departments")
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      {/* Back button */}
      <button
        onClick={() => navigate("/dashboard/dev/departments")}
        className="mb-4 flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Departments
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Edit Department {id}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Department Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Department Code
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <button 
            type="submit" 
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md 
              hover:bg-blue-600 transition-colors"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  )
}

