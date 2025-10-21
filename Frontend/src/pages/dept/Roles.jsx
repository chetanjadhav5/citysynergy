"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Plus, Trash2, Shield, Users, Lock,Settings, LayoutGrid, Edit,List, Info, RefreshCcw, Eye } from "lucide-react"
import Button from "../../components/dept/Button"
import SlideOver from "../../components/dept/SlideOver"
import Modal from "../../components/dept/Modal"
import DeptPermissionGuard from "../../components/dept/DeptPermissionGuard"
import DeptPermissionButton from "../../components/dept/DeptPermissionButton"
import apiClient from "../../utils/apiClient"
import { useToast } from "../../context/ToastContext"
import { useLoading } from "../../context/LoadingContext"
import { useViewMode } from "../../hooks/useViewMode"
import CustomDropdown from "../../components/common/CustomDropdown"

const Roles = () => {
  const navigate = useNavigate()
  // Replace the useToast hook usage
  const { addToast } = useToast()
  // const showToast = toastContext?.showToast || (() => {})
  // Replace the useLoading hook usage
  const loadingContext = useLoading()
  const setLoading = loadingContext?.setLoading || (() => {})
  const [searchQuery, setSearchQuery] = useState("")
  const initialViewMode = useViewMode()
  const [viewMode, setViewMode] = useState(initialViewMode)
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false)
  const [isViewRoleModalOpen, setIsViewRoleModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [permissions, setPermissions] = useState({})
  const [roles, setRoles] = useState([]); 
    const [roleFeatures, setRoleFeatures] = useState([])
  const [newRole, setNewRole] = useState({
    roleName: "",
    roleDescription: "",
    hierarchyLevel: "100",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSavingPermissions, setIsSavingPermissions] = useState(false)
  const [isDeletingRole, setIsDeletingRole] = useState(false)
  const [loadingPermissions , setLoadingPermissions] = useState(false)

  // Fetch roles on component mount
  useEffect(() => {
    fetchRoles()
  }, [])

  // Fetch roles from API
  const fetchRoles = async () => {
    try {
      setIsRefreshing(true)
      setLoading(true)
      const response = await apiClient.get("/roles/department")
      if (response.data.success) {
        setRoles(response.data.data.roles)
      } else {
        addToast("Roles fetched succefully", "success")
      }
    } catch (error) {
      console.error("Error fetching roles:", error)
      addToast("Error fetching Roles", "error")
    } finally {
      setIsRefreshing(false)
      setLoading(false)
    }
  }

  // Initialize permissions state for each feature
  const initializePermissions = (roleFeatures) => {
    const initialPermissions = {}
    roleFeatures.forEach((feature) => {
      initialPermissions[feature.featureId] = {
        canRead: feature.permissions.canRead || false,
        canWrite: feature.permissions.canWrite || false,
        canUpdate: feature.permissions.canUpdate || false,
        canDelete: feature.permissions.canDelete || false,
      }
    })
    setPermissions(initialPermissions)
  }

  const handlePermissionChange = (featureId, permission) => {
    setPermissions((prev) => ({
      ...prev,
      [featureId]: {
        ...prev[featureId],
        [permission]: !prev[featureId][permission],
      },
    }))
  }

  // Get role details and open permission modal
  const openPermissionModal = async (role) => {
    try {
      setLoading(true)
      const response = await apiClient.get(`/roles/department/${role.roleId}`)
      if (response.data.success) {
        setSelectedRole(role)
        setRoleFeatures(response.data.data.features)
        initializePermissions(response.data.data.features)
        setIsPermissionModalOpen(true)
      } else {
        addToast("Failed to fetch role details", "error")
      }
    } catch (error) {
      console.error("Error fetching role details:", error)
      addToast("Error fetching role details", "error")
    } finally {
      setLoading(false)
    }
  }

  // View role details
  const viewRoleDetails = async (role) => {
    try {
      setLoading(true)
      const response = await apiClient.get(`/roles/department/${role.roleId}`)
      if (response.data.success) {
        setSelectedRole(role)
        setRoleFeatures(response.data.data.features)
        setIsViewRoleModalOpen(true)
      } else {
        addToast("Failed to fetch role details", "error")
      }
    } catch (error) {
      console.error("Error fetching role details:", error)
      addToast("Error fetching role details", "error")
    } finally {
      setLoading(false)
    }
  }

  // Save updated permissions
  const savePermissions = async () => {
    try {
      setIsSavingPermissions(true)
      setLoading(true)

      // Format permissions for API
      const permissionsArray = Object.entries(permissions).map(([featureId, perms]) => ({
        featureId,
        canRead: perms.canRead,
        canWrite: perms.canWrite,
        canUpdate: perms.canUpdate,
        canDelete: perms.canDelete,
      }))

      const response = await apiClient.put(`/roles/department/${selectedRole.roleId}/permissions`, {
        permissions: permissionsArray,
      })

      if (response.data.success) {
        addToast("Permissions updated successfully", "success")
        setIsPermissionModalOpen(false)
        fetchRoles() // Refresh roles
      } else {
        addToast(response.data.message || "Failed to update permissions", "error")
      }
    } catch (error) {
      console.error("Error updating permissions:", error)
      addToast("Error updating permissions", "error")
    } finally {
      setIsSavingPermissions(false)
      setLoading(false)
    }
  }

  // Handle delete role
  const handleDeleteRole = (role) => {
    setSelectedRole(role)
    setIsDeleteModalOpen(true)
  }

  // Confirm delete role
  const confirmDeleteRole = async () => {
    try {
      setIsDeletingRole(true)
      setLoading(true)
      const response = await apiClient.put(`/roles/department/${selectedRole.roleId}/delete`)
      if (response.data.success) {
        addToast("Role deleted successfully", "success")
        setIsDeleteModalOpen(false)
        fetchRoles() // Refresh roles
      } else {
        addToast(response.data.message || "Failed to delete role", "error")
      }
    } catch (error) {
      console.error("Error deleting role:", error)
      addToast("Error deleting role", "error")
    } finally {
      setIsDeletingRole(false)
      setLoading(false)
    }
  }

  // Handle add role
  const handleAddRole = () => {
    setNewRole({
      roleName: "",
      roleDescription: "",
      hierarchyLevel: "100",
    })
    setIsAddRoleModalOpen(true)
  }

  // Handle input change for new role
  const handleNewRoleChange = (e) => {
    const { name, value } = e.target
    setNewRole((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Create new role
  const createRole = async () => {
    if (!newRole.roleName.trim() || !newRole.roleDescription.trim()) {
      addToast("Please fill in all required fields", "error")
      return
    }

    try {
      setIsLoading(true)
      const response = await apiClient.post("/roles/department", {
        roleName: newRole.roleName,
        roleDescription: newRole.roleDescription,
        hierarchyLevel: newRole.hierarchyLevel,
      })

      if (response.data.success) {
        addToast("Role created successfully", "success")
        setIsAddRoleModalOpen(false)
        fetchRoles() // Refresh roles
      } else {
        addToast(response.data.message || "Failed to create role", "error")
      }
    } catch (error) {
      console.error("Error creating role:", error)
      addToast("Error creating role", "error")
    } finally {
      setIsLoading(false)
    }
  }

  // Filter roles based on search query
  const filteredRoles = roles.filter(
    (role) =>
      role.roleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (role.description && role.description.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Stats
  const totalRoles = roles.length
  const adminRoles = roles.filter((role) => role.hierarchyLevel <= 20).length
  const managerRoles = roles.filter((role) => role.hierarchyLevel > 20 && role.hierarchyLevel <= 50).length
  const staffRoles = roles.filter((role) => role.hierarchyLevel > 50).length

  // Get hierarchy level badge color
  const getHierarchyLevelBadgeColor = (level) => {
    if (level <= 20) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    } else if (level <= 50) {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    } else {
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  return (
    <DeptPermissionGuard
      featureId="FEAT_ROLE_MGMT"
      fallback={<div className="p-6 text-center">You don't have permission to view role management.</div>}
    >
      <div className="max-w-auto mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center text-gray-800 dark:text-white">
              <Shield className="mr-2 h-6 w-6 text-purple-500" />
              Role Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Manage department roles and permissions</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={fetchRoles} variant="outline" disabled={isRefreshing}>
              <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <DeptPermissionButton featureId="FEAT_ROLE_MGMT" permissionType="write" onClick={handleAddRole}>
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </DeptPermissionButton>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Roles</div>
              <Shield className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">{totalRoles}</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Department roles</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Admin Roles</div>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">{adminRoles}</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">High privilege (Level ≤ 20)</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Manager Roles</div>
              <Lock className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">{managerRoles}</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Medium privilege (Level 21-50)</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Staff Roles</div>
              <Users className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{staffRoles}</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Standard privilege (Level &gt; 50)</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 border-b dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search roles..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 ${viewMode === "table" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}
              >
                <List size={20} />
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={`p-2 ${viewMode === "card" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}
              >
                <LayoutGrid size={20} />
              </button>
            </div>
          </div>

          {isRefreshing ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading roles...</p>
            </div>
          ) : viewMode === "table" ? (
            <div className="w-full">
            {/* Mobile-specific table design that matches dark theme */}
            <div className="block sm:hidden space-y-2">
              {filteredRoles.map((role) => (
                <div key={role.roleId} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                  <div className="px-4 py-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{role.roleName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{role.roleId}</div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${getHierarchyLevelBadgeColor(role.hierarchyLevel)}`}
                    >
                      {role.hierarchyLevel}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700"></div>
                  <div className="px-4 py-2.5 flex justify-between items-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(role.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => viewRoleDetails(role)}
                        className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 rounded-md transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <DeptPermissionButton
                        featureId="FEAT_ROLE_MGMT"
                        permissionType="update"
                        variant="secondary"
                        size="sm"
                        onClick={() => openPermissionModal(role)}
                        className="p-1.5 bg-blue-500 dark:bg-blue-600 text-white dark:text-blue-100 hover:bg-blue-600 dark:hover:bg-blue-700 rounded-md transition-colors"
                      >
                        <Settings size={16} />
                      </DeptPermissionButton>
                      <DeptPermissionButton
                        featureId="FEAT_ROLE_MGMT"
                        permissionType="delete"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDeleteRole(role)}
                        className="p-1.5 bg-red-500 dark:bg-red-600 text-white dark:text-red-100 hover:bg-red-600 dark:hover:bg-red-700 rounded-md transition-colors"
                      >
                        <Trash2 size={16} />
                      </DeptPermissionButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          
            {/* Desktop table for larger screens */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Role Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <span className="flex items-center">
                        Hierarchy Level
                        <button title="Hierarchy determines which roles a user can manage. Lower numbers have higher privileges." className="ml-1">
                          <Info className="h-3.5 w-3.5 text-gray-500 dark:text-gray-300" />
                        </button>
                      </span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredRoles.map((role) => (
                    <tr key={role.roleId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{role.roleName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">ID: {role.roleId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${getHierarchyLevelBadgeColor(role.hierarchyLevel)}`}
                          >
                            {role.hierarchyLevel}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{role.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(role.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => viewRoleDetails(role)}
                            className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <DeptPermissionButton
                            featureId="FEAT_ROLE_MGMT"
                            permissionType="update"
                            variant="secondary"
                            size="sm"
                            onClick={() => openPermissionModal(role)}
                          >
                            <Shield size={18} />
                          </DeptPermissionButton>
                          <DeptPermissionButton
                            featureId="FEAT_ROLE_MGMT"
                            permissionType="delete"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDeleteRole(role)}
                            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          >
                            <Trash2 size={18} />
                          </DeptPermissionButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          ) : (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRoles.map((role) => (
                <div
                  key={role.roleId}
                  className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg text-gray-900 dark:text-white">{role.roleName}</h3>
                        <div className="flex items-center mt-1 gap-2">
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 rounded-md">
                            ID: {role.roleId}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-md ${getHierarchyLevelBadgeColor(role.hierarchyLevel)}`}
                          >
                            Level: {role.hierarchyLevel}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewRoleDetails(role)}
                          className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <DeptPermissionButton
                           featureId="FEAT_ROLE_MGMT"
                           permissionType="delete"
                           variant="secondary"
                           size="sm"
                           onClick={() => handleDeleteRole(role)}
                           className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </DeptPermissionButton>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{role.description}</p>

                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Created: </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {new Date(role.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <DeptPermissionButton
                          featureId="FEAT_ROLE_MGMT"
                          permissionType="update"
                           variant="secondary" size="sm"
                          onClick={() => openPermissionModal(role)}
                        >
                         
                            Permissions
                        
                        </DeptPermissionButton>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredRoles.length === 0 && !isRefreshing && (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-2">
                <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-lg font-medium dark:text-gray-300">No roles found</p>
              </div>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
            </div>
          )}

          <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
            <div>
              Showing {filteredRoles.length} of {roles.length} roles
            </div>
          </div>
        </div>

        {/* View Role Modal */}
        <Modal isOpen={isViewRoleModalOpen} onClose={() => setIsViewRoleModalOpen(false)} title="Role Details">
          {selectedRole && (
            <div className="space-y-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Role Name</h3>
                  <p className="text-base font-medium text-gray-900 dark:text-white">{selectedRole.roleName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Role ID</h3>
                  <p className="text-base font-medium text-gray-900 dark:text-white">{selectedRole.roleId}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Hierarchy Level</h3>
                  <div className="flex items-center mt-1">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${getHierarchyLevelBadgeColor(selectedRole.hierarchyLevel)}`}
                    >
                      {selectedRole.hierarchyLevel}
                    </span>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      {selectedRole.hierarchyLevel <= 20
                        ? "(Admin)"
                        : selectedRole.hierarchyLevel <= 50
                          ? "(Manager)"
                          : "(Staff)"}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</h3>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {new Date(selectedRole.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</h3>
                <p className="text-base text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  {selectedRole.description || "No description available"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Assigned Features</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {roleFeatures.length > 0 ? (
                    roleFeatures.map((feature) => (
                      <div key={feature.featureId} className="bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {feature.featureName}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{feature.featureId}</span>
                        </div>
                        <div className="flex gap-2 mt-1">
                          {feature.permissions.canRead && (
                            <span className="px-2 py-0.5 text-xs rounded bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                              Read
                            </span>
                          )}
                          {feature.permissions.canWrite && (
                            <span className="px-2 py-0.5 text-xs rounded bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                              Write
                            </span>
                          )}
                          {feature.permissions.canUpdate && (
                            <span className="px-2 py-0.5 text-xs rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                              Update
                            </span>
                          )}
                          {feature.permissions.canDelete && (
                            <span className="px-2 py-0.5 text-xs rounded bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
                              Delete
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No features assigned to this role
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="secondary" onClick={() => setIsViewRoleModalOpen(false)}>
                  Close
                </Button>
                <DeptPermissionButton
                  featureId="FEAT_ROLE_MGMT"
                  permissionType="update"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsViewRoleModalOpen(false)
                    openPermissionModal(selectedRole)
                  }}
                >
             <Shield size={18} />
                </DeptPermissionButton>
              </div>
            </div>
          )}
        </Modal>

        {/* Permissions Modal */}
        <SlideOver
  open={isPermissionModalOpen}
  onClose={() => !isSavingPermissions && setIsPermissionModalOpen(false)}
  title={`Update Permissions - ${selectedRole?.roleName || ""}`}
>
  <div className="py-6">
    {loadingPermissions ? (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading permissions...</p>
      </div>
    ) : (
      <div className="space-y-6">
        {roleFeatures.map((feature) => (
          <div key={feature.featureId} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">{feature.featureName}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Feature ID: {feature.featureId}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {["canRead", "canWrite", "canUpdate", "canDelete"].map((permission) => (
                <label key={permission} className="flex items-center space-x-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={permissions[feature.featureId]?.[permission] || false}
                      onChange={() => handlePermissionChange(feature.featureId, permission)}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 border-2 rounded transition-colors duration-200 ${
                        permissions[feature.featureId]?.[permission]
                          ? "bg-purple-500 border-purple-500 dark:bg-purple-600 dark:border-purple-600"
                          : "border-gray-300 dark:border-gray-600 group-hover:border-purple-400 dark:group-hover:border-purple-500"
                      }`}
                    >
                      {permissions[feature.featureId]?.[permission] && (
                        <svg className="w-full h-full text-white fill-current" viewBox="0 0 20 20">
                          <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {permission.replace("can", "")}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    )}
    <div className="mt-6 flex justify-end gap-4">
      <Button
        variant="secondary"
        onClick={() => setIsPermissionModalOpen(false)}
        disabled={isSavingPermissions || loadingPermissions}
      >
        Cancel
      </Button>
      <Button 
        onClick={savePermissions} 
        disabled={isSavingPermissions || loadingPermissions}
        className="flex items-center gap-2"
      >
        {isSavingPermissions ? (
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

        {/* Delete Role Modal */}
        <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Role">
          {selectedRole && (
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-400">
                  Are you sure you want to delete the role <span className="font-bold">{selectedRole.roleName}</span>?
                </p>
                <p className="text-sm text-red-700 dark:text-red-500 mt-2">
                  This action cannot be undone. Users assigned to this role will lose these permissions.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeletingRole}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={confirmDeleteRole} disabled={isDeletingRole}>
                  {isDeletingRole ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    "Delete Role"
                  )}
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Add Role Modal */}
        <Modal isOpen={isAddRoleModalOpen} onClose={() => setIsAddRoleModalOpen(false)} title="Add New Role">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="roleName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role Name*
              </label>
              <input
                type="text"
                id="roleName"
                name="roleName"
                value={newRole.roleName}
                onChange={handleNewRoleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="roleDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description*
              </label>
              <textarea
                id="roleDescription"
                name="roleDescription"
                value={newRole.roleDescription}
                onChange={handleNewRoleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="hierarchyLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Hierarchy Level
                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                  (Lower numbers have higher privileges)
                </span>
              </label>
              <CustomDropdown
                id="hierarchyLevel"
                name="hierarchyLevel"
                value={newRole.hierarchyLevel}
                options={[ { label: "Staff (100)", value: "100" }, { label: "Manager (50)", value: "50" }, { label: "Admin (20)", value: "20"}]}
                onChange={handleNewRoleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="100">Staff (100)</option>
                <option value="50">Manager (50)</option>
                <option value="20">Admin (20)</option>
              </CustomDropdown>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                After creating the role, you can assign permissions to it using the "Update Permissions" button.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setIsAddRoleModalOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={createRole} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  "Create Role"
                )}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DeptPermissionGuard>
  )
}

export default Roles

