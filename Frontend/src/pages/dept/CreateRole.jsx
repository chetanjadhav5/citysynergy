

"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Shield, Lock } from 'lucide-react'
import Button from "../../components/dept/Button"

const CreateRole = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    roleName: "",
    description: "",
    permissions: {
      dashboard: false,
      tenders: false,
      clashes: false,
      issues: false,
      inventory: false,
      users: false,
      roles: false,
      features: false
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real app, you would send this to an API
    console.log("Form submitted:", formData)
    navigate("dashboard/dept/roles")
  }

  const handlePermissionChange = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission]
      }
    }))
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/dashboard/dept/roles")}
          className="p-2 mr-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-600 dark:hover:text-sky-400"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
            <Shield className="mr-2 h-6 w-6 text-purple-500" />
            Create Role
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Define a new role and its permissions</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="roleName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role Name*
              </label>
              <input
                type="text"
                id="roleName"
                value={formData.roleName}
                onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <Lock className="h-4 w-4 mr-1" />
                Permissions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(formData.permissions).map(([permission, isChecked]) => (
                  <label
                    key={permission}
                    className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handlePermissionChange(permission)}
                      className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {permission}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="secondary" onClick={() => navigate("dashboard/dept/roles")}>
                Cancel
              </Button>
              <Button type="submit">Create Role</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateRole