import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children, adminData }) => {
  // Parse admin data from localStorage or use prop
  const getAdminFromStorage = () => {
    try {
      const userStr = localStorage.getItem('tawakkul_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return {
          id: user.id || null,
          name: user.name || 'Admin',
          email: user.email || 'admin@tawakkul.tn',
          role: user.role === 'admin' ? 'Administrator' : user.role || 'User',
          gender: user.gender || null,
          dateOfBirth: user.dateOfBirth || null,
          avatar: user.avatar || null,
        };
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    return adminData || {
      id: null,
      name: 'Admin',
      email: 'admin@tawakkul.tn',
      role: 'Administrator',
      gender: null,
      dateOfBirth: null,
      avatar: null,
    };
  };

  const [admin, setAdmin] = useState(getAdminFromStorage);
  
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New order received', time: '2 min ago', unread: true, type: 'order' },
    { id: 2, text: 'New contact message', time: '15 min ago', unread: true, type: 'contact' },
    { id: 3, text: 'Low stock alert', time: '1 hour ago', unread: false, type: 'alert' },
  ]);
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('adminDarkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const unreadNotificationsCount = notifications.filter(n => n.unread).length;

  // Refresh admin data when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setAdmin(getAdminFromStorage());
    };

    // Listen for storage changes (in case user data updates)
    window.addEventListener('storage', handleStorageChange);
    
    // Also check on focus (when switching tabs)
    window.addEventListener('focus', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, [adminData]);

  useEffect(() => {
    localStorage.setItem('adminDarkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const markNotificationAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, unread: false } : n)
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  }, []);

  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(prev => !prev);
  }, []);

  // Update admin data method
  const updateAdmin = useCallback((newData) => {
    setAdmin(prev => ({ ...prev, ...newData }));
    // Optionally update localStorage
    try {
      const userStr = localStorage.getItem('tawakkul_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const updatedUser = { ...user, ...newData };
        localStorage.setItem('tawakkul_user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  }, []);

  const value = {
    admin,
    setAdmin: updateAdmin,
    notifications,
    unreadNotificationsCount,
    darkMode,
    sidebarCollapsed,
    mobileSidebarOpen,
    toggleDarkMode,
    toggleSidebar,
    toggleMobileSidebar,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    addNotification,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};