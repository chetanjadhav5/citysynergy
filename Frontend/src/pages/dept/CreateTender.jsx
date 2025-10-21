"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import Button from "../../components/dept/Button"
import CustomDateSelector from "../../components/common/CustomDateSelector"
import AsyncSelect from "react-select/async"
import Modal from "../../components/dept/Modal"
import apiClient from "../../utils/apiClient"
import { useToast } from "../../context/ToastContext"
import { format } from "date-fns"

const CreateTender = () => {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [formData, setFormData] = useState({
    Tender_by_Classification: "",
    Sanction_Date: null,
    Start_Date: null,
    Completion_Date: null,
    Sanction_Amount: "",
    Complete_Pending: "Pending",
    Locality: "",
    Local_Area: "",
    Zones: "",
    City: "",
    Pincode: "",
  })
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)

  // Selected items for AsyncSelect
  const [selectedLocality, setSelectedLocality] = useState(null)
  const [selectedLocalArea, setSelectedLocalArea] = useState(null)
  const [selectedZone, setSelectedZone] = useState(null)
  const [selectedCity, setSelectedCity] = useState(null)
  const [selectedPincode, setSelectedPincode] = useState(null)

  // Update form data when selections change
  useEffect(() => {
    if (selectedLocality) {
      setFormData((prev) => ({ ...prev, Locality: selectedLocality.locality }))
    }
    if (selectedLocalArea) {
      setFormData((prev) => ({ ...prev, Local_Area: selectedLocalArea.name }))
    }
    if (selectedZone) {
      setFormData((prev) => ({ ...prev, Zones: selectedZone.name }))
    }
    if (selectedCity) {
      setFormData((prev) => ({ ...prev, City: selectedCity.name }))
    }
    if (selectedPincode) {
      setFormData((prev) => ({ ...prev, Pincode: selectedPincode.pincode }))
    }
  }, [selectedLocality, selectedLocalArea, selectedZone, selectedCity, selectedPincode])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDateChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value ? format(new Date(value), "yyyy-MM-dd") : null,
    }))
  }

  // AsyncSelect load options functions
  const loadLocalities = async (inputValue) => {
    try {
      const response = await apiClient.get(`/location/search-locality?locality=${inputValue}`)
      return response.data || []
    } catch (error) {
      console.error("Error loading localities:", error)
      return []
    }
  }

  const loadLocalAreas = async (inputValue) => {
    try {
      const response = await apiClient.get(`/location/search-local-area?localArea=${inputValue}`)
      return response.data || []
    } catch (error) {
      console.error("Error loading local areas:", error)
      return []
    }
  }

  const loadZones = async (inputValue) => {
    try {
      const response = await apiClient.get(`/location/search-zone?zone=${inputValue}`)
      return response.data || []
    } catch (error) {
      console.error("Error loading zones:", error)
      return []
    }
  }

  const loadCities = async (inputValue) => {
    try {
      const response = await apiClient.get(`/location/search-city?city=${inputValue}`)
      return response.data || []
    } catch (error) {
      console.error("Error loading cities:", error)
      return []
    }
  }

  const loadPincodes = async (inputValue) => {
    try {
      const response = await apiClient.get(`/location/search-pincode?pincode=${inputValue}`)
      return response.data || []
    } catch (error) {
      console.error("Error loading pincodes:", error)
      return []
    }
  }

  const validateForm = () => {
    if (!formData.Tender_by_Classification) {
      setError("Tender description is required")
      return false
    }
    if (!formData.Sanction_Date) {
      setError("Sanction date is required")
      return false
    }
    if (!formData.Start_Date) {
      setError("Start date is required")
      return false
    }
    if (!formData.Completion_Date) {
      setError("Completion date is required")
      return false
    }
    if (!formData.Sanction_Amount) {
      setError("Sanction amount is required")
      return false
    }
    if (!formData.Locality || !formData.Local_Area || !formData.Zones || !formData.City || !formData.Pincode) {
      setError("All location fields are required")
      return false
    }
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      setIsConfirmModalOpen(true)
    }
  }

  const submitTender = async () => {
    setIsSubmitting(true)
    setError("")

    try {
      const response = await apiClient.post("/tender/addtendermain", formData)

      if (response.data) {
        addToast("Tender added successfully", "success")

        // Check if there are clashes
        if (response.data.clashes && Object.keys(response.data.clashes).length > 0) {
          // Navigate to clashes page if there are clashes
          navigate("/dashboard/dept/clashes")
        } else {
          // Navigate back to tenders page if no clashes
          navigate("/dashboard/dept/tenders")
        }
      }
    } catch (err) {
      console.error("Error adding tender:", err)
      setError(err.response?.data?.message || "Failed to add tender")
      addToast(err.response?.data?.message || "Failed to add tender", "error")
    } finally {
      setIsSubmitting(false)
      setIsConfirmModalOpen(false)
    }
  }

  return (
    <div className="p-2 md:p-6 dark:bg-gray-900 dark:text-gray-100">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/dashboard/dept/tenders")}
          className="p-2 mr-2 rounded-md text-gray-600 hover:bg-sky-100 hover:text-sky-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-sky-400"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Create Tender</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="Tender_by_Classification"
                className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
              >
                Tender Description*
              </label>
              <textarea
                id="Tender_by_Classification"
                name="Tender_by_Classification"
                value={formData.Tender_by_Classification}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label
                htmlFor="Sanction_Amount"
                className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
              >
                Sanction Amount (₹)*
              </label>
              <input
                type="number"
                id="Sanction_Amount"
                name="Sanction_Amount"
                value={formData.Sanction_Amount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label
                htmlFor="Sanction_Date"
                className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
              >
                Sanction Date*
              </label>
              <CustomDateSelector
                name="Sanction_Date"
                value={formData.Sanction_Date}
                onChange={handleDateChange}
                format="YYYY-MM-DD"
                required
              />
            </div>

            <div>
              <label htmlFor="Start_Date" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Start Date*
              </label>
              <CustomDateSelector
                name="Start_Date"
                value={formData.Start_Date}
                onChange={handleDateChange}
                format="YYYY-MM-DD"
                required
              />
            </div>

            <div>
              <label
                htmlFor="Completion_Date"
                className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
              >
                Completion Date*
              </label>
              <CustomDateSelector
                name="Completion_Date"
                value={formData.Completion_Date}
                onChange={handleDateChange}
                format="YYYY-MM-DD"
                required
              />
            </div>

            <div>
              <label
                htmlFor="Complete_Pending"
                className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
              >
                Status
              </label>
              <select
                id="Complete_Pending"
                name="Complete_Pending"
                value={formData.Complete_Pending}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Complete">Complete</option>
              </select>
            </div>

            <div>
              <label htmlFor="locality" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Locality*
              </label>
              <AsyncSelect
                id="locality"
                cacheOptions
                defaultOptions
                loadOptions={loadLocalities}
                onChange={setSelectedLocality}
                getOptionLabel={(option) => option.locality}
                getOptionValue={(option) => option.id}
                placeholder="Search for locality..."
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: document.documentElement.classList.contains("dark") ? "#374151" : "white",
                    borderColor: document.documentElement.classList.contains("dark") ? "#4B5563" : "#D1D5DB",
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: document.documentElement.classList.contains("dark") ? "#1F2937" : "white",
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused
                      ? document.documentElement.classList.contains("dark")
                        ? "#374151"
                        : "#F3F4F6"
                      : document.documentElement.classList.contains("dark")
                        ? "#1F2937"
                        : "white",
                    color: document.documentElement.classList.contains("dark") ? "#E5E7EB" : "#1F2937",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: document.documentElement.classList.contains("dark") ? "#E5E7EB" : "#1F2937",
                  }),
                }}
              />
            </div>

            <div>
              <label htmlFor="localArea" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Local Area*
              </label>
              <AsyncSelect
                id="localArea"
                cacheOptions
                defaultOptions
                loadOptions={loadLocalAreas}
                onChange={setSelectedLocalArea}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.id}
                placeholder="Search for local area..."
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: document.documentElement.classList.contains("dark") ? "#374151" : "white",
                    borderColor: document.documentElement.classList.contains("dark") ? "#4B5563" : "#D1D5DB",
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: document.documentElement.classList.contains("dark") ? "#1F2937" : "white",
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused
                      ? document.documentElement.classList.contains("dark")
                        ? "#374151"
                        : "#F3F4F6"
                      : document.documentElement.classList.contains("dark")
                        ? "#1F2937"
                        : "white",
                    color: document.documentElement.classList.contains("dark") ? "#E5E7EB" : "#1F2937",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: document.documentElement.classList.contains("dark") ? "#E5E7EB" : "#1F2937",
                  }),
                }}
              />
            </div>

            <div>
              <label htmlFor="zone" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Zone*
              </label>
              <AsyncSelect
                id="zone"
                cacheOptions
                defaultOptions
                loadOptions={loadZones}
                onChange={setSelectedZone}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.id}
                placeholder="Search for zone..."
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: document.documentElement.classList.contains("dark") ? "#374151" : "white",
                    borderColor: document.documentElement.classList.contains("dark") ? "#4B5563" : "#D1D5DB",
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: document.documentElement.classList.contains("dark") ? "#1F2937" : "white",
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused
                      ? document.documentElement.classList.contains("dark")
                        ? "#374151"
                        : "#F3F4F6"
                      : document.documentElement.classList.contains("dark")
                        ? "#1F2937"
                        : "white",
                    color: document.documentElement.classList.contains("dark") ? "#E5E7EB" : "#1F2937",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: document.documentElement.classList.contains("dark") ? "#E5E7EB" : "#1F2937",
                  }),
                }}
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                City*
              </label>
              <AsyncSelect
                id="city"
                cacheOptions
                defaultOptions
                loadOptions={loadCities}
                onChange={setSelectedCity}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.id}
                placeholder="Search for city..."
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: document.documentElement.classList.contains("dark") ? "#374151" : "white",
                    borderColor: document.documentElement.classList.contains("dark") ? "#4B5563" : "#D1D5DB",
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: document.documentElement.classList.contains("dark") ? "#1F2937" : "white",
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused
                      ? document.documentElement.classList.contains("dark")
                        ? "#374151"
                        : "#F3F4F6"
                      : document.documentElement.classList.contains("dark")
                        ? "#1F2937"
                        : "white",
                    color: document.documentElement.classList.contains("dark") ? "#E5E7EB" : "#1F2937",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: document.documentElement.classList.contains("dark") ? "#E5E7EB" : "#1F2937",
                  }),
                }}
              />
            </div>

            <div>
              <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Pincode*
              </label>
              <AsyncSelect
                id="pincode"
                cacheOptions
                defaultOptions
                loadOptions={loadPincodes}
                onChange={setSelectedPincode}
                getOptionLabel={(option) => option.pincode}
                getOptionValue={(option) => option.id}
                placeholder="Search for pincode..."
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: document.documentElement.classList.contains("dark") ? "#374151" : "white",
                    borderColor: document.documentElement.classList.contains("dark") ? "#4B5563" : "#D1D5DB",
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: document.documentElement.classList.contains("dark") ? "#1F2937" : "white",
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused
                      ? document.documentElement.classList.contains("dark")
                        ? "#374151"
                        : "#F3F4F6"
                      : document.documentElement.classList.contains("dark")
                        ? "#1F2937"
                        : "white",
                    color: document.documentElement.classList.contains("dark") ? "#E5E7EB" : "#1F2937",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: document.documentElement.classList.contains("dark") ? "#E5E7EB" : "#1F2937",
                  }),
                }}
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

          <div className="flex justify-end space-x-4 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/dashboard/dept/tenders")}
              className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="dark:bg-sky-600 dark:hover:bg-sky-700 dark:text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Tender"}
            </Button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="Confirm Tender Creation">
        <div className="p-4">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Are you sure you want to create this tender? This action may identify potential clashes with other
            department tenders.
          </p>
          <div className="flex justify-end space-x-4">
            <Button
              variant="secondary"
              onClick={() => setIsConfirmModalOpen(false)}
              className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={submitTender}
              disabled={isSubmitting}
              className="dark:bg-sky-600 dark:hover:bg-sky-700 dark:text-white"
            >
              {isSubmitting ? "Creating..." : "Confirm"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default CreateTender

