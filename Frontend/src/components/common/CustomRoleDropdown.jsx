import { useState, useEffect, useRef } from "react"
import { ChevronDown, Check } from "lucide-react"

/**
 * CustomRoleDropdown component for role selection
 * @param {Object} props
 * @param {Array} props.options - Array of role options {roleId, roleName}
 * @param {string} props.value - Currently selected value
 * @param {Function} props.onChange - Callback when selection changes
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.error - Whether there's an error
 * @param {string} props.errorMessage - Error message to display
 */
const CustomRoleDropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select a role", 
  error = false,
  errorMessage = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Ensure options is always an array
  const safeOptions = Array.isArray(options) ? options : []
  
  // Get current selected option
  const selectedOption = safeOptions.find((option) => option.roleId === value)

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

  const handleSelect = (roleId) => {
    onChange({
      target: {
        name: "roleId",
        value: roleId
      }
    })
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className={`w-full flex items-center justify-between px-3 py-2 text-left border ${
          error ? "border-red-500" : "border-gray-300 dark:border-gray-600"
        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white`}
      >
        <span className={selectedOption ? "" : "text-gray-500 dark:text-gray-400"}>
          {selectedOption ? selectedOption.roleName : placeholder}
        </span>
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
          <ul className="py-1">
            {safeOptions.map((option) => (
              <li key={option.roleId}>
                <button
                  type="button"
                  onClick={() => handleSelect(option.roleId)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                >
                  <span>{option.roleName}</span>
                  {option.roleId === value && <Check className="h-4 w-4 text-blue-500" />}
                </button>
              </li>
            ))}
            {safeOptions.length === 0 && (
              <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                No roles available
              </li>
            )}
          </ul>
        </div>
      )}
      
      {error && errorMessage && (
        <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
      )}
    </div>
  )
}

export default CustomRoleDropdown