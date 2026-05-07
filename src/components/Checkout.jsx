// pages/Checkout.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Typography, Button, Paper, TextField,
  Divider, IconButton, Avatar, Chip, Snackbar, Alert,
  Breadcrumbs, Link, alpha, CircularProgress, LinearProgress,
  Badge, Tooltip, Zoom,
} from '@mui/material';
import {
  ArrowBack, Add, Remove, Delete, ShoppingBag,
  LocalShipping, Check, Send, Person, Email,
  Phone, LocationOn, Notes, ShoppingCartOutlined,
  Lock, VerifiedUser, Payment, Receipt, ArrowForward,
  Security, Speed, SupportAgent, Inventory2,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/api';

// ==================== Design Tokens ====================
const T = {
  primary: '#0D0D0D',
  primaryLight: '#2A2A2A',
  accent: '#C8102E',
  success: '#1A7A4A',
  info: '#1565C0',
  surface: '#FAFBFC',
  white: '#FFFFFF',
  border: '#E8ECF0',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  radius: { sm: 8, md: 12, lg: 16, xl: 20 },
  shadow: {
    card: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
    elevated: '0 4px 6px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.06)',
    floating: '0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.06)',
  },
};

// ==================== Constants ====================
const FORM_FIELDS = [
  { 
    name: 'fullName', 
    label: 'Full Name', 
    icon: Person, 
    placeholder: 'Enter your full name',
    required: true,
    grid: { xs: 12, sm: 6 },
    validation: { 
      required: 'Full name is required', 
      minLength: { value: 3, message: 'Name must be at least 3 characters' } 
    } 
  },
  { 
    name: 'email', 
    label: 'Email Address', 
    icon: Email, 
    type: 'email', 
    placeholder: 'your@email.com',
    required: true,
    grid: { xs: 12, sm: 6 },
    validation: { 
      required: 'Email is required', 
      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' } 
    } 
  },
  { 
    name: 'phone', 
    label: 'Phone Number', 
    icon: Phone, 
    type: 'tel', 
    placeholder: '+216 XX XXX XXX',
    required: true,
    grid: { xs: 12, sm: 6 },
    validation: { 
      required: 'Phone is required', 
      pattern: { value: /^[+]?[\d\s()-]{8,15}$/, message: 'Enter valid phone number' } 
    } 
  },
  { 
    name: 'address', 
    label: 'Delivery Address', 
    icon: LocationOn, 
    placeholder: 'Street address, City, Postal code',
    required: true,
    grid: { xs: 12 },
    multiline: true,
    rows: 2,
    validation: { 
      required: 'Address is required', 
      minLength: { value: 5, message: 'Please provide a complete address' } 
    } 
  },
  { 
    name: 'notes', 
    label: 'Order Notes', 
    icon: Notes, 
    placeholder: 'Any special instructions for delivery...',
    required: false,
    grid: { xs: 12 },
    multiline: true,
    rows: 2,
  },
];

const TRUST_BADGES = [
  { icon: Security, label: 'Secure Checkout' },
  { icon: Speed, label: 'Fast Delivery' },
  { icon: SupportAgent, label: '24/7 Support' },
  { icon: VerifiedUser, label: 'Quality Guaranteed' },
];

// ==================== Reusable Styles ====================
const styles = {
  pageWrapper: {
    minHeight: '100vh',
    bgcolor: T.surface,
    pt: { xs: 2, md: 4 },
    pb: 8,
  },
  card: {
    bgcolor: T.white,
    borderRadius: `${T.radius.xl}px`,
    border: `1px solid ${T.border}`,
    boxShadow: T.shadow.card,
    overflow: 'hidden',
    transition: 'box-shadow 0.3s ease',
    '&:hover': {
      boxShadow: T.shadow.elevated,
    },
  },
  cardHeader: {
    p: { xs: 2, md: 3 },
    borderBottom: `1px solid ${T.border}`,
    bgcolor: alpha(T.primary, 0.01),
  },
  cardContent: {
    p: { xs: 2, md: 3 },
  },
  sectionTitle: {
    fontFamily: '"Inter", "Amaranth", sans-serif',
    fontWeight: 700,
    fontSize: { xs: '1.1rem', md: '1.25rem' },
    color: T.text,
    letterSpacing: '-0.01em',
  },
  sectionSubtitle: {
    fontFamily: '"Inter", "Amaranth", sans-serif',
    color: T.textSecondary,
    fontSize: '0.85rem',
    mt: 0.5,
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      fontFamily: '"Inter", "Amaranth", sans-serif',
      fontSize: '0.9rem',
      borderRadius: `${T.radius.md}px`,
      bgcolor: T.white,
      transition: 'all 0.2s ease',
      '& fieldset': { 
        borderColor: T.border,
        borderWidth: '1.5px',
      },
      '&:hover fieldset': { 
        borderColor: alpha(T.primary, 0.3),
      },
      '&.Mui-focused fieldset': { 
        borderColor: T.primary,
        borderWidth: '2px',
        boxShadow: `0 0 0 3px ${alpha(T.primary, 0.04)}`,
      },
      '&.Mui-error fieldset': {
        borderColor: T.accent,
      },
    },
    '& .MuiInputLabel-root': { 
      fontFamily: '"Inter", "Amaranth", sans-serif',
      fontSize: '0.85rem',
      color: T.textMuted,
      '&.Mui-focused': { color: T.primary },
      '&.Mui-error': { color: T.accent },
    },
    '& .MuiFormHelperText-root': { 
      fontFamily: '"Inter", "Amaranth", sans-serif',
      fontSize: '0.75rem',
      mx: 0,
      mt: 0.5,
    },
  },
  primaryButton: {
    fontFamily: '"Inter", "Amaranth", sans-serif',
    fontWeight: 600,
    bgcolor: T.primary,
    color: T.white,
    borderRadius: `${T.radius.md}px`,
    py: 1.5,
    px: 3,
    textTransform: 'none',
    fontSize: '0.95rem',
    letterSpacing: '0.01em',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    '&:hover': { 
      bgcolor: T.primaryLight,
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      transform: 'translateY(-1px)',
    },
    '&:disabled': { 
      bgcolor: alpha(T.primary, 0.3),
      color: alpha(T.white, 0.7),
      boxShadow: 'none',
    },
    transition: 'all 0.25s ease',
  },
  secondaryButton: {
    fontFamily: '"Inter", "Amaranth", sans-serif',
    fontWeight: 500,
    color: T.textSecondary,
    textTransform: 'none',
    '&:hover': { 
      bgcolor: 'transparent', 
      color: T.primary,
    },
  },
  chip: {
    fontFamily: '"Inter", "Amaranth", sans-serif',
    fontWeight: 600,
    fontSize: '0.72rem',
    height: 24,
    borderRadius: `${T.radius.sm}px`,
  },
  priceText: {
    fontFamily: '"Inter", "Amaranth", sans-serif',
    fontWeight: 700,
    color: T.text,
    letterSpacing: '-0.02em',
  },
};

// ==================== Form Validation ====================
const initialFormState = FORM_FIELDS.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {});

const validateField = (name, value) => {
  const field = FORM_FIELDS.find((f) => f.name === name);
  if (!field?.validation) return '';
  const rules = field.validation;
  const v = value?.trim() || '';
  if (rules.required && !v) return rules.required;
  if (v && rules.minLength && v.length < rules.minLength.value) return rules.minLength.message;
  if (v && rules.pattern && !rules.pattern.value.test(v)) return rules.pattern.message;
  return '';
};

// ==================== Sub Components ====================

const TrustBadges = () => (
  <Grid container spacing={2} sx={{ mt: 3 }}>
    {TRUST_BADGES.map((badge, index) => {
      const Icon = badge.icon;
      return (
        <Grid item xs={6} sm={3} key={index}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              p: 1.5,
              borderRadius: `${T.radius.md}px`,
              bgcolor: alpha(T.primary, 0.02),
              border: `1px solid ${alpha(T.primary, 0.04)}`,
            }}
          >
            <Icon sx={{ fontSize: 22, color: T.primary, mb: 0.5 }} />
            <Typography sx={{ fontFamily: '"Inter", "Amaranth", sans-serif', fontSize: '0.7rem', fontWeight: 600, color: T.textSecondary }}>
              {badge.label}
            </Typography>
          </Box>
        </Grid>
      );
    })}
  </Grid>
);

const OrderSuccessScreen = ({ orderResult, onContinue }) => (
  <Box sx={styles.pageWrapper}>
    <Container maxWidth="sm" sx={{ pt: { xs: 4, md: 8 } }}>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <Paper sx={{ 
          ...styles.card, 
          p: { xs: 4, md: 6 }, 
          textAlign: 'center',
          boxShadow: T.shadow.floating,
        }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            <Box
              sx={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${T.success} 0%, #2E7D32 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                boxShadow: `0 8px 32px ${alpha(T.success, 0.3)}`,
              }}
            >
              <Check sx={{ fontSize: 44, color: T.white }} />
            </Box>
          </motion.div>

          <Typography sx={{ 
            fontFamily: '"Inter", "Amaranth", sans-serif', 
            fontWeight: 800, 
            fontSize: { xs: '1.8rem', md: '2.2rem' }, 
            color: T.text,
            mb: 1,
            letterSpacing: '-0.02em',
          }}>
            Order Confirmed!
          </Typography>

          <Box sx={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 1,
            bgcolor: alpha(T.success, 0.05),
            border: `1px solid ${alpha(T.success, 0.15)}`,
            borderRadius: `${T.radius.md}px`,
            px: 2,
            py: 0.8,
            mb: 2,
          }}>
            <Receipt sx={{ fontSize: 18, color: T.success }} />
            <Typography sx={{ 
              fontFamily: '"Inter", "Amaranth", sans-serif', 
              fontSize: '1rem', 
              fontWeight: 700, 
              color: T.success,
              letterSpacing: '0.05em',
            }}>
              #{orderResult?.orderNumber}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography sx={{ 
            fontFamily: '"Inter", "Amaranth", sans-serif', 
            color: T.textSecondary,
            fontSize: '0.95rem',
            lineHeight: 1.6,
            mb: 1,
          }}>
            Thank you for your purchase! A confirmation email has been sent to{' '}
            <strong style={{ color: T.text }}>{orderResult?.customer?.email}</strong>.
          </Typography>

          <Typography sx={{ 
            fontFamily: '"Inter", "Amaranth", sans-serif', 
            color: T.textMuted,
            fontSize: '0.85rem',
            mb: 4,
          }}>
            We'll notify you when your order ships. Expected delivery: 3-5 business days.
          </Typography>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={onContinue}
            sx={styles.primaryButton}
            startIcon={<ShoppingBag />}
          >
            Continue Shopping
          </Button>
        </Paper>
      </motion.div>
    </Container>
  </Box>
);

const CartItem = ({ item, onUpdateQuantity, onRemove }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        p: 2,
        mb: 1.5,
        borderRadius: `${T.radius.lg}px`,
        bgcolor: alpha(T.primary, 0.01),
        border: `1px solid ${T.border}`,
        position: 'relative',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: alpha(T.primary, 0.15),
          boxShadow: T.shadow.card,
        },
      }}
    >
      <Avatar
        src={item.mainImage}
        variant="rounded"
        sx={{ 
          width: 90, 
          height: 90, 
          borderRadius: `${T.radius.md}px`,
          bgcolor: alpha(T.primary, 0.05),
        }}
        imgProps={{ style: { objectFit: 'cover' } }}
      />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ 
          fontFamily: '"Inter", "Amaranth", sans-serif', 
          fontWeight: 600, 
          color: T.text, 
          fontSize: '0.95rem', 
          mb: 0.5,
          lineHeight: 1.3,
        }}>
          {item.name}
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.8, mb: 1.2, flexWrap: 'wrap' }}>
          <Chip
            label={`Size: ${item.selectedSize}`}
            size="small"
            sx={{
              ...styles.chip,
              bgcolor: alpha(T.primary, 0.04),
              color: T.textSecondary,
              border: `1px solid ${T.border}`,
            }}
          />
          {item.isOffer && (
            <Chip
              label="OFFER"
              size="small"
              icon={<Inventory2 sx={{ fontSize: 12 }} />}
              sx={{
                ...styles.chip,
                bgcolor: alpha(T.accent, 0.08),
                color: T.accent,
                border: `1px solid ${alpha(T.accent, 0.2)}`,
              }}
            />
          )}
          {item.discount > 0 && (
            <Chip
              label={`-${item.discount}%`}
              size="small"
              sx={{
                ...styles.chip,
                bgcolor: alpha(T.success, 0.08),
                color: T.success,
                border: `1px solid ${alpha(T.success, 0.2)}`,
              }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ ...styles.priceText, fontSize: '1.05rem' }}>
              {(item.price * item.quantity).toFixed(2)} TND
            </Typography>
            {item.quantity > 1 && (
              <Typography sx={{ fontFamily: '"Inter", "Amaranth", sans-serif', fontSize: '0.75rem', color: T.textMuted }}>
                {item.price.toFixed(2)} TND each
              </Typography>
            )}
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.3,
            bgcolor: T.white,
            borderRadius: `${T.radius.md}px`,
            border: `1.5px solid ${T.border}`,
            overflow: 'hidden',
          }}>
            <IconButton
              size="small"
              onClick={() => onUpdateQuantity(item.productId, item.quantity - 1, item.selectedSize)}
              sx={{ 
                color: T.textSecondary,
                borderRadius: 0,
                p: 0.8,
                '&:hover': { bgcolor: alpha(T.primary, 0.05), color: T.text },
              }}
            >
              <Remove sx={{ fontSize: 16 }} />
            </IconButton>
            <Typography sx={{ 
              fontFamily: '"Inter", "Amaranth", sans-serif', 
              fontWeight: 700, 
              minWidth: 32, 
              textAlign: 'center',
              fontSize: '0.9rem',
              color: T.text,
              userSelect: 'none',
            }}>
              {item.quantity}
            </Typography>
            <IconButton
              size="small"
              onClick={() => onUpdateQuantity(item.productId, item.quantity + 1, item.selectedSize)}
              sx={{ 
                color: T.textSecondary,
                borderRadius: 0,
                p: 0.8,
                '&:hover': { bgcolor: alpha(T.primary, 0.05), color: T.text },
              }}
            >
              <Add sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Tooltip title="Remove item" TransitionComponent={Zoom} arrow>
        <IconButton
          size="small"
          onClick={() => onRemove(item.productId, item.selectedSize)}
          sx={{ 
            position: 'absolute', 
            top: 8, 
            right: 8, 
            color: alpha(T.accent, 0.5),
            '&:hover': { color: T.accent, bgcolor: alpha(T.accent, 0.05) },
          }}
        >
          <Delete sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Box>
  </motion.div>
);

// ==================== Main Checkout Component ====================
const Checkout = () => {
  const navigate = useNavigate();
  const {
    cart,
    cartCount,
    cartIsEmpty,
    subtotal,
    shippingCost,
    total,
    FREE_SHIPPING_THRESHOLD,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartIsEmpty && !orderSuccess) {
      navigate('/sport');
    }
  }, [cartIsEmpty, navigate, orderSuccess]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleChange = (name) => (e) => {
    const v = e.target.value;
    setFormData((prev) => ({ ...prev, [name]: v }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, v) }));
    }
  };

  const handleBlur = (name) => () => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, formData[name]) }));
  };

  const handleSubmit = async () => {
    const newErrors = {};
    FORM_FIELDS.forEach((field) => {
      if (field.required) {
        const err = validateField(field.name, formData[field.name]);
        if (err) newErrors[field.name] = err;
      }
    });
    setErrors(newErrors);
    setTouched(FORM_FIELDS.reduce((acc, f) => ({ ...acc, [f.name]: true }), {}));

    if (Object.keys(newErrors).length > 0) {
      showSnackbar('Please fill in all required fields correctly', 'error');
      return;
    }

    if (cart.length === 0) {
      showSnackbar('Your cart is empty', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        customer: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          notes: formData.notes || '',
        },
        items: cart.map((item) => ({
          productId: item.productId || item._id,
          itemType: item.isOffer ? 'Offer' : 'Product', // ✅ Uses isOffer flag
          quantity: item.quantity,
          size: item.selectedSize,
        })),
        paymentMethod: 'cash_on_delivery',
        shippingCost: shippingCost,
      };

      const response = await orderService.createOrder(orderData);

      if (response.data.success) {
        setOrderSuccess(response.data.data);
        clearCart();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to place order. Please try again.';
      showSnackbar(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Order Success View
  if (orderSuccess) {
    return (
      <OrderSuccessScreen 
        orderResult={orderSuccess} 
        onContinue={() => navigate('/sport')} 
      />
    );
  }

  // Checkout View
  return (
    <Box sx={styles.pageWrapper}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Breadcrumbs sx={{ mb: 1.5 }}>
              <Link
                component="button"
                underline="hover"
                onClick={() => navigate('/sport')}
                sx={{ fontFamily: '"Inter", "Amaranth", sans-serif', fontWeight: 600, color: T.accent, fontSize: '0.85rem' }}
              >
                Shop
              </Link>
              <Typography sx={{ fontFamily: '"Inter", "Amaranth", sans-serif', fontWeight: 700, color: T.text, fontSize: '0.85rem' }}>
                Checkout
              </Typography>
            </Breadcrumbs>
            <Typography sx={{ 
              fontFamily: '"Inter", "Amaranth", sans-serif',
              fontWeight: 800,
              fontSize: { xs: '1.8rem', md: '2.2rem' },
              color: T.text,
              letterSpacing: '-0.02em',
              mb: 0.5,
            }}>
              Checkout
            </Typography>
            <Typography sx={{ 
              fontFamily: '"Inter", "Amaranth", sans-serif',
              color: T.textSecondary,
              fontSize: '0.95rem',
            }}>
              Review your items and complete your order
            </Typography>
          </motion.div>
        </Box>

        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} lg={7.5}>
            {/* Cart Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Paper sx={{ ...styles.card, mb: 3 }}>
                <Box sx={styles.cardHeader}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Badge badgeContent={cartCount} color="error" sx={{ '& .MuiBadge-badge': { fontFamily: '"Inter", "Amaranth", sans-serif' } }}>
                      <ShoppingCartOutlined sx={{ color: T.primary, fontSize: 22 }} />
                    </Badge>
                    <Box>
                      <Typography sx={styles.sectionTitle}>Shopping Cart</Typography>
                      <Typography sx={styles.sectionSubtitle}>
                        {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box sx={styles.cardContent}>
                  <AnimatePresence>
                    {cart.map((item) => (
                      <CartItem
                        key={item.variantKey}
                        item={item}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeFromCart}
                      />
                    ))}
                  </AnimatePresence>
                </Box>
              </Paper>
            </motion.div>

            {/* Customer Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Paper sx={styles.card}>
                <Box sx={styles.cardHeader}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Person sx={{ color: T.primary, fontSize: 22 }} />
                    <Box>
                      <Typography sx={styles.sectionTitle}>Customer Information</Typography>
                      <Typography sx={styles.sectionSubtitle}>All fields marked with * are required</Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box sx={styles.cardContent}>
                  <Grid container spacing={2.5}>
                    {FORM_FIELDS.map((field) => {
                      const FieldIcon = field.icon;
                      return (
                        <Grid item {...field.grid} key={field.name}>
                          <TextField
                            fullWidth
                            label={`${field.label}${field.required ? ' *' : ''}`}
                            name={field.name}
                            type={field.type || 'text'}
                            value={formData[field.name]}
                            onChange={handleChange(field.name)}
                            onBlur={handleBlur(field.name)}
                            error={touched[field.name] && !!errors[field.name]}
                            helperText={touched[field.name] && errors[field.name] ? errors[field.name] : ' '}
                            multiline={field.multiline}
                            rows={field.rows || 1}
                            placeholder={field.placeholder}
                            required={field.required}
                            sx={styles.textField}
                            InputProps={{
                              startAdornment: (
                                <FieldIcon sx={{ mr: 1, fontSize: 20, color: T.textMuted }} />
                              ),
                            }}
                          />
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              </Paper>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <TrustBadges />
            </motion.div>
          </Grid>

          {/* Right Column - Order Summary */}
          <Grid item xs={12} lg={4.5}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Paper sx={{ ...styles.card, position: 'sticky', top: 100, boxShadow: T.shadow.floating }}>
                <Box sx={styles.cardHeader}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Receipt sx={{ color: T.primary, fontSize: 22 }} />
                    <Typography sx={styles.sectionTitle}>Order Summary</Typography>
                  </Box>
                </Box>
                
                <Box sx={styles.cardContent}>
                  {/* Subtotal */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography sx={{ fontFamily: '"Inter", "Amaranth", sans-serif', color: T.textSecondary, fontSize: '0.9rem' }}>
                      Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'})
                    </Typography>
                    <Typography sx={{ ...styles.priceText, fontSize: '0.95rem' }}>
                      {subtotal.toFixed(2)} TND
                    </Typography>
                  </Box>

                  {/* Shipping */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography sx={{ fontFamily: '"Inter", "Amaranth", sans-serif', color: T.textSecondary, fontSize: '0.9rem' }}>
                      Shipping
                    </Typography>
                    {shippingCost === 0 ? (
                      <Chip label="FREE" size="small" sx={{ ...styles.chip, bgcolor: alpha(T.success, 0.1), color: T.success, '& .MuiChip-label': { fontWeight: 700 } }} />
                    ) : (
                      <Typography sx={{ ...styles.priceText, fontSize: '0.95rem' }}>+{shippingCost.toFixed(2)} TND</Typography>
                    )}
                  </Box>

                  {/* Free Shipping Progress */}
                  {shippingCost > 0 && (
                    <Box sx={{ mb: 2.5, p: 1.8, borderRadius: `${T.radius.md}px`, bgcolor: alpha(T.info, 0.03), border: `1px solid ${alpha(T.info, 0.1)}` }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                        <Typography sx={{ fontFamily: '"Inter", "Amaranth", sans-serif', fontSize: '0.78rem', fontWeight: 600, color: T.info }}>
                          🚚 Free shipping at {FREE_SHIPPING_THRESHOLD} TND
                        </Typography>
                        <Typography sx={{ fontFamily: '"Inter", "Amaranth", sans-serif', fontSize: '0.75rem', fontWeight: 700, color: T.info }}>
                          {(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} TND to go
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}
                        sx={{ height: 6, borderRadius: 3, bgcolor: alpha(T.info, 0.1), '& .MuiLinearProgress-bar': { bgcolor: T.info, borderRadius: 3 } }}
                      />
                    </Box>
                  )}

                  <Divider sx={{ my: 2.5 }} />

                  {/* Total */}
                  <Box sx={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3,
                    p: 2, bgcolor: alpha(T.primary, 0.02), borderRadius: `${T.radius.md}px`,
                    border: `1px solid ${alpha(T.primary, 0.06)}`,
                  }}>
                    <Typography sx={{ fontFamily: '"Inter", "Amaranth", sans-serif', fontWeight: 700, color: T.text, fontSize: '1.1rem' }}>
                      Total
                    </Typography>
                    <Typography sx={{ fontFamily: '"Inter", "Amaranth", sans-serif', fontWeight: 800, color: T.text, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
                      {total.toFixed(2)} TND
                    </Typography>
                  </Box>

                  {/* Payment Method */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ 
                      p: 2, borderRadius: `${T.radius.md}px`, border: `2px solid ${T.primary}`,
                      bgcolor: alpha(T.primary, 0.02), display: 'flex', alignItems: 'center', gap: 2,
                    }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: alpha(T.primary, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Payment sx={{ color: T.primary, fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontFamily: '"Inter", "Amaranth", sans-serif', fontWeight: 600, fontSize: '0.9rem', color: T.text }}>
                          Cash on Delivery
                        </Typography>
                        <Typography sx={{ fontFamily: '"Inter", "Amaranth", sans-serif', fontSize: '0.75rem', color: T.textSecondary }}>
                          Pay when you receive your order
                        </Typography>
                      </Box>
                      <Check sx={{ color: T.primary, fontSize: 18, ml: 'auto' }} />
                    </Box>
                  </Box>

                  {/* Submit Button */}
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleSubmit}
                    disabled={isSubmitting || cartIsEmpty}
                    sx={styles.primaryButton}
                    startIcon={isSubmitting ? <CircularProgress size={20} sx={{ color: T.white }} /> : <Lock />}
                    endIcon={!isSubmitting && <ArrowForward />}
                  >
                    {isSubmitting ? 'Processing Order...' : `Place Order • ${total.toFixed(2)} TND`}
                  </Button>

                  {/* Secure Notice */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2 }}>
                    <Lock sx={{ fontSize: 14, color: T.textMuted }} />
                    <Typography sx={{ fontFamily: '"Inter", "Amaranth", sans-serif', fontSize: '0.75rem', color: T.textMuted }}>
                      Secure & Encrypted Checkout
                    </Typography>
                  </Box>

                  {/* Continue Shopping */}
                  <Button
                    fullWidth
                    variant="text"
                    onClick={() => navigate('/sport')}
                    sx={{ ...styles.secondaryButton, mt: 1.5, fontSize: '0.85rem' }}
                    startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
                  >
                    Continue Shopping
                  </Button>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ fontFamily: '"Inter", "Amaranth", sans-serif', borderRadius: `${T.radius.md}px`, fontWeight: 600, boxShadow: T.shadow.floating }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Checkout;