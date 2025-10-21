import { useAuth } from '../../context/AuthContext';
import Button from './Button';
/**
 * Permission button component specifically for department features
 * This handles the FEAT_* format feature IDs used in department permissions
 */
const DeptPermissionButton = ({ 
  children, 
  featureId, 
  permissionType = 'write', 
  onClick, 
  disabled = false,
  className = '',
  ...props 
}) => {
  const { user, permissions } = useAuth();
  
  const hasPermission = () => {
    if (!user || !permissions) {
      return false;
    }

    // First check if the user has direct can permissions
    if (permissions.can) {
      if (featureId === 'FEAT_INVENTORY' && permissions.can.manageInventory) {
        return true;
      }
      if (featureId === 'FEAT_USER_MGMT' && permissions.can.manageUsers) {
        return true;
      }
      if (featureId === 'FEAT_DEPT_MGMT' && permissions.can.manageDepartments) {
        return true;
      }
      if (featureId === 'FEAT_ROLE_MGMT' && permissions.can.manageRoles) {
        return true;
      }
      if (featureId === 'FEAT_ISSUES' && permissions.can.manageIssues) {
        return true;
      }
      if (featureId === 'FEAT_CLASHES' && permissions.can.manageClashes) {
        return true;
      }
      if (featureId === 'FEAT_TENDERS' && permissions.can.manageTenders) {
        return true;
      }
    }

    // Then check role-based permissions
    if (permissions.roles && permissions.roles.length > 0) {
      for (const role of permissions.roles) {
        if (role.features && role.features.length > 0) {
          const feature = role.features.find(f => f.id === featureId);
          if (feature && feature.permissions && feature.permissions[permissionType]) {
            return true;
          }
        }
      }
    }

    return false;
  };

  const isDisabled = disabled || !hasPermission();

  return (
<Button
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={`${className} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      {...props}
    >
      {children}
    </Button>
  );
};

export default DeptPermissionButton;
