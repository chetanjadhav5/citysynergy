import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { LoadingProvider } from "./context/LoadingContext"
import { AuthGuard } from "./components/AuthGuard"
import { Home } from "./pages/Home"
import { Login } from "./pages/Login"
import { OTPVerification } from "./pages/OTPVerification"
import MainLayout from "./layouts/MainLayout"
import { useState, useEffect } from "react"
import { setNavigate } from './utils/apiClient';

// Import all dashboard pages
import DevDashboard from "./pages/dev/Dashboard"
import DevUsers from "./pages/dev/Users"
import DevCreateUser from "./pages/dev/CreateUser"
import DevDepartments from "./pages/dev/Departments"
import DevCreateDepartment from "./pages/dev/CreateDepartment"
import DevEditDepartment from "./pages/dev/EditDepartment"
import DevRoles from "./pages/dev/Roles" 
import DevFeatures from "./pages/dev/Features"
import DevClashes from "./pages/dev/Clashes"
import DevEditUser from "./pages/dev/EditUser"

import DeptDashboard from "./pages/dept/Dashboard"
import DeptTenders from "./pages/dept/Tenders"
import DeptCreateTender from "./pages/dept/CreateTender"
import DeptTenderDetails from "./pages/dept/TenderDetails"
import DeptClashes from "./pages/dept/Clashes"
import DeptClashDetails from "./pages/dept/ClashDetails"
import DeptIssues from "./pages/dept/Issues"
import DeptInventory from "./pages/dept/Inventory"
import DeptUsers from "./pages/dept/Users"
import DeptCreateUser from "./pages/dept/CreateUser"
import DeptRoles from "./pages/dept/Roles"
import DeptCreateRole from "./pages/dept/CreateRole"
import DeptFeatures from "./pages/dept/Features"
import InventoryRequests2  from "./pages/dept/InventoryRequests2"
import DeptInventoryHistory from "./pages/dept/InventoryHistory"
import DeptInventoryAsk from "./pages/dept/InventoryAsk"
import ExamplePermissionPage from "./pages/dept/ExamplePermissionPage"
import { useAuth } from "./context/AuthContext"
import { ToastProvider } from "./context/ToastContext"
import ErrorBoundary from "./components/ErrorBoundary"


const DashboardRedirect = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  console.log("DashboardRedirect - User:", user);
  console.log("DashboardRedirect - User type:", user?.type);
  
  useEffect(() => {
    // If user is null, try to load from localStorage directly
    if (!user) {
      const userData = localStorage.getItem("userData");
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log("DashboardRedirect - Loaded user from localStorage:", parsedUser);
          if (parsedUser && parsedUser.type) {
            // Navigate directly instead of waiting for context
            window.location.href = `/dashboard/${parsedUser.type}`;
            return;
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
    setIsLoading(false);
  }, [user]);
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  // Default to 'dev' only if user exists but type is missing
  const dashboardType = user ? (user.type || 'dev') : 'dev';
  console.log("Redirecting to:", `/dashboard/${dashboardType}`);
  
  return <Navigate to={`/dashboard/${dashboardType}`} replace />;
};

// Create a wrapper component to handle navigation setup
const NavigationSetup = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return null;
};

export default function App() {
  return (
    <ErrorBoundary>
      <LoadingProvider>
        <ToastProvider>
          <Router>
            <NavigationSetup /> {/* Add NavigationSetup inside Router */}
            <AuthProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<Home />} />

                {/* Auth routes */}
                <Route
                  path="/login"
                  element={
                    <AuthGuard>
                      <Login />
                    </AuthGuard>
                  }
                />
                <Route
                  path="/verify-otp"
                  element={
                    <AuthGuard>
                      <OTPVerification />
                    </AuthGuard>
                  }
                />

                {/* Protected Dashboard Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <AuthGuard requireAuth>
                      <MainLayout />
                    </AuthGuard>
                  }
                >
                  <Route index element={<DashboardRedirect />} />

                  {/* Dev Routes */}
                  <Route path="dev" element={<DevDashboard />} />
                  <Route path="dev/users" element={<DevUsers />} />
                  <Route path="dev/users/create" element={<DevCreateUser />} />
                  <Route path="dev/users/edit/:id" element={<DevEditUser />} />
                  <Route path="dev/departments" element={<DevDepartments />} />
                  <Route path="dev/departments/create" element={<DevCreateDepartment />} />
                  <Route path="dev/departments/edit/:id" element={<DevEditDepartment />} />
                  <Route path="dev/roles" element={<DevRoles />} />
                  <Route path="dev/features" element={<DevFeatures />} />
                  <Route path="dev/clashes" element={<DevClashes />} />

                  {/* Department Routes */}
                  <Route path="dept" element={<DeptDashboard />} />
                  <Route path="dept/tenders" element={<DeptTenders />} />
                  <Route path="dept/tenders/create" element={<DeptCreateTender />} />
                  <Route path="dept/tenders/:id" element={<DeptTenderDetails />} />
                  <Route path="dept/clashes" element={<DeptClashes />} />
                  <Route path="dept/clashes/:id" element={<DeptClashDetails />} />
                  <Route path="dept/issues" element={<DeptIssues />} />
                  <Route path="dept/inventory" element={<DeptInventory />} />
                  <Route path="dept/inventory/requests" element={<InventoryRequests2  />} />
                  <Route path="dept/inventory/ask" element={<DeptInventoryAsk />} />
                  <Route path="dept/inventory/history" element={<DeptInventoryHistory/>}/>
                  <Route path="dept/users" element={<DeptUsers />} />
                  <Route path="dept/users/create" element={<DeptCreateUser />} />
                  <Route path="dept/roles" element={<DeptRoles />} />
                  <Route path="dept/roles/create" element={<DeptCreateRole />} />
                  <Route path="dept/features" element={<DeptFeatures />} />
                  <Route path="dept/permissions-example" element={<ExamplePermissionPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </AuthProvider>
          </Router>
        </ToastProvider>
      </LoadingProvider>
    </ErrorBoundary>
  );
}

