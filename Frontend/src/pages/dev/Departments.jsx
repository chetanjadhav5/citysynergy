// src/pages/Departments.jsx
"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import SearchBar from "../../components/dev/SearchBar"
import apiClient from "../../utils/apiClient"
import { Building2, Plus, Edit, Trash2, RefreshCcw, Users, Info, Loader2 } from "lucide-react"
import Button from "../../components/dept/Button"
import Modal from "../../components/dept/Modal"
import { useToast } from "../../context/ToastContext"
// Import the SortDropdown component
import SortDropdown from "../../components/common/SortDropdown"

export default function DepartmentsPage() {
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState("asc")
  const [viewMode, setViewMode] = useState("table") // table or card view

  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deptToDelete, setDeptToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [infoModalOpen, setInfoModalOpen] = useState(false)
  const [selectedDeptInfo, setSelectedDeptInfo] = useState(null)
  const [loadingDeptInfo, setLoadingDeptInfo] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Edit department modal state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deptToEdit, setDeptToEdit] = useState(null)
  const [newDeptName, setNewDeptName] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  const filterRef = useRef(null)

  // Handle clicks outside the filter dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      setIsRefreshing(true)
      setLoading(true)
      const response = await apiClient.get("/departments")

      if (response.data.success) {
        setDepartments(response.data.data)
        addToast("Departments refreshed successfully", "success")
      }
    } catch (err) {
      setError(err.message)
      addToast("Failed to fetch departments", "error")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  // Delete department
  const confirmDeleteDepartment = async () => {
    try {
      setIsDeleting(true)
      const response = await apiClient.put(`/departments/delete-dept/${deptToDelete.deptId}`)

      if (response.data.success) {
        addToast(`${response.data.data.departmentName} deleted successfully`, "success")
        fetchDepartments()
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to delete department", "error")
    } finally {
      setIsDeleting(false)
      setDeleteModalOpen(false)
    }
  }

  // Fetch department info
  const fetchDepartmentInfo = async (deptId) => {
    try {
      setLoadingDeptInfo(true)
      setInfoModalOpen(true)

      const response = await apiClient.get(`/departments/get-dept/${deptId}`)

      if (response.data.success) {
        setSelectedDeptInfo(response.data.data)
      }
    } catch (err) {
      addToast("Failed to fetch department details", "error")
      setInfoModalOpen(false)
    } finally {
      setLoadingDeptInfo(false)
    }
  }

  // Edit department name
  const handleEditDepartment = (dept) => {
    setDeptToEdit(dept)
    setNewDeptName(dept.deptName)
    setEditModalOpen(true)
  }

  // Save edited department name
  const saveEditedDepartment = async () => {
    if (!newDeptName.trim()) {
      addToast("Department name cannot be empty", "error")
      return
    }

    try {
      setIsEditing(true)

      const response = await apiClient.put(`/departments/editDeptName/${deptToEdit.deptId}`, {
        deptName: newDeptName,
      })

      if (response.data.success) {
        addToast(response.data.message || "Department name updated successfully", "success")
        fetchDepartments()
        setEditModalOpen(false)
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to update department name", "error")
    } finally {
      setIsEditing(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  // Apply filters and sorting
  const filteredDepartments = departments
    .filter(
      (dept) =>
        dept.deptName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.deptCode.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      const factor = sortOrder === "asc" ? 1 : -1

      if (sortBy === "name") {
        return a.deptName.localeCompare(b.deptName) * factor
      } else if (sortBy === "users") {
        return ((a.users?.length || 0) - (b.users?.length || 0)) * factor
      } else if (sortBy === "code") {
        return a.deptCode.localeCompare(b.deptCode) * factor
      } else if (sortBy === "date") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() * factor
      }

      return 0
    })

  // Toggle sort order
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  return (
    <div className="max-w-auto mx-auto p-6 dark:bg-gray-900">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2 flex items-center dark:text-white">
            <Building2 className="mr-2 h-6 w-6 text-blue-500" />
            Department Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage company departments and organizational structure</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate("/dashboard/dev/departments/create")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Department
          </Button>
        </div>
      </div>

      {/* Department Stats */}
      <div className="mb-6 grid grid-cols-3 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="text-gray-600 dark:text-gray-300 text-sm font-medium">Total Departments</div>
            <Building2 className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">{departments.length}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="text-gray-600 text-sm font-medium">Total Users</div>
            <Users className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 mt-2">
            {departments.reduce((sum, dept) => sum + (dept.users?.length || 0), 0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Across all departments</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="text-gray-600 text-sm font-medium">Departments with Head</div>
            <Users className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-600 mt-2">
            {departments.filter((dept) => dept.deptHead).length}
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="p-4 border-b dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === "table"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === "card"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Card View
            </button>
          </div>

          {/* Replace the filter dropdown with the SortDropdown component */}
          {/* Find the filter section and replace it with: */}
          <div className="flex flex-col sm:flex-row gap-3">
            <SearchBar onSearch={setSearchTerm} placeholder="Search departments..." className="w-full sm:w-64" />
            <button
              onClick={fetchDepartments}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
              title="Refresh departments"
              disabled={isRefreshing}
            >
              <RefreshCcw
                className={`h-5 w-5 text-gray-600 dark:text-gray-300 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>
            <SortDropdown
              options={[
                { label: "Department Name", value: "name" },
                { label: "Department Code", value: "code" },
                { label: "User Count", value: "users" },
                { label: "Creation Date", value: "date" },
              ]}
              value={sortBy}
              order={sortOrder}
              onChange={(value, order) => {
                setSortBy(value)
                setSortOrder(order)
              }}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <RefreshCcw className="h-12 w-12 mx-auto mb-2 opacity-50 animate-spin" />
              <p className="text-lg font-medium dark:text-gray-400">Loading departments...</p>
            </div>
          </div>
        ) : viewMode === "table" ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Department ID
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Name
                      {sortBy === "name" && <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                    onClick={() => handleSort("code")}
                  >
                    <div className="flex items-center">
                      Code
                      {sortBy === "code" && <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Department Head
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                    onClick={() => handleSort("users")}
                  >
                    <div className="flex items-center">
                      Users
                      {sortBy === "users" && <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDepartments.map((dept) => (
                  <tr key={dept.deptId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{dept.deptId}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{dept.deptName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Created {new Date(dept.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md">
                        {dept.deptCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {dept.deptHead ? (
                        <>
                          <div className="font-medium dark:text-white">{dept.deptHead.username}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{dept.deptHead.email}</div>
                        </>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">No head assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">{dept.users?.length || 0} users</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => fetchDepartmentInfo(dept.deptId)}
                          className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
                          title="View Details"
                        >
                          <Info className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditDepartment(dept)}
                          className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
                          title="Edit Department"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeptToDelete(dept)
                            setDeleteModalOpen(true)
                          }}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                          title="Delete Department"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepartments.map((dept) => (
              <div
                key={dept.deptId}
                className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                {/* Department header with color-coded badge */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg text-gray-900 dark:text-white">{dept.deptName}</h3>
                      <div className="flex items-center mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                          {dept.deptCode}
                        </span>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          ID: <span className="font-medium">{dept.deptId}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => fetchDepartmentInfo(dept.deptId)}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                        title="View Department"
                      >
                        <Info className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditDepartment(dept)}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                        title="Edit Department"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDeptToDelete(dept)
                          setDeleteModalOpen(true)
                        }}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                        title="Delete Department"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Department head section */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department Head</h4>
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-sm">
                      {dept.deptHead ? dept.deptHead.username.substring(0, 2).toUpperCase() : "NA"}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {dept.deptHead ? dept.deptHead.username : "Not Assigned"}
                      </p>
                      <p
                        className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]"
                        title={dept.deptHead ? dept.deptHead.email : ""}
                      >
                        {dept.deptHead ? dept.deptHead.email : "No email available"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Department stats */}
                <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
                  <div className="p-4 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Users</p>
                    <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                      {dept.users ? dept.users.length : 0}
                    </p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {new Date(dept.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredDepartments.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <RefreshCcw className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-lg font-medium dark:text-gray-400">No departments found</p>
            </div>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
          </div>
        )}

        <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <div>
            Showing {filteredDepartments.length} of {departments.length} departments
          </div>
          <div className="flex gap-2">
            <button
              disabled
              className="px-3 py-1 rounded border bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            >
              Previous
            </button>
            <button className="px-3 py-1 rounded border bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
              1
            </button>
            <button className="px-3 py-1 rounded border hover:bg-gray-50 dark:hover:bg-gray-700">Next</button>
          </div>
        </div>
      </div>

      {/* Delete Department Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Department">
        {deptToDelete && (
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-400">
                Are you sure you want to delete <span className="font-bold">{deptToDelete.deptName}</span>?
              </p>
              <p className="text-sm text-red-700 dark:text-red-500 mt-2">
                This will permanently delete the department and remove all associated users. This action cannot be
                undone.
              </p>
              {deptToDelete.users?.length > 0 && (
                <p className="text-sm text-red-700 dark:text-red-500 mt-2">
                  {deptToDelete.users.length} user(s) will be affected.
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDeleteDepartment} disabled={isDeleting}>
                {isDeleting ? (
                  <div className="flex items-center">
                    <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </div>
                ) : (
                  "Delete Department"
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Department Info Modal */}
      <Modal isOpen={infoModalOpen} onClose={() => setInfoModalOpen(false)} title="Department Information">
        {loadingDeptInfo ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-300">Loading department information...</span>
          </div>
        ) : (
          selectedDeptInfo && (
            <div className="space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Department Details</h3>
                  <div className="space-y-2">
                    <p className="text-lg font-medium dark:text-white">{selectedDeptInfo.department.deptName}</p>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                        {selectedDeptInfo.department.deptCode}
                      </span>
                      <span className="text-xs text-gray-500">
                        Created: {new Date(selectedDeptInfo.department.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Department Head</h3>
                  {selectedDeptInfo.department.deptHead ? (
                    <div className="space-y-1">
                      <p className="text-lg font-medium dark:text-white">
                        {selectedDeptInfo.department.deptHead.username}
                      </p>
                      <p className="text-sm text-gray-500 break-words">{selectedDeptInfo.department.deptHead.email}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No department head assigned</p>
                  )}
                </div>
              </div>

              <div className="border-t dark:border-gray-700 pt-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 flex items-center justify-between">
                  <span>Department Users</span>
                  <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                    {selectedDeptInfo.users.length} users
                  </span>
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {selectedDeptInfo.users.length > 0 ? (
                    selectedDeptInfo.users.map((user) => (
                      <div
                        key={user.uuid}
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <p className="font-medium dark:text-white">{user.username}</p>
                            <p className="text-sm text-gray-500 break-words">{user.email}</p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((role) => (
                              <span
                                key={role.roleId}
                                className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                              >
                                {role.roleName}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No users in this department</p>
                  )}
                </div>
              </div>
            </div>
          )
        )}
      </Modal>

      {/* Edit Department Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Department">
        {deptToEdit && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department Name</label>
              <input
                type="text"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm">
              <p className="text-amber-800 dark:text-amber-400">
                Note: You cannot change the department code ({deptToEdit.deptCode}).
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="secondary" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveEditedDepartment} disabled={isEditing || !newDeptName.trim()}>
                {isEditing ? (
                  <div className="flex items-center">
                    <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </div>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

