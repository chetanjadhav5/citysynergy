import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, ChevronDown, CheckCircle, AlertCircle } from "lucide-react"
import apiClient from "../../utils/apiClient";
import PropTypes from "prop-types"

export default function CreateUser() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    type: "dev",
    deptId: "",
    roleId: "",
  });
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [fetchingRoles, setFetchingRoles] = useState(false);
  const [error, setError] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);
const [checkingEmail, setCheckingEmail] = useState(false);

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/departments");
        if (response.data.success) {
          setDepartments(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching departments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  // Fetch roles based on user type and department
  useEffect(() => {
    const fetchRoles = async () => {
      if (formData.type === "dev") {
        // Fetch dev roles
        try {
          setFetchingRoles(true);
          const response = await apiClient.get("/roles/fetchdevroles");
          if (response.data.success) {
            setRoles(response.data.data);
          }
        } catch (err) {
          console.error("Error fetching dev roles:", err);
        } finally {
          setFetchingRoles(false);
        }
      } else if (formData.type === "dept" && formData.deptId) {
        // Fetch department roles
        try {
          setFetchingRoles(true);
          const response = await apiClient.get(
            `/roles/fetchdeptrolesbydeptid/${formData.deptId}`
          );
          if (response.data.success) {
            setRoles(response.data.data);
          }
        } catch (err) {
          console.error("Error fetching department roles:", err);
        } finally {
          setFetchingRoles(false);
        }
      }
    };

    fetchRoles();
  }, [formData.type, formData.deptId]);

  const checkUsername = async (username) => {
    if (!username) {
      setUsernameAvailable(null);
      return;
    }

    try {
      setCheckingUsername(true);
      const response = await apiClient.post("/users/check-username", {
        username,
      });
      setUsernameAvailable(response.data.success);
    } catch (err) {
      console.error("Error checking username:", err);
      setUsernameAvailable(false);
    } finally {
      setCheckingUsername(false);
    }
  };

  const checkEmail = async (email) => {
    if (!email) {
      setEmailAvailable(null);
      return;
    }
  
    try {
      setCheckingEmail(true);
      const response = await apiClient.post("/users/check-email", { email });
      setEmailAvailable(response.data.success);
    } catch (err) {
      console.error("Error checking email:", err);
      setEmailAvailable(false);
    } finally {
      setCheckingEmail(false);
    }
  };

  const validateUsername = (username) => {
    return username.length >= 5;
  };
  
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.username && validateUsername(formData.username)) {
        checkUsername(formData.username);
      } else if (formData.username) {
        setUsernameAvailable(false);
      }
    }, 500);
  
    return () => clearTimeout(timer);
  }, [formData.username]);
  
  // Modify the checkEmail useEffect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.email && validateEmail(formData.email)) {
        checkEmail(formData.email);
      } else if (formData.email) {
        setEmailAvailable(false);
      }
    }, 500);
  
    return () => clearTimeout(timer);
  }, [formData.email]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Only validate required fields
    if (!formData.username || !formData.email) {
      setError("Username and email are required");
      return;
    }
  
    if (!validateUsername(formData.username)) {
      setError("Username must be at least 5 characters long");
      return;
    }
  
    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }
  
    if (usernameAvailable === false) {
      setError("Please choose a different username");
      return;
    }
  
    if (emailAvailable === false) {
      setError("Please choose a different email");
      return;
    }
  
    try {
      setLoading(true);
      const response = await apiClient.post("/users", {
        ...formData,
        // Only include deptId if type is dept and deptId is selected
        deptId: formData.type === "dept" ? formData.deptId : null,
        // Include roleId only if selected
        roleId: formData.roleId || null
      });
      
      if (response.data.success) {
        navigate("/dashboard/dev/users");
      }
    } catch (err) {
      console.error("Error creating user:", err);
      setError(err.response?.data?.message || "Error creating user");
    } finally {
      setLoading(false);
    }
  };

  const CustomSelect = ({
    value,
    onChange,
    options,
    placeholder,
    disabled = false,
    loading = false,
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="relative w-full">
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            flex items-center justify-between 
            w-full px-3 py-2 
            border rounded-md 
            ${
              disabled
                ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                : "bg-white dark:bg-gray-700 cursor-pointer"
            }
            ${
              disabled
                ? "border-gray-300 dark:border-gray-600"
                : "border-gray-300 dark:border-gray-600"
            }
            focus:outline-none focus:ring-2 focus:ring-blue-500
          `}
        >
          <span
            className={`
            ${value ? "text-gray-900 dark:text-gray-100" : "text-gray-500"}
          `}
          >
            {options.find((opt) => opt.value === value)?.label || placeholder}
          </span>
          <div className="flex items-center">
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin mr-2 text-gray-400" />
            )}
            <ChevronDown
              className={`h-4 w-4 ${
                disabled ? "text-gray-400" : "text-gray-600 dark:text-gray-300"
              }`}
            />
          </div>
        </div>

        {isOpen && !disabled && (
          <div
            className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 
            border border-gray-300 dark:border-gray-600 rounded-md shadow-lg 
            max-h-60 overflow-auto"
          >
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 
                  cursor-pointer text-gray-900 dark:text-gray-100
                  transition-colors duration-200"
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      {/* Back button */}
      <button
        onClick={() => navigate("/dashboard/dev/users")}
        className="mb-4 flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Users
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Create New User
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 
        ${
          usernameAvailable === false
            ? "border-red-300 dark:border-red-600"
            : usernameAvailable === true
            ? "border-green-300 dark:border-green-600"
            : "border-gray-300 dark:border-gray-600"
        }
        focus:ring-blue-500 
        bg-white dark:bg-gray-700 
        text-gray-900 dark:text-gray-100`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {checkingUsername && (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                )}
                {!checkingUsername && usernameAvailable === true && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {!checkingUsername && usernameAvailable === false && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            {!checkingUsername && (
              <p className="mt-1 text-sm text-red-500">
                {!validateUsername(formData.username) && formData.username
                  ? "Username must be at least 5 characters long"
                  : usernameAvailable === false
                  ? "This username is already taken"
                  : ""}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
    Email
  </label>
  <div className="relative">
    <input
      type="email"
      value={formData.email}
      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 
        ${
          emailAvailable === false
            ? "border-red-300 dark:border-red-600"
            : emailAvailable === true
            ? "border-green-300 dark:border-green-600"
            : "border-gray-300 dark:border-gray-600"
        }
        focus:ring-blue-500 
        bg-white dark:bg-gray-700 
        text-gray-900 dark:text-gray-100`}
    />
    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
      {checkingEmail && (
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      )}
      {!checkingEmail && emailAvailable === true && (
        <CheckCircle className="h-4 w-4 text-green-500" />
      )}
      {!checkingEmail && emailAvailable === false && (
        <AlertCircle className="h-4 w-4 text-red-500" />
      )}
    </div>
  </div>
  {!checkingEmail && (
  <p className="mt-1 text-sm text-red-500">
    {!validateEmail(formData.email) && formData.email
      ? "Please enter a valid email address"
      : emailAvailable === false
      ? "This email is already registered"
      : ""}
  </p>
)}
</div>
          {/* User Type Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              User Type
            </label>
            <CustomSelect
              value={formData.type}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  type: value,
                  deptId: "",
                  roleId: "",
                })
              }
              options={[
                { value: "dev", label: "Dev" },
                { value: "dept", label: "Department" },
              ]}
              placeholder="Select User Type"
            />
          </div>

          {/* Department Dropdown for Dept Users */}
          {formData.type === "dept" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Department
              </label>
              <CustomSelect
                value={formData.deptId}
                onChange={(value) =>
                  setFormData({ ...formData, deptId: value, roleId: "" })
                }
                options={[
                  { value: "", label: "Select Department" },
                  ...departments.map((dept) => ({
                    value: dept.deptId,
                    label: dept.deptName,
                  })),
                ]}
                placeholder="Select Department"
                disabled={loading}
                loading={loading}
              />
            </div>
          )}

          {/* Role Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <CustomSelect
              value={formData.roleId}
              onChange={(value) => setFormData({ ...formData, roleId: value })}
              options={[
                { value: "", label: "Select Role" },
                ...roles.map((role) => ({
                  value: role.roleId,
                  label: role.roleName,
                })),
              ]}
              placeholder="Select Role"
              disabled={
                loading || (formData.type === "dept" && !formData.deptId)
              }
              loading={fetchingRoles}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 
              text-white rounded-md transition-colors"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
    </div>
  );
}

CreateUser.propTypes = {

  value : PropTypes.string.isRequired,
  onChange : PropTypes.func.isRequired,
  options : PropTypes.array.isRequired,
  placeholder : PropTypes.string.isRequired,
  disabled : PropTypes.bool.isRequired,
  loading : PropTypes.bool.isRequired,
}
