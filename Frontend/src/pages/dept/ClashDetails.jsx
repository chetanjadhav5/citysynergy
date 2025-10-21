"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Send, Check, MessageSquare, Calendar, Users, Clock } from "lucide-react"
import Button from "../../components/dept/Button"
import Modal from "../../components/dept/Modal"
import apiClient from "../../utils/apiClient"
import { useToast } from "../../context/ToastContext"
import { useAuth } from "../../context/AuthContext"
import { io } from "socket.io-client"
import { format } from "date-fns"

const ClashDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { user } = useAuth()
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [clashDetails, setClashDetails] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [socket, setSocket] = useState(null)
  const [socketConnected, setSocketConnected] = useState(false)
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  // Add active tab state for mobile view
  const [activeTab, setActiveTab] = useState("chat")
  // Track if a new message was just sent for animation
  const [newMessageSent, setNewMessageSent] = useState(false)

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(import.meta.env.VITE_API_BASE_URL || "http://localhost:3000", {
      withCredentials: true,
    })

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id)
      setSocketConnected(true)
    })

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err)
      addToast("Socket connection error. Please refresh the page.", "error")
    })

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected")
      setSocketConnected(false)
    })

    setSocket(socketInstance)

    // Clean up on unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect()
      }
    }
  }, [addToast])

  // Set up socket event listeners and join room
  useEffect(() => {
    if (!socket || !id || !user?.deptId) return

    // Join the clash room
    socket.emit("joinRoom", { clashId: id })

    // Validate user access to this clash
    socket.emit("validateUser", { deptId: user.deptId, clashId: id }, (response) => {
      if (response?.status === "error") {
        addToast(response.message, "error")
      } else {
        console.log("Validated and joined room:", id)
      }
    })

    // Listen for new messages
    socket.on("message", (message) => {
      console.log("Received message:", message)
      setMessages((prevMessages) => [...prevMessages, message])
      // Set animation flag for received messages too
      if (message.department !== user?.deptId) {
        setNewMessageSent(true)
        setTimeout(() => setNewMessageSent(false), 500)
      }
    })

    // Clean up listeners on unmount
    return () => {
      socket.off("message")
    }
  }, [socket, id, user?.deptId, addToast])

  // Fetch clash details and messages
  useEffect(() => {
    const fetchClashDetails = async () => {
      try {
        setLoading(true)
        const detailsResponse = await apiClient.get(`/uclashes/${id}/involved-departments`)

        if (detailsResponse.data.success) {
          setClashDetails(detailsResponse.data)
        } else {
          setError("Failed to fetch clash details")
          addToast("Failed to fetch clash details", "error")
        }

        // Fetch messages
        const messagesResponse = await apiClient.get(`/loadMessages/messages?clashId=${id.toLowerCase()}`)

        if (messagesResponse.data.messages) {
          setMessages(messagesResponse.data.messages)
        }
      } catch (err) {
        console.error("Error fetching clash data:", err)
        setError("Error fetching clash data")
        addToast("Error fetching clash data", "error")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchClashDetails()
    }
  }, [id, addToast])

  // Scroll to bottom of messages when new messages arrive or when component mounts
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket || !socketConnected) return

    if (!user?.deptId) {
      addToast("User department information is missing", "error")
      return
    }

    // Create the message object
    const messageData = {
      clashId: id,
      deptId: user.deptId,
      message: newMessage,
    }

    // Send message using the correct event name and data structure
    socket.emit("chatMessage", messageData, (response) => {
      if (response?.status === "error") {
        addToast(response.message, "error")
      } else {
        console.log("Message sent successfully")
        // Set animation flag for sent messages
        setNewMessageSent(true)
        setTimeout(() => setNewMessageSent(false), 500)
      }
    })

    // Clear the input
    setNewMessage("")
  }

  const handleAccept = async () => {
    try {
      const response = await apiClient.put(`/uclashes/${id}/involved-departments`, {
        status: true,
      })

      if (response.data.success) {
        addToast("Roadmap accepted successfully", "success")

        // Refresh clash details
        const detailsResponse = await apiClient.get(`/uclashes/${id}/involved-departments`)
        if (detailsResponse.data.success) {
          setClashDetails(detailsResponse.data)
        }

        // If clash is resolved, navigate back to clashes page
        if (response.data.is_resolved) {
          navigate("/dashboard/dept/clashes")
        }
      } else {
        addToast("Failed to accept roadmap", "error")
      }
    } catch (err) {
      console.error("Error accepting roadmap:", err)
      addToast("Error accepting roadmap", "error")
    } finally {
      setIsConfirmModalOpen(false)
    }
  }

  // Format date for display
  const formatDateString = (dateString) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "dd MMM yyyy")
    } catch (error) {
      return dateString
    }
  }

  // Check if current department has accepted the roadmap
  const hasCurrentDeptAccepted = () => {
    if (!clashDetails || !user?.deptId) return false
    return clashDetails.involved_departments[user.deptId] === true
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 border-4 border-t-blue-500 border-blue-200/30 rounded-full animate-spin dark:border-t-blue-400 dark:border-blue-700/30"></div>
          <p className="mt-4 text-blue-600 font-medium dark:text-blue-400">Loading clash details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center bg-white dark:bg-gray-800">
        <div className="text-red-500 dark:text-red-400 mb-4">{error}</div>
        <Button onClick={() => navigate("/dashboard/dept/clashes")}>Back to Clashes</Button>
      </div>
    )
  }

  // Render the mobile tabs navigation
  const renderMobileTabs = () => (
    <div className="lg:hidden flex border-b border-gray-200 dark:border-gray-700 mb-4 overflow-x-auto">
      <button
        onClick={() => setActiveTab("chat")}
        className={`flex items-center px-4 py-3 whitespace-nowrap ${
          activeTab === "chat"
            ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
            : "text-gray-500 dark:text-gray-400"
        }`}
      >
        <MessageSquare className="h-5 w-5 mr-2" />
        Chat
      </button>
      <button
        onClick={() => setActiveTab("roadmap")}
        className={`flex items-center px-4 py-3 whitespace-nowrap ${
          activeTab === "roadmap"
            ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
            : "text-gray-500 dark:text-gray-400"
        }`}
      >
        <Calendar className="h-5 w-5 mr-2" />
        Roadmap
      </button>
      <button
        onClick={() => setActiveTab("departments")}
        className={`flex items-center px-4 py-3 whitespace-nowrap ${
          activeTab === "departments"
            ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
            : "text-gray-500 dark:text-gray-400"
        }`}
      >
        <Users className="h-5 w-5 mr-2" />
        Departments
      </button>
    </div>
  )

  // Render the chat section
  const renderChatSection = () => (
    <div className={`lg:col-span-2 ${activeTab !== "chat" && "hidden lg:block"}`}>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-[calc(100vh-180px)] flex flex-col shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between dark:border-gray-700">
          <div className="flex items-center">
            <MessageSquare className="h-5 w-5 text-blue-600 mr-2 dark:text-blue-400" />
            <h2 className="text-lg font-semibold dark:text-gray-100">Department Chat</h2>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2 dark:text-gray-400">Connection:</span>
            {socketConnected ? (
              <span className="text-green-600 text-sm flex items-center dark:text-green-400">
                <span className="inline-flex h-2 w-2 rounded-full bg-green-500 mr-1 dark:bg-green-400"></span>
                Connected
              </span>
            ) : (
              <span className="text-red-600 text-sm flex items-center dark:text-red-400">
                <span className="inline-flex h-2 w-2 rounded-full bg-red-500 mr-1 dark:bg-red-400"></span>
                Disconnected
              </span>
            )}
          </div>
        </div>

        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-700 dark:text-gray-200 flex flex-col justify-end"
          style={{ scrollBehavior: "smooth" }}
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500 p-6 bg-white rounded-lg border border-gray-200 shadow-sm dark:text-gray-400 dark:bg-gray-800/50 dark:border-gray-700">
                <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50 dark:text-gray-400" />
                <p className="text-lg font-medium dark:text-gray-300">No messages yet</p>
                <p className="text-sm dark:text-gray-400">Start the conversation with other departments</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isCurrentDept = message.department === user?.deptId
                const isLastMessage = index === messages.length - 1
                return (
                  <div
                    key={message.id || index}
                    className={`flex ${isCurrentDept ? "justify-end" : "justify-start"} ${
                      isLastMessage && newMessageSent ? "animate-messageAppear" : ""
                    }`}
                  >
                    {!isCurrentDept && (
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-medium text-white mr-2 flex-shrink-0 dark:bg-indigo-500">
                        {message.department?.substring(0, 2)}
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 shadow ${
                        isCurrentDept
                          ? "bg-blue-600 text-white dark:bg-blue-500 dark:text-gray-100"
                          : "bg-white text-gray-800 border border-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`font-medium text-sm ${
                            isCurrentDept ? "text-blue-100 dark:text-blue-100" : "text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {message.department}
                        </span>
                        <span className="text-xs ml-2 opacity-75 dark:text-gray-400">
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="leading-relaxed">{message.message}</p>
                    </div>
                    {isCurrentDept && (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-medium text-white ml-2 flex-shrink-0 dark:bg-blue-500 dark:text-gray-100">
                        {message.department?.substring(0, 2)}
                      </div>
                    )}
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <form
          onSubmit={handleSendMessage}
          className="p-3 border-t border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:ring-blue-400"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={!socketConnected}
            />
            <Button
              type="submit"
              className={`px-4 ${
                socketConnected
                  ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  : "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
              }`}
              disabled={!socketConnected}
            >
              <Send size={18} className="mr-2" />
              Send
            </Button>
          </div>
          {!socketConnected && (
            <p className="text-red-500 text-xs mt-2 dark:text-red-400">Cannot send messages: Not connected to server</p>
          )}
        </form>
      </div>
    </div>
  )

  // Render the roadmap section
  const renderRoadmapSection = () => (
    <div className={`lg:col-span-1 ${activeTab !== "roadmap" && "hidden lg:block"}`}>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 flex items-center dark:border-gray-700">
          <Calendar className="h-5 w-5 text-blue-600 mr-2 dark:text-blue-400" />
          <h2 className="text-lg font-semibold dark:text-gray-100">Proposed Roadmap</h2>
        </div>

        <div className="p-4 space-y-4">
          {clashDetails &&
            Object.keys(clashDetails.start_dates || {})
              .sort((deptA, deptB) => {
                const dateA = new Date(clashDetails.start_dates[deptA])
                const dateB = new Date(clashDetails.start_dates[deptB])
                return dateA - dateB // Sort ascending by date
              })
              .map((deptId, index) => (
                <div
                  key={deptId}
                  className="relative overflow-hidden rounded-lg border border-gray-200 hover:border-blue-500 transition-all duration-300 group dark:border-gray-700 dark:hover:border-blue-400"
                >
                  {/* Priority indicator */}
                  <div className="absolute top-0 right-0 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-bl-lg dark:bg-blue-900/50 dark:text-blue-300">
                    Priority {index + 1}
                  </div>

                  {/* Department indicator */}
                  <div className="p-3 bg-gray-50 flex items-center dark:bg-gray-700/50">
                    <div className="w-2 h-full rounded-full bg-blue-500 absolute left-0 top-0 bottom-0 dark:bg-blue-400"></div>
                    <div className="ml-3 font-medium dark:text-gray-200">{deptId}</div>
                  </div>

                  {/* Date information */}
                  <div className="p-3 grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-2 rounded-md dark:bg-gray-700/30">
                      <div className="text-xs text-gray-500 mb-1 flex items-center dark:text-gray-400">
                        <Clock className="h-3 w-3 mr-1" /> Start Date
                      </div>
                      <div className="font-medium text-blue-600 dark:text-blue-400">
                        {formatDateString(clashDetails.start_dates[deptId])}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-md dark:bg-gray-700/30">
                      <div className="text-xs text-gray-500 mb-1 flex items-center dark:text-gray-400">
                        <Clock className="h-3 w-3 mr-1" /> End Date
                      </div>
                      <div className="font-medium text-blue-600 dark:text-blue-400">
                        {formatDateString(clashDetails.end_dates[deptId])}
                      </div>
                    </div>
                  </div>

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              ))}
        </div>

        {/* Accept roadmap button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {clashDetails && !clashDetails.is_resolved && !hasCurrentDeptAccepted() ? (
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 dark:bg-blue-500 dark:hover:bg-blue-600"
              onClick={() => setIsConfirmModalOpen(true)}
            >
              <Check className="h-4 w-4 mr-2" />
              Accept Roadmap
            </Button>
          ) : clashDetails && !clashDetails.is_resolved && hasCurrentDeptAccepted() ? (
            <div className="w-full p-3 bg-green-100 text-green-800 border border-green-200 rounded-lg text-center dark:bg-green-900/30 dark:text-green-400 dark:border-green-700/50">
              <Check className="h-4 w-4 inline-block mr-2" />
              You have accepted this roadmap
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )

  // Render the departments section
  const renderDepartmentsSection = () => (
    <div className={`lg:col-span-1 ${activeTab !== "departments" && "hidden lg:block"}`}>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 flex items-center dark:border-gray-700">
          <Users className="h-5 w-5 text-blue-600 mr-2 dark:text-blue-400" />
          <h2 className="text-lg font-semibold dark:text-gray-100">Departments Involved</h2>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {clashDetails &&
            Object.keys(clashDetails.involved_departments || {}).map((deptId) => (
              <div
                key={deptId}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors dark:hover:bg-gray-700/30"
              >
                <div className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-3 ${
                      clashDetails.involved_departments[deptId] ? "bg-green-500" : "bg-yellow-500"
                    } dark:${clashDetails.involved_departments[deptId] ? "bg-green-400" : "bg-yellow-400"}`}
                  ></div>
                  <span className="font-medium dark:text-gray-200">{deptId}</span>
                </div>
                <div
                  className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    clashDetails.involved_departments[deptId]
                      ? "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700/50"
                      : "bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700/50"
                  }`}
                >
                  {clashDetails.involved_departments[deptId] ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Accepted
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* Summary */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 dark:bg-gray-700/30 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {clashDetails && Object.values(clashDetails.involved_departments).filter(Boolean).length} of{" "}
            {clashDetails && Object.keys(clashDetails.involved_departments).length} departments have accepted
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-200 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-4 shadow-sm dark:shadow-none">
        <div className="container mx-auto flex items-center">
          <button
            onClick={() => navigate("/dashboard/dept/clashes")}
            className="p-2 mr-3 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold flex items-center">
            Clash <span className="text-blue-600 ml-1 dark:text-blue-400">{id}</span>
            <span
              className={`ml-4 px-3 py-1 text-xs rounded-full ${
                clashDetails?.is_resolved
                  ? "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700/50"
                  : "bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700/50"
              }`}
            >
              {clashDetails?.is_resolved ? "Resolved" : "Unresolved"}
            </span>
            {socketConnected ? (
              <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-green-500 dark:bg-green-400"></span>
            ) : (
              <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-red-500 dark:bg-red-400"></span>
            )}
          </h1>
        </div>
      </div>

      <div className="container mx-auto p-4">
        {/* Mobile Tabs */}
        {renderMobileTabs()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Section */}
          {renderChatSection()}

          {/* Roadmap and Departments Section */}
          <div className="lg:col-span-1 space-y-6">
            {/* Proposed Roadmap */}
            {renderRoadmapSection()}

            {/* Departments Involved */}
            {renderDepartmentsSection()}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Roadmap Acceptance"
      >
        <div className="text-center p-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6 dark:bg-blue-900/30">
            <Check className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-4 dark:text-white">Accept Proposed Roadmap?</h3>
          <p className="text-gray-500 mb-6 dark:text-gray-400">
            By accepting this roadmap, you agree to the proposed schedule for your department's work. This action cannot
            be reversed.
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              variant="secondary"
              onClick={() => setIsConfirmModalOpen(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAccept}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Confirm Acceptance
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add animation keyframes for message appearance */}
      <style jsx>{`
        @keyframes messageAppear {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-messageAppear {
          animation: messageAppear 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export default ClashDetails
