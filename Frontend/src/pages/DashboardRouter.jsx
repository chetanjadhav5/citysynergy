"use client"

import { useEffect } from "react"
import { Routes, Route, Navigate, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

// Dev Dashboard pages
import DevDashboard from "./dev/Dashboard"
import DevUsers from "./dev/Users"
import DevCreateUser from "./dev/CreateUser"
import DevDepartments from "./dev/Departments"
import DevCreateDepartment from "./dev/CreateDepartment"
import DevEditDepartment from "./dev/EditDepartment"
import DevRoles from "./dev/Roles"
import DevFeatures from "./dev/Features"
import DevClashes from "./dev/Clashes"

// Department Dashboard pages
import DeptDashboard from "./dept/Dashboard"
import DeptTenders from "./dept/Tenders"
import DeptCreateTender from "./dept/CreateTender"
import DeptTenderDetails from "./dept/TenderDetails"
import DeptClashes from "./dept/Clashes"
import DeptClashDetails from "./dept/ClashDetails"
import DeptIssues from "./dept/Issues"
import DeptInventory from "./dept/Inventory"
import DeptUsers from "./dept/Users"
import DeptCreateUser from "./dept/CreateUser"
import DeptRoles from "./dept/Roles"
import DeptCreateRole from "./dept/CreateRole"
import DeptFeatures from "./dept/Features"
import DeptInventoryRequests from "./dept/InventoryRequests"
import DeptInventoryAsk from "./dept/InventoryAsk"
import DeptInventoryHistory from "./dept/InventoryHistory"
import ExamplePermissionPage from "./dept/ExamplePermissionPage"

import DevLayout from "../components/dev/Layout"
import DeptLayout from "../components/dept/Layout"

export default function DashboardRouter() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.type === "dev") {
        navigate("/dashboard/dev")
      } else if (user.type === "dept") {
        navigate("/dashboard/dept")
      }
    }
  }, [isAuthenticated, user, navigate])

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return (
    <Routes>
      {/* Dev Dashboard Routes - Properly nested */}
      <Route path="dev" element={<DevLayout />}>
        <Route index element={<DevDashboard />} />
        <Route path="users" element={<DevUsers />} />
        <Route path="users/create" element={<DevCreateUser />} />
        <Route path="departments" element={<DevDepartments />} />
        <Route path="departments/create" element={<DevCreateDepartment />} />
        <Route path="departments/edit/:id" element={<DevEditDepartment />} />
        <Route path="roles" element={<DevRoles />} />
        <Route path="features" element={<DevFeatures />} />
        <Route path="clashes" element={<DevClashes />} />
      </Route>

      {/* Department Dashboard Routes - Properly nested */}
      <Route path="dept" element={<DeptLayout />}>
        <Route index element={<DeptDashboard />} />
        <Route path="tenders" element={<DeptTenders />} />
        <Route path="tenders/create" element={<DeptCreateTender />} />
        <Route path="tenders/:id" element={<DeptTenderDetails />} />
        <Route path="clashes" element={<DeptClashes />} />
        <Route path="clashes/:id" element={<DeptClashDetails />} />
        <Route path="issues" element={<DeptIssues />} />
        <Route path="inventory" element={<DeptInventory />} />
        <Route path="inventory/requests" element={<DeptInventoryRequests />} />
        <Route path="inventory/ask" element={<DeptInventoryAsk />} />
        <Route path="inventory/history" element={<DeptInventoryHistory />} />
        <Route path="users" element={<DeptUsers />} />
        <Route path="users/create" element={<DeptCreateUser />} />
        <Route path="roles" element={<DeptRoles />} />
        <Route path="roles/create" element={<DeptCreateRole />} />
        <Route path="features" element={<DeptFeatures />} />
        <Route path="permissions-example" element={<ExamplePermissionPage />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to={user?.type === "dev" ? "/dashboard/dev" : "/dashboard/dept"} replace />} />
    </Routes>
  )
}

