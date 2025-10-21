import { useState, useEffect, useRef } from "react"
import { ChevronDown, Check } from "lucide-react"

/**
 * CustomCategoryDropdown component for category selection
 * @param {Object} props
 * @param {Array} props.options - Array of category options as strings
 * @param {string} props.value - Currently selected value
 * @param {Function} props.onChange - Callback when selection changes
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.required - Whether field is required
 * @param {string} props.id - Element ID for accessibility
 */
const CustomCategoryDropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select Category", 
  required = false,
  id = "category-dropdown"
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Ensure options is always an array
  const safeOptions = Array.isArray(options) ? options : []

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

  const handleSelect = (category) => {
    onChange({
      target: {
        value: category
      }
    })
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        id={id}
        onClick={toggleDropdown}
        className="w-full flex items-center justify-between px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={`${id}-label`}
      >
        <span className={value ? "" : "text-gray-500 dark:text-gray-400"}>
          {value || placeholder}
        </span>
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
          <ul className="py-1" role="listbox" aria-labelledby={`${id}-label`}>
            {safeOptions.map((option) => (
              <li 
                key={option} 
                role="option" 
                aria-selected={value === option}
              >
                <button
                  type="button"
                  onClick={() => handleSelect(option)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                >
                  <span>{option}</span>
                  {option === value && <Check className="h-4 w-4 text-blue-500" />}
                </button>
              </li>
            ))}
            {safeOptions.length === 0 && (
              <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                No categories available
              </li>
            )}
          </ul>
        </div>
      )}
      
      {/* Hidden native select for form submission */}
      {required && (
        <select 
          className="opacity-0 absolute h-0 w-0" 
          value={value} 
          required
          tabIndex={-1}
          onChange={() => {}}
        >
          <option value="">{placeholder}</option>
          {safeOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      )}
    </div>
  )
}

export default CustomCategoryDropdown