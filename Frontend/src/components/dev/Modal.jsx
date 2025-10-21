"use client"

import { X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import ReactDOM from "react-dom"
import PropTypes from "prop-types"

const Modal = ({ isOpen, onClose, title, children, originPosition = null, maxWidth = "max-w-md" }) => {
  const [animationState, setAnimationState] = useState(isOpen ? "entering" : "closed")
  const modalRef = useRef(null)
  const [clickPosition, setClickPosition] = useState({ x: "50%", y: "50%" })

  // Track animation state
  useEffect(() => {
    if (isOpen && animationState === "closed") {
      // Capture the click position
      const buttonRect = originPosition || {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      }
      setClickPosition(buttonRect)

      // Add a class to the body to prevent scrolling
      document.body.style.overflow = "hidden"

      setAnimationState("entering")
      setTimeout(() => setAnimationState("entered"), 10)
    } else if (!isOpen && animationState !== "closed") {
      setAnimationState("exiting")

      // Re-enable scrolling
      document.body.style.overflow = ""

      const timer = setTimeout(() => setAnimationState("closed"), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen, animationState, originPosition])

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Close when clicking outside the modal
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target) && isOpen) {
        onClose()
      }
    }
    window.addEventListener("mousedown", handleOutsideClick)
    return () => window.removeEventListener("mousedown", handleOutsideClick)
  }, [isOpen, onClose])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  if (animationState === "closed") return null

  // Determine animation styles based on state
  const modalClasses = {
    entering: "opacity-0 scale-90 translate-y-4",
    entered: "opacity-100 scale-100 translate-y-0",
    exiting: "opacity-0 scale-95 translate-y-2",
  }

  // Calculate transform origin based on click position
  const transformOriginStyle = originPosition
    ? { transformOrigin: `${clickPosition.x}px ${clickPosition.y}px` }
    : { transformOrigin: "center" }

  // Create the modal content
  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* First layer: blur backdrop */}
      <div
        className={`fixed inset-0 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          animationState === "entering" ? "opacity-0" : animationState === "entered" ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      ></div>

      {/* Second layer: semi-transparent overlay */}
      <div
        className={`fixed inset-0 bg-black/50 dark:bg-black/70 transition-opacity duration-300 ease-out ${
          animationState === "entering"
            ? "bg-opacity-0"
            : animationState === "entered"
              ? "bg-opacity-50"
              : "bg-opacity-0"
        }`}
        aria-hidden="true"
      ></div>

      {/* Modal content */}
      <div
        ref={modalRef}
        style={transformOriginStyle}
        className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full ${maxWidth} mx-4 transform transition-all duration-300 ease-out ${modalClasses[animationState]}`}
      >
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 dark:text-gray-200">{children}</div>
      </div>
    </div>
  )

  // Use portal to render the modal at the root level
  return ReactDOM.createPortal(modalContent, document.body)
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  originPosition: PropTypes.object,
  maxWidth: PropTypes.string,
}

export default Modal

