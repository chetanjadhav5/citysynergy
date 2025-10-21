// src/pages/dept/InventoryHistory.jsx
"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, History, Search, Calendar, ArrowUpDown, RefreshCcw, BarChart3, Package, Share2, Truck } from "lucide-react"
import Button from "../../components/dept/Button"
import DeptPermissionGuard from "../../components/dept/DeptPermissionGuard"
import apiClient from "../../utils/apiClient"
import { useToast } from "../../context/ToastContext"
import { useLoading } from "../../context/LoadingContext"
import CustomDropdown from "../../components/common/CustomDropdown"
import  CustomDateRangeSelector from "../../components/common/CustomDateRangeSelector"
// Feature IDs for permissions
const INVENTORY_FEATURES = {
  VIEW: "FEAT_INVENTORY",
  CREATE: "FEAT_INVENTORY",
  SHARE: "FEAT_INVENTORY",
  DELETE: "FEAT_INVENTORY",
  MANAGE_REQUESTS: "FEAT_INVENTORY",
}

const InventoryHistory = () => {
  const navigate = useNavigate()
  // Replace the useToast hook usage
  // const { showToast } = useToast()

  // With this implementation that handles missing context
  const toastContext = useToast()
  const showToast = toastContext?.showToast || (() => {})

  // Replace the useLoading hook usage
  // const { setLoading } = useLoading()

  // With this implementation that handles missing context
  const loadingContext = useLoading()
  const setLoading = loadingContext?.setLoading || (() => {})

  const [historyItems, setHistoryItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null })
  const [sortField, setSortField] = useState("createdAt")
  const [sortDirection, setSortDirection] = useState("desc")
  const [filterAction, setFilterAction] = useState("")

  const fetchHistory = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      showToast("Please select both start and end dates", "warning")
      return
    }

    setLoading(true)
    setIsLoading(true)

    try {
      const formattedStartDate = formatDateForAPI(dateRange.startDate)
      const formattedEndDate = formatDateForAPI(dateRange.endDate)
      
      const response = await apiClient.get(`/inventory/history?startDate=${formattedStartDate}&endDate=${formattedEndDate}`)

      if (response.data.success) {
        setHistoryItems(response.data.data)
      } else {
        showToast("Error fetching inventory history", "error")
      }
    } catch (error) {
      console.error("Error fetching history:", error)
      showToast("Failed to load inventory history", "error")
    } finally {
      setLoading(false)
      setIsLoading(false)
    }
  }

  // Format date for API request (YYYY-MM-DD)
  const formatDateForAPI = (date) => {
    if (!date) return ""
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // Handle date range change
  const handleDateRangeChange = (e) => {
    console.log("Date range changed:", e.target.value);
    setDateRange(e.target.value);
  }

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Filter and sort history items
  const filteredAndSortedHistory = historyItems
    .filter((item) => {
      const matchesSearch =
        item.itemId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.performer?.username?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesAction = !filterAction || item.action === filterAction

      return matchesSearch && matchesAction
    })
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (typeof aValue === "string") {
        const comparison = aValue.localeCompare(bValue)
        return sortDirection === "asc" ? comparison : -comparison
      } else {
        const comparison = new Date(aValue) - new Date(bValue)
        return sortDirection === "asc" ? comparison : -comparison
      }
    })

  // Get unique actions for filtering
  const uniqueActions = [...new Set(historyItems.map((item) => item.action))]

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Get action badge class
  const getActionBadgeClass = (action) => {
    switch (action) {
      case "created":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400"
      case "shared":
        return "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400"
      case "approved":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
      case "rejected":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
      case "requested":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
    }
  }

  const [inventoryStats, setInventoryStats] = useState({
    totalItems: 0,
    totalCategories: 0,
    totalAvailable: 0,
    totalShared: 0,
    pendingRequests: 0,
  })
  
  // Fetch inventory data and calculate stats
  const fetchInventoryStats = async () => {
    try {
      // Fetch inventory data
      const inventoryResponse = await apiClient.get("/inventory")
      
      // Fetch pending requests
      const requestsResponse = await apiClient.get("/inventory/requests")
      
      if (inventoryResponse.data.success) {
        const inventoryData = inventoryResponse.data.data
        
        // Calculate statistics
        const totalItems = inventoryData.reduce((sum, item) => sum + item.totalItems, 0)
        const totalAvailable = inventoryData.reduce((sum, item) => sum + item.availableItems, 0)
        const totalShared = inventoryData.reduce((sum, item) => sum + item.sharedItems, 0)
        
        // Get unique categories
        const categories = new Set(inventoryData.map(item => item.itemCategory))
        
        // Count pending requests
        const pendingRequests = requestsResponse.data.success 
          ? requestsResponse.data.data.filter(req => req.requestStatus === "pending").length 
          : 0
        
        setInventoryStats({
          totalItems,
          totalCategories: categories.size,
          totalAvailable,
          totalShared,
          pendingRequests,
        })
      }
    } catch (error) {
      console.error("Error fetching inventory stats:", error)
    }
  }
  
  // Fetch stats when component mounts
  useEffect(() => {
    fetchInventoryStats()
  }, [])

  return (
    <DeptPermissionGuard
      featureId={INVENTORY_FEATURES.VIEW}
      fallback={<div className="p-6 text-center">You don't have permission to view inventory history.</div>}
    >
      <div className="max-w-auto mx-auto p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/dashboard/dept/inventory")}
            className="p-2 mr-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-600 dark:hover:text-sky-400"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Inventory History</h1>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 mr-4">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Items</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{inventoryStats.totalItems}</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 mr-4">
              <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Available Items</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{inventoryStats.totalAvailable}</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center">
            <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 p-3 mr-4">
              <Share2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Shared Items</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{inventoryStats.totalShared}</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center">
            <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/30 p-3 mr-4">
              <Truck className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{inventoryStats.pendingRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
          <div className="p-4 border-b dark:border-gray-700">
            <div className="flex items-center mb-4">
              <History className="h-5 w-5 text-blue-500 mr-2" />
              <h2 className="text-lg font-semibold">Resource History</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date Range
                </label>
                <CustomDateRangeSelector
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  name="historyDateRange"
                  placeholder="Select date range for history"
                  format="YYYY-MM-DD"
                  required={true}
                  error={false}
                />
              </div>

              <div className="flex items-end">
                <Button onClick={fetchHistory} className="w-full">
                  Fetch History
                </Button>
              </div>
            </div>

            {historyItems.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search history..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>

                <CustomDropdown
                  value={filterAction}
                  options={
                    
                    uniqueActions.map((action) => ({
                      label: action.charAt(0).toUpperCase() + action.slice(1),
                      value: action,
                    }))
                  }
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Actions</option>
                  
                </CustomDropdown>

                <button
                  onClick={() => handleSort("createdAt")}
                  className="flex items-center gap-1 px-3 py-2 text-sm rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <ArrowUpDown className="h-3 w-3" />
                  Date {sortField === "createdAt" && (sortDirection === "asc" ? "↑" : "↓")}
                </button>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading history data...</p>
            </div>
          ) : (
            <>
              {historyItems.length === 0 ? (
                <div className="p-8 text-center">
                  <History className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No history data found</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Select a date range and click "Fetch History"
                  </p>
                </div>
              ) : (
                <>
                  {filteredAndSortedHistory.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="text-gray-400 mb-2">
                        <RefreshCcw className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-lg font-medium dark:text-gray-300">No matching history items</p>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                              History ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                              Item ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                              Action
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                              Performed By
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                              Details
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {filteredAndSortedHistory.map((item) => (
                            <tr key={item.historyId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                {item.historyId}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{item.itemId}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-md ${getActionBadgeClass(item.action)}`}>
                                  {item.action.charAt(0).toUpperCase() + item.action.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                {item.performer?.username || item.performedBy}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                {formatDate(item.createdAt)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                {item.action === "requested" && item.newValue && (
                                  <span>
                                    Requested {item.newValue.quantity} {item.newValue.itemName}
                                  </span>
                                )}
                                {item.action === "approved" && item.newValue && (
                                  <span>Approved request for {item.newValue.quantity} items</span>
                                )}
                                {item.action === "rejected" && item.newValue && (
                                  <span>Rejected request for {item.newValue.quantity} items</span>
                                )}
                                {item.action === "shared" && item.newValue && (
                                  <span>
                                    Shared {item.newValue.sharedItems} of {item.newValue.totalItems} items
                                  </span>
                                )}
                                {item.action === "created" && item.newValue && (
                                  <span>
                                    Created {item.newValue.totalItems} {item.newValue.itemName}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </DeptPermissionGuard>
  )
}

export default InventoryHistory

