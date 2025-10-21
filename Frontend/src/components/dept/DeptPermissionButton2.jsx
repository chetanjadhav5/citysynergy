import { useAuth } from "../../context/AuthContext";
import { hasPermission } from "../../utils/deptPermissionUtils";
import Button from "./Button";

const DeptPermissionButton2 = ({
  children,
  featureId,
  permissionType = "write",
  onClick,
  disabled = false,
  className = "",
  ...props
}) => {
  const { user, permissions } = useAuth();

  const isDisabled = disabled || !hasPermission(permissions, featureId, permissionType);

  return (
    <Button
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={`${className} ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
      {...props}
    >
      {children}
    </Button>
  );
};

export default DeptPermissionButton2;