import { useState, useEffect, useRef } from "react"
import { ChevronDown, Check } from "lucide-react"

/**
 * Universal CustomDropdown component that can be used for any selection purpose
 * @param {Object} props
 * @param {Array} props.options - Array of options. Can be strings or objects with value and label properties
 * @param {string|number} props.value - Currently selected value
 * @param {Function} props.onChange - Callback when selection changes (receives event-like object with target.name and target.value)
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.required - Whether field is required
 * @param {string} props.name - Field name for form submission
 * @param {string} props.id - Element ID for accessibility
 * @param {boolean} props.error - Whether there's an error
 * @param {string} props.errorMessage - Error message to display
 * @param {string} props.labelKey - Key to use as label when options are objects (default: "label")
 * @param {string} props.valueKey - Key to use as value when options are objects (default: "value")
 * @param {string} props.className - Additional CSS classes for the main button
 */
const CustomDropdown = ({ 
  options,
  value,
  onChange,
  placeholder = "Select an option",
  required = false,
  name = "dropdown",
  id,
  error = false,
  errorMessage = "",
  labelKey = "label",
  valueKey = "value",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const elementId = id || `dropdown-${name}`

  // Ensure options is always an array
  const safeOptions = Array.isArray(options) ? options : []

  // Normalize options to always work with objects
  const normalizedOptions = safeOptions.map(option => {
    if (typeof option === 'object' && option !== null) {
      return {
        label: option[labelKey] || String(option[valueKey]),
        value: option[valueKey]
      }
    } else {
      return {
        label: String(option),
        value: option
      }
    }
  })

  // Get current selected option label
  const getSelectedLabel = () => {
    const selected = normalizedOptions.find(option => option.value === value)
    return selected ? selected.label : ''
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

  const handleSelect = (optionValue) => {
    onChange({
      target: {
        name,
        value: optionValue
      }
    })
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        id={elementId}
        onClick={toggleDropdown}
        className={`w-full flex items-center justify-between px-3 py-2 text-left border ${
          error ? "border-red-500" : "border-gray-300 dark:border-gray-600"
        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${className}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={`${elementId}-label`}
      >
        <span className={value ? "" : "text-gray-500 dark:text-gray-400"}>
          {getSelectedLabel() || placeholder}
        </span>
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
          <ul className="py-1" role="listbox" aria-labelledby={`${elementId}-label`}>
            {normalizedOptions.map((option) => (
              <li 
                key={String(option.value)} 
                role="option" 
                aria-selected={value === option.value}
              >
                <button
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                >
                  <span>{option.label}</span>
                  {option.value === value && <Check className="h-4 w-4 text-blue-500" />}
                </button>
              </li>
            ))}
            {normalizedOptions.length === 0 && (
              <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                No options available
              </li>
            )}
          </ul>
        </div>
      )}
      
      {/* Hidden native select for form submission */}
      {required && (
        <select 
          className="opacity-0 absolute h-0 w-0" 
          value={value || ''} 
          name={name}
          required
          tabIndex={-1}
          onChange={() => {}}
        >
          <option value="">{placeholder}</option>
          {normalizedOptions.map(option => (
            <option key={String(option.value)} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
      
      {error && errorMessage && (
        <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
      )}
    </div>
  )
}

export default CustomDropdown