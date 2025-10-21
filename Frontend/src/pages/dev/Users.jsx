"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import apiClient from "../../utils/apiClient"
import SearchBar from "../../components/dev/SearchBar"
import {
  Trash2,
  Key,
  Filter,
  RefreshCcw,
  CheckCircle,
  AlertCircle,
  UsersIcon,
  Plus,
  LayoutGrid,
  LayoutList,
} from "lucide-react"
import Button from "../../components/dept/Button"
import Modal from "../../components/dept/Modal"
import Toast from "../../components/common/Toast"
import SortDropdown from "../../components/common/SortDropdown"
import ProfileImage from "../../components/common/ProfileImage"
import { useAuth } from "../../context/AuthContext"
import PermissionButton from "../../components/common/PermissionButton"
import PermissionGuard from "../../components/common/PermissionGuard"
import { FEATURES, PERMISSIONS } from "../../utils/permissionUtils"
import { useViewMode } from "../../hooks/useViewMode"
import CustomDropdown from "../../components/common/CustomDropdown"

const isDeleteProtected = (user) => {
  return user.roles.some(
    (role) =>
      role.id === "DROL001" || // DevAdmin
      role.id === "ROLE_HEAD", // Department Head
  )
}

const isResetProtected = (user) => {
  return user.roles.some((role) => role.id === "DROL001") // Only DevAdmin
}

const roleColorMap = {
  DROL001: "blue",
  DROL002: "purple",
  DROL003: "green",
  ROLE_HEAD: "purple",
  ROLE_MANAGER: "blue",
  ROLE_STAFF: "gray",
  ROLE_SUPERVISOR: "green",
  // Add other role IDs and colors as needed
}

export default function UsersPage() {
  const [userType, setUserType] = useState("dev")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterOpen, setFilterOpen] = useState(false)
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [isResetting, setIsResetting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toasts, setToasts] = useState([])
  const [roleFilter, setRoleFilter] = useState("all")
  // Add sorting state
  const [sortBy, setSortBy] = useState("")
  const [sortOrder, setSortOrder] = useState("asc")

  // Add viewMode state using the imported hook
  const { viewMode, setViewMode } = useViewMode("table")

  const navigate = useNavigate()

  // Get auth context for permissions
  const { user: currentUser } = useAuth()

  const filterRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const getUniqueDepartments = () => {
    const departments = users
      .filter((user) => user.type === "dept" && user.department?.name)
      .map((user) => ({
        id: user.department.id,
        name: user.department.name,
      }))
    return Array.from(new Map(departments.map((item) => [item.id, item])).values())
  }

  // Add function to get unique roles for department users
  const getUniqueRoles = () => {
    const roles = users
      .filter((user) => user.type === "dept" && user.roles?.length > 0)
      .flatMap((user) => user.roles)
      .filter((role) => role.id.startsWith("ROLE_")) // Only department roles
    return Array.from(new Map(roles.map((item) => [item.id, item])).values())
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get("/users")

      if (response.data.success) {
        setUsers(response.data.data)
        // Add success toast
        setToasts((prev) => [
          ...prev,
          {
            id: Date.now(),
            message: "Users list refreshed successfully",
            type: "success",
          },
        ])
      } else {
        throw new Error(response.data.message || "Failed to fetch users")
      }
    } catch (err) {
      console.error("Error fetching users:", err)
      setError(err.message)
      // Add error toast
      setToasts((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: err.message || "Failed to refresh users list",
          type: "error",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  // Get user status with optional chaining for safety
  const getUserStatus = (user) => {
    if (user.state?.isFirstLogin && user.state?.needsPasswordChange) return "inactive"
    if (!user.state?.isFirstLogin && user.state?.needsPasswordChange) return "partially-inactive"
    if (!user.state?.isFirstLogin && !user.state?.needsPasswordChange) return "active"
    return "inactive"
  }

  // Apply all filters
  const filteredUsers = users
    .filter((user) => {
      // Base filter for user type
      if (user.type !== userType) return false

      // Search filter
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        user.username.toLowerCase().includes(searchLower) || user.email.toLowerCase().includes(searchLower)
      if (!matchesSearch) return false

      // Only apply department and role filters for dept users
      if (user.type === "dept") {
        // Unassigned users filter (users with no department)
        if (departmentFilter === "unassigned") {
          return !user.department || !user.department.id
        }

        // Department filter
        if (departmentFilter !== "all" && departmentFilter !== "unassigned") {
          if (!user.department || user.department.id !== departmentFilter) {
            return false
          }
        }

        // Role filter
        if (roleFilter !== "all") {
          if (!user.roles?.some((role) => role.id === roleFilter)) {
            return false
          }
        }
      }

      return true
    })
    .sort((a, b) => {
      if (!sortBy) return 0

      const factor = sortOrder === "asc" ? 1 : -1

      switch (sortBy) {
        case "username":
          return a.username.localeCompare(b.username) * factor
        case "email":
          return a.email.localeCompare(b.email) * factor
        case "status":
          return getUserStatus(a).localeCompare(getUserStatus(b)) * factor
        case "lastLogin":
          const aDate = a.state?.lastLogin ? new Date(a.state.lastLogin).getTime() : 0
          const bDate = b.state?.lastLogin ? new Date(b.state.lastLogin).getTime() : 0
          return (aDate - bDate) * factor
        default:
          return 0
      }
    })

  // Get role display info
  const getRoleInfo = (role) => {
    if (!role) return { name: "User", color: "gray" }
    const color = roleColorMap[role.id] || "gray"
    return {
      name: role.name,
      color: color,
    }
  }

  // Status badge colors
  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      "partially-inactive": "bg-amber-100 text-amber-800",
      inactive: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  // Role badge colors
  const getRoleBadgeColor = (color) => {
    const colors = {
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      green: "bg-green-100 text-green-800 border-green-200",
      gray: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return colors[color] || colors.gray
  }

  const isResetDisabled = (user) => {
    return isResetProtected(user) || getUserStatus(user) === "partially-inactive"
  }

  const handleResetPassword = (user) => {
    setSelectedUser(user)
    setIsResetPasswordModalOpen(true)
  }

  const confirmResetPassword = async () => {
    setIsResetting(true)
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await apiClient.post(
        `/auth/reset-password/${selectedUser.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.success) {
        setToasts((prev) => [
          ...prev,
          {
            id: Date.now(),
            message: response.data.message || "Password reset successful",
            type: "success",
          },
        ])
        setIsResetPasswordModalOpen(false)
      }
    } catch (err) {
      setToasts((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: err.response?.data?.message || "Error resetting password",
          type: "error",
        },
      ])
    } finally {
      setIsResetting(false)
      setIsResetPasswordModalOpen(false)
      fetchUsers()
    }
  }

  const isDeleteDisabled = (user) => {
    return isDeleteProtected(user)
  }

  const handleDeleteUser = (user) => {
    setUserToDelete(user)
    setDeleteError(null)
    setDeleteModalOpen(true)
  }

  // Fixed API call in confirmDeleteUser
  const confirmDeleteUser = async () => {
    setIsDeleting(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Authentication token not found")

      const response = await apiClient.put(
        `/users/${userToDelete.id}`,
        {}, // Empty data object
        {
          // Config as third parameter
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (response.data.success) {
        setToasts((prev) => [
          ...prev,
          {
            id: Date.now(),
            message: response.data.message || "User deleted successfully",
            type: "success",
          },
        ])
        setDeleteModalOpen(false)
        fetchUsers() // Refresh the user list
      }
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Error deleting user")
      setToasts((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: err.response?.data?.message || "Error deleting user",
          type: "error",
        },
      ])
    } finally {
      setIsDeleting(false)
    }
  }

  // Format last login date
  const formatLastLogin = (lastLoginDate) => {
    if (!lastLoginDate) return "Never"

    const lastLogin = new Date(lastLoginDate)
    const now = new Date()
    const diffMs = now - lastLogin
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`

    return lastLogin.toLocaleDateString()
  }

  return (
    <div className="max-w-auto mx-auto p-6 dark:bg-gray-900">
      <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
          />
        ))}
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2 flex items-center">
            <UsersIcon className="mr-2 h-6 w-6 text-blue-500" />
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage system users and their permissions</p>
        </div>
        <div className="">
          <PermissionButton
            featureId={FEATURES.DEV_USERS}
            permission={PERMISSIONS.WRITE}
            className="flex items-center gap-2"
            onClick={() => navigate("/dashboard/dev/users/create")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </PermissionButton>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-blue-500 dark:text-blue-400 mb-2">
            {users.filter((u) => u.type === "dev").length}
          </div>
          <div className="text-gray-600 dark:text-gray-300">Developer Users</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-purple-500 mb-2">{users.filter((u) => u.type === "dept").length}</div>
          <div className="text-gray-600 dark:text-gray-300">Department Users</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-green-500 mb-2">
            {users.filter((u) => getUserStatus(u) === "active").length}
          </div>
          <div className="text-gray-600 dark:text-gray-300">Active Users</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-amber-500 mb-2">
            {users.filter((u) => getUserStatus(u) === "partially-inactive").length}
          </div>
          <div className="text-gray-600 dark:text-gray-300">Partially Inactive Users</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-gray-500 mb-2">{users.length}</div>
          <div className="text-gray-600 dark:text-gray-300">Total Users</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="p-4 border-b flex flex-col lg:flex-row  gap-4">
          {/* User type filter buttons - made more mobile-friendly */}
          <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
            <button
              onClick={() => setUserType("dev")}
              className={`px-4 py-2 rounded-lg transition-colors flex-1 sm:flex-none ${
                userType === "dev"
                  ? "bg-blue-500 text-white dark:bg-blue-600"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Dev Users
            </button>
            <button
              onClick={() => setUserType("dept")}
              className={`px-4 py-2 rounded-lg transition-colors flex-1 sm:flex-none ${
                userType === "dept"
                  ? "bg-blue-500 text-white dark:bg-blue-600"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Department Users
            </button>
          </div>

          {/* Search and filter controls - improved for mobile */}
          <div className="flex flex-col sm:flex-row  gap-3 items-center  lg:flex-row lg:justify-between ">
            <div className="w-full sm:w-auto">
              <SearchBar onSearch={setSearchTerm} placeholder="Search..." className="w-full" />
            </div>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start w-full sm:w-auto">
              <button
                onClick={fetchUsers}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Refresh users"
              >
                <RefreshCcw className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>

              {/* View mode toggle buttons */}
              <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 ${
                    viewMode === "table"
                      ? "bg-blue-500 text-white"
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                  title="Table view"
                >
                  <LayoutList className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("card")}
                  className={`p-2 ${
                    viewMode === "card"
                      ? "bg-blue-500 text-white"
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                  title="Card view"
                >
                  <LayoutGrid className="h-5 w-5" />
                </button>
              </div>

              <SortDropdown
                options={[
                  { label: "Username", value: "username" },
                  { label: "Email", value: "email" },
                  { label: "Status", value: "status" },
                  { label: "Last Login", value: "lastLogin" },
                ]}
                value={sortBy}
                order={sortOrder}
                onChange={(value, order) => {
                  setSortBy(value)
                  setSortOrder(order)
                }}
              />
              {userType === "dept" && (
                <div className="relative" ref={filterRef}>
                  <button
                    onClick={() => setFilterOpen(!filterOpen)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Filter className="h-4 w-4" />
                    Filters{" "}
                    {(departmentFilter !== "all" || roleFilter !== "all") && (
                      <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {[departmentFilter !== "all" && "Dept", roleFilter !== "all" && "Role"]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    )}
                  </button>

                  {filterOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 border dark:border-gray-700">
                      <div className="p-3 border-b dark:border-gray-700">
                        <h3 className="font-medium">Filter Options</h3>
                      </div>
                      <div className="p-3">
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-1">Department</label>
                          <CustomDropdown
                            options={[
                              { label: "All Departments", value: "all" },
                              { label: "Unassigned", value: "unassigned" },
                              ...getUniqueDepartments().map((dept) => ({
                                label: dept.name,
                                value: dept.id,
                              })),
                            ]}
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          >
                            
                          </CustomDropdown>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Role</label>
                          <CustomDropdown
                            options={[
                              { label: "All Roles", value: "all" },
                              { label: "Unassigned", value: "unassigned" },
                             ...getUniqueRoles().map((role) => ({
                                label: role.name,
                                value: role.id,
                              })),
                            ]}
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          >
                            
                          </CustomDropdown>
                        </div>
                      </div>
                      <div className="p-3 border-t dark:border-gray-700 flex justify-end">
                        <button
                          onClick={() => {
                            setDepartmentFilter("all")
                            setRoleFilter("all")
                          }}
                          className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <RefreshCcw className="h-12 w-12 mx-auto mb-2 opacity-50 animate-spin" />
              <p className="text-lg font-medium">Loading users...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-red-400 dark:text-red-500 mb-2">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-lg font-medium">Error loading users</p>
            </div>
            <p className="text-gray-500 dark:text-gray-400">{error}</p>
          </div>
        ) : (
          <>
            {/* No users found message - moved outside view mode conditional */}
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 dark:text-gray-500 mb-2">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-lg font-medium">No users found</p>
                </div>
                <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <>
                {/* Table View */}
                {viewMode === "table" && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Email
                          </th>
                          {userType === "dept" && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                              Department
                            </th>
                          )}
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Last Login
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredUsers.map((user) => {
                          const role = user.roles?.[0]
                          const roleInfo = getRoleInfo(role)
                          const status = getUserStatus(user)
                          return (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <ProfileImage username={user.username} profileImage={user.profileImage} size="sm" />
                                  <span className="font-medium">{user.username}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{user.email}</td>
                              {userType === "dept" && (
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                  {user.department ? user.department.name : "None"}
                                </td>
                              )}
                              <td className="px-6 py-4">
                                <div className="inline-flex">
                                  <span
                                    className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getRoleBadgeColor(
                                      roleInfo.color,
                                    )}`}
                                  >
                                    {roleInfo.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  {status === "active" ? (
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                  ) : status === "partially-inactive" ? (
                                    <AlertCircle className="h-4 w-4 text-amber-500 mr-1" />
                                  ) : (
                                    <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                                  )}
                                  <span className={`px-2 py-1 rounded-md text-xs ${getStatusColor(status)}`}>
                                    {status
                                      .split("-")
                                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                      .join(" ")}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                {user.state?.lastLogin ? formatLastLogin(user.state.lastLogin) : "Never"}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex justify-end gap-2">
                                  <PermissionGuard featureId={FEATURES.DEV_USERS} permission={PERMISSIONS.DELETE}>
                                    <button
                                      className={`p-1 rounded-full transition-colors ${
                                        isDeleteDisabled(user)
                                          ? "text-gray-400 cursor-not-allowed"
                                          : "text-red-500 hover:text-red-700 hover:bg-red-50"
                                      }`}
                                      onClick={() => !isDeleteDisabled(user) && handleDeleteUser(user)}
                                      disabled={isDeleteDisabled(user)}
                                      title={isDeleteProtected(user) ? "Cannot delete protected user" : "Delete user"}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </PermissionGuard>

                                  <PermissionGuard featureId={FEATURES.DEV_USERS} permission={PERMISSIONS.UPDATE}>
                                    <button
                                      className={`p-1 rounded-full transition-colors ${
                                        isResetDisabled(user)
                                          ? "text-gray-400 cursor-not-allowed"
                                          : "text-amber-500 hover:text-amber-700 hover:bg-amber-50"
                                      }`}
                                      onClick={() => !isResetDisabled(user) && handleResetPassword(user)}
                                      disabled={isResetDisabled(user)}
                                      title={
                                        isResetProtected(user)
                                          ? "Cannot reset DevAdmin password"
                                          : getUserStatus(user) === "partially-inactive"
                                            ? "Cannot reset password for partially inactive user"
                                            : "Reset password"
                                      }
                                    >
                                      <Key className="h-4 w-4" />
                                    </button>
                                  </PermissionGuard>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Card View */}
                {viewMode === "card" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {filteredUsers.map((user) => {
                      const role = user.roles?.[0]
                      const roleInfo = getRoleInfo(role)
                      const status = getUserStatus(user)
                      return (
                        <div
                          key={user.id}
                          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="p-4 border-b dark:border-gray-700">
                            <div className="flex items-center gap-3">
                              <ProfileImage username={user.username} profileImage={user.profileImage} size="md" />
                              <div>
                                <h3 className="font-medium">{user.username}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 space-y-3">
                            {userType === "dept" && (
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Department:</span>
                                <span className="text-sm font-medium">
                                  {user.department ? user.department.name : "None"}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500 dark:text-gray-400">Role:</span>
                              <span
                                className={`px-2 py-0.5 rounded-md text-xs font-medium border ${getRoleBadgeColor(
                                  roleInfo.color,
                                )}`}
                              >
                                {roleInfo.name}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                              <div className="flex items-center">
                                {status === "active" ? (
                                  <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                                ) : status === "partially-inactive" ? (
                                  <AlertCircle className="h-3 w-3 text-amber-500 mr-1" />
                                ) : (
                                  <AlertCircle className="h-3 w-3 text-red-500 mr-1" />
                                )}
                                <span className={`px-2 py-0.5 rounded-md text-xs ${getStatusColor(status)}`}>
                                  {status
                                    .split("-")
                                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(" ")}
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500 dark:text-gray-400">Last Login:</span>
                              <span className="text-sm">
                                {user.state?.lastLogin ? formatLastLogin(user.state.lastLogin) : "Never"}
                              </span>
                            </div>
                          </div>
                          <div className="p-3 border-t dark:border-gray-700 flex justify-end gap-2 bg-gray-50 dark:bg-gray-800">
                            <PermissionGuard featureId={FEATURES.DEV_USERS} permission={PERMISSIONS.DELETE}>
                              <button
                                className={`p-1.5 rounded transition-colors ${
                                  isDeleteDisabled(user)
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-red-500 hover:text-red-700 hover:bg-red-50"
                                }`}
                                onClick={() => !isDeleteDisabled(user) && handleDeleteUser(user)}
                                disabled={isDeleteDisabled(user)}
                                title={isDeleteProtected(user) ? "Cannot delete protected user" : "Delete user"}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </PermissionGuard>

                            <PermissionGuard featureId={FEATURES.DEV_USERS} permission={PERMISSIONS.UPDATE}>
                              <button
                                className={`p-1.5 rounded transition-colors ${
                                  isResetDisabled(user)
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-amber-500 hover:text-amber-700 hover:bg-amber-50"
                                }`}
                                onClick={() => !isResetDisabled(user) && handleResetPassword(user)}
                                disabled={isResetDisabled(user)}
                                title={
                                  isResetProtected(user)
                                    ? "Cannot reset DevAdmin password"
                                    : getUserStatus(user) === "partially-inactive"
                                      ? "Cannot reset password for partially inactive user"
                                      : "Reset password"
                                }
                              >
                                <Key className="h-4 w-4" />
                              </button>
                            </PermissionGuard>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}

            {/* Pagination - only show when there are users */}
            {filteredUsers.length > 0 && (
              <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                <div>
                  Showing {filteredUsers.length} of {users.filter((u) => u.type === userType).length} users
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
            )}
          </>
        )}
      </div>

      {/* Reset Password Modal */}
      <Modal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        title="Reset Password"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-400">
                Are you sure you want to reset the password for{" "}
                <span className="font-bold">{selectedUser.username}</span>?
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-2">
                A temporary password will be generated and sent to their email address.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setIsResetPasswordModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmResetPassword} disabled={isResetting}>
                {isResetting ? (
                  <div className="flex items-center">
                    <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                    Resetting...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete User Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete User">
        {userToDelete && (
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-400">
                Are you sure you want to delete the user <span className="font-bold">{userToDelete.username}</span>?
              </p>
              <p className="text-sm text-red-700 dark:text-red-500 mt-2">This action cannot be undone.</p>
            </div>

            {deleteError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-4">
                <p className="text-red-800 dark:text-red-400">{deleteError}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDeleteUser} disabled={isDeleting}>
                {isDeleting ? (
                  <div className="flex items-center">
                    <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </div>
                ) : (
                  "Delete User"
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

