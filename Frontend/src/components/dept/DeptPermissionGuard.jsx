"use client"
import { useAuth } from "../../context/AuthContext"

/**
 * Permission guard component specifically for department features
 * This handles the FEAT_* format feature IDs used in department permissions
 */
const DeptPermissionGuard = ({ children, featureId, permissionType = "read", fallback = null }) => {
  const { user, permissions } = useAuth()

  if (!user || !permissions) {
    return fallback
  }

  // Check if user has the required permission
  const hasPermission = () => {
    // First check if the user has direct can permissions
    if (permissions.can) {
      if (featureId === "FEAT_INVENTORY" && permissions.can.manageInventory) {
        return true
      }
      if (featureId === "FEAT_USER_MGMT" && permissions.can.manageUsers) {
        return true
      }
      if (featureId === "FEAT_DEPT_MGMT" && permissions.can.manageDepartments) {
        return true
      }
      if (featureId === "FEAT_ROLE_MGMT" && permissions.can.manageRoles) {
        return true
      }
      if (featureId === "FEAT_ISSUES" && permissions.can.manageIssues) {
        return true
      }
      if (featureId === "FEAT_CLASHES" && permissions.can.manageClashes) {
        return true
      }
      if (featureId === "FEAT_TENDERS" && permissions.can.manageTenders) {
        return true
      }
    }

    // Then check role-based permissions
    if (permissions.roles && permissions.roles.length > 0) {
      for (const role of permissions.roles) {
        if (role.features && role.features.length > 0) {
          const feature = role.features.find((f) => f.id === featureId)
          if (feature && feature.permissions && feature.permissions[permissionType]) {
            return true
          }
        }
      }
    }

    return false
  }

  return hasPermission() ? children : fallback
}

export default DeptPermissionGuard

