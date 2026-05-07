import React from 'react';
import {
  Box,
  Drawer,
  IconButton,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Close } from '@mui/icons-material';
import { AdminProvider, useAdmin } from '../context/AdminContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { getAdminData } from '../utils/auth';

// This component uses useAdmin, so it must be inside AdminProvider
const AdminLayoutInner = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { sidebarCollapsed, mobileSidebarOpen, toggleMobileSidebar } = useAdmin();
  
  const sidebarWidth = sidebarCollapsed ? 80 : 280;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box
          component="nav"
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            width: sidebarWidth,
            zIndex: theme.zIndex.drawer,
            transition: theme.transitions.create('width', {
              duration: theme.transitions.duration.standard,
            }),
          }}
        >
          <Sidebar />
        </Box>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileSidebarOpen}
          onClose={toggleMobileSidebar}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: 280,
              bgcolor: 'background.sidebar',
            },
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              p: 1,
              bgcolor: 'background.sidebar',
            }}
          >
            <IconButton onClick={toggleMobileSidebar} sx={{ color: 'text.sidebar' }}>
              <Close />
            </IconButton>
          </Box>
          <Sidebar variant="mobile" />
        </Drawer>
      )}

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flex: 1,
          ml: { xs: 0, md: `${sidebarWidth}px` },
          transition: theme.transitions.create('margin', {
            duration: theme.transitions.duration.standard,
          }),
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          mt:4
        }}
      >
        <TopBar />
        
        {/* Page Content */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3 },
            pt: '88px', // 72px (topbar) + 16px padding
            overflow: 'auto',
          }}
        >
          {children}
        </Box>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 2,
            px: 3,
            borderTop: `1px solid ${theme.palette.divider}`,
            textAlign: 'center',
            bgcolor: 'background.paper',
          }}
        >
          <Box
            component="span"
            sx={{
              fontSize: '0.8rem',
              color: 'text.secondary',
            }}
          >
            © {new Date().getFullYear()} Tawakkul. All rights reserved.
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// Main AdminLayout component that wraps everything with AdminProvider
const AdminLayout = ({ children }) => {
  // Get admin data from localStorage using utility
  const adminData = getAdminData();
  
  return (
    <AdminProvider adminData={adminData}>
      <AdminLayoutInner>
        {children}
      </AdminLayoutInner>
    </AdminProvider>
  );
};

export default AdminLayout;