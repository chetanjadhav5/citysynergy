// src/pages/Clashes.jsx

"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, LayoutGrid, List, AlertTriangle, Clock, CheckCircle, Users } from "lucide-react"
import Button from "../../components/dept/Button"

const Clashes = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState("all") // 'all', 'resolved', 'unresolved'
  const [viewMode, setViewMode] = useState("card") // 'card', 'table'

  // This would come from an API in a real application
  const clashes = [
    {
      clashId: "C001",
      involvedDepartments: { D01: false, D02: false, D03: false },
      departmentNames: { D01: "Roads Department", D02: "Electricity Department", D03: "Water Department" },
      proposedStartDate: { D01: "2024-04-01", D02: "2024-04-10", D03: "2024-04-15" },
      proposedEndDate: { D01: "2024-05-01", D02: "2024-05-10", D03: "2024-05-15" },
      proposedRoadmap: { D01: "Priority 1", D02: "Priority 2", D03: "Priority 3" },
      isResolved: false,
      location: "Sector 45, Central Delhi",
      description: "Multiple departments planning work in the same area during overlapping time periods.",
    },
    {
      clashId: "C002",
      involvedDepartments: { D01: true, D04: true },
      departmentNames: { D01: "Roads Department", D04: "Sewage Department" },
      proposedStartDate: { D01: "2024-03-15", D04: "2024-03-20" },
      proposedEndDate: { D01: "2024-04-15", D04: "2024-04-25" },
      proposedRoadmap: { D01: "Priority 1", D04: "Priority 2" },
      isResolved: true,
      location: "Sector 12, North Delhi",
      description: "Road repair and sewage work scheduled simultaneously.",
    },
    {
      clashId: "C003",
      involvedDepartments: { D02: false, D05: false },
      departmentNames: { D02: "Electricity Department", D05: "Telecom Department" },
      proposedStartDate: { D02: "2024-05-01", D05: "2024-05-05" },
      proposedEndDate: { D02: "2024-05-15", D05: "2024-05-20" },
      proposedRoadmap: { D02: "Priority 1", D05: "Priority 2" },
      isResolved: false,
      location: "Sector 18, South Delhi",
      description: "Electricity and telecom infrastructure upgrades planned for the same area.",
    },
    {
      clashId: "C004",
      involvedDepartments: { D03: true, D04: true, D06: true },
      departmentNames: { D03: "Water Department", D04: "Sewage Department", D06: "Parks Department" },
      proposedStartDate: { D03: "2024-06-01", D04: "2024-06-05", D06: "2024-06-10" },
      proposedEndDate: { D03: "2024-06-15", D04: "2024-06-20", D06: "2024-06-25" },
      proposedRoadmap: { D03: "Priority 1", D04: "Priority 2", D06: "Priority 3" },
      isResolved: true,
      location: "Sector 22, East Delhi",
      description: "Water, sewage, and park renovation work scheduled in close proximity.",
    },
  ]

  const filteredClashes = clashes.filter((clash) => {
    // Apply search filter
    const matchesSearch =
      clash.clashId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clash.location.toLowerCase().includes(searchQuery.toLowerCase())

    // Apply status filter
    const matchesFilter =
      filter === "all" || (filter === "resolved" && clash.isResolved) || (filter === "unresolved" && !clash.isResolved)

    return matchesSearch && matchesFilter
  })

  // Calculate stats
  const totalClashes = clashes.length
  const resolvedClashes = clashes.filter((clash) => clash.isResolved).length
  const unresolvedClashes = clashes.filter((clash) => !clash.isResolved).length
  const totalDepartments = new Set(clashes.flatMap((clash) => Object.keys(clash.involvedDepartments))).size

  return (
    <div className="max-w-auto mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2 flex items-center text-gray-800 dark:text-white">
            <AlertTriangle className="mr-2 h-6 w-6 text-red-500" />
            Clashes Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and resolve department work clashes</p>
        </div>
      </div>

      {/* Clashes Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Clashes</div>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">{totalClashes}</div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Identified conflicts</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Resolved</div>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">{resolvedClashes}</div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Successfully coordinated</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Pending</div>
            <Clock className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{unresolvedClashes}</div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Awaiting resolution</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Departments</div>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">{totalDepartments}</div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Involved in clashes</div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="p-4 border-b dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("resolved")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "resolved"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Resolved
            </button>
            <button
              onClick={() => setFilter("unresolved")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "unresolved"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Unresolved
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search clashes..."
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

        {viewMode === "table" ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Clash ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Departments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredClashes.map((clash) => (
                  <tr
                    key={clash.clashId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{clash.clashId}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {Object.keys(clash.proposedStartDate)[0] &&
                          clash.proposedStartDate[Object.keys(clash.proposedStartDate)[0]]}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{clash.location}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {Object.keys(clash.involvedDepartments).map((deptId) => (
                          <span
                            key={deptId}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-300"
                          >
                            {deptId}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${clash.isResolved ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400" : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"}`}
                      >
                        {clash.isResolved ? "Resolved" : "Unresolved"}
                      </span>
                    </td>
                    
                  </tr>
                ))}
                {filteredClashes.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No clashes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClashes.map((clash) => (
              <div
                key={clash.clashId}
                className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{clash.clashId}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${clash.isResolved ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400" : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"}`}
                    >
                      {clash.isResolved ? "Resolved" : "Unresolved"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{clash.location}</p>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">{clash.description}</p>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p className="font-medium">Departments Involved:</p>
                    <ul className="mt-1 space-y-1">
                      {Object.keys(clash.involvedDepartments).map((deptId) => (
                        <li key={deptId} className="flex items-center">
                          <span
                            className={`w-2 h-2 rounded-full mr-2 ${clash.involvedDepartments[deptId] ? "bg-green-500" : "bg-yellow-500"}`}
                          ></span>
                          {clash.departmentNames[deptId]}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
            {filteredClashes.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">No clashes found</div>
            )}
          </div>
        )}

        <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <div>
            Showing {filteredClashes.length} of {clashes.length} clashes
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
    </div>
  )
}

export default Clashes

