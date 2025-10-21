"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Shield, Plus, Edit, Trash2, Lock, LayoutGrid, List, RefreshCcw, AlertCircle, Eye, Check, X } from "lucide-react"
import SearchBar from "../../components/dev/SearchBar"
import Modal from "../../components/dept/Modal"
import Button from "../../components/dept/Button"
import SlideOver from "../../components/dept/SlideOver"
import apiClient from "../../utils/apiClient"
import Card from "../../components/dept/Card"
import Toast from "../../components/common/Toast"
import SortDropdown from "../../components/common/SortDropdown"
import { useAuth } from "../../context/AuthContext"
import PermissionButton from "../../components/common/PermissionButton"
import PermissionGuard from "../../components/common/PermissionGuard"
import { FEATURES, PERMISSIONS } from "../../utils/permissionUtils"

// Permission type mapping
const permissionTypes = [
  { key: "canRead", label: "Read", shortKey: "R" },
  { key: "canWrite", label: "Write", shortKey: "W" },
  { key: "canUpdate", label: "Update", shortKey: "U" },
  { key: "canDelete", label: "Delete", shortKey: "D" },
]

const Roles = () => {
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  // Change the initial viewMode state to "card"
  const [viewMode, setViewMode] = useState("card")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [newRole, setNewRole] = useState({ roleName: "", roleDescription: "" })
  const [permissions, setPermissions] = useState({})
  const [showSlideOver, setShowSlideOver] = useState(false)
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [savingPermissions, setSavingPermissions] = useState(false)
  const [creatingRole, setCreatingRole] = useState(false)
  const [deletingRole, setDeletingRole] = useState(false)
  const [toast, setToast] = useState(null)
  // Stats calculations
  const totalRoles = roles.length
  const totalUsers = 0 // This would need to be fetched from an API if needed
  const avgPermissions =
    roles.length > 0 ? Math.round(roles.reduce((sum, role) => sum + role.features.length, 0) / roles.length) : 0

  // Add sorting state
  const [sortBy, setSortBy] = useState("")
  const [sortOrder, setSortOrder] = useState("asc")

  useEffect(() => {
    // Only fetch roles if the user has permission
    if (hasPermission(FEATURES.DEV_ROLES, PERMISSIONS.READ)) {
      fetchRoles()
    } else {
      setLoading(false)
      setError("Insufficient permissions to view roles")
    }
    
    return () => {
      // Cleanup any pending state updates
      setRoles([])
      setLoading(false)
      setError(null)
    }
  }, [hasPermission])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      
      // Check if user has permission to view roles
      if (!hasPermission(FEATURES.DEV_ROLES, PERMISSIONS.READ)) {
        setError("Insufficient permissions to view roles")
        showToast("Error loading roles: Insufficient permissions", "error")
        setLoading(false)
        return
      }
      
      const response = await apiClient.get("/roles/fetchdevroles")
      if (response.data.success) {
        setRoles(response.data.data)
      } else {
        setError(response.data.message || "Failed to load roles")
        showToast("Failed to load roles", "error")
      }
    } catch (error) {
      console.error("Error fetching roles:", error)
      setError(error.message)
      showToast("Error loading roles: " + (error.response?.data?.message || error.message), "error")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const refreshRoles = () => {
    // Check if user has permission to view roles
    if (!hasPermission(FEATURES.DEV_ROLES, PERMISSIONS.READ)) {
      showToast("Insufficient permissions to refresh roles", "error")
      return
    }
    
    setRefreshing(true)
    fetchRoles()
  }

  const fetchRolePermissions = async (roleId) => {
    try {
      const response = await apiClient.get(`/roles/devrole/${roleId}/permissions`)
      if (response.data.success) {
        initializePermissions(response.data.data)
        return response.data.data
      } else {
        showToast("Failed to load role permissions", "error")
      }
    } catch (error) {
      console.error("Error fetching role permissions:", error)
      showToast("Error loading permissions: " + (error.response?.data?.message || error.message), "error")
    }
    return null
  }

  const initializePermissions = (roleData) => {
    
    const initialPermissions = {}
    if (roleData && roleData.features) {
      roleData.features.forEach((feature) => {
        initialPermissions[feature.featureId] = {
          canRead: feature.permissions.canRead,
          canWrite: feature.permissions.canWrite,
          canUpdate: feature.permissions.canUpdate,
          canDelete: feature.permissions.canDelete,
        }
      })
    }
    setPermissions(initialPermissions)
  }

  const handlePermissionChange = (featureId, permission) => {
    try {
      setPermissions((prev) => ({
        ...prev,
        [featureId]: {
          ...(prev[featureId] || {}),
          [permission]: !(prev[featureId]?.[permission] ?? false),
        },
      }))
    } catch (error) {
      console.error("Error changing permission:", error)
      showToast("Error updating permission", "error")
    }
  }

  const savePermissions = async () => {
    if (!selectedRole) return
    
    // Check if user has permission to update roles
    if (!hasPermission(FEATURES.DEV_ROLES, PERMISSIONS.UPDATE)) {
      showToast("Insufficient permissions to update role permissions", "error")
      return
    }

    try {
      setSavingPermissions(true)

      // Format permissions for API
      const permissionsToUpdate = Object.entries(permissions).map(([featureId, perms]) => ({
        featureId,
        ...perms,
      }))

      const response = await apiClient.put(`/roles/devrole/${selectedRole.roleId}/permissions`, {
        permissions: permissionsToUpdate,
      })

      if (response.data.success) {
        showToast("Permissions updated successfully", "success")
        setShowSlideOver(false)
        refreshRoles()
      } else {
        showToast("Failed to update permissions", "error")
      }
    } catch (error) {
      console.error("Error updating permissions:", error)
      showToast("Error updating permissions: " + (error.response?.data?.message || error.message), "error")
    } finally {
      setSavingPermissions(false)
    }
  }

  const createRole = async () => {
    if (!newRole.roleName.trim()) {
      showToast("Role name is required", "error")
      return
    }
    
    // Check if user has permission to create roles
    if (!hasPermission(FEATURES.DEV_ROLES, PERMISSIONS.WRITE)) {
      showToast("Insufficient permissions to create roles", "error")
      return
    }

    try {
      setCreatingRole(true)

      const response = await apiClient.post("/roles/devrole", newRole)

      if (response.data.success) {
        showToast("Role created successfully", "success")
        setShowCreateModal(false)
        setNewRole({ roleName: "", roleDescription: "" })
        refreshRoles()
      } else {
        showToast("Failed to create role", "error")
      }
    } catch (error) {
      console.error("Error creating role:", error)
      showToast("Error creating role: " + (error.response?.data?.message || error.message), "error")
    } finally {
      setCreatingRole(false)
    }
  }

  const deleteRole = async () => {
    if (!selectedRole) return
    
    // Check if user has permission to delete roles
    if (!hasPermission(FEATURES.DEV_ROLES, PERMISSIONS.DELETE)) {
      showToast("Insufficient permissions to delete roles", "error")
      return
    }

    try {
      setDeletingRole(true)
      const response = await apiClient.put(`/roles/devrole/${selectedRole.roleId}`)

      if (response.data.success) {
        showToast(`Role "${selectedRole.roleName}" deleted successfully`, "success")
        setShowDeleteModal(false)
        refreshRoles()
      } else {
        showToast("Failed to delete role", "error")
      }
    } catch (error) {
      console.error("Error deleting role:", error)
      showToast("Error deleting role: " + (error.response?.data?.message || error.message), "error")
    } finally {
      setDeletingRole(false)
    }
  }

  // Improve the handleEditRole function to show modal immediately with loading state
  const [loadingPermissions, setLoadingPermissions] = useState(false)

  const handleEditRole = async (role) => {
    // Check if user has permission to update roles
    if (!hasPermission(FEATURES.DEV_ROLES, PERMISSIONS.UPDATE)) {
      showToast("Insufficient permissions to edit role permissions", "error")
      return
    }
    
    setSelectedRole(role)
    setShowSlideOver(true)
    setLoadingPermissions(true)

    try {
      const roleData = await fetchRolePermissions(role.roleId)
      if (!roleData) {
        throw new Error("Failed to load permissions")
      }
    } catch (error) {
      console.error("Error loading permissions:", error)
      showToast("Error loading permissions", "error")
    } finally {
      setLoadingPermissions(false)
    }
  }

  const handleDeleteRole = (role) => {
    // Check if user has permission to delete roles
    if (!hasPermission(FEATURES.DEV_ROLES, PERMISSIONS.DELETE)) {
      showToast("Insufficient permissions to delete roles", "error")
      return
    }
    
    setSelectedRole(role)
    setShowDeleteModal(true)
  }

  const showToast = (message, type = "success") => {
    setToast({ id: Date.now(), message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const filteredRoles = roles
    .filter((role) => role.roleName.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (!sortBy) return 0

      const factor = sortOrder === "asc" ? 1 : -1

      switch (sortBy) {
        case "name":
          return a.roleName.localeCompare(b.roleName) * factor
        case "hierarchy":
          return (a.hierarchyLevel - b.hierarchyLevel) * factor
        case "features":
          return (a.features.length - b.features.length) * factor
        default:
          return 0
      }
    })

  // Helper function to convert permissions object to array for display
  const getPermissionArray = (permissions) => {
    return Object.entries(permissions).reduce((acc, [key, value]) => {
      if (value === true) {
        const permType = permissionTypes.find((p) => p.key === key)
        if (permType) acc.push(permType.shortKey)
      }
      return acc
    }, [])
  }

  const handleViewRoleDetails = (role) => {
    setSelectedRole(role)
    setShowDetailsModal(true)
  }

  return (
    <PermissionGuard 
      featureId={FEATURES.DEV_ROLES} 
      permission={PERMISSIONS.READ}
      fallback={
        <div className="p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Insufficient Permissions</h3>
          <p className="text-gray-500 dark:text-gray-400">You don't have permission to view role management.</p>
        </div>
      }
    >
      <div className="mx-auto p-6 dark:bg-gray-900">
        {/* Toast notification */}
        {toast && (
          <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center dark:text-white">
              <Shield className="mr-2 h-6 w-6 text-purple-500" />
              Role Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Manage system roles and permissions</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={refreshRoles} variant="outline" className="flex items-center gap-2" disabled={refreshing}>
              <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <PermissionButton
              featureId={FEATURES.DEV_ROLES}
              permission={PERMISSIONS.WRITE}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Role
            </PermissionButton>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 gap-4">
          <Card className="p-4 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Roles</div>
              <Shield className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">{totalRoles}</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">System roles</div>
          </Card>

          <Card className="p-4 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Avg. Features</div>
              <Lock className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">{avgPermissions}</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Per role</div>
          </Card>
        </div>

        {/* Search and View Toggle */}
        <Card className="mb-6 overflow-hidden">
          <div className="p-4 border-b dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <SearchBar onSearch={setSearchTerm} placeholder="Search roles..." className="w-full" />
            </div>
            <div className="flex gap-2">
              <SortDropdown
                options={[
                  { label: "Role Name", value: "name" },
                  { label: "Hierarchy", value: "hierarchy" },
                  { label: "Features", value: "features" },
                ]}
                value={sortBy}
                order={sortOrder}
                onChange={(value, order) => {
                  setSortBy(value)
                  setSortOrder(order)
                }}
              />
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 ${
                    viewMode === "table"
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                      : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <List size={20} />
                </button>
                <button
                  onClick={() => setViewMode("card")}
                  className={`p-2 ${
                    viewMode === "card"
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                      : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <LayoutGrid size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Role List */}
          <div className="p-4">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : filteredRoles.length === 0 ? (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                {searchTerm ? "No roles match your search" : "No roles found"}
              </div>
            ) : viewMode === "table" ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Features
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredRoles.map((role) => (
                      <tr key={role.roleId} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{role.roleName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">ID: {role.roleId}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {role.features.slice(0, 3).map((feature) => (
                              <span
                                key={feature.featureId}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                              >
                                {feature.featureName}
                              </span>
                            ))}
                            {role.features.length > 3 && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                +{role.features.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleViewRoleDetails(role)}
                              className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-800/50 rounded-lg transition-colors"
                              title="View Role Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <PermissionButton
                              featureId={FEATURES.DEV_ROLES}
                              permission={PERMISSIONS.UPDATE}
                              onClick={() => handleEditRole(role)}
                              className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                              title="Edit Role Permissions"
                            >
                              <Edit className="h-4 w-4" />
                            </PermissionButton>
                            {role.roleId !== "DROL001" && (
                              <PermissionButton
                                featureId={FEATURES.DEV_ROLES}
                                permission={PERMISSIONS.DELETE}
                                onClick={() => handleDeleteRole(role)}
                                className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                                title="Delete Role"
                              >
                                <Trash2 className="h-4 w-4" />
                              </PermissionButton>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              // Enhance the card view design
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRoles.map((role) => (
                  <Card
                    key={role.roleId}
                    className="overflow-hidden hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg text-gray-900 dark:text-white">{role.roleName}</h3>
                          <div className="flex items-center mt-1">
                            <span className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 rounded-md">
                              ID: {role.roleId}
                            </span>
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                              Hierarchy: <span className="font-medium">{role.hierarchyLevel}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewRoleDetails(role)}
                            className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-800/50 rounded-lg transition-colors"
                            title="View Role Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <PermissionButton
                            featureId={FEATURES.DEV_ROLES}
                            permission={PERMISSIONS.UPDATE}
                            onClick={() => handleEditRole(role)}
                            className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                            title="Edit Role Permissions"
                          >
                            <Edit className="h-4 w-4" />
                          </PermissionButton>
                          {role.roleId !== "DROL001" && (
                            <PermissionButton
                              featureId={FEATURES.DEV_ROLES}
                              permission={PERMISSIONS.DELETE}
                              onClick={() => handleDeleteRole(role)}
                              className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                              title="Delete Role"
                            >
                              <Trash2 className="h-4 w-4" />
                            </PermissionButton>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-2">
                        {role.features.slice(0, 4).map((feature) => (
                          <div key={feature.featureId} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                            <p className="text-xs font-medium text-gray-900 dark:text-white mb-1 truncate">
                              {feature.featureName}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {permissionTypes.map(({ key, shortKey }) => (
                                <span
                                  key={key}
                                  className={`text-xs px-1.5 py-0.5 rounded ${
                                    feature.permissions[key]
                                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                                      : "bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                                  }`}
                                >
                                  {shortKey}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                        {role.features.length > 4 && (
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 flex items-center justify-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              +{role.features.length - 4} more features
                            </span>
                          </div>
                        )}
                        {role.features.length === 0 && (
                          <div className="col-span-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">No features assigned</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Create Role Modal */}
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Role">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role Name</label>
              <input
                type="text"
                value={newRole.roleName}
                onChange={(e) => setNewRole({ ...newRole, roleName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter role name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <input
                type="text"
                value={newRole.roleDescription}
                onChange={(e) => setNewRole({ ...newRole, roleDescription: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter role description"
              />
            </div>
            {/* Add hierarchy level to the create role modal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hierarchy Level
                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">(Lower number = higher privileges)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={newRole.hierarchyLevel || 50}
                  onChange={(e) => setNewRole({ ...newRole, hierarchyLevel: Number.parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter hierarchy level (10-100)"
                />
                <select
                  onChange={(e) => setNewRole({ ...newRole, hierarchyLevel: Number.parseInt(e.target.value) })}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Presets</option>
                  <option value="10">Admin (10)</option>
                  <option value="20">Owner (20)</option>
                  <option value="40">Manager (40)</option>
                  <option value="60">Supervisor (60)</option>
                  <option value="80">Staff (80)</option>
                  <option value="90">User (90)</option>
                </select>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Hierarchy determines which roles a user can manage. Users can only manage roles with higher numbers than
                their own.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                disabled={creatingRole}
              >
                Cancel
              </button>
              <button
                onClick={createRole}
                disabled={creatingRole || !newRole.roleName.trim()}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {creatingRole ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  "Create Role"
                )}
              </button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirm Delete">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <p>Are you sure you want to delete this role? This action cannot be undone.</p>
            </div>

            {selectedRole && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="font-medium text-gray-900 dark:text-white">{selectedRole.roleName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">ID: {selectedRole.roleId}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                disabled={deletingRole}
              >
                Cancel
              </button>
              <button
                onClick={deleteRole}
                disabled={deletingRole}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deletingRole ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Role
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>

        {/* Role Details Modal */}
        <Modal 
          isOpen={showDetailsModal} 
          onClose={() => setShowDetailsModal(false)} 
          title={`Role Details - ${selectedRole?.roleName || ""}`}
          maxWidth="max-w-4xl"
        >
          {selectedRole && (
            <div className="space-y-6">
              {/* Role Information Card */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Role ID</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedRole.roleId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Role Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedRole.roleName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Hierarchy Level</p>
                    <div className="flex items-center">
                      <p className="font-medium text-gray-900 dark:text-white mr-2">{selectedRole.hierarchyLevel}</p>
                      <div className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                        {selectedRole.hierarchyLevel <= 10 ? 'Admin Level' : 
                         selectedRole.hierarchyLevel <= 30 ? 'Management Level' : 
                         selectedRole.hierarchyLevel <= 60 ? 'Supervisor Level' : 'User Level'}
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Features</p>
                    <div className="flex items-center">
                      <p className="font-medium text-gray-900 dark:text-white mr-2">{selectedRole.features.length}</p>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        selectedRole.features.length > 4 ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 
                        selectedRole.features.length > 0 ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' : 
                        'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}>
                        {selectedRole.features.length > 4 ? 'High Access' : 
                         selectedRole.features.length > 0 ? 'Limited Access' : 'No Access'}
                      </div>
                    </div>
                  </div>
                  {selectedRole.roleDescription && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedRole.roleDescription}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Feature Permissions Table */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Feature Permissions</h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Allowed</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Denied</span>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Feature
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Read
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Write
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Update
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Delete
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {selectedRole.features.map((feature) => (
                        <tr key={feature.featureId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{feature.featureName}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{feature.featureId}</div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {feature.permissions.canRead ? (
                              <Check className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-red-500 mx-auto" />
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {feature.permissions.canWrite ? (
                              <Check className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-red-500 mx-auto" />
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {feature.permissions.canUpdate ? (
                              <Check className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-red-500 mx-auto" />
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {feature.permissions.canDelete ? (
                              <Check className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-red-500 mx-auto" />
                            )}
                          </td>
                        </tr>
                      ))}
                      {selectedRole.features.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                            No features assigned to this role
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Edit Permissions SlideOver */}
        <SlideOver
          open={showSlideOver}
          onClose={() => !savingPermissions && setShowSlideOver(false)}
          title={`Edit Permissions - ${selectedRole?.roleName || ""}`}
        >
          {/* Update the SlideOver content to show loading state */}
          <div className="py-6">
            {loadingPermissions ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading permissions...</p>
              </div>
            ) : (
              selectedRole && (
                <div className="space-y-6">
                  {Object.entries(permissions).map(([featureId, perms]) => {
                    const feature = selectedRole.features.find((f) => f.featureId === featureId)
                    return feature ? (
                      <div key={featureId} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">{feature.featureName}</h3>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {permissionTypes.map(({ key, label }) => (
                            <label key={key} className="flex items-center space-x-2 cursor-pointer group">
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={perms[key] || false}
                                  onChange={() => handlePermissionChange(featureId, key)}
                                  className="sr-only"
                                />
                                <div
                                  className={`w-5 h-5 border-2 rounded transition-colors duration-200 ${
                                    perms[key]
                                      ? "bg-purple-500 border-purple-500 dark:bg-purple-600 dark:border-purple-600"
                                      : "border-gray-300 dark:border-gray-600 group-hover:border-purple-400 dark:group-hover:border-purple-500"
                                  }`}
                                >
                                  {perms[key] && (
                                    <svg className="w-full h-full text-white fill-current" viewBox="0 0 20 20">
                                      <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                              <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : null
                  })}
                </div>
              )
            )}
            <div className="mt-6 flex justify-end gap-4">
              <Button
                variant="secondary"
                onClick={() => setShowSlideOver(false)}
                disabled={savingPermissions || loadingPermissions}
              >
                Cancel
              </Button>
              <Button
                onClick={savePermissions}
                disabled={savingPermissions || loadingPermissions}
                className="flex items-center gap-2"
              >
                {savingPermissions ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </SlideOver>
      </div>
    </PermissionGuard>
  )
}

export default Roles

