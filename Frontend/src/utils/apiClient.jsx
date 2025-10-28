import axios from "axios"
import { useNavigate } from 'react-router-dom';

const apiBase = import.meta.env.VITE_API_BASE_URL || "";
const apiClient = axios.create({
  baseURL: `${apiBase}/api/`,
  withCredentials: true,
});


let isRefreshing = false
let failedQueue = []
let sessionExpiredModalShown = false

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Create a navigation function that we can use outside React components
let navigate;
export const setNavigate = (nav) => {
  navigate = nav;
};

const showSessionExpiredModal = () => {
  if (sessionExpiredModalShown) return;
  sessionExpiredModalShown = true;

  const currentPath = window.location.pathname;
  const isHomePage = currentPath === '/home';
  const isDashboard = currentPath.includes('/dashboard/');

  // Create modal elements with improved design
  const modalOverlay = document.createElement("div");
  modalOverlay.className = "fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300";
  modalOverlay.style.opacity = "0";

  const modalContent = document.createElement("div");
  modalContent.className = "bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full transform transition-all duration-300 scale-95";
  modalContent.style.transform = "scale(0.95)";

  const modalHeader = document.createElement("div");
  modalHeader.className = "flex items-center justify-between mb-6";

  const modalTitle = document.createElement("div");
  modalTitle.className = "flex items-center gap-3";
  modalTitle.innerHTML = `
    <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
    </svg>
    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Session Expired</h3>
  `;

  // Add close button for home route with improved design
  if (isHomePage) {
    const closeButton = document.createElement("button");
    closeButton.className = "text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200";
    closeButton.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    `;
    closeButton.onclick = () => {
      modalOverlay.style.opacity = "0";
      modalContent.style.transform = "scale(0.95)";
      setTimeout(() => {
        sessionExpiredModalShown = false;
        document.body.removeChild(modalOverlay);
      }, 200);
    };
    modalHeader.appendChild(closeButton);
  }

  const modalBody = document.createElement("div");
  modalBody.className = "mb-8 space-y-4";
  modalBody.innerHTML = `
    <p class="text-gray-600 dark:text-gray-300">Your session has expired or is invalid. Please log in again to continue using the application.</p>
    <div class="border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-400/10 p-4 rounded">
      <p class="text-sm text-yellow-700 dark:text-yellow-300">Any unsaved changes may be lost. Please ensure your work is saved before continuing.</p>
    </div>
  `;

  const modalFooter = document.createElement("div");
  modalFooter.className = "flex justify-end items-center gap-3";

  const loginButton = document.createElement("button");
  loginButton.className = "px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-600/50 transition duration-200 font-medium";
  loginButton.textContent = "Log In";
  loginButton.onclick = () => {
    // Clear auth data
    localStorage.removeItem("token");
    
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userData");

    // Animate modal out
    modalOverlay.style.opacity = "0";
    modalContent.style.transform = "scale(0.95)";
    
    setTimeout(() => {
      sessionExpiredModalShown = false;
      document.body.removeChild(modalOverlay);
      // Use navigate instead of window.location
      if (navigate) {
        navigate('/login', { replace: true });
      } else {
        // Fallback to window.location if navigate is not available
        window.location.href = '/login';
      }
    }, 200);
  };

  if (isHomePage) {
    const cancelButton = document.createElement("button");
    cancelButton.className = "px-4 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition duration-200 font-medium";
    cancelButton.textContent = "Continue Browsing";
    cancelButton.onclick = () => {
      modalOverlay.style.opacity = "0";
      modalContent.style.transform = "scale(0.95)";
      setTimeout(() => {
        sessionExpiredModalShown = false;
        document.body.removeChild(modalOverlay);
      }, 200);
    };
    modalFooter.appendChild(cancelButton);
  }

  // Assemble modal
  modalHeader.appendChild(modalTitle);
  modalFooter.appendChild(loginButton);

  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);
  modalContent.appendChild(modalFooter);
  modalOverlay.appendChild(modalContent);

  // Add to body with animation
  document.body.appendChild(modalOverlay);
  requestAnimationFrame(() => {
    modalOverlay.style.opacity = "1";
    modalContent.style.transform = "scale(1)";
  });
};

const refreshToken = async () => {
  try {
    const apiBase = import.meta.env.VITE_API_BASE_URL || "";
    const response = await axios.post(
      `${apiBase}/api/auth/refresh-token`,
      {},
      { withCredentials: true } // Ensures the HTTP-only cookie is sent
    );

    if (response?.data?.success && response.data.data.tokens.accessToken) {
      const newToken = response.data.data.tokens.accessToken;

      // Store the new token in localStorage
      localStorage.setItem("token", newToken);

      // Update the Authorization header
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      return newToken;
    }

    throw new Error("Refresh token failed");
  } catch (error) {
    console.error("Token refresh failed:", error);
    throw error;
  }
};


const handleAuthError = async () => {
  try {
    const newToken = await refreshToken();
    if (newToken) {
      return newToken;
    }
  } catch (err) {
    console.error("Session expired: ", err);
  }

  // If refresh fails, show session expired modal
  localStorage.removeItem("token");
 
  sessionStorage.removeItem("token");
 

  showSessionExpiredModal();
  return null;
};

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Don't retry refresh token requests to avoid infinite loops
    if (originalRequest.url.includes("/auth/refresh-token")) {
      await handleAuthError()
      return Promise.reject(error)
    }

    // Check if it's an auth error and not already retrying
    if (
      (error.response?.data?.message === "Invalid or expired token" || error.response?.status === 401) &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch((err) => {
            return handleAuthError().then(() => {
              return Promise.reject(err)
            })
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const newToken = await refreshToken()
        
        if (newToken) {
          apiClient.defaults.headers.common["Authorization"] = `Bearer ${newToken}`
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          processQueue(null, newToken)
          return apiClient(originalRequest)
        } else {
          processQueue(new Error("Could not refresh token"), null)
          await handleAuthError()
          return Promise.reject(error)
        }
      } catch (refreshError) {
        processQueue(refreshError, null)
        await handleAuthError()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient
