import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Logout,
  ChevronLeft,
  Dashboard,
  TrendingUp,
  ShoppingCart,
  Inventory,
  Category,
  People,
  LocalOffer,
  Settings,
  TrackChanges,
  ContactMail,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { useAdmin } from '../context/AdminContext';
import { logout as logoutUtil } from '../utils/auth';
import logoImage from '../assets/tawakkol.png';

const sidebarNavigation = [
  { 
    section: 'Main',
    items: [
      { label: 'Dashboard', icon: Dashboard, path: '/admin', description: 'Overview and statistics' },
      { label: 'Trace', icon: TrackChanges, path: '/admin/trace', description: 'Tracing Website' },
    ]
  },
  {
    section: 'Management',
    items: [
      { label: 'Orders', icon: ShoppingCart, path: '/admin/orders', badge: 5, description: 'Manage customer orders' },
      { label: 'Products', icon: Inventory, path: '/admin/products', description: 'Product inventory management' },
      { label: 'Categories', icon: Category, path: '/admin/categories', description: 'Product categories' },
      { label: 'Offers', icon: LocalOffer, path: '/admin/offers', description: 'Special offers and promotions' },
    ]
  },
  {
    section: 'Other',
    items: [
      { label: 'Settings', icon: Settings, path: '/admin/settings', description: 'System settings' },
      { label: 'Contact', icon: ContactMail, path: '/admin/contacts', description: 'Contact form submissions' },
    ]
  },
];

const Sidebar = ({ variant = 'desktop' }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, toggleMobileSidebar } = useAdmin();
  
  const isMobile = variant === 'mobile';
  const collapsed = !isMobile && sidebarCollapsed;

  const handleLogout = () => {
    logoutUtil();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) toggleMobileSidebar();
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#141010',
        color: '#ffffff',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: collapsed ? 2 : 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          minHeight: 72,
        }}
      >
        {!collapsed ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            <Box
              component="img"
              src={logoImage}
              alt="Tawakkol Logo"
              sx={{
                width: 40,
                height: 40,
                borderRadius: '8px',
                objectFit: 'cover',
              }}
            />
            <Box>
              <Typography
                sx={{
                  fontSize: '1.3rem',
                  fontWeight: 900,
                  letterSpacing: '2px',
                  color: '#ffffff',
                  lineHeight: 1.2,
                  cursor: 'pointer',
                }}
                onClick={() => handleNavigation('/admin')}
              >
                TAWAKKOL
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.6rem',
                  color: 'rgba(255,255,255,0.5)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                Admin Panel
              </Typography>
            </Box>
          </motion.div>
        ) : (
          <Box
            component="img"
            src={logoImage}
            alt="Tawakkol"
            sx={{
              width: 40,
              height: 40,
              borderRadius: '8px',
              objectFit: 'cover',
              cursor: 'pointer',
            }}
            onClick={() => handleNavigation('/admin')}
          />
        )}
        {!isMobile && (
          <IconButton
            onClick={toggleSidebar}
            sx={{
              color: 'rgba(255,255,255,0.6)',
              transition: 'all 0.3s ease',
              '&:hover': { 
                color: '#ffffff', 
                bgcolor: 'rgba(255,255,255,0.1)' 
              },
            }}
          >
            <ChevronLeft 
              sx={{ 
                transform: collapsed ? 'rotate(180deg)' : 'rotate(0)', 
                transition: 'transform 0.3s ease' 
              }} 
            />
          </IconButton>
        )}
      </Box>

      {/* Navigation Items - No scrollbar */}
      <Box 
        sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          overflowX: 'hidden', 
          py: 1,
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        {sidebarNavigation.map((section, idx) => (
          <Box key={`section-${idx}`}>
            {!collapsed && (
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.35)',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  px: 3,
                  py: 1.5,
                }}
              >
                {section.section}
              </Typography>
            )}
            <List sx={{ px: collapsed ? 1 : 1.5 }}>
              {section.items.map((item) => {
                const isActive = location.pathname === item.path || 
                  (item.path !== '/admin' && location.pathname.startsWith(item.path));
                const IconComponent = item.icon;
                
                return (
                  <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                    <Tooltip 
                      title={collapsed ? item.label : item.description || ''} 
                      placement="right" 
                      arrow
                    >
                      <ListItemButton
                        onClick={() => handleNavigation(item.path)}
                        sx={{
                          py: 1.2,
                          px: collapsed ? 1.5 : 2,
                          justifyContent: collapsed ? 'center' : 'flex-start',
                          bgcolor: isActive ? '#c31919' : 'transparent',
                          color: isActive 
                            ? '#ffffff' 
                            : 'rgba(255,255,255,0.7)',
                          borderRadius: '12px',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: isActive 
                              ? '#c31919' 
                              : 'rgba(255,255,255,0.08)',
                            color: '#ffffff',
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: collapsed ? 'auto' : 40,
                            color: 'inherit',
                            justifyContent: 'center',
                          }}
                        >
                          <IconComponent />
                        </ListItemIcon>
                        {!collapsed && (
                          <>
                            <ListItemText
                              primary={item.label}
                              primaryTypographyProps={{
                                sx: {
                                  fontSize: '0.9rem',
                                  fontWeight: isActive ? 600 : 400,
                                },
                              }}
                            />
                            {item.badge && (
                              <Badge
                                badgeContent={item.badge}
                                sx={{
                                  '& .MuiBadge-badge': {
                                    bgcolor: '#ffffff',
                                    color: '#c31919',
                                    fontWeight: 700,
                                    fontSize: '0.7rem',
                                  },
                                }}
                              />
                            )}
                          </>
                        )}
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                );
              })}
            </List>
            {!collapsed && idx < sidebarNavigation.length - 1 && (
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2, my: 0.5 }} />
            )}
          </Box>
        ))}
      </Box>

      {/* Bottom Section */}
      <Box 
        sx={{ 
          borderTop: '1px solid rgba(255,255,255,0.08)', 
          p: collapsed ? 1.5 : 2,
          flexShrink: 0,
        }}
      >
        <ListItemButton
          onClick={handleLogout}
          sx={{
            py: 1.2,
            px: collapsed ? 1.5 : 2,
            justifyContent: collapsed ? 'center' : 'flex-start',
            color: 'rgba(255,255,255,0.6)',
            borderRadius: '12px',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'rgba(231,0,0,0.15)',
              color: '#e70000',
            },
          }}
        >
          <ListItemIcon 
            sx={{ 
              minWidth: collapsed ? 'auto' : 40, 
              color: 'inherit', 
              justifyContent: 'center' 
            }}
          >
            <Logout />
          </ListItemIcon>
          {!collapsed && (
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{
                sx: { fontSize: '0.9rem' },
              }}
            />
          )}
        </ListItemButton>
      </Box>
    </Box>
  );
};

export default Sidebar;