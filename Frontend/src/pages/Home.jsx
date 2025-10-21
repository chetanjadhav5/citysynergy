"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import { Link as ScrollLink } from "react-scroll";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../context/LoadingContext";
import { useToast } from "../context/ToastContext";
import AsyncSelect from "react-select/async";
import PropTypes from "prop-types";
import Modal from "../components/dept/Modal";
import HomeModal from "./HomeModal";
import CustomDropdown from "../components/common/CustomDropdown";
import apiClient from "../utils/apiClient";
import {
  Search,
  FileText,
  MapPin,
  AlertCircle,
  Plus,
  X,
  Upload,
  CheckCircle,
  Sun,
  Moon,
} from "lucide-react";
import "./home.css";
import StatusModal from "../components/common/StatusModal";

export const Home = () => {
  const navigate = useNavigate();
  const { setIsLoading } = useLoading();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  // State for navbar and sections
  const [sticky, setSticky] = useState(false);
  // Renamed pincode to selectedPincode for AsyncSelect compatibility
  const [selectedPincode, setSelectedPincode] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedLocalArea, setSelectedLocalArea] = useState(null);
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [username, setUsername] = useState("User");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef(null);
  const [profileImage, setProfileImage] = useState(null);
  const [departments, setDepartments] = useState([]);
  // Add to existing state declarations
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [issueId, setIssueId] = useState("");
  const [issueDetails, setIssueDetails] = useState(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // State for issue form modal
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueFormData, setIssueFormData] = useState({
    raisedByEmailID: "",
    raisedByName: "",
    IssueCategory: "incomplete_work", // Default value
    deptId: "",
    IssueName: "",
    IssueDescription: "",
    address: "",
    pincode: "",
    locality: "",
    image: null,
  });

  const [previewImage, setPreviewImage] = useState(null);

  // State for success modal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [issueResponse, setIssueResponse] = useState(null);

  // Categories for dropdown
  const issueCategories = [
    { value: "incomplete_work", label: "Incomplete Work" },
    { value: "damaged_infrastructure", label: "Damaged Infrastructure" },
    { value: "safety_hazard", label: "Safety Hazard" },
    { value: "maintenance_required", label: "Maintenance Required" },
    { value: "other", label: "Other" },
  ];

  /**
   * Loads departments for the issue reporting form.
   * @param {string} inputValue - The current input value for filtering departments.
   * @returns {Promise<Array<{value: string, label: string, isDisabled?: boolean}>>} A promise that resolves to an array of department options.
   */
  const loadDepartments = (inputValue) => {
    return new Promise((resolve) => {
      // Don't allow numbers
      if (/\d/.test(inputValue)) {
        resolve(departments);
        return;
      }

      if (!inputValue) {
        resolve(departments);
        return;
      }

      apiClient
        .get(`/issues/search-department?search=${inputValue}`)
        .then((response) => {
          if (response.data.length === 0) {
            resolve([
              { value: "", label: "Department not found", isDisabled: true },
            ]);
            return;
          }
          const options = response.data.map((dept) => ({
            value: dept.deptId,
            label: dept.deptName,
          }));
          resolve(options);
        })
        .catch((error) => {
          console.error("Error fetching departments:", error);
          resolve(departments);
        });
    });
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await apiClient.get("/issues/search-department");
        const options = response.data.map((dept) => ({
          value: dept.deptId,
          label: dept.deptName,
        }));
        setDepartments(options);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();
  }, []);

  /**
   * Loads pincodes for the issue reporting form.
   * @param {string} inputValue - The current input value for filtering pincodes.
   * @returns {Promise<Array<{value: string, label: string}>>} A promise that resolves to an array of pincode options.
   */
  const loadPincodes = (inputValue) => {
    return new Promise((resolve) => {
      if (!inputValue) {
        resolve([]);
        return;
      }

      apiClient
        .get(`/issues/search-pincode?pincode=${inputValue}`)
        .then((response) => {
          const options = response.data.map((item) => ({
            value: item.pincode,
            label: item.pincode,
          }));
          resolve(options);
        })
        .catch((error) => {
          console.error("Error fetching pincodes:", error);
          resolve([]);
        });
    });
  };

  /**
   * Loads localities for the issue reporting form.
   * @param {string} inputValue - The current input value for filtering localities.
   * @returns {Promise<Array<{value: string, label: string}>>} A promise that resolves to an array of locality options.
   */
  const loadLocalities = (inputValue) => {
    return new Promise((resolve) => {
      if (!inputValue) {
        resolve([]);
        return;
      }

      apiClient
        .get(`/issues/search-locality?locality=${inputValue}`)
        .then((response) => {
          const options = response.data.map((item) => ({
            value: item.id,
            label: item.locality,
          }));
          resolve(options);
        })
        .catch((error) => {
          console.error("Error fetching localities:", error);
          resolve([]);
        });
    });
  };

  const handleDepartmentChange = (selectedOption) => {
    setIssueFormData((prev) => ({
      ...prev,
      deptId: selectedOption ? selectedOption.value : "",
    }));
  };

  const handlePincodeChange = (selectedOption) => {
    setIssueFormData((prev) => ({
      ...prev,
      pincode: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleLocalityChange = (selectedOption) => {
    setIssueFormData((prev) => ({
      ...prev,
      locality: selectedOption ? selectedOption.value : "",
    }));
  };

  // Check for dark mode preference
  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Handle scroll for sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch profile image
  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const response = await apiClient.get("/profile/image/current");
        if (response.data && response.data.profileImage) {
          setProfileImage(response.data.profileImage);
        }
        if (response.data && response.data.username) {
          setUsername(response.data.username);
        }
      } catch (error) {
        console.error("Error fetching profile image:", error);
      }
    };

    fetchProfileImage();
  }, []);

  // Handle click outside profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await apiClient.post("/auth/logout");
      navigate("/login");
      showToast("Logged out successfully", "success");
    } catch (error) {
      console.error("Error logging out:", error);
      showToast("Failed to log out", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToDashboard = () => {
    navigate("/dashboard");
  };

  /**
   * Loads pincodes for the "Discover Tenders" section.
   * @param {string} inputValue - The current input value for filtering pincodes.
   * @returns {Promise<Array<{value: string, label: string}>>} A promise that resolves to an array of pincode options.
   */
  const loadTenderPincodes = async (inputValue) => {
    if (!inputValue) {
      return [];
    }
    try {
      // API: hpgsearch/pincodes?query=422
      const response = await apiClient.get(
        `/hpgsearch/pincodes?query=${inputValue}`
      );
      if (response.data && response.data.success) {
        return response.data.data.map((pincode) => ({
          value: pincode,
          label: pincode,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching tender pincodes:", error);
      return [];
    }
  };

  /**
   * Fetches areas based on the selected pincode for the "Discover Tenders" section.
   * @param {string} inputValue - The current input value for filtering areas.
   * @returns {Promise<Array<{value: string, label: string}>>} A promise that resolves to an array of area options.
   */
  const fetchAreas = async (inputValue) => {
    if (!selectedPincode) {
      return [];
    }
    setError(null);
    try {
      setIsLoading(true);
      // API: hpgsearch/areas?pincode=422100
      const response = await apiClient.get(
        `/hpgsearch/areas?pincode=${selectedPincode.value}`
      );

      if (response.data && response.data.success) {
        const areas = response.data.data;
        return areas
          .filter((area) =>
            area?.toLowerCase().includes(inputValue?.toLowerCase())
          )
          .map((area) => ({
            value: area,
            label: area,
          }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching areas:", error);
      setError("Failed to fetch areas. Please try again.");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetches local areas based on the selected pincode and area for the "Discover Tenders" section.
   * @param {string} inputValue - The current input value for filtering local areas.
   * @returns {Promise<Array<{value: string, label: string}>>} A promise that resolves to an array of local area options.
   */
  const fetchLocalAreas = async (inputValue) => {
    if (!selectedPincode || !selectedArea) {
      return [];
    }
    setError(null);
    try {
      setIsLoading(true);
      // API: /hpgsearch/local-areas?pincode=422100&area=West%20Zone&query=j
      const response = await apiClient.get(
        `/hpgsearch/local-areas?pincode=${
          selectedPincode.value
        }&area=${encodeURIComponent(selectedArea.value)}&query=${inputValue}`
      );

      if (response.data && response.data.success) {
        const localAreas = response.data.data;
        return localAreas
          .filter((area) =>
            area?.toLowerCase().includes(inputValue?.toLowerCase())
          )
          .map((area) => ({
            value: area,
            label: area,
          }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching local areas:", error);
      setError("Failed to fetch local areas. Please try again.");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles the search for tenders based on selected pincode, area, and local area.
   * @param {Event} e - The form submission event.
   */
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!selectedPincode || !selectedArea || !selectedLocalArea) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setIsLoading(true);
      // API: /hpgsearch/search?pincode=422100&area=West%20Zone&localArea=JailRoad
      const response = await apiClient.get(
        `/hpgsearch/search?pincode=${
          selectedPincode.value
        }&area=${encodeURIComponent(
          selectedArea.value
        )}&localArea=${encodeURIComponent(selectedLocalArea.value)}`
      );

      if (response.data && response.data.success) {
        // Assuming the response data directly contains the tenders array
        setTenders(response.data.data);
      } else {
        setTenders([]);
      }
    } catch (error) {
      console.error("Error fetching tenders:", error);
      setError("Failed to fetch tenders. Please try again.");
      setTenders([]);
    } finally {
      setIsLoading(false);
      setLoading(false); // Set loading to false here as well
    }
  };

  // Effect to clear dependent dropdowns when parent dropdown changes
  useEffect(() => {
    if (!selectedPincode) {
      setSelectedArea(null);
      setSelectedLocalArea(null);
    }
  }, [selectedPincode]);

  useEffect(() => {
    if (!selectedArea) {
      setSelectedLocalArea(null);
    }
  }, [selectedArea]);

  const handleIssueFormChange = (e) => {
    const { name, value } = e.target;
    setIssueFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDropdownChange = (e) => {
    const { name, value } = e.target;
    setIssueFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIssueFormData((prev) => ({
        ...prev,
        image: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setIssueFormData((prev) => ({
      ...prev,
      image: null,
    }));
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (
      !issueFormData.raisedByEmailID ||
      !issueFormData.raisedByName ||
      !issueFormData.deptId ||
      !issueFormData.IssueName ||
      !issueFormData.IssueDescription ||
      !issueFormData.address ||
      !issueFormData.pincode ||
      !issueFormData.locality
    ) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    try {
      setIsLoading(true);

      // Create FormData object for multipart/form-data
      const formData = new FormData();
      Object.keys(issueFormData).forEach((key) => {
        if (key === "image" && issueFormData[key]) {
          formData.append(key, issueFormData[key]);
        } else if (key !== "image") {
          formData.append(key, issueFormData[key]);
        }
      });

      const response = await apiClient.post("/issues/raiseIssue", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setIssueResponse(response.data);
      setIsIssueModalOpen(false);
      setIsSuccessModalOpen(true);

      // Reset form
      setIssueFormData({
        raisedByEmailID: "",
        raisedByName: "",
        IssueCategory: "incomplete_work",
        deptId: "",
        IssueName: "",
        IssueDescription: "",
        address: "",
        pincode: "",
        locality: "",
        image: null,
      });
      setPreviewImage(null);
    } catch (error) {
      console.error("Error submitting issue:", error);
      showToast("Failed to submit issue. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const renderIssueStatusSteps = (status) => {
    const steps = [
      { key: "raised", label: "Raised" },
      { key: "in_review", label: "In Review" },
      { key: "accepted", label: "Accepted" },
      { key: "pending", label: "Pending" },
      { key: "working", label: "Working" },
      { key: "resolved", label: "Resolved" },
    ];

    // Find the last completed step
    let lastCompletedIndex = -1;
    for (let i = 0; i < steps.length; i++) {
      if (status[steps[i].key]) {
        lastCompletedIndex = i;
      } else {
        break;
      }
    }

    return (
      <>
        {/* Progress line that connects through circles */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-green-500 -translate-y-1/2 transition-all duration-500 z-0"
          style={{
            width: `${
              lastCompletedIndex >= 0
                ? (lastCompletedIndex / (steps.length - 1)) * 100
                : 0
            }%`,
          }}
        ></div>

        {steps.map((step, index) => (
          <div key={step.key} className="flex flex-col items-center z-10">
            <div
              className={`w-3 h-3 rounded-full ${
                index <= lastCompletedIndex
                  ? "bg-green-500"
                  : index === lastCompletedIndex + 1
                  ? "bg-blue-500"
                  : "bg-gray-300"
              } z-10 transition-colors duration-300`}
            ></div>
            <span
              className={`text-xs mt-1 ${
                index <= lastCompletedIndex
                  ? "text-green-600 font-medium"
                  : index === lastCompletedIndex + 1
                  ? "text-blue-600 font-medium"
                  : "text-gray-500"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </>
    );
  };

  // Add with other functions
  const handleCheckStatus = async (e) => {
    e.preventDefault();
    if (!issueId) {
      showToast("Please enter Issue ID", "error");
      return;
    }

    setIsCheckingStatus(true);
    try {
      const response = await apiClient.get(
        `issues/get-issue-details/${issueId}`
      );
      setIssueDetails(response.data.issue);
    } catch (error) {
      console.error("Error fetching issue details:", error);
      showToast(
        "Failed to fetch issue details. Please check the Issue ID.",
        "error"
      );
    } finally {
      setIsCheckingStatus(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 ">
      <Navbar sticky={sticky} />

      {/* Profile Image in top right */}

      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="fixed bottom-6 left-6 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg z-50 hover:scale-110 transition-transform"
        aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-blue-700" />
        )}
      </button>

      {/* Hero Section */}
      <section
        id="home"
        className="bgimg min-h-screen flex items-center justify-center relative"
      >
        <div className="overlay bg-black bg-opacity-50"></div>
        <div className="text-center z-10 px-4 max-w-5xl mx-auto">
          <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white transition-all mb-6">
            CITY SYNERGY
          </h1>
          <p className="text-xl sm:text-2xl text-white mt-2 mb-8 max-w-3xl mx-auto">
            Connecting departments, empowering citizens, and building smarter
            cities together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <ScrollLink
              to="knowtenders"
              smooth={true}
              duration={500}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg cursor-pointer transition-all flex items-center justify-center"
            >
              <Search className="w-5 h-5 mr-2" />
              Find Local Tenders
            </ScrollLink>
            <button
              onClick={() => setIsIssueModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg cursor-pointer transition-all flex items-center justify-center"
            >
              <AlertCircle className="w-5 h-5 mr-2" />
              Report an Issue
            </button>
            <button
              onClick={() => setIsStatusModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg cursor-pointer transition-all flex items-center justify-center"
            >
              <Search className="w-5 h-5 mr-2" />
              Check Complaint Status
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              About CitySynergy
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Transforming Urban Governance
            </h2>

            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              CitySynergy is an innovative platform designed to bridge the gap
              between government departments and citizens. By facilitating
              seamless inter-departmental cooperation, we're creating more
              efficient, transparent, and responsive urban governance systems.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Streamlined Processes
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Automate workflows between departments for faster resolution
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Citizen Engagement
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Empower citizens to report issues and track resolution
                  progress
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-xl overflow-hidden shadow-xl">
              <img
                src="./gclm.png"
                alt="City Synergy Platform"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-600 rounded-lg -z-10"></div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section id="knowtenders" className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-4">
              Local Development
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Discover Tenders in Your Area
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Stay informed about development projects happening in your
              neighborhood. Search by pincode and area to find active tenders.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-md mb-10">
            <form
              onSubmit={handleSearch}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <div>
                <label
                  htmlFor="pincode"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Pincode
                </label>
                <AsyncSelect
                  id="pincode"
                  cacheOptions
                  loadOptions={loadTenderPincodes}
                  // Update selectedPincode and clear dependent fields
                  onChange={(selectedOption) => {
                    setSelectedPincode(selectedOption);
                    setSelectedArea(null);
                    setSelectedLocalArea(null);
                  }}
                  value={selectedPincode}
                  placeholder="Enter Pincode"
                  noOptionsMessage={() => "Type to search pincodes"}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              <div>
                <label
                  htmlFor="area"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Area
                </label>
                <AsyncSelect
                  key={selectedPincode ? selectedPincode.value : "area-select"} // Added key prop
                  id="area"
                  cacheOptions
                  loadOptions={fetchAreas}
                  // Update selectedArea and clear dependent fields
                  onChange={(selectedOption) => {
                    setSelectedArea(selectedOption);
                    setSelectedLocalArea(null);
                  }}
                  value={selectedArea}
                  placeholder="Select Area"
                  isDisabled={!selectedPincode}
                  noOptionsMessage={() => "No areas found"}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              <div>
                <label
                  htmlFor="localArea"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Local Area
                </label>
                <AsyncSelect
                  key={selectedArea ? selectedArea.value : "local-area-select"} // Added key prop
                  id="localArea"
                  cacheOptions
                  loadOptions={fetchLocalAreas}
                  onChange={setSelectedLocalArea}
                  value={selectedLocalArea}
                  placeholder="Select Local Area"
                  isDisabled={!selectedPincode || !selectedArea}
                  noOptionsMessage={() => "No local areas found"}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={
                    loading ||
                    !selectedPincode ||
                    !selectedArea ||
                    !selectedLocalArea
                  }
                >
                  <Search className="w-5 h-5 mr-2" />
                  {loading ? "Searching..." : "Search Tenders"}
                </button>
              </div>
            </form>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {tenders.length > 0 ? (
            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tender ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Classification
                    </th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Sanction Date
                    </th>
                    <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Completion Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="hidden xl:table-cell px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Agency
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {tenders.map((tender) => (
                    <tr
                      key={tender.Tender_ID}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {tender.Tender_ID}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {tender.Tender_by_Department}
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {tender.Tender_by_Classification}
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {new Date(tender.Sanction_Date).toLocaleDateString()}
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {new Date(tender.Completion_Date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 text-right">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(tender.Sanction_Amount)}
                      </td>
                      <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 text-center">
                        {tender.Total_Duration_Days} days
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            tender.Complete_Pending === "Completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : tender.Complete_Pending === "In Progress"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          }`}
                        >
                          {tender.Complete_Pending}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        N/A
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !loading &&
            !error && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-10 text-center shadow-md">
                <div className="flex flex-col items-center justify-center">
                  <Search className="w-16 h-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    No tenders found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    No accepted tenders found for the selected criteria. Try
                    different search parameters.
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* Floating Action Button for Issue Reporting */}
      <button
        onClick={() => setIsIssueModalOpen(true)}
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg z-50 flex items-center justify-center transition-all hover:scale-110"
        aria-label="Report an Issue"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Issue Reporting Modal */}
      <HomeModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title="Report an Issue"
        maxWidth="max-w-3xl"
      >
        <form
          onSubmit={handleIssueSubmit}
          className="space-y-6 overflow-y-auto max-h-[70vh] md:max-h-[80vh] p-1"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label
                htmlFor="raisedByName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Your Name
              </label>
              <input
                type="text"
                id="raisedByName"
                name="raisedByName"
                value={issueFormData.raisedByName}
                onChange={handleIssueFormChange}
                placeholder="Enter your full name"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label
                htmlFor="raisedByEmailID"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="raisedByEmailID"
                name="raisedByEmailID"
                value={issueFormData.raisedByEmailID}
                onChange={handleIssueFormChange}
                placeholder="Enter your email address"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label
                htmlFor="IssueName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Issue Title
              </label>
              <input
                type="text"
                id="IssueName"
                name="IssueName"
                value={issueFormData.IssueName}
                onChange={handleIssueFormChange}
                placeholder="Enter a brief title for the issue"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label
                htmlFor="IssueCategory"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Issue Category
              </label>
              <CustomDropdown
                id="IssueCategory"
                name="IssueCategory"
                options={issueCategories}
                value={issueFormData.IssueCategory}
                onChange={handleDropdownChange}
                placeholder="Select issue category"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Department
              </label>
              <AsyncSelect
                cacheOptions
                defaultOptions={departments} // Add this prop
                loadOptions={loadDepartments}
                onChange={handleDepartmentChange}
                placeholder="Search and select department"
                className="react-select-container"
                classNamePrefix="react-select"
                noOptionsMessage={() => "Department not found"}
                filterOption={(option, inputValue) => {
                  // Don't filter if input contains numbers
                  if (/\d/.test(inputValue)) return false;
                  return option.label
                    .toLowerCase()
                    .includes(inputValue.toLowerCase());
                }}
                onInputChange={(inputValue) => {
                  // Remove numbers from input
                  return inputValue.replace(/[0-9]/g, "");
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pincode
              </label>
              <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={loadPincodes}
                onChange={handlePincodeChange}
                placeholder="Search and select pincode"
                className="react-select-container"
                classNamePrefix="react-select"
                noOptionsMessage={() => "Type to search pincodes"}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Locality
              </label>
              <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={loadLocalities}
                onChange={handleLocalityChange}
                placeholder="Search and select locality"
                className="react-select-container"
                classNamePrefix="react-select"
                noOptionsMessage={() => "Type to search localities"}
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Detailed Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={issueFormData.address}
                onChange={handleIssueFormChange}
                placeholder="Enter detailed address of the issue location"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="IssueDescription"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Issue Description
            </label>
            <textarea
              id="IssueDescription"
              name="IssueDescription"
              value={issueFormData.IssueDescription}
              onChange={handleIssueFormChange}
              rows={3}
              placeholder="Describe the issue in detail"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Upload Image
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
              {previewImage ? (
                <div className="relative">
                  <img
                    src={previewImage || "/placeholder.svg"}
                    alt="Issue preview"
                    className="max-h-36 mx-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer flex flex-col items-center justify-center py-2"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    PNG, JPG, JPEG up to 5MB
                  </p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsIssueModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              Submit Issue
            </button>
          </div>
        </form>
      </HomeModal>
      {/* Success Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Issue Submitted Successfully"
        maxWidth="max-w-lg"
      >
        <div className="text-center overflow-y-auto max-h-[70vh] md:max-h-[80vh] p-1">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>

          <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">
            Thank you for reporting the issue!
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Your issue has been successfully submitted and will be reviewed by
            the relevant department.
          </p>

          {issueResponse && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 md:p-4 mb-4 text-left">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-1">
                <h4 className="text-base font-medium text-gray-900 dark:text-white">
                  Issue Details
                </h4>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
                  ID: {issueResponse.data.IssueId}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Issue Name
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {issueResponse.data.IssueName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Department
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {issueResponse.data.deptId}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Category
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {issueResponse.data.IssueCategory.replace("_", " ").replace(
                      /\b\w/g,
                      (l) => l.toUpperCase()
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Submitted On
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(issueResponse.data.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Current Status
                </p>
                <div className="w-full mt-2">
                  <div className="relative">
                    <div className="relative flex justify-between">
                      {renderIssueStatusSteps(issueResponse.data.issueStatus)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Please save your Issue ID for future reference:
                </p>
                <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1.5">
                  <code className="text-blue-600 dark:text-blue-400 font-mono text-xs overflow-x-auto">
                    {issueResponse.data.IssueId}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      document.execCommand(
                        "copy",
                        false,
                        issueResponse.data.IssueId
                      ); // Using execCommand for broader compatibility in iframes
                      showToast("Issue ID copied to clipboard", "success");
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ml-2 flex-shrink-0"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 0 01-2-2V6a2 0 012-2h8a2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setIsSuccessModalOpen(false)}
              className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Add after Success Modal */}
      <StatusModal
        isStatusModalOpen={isStatusModalOpen}
        setIsStatusModalOpen={setIsStatusModalOpen}
        issueDetails={issueDetails}
        setIssueDetails={setIssueDetails}
        issueId={issueId}
        setIssueId={setIssueId}
        isCheckingStatus={isCheckingStatus}
        handleCheckStatus={handleCheckStatus}
      />

      {/* Footer Section */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-blue-400">CITY SYNERGY</h3>
              <p className="text-gray-400 text-sm">
                Empowering citizens and streamlining urban governance through
                technology.
              </p>
              <div className="flex space-x-4">
                {/* Social Media Icons (placeholders) */}
                <a
                  href="https://github.com/metaltroop"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.931 0-1.091.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.026 2.747-1.026.546 1.379.202 2.398.099 2.65.64.7 1.028 1.597 1.028 2.688 0 3.829-2.339 4.675-4.566 4.922.359.307.678.915.678 1.846 0 1.334-.012 2.41-.012 2.727 0 .266.18.576.687.479C21.133 20.217 24 16.447 24 12.017 24 6.484 19.522 2 14 2h-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.931 0-1.091.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.026 2.747-1.026.546 1.379.202 2.398.099 2.65.64.7 1.028 1.597 1.028 2.688 0 3.829-2.339 4.675-4.566 4.922.359.307.678.915.678 1.846 0 1.334-.012 2.41-.012 2.727 0 .266.18.576.687.479C21.133 20.217 24 16.447 24 12.017 24 6.484 19.522 2 14 2h-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.931 0-1.091.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.026 2.747-1.026.546 1.379.202 2.398.099 2.65.64.7 1.028 1.597 1.028 2.688 0 3.829-2.339 4.675-4.566 4.922.359.307.678.915.678 1.846 0 1.334-.012 2.41-.012 2.727 0 .266.18.576.687.479C21.133 20.217 24 16.447 24 12.017 24 6.484 19.522 2 14 2h-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <ScrollLink
                    to="home"
                    smooth={true}
                    duration={500}
                    className="hover:text-white cursor-pointer"
                  >
                    Home
                  </ScrollLink>
                </li>
                <li>
                  <ScrollLink
                    to="about"
                    smooth={true}
                    duration={500}
                    className="hover:text-white cursor-pointer"
                  >
                    About Us
                  </ScrollLink>
                </li>
                <li>
                  <ScrollLink
                    to="knowtenders"
                    smooth={true}
                    duration={500}
                    className="hover:text-white cursor-pointer"
                  >
                    Tenders
                  </ScrollLink>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Report Issue
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Check Status
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Email: supp.citysynergy@gmail.com</li>
                <li>Phone: +91 84840 65719</li>
                <li>Address: Nashik, Maharashtra India</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 dark:border-gray-800 mt-8 pt-6 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} City Synergy. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

Home.PropTypes = {
  user: PropTypes.object,
  departments: PropTypes.array,
  issueCategories: PropTypes.array,
  issueStatus: PropTypes.array,
  fetchAreas: PropTypes.func, // This prop type might be removed if fetchAreas is not passed as a prop
  showProfileDropdown: PropTypes.func,
  username: PropTypes.string,
};
