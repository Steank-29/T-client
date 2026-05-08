import React, { useState, useEffect, useCallback } from 'react';
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
  Chip,
  Stack,
} from '@mui/material';
import {
  Notifications,
  Menu as MenuIcon,
  KeyboardArrowDown,
  Person,
  Settings,
  Logout,
  ShoppingCart,
  Receipt,
  FiberManualRecord,
  AccessTime,
  AttachMoney,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { getCurrentPageTitle } from '../config/adminNavigation';
import { logout, getUserInitials } from '../utils/auth';
import { orderService } from '../services/api';

const TopBar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    admin,
    sidebarCollapsed,
    toggleMobileSidebar,
  } = useAdmin();

  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);
  
  // ✅ Order notifications state
  const [todayOrders, setTodayOrders] = useState([]);
  const [todayOrdersCount, setTodayOrdersCount] = useState(0);
  const [unreadOrderCount, setUnreadOrderCount] = useState(0);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // ✅ Fetch today's orders
  const fetchTodayOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      const response = await orderService.getOrders({
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        startDate: startOfDay.toISOString(),
        endDate: endOfDay.toISOString(),
      });

      if (response.data.success) {
        const orders = response.data.data || [];
        setTodayOrders(orders);
        setTodayOrdersCount(orders.length);
        
        // ✅ Check localStorage for read notifications
        const readOrders = JSON.parse(localStorage.getItem('readOrderNotifications') || '[]');
        const unreadCount = orders.filter(order => !readOrders.includes(order._id)).length;
        setUnreadOrderCount(unreadCount);
      }
    } catch (error) {
      console.error('Error fetching today orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  // ✅ Fetch orders on mount and every 2 minutes
  useEffect(() => {
    fetchTodayOrders();
    const interval = setInterval(fetchTodayOrders, 120000); // Refresh every 2 minutes
    return () => clearInterval(interval);
  }, [fetchTodayOrders]);

  // ✅ Mark all notifications as read
  const markAllAsRead = () => {
    const allOrderIds = todayOrders.map(order => order._id);
    localStorage.setItem('readOrderNotifications', JSON.stringify(allOrderIds));
    setUnreadOrderCount(0);
  };

  // ✅ Mark single notification as read
  const markAsRead = (orderId) => {
    const readOrders = JSON.parse(localStorage.getItem('readOrderNotifications') || '[]');
    if (!readOrders.includes(orderId)) {
      readOrders.push(orderId);
      localStorage.setItem('readOrderNotifications', JSON.stringify(readOrders));
      setUnreadOrderCount(prev => Math.max(0, prev - 1));
    }
  };

  // ✅ Format time
  const getTimeAgo = (date) => {
    const now = new Date();
    const orderDate = new Date(date);
    const diffMs = now - orderDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

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

  const formatCurrency = (amount) => `${parseFloat(amount || 0).toFixed(2)} TND`;

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
          {/* ✅ Today's Orders Badge (quick view) */}
          <Tooltip title={`${todayOrdersCount} orders today`} arrow>
            <Chip
              icon={<ShoppingCart sx={{ fontSize: 16 }} />}
              label={todayOrdersCount}
              size="small"
              sx={{
                fontFamily: 'Amaranth, sans-serif',
                fontWeight: 700,
                fontSize: '0.75rem',
                bgcolor: alpha('#4caf50', 0.08),
                color: '#4caf50',
                border: '1px solid rgba(76,175,80,0.2)',
                height: 32,
                display: { xs: 'none', sm: 'inline-flex' },
              }}
            />
          </Tooltip>

          {/* ✅ Notifications Bell */}
          <Tooltip title={`${unreadOrderCount} unread orders today`} arrow>
            <IconButton
              onClick={(e) => {
                setNotificationsAnchor(e.currentTarget);
              }}
              sx={{
                color: '#141010',
                transition: 'all 0.2s ease',
                position: 'relative',
                '&:hover': { 
                  bgcolor: alpha('#141010', 0.05) 
                },
                // ✅ Pulse animation when there are unread
                animation: unreadOrderCount > 0 ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { boxShadow: '0 0 0 0 rgba(200,16,46,0.4)' },
                  '70%': { boxShadow: '0 0 0 10px rgba(200,16,46,0)' },
                  '100%': { boxShadow: '0 0 0 0 rgba(200,16,46,0)' },
                },
              }}
            >
              <Badge
                badgeContent={unreadOrderCount}
                sx={{
                  '& .MuiBadge-badge': {
                    fontFamily: 'Amaranth, sans-serif',
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    bgcolor: '#e70000',
                    color: '#ffffff',
                    minWidth: 18,
                    height: 18,
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

      {/* ✅ Notifications Menu - Today's Orders */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={() => {
          setNotificationsAnchor(null);
          // Mark all as read when closing
          markAllAsRead();
        }}
        PaperProps={{
          sx: {
            mt: 1.5,
            borderRadius: '12px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
            minWidth: 380,
            maxWidth: 420,
            maxHeight: 480,
            overflow: 'hidden',
            fontFamily: 'Amaranth, sans-serif',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Header */}
        <Box 
          sx={{ 
            p: 2.5, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            bgcolor: '#fcfefe',
          }}
        >
          <Box>
            <Typography 
              sx={{ 
                fontFamily: 'Amaranth, sans-serif',
                fontWeight: 700, 
                fontSize: '1rem',
                color: '#141010',
              }}
            >
              Today's Orders
            </Typography>
            <Typography 
              sx={{ 
                fontFamily: 'Amaranth, sans-serif',
                fontSize: '0.7rem',
                color: '#666',
                mt: 0.3,
              }}
            >
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={`${todayOrdersCount} orders`}
              size="small"
              sx={{
                fontFamily: 'Amaranth, sans-serif',
                fontWeight: 600,
                fontSize: '0.7rem',
                bgcolor: alpha('#4caf50', 0.1),
                color: '#4caf50',
                height: 24,
              }}
            />
            {unreadOrderCount > 0 && (
              <Typography
                onClick={markAllAsRead}
                sx={{
                  fontFamily: 'Amaranth, sans-serif',
                  fontSize: '0.7rem',
                  color: '#141010',
                  fontWeight: 600,
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Mark read
              </Typography>
            )}
          </Stack>
        </Box>

        {/* Orders List */}
        <Box sx={{ maxHeight: 350, overflowY: 'auto' }}>
          {loadingOrders ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography sx={{ fontFamily: 'Amaranth, sans-serif', color: '#666', fontSize: '0.85rem' }}>
                Loading orders...
              </Typography>
            </Box>
          ) : todayOrders.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Receipt sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
              <Typography sx={{ fontFamily: 'Amaranth, sans-serif', color: '#666', fontWeight: 600 }}>
                No orders today
              </Typography>
              <Typography sx={{ fontFamily: 'Amaranth, sans-serif', color: '#999', fontSize: '0.75rem', mt: 0.5 }}>
                New orders will appear here
              </Typography>
            </Box>
          ) : (
            todayOrders.map((order) => {
              const isUnread = !JSON.parse(localStorage.getItem('readOrderNotifications') || '[]').includes(order._id);
              
              return (
                <MenuItem
                  key={order._id}
                  onClick={() => {
                    markAsRead(order._id);
                    setNotificationsAnchor(null);
                    navigate(`/admin/orders?highlight=${order._id}`);
                  }}
                  sx={{
                    py: 2,
                    px: 2.5,
                    borderLeft: isUnread 
                      ? '3px solid #c8102e' 
                      : '3px solid transparent',
                    transition: 'all 0.2s ease',
                    fontFamily: 'Amaranth, sans-serif',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    gap: 0.5,
                    '&:hover': { 
                      bgcolor: alpha('#141010', 0.02) 
                    },
                  }}
                >
                  {/* Top Row: Order Number + Time */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ 
                        fontFamily: 'Amaranth, sans-serif',
                        fontSize: '0.8rem', 
                        fontWeight: 700, 
                        color: '#141010',
                      }}>
                        #{order.orderNumber}
                      </Typography>
                      {isUnread && (
                        <FiberManualRecord sx={{ fontSize: 8, color: '#c8102e' }} />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTime sx={{ fontSize: 12, color: '#aaa' }} />
                      <Typography sx={{ 
                        fontFamily: 'Amaranth, sans-serif',
                        fontSize: '0.65rem', 
                        color: '#aaa',
                      }}>
                        {getTimeAgo(order.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Middle Row: Customer + Amount */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ 
                      fontFamily: 'Amaranth, sans-serif',
                      fontSize: '0.8rem', 
                      color: '#666',
                      fontWeight: 500,
                    }}>
                      {order.customer.fullName}
                    </Typography>
                    <Typography sx={{ 
                      fontFamily: 'Amaranth, sans-serif',
                      fontSize: '0.85rem', 
                      fontWeight: 700, 
                      color: '#c8102e',
                    }}>
                      {formatCurrency(order.finalAmount)}
                    </Typography>
                  </Box>
                  
                  {/* Bottom Row: Items + Status */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ 
                      fontFamily: 'Amaranth, sans-serif',
                      fontSize: '0.7rem', 
                      color: '#999',
                    }}>
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • {order.paymentMethod === 'cash_on_delivery' ? 'COD' : order.paymentMethod}
                    </Typography>
                    <Chip
                      label={order.status}
                      size="small"
                      sx={{
                        fontFamily: 'Amaranth, sans-serif',
                        fontWeight: 600,
                        fontSize: '0.6rem',
                        height: 20,
                        bgcolor: order.status === 'pending' ? alpha('#ff9800', 0.1) : alpha('#4caf50', 0.1),
                        color: order.status === 'pending' ? '#ff9800' : '#4caf50',
                      }}
                    />
                  </Box>
                </MenuItem>
              );
            })
          )}
        </Box>

        {/* Footer */}
        <Box 
          sx={{ 
            p: 2, 
            borderTop: '1px solid rgba(0,0,0,0.06)', 
            textAlign: 'center',
            bgcolor: '#fafafa',
          }}
        >
          <Typography
            onClick={() => {
              setNotificationsAnchor(null);
              navigate('/admin/orders');
            }}
            sx={{
              fontFamily: 'Amaranth, sans-serif',
              fontSize: '0.8rem',
              color: '#141010',
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            View All Orders →
          </Typography>
        </Box>
      </Menu>

      {/* Profile Menu (unchanged) */}
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