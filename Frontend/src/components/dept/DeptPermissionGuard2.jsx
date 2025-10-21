"use client";
import { useAuth } from "../../context/AuthContext";
import { hasPermission } from "../../utils/deptPermissionUtils";

const DeptPermissionGuard2 = ({ children, featureId, permissionType = "read", fallback = null }) => {
  const { user, permissions } = useAuth();

  if (!user || !permissions) {
    return fallback;
  }

  const hasRequiredPermission = hasPermission(permissions, featureId, permissionType);

  return hasRequiredPermission ? children : fallback;
};

export default DeptPermissionGuard2;