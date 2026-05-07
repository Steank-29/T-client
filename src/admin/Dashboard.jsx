import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  alpha,
} from '@mui/material';
import {
  Inventory,
  Category,
  LocalOffer,
  ContactMail,
  Settings,
  ShoppingCart,
  TrendingUp,
  People,
  ArrowForward,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getAdminData } from '../utils/auth';

const Dashboard = () => {
  const navigate = useNavigate();
  const adminData = getAdminData();
  const currentHour = new Date().getHours();

  // Get greeting based on time
  const getGreeting = () => {
    if (currentHour < 12) return 'Good Morning';
    if (currentHour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Quick access cards configuration
  const quickAccessCards = [
    {
      title: 'Products',
      description: 'Manage your product inventory, add new products, and update existing ones',
      icon: Inventory,
      path: '/admin/products',
      color: '#141010',
      bgColor: '#f2f9f1',
    },
    {
      title: 'Categories',
      description: 'Browse products organized by category with detailed statistics',
      icon: Category,
      path: '/admin/categories',
      color: '#4caf50',
      bgColor: '#f1f8f1',
    },
    {
      title: 'Orders',
      description: 'View and manage customer orders, track shipments, and process returns',
      icon: ShoppingCart,
      path: '/admin/orders',
      color: '#2196f3',
      bgColor: '#f1f5ff',
    },
    {
      title: 'Offers & Promotions',
      description: 'Create and manage special offers, discounts, and promotional deals',
      icon: LocalOffer,
      path: '/admin/offers',
      color: '#e70000',
      bgColor: '#fff1f1',
    },
    {
      title: 'Customers',
      description: 'View customer accounts, order history, and manage customer data',
      icon: People,
      path: '/admin/customers',
      color: '#ff9800',
      bgColor: '#fff8f1',
    },
    {
      title: 'Contact Messages',
      description: 'View and respond to contact form submissions from customers',
      icon: ContactMail,
      path: '/admin/contacts',
      color: '#9c27b0',
      bgColor: '#faf1fc',
    },
    {
      title: 'Analytics',
      description: 'View detailed analytics, sales reports, and performance metrics',
      icon: TrendingUp,
      path: '/admin/analytics',
      color: '#00bcd4',
      bgColor: '#f1fcfe',
    },
    {
      title: 'Settings',
      description: 'Manage your profile, security settings, and user accounts',
      icon: Settings,
      path: '/admin/settings',
      color: '#607d8b',
      bgColor: '#f5f7f8',
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 5 }}>
          <Typography
            sx={{
              fontFamily: 'Amaranth, sans-serif',
              fontSize: { xs: '1.5rem', sm: '2rem' },
              fontWeight: 700,
              color: '#141010',
              mb: 1,
            }}
          >
            {getGreeting()}, {adminData.name?.split(' ')[0] || 'Admin'}
          </Typography>
          <Typography
            sx={{
              fontFamily: 'Amaranth, sans-serif',
              fontSize: '1rem',
              color: '#666',
            }}
          >
            Welcome to the Tawakkul Admin Panel. Here's your quick overview.
          </Typography>
        </Box>
      </motion.div>

      {/* Quick Access Cards Grid */}
      <Grid container spacing={3}>
        {quickAccessCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={card.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                style={{ height: '100%' }}
              >
                <Card
                  onClick={() => navigate(card.path)}
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    borderRadius: '16px',
                    bgcolor: card.bgColor,
                    border: `1px solid ${alpha(card.color, 0.12)}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 30px ${alpha(card.color, 0.15)}`,
                      border: `1px solid ${alpha(card.color, 0.25)}`,
                      '& .arrow-icon': {
                        transform: 'translateX(4px)',
                        opacity: 1,
                      },
                      '& .card-icon': {
                        transform: 'scale(1.08) rotate(-3deg)',
                      },
                    },
                  }}
                >
                  {/* Decorative circle */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -25,
                      right: -25,
                      width: 110,
                      height: 110,
                      borderRadius: '50%',
                      bgcolor: alpha(card.color, 0.04),
                      pointerEvents: 'none',
                      transition: 'all 0.3s ease',
                    }}
                  />

                  <CardContent
                    sx={{
                      p: 3,
                      position: 'relative',
                      zIndex: 1,
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {/* Icon */}
                    <Box
                      className="card-icon"
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '14px',
                        bgcolor: alpha(card.color, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2.5,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <IconComponent sx={{ color: card.color, fontSize: 28 }} />
                    </Box>

                    {/* Title */}
                    <Typography
                      sx={{
                        fontFamily: 'Amaranth, sans-serif',
                        fontSize: '1.15rem',
                        fontWeight: 700,
                        color: '#141010',
                        mb: 1.5,
                      }}
                    >
                      {card.title}
                    </Typography>

                    {/* Description */}
                    <Typography
                      sx={{
                        fontFamily: 'Amaranth, sans-serif',
                        fontSize: '0.85rem',
                        color: '#666',
                        lineHeight: 1.6,
                        flex: 1,
                        mb: 2,
                      }}
                    >
                      {card.description}
                    </Typography>

                    {/* Arrow link */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        color: card.color,
                        mt: 'auto',
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: 'Amaranth, sans-serif',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: 'inherit',
                        }}
                      >
                        Access {card.title}
                      </Typography>
                      <ArrowForward
                        className="arrow-icon"
                        sx={{
                          fontSize: 16,
                          transition: 'all 0.3s ease',
                          opacity: 0.7,
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Box sx={{ mt: 5, textAlign: 'center' }}>
          <Typography
            sx={{
              fontFamily: 'Amaranth, sans-serif',
              fontSize: '0.8rem',
              color: '#bbb',
            }}
          >
            © {new Date().getFullYear()} Tawakkul Admin Panel. All rights reserved.
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
};

export default Dashboard;