/**
 * Permission utility functions for managing feature access
 */

/**
 * Feature IDs from the API
 */
export const FEATURES = {
  // Department feature IDs
  CLASHES: "FEAT_CLASHES",
  DEPARTMENT: "FEAT_DEPT_MGMT",
  INVENTORY: "FEAT_INVENTORY",
  ISSUES: "FEAT_ISSUES",
  ROLES: "FEAT_ROLE_MGMT",
  TENDERS: "FEAT_TENDERS",
  USERS: "FEAT_USER_MGMT",
  
  // Dev feature IDs
  DEV_USERS: "FEAT001",
  DEV_DEPARTMENTS: "FEAT002",
  DEV_ROLES: "FEAT003",
  DEV_FEATURES: "FEAT004",
  DEV_CLASHES: "FEAT005"
};

/**
 * Permission types
 */
export const PERMISSIONS = {
  READ: "read",
  WRITE: "write",
  UPDATE: "update",
  DELETE: "delete"
};

/**
 * Check if a user has a specific permission for a feature
 * @param {Object} permissions - The permissions object from the auth context
 * @param {string} featureId - The feature ID to check
 * @param {string} permissionType - The permission type (read, write, update, delete)
 * @returns {boolean} - Whether the user has the permission
 */
export const hasPermission = (permissions, featureId, permissionType) => {
  if (!permissions || !permissions.roles || permissions.roles.length === 0) {
    return false;
  }

  // Look through all roles
  for (const role of permissions.roles) {
    // Find the feature in this role
    const feature = role.features.find(f => f.id === featureId);
    
    // If feature exists and has the requested permission
    if (feature && feature.permissions && feature.permissions[permissionType]) {
      return true;
    }
  }
  
  return false;
};

/**
 * Check if a component should be rendered based on permission
 * @param {Object} permissions - The permissions object from the auth context
 * @param {string} featureId - The feature ID to check
 * @param {string} permissionType - The permission type (read, write, update, delete)
 * @returns {boolean} - Whether the component should be rendered
 */
export const canRender = (permissions, featureId, permissionType = PERMISSIONS.READ) => {
  return hasPermission(permissions, featureId, permissionType);
};

/**
 * Create a permission checker function for a specific feature
 * @param {string} featureId - The feature ID to check
 * @returns {Function} - A function that takes permissions and permission type and returns boolean
 */
export const createPermissionChecker = (featureId) => {
  return (permissions, permissionType = PERMISSIONS.READ) => {
    return hasPermission(permissions, featureId, permissionType);
  };
};

// Pre-defined permission checkers for common features
export const canManageClashes = createPermissionChecker(FEATURES.CLASHES);
export const canManageDepartment = createPermissionChecker(FEATURES.DEPARTMENT);
export const canManageInventory = createPermissionChecker(FEATURES.INVENTORY);
export const canManageIssues = createPermissionChecker(FEATURES.ISSUES);
export const canManageRoles = createPermissionChecker(FEATURES.ROLES);
export const canManageTenders = createPermissionChecker(FEATURES.TENDERS);
export const canManageUsers = createPermissionChecker(FEATURES.USERS); 