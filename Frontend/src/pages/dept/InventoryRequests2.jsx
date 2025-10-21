// src/pages/dept/InventoryRequests.jsx
"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Check, X, Clock, Filter, ArrowUpDown, AlertCircle, RefreshCcw } from "lucide-react"
import Button from "../../components/dept/Button"
import Modal from "../../components/dept/Modal"
import DeptPermissionButton from "../../components/dept/DeptPermissionButton"
import DeptPermissionGuard from "../../components/dept/DeptPermissionGuard"
import apiClient from "../../utils/apiClient"
import { useToast } from "../../context/ToastContext"

// Feature IDs for permissions
const INVENTORY_FEATURES = {
  VIEW: "FEAT_INVENTORY",
  CREATE: "FEAT_INVENTORY",
  SHARE: "FEAT_INVENTORY",
  DELETE: "FEAT_INVENTORY",
  MANAGE_REQUESTS: "FEAT_INVENTORY",
}

const InventoryRequests2 = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [actionType, setActionType] = useState(null)
  const [sortField, setSortField] = useState("createdAt")
  const [sortDirection, setSortDirection] = useState("desc")
  const [refreshing, setRefreshing] = useState(false)
  const [processingRequest, setProcessingRequest] = useState(false)
  const [viewMode, setViewMode] = useState("card")
  const [userDept, setUserDept] = useState(null)
  const [filterType, setFilterType] = useState("all")
  const [borrowedItems, setBorrowedItems] = useState([])
  const [lentItems, setLentItems] = useState([])
  const [returningItem, setReturningItem] = useState(null)

  // Fetch inventory requests and set user department from localStorage
  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true)
      try {
        // Get user data from localStorage
        const userData = JSON.parse(localStorage.getItem("userData"))
        if (userData?.deptId) {
          setUserDept(userData.deptId)
        }

        const response = await apiClient.get("/inventory/requests")
        if (response.data.success) {
          setRequests(response.data.data)
        } else {
          showToast("Error fetching inventory requests", "error")
        }
      } catch (error) {
        console.error("Error fetching requests:", error)
        showToast("Failed to load inventory requests", "error")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequests()
  }, [showToast])

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Sort requests
  const sortedRequests = [...requests].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]

    // Handle nested properties
    if (sortField === "itemName") {
      aValue = a.common_inventory?.itemName || ""
      bValue = b.common_inventory?.itemName || ""
    } else if (sortField === "fromDeptName") {
      aValue = a.fromDepartment?.deptName || ""
      bValue = b.fromDepartment?.deptName || ""
    }

    if (typeof aValue === "string") {
      const comparison = aValue.localeCompare(bValue)
      return sortDirection === "asc" ? comparison : -comparison
    } else {
      const comparison = aValue - bValue
      return sortDirection === "asc" ? comparison : -comparison
    }
  })

  // Group requests by status with pending first
  const groupedRequests = {
    pending: sortedRequests.filter((req) => req.requestStatus === "pending"),
    others: sortedRequests.filter((req) => req.requestStatus !== "pending"),
  }

  // Check if user can take action on request
  const canTakeAction = (request) => {
    return userDept && request.forDept !== userDept
  }

  const handleApproveReject = (request, action) => {
    setSelectedRequest(request)
    setActionType(action)
    setIsConfirmModalOpen(true)
  }

  const handleConfirmAction = async () => {
    setProcessingRequest(true)
    try {
      const response = await apiClient.put(`/inventory/request/${selectedRequest.requestId}/status`, {
        status: actionType,
      })

      if (response.data.success) {
        showToast(`Request ${actionType === "approved" ? "approved" : "rejected"} successfully`, "success")
      } else {
        showToast(`Failed to ${actionType} request`, "error")
      }
    } catch (error) {
      console.error(`Error ${actionType}ing request:`, error)
      showToast(`Failed to ${actionType} request`, "error")
    } finally {
      // Always close modal, reset states, and refresh the list
      setProcessingRequest(false)
      setIsConfirmModalOpen(false)
      setSelectedRequest(null)
      setActionType(null)
      await refreshRequests() // Refresh list regardless of action outcome
    }
  }

  const refreshRequests = async () => {
    setRefreshing(true)
    try {
      const response = await apiClient.get("/inventory/requests")
      if (response.data.success) {
        setRequests(response.data.data)
        showToast("Requests refreshed successfully", "success")
      } else {
        showToast("Error refreshing requests", "error")
      }
    } catch (error) {
      console.error("Error refreshing requests:", error)
      showToast("Failed to refresh requests", "error")
    } finally {
      setRefreshing(false)
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
      case "approved":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
      case "rejected":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
    }
  }

  const refreshInventory = async () => {
    setRefreshing(true)
    try {
      let endpoint = "/inventory"
      
      // Use the correct endpoint based on filter type
      if (filterType === "borrowed") {
        endpoint = "/inventory/borrowed"
      } else if (filterType === "lent") {
        endpoint = "/inventory/lent"
      }

      const response = await apiClient.get(endpoint)
      if (response.data.success) {
        if (filterType === "borrowed") {
          setBorrowedItems(response.data.data)
        } else if (filterType === "lent") {
          setLentItems(response.data.data)
        } else {
          setInventoryItems(response.data.data)
        }
        showToast("Resources refreshed successfully", "success")
      }
    } catch (error) {
      console.error("Error refreshing resources:", error)
      showToast("Failed to refresh resources", "error")
    } finally {
      setRefreshing(false)
    }
  }

  const handleReturnItem = async (item) => {
    const itemId = item.itemId
    setReturningItem(itemId) // Track which item is being returned
    try {
      const response = await apiClient.post(
        `/inventory/${itemId}/return`,
        {
          quantity: item.borrowedQuantity,
        }
      )

      if (response.data.success) {
        showToast(
          response.data.message || "Item returned successfully",
          "success"
        )
        // Refresh borrowed items after successful return
        const borrowedResponse = await apiClient.get("/inventory/borrowed")
        if (borrowedResponse.data.success) {
          setBorrowedItems(borrowedResponse.data.data)
        }
      } else {
        showToast("Failed to return item", "error")
      }
    } catch (error) {
      console.error("Error returning item:", error)
      showToast("Failed to return item", "error")
    } finally {
      setReturningItem(null) // Reset returning state
    }
  }

  // Card view component
  const RequestCard = ({ request }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">{request.common_inventory?.itemName}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{request.common_inventory?.itemCategory}</p>
          </div>
          <span className={`px-2 py-1 text-xs rounded-md ${getStatusBadgeClass(request.requestStatus)}`}>
            {request.requestStatus.charAt(0).toUpperCase() + request.requestStatus.slice(1)}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{request.requestId}</p>
      </div>
      
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">From Department</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{request.fromDepartment?.deptName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">For Department</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{request.forDepartment?.deptName}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Quantity</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{request.quantity}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {new Date(request.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {request.requestStatus === "pending" && canTakeAction(request) && (
          <div className="flex justify-end gap-2 pt-2 border-t dark:border-gray-700">
            <DeptPermissionButton
              featureId={INVENTORY_FEATURES.MANAGE_REQUESTS}
              onClick={() => handleApproveReject(request, "approved")}
              className="flex items-center gap-1 px-3 py-1 text-sm text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-md transition-colors"
            >
              <Check className="h-4 w-4" />
              Approve
            </DeptPermissionButton>
            <DeptPermissionButton
              featureId={INVENTORY_FEATURES.MANAGE_REQUESTS}
              onClick={() => handleApproveReject(request, "rejected")}
              className="flex items-center gap-1 px-3 py-1 text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
              Reject
            </DeptPermissionButton>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <DeptPermissionGuard
      featureId={INVENTORY_FEATURES.MANAGE_REQUESTS}
      fallback={<div className="p-6 text-center">You don't have permission to manage inventory requests.</div>}
    >
      <div className="max-w-auto mx-auto p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/dashboard/dept/inventory")}
            className="p-2 mr-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-600 dark:hover:text-sky-400"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Inventory Requests</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
          <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-blue-500 mr-2" />
              <h2 className="text-lg font-semibold">Resource Requests</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={refreshRequests} 
                variant="outline" 
                className="flex items-center gap-2" 
                disabled={refreshing}
              >
                <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
              <button
                onClick={() => handleSort("createdAt")}
                className="flex items-center gap-1 px-3 py-1 text-sm rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <ArrowUpDown className="h-3 w-3" />
                Date
              </button>
              <button
                onClick={() => handleSort("requestStatus")}
                className="flex items-center gap-1 px-3 py-1 text-sm rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Filter className="h-3 w-3" />
                Status
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading requests...</p>
            </div>
          ) : (
            <>
              {requests.length === 0 ? (
                <div className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No inventory requests found</p>
                </div>
              ) : (
                <div className="p-4">
                  {/* Pending Requests */}
                  {groupedRequests.pending.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-medium text-yellow-800 dark:text-yellow-400 px-2">Pending Requests</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {groupedRequests.pending.map((request) => (
                          <RequestCard key={request.requestId} request={request} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other Requests */}
                  {groupedRequests.others.length > 0 && (
                    <div className="space-y-4 mt-8">
                      <h3 className="font-medium text-gray-700 dark:text-gray-300 px-2">Previous Requests</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {groupedRequests.others.map((request) => (
                          <RequestCard key={request.requestId} request={request} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Confirmation Modal */}
        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false)
            setSelectedRequest(null)
            setActionType(null)
          }}
          title={actionType === "approved" ? "Approve Request" : "Reject Request"}
        >
          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  Are you sure you want to {actionType === "approved" ? "approve" : "reject"} this request?
                </p>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Item:</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {selectedRequest.common_inventory?.itemName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">From Department:</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {selectedRequest.fromDepartment?.deptName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Quantity:</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {selectedRequest.quantity}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setIsConfirmModalOpen(false)}
                  disabled={processingRequest}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmAction}
                  disabled={processingRequest}
                  className={`flex items-center gap-2 ${
                    actionType === "approved" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {processingRequest ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : actionType === "approved" ? (
                    <>
                      <Check className="h-4 w-4" />
                      Approve
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" />
                      Reject
                    </>
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

export default InventoryRequests2

