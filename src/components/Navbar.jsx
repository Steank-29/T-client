import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Container,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  useMediaQuery,
  Button,
  Tooltip,
  Zoom,
  Fade,
  Divider,
  alpha,
  Avatar,
} from '@mui/material';
import {
  ShoppingCartOutlined,
  Person,
  CloseOutlined,
  MenuOutlined,
  KeyboardArrowDown,
  Add,
  Remove,
  Delete,
  ShoppingBag,
  LocalOffer,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/MainL.png';
import enFlag from '../assets/en.jpg';
import frFlag from '../assets/fr.jpg';
import arFlag from '../assets/ar.jpg';

// ==================== Constants ====================
const NAV_ITEMS = [
  { label: 'Home', path: '/', variant: 'default' },
  { label: 'Offers', path: '/offers', variant: 'offers' },
  { label: 'Sport', path: '/sport', variant: 'default' },
  { label: 'Streetwear', path: '/streetwear', variant: 'default' },
  { label: 'Religious', path: '/religious', variant: 'default' },
  { label: 'Contact', path: '/contact', variant: 'offers' },
];

const LANGUAGES = [
  { code: 'EN', label: 'English', flag: enFlag, flagAlt: 'English flag', dir: 'ltr' },
  { code: 'FR', label: 'Français', flag: frFlag, flagAlt: 'French flag', dir: 'ltr' },
  { code: 'AR', label: 'العربية', flag: arFlag, flagAlt: 'Arabic flag', dir: 'rtl' },
];

// ==================== Style Configs ====================
const navButtonStyle = (variant, isActive) => {
  const base = {
    fontFamily: 'Amaranth, sans-serif',
    fontSize: '0.95rem',
    textTransform: 'capitalize',
    borderRadius: '50px',
    px: 2.5,
    py: 0.8,
    minWidth: 'auto',
    position: 'relative',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const variants = {
    offers: {
      ...base,
      color: '#c31919',
      fontWeight: 700,
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 4,
        left: '50%',
        width: isActive ? '40%' : 0,
        height: '2px',
        backgroundColor: '#c31919',
        transition: 'all 0.3s ease',
        transform: 'translateX(-50%)',
      },
      '&:hover': {
        backgroundColor: alpha('#c31919', 0.08),
        transform: 'translateY(-2px)',
        '&::after': { width: '50%' },
      },
    },
    contact: {
      ...base,
      color: '#141010',
      textDecoration: 'underline',
      textDecorationColor: '#141010',
      textUnderlineOffset: '6px',
      textDecorationThickness: '2px',
      fontWeight: 600,
      '&:hover': {
        backgroundColor: alpha('#141010', 0.05),
        transform: 'translateY(-2px)',
      },
    },
    default: {
      ...base,
      color: '#141010',
      fontWeight: isActive ? 600 : 500,
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 4,
        left: '50%',
        width: isActive ? '40%' : 0,
        height: '2px',
        backgroundColor: '#141010',
        transition: 'all 0.3s ease',
        transform: 'translateX(-50%)',
      },
      '&:hover': {
        backgroundColor: alpha('#141010', 0.05),
        transform: 'translateY(-2px)',
        '&::after': { width: '50%' },
      },
    },
  };

  return variants[variant] || variants.default;
};

const iconButtonStyle = {
  color: '#141010',
  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  '&:hover': {
    backgroundColor: alpha('#141010', 0.08),
    transform: 'scale(1.1)',
  },
};

const badgeStyle = (size = 'normal') => ({
  '& .MuiBadge-badge': {
    bgcolor: '#e70000',
    color: 'white',
    fontFamily: 'Amaranth, sans-serif',
    fontWeight: 600,
    fontSize: '0.7rem',
    height: size === 'small' ? 18 : 20,
    minWidth: size === 'small' ? 18 : 20,
    borderRadius: size === 'small' ? '9px' : '10px',
    boxShadow: '0 2px 8px rgba(231,0,0,0.4)',
  },
});

// ==================== Sub-components ====================
const NavButton = ({ item, isActive, onClick }) => (
  <Tooltip title={item.label} placement="bottom" TransitionComponent={Zoom} arrow>
    <Button onClick={onClick} sx={navButtonStyle(item.variant, isActive)}>
      {item.label}
    </Button>
  </Tooltip>
);

const CartItemChip = ({ label, icon: Icon, color = '#141010' }) => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.5,
      fontFamily: 'Amaranth, sans-serif',
      fontSize: '0.7rem',
      fontWeight: 600,
      height: 22,
      px: 1,
      borderRadius: '6px',
      bgcolor: alpha(color, 0.08),
      color: color,
    }}
  >
    {Icon && <Icon sx={{ fontSize: 12 }} />}
    {label}
  </Box>
);

// ==================== Mobile Drawer Content ====================
const MobileDrawerContent = ({ onClose, onNavigate, currentLanguageData, onLanguageClick }) => {
  const location = useLocation();

  return (
    <Box sx={{
      width: 320,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
    }}>
      <Box sx={{
        p: 4,
        borderBottom: '1px solid rgba(20,16,16,0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        background: 'linear-gradient(135deg, #f2f9f1 0%, #ffffff 100%)',
      }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: '#141010',
            bgcolor: alpha('#141010', 0.05),
            '&:hover': { bgcolor: alpha('#141010', 0.1) },
          }}
        >
          <CloseOutlined />
        </IconButton>
        <Box
          component="img"
          src={logo}
          alt="Tawakkul Logo"
          sx={{ height: 80, width: 'auto', objectFit: 'contain', mt: 2, cursor: 'pointer' }}
          onClick={() => onNavigate('/')}
        />
      </Box>

      <List sx={{ flex: 1, pt: 3, px: 2 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                onClick={() => onNavigate(item.path)}
                sx={{
                  py: 1.5,
                  px: 3,
                  mx: 1,
                  borderRadius: 3,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  bgcolor: isActive ? alpha('#141010', 0.05) : 'transparent',
                  textDecoration: item.variant === 'contact' ? 'underline' : 'none',
                  textDecorationColor: '#141010',
                  textUnderlineOffset: '6px',
                  '&:hover': {
                    bgcolor: item.variant === 'offers' ? alpha('#c31919', 0.05) : alpha('#141010', 0.05),
                    transform: 'translateX(8px)',
                  },
                }}
              >
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    sx: {
                      color: item.variant === 'offers' ? '#c31919' : '#141010',
                      fontFamily: 'Amaranth, sans-serif',
                      fontWeight: item.variant === 'offers' ? 700 : isActive ? 600 : 500,
                      fontSize: '1.1rem',
                      textAlign: 'center',
                      textDecoration: item.variant === 'contact' ? 'underline' : 'none',
                      textDecorationColor: '#141010',
                      textUnderlineOffset: '6px',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ my: 1, mx: 2 }} />

      <Box sx={{ p: 2 }}>
        <Typography
          variant="caption"
          sx={{
            fontFamily: 'Amaranth, sans-serif',
            color: alpha('#141010', 0.6),
            px: 2,
            mb: 1,
            display: 'block',
          }}
        >
          PREFERENCE
        </Typography>
        <ListItemButton
          onClick={onLanguageClick}
          sx={{
            borderRadius: 3,
            mb: 1,
            px: 3,
            py: 1.2,
            transition: 'all 0.3s ease',
            bgcolor: alpha('#141010', 0.02),
            '&:hover': { bgcolor: alpha('#141010', 0.06), transform: 'translateX(8px)' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Box
              component="img"
              src={currentLanguageData?.flag}
              alt={currentLanguageData?.flagAlt}
              sx={{ width: 28, height: 20, borderRadius: 0.5, objectFit: 'cover' }}
            />
          </ListItemIcon>
          <ListItemText
            primary={`${currentLanguageData?.label} (${currentLanguageData?.code})`}
            primaryTypographyProps={{
              sx: { color: '#141010', fontFamily: 'Amaranth, sans-serif', fontWeight: 500 },
            }}
          />
          <KeyboardArrowDown sx={{ color: '#141010', opacity: 0.6 }} />
        </ListItemButton>

      </Box>
    </Box>
  );
};

// ==================== Cart Drawer Content ====================
const CartDrawerContent = ({
  onClose,
  cart,
  cartIsEmpty,
  cartCount,
  subtotal,
  shippingCost,
  total,
  FREE_SHIPPING_THRESHOLD,
  updateQuantity,
  removeFromCart,
}) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'Amaranth, sans-serif' }}>
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ShoppingCartOutlined sx={{ color: '#141010', fontSize: 24 }} />
          <Box>
            <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#141010', fontSize: '1.1rem' }}>
              Shopping Cart
            </Typography>
            <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.8rem', color: '#888' }}>
              {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: '#141010',
            bgcolor: alpha('#141010', 0.05),
            '&:hover': { bgcolor: alpha('#141010', 0.1) },
          }}
        >
          <CloseOutlined />
        </IconButton>
      </Box>

      {cartIsEmpty ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
          }}
        >
          <ShoppingBag sx={{ fontSize: 80, color: alpha('#141010', 0.15), mb: 2 }} />
          <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '1.2rem', fontWeight: 600, color: '#141010', mb: 1 }}>
            Your cart is empty
          </Typography>
          <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.9rem', color: '#888', textAlign: 'center', mb: 3 }}>
            Looks like you haven't added anything to your cart yet.
          </Typography>
          <Button
            variant="contained"
            onClick={onClose}
            sx={{
              fontFamily: 'Amaranth, sans-serif',
              fontWeight: 600,
              bgcolor: '#141010',
              color: '#f2f9f1',
              borderRadius: '12px',
              px: 4,
              py: 1.2,
              textTransform: 'none',
              '&:hover': { bgcolor: '#2a2a2a' },
            }}
          >
            Continue Shopping
          </Button>
        </Box>
      ) : (
        <>
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item.variantKey}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      p: 2,
                      mb: 1.5,
                      borderRadius: '16px',
                      bgcolor: '#fafafa',
                      border: '1px solid rgba(0,0,0,0.04)',
                      position: 'relative',
                    }}
                  >
                    <Avatar
                      src={item.mainImage}
                      variant="rounded"
                      sx={{ width: 80, height: 80, borderRadius: '12px', bgcolor: '#f0f0f0' }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 600, color: '#141010', fontSize: '0.95rem', mb: 0.3 }}>
                        {item.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <CartItemChip label={item.selectedSize} />
                        {item.discount > 0 && <CartItemChip label={`-${item.discount}%`} icon={LocalOffer} color="#e70000" />}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                        <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#141010', fontSize: '1rem' }}>
                          {(item.price * item.quantity).toFixed(2)} TND
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            bgcolor: '#fff',
                            borderRadius: '8px',
                            border: '1px solid rgba(0,0,0,0.08)',
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedSize)}
                            sx={{ color: '#141010', p: 0.5 }}
                          >
                            <Remove sx={{ fontSize: 16 }} />
                          </IconButton>
                          <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 600, minWidth: 24, textAlign: 'center', fontSize: '0.9rem' }}>
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedSize)}
                            sx={{ color: '#141010', p: 0.5 }}
                          >
                            <Add sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => removeFromCart(item.productId, item.selectedSize)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: '#e70000',
                        opacity: 0.6,
                        '&:hover': { opacity: 1, bgcolor: alpha('#e70000', 0.05) },
                      }}
                    >
                      <Delete sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </motion.div>
              ))}
            </AnimatePresence>
          </Box>

          <Box sx={{ p: 2.5, borderTop: '1px solid rgba(0,0,0,0.06)', bgcolor: '#fafafa' }}>
            {subtotal < FREE_SHIPPING_THRESHOLD && (
              <Box
                sx={{
                  mb: 2,
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: alpha('#2196f3', 0.05),
                  border: "1px solid alpha('#2196f3', 0.1)",
                }}
              >
                <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.8rem', color: '#2196f3', mb: 0.5 }}>
                  Add {(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} TND more for free shipping!
                </Typography>
                <Box sx={{ height: 4, bgcolor: alpha('#2196f3', 0.1), borderRadius: '2px', overflow: 'hidden' }}>
                  <Box
                    sx={{
                      height: '100%',
                      width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%`,
                      bgcolor: '#2196f3',
                      borderRadius: '2px',
                      transition: 'width 0.5s ease',
                    }}
                  />
                </Box>
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontFamily: 'Amaranth, sans-serif', color: '#888', fontSize: '0.9rem' }}>Subtotal</Typography>
              <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 600, color: '#141010' }}>{subtotal.toFixed(2)} TND</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ fontFamily: 'Amaranth, sans-serif', color: '#888', fontSize: '0.9rem' }}>Shipping</Typography>
              <Typography
                sx={{
                  fontFamily: 'Amaranth, sans-serif',
                  fontWeight: 600,
                  color: shippingCost === 0 ? '#4caf50' : '#141010',
                }}
              >
                {shippingCost === 0 ? 'FREE' : `${shippingCost.toFixed(2)} TND`}
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
              <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#141010', fontSize: '1.1rem' }}>Total</Typography>
              <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#141010', fontSize: '1.2rem' }}>{total.toFixed(2)} TND</Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                onClose();
                navigate('/checkout');
              }}
              sx={{
                fontFamily: 'Amaranth, sans-serif',
                fontWeight: 700,
                bgcolor: '#141010',
                color: '#f2f9f1',
                borderRadius: '14px',
                py: 1.5,
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': {
                  bgcolor: '#2a2a2a',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Proceed to Checkout
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={onClose}
              sx={{
                fontFamily: 'Amaranth, sans-serif',
                color: '#888',
                mt: 1,
                textTransform: 'none',
                '&:hover': { bgcolor: 'transparent', color: '#141010' },
              }}
            >
              Continue Shopping
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

// ==================== Main Component ====================
const Navbar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [languageAnchor, setLanguageAnchor] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('EN');

  const {
    cart,
    isCartOpen,
    closeCart,
    openCart,
    updateQuantity,
    removeFromCart,
    cartCount,
    subtotal,
    shippingCost,
    total,
    cartIsEmpty,
    FREE_SHIPPING_THRESHOLD,
  } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLanguageClick = (event) => setLanguageAnchor(event.currentTarget);
  const handleLanguageClose = (code) => {
    if (code) {
      setCurrentLanguage(code);
      document.dir = LANGUAGES.find((l) => l.code === code)?.dir || 'ltr';
    }
    setLanguageAnchor(null);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const currentLang = LANGUAGES.find((l) => l.code === currentLanguage);

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          py: scrolled ? 1 : 2,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          bgcolor: 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.05)' : 'none',
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: { xs: 2, md: 4 } }}>
            {/* Logo */}
            <Box
              component="img"
              src={logo}
              alt="Tawakkul Logo"
              onClick={() => navigate('/')}
              sx={{
                height: { xs: 80, sm: 100, md: 120 },
                width: 'auto',
                objectFit: 'contain',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                filter: scrolled
                  ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.06))'
                  : 'drop-shadow(0 4px 20px rgba(0,0,0,0.1))',
                '&:hover': { transform: 'scale(1.03)' },
              }}
            />

            {/* Nav Pill */}
            <Box sx={{ flex: 1, position: 'relative' }}>
              <Box
                sx={{
                  position: 'relative',
                  background: scrolled ? alpha('#fcfefe', 0.98) : alpha('#fcfefe', 0.95),
                  borderRadius: '80px',
                  boxShadow: scrolled
                    ? '0 4px 20px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)'
                    : '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
                  border: '1px solid rgba(20,16,16,0.08)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  overflow: 'hidden',
                  '&:hover': {
                    boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                    transform: 'translateY(-2px)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                    transition: 'left 0.6s ease',
                    zIndex: 1,
                    pointerEvents: 'none',
                  },
                  '&:hover::before': { left: '100%' },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: { xs: 2, sm: 2.5, md: 3.5 },
                    py: { xs: 0.8, sm: 1, md: 1.2 },
                    position: 'relative',
                    zIndex: 2,
                  }}
                >
                  {isMobile ? (
                    <>
                      <IconButton
                        onClick={() => setMobileOpen(true)}
                        sx={{
                          color: '#141010',
                          transition: 'all 0.3s ease',
                          '&:hover': { bgcolor: alpha('#141010', 0.08), transform: 'rotate(90deg)' },
                        }}
                      >
                        <MenuOutlined />
                      </IconButton>
                      <Box sx={{ width: 40 }} />
                      <Tooltip title="Account" TransitionComponent={Zoom} arrow>
                        <IconButton onClick={() => navigate('/login')} sx={iconButtonStyle}>
                          <Person />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Cart" TransitionComponent={Zoom} arrow>
                        <IconButton onClick={openCart} sx={iconButtonStyle}>
                          <Badge badgeContent={cartCount} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} sx={badgeStyle()}>
                            <ShoppingCartOutlined />
                          </Badge>
                        </IconButton>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flex: 1, justifyContent: 'center' }}>
                        {NAV_ITEMS.map((item) => (
                          <NavButton
                            key={item.label}
                            item={item}
                            isActive={location.pathname === item.path}
                            onClick={() => navigate(item.path)}
                          />
                        ))}
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="Change Language" TransitionComponent={Zoom} arrow>
                          <Button
                            onClick={handleLanguageClick}
                            endIcon={<KeyboardArrowDown sx={{ fontSize: 20 }} />}
                            startIcon={
                              <Box
                                component="img"
                                src={currentLang?.flag}
                                alt={currentLang?.flagAlt}
                                sx={{ width: 24, height: 18, borderRadius: 0.5, objectFit: 'cover' }}
                              />
                            }
                            sx={{
                              color: '#141010',
                              textTransform: 'none',
                              fontFamily: 'Amaranth, sans-serif',
                              fontSize: '0.9rem',
                              fontWeight: 500,
                              borderRadius: '50px',
                              px: 1.8,
                              py: 0.6,
                              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                              '&:hover': { backgroundColor: alpha('#141010', 0.08), transform: 'scale(1.02)' },
                            }}
                          >
                            {currentLanguage}
                          </Button>
                        </Tooltip>
                        <Tooltip title="Sign In" TransitionComponent={Zoom} arrow>
                          <IconButton onClick={() => navigate('/login')} sx={iconButtonStyle}>
                            <Person />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Cart" TransitionComponent={Zoom} arrow>
                          <IconButton onClick={openCart} sx={iconButtonStyle}>
                            <Badge badgeContent={cartCount} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} sx={badgeStyle('small')}>
                              <ShoppingCartOutlined />
                            </Badge>
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Box sx={{ height: { xs: 180, sm: 200, md: 260 } }} />

      {/* Language Menu */}
      <Menu
        anchorEl={languageAnchor}
        open={Boolean(languageAnchor)}
        onClose={() => handleLanguageClose()}
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            bgcolor: '#ffffff',
            color: '#141010',
            mt: 1.5,
            borderRadius: 3,
            boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
            minWidth: 200,
            overflow: 'hidden',
          },
        }}
      >
        {LANGUAGES.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageClose(lang.code)}
            selected={currentLanguage === lang.code}
            sx={{
              fontFamily: 'Amaranth, sans-serif',
              gap: 1.5,
              py: 1.2,
              px: 2,
              transition: 'all 0.2s ease',
              '&.Mui-selected': { bgcolor: alpha('#141010', 0.05) },
              '&:hover': { bgcolor: alpha('#141010', 0.05), transform: 'translateX(5px)' },
            }}
          >
            <Box component="img" src={lang.flag} alt={lang.flagAlt} sx={{ width: 28, height: 20, borderRadius: 0.5, objectFit: 'cover' }} />
            <Box sx={{ flex: 1 }}>{lang.label}</Box>
            <Typography variant="caption" sx={{ color: alpha('#141010', 0.5), fontFamily: 'monospace' }}>
              {lang.code}
            </Typography>
          </MenuItem>
        ))}
      </Menu>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: '85%',
            maxWidth: 320,
            bgcolor: '#ffffff',
            borderTopRightRadius: 32,
            borderBottomRightRadius: 32,
          },
        }}
      >
        <MobileDrawerContent
          onClose={() => setMobileOpen(false)}
          onNavigate={handleNavigate}
          currentLanguageData={currentLang}
          onLanguageClick={handleLanguageClick}
        />
      </Drawer>

      {/* Cart Drawer */}
      <Drawer
        anchor="right"
        open={isCartOpen}
        onClose={closeCart}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 420 }, maxWidth: '100vw', bgcolor: '#ffffff' },
        }}
      >
        <CartDrawerContent
          onClose={closeCart}
          cart={cart}
          cartIsEmpty={cartIsEmpty}
          cartCount={cartCount}
          subtotal={subtotal}
          shippingCost={shippingCost}
          total={total}
          FREE_SHIPPING_THRESHOLD={FREE_SHIPPING_THRESHOLD}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
        />
      </Drawer>
    </>
  );
};

export default Navbar;