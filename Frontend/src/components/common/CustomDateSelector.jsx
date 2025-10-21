"use client"

import { useState, useEffect, useRef } from "react"
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react"

/**
 * CustomDateSelector - A reusable component for selecting a single date
 * @param {Object} props
 * @param {Date|string} props.value - Current date value
 * @param {Function} props.onChange - Callback when date changes
 * @param {string} props.name - Field name for form submission
 * @param {boolean} props.error - Whether there's an error
 * @param {string} props.errorMessage - Error message to display
 * @param {boolean} props.required - Whether field is required
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.format - Date format for display (default: MM/DD/YYYY)
 * @param {string} props.className - Additional CSS classes
 */
const CustomDateSelector = ({
  value = null,
  onChange,
  name = "date",
  error = false,
  errorMessage = "",
  required = false,
  placeholder = "Select date",
  format = "MM/DD/YYYY",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const dropdownRef = useRef(null)

  // Update the CustomDateSelector to include month/year selection functionality
  // Replace the calendar-month section with this enhanced version that allows clicking on month/year to drill up

  // In the component, add these new state variables after the existing state declarations:
  const [viewMode, setViewMode] = useState("days") // 'days', 'months', 'years'
  const [decadeStart, setDecadeStart] = useState(Math.floor(currentMonth.getFullYear() / 10) * 10)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Format date as MM/DD/YYYY
  const formatDate = (date) => {
    if (!date) return ""
    const d = new Date(date)
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    const year = d.getFullYear()

    if (format === "MM/DD/YYYY") {
      return `${month}/${day}/${year}`
    } else if (format === "DD/MM/YYYY") {
      return `${day}/${month}/${year}`
    } else if (format === "YYYY-MM-DD") {
      return `${year}-${month}-${day}`
    }
    return `${month}/${day}/${year}`
  }

  // Display formatted date
  const displayValue = () => {
    if (value) {
      return formatDate(value)
    }
    return placeholder
  }

  // Replace the calendar rendering section with this enhanced version:
  const getMonthName = (date) => {
    return date.toLocaleString("default", { month: "long", year: "numeric" })
  }

  const getMonthShortName = (monthIndex) => {
    return new Date(2000, monthIndex, 1).toLocaleString("default", { month: "short" })
  }

  // Navigate to previous month/year/decade based on current view
  const handlePrevious = () => {
    if (viewMode === "days") {
      const newCurrentMonth = new Date(currentMonth)
      newCurrentMonth.setMonth(newCurrentMonth.getMonth() - 1)
      setCurrentMonth(newCurrentMonth)
    } else if (viewMode === "months") {
      const newCurrentMonth = new Date(currentMonth)
      newCurrentMonth.setFullYear(newCurrentMonth.getFullYear() - 1)
      setCurrentMonth(newCurrentMonth)
    } else if (viewMode === "years") {
      setDecadeStart(decadeStart - 10)
    }
  }

  // Navigate to next month/year/decade based on current view
  const handleNext = () => {
    if (viewMode === "days") {
      const newCurrentMonth = new Date(currentMonth)
      newCurrentMonth.setMonth(newCurrentMonth.getMonth() + 1)
      setCurrentMonth(newCurrentMonth)
    } else if (viewMode === "months") {
      const newCurrentMonth = new Date(currentMonth)
      newCurrentMonth.setFullYear(newCurrentMonth.getFullYear() + 1)
      setCurrentMonth(newCurrentMonth)
    } else if (viewMode === "years") {
      setDecadeStart(decadeStart + 10)
    }
  }

  // Handle month selection when in month view
  const handleMonthSelect = (monthIndex) => {
    const newDate = new Date(currentMonth)
    newDate.setMonth(monthIndex)
    setCurrentMonth(newDate)
    setViewMode("days")
  }

  // Handle year selection when in year view
  const handleYearSelect = (year) => {
    const newDate = new Date(currentMonth)
    newDate.setFullYear(year)
    setCurrentMonth(newDate)
    setViewMode("months")
  }

  // Generate calendar days for a month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startOffset = firstDay.getDay() // 0 = Sunday

    const days = []

    // Add previous month days
    for (let i = 0; i < startOffset; i++) {
      days.push({ date: null, isCurrentMonth: false })
    }

    // Add current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i)
      days.push({
        date: currentDate,
        isCurrentMonth: true,
      })
    }

    // Fill remaining spots in grid (to make 6 rows x 7 columns)
    const totalCells = 42 // 6 rows x 7 columns
    while (days.length < totalCells) {
      days.push({ date: null, isCurrentMonth: false })
    }

    return days
  }

  // Check if a date is selected
  const isSelected = (date) => {
    if (!date || !value) return false
    const selectedDate = new Date(value)
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }

  // Handle date selection
  const handleDateClick = (date) => {
    if (!date) return

    onChange({
      target: {
        name,
        value: date,
      },
    })

    setTimeout(() => setIsOpen(false), 300)
  }

  // Clear the date selection
  const clearSelection = (e) => {
    e.stopPropagation()
    onChange({
      target: {
        name,
        value: null,
      },
    })
  }

  // Day names for calendar header
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 text-left border ${
          error ? "border-red-500" : "border-gray-300 dark:border-gray-600"
        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${className}`}
      >
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
          <span className={value ? "" : "text-gray-500 dark:text-gray-400"}>{displayValue()}</span>
        </div>
        <div className="flex items-center">
          {value && (
            <button
              type="button"
              onClick={clearSelection}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full mr-1"
            >
              <X className="h-3 w-3 text-gray-500 dark:text-gray-400" />
            </button>
          )}
          <ChevronDown className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-4 w-auto">
          {/* Replace the calendar rendering in the JSX with this enhanced version: */}
          <div className="calendar-month">
            <div className="flex justify-between items-center mb-2">
              <button
                type="button"
                onClick={handlePrevious}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <ChevronLeft className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>

              {viewMode === "days" && (
                <button
                  onClick={() => setViewMode("months")}
                  className="text-sm font-medium dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
                >
                  {getMonthName(currentMonth)}
                </button>
              )}

              {viewMode === "months" && (
                <button
                  onClick={() => setViewMode("years")}
                  className="text-sm font-medium dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
                >
                  {currentMonth.getFullYear()}
                </button>
              )}

              {viewMode === "years" && (
                <span className="text-sm font-medium dark:text-white">
                  {decadeStart} - {decadeStart + 9}
                </span>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {viewMode === "days" && (
              <div className="grid grid-cols-7 gap-1">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-xs text-gray-500 dark:text-gray-400 py-1">
                    {day}
                  </div>
                ))}
                {getDaysInMonth(currentMonth).map((dayObj, i) => (
                  <div
                    key={i}
                    className={`
                      text-center py-1 text-xs rounded-md cursor-pointer relative
                      ${!dayObj.isCurrentMonth ? "text-gray-400 dark:text-gray-600" : ""}
                      ${isSelected(dayObj.date) ? "bg-blue-500 text-white" : ""}
                      ${dayObj.date ? "hover:bg-gray-100 dark:hover:bg-gray-700" : ""}
                    `}
                    onClick={() => dayObj.date && handleDateClick(dayObj.date)}
                  >
                    {dayObj.date?.getDate()}
                  </div>
                ))}
              </div>
            )}

            {viewMode === "months" && (
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 12 }, (_, i) => (
                  <div
                    key={i}
                    className={`
                      text-center py-2 rounded-md cursor-pointer
                      hover:bg-gray-100 dark:hover:bg-gray-700
                      ${currentMonth.getMonth() === i ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" : ""}
                    `}
                    onClick={() => handleMonthSelect(i)}
                  >
                    {getMonthShortName(i)}
                  </div>
                ))}
              </div>
            )}

            {viewMode === "years" && (
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 10 }, (_, i) => (
                  <div
                    key={i}
                    className={`
                      text-center py-2 rounded-md cursor-pointer
                      hover:bg-gray-100 dark:hover:bg-gray-700
                      ${currentMonth.getFullYear() === decadeStart + i ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" : ""}
                    `}
                    onClick={() => handleYearSelect(decadeStart + i)}
                  >
                    {decadeStart + i}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {required && <input type="hidden" name={name} value={value ? formatDate(value) : ""} required />}

      {error && errorMessage && <p className="text-sm text-red-500 mt-1">{errorMessage}</p>}
    </div>
  )
}

export default CustomDateSelector

