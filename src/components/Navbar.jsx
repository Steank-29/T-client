// components/Navbar.jsx - With i18n Language Support + Adhkar Ticker Bar
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
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
import { keyframes } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/MainL.png';
import enFlag from '../assets/en.jpg';
import frFlag from '../assets/fr.jpg';
import arFlag from '../assets/ar.jpg';

// ==================== Islamic Adhkar Array ====================
const ADHKAR = [
  { ar: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', en: 'SubhanAllahi wa bihamdihi', fr: 'Gloire à Allah et Sa louange', ref: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ' },
  { ar: 'سُبْحَانَ اللَّهِ الْعَظِيمِ', en: 'SubhanAllahil Adheem', fr: 'Gloire à Allah le Très Grand', ref: 'سُبْحَانَ اللَّهِ الْعَظِيمِ' },
  { ar: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', en: 'La ilaha illallah wahdahu la sharika lah', fr: 'Il n\'y a de dieu qu\'Allah, Seul, sans associé', ref: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ' },
  { ar: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', en: 'Alhamdulillahi Rabbil Alameen', fr: 'Louange à Allah, Seigneur de l\'univers', ref: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
  { ar: 'اللَّهُ أَكْبَرُ كَبِيرًا', en: 'Allahu Akbaru Kabeera', fr: 'Allah est le Plus Grand', ref: 'اللَّهُ أَكْبَرُ كَبِيرًا' },
  { ar: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', en: 'La hawla wa la quwwata illa billah', fr: 'Il n\'y a de puissance ni de force qu\'en Allah', ref: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ' },
  { ar: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ', en: 'Astaghfirullah Al-Adheem', fr: 'Je demande pardon à Allah le Très Grand', ref: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ' },
  { ar: 'سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ', en: 'SubhanAllah, walhamdulillah, wa la ilaha illallah, wallahu Akbar', fr: 'Gloire à Allah, Louange à Allah, Il n\'y a de dieu qu\'Allah, Allah est le Plus Grand', ref: 'سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ' },
  { ar: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', en: 'Allahumma salli ala Muhammad', fr: 'Ô Allah, prie sur Muhammad', ref: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ' },
  { ar: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', en: 'Hasbunallahu wa ni\'mal Wakeel', fr: 'Allah nous suffit, Il est le meilleur Garant', ref: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ' },
  { ar: 'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ', en: 'Rabbighfir li wa tub alayya, innaka Antat-Tawwabur-Raheem', fr: 'Seigneur, pardonne-moi et accepte mon repentir, Tu es le Pardonneur, le Miséricordieux', ref: 'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ' },
  { ar: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ', en: 'Allahumma inni as\'aluka al-afiyah', fr: 'Ô Allah, je Te demande le bien-être', ref: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ' },
];

// ==================== Marquee Animation ====================
const marquee = keyframes`
  0% { transform: translateX(0%); }
  100% { transform: translateX(-50%); }
`;

const marqueeRTL = keyframes`
  0% { transform: translateX(0%); }
  100% { transform: translateX(50%); }
`;

// ==================== Constants ====================
const LANGUAGES = [
  { code: 'en', label: 'English', flag: enFlag, flagAlt: 'English flag', dir: 'ltr' },
  { code: 'fr', label: 'Français', flag: frFlag, flagAlt: 'French flag', dir: 'ltr' },
  { code: 'ar', label: 'العربية', flag: arFlag, flagAlt: 'Arabic flag', dir: 'rtl' },
];

const getNavItems = (t) => [
  { label: t('nav.home', 'Home'), path: '/', variant: 'default' },
  { label: t('nav.offers', 'Offers'), path: '/offers', variant: 'offers' },
  { label: t('nav.sport', 'Sport'), path: '/sport', variant: 'default' },
  { label: t('nav.streetwear', 'Streetwear'), path: '/streetwear', variant: 'default' },
  { label: t('nav.religious', 'Religious'), path: '/religious', variant: 'default' },
  { label: t('nav.contact', 'Contact'), path: '/contact', variant: 'offers' },
];

// ==================== Adhkar Ticker Component ====================
const AdhkarTicker = ({ isRTL, scrolled }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const tickerRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ADHKAR.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const duplicatedAdhkar = [...ADHKAR, ...ADHKAR];

  return (
    <Box
      sx={{
        position: 'sticky',
        top: { xs: 0, sm: 0, md: 0 },
        left: 0,
        right: 0,
        zIndex: 1099,
        bgcolor: scrolled ? 'transparent' : '#ffffff',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        py: 1.2,
        overflow: 'hidden',
        borderBottom: scrolled ? 'none' : '1px solid rgba(0, 0, 0, 0.06)',
        direction: isRTL ? 'rtl' : 'ltr',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Box
        ref={tickerRef}
        sx={{
          display: 'flex',
          whiteSpace: 'nowrap',
          animation: `${isRTL ? marqueeRTL : marquee} 40s linear infinite`,
          gap: 6,
          '&:hover': {
            animationPlayState: 'paused',
          },
        }}
      >
        {duplicatedAdhkar.map((adhkar, index) => (
          <Box
            key={index}
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.5,
              color: index % ADHKAR.length === currentIndex 
                ? '#C8FF00' 
                : scrolled 
                  ? '#0A0A0A' 
                  : '#0A0A0A',
              fontFamily: isRTL ? '"Noto Kufi Arabic", "Tajawal", sans-serif' : '"DM Sans", sans-serif',
              fontSize: '1rem',
              fontWeight: 500,
              transition: 'color 0.5s ease',
              cursor: 'default',
              userSelect: 'none',
              px: 2,
            }}
          >
            <Box
              component="span"
              sx={{
                display: 'inline-block',
                width: 4,
                height: 4,
                borderRadius: '50%',
                bgcolor: '#C8FF00',
                opacity: index % ADHKAR.length === currentIndex ? 1 : 0.6,
                flexShrink: 0,
              }}
            />
            <span>{adhkar.ar}</span>
            {!isRTL && (
              <span style={{ 
                color: scrolled ? 'rgba(0, 0, 0, 0.35)' : 'rgba(0, 0, 0, 0.25)', 
                fontSize: '0.9rem', 
                fontStyle: 'italic' 
              }}>
                — {adhkar.en}
              </span>
            )}
            {isRTL && (
              <span style={{ 
                color: scrolled ? 'rgba(0, 0, 0, 0.35)' : 'rgba(0, 0, 0, 0.25)', 
                fontSize: '0.8rem' 
              }}>
                — {adhkar.fr}
              </span>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

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
const NavButton = ({ item, isActive, onClick, isRTL }) => (
  <Tooltip title={item.label} placement="bottom" TransitionComponent={Zoom} arrow>
    <Button onClick={onClick} sx={navButtonStyle(item.variant, isActive)}>
      {item.label}
    </Button>
  </Tooltip>
);

const CartItemChip = ({ label, icon: Icon, color = '#141010' }) => (
  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontFamily: 'Amaranth, sans-serif', fontSize: '0.7rem', fontWeight: 600, height: 22, px: 1, borderRadius: '6px', bgcolor: alpha(color, 0.08), color: color }}>
    {Icon && <Icon sx={{ fontSize: 12 }} />}
    {label}
  </Box>
);

// ==================== Mobile Drawer Content ====================
const MobileDrawerContent = ({ onClose, onNavigate, currentLanguageData, onLanguageClick, t, i18n }) => {
  const location = useLocation();
  const navItems = getNavItems(t);
  const isRTL = i18n.language === 'ar';

  return (
    <Box sx={{ width: 320, height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)', direction: isRTL ? 'rtl' : 'ltr' }}>
      <Box sx={{ p: 4, borderBottom: '1px solid rgba(20,16,16,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', background: 'linear-gradient(135deg, #f2f9f1 0%, #ffffff 100%)' }}>
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 16, right: isRTL ? 'auto' : 16, left: isRTL ? 16 : 'auto', color: '#141010', bgcolor: alpha('#141010', 0.05), '&:hover': { bgcolor: alpha('#141010', 0.1) } }}>
          <CloseOutlined />
        </IconButton>
        <Box component="img" src={logo} alt="Tawakkul Logo" sx={{ height: 80, width: 'auto', objectFit: 'contain', mt: 2, cursor: 'pointer' }} onClick={() => onNavigate('/')} />
      </Box>

      <List sx={{ flex: 1, pt: 3, px: 2 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.label} disablePadding>
              <ListItemButton onClick={() => onNavigate(item.path)} sx={{ py: 1.5, px: 3, mx: 1, borderRadius: 3, transition: 'all 0.3s', bgcolor: isActive ? alpha('#141010', 0.05) : 'transparent', '&:hover': { bgcolor: item.variant === 'offers' ? alpha('#c31919', 0.05) : alpha('#141010', 0.05), transform: `translateX(${isRTL ? '-8px' : '8px'})` } }}>
                <ListItemText primary={item.label} primaryTypographyProps={{ sx: { color: item.variant === 'offers' ? '#c31919' : '#141010', fontFamily: isRTL ? '"Noto Kufi Arabic", "Tajawal", sans-serif' : 'Amaranth, sans-serif', fontWeight: item.variant === 'offers' ? 700 : isActive ? 600 : 500, fontSize: '1.1rem', textAlign: isRTL ? 'right' : 'center' } }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ my: 1, mx: 2 }} />

      <Box sx={{ p: 2 }}>
        <Typography variant="caption" sx={{ fontFamily: 'Amaranth, sans-serif', color: alpha('#141010', 0.6), px: 2, mb: 1, display: 'block' }}>
          {t('nav.language', 'LANGUAGE')}
        </Typography>
        {LANGUAGES.map((lang) => (
          <ListItemButton key={lang.code} onClick={() => onLanguageClick(lang.code)} sx={{ borderRadius: 3, mb: 0.5, px: 3, py: 1.2, transition: 'all 0.3s ease', bgcolor: i18n.language === lang.code ? alpha('#141010', 0.05) : 'transparent', '&:hover': { bgcolor: alpha('#141010', 0.06) } }}>
            <ListItemIcon sx={{ minWidth: 40 }}><Box component="img" src={lang.flag} alt={lang.flagAlt} sx={{ width: 28, height: 20, borderRadius: 0.5, objectFit: 'cover' }} /></ListItemIcon>
            <ListItemText primary={lang.label} primaryTypographyProps={{ sx: { color: '#141010', fontFamily: 'Amaranth, sans-serif', fontWeight: i18n.language === lang.code ? 600 : 400 } }} />
            {i18n.language === lang.code && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} />}
          </ListItemButton>
        ))}
      </Box>
    </Box>
  );
};

// ==================== Cart Drawer Content ====================
const CartDrawerContent = ({ onClose, cart, cartIsEmpty, cartCount, subtotal, shippingCost, total, FREE_SHIPPING_THRESHOLD, updateQuantity, removeFromCart, t, i18n }) => {
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: isRTL ? '"Noto Kufi Arabic", "Tajawal", sans-serif' : 'Amaranth, sans-serif', direction: isRTL ? 'rtl' : 'ltr' }}>
      <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ShoppingCartOutlined sx={{ color: '#141010', fontSize: 24 }} />
          <Box>
            <Typography sx={{ fontFamily: 'inherit', fontWeight: 700, color: '#141010', fontSize: '1.1rem' }}>{t('cart.title', 'Shopping Cart')}</Typography>
            <Typography sx={{ fontFamily: 'inherit', fontSize: '0.8rem', color: '#888' }}>{cartCount} {cartCount === 1 ? t('cart.item', 'item') : t('cart.items', 'items')}</Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#141010', bgcolor: alpha('#141010', 0.05), '&:hover': { bgcolor: alpha('#141010', 0.1) } }}><CloseOutlined /></IconButton>
      </Box>

      {cartIsEmpty ? (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4 }}>
          <ShoppingBag sx={{ fontSize: 80, color: alpha('#141010', 0.15), mb: 2 }} />
          <Typography sx={{ fontFamily: 'inherit', fontSize: '1.2rem', fontWeight: 600, color: '#141010', mb: 1 }}>{t('cart.empty', 'Your cart is empty')}</Typography>
          <Typography sx={{ fontFamily: 'inherit', fontSize: '0.9rem', color: '#888', textAlign: 'center', mb: 3 }}>{t('cart.emptyDesc', "Looks like you haven't added anything to your cart yet.")}</Typography>
          <Button variant="contained" onClick={onClose} sx={{ fontFamily: 'inherit', fontWeight: 600, bgcolor: '#141010', color: '#f2f9f1', borderRadius: '12px', px: 4, py: 1.2, textTransform: 'none', '&:hover': { bgcolor: '#2a2a2a' } }}>{t('cart.continueShopping', 'Continue Shopping')}</Button>
        </Box>
      ) : (
        <>
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div key={item.variantKey} initial={{ opacity: 0, x: isRTL ? -50 : 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: isRTL ? 50 : -50, height: 0 }} transition={{ duration: 0.3 }}>
                  <Box sx={{ display: 'flex', gap: 2, p: 2, mb: 1.5, borderRadius: '16px', bgcolor: '#fafafa', border: '1px solid rgba(0,0,0,0.04)', position: 'relative' }}>
                    <Avatar src={item.mainImage} variant="rounded" sx={{ width: 80, height: 80, borderRadius: '12px', bgcolor: '#f0f0f0' }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontFamily: 'inherit', fontWeight: 600, color: '#141010', fontSize: '0.95rem', mb: 0.3 }}>{item.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <CartItemChip label={item.selectedSize} />
                        {item.discount > 0 && <CartItemChip label={`-${item.discount}%`} icon={LocalOffer} color="#e70000" />}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                        <Typography sx={{ fontFamily: 'inherit', fontWeight: 700, color: '#141010', fontSize: '1rem' }}>{(item.price * item.quantity).toFixed(2)} TND</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#fff', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)' }}>
                          <IconButton size="small" onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedSize)} sx={{ color: '#141010', p: 0.5 }}><Remove sx={{ fontSize: 16 }} /></IconButton>
                          <Typography sx={{ fontFamily: 'inherit', fontWeight: 600, minWidth: 24, textAlign: 'center', fontSize: '0.9rem' }}>{item.quantity}</Typography>
                          <IconButton size="small" onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedSize)} sx={{ color: '#141010', p: 0.5 }}><Add sx={{ fontSize: 16 }} /></IconButton>
                        </Box>
                      </Box>
                    </Box>
                    <IconButton size="small" onClick={() => removeFromCart(item.productId, item.selectedSize)} sx={{ position: 'absolute', top: 8, right: isRTL ? 'auto' : 8, left: isRTL ? 8 : 'auto', color: '#e70000', opacity: 0.6, '&:hover': { opacity: 1, bgcolor: alpha('#e70000', 0.05) } }}><Delete sx={{ fontSize: 16 }} /></IconButton>
                  </Box>
                </motion.div>
              ))}
            </AnimatePresence>
          </Box>

          <Box sx={{ p: 2.5, borderTop: '1px solid rgba(0,0,0,0.06)', bgcolor: '#fafafa' }}>
            {subtotal < FREE_SHIPPING_THRESHOLD && (
              <Box sx={{ mb: 2, p: 1.5, borderRadius: '12px', bgcolor: alpha('#2196f3', 0.05), border: "1px solid alpha('#2196f3', 0.1)" }}>
                <Typography sx={{ fontFamily: 'inherit', fontSize: '0.8rem', color: '#2196f3', mb: 0.5 }}>{t('cart.freeShipping', 'Add {{amount}} TND more for free shipping!', { amount: (FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2) })}</Typography>
                <Box sx={{ height: 4, bgcolor: alpha('#2196f3', 0.1), borderRadius: '2px', overflow: 'hidden' }}><Box sx={{ height: '100%', width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%`, bgcolor: '#2196f3', borderRadius: '2px', transition: 'width 0.5s ease' }} /></Box>
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography sx={{ fontFamily: 'inherit', color: '#888', fontSize: '0.9rem' }}>{t('cart.subtotal', 'Subtotal')}</Typography><Typography sx={{ fontFamily: 'inherit', fontWeight: 600, color: '#141010' }}>{subtotal.toFixed(2)} TND</Typography></Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}><Typography sx={{ fontFamily: 'inherit', color: '#888', fontSize: '0.9rem' }}>{t('cart.shipping', 'Shipping')}</Typography><Typography sx={{ fontFamily: 'inherit', fontWeight: 600, color: shippingCost === 0 ? '#4caf50' : '#141010' }}>{shippingCost === 0 ? t('cart.free', 'FREE') : `${shippingCost.toFixed(2)} TND`}</Typography></Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}><Typography sx={{ fontFamily: 'inherit', fontWeight: 700, color: '#141010', fontSize: '1.1rem' }}>{t('cart.total', 'Total')}</Typography><Typography sx={{ fontFamily: 'inherit', fontWeight: 700, color: '#141010', fontSize: '1.2rem' }}>{total.toFixed(2)} TND</Typography></Box>
            <Button fullWidth variant="contained" onClick={() => { onClose(); navigate('/checkout'); }} sx={{ fontFamily: 'inherit', fontWeight: 700, bgcolor: '#141010', color: '#f2f9f1', borderRadius: '14px', py: 1.5, textTransform: 'none', fontSize: '1rem', '&:hover': { bgcolor: '#2a2a2a', transform: 'translateY(-2px)' } }}>{t('cart.checkout', 'Proceed to Checkout')}</Button>
            <Button fullWidth variant="text" onClick={onClose} sx={{ fontFamily: 'inherit', color: '#888', mt: 1, textTransform: 'none', '&:hover': { bgcolor: 'transparent', color: '#141010' } }}>{t('cart.continueShopping', 'Continue Shopping')}</Button>
          </Box>
        </>
      )}
    </Box>
  );
};

// ==================== Main Component ====================
const Navbar = () => {
  const { t, i18n } = useTranslation(['common']);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [languageAnchor, setLanguageAnchor] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  const isRTL = i18n.language === 'ar';
  const navItems = getNavItems(t);

  const { cart, isCartOpen, closeCart, openCart, updateQuantity, removeFromCart, cartCount, subtotal, shippingCost, total, cartIsEmpty, FREE_SHIPPING_THRESHOLD } = useCart();

  useEffect(() => { const handleScroll = () => setScrolled(window.scrollY > 20); window.addEventListener('scroll', handleScroll); return () => window.removeEventListener('scroll', handleScroll); }, []);
  useEffect(() => { const savedLang = localStorage.getItem('language'); if (savedLang && savedLang !== i18n.language) i18n.changeLanguage(savedLang); }, []);

  const handleLanguageClick = (event) => setLanguageAnchor(event.currentTarget);
  const handleLanguageChange = (langCode) => {
    const lang = LANGUAGES.find((l) => l.code === langCode);
    if (lang) { i18n.changeLanguage(lang.code); document.documentElement.dir = lang.dir; document.documentElement.lang = lang.code; localStorage.setItem('language', lang.code); }
    setLanguageAnchor(null);
  };
  const handleNavigate = (path) => { navigate(path); setMobileOpen(false); };
  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  return (
    <>
      {/* Main Navbar */}
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
          direction: isRTL ? 'rtl' : 'ltr' 
        }}
      >
        <Container maxWidth="xl">
          {/* Desktop Layout */}
          <Box 
            sx={{ 
              display: { xs: 'none', md: 'flex' }, 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              gap: 4 
            }}
          >
            <Box 
              component="img" 
              src={logo} 
              alt="Tawakkul Logo" 
              onClick={() => navigate('/')} 
              sx={{ 
                height: { md: 120 }, 
                width: 'auto', 
                objectFit: 'contain', 
                cursor: 'pointer', 
                transition: 'all 0.4s', 
                filter: scrolled ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.06))' : 'drop-shadow(0 4px 20px rgba(0,0,0,0.1))', 
                '&:hover': { transform: 'scale(1.03)' } 
              }} 
            />
            
            <Box sx={{ flex: 1, position: 'relative' }}>
              <Box 
                sx={{ 
                  position: 'relative', 
                  background: scrolled ? alpha('#fcfefe', 0.98) : alpha('#fcfefe', 0.95), 
                  borderRadius: '80px', 
                  boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)' : '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)', 
                  border: '1px solid rgba(20,16,16,0.08)', 
                  backdropFilter: 'blur(10px)', 
                  transition: 'all 0.4s', 
                  overflow: 'hidden', 
                  '&:hover': { 
                    boxShadow: '0 12px 40px rgba(0,0,0,0.12)', 
                    transform: 'translateY(-2px)' 
                  } 
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    px: { md: 3.5 }, 
                    py: { md: 1.2 }, 
                    position: 'relative', 
                    zIndex: 2 
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flex: 1, justifyContent: 'center' }}>
                    {navItems.map((item) => (
                      <NavButton 
                        key={item.label} 
                        item={item} 
                        isActive={location.pathname === item.path} 
                        onClick={() => navigate(item.path)} 
                        isRTL={isRTL} 
                      />
                    ))}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title={t('nav.changeLanguage', 'Change Language')}>
                      <Button 
                        onClick={handleLanguageClick} 
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
                          '&:hover': { 
                            backgroundColor: alpha('#141010', 0.08), 
                            transform: 'scale(1.02)' 
                          } 
                        }} 
                      />
                    </Tooltip>
                    <Tooltip title={t('nav.signIn', 'Sign In')}>
                      <IconButton onClick={() => navigate('/login')} sx={iconButtonStyle}>
                        <Person />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('nav.cart', 'View Cart')}>
                      <IconButton onClick={openCart} sx={iconButtonStyle}>
                        <Badge badgeContent={cartCount} sx={badgeStyle('small')}>
                          <ShoppingCartOutlined />
                        </Badge>
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Mobile Layout - Menu left, Logo center, Icons right */}
          <Box 
            sx={{ 
              display: { xs: 'flex', md: 'none' }, 
              alignItems: 'center', 
              justifyContent: 'space-between',
              position: 'relative',
              py: 1
            }}
          >
            {/* Left - Menu Icon with "menu" text */}
            <Box 
              onClick={() => setMobileOpen(true)}
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                cursor: 'pointer',
                minWidth: 50,
                '&:hover': {
                  '& .menu-icon': {
                    bgcolor: alpha('#141010', 0.08),
                    transform: 'rotate(90deg)'
                  }
                }
              }}
            >
              <IconButton 
                className="menu-icon"
                sx={{
                  ...iconButtonStyle,
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                <MenuOutlined sx={{ fontSize: 24 }} />
              </IconButton>
              <Typography 
                sx={{ 
                  fontFamily: 'Amaranth, sans-serif', 
                  fontSize: '0.6rem', 
                  fontWeight: 500, 
                  color: '#141010',
                  mt: -0.5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                {t('nav.menu', 'Menu')}
              </Typography>
            </Box>
            
            {/* Center - Smaller Logo */}
            <Box 
              component="img" 
              src={logo} 
              alt="Tawakkul Logo" 
              onClick={() => navigate('/')}
              sx={{ 
                height: 50, 
                width: 'auto', 
                objectFit: 'contain', 
                cursor: 'pointer',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'scale(1.05)' }
              }} 
            />
            
            {/* Right - Person and Cart Icons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 50, justifyContent: 'flex-end' }}>
              <Tooltip title={t('nav.account', 'Account')}>
                <IconButton onClick={() => navigate('/login')} sx={{ ...iconButtonStyle, p: 1 }}>
                  <Person sx={{ fontSize: 22 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('nav.cart', 'View Cart')}>
                <IconButton onClick={openCart} sx={{ ...iconButtonStyle, p: 1 }}>
                  <Badge badgeContent={cartCount} sx={badgeStyle('small')}>
                    <ShoppingCartOutlined sx={{ fontSize: 22 }} />
                  </Badge>
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Adhkar Ticker */}
          <AdhkarTicker isRTL={isRTL} scrolled={scrolled} />
          
         
        </Container>
      </Box>

      {/* Navbar + Ticker + Secondary Menu spacer */}
      <Box sx={{ height: { xs: 260, sm: 240, md: 300 } }} />

      {/* Language Menu */}
      <Menu 
        anchorEl={languageAnchor} 
        open={Boolean(languageAnchor)} 
        onClose={() => setLanguageAnchor(null)} 
        TransitionComponent={Fade} 
        PaperProps={{ 
          sx: { 
            bgcolor: '#ffffff', 
            color: '#141010', 
            mt: 1.5, 
            borderRadius: 3, 
            boxShadow: '0 8px 40px rgba(0,0,0,0.12)', 
            minWidth: 200, 
            overflow: 'hidden' 
          } 
        }}
      >
        {LANGUAGES.map((lang) => (
          <MenuItem 
            key={lang.code} 
            onClick={() => handleLanguageChange(lang.code)} 
            selected={i18n.language === lang.code} 
            sx={{ 
              fontFamily: 'Amaranth, sans-serif', 
              gap: 1.5, 
              py: 1.2, 
              px: 2, 
              '&.Mui-selected': { bgcolor: alpha('#141010', 0.05) }, 
              '&:hover': { bgcolor: alpha('#141010', 0.05) } 
            }}
          >
            <Box component="img" src={lang.flag} alt={lang.flagAlt} sx={{ width: 28, height: 20, borderRadius: 0.5, objectFit: 'cover' }} />
            <Box sx={{ flex: 1 }}>{lang.label}</Box>
            {i18n.language === lang.code && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} />}
          </MenuItem>
        ))}
      </Menu>

      {/* Mobile Drawer */}
      <Drawer 
        variant="temporary" 
        anchor={isRTL ? 'right' : 'left'} 
        open={mobileOpen} 
        onClose={() => setMobileOpen(false)} 
        sx={{ 
          display: { xs: 'block', md: 'none' }, 
          '& .MuiDrawer-paper': { 
            width: '85%', 
            maxWidth: 320, 
            bgcolor: '#ffffff', 
            borderTopRightRadius: isRTL ? 0 : 32, 
            borderBottomRightRadius: isRTL ? 0 : 32, 
            borderTopLeftRadius: isRTL ? 32 : 0, 
            borderBottomLeftRadius: isRTL ? 32 : 0 
          } 
        }}
      >
        <MobileDrawerContent 
          onClose={() => setMobileOpen(false)} 
          onNavigate={handleNavigate} 
          currentLanguageData={currentLang} 
          onLanguageClick={handleLanguageChange} 
          t={t} 
          i18n={i18n} 
        />
      </Drawer>

      {/* Cart Drawer */}
      <Drawer 
        anchor={isRTL ? 'left' : 'right'} 
        open={isCartOpen} 
        onClose={closeCart} 
        PaperProps={{ 
          sx: { 
            width: { xs: '100%', sm: 420 }, 
            maxWidth: '100vw', 
            bgcolor: '#ffffff' 
          } 
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
          t={t} 
          i18n={i18n} 
        />
      </Drawer>
    </>
  );
};

export default Navbar;