"use client"

import { useState, useEffect } from "react"
import { Search, Settings, Shield, Lock, LayoutGrid, List, RefreshCcw } from "lucide-react"
import DeptPermissionGuard from "../../components/dept/DeptPermissionGuard"
import Button from "../../components/dept/Button"
import apiClient from "../../utils/apiClient"
import { useToast } from "../../context/ToastContext"
import { useLoading } from "../../context/LoadingContext"

const Features = () => {
  // Replace the useLoading hook usage with this implementation that handles missing context
  const loadingContext = useLoading()
  const setLoading = loadingContext?.setLoading || (() => {})

  // Replace the useToast hook usage with this implementation that handles missing context
  const toastContext = useToast()
  const showToast = toastContext?.showToast || (() => {})

  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("table")
  const [features, setFeatures] = useState([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch features on component mount
  useEffect(() => {
    fetchFeatures()
  }, [])

  // Fetch features from API
  const fetchFeatures = async () => {
    try {
      setIsRefreshing(true)
      setLoading(true)
      const response = await apiClient.get("/features/dept")
      if (response.data.success) {
        setFeatures(response.data.data)
      } else {
        showToast("Failed to fetch features", "error")
      }
    } catch (error) {
      console.error("Error fetching features:", error)
      showToast("Error fetching features", "error")
    } finally {
      setIsRefreshing(false)
      setLoading(false)
    }
  }

  // Filter features based on search query
  const filteredFeatures = features.filter((feature) =>
    feature.featureName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Calculate stats
  const totalFeatures = features.length
  const activeFeatures = features.filter((feature) => feature.rolePermissions.withRead > 0).length
  const totalRoleAssignments = features.reduce((sum, feature) => sum + feature.rolePermissions.total, 0)

  return (
    <DeptPermissionGuard
      featureId="FEAT_DEPT_MGMT"
      fallback={<div className="p-6 text-center">You don't have permission to view feature management.</div>}
    >
      <div className="max-w-auto mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center text-gray-800 dark:text-white">
              <Settings className="mr-2 h-6 w-6 text-blue-500" />
              Feature Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Configure system features and access</p>
          </div>
          <div>
            <Button onClick={fetchFeatures} variant="outline" disabled={isRefreshing}>
              <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Feature Stats */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Features</div>
              <Settings className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">{totalFeatures}</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">System features</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Features</div>
              <Lock className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">{activeFeatures}</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Features with role access</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Role Assignments</div>
              <Shield className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">{totalRoleAssignments}</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Total role assignments</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 border-b dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search features..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 ${viewMode === "table" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}
              >
                <List size={20} />
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={`p-2 ${viewMode === "card" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}
              >
                <LayoutGrid size={20} />
              </button>
            </div>
          </div>

          {isRefreshing ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading features...</p>
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
                      Feature ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Roles with Access
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Permission Distribution
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredFeatures.map((feature) => (
                    <tr key={feature.featureId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{feature.featureName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-300">{feature.featureId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {feature.rolePermissions.withRead} / {feature.rolePermissions.total}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            Read: {feature.rolePermissions.withRead}
                          </span>
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Write: {feature.rolePermissions.withWrite}
                          </span>
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                            Update: {feature.rolePermissions.withUpdate}
                          </span>
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            Delete: {feature.rolePermissions.withDelete}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFeatures.map((feature) => (
                <div
                  key={feature.featureId}
                  className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg text-gray-900 dark:text-white">{feature.featureName}</h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 block">{feature.featureId}</span>
                      </div>
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        {feature.rolePermissions.withRead} roles
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Read Access:</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2">
                            <div
                              className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full"
                              style={{
                                width: `${(feature.rolePermissions.withRead / feature.rolePermissions.total) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {feature.rolePermissions.withRead} / {feature.rolePermissions.total}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Write Access:</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2">
                            <div
                              className="bg-green-600 dark:bg-green-500 h-2.5 rounded-full"
                              style={{
                                width: `${(feature.rolePermissions.withWrite / feature.rolePermissions.total) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {feature.rolePermissions.withWrite} / {feature.rolePermissions.total}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Update Access:</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2">
                            <div
                              className="bg-yellow-600 dark:bg-yellow-500 h-2.5 rounded-full"
                              style={{
                                width: `${(feature.rolePermissions.withUpdate / feature.rolePermissions.total) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {feature.rolePermissions.withUpdate} / {feature.rolePermissions.total}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Delete Access:</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2">
                            <div
                              className="bg-red-600 dark:bg-red-500 h-2.5 rounded-full"
                              style={{
                                width: `${(feature.rolePermissions.withDelete / feature.rolePermissions.total) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {feature.rolePermissions.withDelete} / {feature.rolePermissions.total}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredFeatures.length === 0 && !isRefreshing && (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-2">
                <Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-lg font-medium dark:text-gray-300">No features found</p>
              </div>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
            </div>
          )}

          <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
            <div>
              Showing {filteredFeatures.length} of {features.length} features
            </div>
          </div>
        </div>
      </div>
    </DeptPermissionGuard>
  )
}

export default Features

