"use client"

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { PERMISSIONS } from '../../utils/permissionUtils';

/**
 * Button component that is enabled/disabled based on user permissions
 * 
 * @param {Object} props - Component props
 * @param {string} props.featureId - The feature ID to check permissions for
 * @param {string} props.permission - The permission type (read, write, update, delete)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.hideIfNoPermission - Whether to hide the button if the user doesn't have permission
 * @param {React.ReactNode} props.children - The button content
 * @param {Function} props.onClick - The click handler
 * @returns {React.ReactNode} - The button component
 */
const PermissionButton = ({ 
  featureId, 
  permission = PERMISSIONS.WRITE, 
  className = '',
  hideIfNoPermission = false,
  children, 
  onClick,
  ...rest
}) => {
  const { hasPermission } = useAuth();

  // Check if the user has the required permission
  const hasRequiredPermission = !featureId || hasPermission(featureId, permission);

  // If hideIfNoPermission is true and the user doesn't have permission, don't render anything
  if (hideIfNoPermission && !hasRequiredPermission) {
    return null;
  }

  // Base button classes
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-all';
  
  // Enabled button classes
  const enabledClasses = 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800';
  
  // Disabled button classes
  const disabledClasses = 'bg-gray-300 text-gray-500 cursor-not-allowed';
  
  // Combine classes based on permission
  const buttonClasses = `${baseClasses} ${hasRequiredPermission ? enabledClasses : disabledClasses} ${className}`;

  return (
    <button
      className={buttonClasses}
      onClick={hasRequiredPermission ? onClick : undefined}
      disabled={!hasRequiredPermission}
      {...rest}
    >
      {children}
    </button>
  );
};

export default PermissionButton; 