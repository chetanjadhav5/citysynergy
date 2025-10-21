import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

export const AuthGuard = ({ children, requireAuth = false }) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
  const isAuthenticated = token && userData;
  
  if (requireAuth && !isAuthenticated) {
    // Redirect to login if authentication is required but user is not logged in
    return <Navigate to="/login" replace />;
  }
  
  if (!requireAuth && isAuthenticated) {
    // Redirect to home if user is already logged in and trying to access auth pages
    return <Navigate to="/home" replace />;
  }
  
  return children;
};

AuthGuard.propTypes = {
  children: PropTypes.node.isRequired,
  requireAuth: PropTypes.bool
}; 