// src/pages/dept/InventoryAsk.jsx
"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, ArrowLeft, Package, HelpCircle, LayoutGrid, List, RefreshCcw } from "lucide-react"
import Button from "../../components/dept/Button"
import Modal from "../../components/dept/Modal"
import DeptPermissionGuard  from "../../components/dept/DeptPermissionGuard"
import apiClient from "../../utils/apiClient"
import { useToast } from "../../context/ToastContext"
import CustomDropdown from "../../components/common/CustomDropdown"

// Feature IDs for permissions
const INVENTORY_FEATURES = {
  VIEW: "FEAT_INVENTORY",
  CREATE: "FEAT_INVENTORY",
  SHARE: "FEAT_INVENTORY",
  DELETE: "FEAT_INVENTORY",
  MANAGE_REQUESTS: "FEAT_INVENTORY",
}

const InventoryAsk = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [requestQuantity, setRequestQuantity] = useState(1)
  const [originPosition, setOriginPosition] = useState(null)
  const [sharedItems, setSharedItems] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState("table")
  const [refreshing, setRefreshing] = useState(false)
  const [submittingRequest, setSubmittingRequest] = useState(false)

  // Fetch shared resources
  useEffect(() => {
    const fetchSharedResources = async () => {
      setIsLoading(true)
      try {
        const response = await apiClient.get("/inventory/sharing")

        if (response.data.success) {
          setSharedItems(response.data.data)

          // Extract unique categories
          const uniqueCategories = [...new Set(response.data.data.map((item) => item.itemCategory))]
          setCategories(uniqueCategories)
        } else {
          showToast("Error fetching shared resources", "error")
        }
      } catch (error) {
        console.error("Error fetching shared resources:", error)
        showToast("Failed to load shared resources", "error")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSharedResources()
  }, [showToast])

  // Filter items based on search and category
  const filteredItems = sharedItems.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemId.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = !selectedCategory || item.itemCategory === selectedCategory

    return matchesSearch && matchesCategory
  })

  const handleAskHelp = (item, event) => {
    // Get the button's position for the animation
    const buttonRect = event.currentTarget.getBoundingClientRect()
    const originPosition = {
      x: buttonRect.left + buttonRect.width / 2,
      y: buttonRect.top + buttonRect.height / 2,
    }

    setSelectedItem(item)
    setRequestQuantity(1)
    setIsRequestModalOpen(true)
    setOriginPosition(originPosition)
  }

  const handleSubmitRequest = async () => {
    setSubmittingRequest(true)

    try {
      const response = await apiClient.post("/inventory/request", {
        itemId: selectedItem.itemId,
        fromDept: selectedItem.deptId,
        quantity: requestQuantity,
      })

      if (response.data.success) {
        console.log('Request successful, closing modal...')
        // First close the modal and reset states
        setIsRequestModalOpen(false)
        setSelectedItem(null)
        setRequestQuantity(1)
        setSubmittingRequest(false)
        
        // Then show toast and handle navigation
        showToast("Request submitted successfully", "success")
        
        // Finally refresh and navigate
        await refreshSharedResources() // Refresh the list after successful request
        navigate("/dashboard/dept/inventory")
      } else {
        showToast("Failed to submit request", "error")
      }
    } catch (error) {
      console.error("Error submitting request:", error)
      showToast("Failed to submit request", "error")
    } finally {
      setSubmittingRequest(false)
    }
  }

  const refreshSharedResources = async () => {
    setRefreshing(true)
    try {
      const response = await apiClient.get("/inventory/sharing")
      if (response.data.success) {
        setSharedItems(response.data.data)
        const uniqueCategories = [...new Set(response.data.data.map((item) => item.itemCategory))]
        setCategories(uniqueCategories)
        showToast("Resources refreshed successfully", "success")
      }
    } catch (error) {
      console.error("Error refreshing shared resources:", error)
      showToast("Failed to refresh resources", "error")
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <DeptPermissionGuard
      featureId={INVENTORY_FEATURES.VIEW}
      fallback={<div className="p-6 text-center">You don't have permission to view inventory.</div>}
    >
      <div className="max-w-auto mx-auto p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/dashboard/dept/inventory")}
            className="p-2 mr-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-600 dark:hover:text-sky-400"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Ask for Resources</h1>
          <div className="flex items-center gap-2">
            <Button
              onClick={refreshSharedResources}
              variant="outline"
              className="flex items-center gap-2"
              disabled={refreshing}
            >
              <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Find Resources from Other Departments
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <CustomDropdown
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </CustomDropdown>
              </div>
              <div className="relative">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search
                </label>
                <input
                  id="search"
                  type="text"
                  placeholder="Search resources..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-9 text-gray-400" size={18} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 flex-1 ${viewMode === "table" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}
                >
                  <List size={20} className="mx-auto" />
                </button>
                <button
                  onClick={() => setViewMode("card")}
                  className={`p-2 flex-1 ${viewMode === "card" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}
                >
                  <LayoutGrid size={20} className="mx-auto" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">Available Resources</h3>

            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading shared resources...</p>
              </div>
            ) : (
              <>
                {filteredItems.length > 0 ? (
                  <>
                    {viewMode === "table" ? (
                      <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <table className="min-w-full">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Item ID
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Name
                              </th>
                              <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Category
                              </th>
                              <th className="hidden md:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Department
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Available
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredItems.map((item) => (
                              <tr key={item.itemId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                  {item.itemId}
                                </td>
                                <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                  {item.itemName}
                                </td>
                                <td className="hidden sm:table-cell px-4 sm:px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                  {item.itemCategory}
                                </td>
                                <td className="hidden md:table-cell px-4 sm:px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                  {item.department?.deptName || item.deptId}
                                </td>
                                <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                                  {item.sharedItems}
                                </td>
                                <td className="px-4 sm:px-6 py-4">
                                  <div className="flex justify-end">
                                    <Button size="sm" onClick={(event) => handleAskHelp(item, event)}>
                                      <HelpCircle className="h-4 w-4 mr-1" />
                                      <span className="hidden sm:inline">Ask Help</span>
                                      <span className="sm:hidden">Ask</span>
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredItems.map((item) => (
                          <div
                            key={item.itemId}
                            className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                          >
                            <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium text-lg dark:text-white">{item.itemName}</h3>
                                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-md mt-1 inline-block">
                                    {item.itemId}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="text-sm mb-4 text-gray-600 dark:text-gray-300">{item.itemCategory}</div>

                              <div className="grid grid-cols-2 gap-2 text-center mb-3">
                                <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                                  <div className="text-xs text-gray-500 dark:text-gray-400">Available</div>
                                  <div className="font-medium text-blue-600 dark:text-blue-400">{item.sharedItems}</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                                  <div className="text-xs text-gray-500 dark:text-gray-400">Department</div>
                                  <div className="font-medium text-gray-600 dark:text-gray-300 text-xs">
                                    {item.department?.deptName || item.deptId}
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4">
                                <Button className="w-full" onClick={(event) => handleAskHelp(item, event)}>
                                  <HelpCircle className="h-4 w-4 mr-1" />
                                  Ask for Help
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No resources found matching your criteria</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Try adjusting your search or category filter
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Request Modal */}
        <Modal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          title="Request Resource"
          originPosition={originPosition}
        >
          {selectedItem && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{selectedItem.itemName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedItem.itemCategory}</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                    {selectedItem.itemId}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Available</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedItem.sharedItems}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Department</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedItem.department?.deptName || selectedItem.deptId}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="requestQuantity"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Quantity Needed
                </label>
                <input
                  type="number"
                  id="requestQuantity"
                  min="1"
                  max={selectedItem.sharedItems}
                  value={requestQuantity}
                  onChange={(e) => setRequestQuantity(Number.parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Maximum available: {selectedItem.sharedItems}
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setIsRequestModalOpen(false)}
                  disabled={submittingRequest}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmitRequest}
                  disabled={submittingRequest || requestQuantity < 1 || requestQuantity > selectedItem.sharedItems}
                  className="flex items-center gap-2"
                >
                  {submittingRequest ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DeptPermissionGuard>
  )
}

export default InventoryAsk

