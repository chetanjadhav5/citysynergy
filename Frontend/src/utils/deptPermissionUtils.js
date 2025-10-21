/**
 * Permission utility functions for managing feature access in department context
 */

/**
 * Feature IDs from the API for department users
 */
export const FEATURES = {
    CLASHES: "FEAT_CLASHES",
    DEPARTMENT: "FEAT_DEPT_MGMT",
    INVENTORY: "FEAT_INVENTORY",
    ISSUES: "FEAT_ISSUES",
    ROLES: "FEAT_ROLE_MGMT",
    TENDERS: "FEAT_TENDERS",
    USERS: "FEAT_USER_MGMT",
  };
  
  /**
   * Permission types
   */
  export const PERMISSIONS = {
    READ: "read",
    WRITE: "write",
    UPDATE: "update",
    DELETE: "delete",
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
  
    // First, check direct "can" permissions
    if (permissions.can) {
      switch (featureId) {
        case FEATURES.USERS:
          if (permissions.can.manageUsers) return true;
          break;
        case FEATURES.DEPARTMENT:
          if (permissions.can.manageDepartments) return true;
          break;
        case FEATURES.ROLES:
          if (permissions.can.manageRoles) return true;
          break;
        case FEATURES.INVENTORY:
          if (permissions.can.manageInventory) return true;
          break;
        case FEATURES.ISSUES:
          if (permissions.can.manageIssues) return true;
          break;
        case FEATURES.CLASHES:
          if (permissions.can.manageClashes) return true;
          break;
        case FEATURES.TENDERS:
          if (permissions.can.manageTenders) return true;
          break;
        default:
          break;
      }
    }
  
    // Then, check role-based permissions
    for (const role of permissions.roles) {
      if (role.features && role.features.length > 0) {
        const feature = role.features.find((f) => f.id === featureId);
        if (feature && feature.permissions && feature.permissions[permissionType]) {
          return true;
        }
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
  
  // Pre-defined permission checkers for common department features
  export const canManageClashes = createPermissionChecker(FEATURES.CLASHES);
  export const canManageDepartment = createPermissionChecker(FEATURES.DEPARTMENT);
  export const canManageInventory = createPermissionChecker(FEATURES.INVENTORY);
  export const canManageIssues = createPermissionChecker(FEATURES.ISSUES);
  export const canManageRoles = createPermissionChecker(FEATURES.ROLES);
  export const canManageTenders = createPermissionChecker(FEATURES.TENDERS);
  export const canManageUsers = createPermissionChecker(FEATURES.USERS);