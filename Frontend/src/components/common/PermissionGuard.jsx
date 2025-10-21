"use client"

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { PERMISSIONS } from '../../utils/permissionUtils';

/**
 * PermissionGuard component that conditionally renders children based on user permissions
 * 
 * @param {Object} props - Component props
 * @param {string} props.featureId - The feature ID to check permissions for
 * @param {string} props.permission - The permission type (read, write, update, delete)
 * @param {React.ReactNode} props.children - The children to render if the user has permission
 * @param {React.ReactNode} props.fallback - Optional component to render if the user doesn't have permission
 * @returns {React.ReactNode} - The children or fallback component
 */
const PermissionGuard = ({ 
  featureId, 
  permission = PERMISSIONS.READ, 
  children, 
  fallback = null 
}) => {
  const { hasPermission, permissions } = useAuth();

  // If no featureId is provided, render the children
  if (!featureId) {
    return children;
  }

  // Check if the user has the required permission
  const hasRequiredPermission = hasPermission(featureId, permission);

  // Render the children if the user has permission, otherwise render the fallback
  return hasRequiredPermission ? children : fallback;
};

export default PermissionGuard; 