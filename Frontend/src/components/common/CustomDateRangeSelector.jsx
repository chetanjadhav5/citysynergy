import { useState, useEffect, useRef } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";

/**
 * CustomDateRangeSelector - A reusable component for selecting date ranges
 * @param {Object} props
 * @param {Object} props.value - Current date range value { startDate, endDate }
 * @param {Function} props.onChange - Callback when date range changes
 * @param {string} props.name - Field name for form submission
 * @param {boolean} props.error - Whether there's an error
 * @param {string} props.errorMessage - Error message to display
 * @param {boolean} props.required - Whether field is required
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.format - Date format for display (default: MM/DD/YYYY)
 * @param {string} props.className - Additional CSS classes
 */
const CustomDateRangeSelector = ({
  value = { startDate: null, endDate: null },
  onChange,
  name = "dateRange",
  error = false,
  errorMessage = "",
  required = false,
  placeholder = "Select date range",
  format = "MM/DD/YYYY",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [secondMonth, setSecondMonth] = useState(new Date(new Date().setMonth(new Date().getMonth() + 1)));
  const [hoverDate, setHoverDate] = useState(null);
  const [selectionMode, setSelectionMode] = useState(value.startDate ? "end" : "start");
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format date as MM/DD/YYYY
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    
    if (format === "MM/DD/YYYY") {
      return `${month}/${day}/${year}`;
    } else if (format === "DD/MM/YYYY") {
      return `${day}/${month}/${year}`;
    } else if (format === "YYYY-MM-DD") {
      return `${year}-${month}-${day}`;
    }
    return `${month}/${day}/${year}`;
  };

  // Display formatted date range
  const displayValue = () => {
    if (value.startDate && value.endDate) {
      return `${formatDate(value.startDate)} - ${formatDate(value.endDate)}`;
    } else if (value.startDate) {
      return `${formatDate(value.startDate)} - Select end date`;
    }
    return placeholder;
  };

  // Navigate to previous month
  const prevMonth = () => {
    const newCurrentMonth = new Date(currentMonth);
    newCurrentMonth.setMonth(newCurrentMonth.getMonth() - 1);
    setCurrentMonth(newCurrentMonth);
    
    const newSecondMonth = new Date(secondMonth);
    newSecondMonth.setMonth(newSecondMonth.getMonth() - 1);
    setSecondMonth(newSecondMonth);
  };

  // Navigate to next month
  const nextMonth = () => {
    const newCurrentMonth = new Date(currentMonth);
    newCurrentMonth.setMonth(newCurrentMonth.getMonth() + 1);
    setCurrentMonth(newCurrentMonth);
    
    const newSecondMonth = new Date(secondMonth);
    newSecondMonth.setMonth(newSecondMonth.getMonth() + 1);
    setSecondMonth(newSecondMonth);
  };

  // Generate calendar days for a month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startOffset = firstDay.getDay(); // 0 = Sunday
    
    const days = [];
    
    // Add previous month days
    for (let i = 0; i < startOffset; i++) {
      days.push({ date: null, isCurrentMonth: false });
    }
    
    // Add current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({
        date: currentDate,
        isCurrentMonth: true,
      });
    }
    
    // Fill remaining spots in grid (to make 6 rows x 7 columns)
    const totalCells = 42; // 6 rows x 7 columns
    while (days.length < totalCells) {
      days.push({ date: null, isCurrentMonth: false });
    }
    
    return days;
  };

  // Check if a date is in range
  const isInRange = (date) => {
    if (!date || !value.startDate) return false;
    
    if (value.endDate) {
      return date >= value.startDate && date <= value.endDate;
    }
    
    if (hoverDate) {
      const startDate = new Date(value.startDate);
      const hoverDateObj = new Date(hoverDate);
      return (
        (date >= startDate && date <= hoverDateObj) ||
        (date >= hoverDateObj && date <= startDate)
      );
    }
    
    return false;
  };

  // Handle date selection
  const handleDateClick = (date) => {
    if (!date) return;
    
    if (selectionMode === "start" || (selectionMode === "end" && date < value.startDate)) {
      onChange({
        target: {
          name,
          value: {
            startDate: date,
            endDate: null,
          },
        },
      });
      setSelectionMode("end");
    } else {
      onChange({
        target: {
          name,
          value: {
            startDate: value.startDate,
            endDate: date,
          },
        },
      });
      setSelectionMode("start");
      setTimeout(() => setIsOpen(false), 300);
    }
  };

  // Handle date hover for range preview
  const handleDateHover = (date) => {
    if (selectionMode === "end" && value.startDate && date) {
      setHoverDate(date);
    }
  };

  // Check if date is the start date
  const isStartDate = (date) => {
    if (!date || !value.startDate) return false;
    return date.getTime() === new Date(value.startDate).getTime();
  };

  // Check if date is the end date
  const isEndDate = (date) => {
    if (!date || !value.endDate) return false;
    return date.getTime() === new Date(value.endDate).getTime();
  };

  // Clear the date selection
  const clearSelection = (e) => {
    e.stopPropagation();
    onChange({
      target: {
        name,
        value: {
          startDate: null,
          endDate: null,
        },
      },
    });
    setSelectionMode("start");
  };

  // Month names for calendar headers
  const getMonthName = (date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  // Day names for calendar header
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

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
          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
          <span className={value.startDate ? "" : "text-gray-500 dark:text-gray-400"}>
            {displayValue()}
          </span>
        </div>
        <div className="flex items-center">
          {(value.startDate || value.endDate) && (
            <button
              type="button"
              onClick={clearSelection}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full mr-1"
            >
              <X className="h-3 w-3 text-gray-500" />
            </button>
          )}
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-4 w-auto">
          <div className="flex flex-col md:flex-row gap-4">
            {/* First Month */}
            <div className="calendar-month">
              <div className="flex justify-between items-center mb-2">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-500" />
                </button>
                <div className="text-sm font-medium">{getMonthName(currentMonth)}</div>
                <div className="w-4"></div> {/* Spacer for alignment */}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-xs text-gray-500 py-1">
                    {day}
                  </div>
                ))}
                {getDaysInMonth(currentMonth).map((dayObj, i) => (
                  <div
                    key={i}
                    className={`
                      text-center py-1 text-xs rounded-md cursor-pointer relative
                      ${!dayObj.isCurrentMonth ? "text-gray-400 dark:text-gray-600" : ""}
                      ${isStartDate(dayObj.date) ? "bg-blue-500 text-white" : ""}
                      ${isEndDate(dayObj.date) ? "bg-blue-500 text-white" : ""}
                      ${
                        isInRange(dayObj.date) && !isStartDate(dayObj.date) && !isEndDate(dayObj.date)
                          ? "bg-blue-100 dark:bg-blue-900"
                          : ""
                      }
                      ${dayObj.date ? "hover:bg-gray-100 dark:hover:bg-gray-700" : ""}
                    `}
                    onClick={() => handleDateClick(dayObj.date)}
                    onMouseEnter={() => handleDateHover(dayObj.date)}
                  >
                    {dayObj.date?.getDate()}
                  </div>
                ))}
              </div>
            </div>

            {/* Second Month */}
            <div className="calendar-month">
              <div className="flex justify-between items-center mb-2">
                <div className="w-4"></div> {/* Spacer for alignment */}
                <div className="text-sm font-medium">{getMonthName(secondMonth)}</div>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-xs text-gray-500 py-1">
                    {day}
                  </div>
                ))}
                {getDaysInMonth(secondMonth).map((dayObj, i) => (
                  <div
                    key={i}
                    className={`
                      text-center py-1 text-xs rounded-md cursor-pointer relative
                      ${!dayObj.isCurrentMonth ? "text-gray-400 dark:text-gray-600" : ""}
                      ${isStartDate(dayObj.date) ? "bg-blue-500 text-white" : ""}
                      ${isEndDate(dayObj.date) ? "bg-blue-500 text-white" : ""}
                      ${
                        isInRange(dayObj.date) && !isStartDate(dayObj.date) && !isEndDate(dayObj.date)
                          ? "bg-blue-100 dark:bg-blue-900"
                          : ""
                      }
                      ${dayObj.date ? "hover:bg-gray-100 dark:hover:bg-gray-700" : ""}
                    `}
                    onClick={() => handleDateClick(dayObj.date)}
                    onMouseEnter={() => handleDateHover(dayObj.date)}
                  >
                    {dayObj.date?.getDate()}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {required && (
        <input
          type="hidden"
          name={`${name}-start`}
          value={value.startDate ? formatDate(value.startDate) : ""}
          required
        />
      )}
      
      {error && errorMessage && (
        <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
      )}
    </div>
  );
};

export default CustomDateRangeSelector;