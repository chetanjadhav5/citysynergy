"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Plus, Info, Filter, RefreshCcw, FileText, Clock, MapPin, BarChart3 } from "lucide-react"
import Button from "../../components/dept/Button"
import Modal from "../../components/dept/Modal"
import apiClient from "../../utils/apiClient"
import { useToast } from "../../context/ToastContext"
import { useViewMode } from "../../hooks/useViewMode"
import { format } from "date-fns"

const Tenders = () => {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { viewMode, setViewMode } = useViewMode("table")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTender, setSelectedTender] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState("Tender_ID")
  const [sortOrder, setSortOrder] = useState("asc")
  const [originPosition, setOriginPosition] = useState(null)
  const [tenders, setTenders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch tenders on component mount
  useEffect(() => {
    const fetchTenders = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get("/tender/department")

        if (response.data.success) {
          setTenders(response.data.data)
        } else {
          setError("Failed to fetch tenders")
          addToast("Failed to fetch tenders", "error")
        }
      } catch (err) {
        console.error("Error fetching tenders:", err)
        setError("Error fetching tenders")
        addToast("Error fetching tenders", "error")
      } finally {
        setLoading(false)
      }
    }

    fetchTenders()
  }, [addToast])

  // Apply filters and sorting
  const filteredTenders = tenders
    .filter(
      (tender) =>
        tender.Tender_ID?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tender.Tender_by_Classification?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tender.Zones?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tender.Pincode?.includes(searchQuery),
    )
    .sort((a, b) => {
      const factor = sortOrder === "asc" ? 1 : -1

      if (sortBy === "Tender_ID") {
        return a.Tender_ID?.localeCompare(b.Tender_ID) * factor
      } else if (sortBy === "Tender_by_Classification") {
        return a.Tender_by_Classification?.localeCompare(b.Tender_by_Classification) * factor
      } else if (sortBy === "Sanction_Amount") {
        return (Number.parseFloat(a.Sanction_Amount) - Number.parseFloat(b.Sanction_Amount)) * factor
      } else if (sortBy === "Zones") {
        return a.Zones?.localeCompare(b.Zones) * factor
      } else if (sortBy === "Start_Date") {
        return (new Date(a.Start_Date) - new Date(b.Start_Date)) * factor
      }

      return 0
    })

  const getStatusColor = (status) => {
    if (status === "Complete") return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
    if (status === "In Progress") return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400"
    if (status === "Accepted") return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400"
    if (status === "Pending") return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
    return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
  }

  const handleViewDetails = (tender, event) => {
    // Get the button's position for the animation
    const buttonRect = event.currentTarget.getBoundingClientRect()
    const originPosition = {
      x: buttonRect.left + buttonRect.width / 2,
      y: buttonRect.top + buttonRect.height / 2,
    }

    setSelectedTender(tender)
    setIsModalOpen(true)
    setOriginPosition(originPosition)
  }

  // Toggle sort order
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  // Calculate total amount
  const totalAmount = tenders.reduce((sum, tender) => sum + Number.parseFloat(tender.Sanction_Amount || 0), 0)

  // Count tenders by status
  const activeTenders = tenders.filter(
    (tender) => tender.Complete_Pending === "In Progress" || tender.Complete_Pending === "Accepted",
  ).length

  // Count unique zones
  const uniqueZones = new Set(tenders.map((tender) => tender.Zones)).size

  // Format date for display
  const formatDateString = (dateString) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "dd MMM yyyy")
    } catch (error) {
      return dateString
    }
  }

  return (
    <div className="max-w-auto mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2 flex items-center text-gray-800 dark:text-white">
            <FileText className="mr-2 h-6 w-6 text-blue-500" />
            Tender Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage municipal tenders and projects</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/dashboard/dept/tenders/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Tender
          </Button>
        </div>
      </div>

      {/* Tender Stats */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Tenders</div>
            <FileText className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">{tenders.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Current fiscal year</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Tenders</div>
            <Clock className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">{activeTenders}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">In progress or accepted</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Zones Covered</div>
            <MapPin className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">{uniqueZones}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Municipal zones</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Budget</div>
            <BarChart3 className="h-5 w-5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            ₹{(totalAmount / 1000000).toFixed(1)}M
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Allocated funding</div>
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

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tenders..."
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Filter className="h-4 w-4" />
                Sort & Filter
              </button>

              {filterOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-10 p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Sort Tenders</h3>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="Tender_ID">Tender ID</option>
                      <option value="Tender_by_Classification">Category</option>
                      <option value="Sanction_Amount">Amount</option>
                      <option value="Zones">Zone</option>
                      <option value="Start_Date">Start Date</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order</label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>

                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => {
                        setSortBy("Tender_ID")
                        setSortOrder("asc")
                      }}
                      className="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <RefreshCcw className="h-12 w-12 mx-auto mb-2 opacity-50 animate-spin" />
              <p className="text-lg font-medium dark:text-gray-400">Loading tenders...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-red-400 dark:text-red-500 mb-2">
              <p className="text-lg font-medium">Error loading tenders</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        ) : viewMode === "table" ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:text-blue-500 dark:hover:text-blue-400"
                    onClick={() => handleSort("Tender_ID")}
                  >
                    Tender ID {sortBy === "Tender_ID" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:text-blue-500 dark:hover:text-blue-400"
                    onClick={() => handleSort("Tender_by_Classification")}
                  >
                    Category {sortBy === "Tender_by_Classification" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:text-blue-500 dark:hover:text-blue-400"
                    onClick={() => handleSort("Sanction_Amount")}
                  >
                    Amount {sortBy === "Sanction_Amount" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Status
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:text-blue-500 dark:hover:text-blue-400"
                    onClick={() => handleSort("Zones")}
                  >
                    Zone {sortBy === "Zones" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Pincode
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTenders.map((tender) => (
                  <tr key={tender.Tender_ID} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{tender.Tender_ID}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Created {formatDateString(tender.Sanction_Date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                      {tender.Tender_by_Classification}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                      ₹{Number.parseFloat(tender.Sanction_Amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-md ${getStatusColor(tender.Complete_Pending)}`}>
                        {tender.Complete_Pending}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{tender.Zones}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{tender.Pincode}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={(event) => handleViewDetails(tender, event)}
                          className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                        >
                          <Info className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTenders.map((tender) => (
              <div
                key={tender.Tender_ID}
                className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg text-gray-900 dark:text-white">
                        {tender.Tender_by_Classification}
                      </h3>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-md mt-1 inline-block">
                        {tender.Tender_ID}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(event) => handleViewDetails(tender, event)}
                        className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                      >
                        <Info className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Amount</div>
                      <div className="font-medium text-blue-600 dark:text-blue-400">
                        ₹{(Number.parseFloat(tender.Sanction_Amount) / 100000).toFixed(1)}L
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Status</div>
                      <div className={`font-medium ${getStatusColor(tender.Complete_Pending)}`}>
                        {tender.Complete_Pending}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Dates</div>
                      <div className="font-medium text-amber-600 dark:text-amber-400 text-xs">
                        {formatDateString(tender.Start_Date)}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <div>
                      {tender.Zones}, {tender.City}
                    </div>
                    <div>{tender.Pincode}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredTenders.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <RefreshCcw className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-lg font-medium dark:text-gray-400">No tenders found</p>
            </div>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
          </div>
        )}

        <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <div>
            Showing {filteredTenders.length} of {tenders.length} tenders
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
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tender Details"
        originPosition={originPosition}
      >
        {selectedTender && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tender ID</p>
                <p className="mt-1 text-gray-900 dark:text-white">{selectedTender.Tender_ID}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</p>
                <p className="mt-1 text-gray-900 dark:text-white">{selectedTender.Tender_by_Classification}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</p>
                <p className="mt-1 text-gray-900 dark:text-white">
                  ₹{Number.parseFloat(selectedTender.Sanction_Amount).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                <p className="mt-1">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedTender.Complete_Pending)}`}>
                    {selectedTender.Complete_Pending}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Zone</p>
                <p className="mt-1 text-gray-900 dark:text-white">{selectedTender.Zones}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pincode</p>
                <p className="mt-1 text-gray-900 dark:text-white">{selectedTender.Pincode}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</p>
              <p className="mt-1 text-gray-900 dark:text-white">{selectedTender.Tender_by_Classification}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sanction Date</p>
                <p className="mt-1 text-gray-900 dark:text-white">{formatDateString(selectedTender.Sanction_Date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</p>
                <p className="mt-1 text-gray-900 dark:text-white">{selectedTender.Tender_by_Department}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</p>
                <p className="mt-1 text-gray-900 dark:text-white">{formatDateString(selectedTender.Start_Date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">End Date</p>
                <p className="mt-1 text-gray-900 dark:text-white">{formatDateString(selectedTender.End_Date)}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Locality</p>
                <p className="mt-1 text-gray-900 dark:text-white">{selectedTender.Locality}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Local Area</p>
                <p className="mt-1 text-gray-900 dark:text-white">{selectedTender.Local_Area}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">City</p>
                <p className="mt-1 text-gray-900 dark:text-white">{selectedTender.City}</p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Tenders

