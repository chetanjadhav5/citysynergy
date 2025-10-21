"use client"

import { useState, useEffect } from "react"
import { FileText, AlertTriangle, AlertCircle, Package, Users, Clock, User, Activity } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import Card from "../../components/dept/Card"
import apiClient from "../../utils/apiClient"

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTenders: 0,
    activeTenders: 0,
    totalClashes: 0,
    totalInventory: 0,
    unresolvedIssues: 0,
  })

  const [analyticsData, setAnalyticsData] = useState({
    tendersByMonth: [],
    inventoryDistribution: [],
    clashResolution: {
      resolved: 0,
      unresolved: 0,
      percentResolved: 0
    },
    recentActivity: []
  })

  const [activeTab, setActiveTab] = useState("analytics")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const response = await apiClient.get('/deptactivity/overview')
        if (response.data.success) {
          setStats(prevStats => ({
            ...prevStats,
            ...response.data.data,
            resolvedIssues: response.data.data.totalClashes - response.data.data.unresolvedIssues
          }))
        }
      } catch (err) {
        setError('Failed to fetch overview data')
        console.error('Error fetching overview data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOverviewData()
  }, [])

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        // Fetch tenders by month
        const tendersResponse = await apiClient.get('/deptactivity/tenders-by-month')
        let tendersByMonth = []
        if (tendersResponse.data.success) {
          tendersByMonth = Object.entries(tendersResponse.data.data).map(([month, count]) => ({
            month,
            count
          }))
        }

        // Fetch inventory distribution
        const inventoryResponse = await apiClient.get('/deptactivity/inventory-category-distribution')
        let inventoryDistribution = []
        if (inventoryResponse.data.success) {
          inventoryDistribution = inventoryResponse.data.data.map(item => ({
            name: item.itemCategory,
            value: item.count
          }))
        }

        // Fetch clash resolution
        const clashResponse = await apiClient.get('/deptactivity/clash-resolution')
        let clashResolution = {
          resolved: 0,
          unresolved: 0,
          percentResolved: 0
        }
        if (clashResponse.data.success) {
          clashResolution = clashResponse.data.data
        }

        // Fetch recent activity
        const activityResponse = await apiClient.get('/deptactivity/recent-activity')
        let recentActivity = []
        if (activityResponse.data.success) {
          recentActivity = activityResponse.data.data.slice(0, 5) // Get latest 5 activities
        }

        setAnalyticsData({
          tendersByMonth,
          inventoryDistribution,
          clashResolution,
          recentActivity
        })
      } catch (err) {
        console.error('Error fetching analytics data:', err)
      }
    }

    if (activeTab === "analytics") {
      fetchAnalyticsData()
    }
  }, [activeTab])

  // Helper function to format time ago
  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return "Yesterday"
    if (diffInDays < 7) return `${diffInDays} days ago`
    
    return date.toLocaleDateString()
  }

  // Helper function to get activity icon and color
  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case 'LOGIN':
        return { icon: <User size={12} />, color: 'bg-blue-500' }
      case 'TENDER':
        return { icon: <FileText size={12} />, color: 'bg-green-500' }
      case 'CLASH':
        return { icon: <AlertTriangle size={12} />, color: 'bg-red-500' }
      case 'INVENTORY':
        return { icon: <Package size={12} />, color: 'bg-purple-500' }
      default:
        return { icon: <Activity size={12} />, color: 'bg-gray-500' }
    }
  }

  // Colors for pie charts
  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16']

  return (
    <div className="animate-fadeIn p-2 md:p-6 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-3 sm:space-y-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Department Dashboard</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1 flex w-full sm:w-auto">
          <button
            className={`px-2 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "overview" ? "bg-sky-100 text-sky-600 dark:bg-sky-900 dark:text-sky-300" : "text-gray-600 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-gray-700"}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`px-2 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "analytics" ? "bg-sky-100 text-sky-600 dark:bg-sky-900 dark:text-sky-300" : "text-gray-600 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-gray-700"}`}
            onClick={() => setActiveTab("analytics")}
          >
            Analytics
          </button>
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {loading ? (
            <div className="col-span-full text-center">Loading...</div>
          ) : error ? (
            <div className="col-span-full text-center text-red-500">{error}</div>
          ) : (
            <>
              <Card title="Total Users" value={stats.totalUsers} icon={<Users size={24} className="text-blue-500" />} />
              <Card
                title="Total Tenders"
                value={stats.totalTenders}
                icon={<FileText size={24} className="text-green-500" />}
              />
              <Card
                title="Active Tenders"
                value={stats.activeTenders}
                icon={<FileText size={24} className="text-yellow-500" />}
              />
              <Card
                title="Total Clashes"
                value={stats.totalClashes}
                icon={<AlertTriangle size={24} className="text-red-500" />}
              />
              <Card
                title="Total Items in Inventory"
                value={stats.totalInventory}
                icon={<Package size={24} className="text-purple-500" />}
              />
              <Card
                title="Unresolved Issues"
                value={stats.unresolvedIssues}
                icon={<AlertCircle size={24} className="text-teal-500" />}
              />
            </>
          )}
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Bar chart for tenders by month using Recharts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Tenders by Month</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.tendersByMonth} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: 'currentColor', fontSize: 12 }}
                    className="text-gray-600 dark:text-gray-400"
                  />
                  <YAxis 
                    tick={{ fill: 'currentColor', fontSize: 12 }}
                    className="text-gray-600 dark:text-gray-400"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--tooltip-bg, #ffffff)', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      color: 'var(--tooltip-text, #374151)'
                    }}
                  />
                  <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie chart for inventory category distribution using Recharts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Inventory Category Distribution</h2>
            {analyticsData.inventoryDistribution.length > 0 ? (
              <div className="h-64 flex flex-col">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.inventoryDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {analyticsData.inventoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--tooltip-bg, #ffffff)', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          color: 'var(--tooltip-text, #374151)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {analyticsData.inventoryDistribution.map((entry, index) => (
                    <div key={entry.name} className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="text-xs sm:text-sm dark:text-gray-300">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                No inventory data available
              </div>
            )}
          </div>

          {/* Clash Resolution Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Clash Resolution</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-4 sm:mb-0">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {/* Background circle */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="transparent" 
                    stroke="#e5e7eb" 
                    strokeWidth="8"
                    className="dark:stroke-gray-600"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="8"
                    strokeDasharray={`${analyticsData.clashResolution.percentResolved * 2.51} ${(100 - analyticsData.clashResolution.percentResolved) * 2.51}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-bold text-emerald-500">
                    {analyticsData.clashResolution.percentResolved}%
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Resolved</span>
                </div>
              </div>
              <div className="sm:ml-6 text-center sm:text-left">
                <div className="mb-3">
                  <div className="flex items-center justify-center sm:justify-start">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                    <span className="text-sm dark:text-gray-300">
                      Resolved: {analyticsData.clashResolution.resolved}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-center sm:justify-start">
                    <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 mr-2"></div>
                    <span className="text-sm dark:text-gray-300">
                      Unresolved: {analyticsData.clashResolution.unresolved}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent User Activity</h2>
            <div className="space-y-3 overflow-hidden max-h-80 overflow-y-auto">
              {analyticsData.recentActivity.length > 0 ? (
                analyticsData.recentActivity.map((activity, index) => {
                  const { icon, color } = getActivityIcon(activity.activityType)
                  return (
                    <div key={activity.logId} className="flex items-start">
                      <div className="flex flex-col items-center mr-3 flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white`}>
                          {icon}
                        </div>
                        {index < analyticsData.recentActivity.length - 1 && (
                          <div className="w-0.5 h-6 bg-gray-200 dark:bg-gray-700 mt-2"></div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 pb-2">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-tight">
                          {activity.description}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(activity.createdAt)}
                          </p>
                          {activity.ipAddress && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 sm:mt-0">
                              IP: {activity.ipAddress}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No recent activity
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard