import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  Divider,
  alpha,
  useMediaQuery,
} from '@mui/material';
import {
  Notifications,
  Menu as MenuIcon,
  KeyboardArrowDown,
  Person,
  Settings,
  Logout,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { getCurrentPageTitle } from '../config/adminNavigation';
import { logout, getUserInitials } from '../utils/auth';

const TopBar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    admin,
    notifications,
    unreadNotificationsCount,
    sidebarCollapsed,
    toggleMobileSidebar,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useAdmin();

  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);

  const handleLogout = () => {
    logout();
    setProfileAnchor(null);
    setNotificationsAnchor(null);
    navigate('/login');
  };

  const sidebarWidth = sidebarCollapsed ? 80 : 280;
  const currentPageTitle = getCurrentPageTitle(location.pathname);
  const userInitials = getUserInitials();
  
  const getDisplayName = () => {
    if (!admin.name) return 'Admin';
    const nameParts = admin.name.split(' ');
    return nameParts[0];
  };

  const getRoleDisplay = () => {
    if (admin.role === 'admin') return 'Administrator';
    if (admin.role === 'user') return 'User';
    return admin.role || 'User';
  };

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: { xs: 0, md: sidebarWidth },
          right: 0,
          height: 72,
          bgcolor: '#fcfefe',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2, md: 3 },
          zIndex: theme.zIndex.appBar,
          transition: theme.transitions.create(['left'], {
            duration: theme.transitions.duration.standard,
          }),
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        {/* Left Side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isMobile && (
            <IconButton onClick={toggleMobileSidebar} sx={{ color: '#141010' }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            sx={{
              fontFamily: 'Amaranth, sans-serif',
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#141010',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            {currentPageTitle}
          </Typography>
        </Box>

        {/* Right Side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notifications */}
          <Tooltip title={`Notifications (${unreadNotificationsCount} unread)`} arrow>
            <IconButton
              onClick={(e) => setNotificationsAnchor(e.currentTarget)}
              sx={{
                color: '#141010',
                transition: 'all 0.2s ease',
                '&:hover': { 
                  bgcolor: alpha('#141010', 0.05) 
                },
              }}
            >
              <Badge
                badgeContent={unreadNotificationsCount}
                sx={{
                  '& .MuiBadge-badge': {
                    fontFamily: 'Amaranth, sans-serif',
                    fontWeight: 600,
                    bgcolor: '#e70000',
                    color: '#ffffff',
                  },
                }}
              >
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Profile */}
          <Tooltip title={`${admin.name} - ${getRoleDisplay()}`} arrow>
            <Box
              onClick={(e) => setProfileAnchor(e.currentTarget)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                py: 0.5,
                px: 1.5,
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                fontFamily: 'Amaranth, sans-serif',
                '&:hover': { 
                  bgcolor: alpha('#141010', 0.04) 
                },
              }}
            >
              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: '#141010',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  fontFamily: 'Amaranth, sans-serif',
                }}
                src={admin.avatar || undefined}
              >
                {userInitials}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography 
                  sx={{ 
                    fontFamily: 'Amaranth, sans-serif',
                    fontSize: '0.85rem', 
                    fontWeight: 600, 
                    color: '#141010', 
                    lineHeight: 1.2 
                  }}
                >
                  {getDisplayName()}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography 
                    sx={{ 
                      fontFamily: 'Amaranth, sans-serif',
                      fontSize: '0.7rem', 
                      color: '#666' 
                    }}
                  >
                    {getRoleDisplay()}
                  </Typography>
                  {admin.role === 'admin' && (
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: '#4caf50',
                      }}
                    />
                  )}
                </Box>
              </Box>
              <KeyboardArrowDown 
                sx={{ 
                  fontSize: 18, 
                  color: '#666', 
                  display: { xs: 'none', sm: 'block' } 
                }} 
              />
            </Box>
          </Tooltip>
        </Box>
      </Box>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={() => setNotificationsAnchor(null)}
        PaperProps={{
          sx: {
            mt: 1.5,
            borderRadius: '12px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
            minWidth: 320,
            maxWidth: 360,
            overflow: 'hidden',
            fontFamily: 'Amaranth, sans-serif',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box 
          sx={{ 
            p: 2, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            borderBottom: '1px solid rgba(0,0,0,0.06)' 
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              fontFamily: 'Amaranth, sans-serif',
              fontWeight: 700, 
              color: '#141010' 
            }}
          >
            Notifications
          </Typography>
          {unreadNotificationsCount > 0 && (
            <Typography
              onClick={markAllNotificationsAsRead}
              sx={{
                fontFamily: 'Amaranth, sans-serif',
                fontSize: '0.75rem',
                color: '#141010',
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Mark all as read
            </Typography>
          )}
        </Box>
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography 
              sx={{ 
                fontFamily: 'Amaranth, sans-serif',
                color: '#666' 
              }}
            >
              No notifications
            </Typography>
          </Box>
        ) : (
          notifications.slice(0, 5).map((notif) => (
            <MenuItem
              key={notif.id}
              onClick={() => markNotificationAsRead(notif.id)}
              sx={{
                py: 1.5,
                px: 2,
                borderLeft: notif.unread 
                  ? '3px solid #141010' 
                  : '3px solid transparent',
                transition: 'all 0.2s ease',
                fontFamily: 'Amaranth, sans-serif',
                '&:hover': { 
                  bgcolor: alpha('#141010', 0.04) 
                },
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography 
                  sx={{ 
                    fontFamily: 'Amaranth, sans-serif',
                    fontSize: '0.85rem', 
                    color: '#141010', 
                    fontWeight: notif.unread ? 600 : 400 
                  }}
                >
                  {notif.text}
                </Typography>
                <Typography 
                  sx={{ 
                    fontFamily: 'Amaranth, sans-serif',
                    fontSize: '0.7rem', 
                    color: '#aaa', 
                    mt: 0.3 
                  }}
                >
                  {notif.time}
                </Typography>
              </Box>
              {notif.unread && (
                <Box 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: '#141010', 
                    ml: 1 
                  }} 
                />
              )}
            </MenuItem>
          ))
        )}
        <Box 
          sx={{ 
            p: 1.5, 
            borderTop: '1px solid rgba(0,0,0,0.06)', 
            textAlign: 'center' 
          }}
        >
          <Typography
            sx={{
              fontFamily: 'Amaranth, sans-serif',
              fontSize: '0.8rem',
              color: '#141010',
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            View All Notifications
          </Typography>
        </Box>
      </Menu>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={() => setProfileAnchor(null)}
        PaperProps={{
          sx: {
            mt: 1.5,
            borderRadius: '12px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
            minWidth: 220,
            overflow: 'hidden',
            fontFamily: 'Amaranth, sans-serif',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User Info Header */}
        <Box 
          sx={{ 
            p: 2.5, 
            textAlign: 'center', 
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            bgcolor: '#f2f9f1',
          }}
        >
          <Avatar 
            sx={{ 
              width: 56, 
              height: 56, 
              bgcolor: '#141010',
              mx: 'auto', 
              mb: 1.5,
              fontSize: '1.2rem',
              fontWeight: 700,
              fontFamily: 'Amaranth, sans-serif',
              border: '3px solid #fcfefe',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
            src={admin.avatar || undefined}
          >
            {userInitials}
          </Avatar>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontFamily: 'Amaranth, sans-serif',
              fontWeight: 700, 
              color: '#141010', 
              mb: 0.5 
            }}
          >
            {admin.name}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              fontFamily: 'Amaranth, sans-serif',
              color: '#666', 
              display: 'block', 
              mb: 0.5 
            }}
          >
            {admin.email}
          </Typography>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1.5,
              py: 0.5,
              borderRadius: '12px',
              bgcolor: admin.role === 'admin' ? alpha('#4caf50', 0.1) : alpha('#2196f3', 0.1),
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: admin.role === 'admin' ? '#4caf50' : '#2196f3',
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'Amaranth, sans-serif',
                fontWeight: 600,
                color: admin.role === 'admin' ? '#4caf50' : '#2196f3',
                textTransform: 'capitalize',
              }}
            >
              {getRoleDisplay()}
            </Typography>
          </Box>
        </Box>

        {/* Menu Items */}
        <MenuItem 
          onClick={() => { 
            setProfileAnchor(null); 
            navigate('/admin/settings'); 
          }} 
          sx={{ 
            gap: 1.5, 
            py: 1.5, 
            px: 2,
            fontFamily: 'Amaranth, sans-serif',
          }}
        >
          <Person sx={{ fontSize: 20 }} /> 
          <Box>
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'Amaranth, sans-serif',
                fontWeight: 500 
              }}
            >
              My Profile
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                fontFamily: 'Amaranth, sans-serif',
                color: '#666' 
              }}
            >
              View and edit your profile
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem 
          onClick={() => { 
            setProfileAnchor(null); 
            navigate('/admin/settings'); 
          }} 
          sx={{ 
            gap: 1.5, 
            py: 1.5, 
            px: 2,
            fontFamily: 'Amaranth, sans-serif',
          }}
        >
          <Settings sx={{ fontSize: 20 }} /> 
          <Box>
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'Amaranth, sans-serif',
                fontWeight: 500 
              }}
            >
              Settings
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                fontFamily: 'Amaranth, sans-serif',
                color: '#666' 
              }}
            >
              Manage your preferences
            </Typography>
          </Box>
        </MenuItem>
        
        <Divider />
        
        <MenuItem
          onClick={handleLogout}
          sx={{ 
            gap: 1.5, 
            py: 1.5, 
            px: 2,
            color: '#e70000', 
            fontFamily: 'Amaranth, sans-serif',
            '&:hover': { 
              bgcolor: alpha('#e70000', 0.08) 
            } 
          }}
        >
          <Logout sx={{ fontSize: 20 }} /> 
          <Box>
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'Amaranth, sans-serif',
                fontWeight: 500,
                color: '#e70000',
              }}
            >
              Sign Out
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                fontFamily: 'Amaranth, sans-serif',
                color: '#e70000',
                opacity: 0.7,
              }}
            >
              Logout from your account
            </Typography>
          </Box>
        </MenuItem>
      </Menu>
    </>
  );
};

export default TopBar;