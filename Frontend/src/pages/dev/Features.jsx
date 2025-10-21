"use client"

import { useState, useEffect } from "react"
import { Settings, Shield, Lock, LayoutGrid, List, RefreshCw, Info, X, Check } from "lucide-react"
import SearchBar from "../../components/dev/SearchBar"
import Modal from "../../components/dept/Modal"
import apiClient from "../../utils/apiClient"
import Toast from "../../components/common/Toast"
import Card from "../../components/dept/Card"

export default function Features() {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState("table")
  const [features, setFeatures] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchFeatures()
  }, [])

  const fetchFeatures = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get("/features/dev")
      if (response.data.success) {
        setFeatures(response.data.data)
      } else {
        showToast("Failed to load features", "error")
      }
    } catch (error) {
      console.error("Error fetching features:", error)
      showToast("Error loading features: " + (error.response?.data?.message || error.message), "error")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const refreshFeatures = () => {
    setRefreshing(true)
    fetchFeatures()
  }

  const showFeatureDetails = (feature) => {
    setSelectedFeature(feature)
    setShowDetailsModal(true)
  }

  const showToast = (message, type = "success") => {
    setToast({ message, type })
  }

  const filteredFeatures = features.filter(
    (feature) =>
      feature.featureName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.featureDescription.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calculate stats
  const totalFeatures = features.length
  const activeFeatures = features.length
  const totalRoles = features.length > 0 ? features[0].roles.length : 0

  return (
    <div className="mx-auto p-6 dark:bg-gray-900">
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2 flex items-center text-gray-800 dark:text-white">
            <Settings className="mr-2 h-6 w-6 text-blue-500" />
            Feature Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Configure system features and access</p>
        </div>
        <button
          onClick={refreshFeatures}
          disabled={refreshing}
          className="inline-flex items-center justify-center rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Feature Stats */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Features</div>
            <Settings className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">{totalFeatures}</div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">System features</div>
        </Card>

        <Card className="p-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Features</div>
            <Lock className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">{activeFeatures}</div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Currently enabled</div>
        </Card>

        <Card className="p-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Role Assignments</div>
            <Shield className="h-5 w-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">{totalRoles}</div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Total roles</div>
        </Card>
      </div>

      {/* Search and View Toggle */}
      <Card className="mb-6 overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <SearchBar onSearch={setSearchTerm} placeholder="Search features..." className="w-full" />
          </div>
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 ${
                viewMode === "table"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              }`}
            >
              <List size={20} />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`p-2 ${
                viewMode === "card"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              }`}
            >
              <LayoutGrid size={20} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredFeatures.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            {searchTerm ? "No features match your search" : "No features found"}
          </div>
        ) : viewMode === "table" ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Feature Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredFeatures.map((feature) => (
                  <tr key={feature.featureId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{feature.featureName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">ID: {feature.featureId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 dark:text-gray-300">{feature.featureDescription}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {feature.rolePermissions.withRead} Read
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {feature.rolePermissions.withWrite} Write
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          {feature.rolePermissions.withUpdate} Update
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          {feature.rolePermissions.withDelete} Delete
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => showFeatureDetails(feature)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        <Info className="h-3.5 w-3.5 mr-1" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFeatures.map((feature) => (
              <Card key={feature.featureId} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg text-gray-900 dark:text-white">{feature.featureName}</h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">ID: {feature.featureId}</span>
                    </div>
                    <button
                      onClick={() => showFeatureDetails(feature)}
                      className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{feature.featureDescription}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Read Access</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {feature.rolePermissions.withRead} roles
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Write Access</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {feature.rolePermissions.withWrite} roles
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Update Access</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {feature.rolePermissions.withUpdate} roles
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Delete Access</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {feature.rolePermissions.withDelete} roles
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <div>
            Showing {filteredFeatures.length} of {features.length} features
          </div>
          <div className="flex gap-2">
            <button
              disabled
              className="px-3 py-1 rounded border bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            >
              Previous
            </button>
            <button className="px-3 py-1 rounded border bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              1
            </button>
            <button className="px-3 py-1 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600">
              Next
            </button>
          </div>
        </div>
      </Card>

      {/* Feature Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={`Feature Details - ${selectedFeature?.featureName || ""}`}
        maxWidth="max-w-4xl"
      >
        {selectedFeature && (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Feature ID</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedFeature.featureId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Feature Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedFeature.featureName}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedFeature.featureDescription}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Role Permissions</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Role
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
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {selectedFeature.roles.map((role) => (
                      <tr key={role.roleId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{role.roleName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{role.roleId}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {role.permissions.canRead ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-red-500 mx-auto" />
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {role.permissions.canWrite ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-red-500 mx-auto" />
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {role.permissions.canUpdate ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-red-500 mx-auto" />
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {role.permissions.canDelete ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-red-500 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

