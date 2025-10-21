import  { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Search,  } from "lucide-react";
import Modal from "../dept/Modal"; // Adjust the import if needed

const StatusModal = ({
  isStatusModalOpen,
  setIsStatusModalOpen,
  issueDetails,
  setIssueDetails,
  issueId,
  setIssueId,
  isCheckingStatus,
  handleCheckStatus,
}) => {
  const [progressWidth, setProgressWidth] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (issueDetails) {
      setError(null);
      setTimeout(() => {
        setProgressWidth(calculateProgress(issueDetails.issueStatus));
      }, 200);
    } else {
      setProgressWidth(0);
    }
  }, [issueDetails]);

  const calculateProgress = (statusObj) => {
    if (!statusObj) return 0;
    const steps = [
      "raised",
      "in_review",
      "accepted",
      "pending",
      "working",
      "resolved",
    ];
    let lastCompletedIndex = -1;
    for (let i = 0; i < steps.length; i++) {
      if (statusObj[steps[i]]) {
        lastCompletedIndex = i;
      } else {
        break;
      }
    }
    return lastCompletedIndex >= 0
      ? (lastCompletedIndex / (steps.length - 1)) * 100
      : 0;
  };

  // NEW: the refined progress bar function
  const renderProgressBar = (statusObj) => {
    if (!statusObj) return null;
  
    // The steps in order:
    const steps = [
      { key: "raised", label: "Raised" },
      { key: "in_review", label: "In Review" },
      { key: "accepted", label: "Accepted" },
      { key: "pending", label: "Pending" },
      { key: "working", label: "Working" },
      { key: "resolved", label: "Resolved" },
    ];
  
    // Find last completed step
    let lastCompletedIndex = -1;
    for (let i = 0; i < steps.length; i++) {
      if (statusObj[steps[i].key]) {
        lastCompletedIndex = i;
      } else {
        break;
      }
    }
  
    return (
      <ol className="flex items-center w-full text-xs text-gray-900 font-medium sm:text-base">
        {steps.map((step, index) => {
          const isCompleted = index <= lastCompletedIndex;
          const isCurrent = index === lastCompletedIndex + 1;
  
          return (
            <li 
              key={step.key}
              className={`flex w-full relative ${
                isCompleted ? 'text-indigo-600' : 'text-gray-900'
              } ${index < steps.length - 1 ? 'after:content-[""] after:w-full after:h-0.5 after:inline-block after:absolute lg:after:top-5 after:top-3 after:left-4 ' : ''} 
              ${isCompleted ? 'after:bg-indigo-600' : 'after:bg-gray-200'}`}
            >
              <div className="block whitespace-nowrap z-10">
                <span 
                  className={`w-6 h-6 rounded-full flex justify-center items-center mx-auto mb-3 text-sm lg:w-10 lg:h-10 
                  ${isCompleted 
                    ? 'bg-indigo-600 border-2 border-transparent text-white' 
                    : isCurrent 
                      ? 'bg-indigo-50 border-2 border-indigo-600 text-indigo-600'
                      : 'bg-gray-50 border-2 border-gray-200'
                  }`}
                >
                  {index + 1}
                </span>
                {step.label}
              </div>
            </li>
          );
        })}
      </ol>
    );
  };

  const handleCloseModal = () => {
    setIsStatusModalOpen(false);
    setIssueDetails(null);
    setIssueId("");
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!issueId.trim()) {
      setError("Please enter an Issue ID");
      return;
    }

    try {
      await handleCheckStatus(e);
    } catch (err) {
      setError(err.message || "Failed to fetch issue details");
    }
  };

  return (
    <Modal
      isOpen={isStatusModalOpen}
      onClose={handleCloseModal}
      title="Check Complaint Status"
      maxWidth="sm:max-w-md md:max-w-xl lg:max-w-2xl"
    >
      <div className="p-4 max-h-[80vh] overflow-y-auto space-y-6">
        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={issueId}
              onChange={(e) => setIssueId(e.target.value)}
              placeholder="Enter Issue ID"
              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              required
              aria-label="Issue ID"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isCheckingStatus || !issueId.trim()}
            >
              {isCheckingStatus ? (
                "Checking..."
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Check Status
                </>
              )}
            </button>
          </div>
        </form>

        {/* ERROR ALERT */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg dark:bg-red-900/50 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}

        {/* ISSUE DETAILS */}
        {issueDetails && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Issue ID
                </h4>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {issueDetails.IssueId}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Raised By
                </h4>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {issueDetails.raisedByName}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Category
                </h4>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {issueDetails.IssueCategory.replace("_", " ").replace(
                    /\b\w/g,
                    (l) => l.toUpperCase()
                  )}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Department
                </h4>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {issueDetails.deptId}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Issue Title
              </h4>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {issueDetails.IssueName}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Description
              </h4>
              <p className="text-base text-gray-900 dark:text-white">
                {issueDetails.IssueDescription}
              </p>
            </div>

            {/* PROGRESS BAR */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Current Status
              </h4>
              {renderProgressBar(issueDetails.issueStatus)}
            </div>

            {/* ATTACHED IMAGE */}
            {issueDetails.image && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Attached Image
                </h4>
                <img
                  src={issueDetails.image}
                  alt="Issue"
                  className="w-full max-h-60 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                />
              </div>
            )}

            {/* LOCATION & DATES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Location
                </h4>
                <p className="text-base text-gray-900 dark:text-white">
                  {issueDetails.address}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {issueDetails.locality}, {issueDetails.pincode}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Dates
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Raised on:{" "}
                  {new Date(issueDetails.createdAt).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated:{" "}
                  {new Date(issueDetails.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

StatusModal.propTypes = {
  isStatusModalOpen: PropTypes.bool.isRequired,
  setIsStatusModalOpen: PropTypes.func.isRequired,
  issueDetails: PropTypes.object,
  setIssueDetails: PropTypes.func.isRequired,
  issueId: PropTypes.string.isRequired,
  setIssueId: PropTypes.func.isRequired,
  isCheckingStatus: PropTypes.bool.isRequired,
  handleCheckStatus: PropTypes.func.isRequired,
};

export default StatusModal;
