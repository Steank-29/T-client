// src/utils/auth.js

/**
 * Get the authentication token from localStorage
 * @returns {string|null} The auth token or null if not found
 */
export const getAuthToken = () => {
  try {
    return localStorage.getItem('tawakkul_token');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Get the current user data from localStorage
 * @returns {object|null} The user object or null if not found/invalid
 */
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('tawakkul_user');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    
    // Validate user object has required fields
    if (!user || typeof user !== 'object') return null;
    
    return {
      id: user.id || null,
      name: user.name || 'Unknown User',
      email: user.email || '',
      role: user.role || 'user',
      gender: user.gender || null,
      dateOfBirth: user.dateOfBirth || null,
      avatar: user.avatar || null,
      ...user // Include any additional fields
    };
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has a valid token
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

/**
 * Check if current user has admin role
 * @returns {boolean} True if user is admin
 */
export const isAdmin = () => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};

/**
 * Get user's display name (first name only)
 * @returns {string} First name or 'Admin' as fallback
 */
export const getUserDisplayName = () => {
  const user = getCurrentUser();
  if (!user?.name) return 'Admin';
  
  const nameParts = user.name.split(' ');
  return nameParts[0];
};

/**
 * Get user's initials for avatar
 * @returns {string} Up to 2 characters of initials
 */
export const getUserInitials = () => {
  const user = getCurrentUser();
  if (!user?.name) return 'A';
  
  return user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Get formatted admin data for the admin panel
 * @returns {object} Formatted admin data object
 */
export const getAdminData = () => {
  const user = getCurrentUser();
  
  return {
    id: user?.id || null,
    name: user?.name || 'Admin',
    email: user?.email || 'admin@tawakkul.tn',
    role: user?.role === 'admin' ? 'Administrator' : user?.role || 'User',
    gender: user?.gender || null,
    dateOfBirth: user?.dateOfBirth || null,
    avatar: user?.avatar || null,
  };
};

/**
 * Save authentication data to localStorage
 * @param {string} token - JWT token
 * @param {object} userData - User data object
 */
export const saveAuthData = (token, userData) => {
  try {
    localStorage.setItem('tawakkul_token', token);
    localStorage.setItem('tawakkul_user', JSON.stringify(userData));
    
    // Dispatch storage event for other tabs/components
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error('Error saving auth data:', error);
  }
};

/**
 * Update user data in localStorage
 * @param {object} updates - Partial user data to update
 * @returns {object|null} Updated user data or null if failed
 */
export const updateUserData = (updates) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;
    
    const updatedUser = { ...currentUser, ...updates };
    localStorage.setItem('tawakkul_user', JSON.stringify(updatedUser));
    
    // Dispatch storage event for other tabs/components
    window.dispatchEvent(new Event('storage'));
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating user data:', error);
    return null;
  }
};

/**
 * Logout user by removing auth data from localStorage
 */
export const logout = () => {
  try {
    localStorage.removeItem('tawakkul_token');
    localStorage.removeItem('tawakkul_user');
    
    // Clear any other admin-related data
    localStorage.removeItem('adminDarkMode');
    localStorage.removeItem('adminSidebarCollapsed');
    
    // Dispatch storage event for other tabs/components
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

/**
 * Check if token is expired (if using JWT)
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = () => {
  const token = getAuthToken();
  if (!token) return true;
  
  try {
    // For JWT tokens, decode and check expiration
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    if (payload.exp) {
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expirationTime;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Assume expired if can't decode
  }
};

/**
 * Get user role display text
 * @returns {string} Formatted role text
 */
export const getUserRoleDisplay = () => {
  const user = getCurrentUser();
  if (!user) return 'User';
  
  switch (user.role) {
    case 'admin':
      return 'Administrator';
    case 'user':
      return 'User';
    case 'moderator':
      return 'Moderator';
    case 'editor':
      return 'Editor';
    default:
      return user.role || 'User';
  }
};

/**
 * Check if user has specific permission
 * @param {string} permission - Permission to check
 * @returns {boolean} True if user has the permission
 */
export const hasPermission = (permission) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Admin has all permissions
  if (user.role === 'admin') return true;
  
  // Check user permissions array if it exists
  if (user.permissions && Array.isArray(user.permissions)) {
    return user.permissions.includes(permission);
  }
  
  return false;
};

// Default export for convenience
export default {
  getAuthToken,
  getCurrentUser,
  isAuthenticated,
  isAdmin,
  getUserDisplayName,
  getUserInitials,
  getAdminData,
  saveAuthData,
  updateUserData,
  logout,
  isTokenExpired,
  getUserRoleDisplay,
  hasPermission,
};