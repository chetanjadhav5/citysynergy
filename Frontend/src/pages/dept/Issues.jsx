"use client"

import { useState, useEffect } from "react"
import { Search, Info, AlertCircle, CheckCircle, Clock, LayoutGrid, List, BarChart3, ImageIcon } from "lucide-react"
import Button from "../../components/dept/Button"
import Modal from "../../components/dept/Modal"
import CustomDropdown from "../../components/common/CustomDropdown"
import { useToast } from "../../context/ToastContext"
import { useViewMode } from "../../hooks/useViewMode"
import apiClient from "../../utils/apiClient"

const Issues = () => {
  const [category, setCategory] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [originPosition, setOriginPosition] = useState(null)
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentStatus, setCurrentStatus] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [activeTab, setActiveTab] = useState("all")
  const { showToast } = useToast()
  const { viewMode, setViewMode } = useViewMode()
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  // Status hierarchy
  const statusHierarchy = ["raised", "in_review", "accepted", "pending", "working", "resolved"]

  // Add status descriptions
  const statusDescriptions = {
    raised: (email) => `${email} has registered the issue`,
    in_review: "The department is reviewing the issue",
    accepted: "The department has accepted the issue",
    pending: "Has accepted and pending to be worked on",
    working: "The work is ongoing on the issue",
    resolved: "The issue is resolved",
  }

  // Fetch issues from API
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get("issues/get-issues")
        setIssues(response.data.issues || [])
      } catch (err) {
        setError(err.response?.data?.message || err.message)
        showToast(err.response?.data?.message || err.message, "error")
      } finally {
        setLoading(false)
      }
    }

    fetchIssues()
  }, [showToast])

  // Get current status of an issue
  const fetchIssueStatus = async (issueId) => {
    try {
      const response = await apiClient.get(`issues/get-status/${issueId}`)
      return response.data.issueStatus
    } catch (err) {
      showToast(err.response?.data?.message || err.message, "error")
      return null
    }
  }

  // Update issue status
  const updateIssueStatus = async (issueId, status) => {
    try {
      const response = await apiClient.put(`issues/update-status/${issueId}`, { status })

      // Update the issue in the local state
      setIssues((prevIssues) =>
        prevIssues.map((issue) =>
          issue.IssueId === issueId ? { ...issue, issueStatus: response.data.updatedStatus } : issue,
        ),
      )

      return response.data // Return the entire response object
    } catch (err) {
      showToast(err.response?.data?.message || err.message, "error")
      return null
    }
  }

  // Get all unique categories from issues
  const categories = [...new Set(issues.map((issue) => issue.IssueCategory))]

  // Filter issues based on search, category, and active tab
  const filteredIssues = issues
    .filter((issue) => {
      const matchesCategory = !category || issue.IssueCategory === category
      const matchesSearch =
        !searchQuery ||
        issue.IssueId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.IssueName.toLowerCase().includes(searchQuery.toLowerCase())

      // Filter based on active tab
      let matchesTab = true
      if (activeTab === "resolved") {
        matchesTab = issue.issueStatus.resolved
      } else if (activeTab === "pending") {
        matchesTab = issue.issueStatus.pending && !issue.issueStatus.resolved
      } else if (activeTab === "working") {
        matchesTab = issue.issueStatus.working && !issue.issueStatus.resolved
      } else if (activeTab === "raised") {
        matchesTab = issue.issueStatus.raised && !issue.issueStatus.in_review && !issue.issueStatus.pending
      }

      return matchesCategory && matchesSearch && matchesTab
    })
    .sort((a, b) => {
      // Only sort in "all" tab
      if (activeTab === "all") {
        // If one is resolved and the other isn't, put resolved at the bottom
        if (a.issueStatus.resolved && !b.issueStatus.resolved) return 1
        if (!a.issueStatus.resolved && b.issueStatus.resolved) return -1
        
        // If both are resolved or both are unresolved, sort by date (newest first)
        return new Date(b.createdAt) - new Date(a.createdAt)
      }
      // For other tabs, just sort by date
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

  // Get current status label
  const getCurrentStatusLabel = (issueStatus) => {
    // Find the highest status that is true
    for (let i = statusHierarchy.length - 1; i >= 0; i--) {
      const status = statusHierarchy[i]
      if (issueStatus[status]) {
        return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
      }
    }
    return "Unknown"
  }

  // Add a function to get the status description
  const getStatusDescription = (issueStatus, email) => {
    // Find the highest status that is true
    for (let i = statusHierarchy.length - 1; i >= 0; i--) {
      const status = statusHierarchy[i]
      if (issueStatus[status]) {
        const description = statusDescriptions[status]
        return typeof description === "function" ? description(email) : description
      }
    }
    return ""
  }

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Raised":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "In Review":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "Pending":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
      case "Working":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "Accepted":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "Resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "Raised":
        return <AlertCircle className="h-4 w-4" />
      case "In Review":
        return <Search className="h-4 w-4" />
      case "Pending":
        return <Clock className="h-4 w-4" />
      case "Working":
        return <BarChart3 className="h-4 w-4" />
      case "Accepted":
        return <CheckCircle className="h-4 w-4" />
      case "Resolved":
        return <CheckCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  // Handle view details
  const handleViewDetails = (issue, event) => {
    if (event) {
      const buttonRect = event.currentTarget.getBoundingClientRect()
      const originPosition = {
        x: buttonRect.left + buttonRect.width / 2,
        y: buttonRect.top + buttonRect.height / 2,
      }
      setOriginPosition(originPosition)
    }

    setSelectedIssue(issue)
    setIsModalOpen(true)
  }

  // Handle status update modal
  const handleStatusUpdateModal = async (issue, event) => {
    if (event) {
      const buttonRect = event.currentTarget.getBoundingClientRect()
      const originPosition = {
        x: buttonRect.left + buttonRect.width / 2,
        y: buttonRect.top + buttonRect.height / 2,
      }
      setOriginPosition(originPosition)
    }

    setSelectedIssue(issue)

    // Fetch current status
    const status = await fetchIssueStatus(issue.IssueId)
    if (status) {
      setCurrentStatus(status)
      setSelectedStatus(null)
      setIsStatusModalOpen(true)
    }
  }

  // Handle status selection
  const handleStatusSelection = (status) => {
    setSelectedStatus(status)
  }

  // Get available status options based on current status
  const getAvailableStatusOptions = (currentStatus) => {
    if (!currentStatus) return []

    // Find the last true status in our flow
    let lastTrueStatusIndex = -1
    for (const status of statusHierarchy) {
      if (currentStatus[status]) {
        lastTrueStatusIndex = statusHierarchy.indexOf(status)
      }
    }

    // Get the next status in the flow
    const nextStatusIndex = lastTrueStatusIndex + 1
    const nextStatus = statusHierarchy[nextStatusIndex]

    // If we're at resolved, no more options
    if (currentStatus.resolved) {
      return statusHierarchy.map(status => ({
        value: status,
        label: status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        disabled: true
      }))
    }

    // If there's a gap in the flow (e.g., pending is false but working is true)
    // then only allow selecting resolved
    const hasGapInFlow = statusHierarchy.some((status, index) => {
      if (index < lastTrueStatusIndex) {
        return !currentStatus[status]
      }
      return false
    })

    return statusHierarchy.map(status => ({
      value: status,
      label: status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      disabled: hasGapInFlow ? status !== 'resolved' : status !== nextStatus
    }))
  }

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedIssue || !selectedStatus || !currentStatus) return

    // Get the index of the selected status in the hierarchy
    const selectedStatusIndex = statusHierarchy.indexOf(selectedStatus)
    const statusUpdate = {}

    // Set all previous statuses and the selected status to true
    statusHierarchy.forEach((status, index) => {
      if (index <= selectedStatusIndex) {
        statusUpdate[status] = true
      } else {
        statusUpdate[status] = false
      }
    })

    // Update the status
    const response = await updateIssueStatus(selectedIssue.IssueId, statusUpdate)
    if (response) {
      setCurrentStatus(response.updatedStatus)
      setIsStatusModalOpen(false)
      showToast(response.message, "success")
      // Refresh the issues list
      const fetchIssues = async () => {
        try {
          setLoading(true)
          const response = await apiClient.get("issues/get-issues")
          setIssues(response.data.issues || [])
        } catch (err) {
          showToast(err.response?.data?.message || err.message, "error")
        } finally {
          setLoading(false)
        }
      }
      fetchIssues()
    }
  }

  // Add refresh functionality
  const handleRefresh = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get("issues/get-issues")
      setIssues(response.data.issues || [])
      showToast("Issues refreshed successfully", "success")
    } catch (err) {
      showToast(err.response?.data?.message || err.message, "error")
    } finally {
      setLoading(false)
    }
  }

  // Handle image view
  const handleImageView = (imageUrl, event) => {
    if (event) {
      const buttonRect = event.currentTarget.getBoundingClientRect()
      const originPosition = {
        x: buttonRect.left + buttonRect.width / 2,
        y: buttonRect.top + buttonRect.height / 2,
      }
      setOriginPosition(originPosition)
    }

    setSelectedImage(imageUrl)
    setIsImageModalOpen(true)
  }

  // Calculate stats
  const totalIssues = issues.length
  const resolvedIssues = issues.filter((issue) => issue.issueStatus.resolved).length
  const pendingIssues = issues.filter((issue) => issue.issueStatus.pending && !issue.issueStatus.resolved).length
  const criticalIssues = issues.filter(
    (issue) => issue.issueStatus.raised && !issue.issueStatus.in_review && !issue.issueStatus.pending,
  ).length
  const workingIssues = issues.filter((issue) => issue.issueStatus.working && !issue.issueStatus.resolved).length

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="max-w-auto mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2 flex items-center text-gray-800 dark:text-white">
            <AlertCircle className="mr-2 h-6 w-6 text-orange-500" />
            Issues Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Track and resolve department issues</p>
        </div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none md:min-w-[300px]">
            <input
              type="text"
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
          </div>
          <CustomDropdown
            value={category}
            onChange={setCategory}
            options={[
              { value: "", label: "All Categories" },
              ...categories.map((cat) => ({ value: cat, label: cat })),
            ]}
            className="w-full md:w-auto"
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button
            onClick={handleRefresh}
            variant="secondary"
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            disabled={loading}
          >
            <svg
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </Button>
          
        </div>
      </div>

      {/* Issues Stats */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 md:p-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Issues</div>
            <AlertCircle className="h-5 w-5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-2">{totalIssues}</div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Reported problems</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 md:p-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Resolved</div>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">{resolvedIssues}</div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Successfully fixed</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 md:p-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Pending</div>
            <Clock className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{pendingIssues}</div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">In progress</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 md:p-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Critical</div>
            <BarChart3 className="h-5 w-5 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">{criticalIssues}</div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Urgent attention needed</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b dark:border-gray-700">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === "all"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            All Issues
          </button>
          <button
            onClick={() => setActiveTab("raised")}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === "raised"
                ? "border-b-2 border-red-500 text-red-600 dark:text-red-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Raised
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === "pending"
                ? "border-b-2 border-yellow-500 text-yellow-600 dark:text-yellow-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab("working")}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === "working"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Working
          </button>
          <button
            onClick={() => setActiveTab("resolved")}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === "resolved"
                ? "border-b-2 border-green-500 text-green-600 dark:text-green-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Resolved
          </button>
        </div>

        <div className="p-4 border-b dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="w-full md:w-1/3">
            <CustomDropdown
              options={[
                { value: "", label: "All Categories" },
                ...categories.map((cat) => ({ value: cat, label: cat })),
              ]}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Select Category"
              className="w-full"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search issues..."
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading issues...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        ) : viewMode === "table" ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Issue ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Issue Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Raised By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredIssues.map((issue) => {
                  const statusLabel = getCurrentStatusLabel(issue.issueStatus)
                  return (
                    <tr key={issue.IssueId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {issue.IssueId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {issue.IssueName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`px-2 py-1 text-sm rounded inline-flex items-center ${getStatusBadgeClass(statusLabel)}`}
                        >
                          {getStatusIcon(statusLabel)}
                          <span className="ml-1">{statusLabel}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {issue.raisedByName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {issue.IssueCategory}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={(event) => handleImageView(issue.image, event)}
                            className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                            title="View Image"
                          >
                            <ImageIcon size={18} />
                          </button>
                          <button
                            onClick={(event) => handleViewDetails(issue, event)}
                            className="text-sky-600 hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300"
                            title="View Details"
                          >
                            <Info size={18} />
                          </button>
                          <Button size="sm" onClick={(event) => handleStatusUpdateModal(issue, event)}>
                            Update Status
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filteredIssues.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No issues found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIssues.map((issue) => {
              const statusLabel = getCurrentStatusLabel(issue.issueStatus)
              return (
                <div
                  key={issue.IssueId}
                  className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg text-gray-900 dark:text-white">{issue.IssueName}</h3>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-md mt-1 inline-block">
                          {issue.IssueId}
                        </span>
                      </div>
                      <div
                        className={`px-2 py-1 text-sm rounded inline-flex items-center ${getStatusBadgeClass(statusLabel)}`}
                      >
                        {getStatusIcon(statusLabel)}
                        <span className="ml-1">{statusLabel}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-sm mb-4 text-gray-600 dark:text-gray-300 line-clamp-2">
                      {issue.IssueDescription}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Category</div>
                        <div className="font-medium text-gray-900 dark:text-white">{issue.IssueCategory}</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Raised On</div>
                        <div className="font-medium text-gray-900 dark:text-white">{formatDate(issue.createdAt)}</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <button
                        onClick={(event) => handleImageView(issue.image, event)}
                        className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 flex items-center"
                      >
                        <ImageIcon size={16} className="mr-1" />
                        <span className="text-sm">View Image</span>
                      </button>
                      <div className="flex space-x-2">
                        <button
                          onClick={(event) => handleViewDetails(issue, event)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                        >
                          Details
                        </button>
                        <Button size="sm" onClick={(event) => handleStatusUpdateModal(issue, event)}>
                          Update
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            {filteredIssues.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">No issues found</div>
            )}
          </div>
        )}

        <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <div>
            Showing {filteredIssues.length} of {issues.length} issues
          </div>
        </div>
      </div>

      {/* Issue Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Issue Details"
        originPosition={originPosition}
        maxWidth="max-w-2xl"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto"
      >
        {selectedIssue && (
          <div className="space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Issue ID</p>
                <p className="mt-1 text-gray-900 dark:text-white">{selectedIssue.IssueId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                <div className="mt-1">
                  <span
                    className={`px-2 py-1 text-sm rounded inline-flex items-center ${getStatusBadgeClass(getCurrentStatusLabel(selectedIssue.issueStatus))}`}
                  >
                    {getStatusIcon(getCurrentStatusLabel(selectedIssue.issueStatus))}
                    <span className="ml-1">{getCurrentStatusLabel(selectedIssue.issueStatus)}</span>
                  </span>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {getStatusDescription(selectedIssue.issueStatus, selectedIssue.raisedByEmailID)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</p>
                <p className="mt-1 text-gray-900 dark:text-white">{selectedIssue.IssueCategory}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Raised On</p>
                <p className="mt-1 text-gray-900 dark:text-white">{formatDate(selectedIssue.createdAt)}</p>
              </div>
              <div className="col-span-1 md:col-span-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Raised By</p>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {selectedIssue.raisedByName} ({selectedIssue.raisedByEmailID})
                </p>
              </div>
              <div className="col-span-1 md:col-span-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</p>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {selectedIssue.address}, {selectedIssue.locality}, {selectedIssue.pincode}
                </p>
              </div>
              {selectedIssue.Related && (
                <div className="col-span-1 md:col-span-2">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Related Issue</p>
                  <p className="mt-1 text-gray-900 dark:text-white">{selectedIssue.Related}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</p>
              <p className="mt-1 text-gray-900 dark:text-white">{selectedIssue.IssueDescription}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Issue Image</p>
              <div className="mt-2 relative h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <img
                  src={selectedIssue.image || "/placeholder.svg"}
                  alt="Issue"
                  className="w-full h-full object-contain"
                  onClick={(event) => handleImageView(selectedIssue.image, event)}
                />
                <button
                  className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 p-1 rounded-full shadow-md"
                  onClick={(event) => handleImageView(selectedIssue.image, event)}
                >
                  <ImageIcon size={16} />
                </button>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
              <Button
                onClick={(event) => {
                  setIsModalOpen(false)
                  handleStatusUpdateModal(selectedIssue, event)
                }}
              >
                Update Status
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        maxWidth="max-w-md"
        title="Update Issue Status"
      >
        {selectedIssue && currentStatus && (
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Content Container */}
            <div className="p-6 space-y-6">
              {/* Issue Info */}
              <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">Issue ID</span>
                <span className="text-base font-semibold text-gray-900 dark:text-white">
                  {selectedIssue.IssueId}
                </span>
              </div>

              {/* Current Status */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Current Status</p>
                {(() => {
                  let highestStatus = null;
                  for (let i = statusHierarchy.length - 1; i >= 0; i--) {
                    if (currentStatus[statusHierarchy[i]]) {
                      highestStatus = statusHierarchy[i];
                      break;
                    }
                  }

                  if (highestStatus) {
                    const displayStatus = highestStatus
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase());

                    return (
                      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-md p-3">
                        <span className="text-sm font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
                          {displayStatus}
                        </span>
                        <div className="text-blue-500 dark:text-blue-400">
                          {getStatusIcon(displayStatus)}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="text-gray-500 dark:text-gray-400 text-sm">
                      No status set
                    </div>
                  );
                })()}
              </div>

              {/* Status Selection */}
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                  Select New Status
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {statusHierarchy.map((status) => {
                    const availableOptions = getAvailableStatusOptions(currentStatus);
                    const option = availableOptions.find(opt => opt.value === status);
                    const isDisabled = option?.disabled;
                    const isSelected = selectedStatus === status;

                    return (
                      <button
                        key={status}
                        onClick={() => !isDisabled && handleStatusSelection(status)}
                        disabled={isDisabled}
                        className={`
                          py-2 text-xs font-semibold uppercase tracking-wide
                          rounded-md transition-all duration-200
                          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                          ${
                            isDisabled
                              ? "cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                              : isSelected
                              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shadow-sm"
                              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                          }
                        `}
                      >
                        {status.replace("_", " ")}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStatusUpdate}
                  disabled={!selectedStatus}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-500 
                            disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Image View Modal */}
      <Modal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        title="Issue Image"
        originPosition={originPosition}
        maxWidth="max-w-3xl"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto"
      >
        {selectedImage && (
          <div className="relative flex justify-center">
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Issue"
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
            <button
              className="absolute bottom-2 left-2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                const newWindow = window.open()
                newWindow.document.write(`
                  <html>
                    <head>
                      <title>Full Screen Image</title>
                      <style>
                        body { margin: 0; background: #000; height: 100vh; display: flex; align-items: center; justify-content: center; }
                        img { max-width: 100%; max-height: 100vh; object-fit: contain; }
                      </style>
                    </head>
                    <body>
                      <img src="${selectedImage}" alt="Full Screen Issue Image">
                    </body>
                  </html>
                `)
              }}
              title="View Full Screen"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-expand"
              >
                <path d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8" />
                <path d="M3 16.2V21m0 0h4.8m-4.8 0 6-6" />
                <path d="M21 7.8V3m0 0h-4.8m4.8 0-6 6" />
                <path d="M3 7.8V3m0 0h4.8m-4.8 0 6 6" />
              </svg>
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Issues

