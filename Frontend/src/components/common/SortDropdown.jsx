"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, ArrowUp, ArrowDown, Check } from "lucide-react"

/**
 * SortDropdown component for sorting table data
 * @param {Object} props
 * @param {Array} props.options - Array of options {label, value}
 * @param {string} props.value - Current sort field
 * @param {string} props.order - Current sort order (asc or desc)
 * @param {Function} props.onChange - Callback when sort changes (receives field and order)
 * @param {string} props.className - Additional CSS classes for the main button
 */
const SortDropdown = ({ 
  options, 
  value, 
  order, 
  onChange,
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const elementId = `sort-dropdown`

  // Ensure options is always an array
  const safeOptions = Array.isArray(options) ? options : []

  // Get current selected option label
  const getSelectedLabel = () => {
    const selected = safeOptions.find(option => option.value === value)
    return selected ? selected.label : safeOptions[0]?.label || 'Sort by'
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const toggleDropdown = () => setIsOpen(!isOpen)

  const handleFieldChange = (fieldValue) => {
    onChange(fieldValue, order)
    setIsOpen(false)
  }

  const toggleSortOrder = () => {
    onChange(value, order === "asc" ? "desc" : "asc")
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center">
        <button
          type="button"
          id={elementId}
          onClick={toggleDropdown}
          className={`flex items-center justify-between gap-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-l-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="font-medium">Sort by: {getSelectedLabel()}</span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>
        <button
          type="button"
          onClick={toggleSortOrder}
          className="flex items-center justify-center px-2 py-2 bg-white dark:bg-gray-800 border border-l-0 border-gray-200 dark:border-gray-700 rounded-r-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={order === "asc" ? "Sort ascending" : "Sort descending"}
        >
          {order === "asc" ? (
            <ArrowUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ArrowDown className="h-4 w-4 text-gray-500" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto top-full left-0">
          <ul className="py-1" role="listbox" aria-labelledby={elementId}>
            {safeOptions.map((option) => (
              <li 
                key={String(option.value)} 
                role="option" 
                aria-selected={value === option.value}
              >
                <button
                  type="button"
                  onClick={() => handleFieldChange(option.value)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                >
                  <span>{option.label}</span>
                  {option.value === value && <Check className="h-4 w-4 text-blue-500" />}
                </button>
              </li>
            ))}
            {safeOptions.length === 0 && (
              <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                No options available
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

SortDropdown.defaultProps = {
  options: [],
  value: "",
  order: "asc",
  onChange: () => {},
}

export default SortDropdown

