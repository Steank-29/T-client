// pages/Offers.jsx - Full i18n Integration
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Badge,
  Snackbar,
  Alert,
  Skeleton,
  Rating,
  Chip,
  alpha,
  Fab,
  Zoom,
  Typography,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  ShoppingCart,
  Check,
  ArrowForward,
  LocalOffer,
  AccessTime,
  ContentCopy,
  Timer,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { offerService } from '../services/api';
import { useCart } from '../context/CartContext';

// ─── Constants ───────────────────────────────────────────────────────────────

const FETCH_CONFIG = {
  limit: 50,
  status: 'active',
  sortBy: 'createdAt',
  sortOrder: 'desc', 
};

// ─── Design Tokens ────────────────────────────────────────────────────────────

const TOKEN = {
  black: '#0A0A0A',
  white: '#FFFFFF',
  offWhite: '#F7F6F3',
  accent: '#FF6B2B',
  accentDark: '#E55A1E',
  accentGlow: 'rgba(255,107,43,0.35)',
  expired: '#999999',
  timerBg: '#FFF5F0',
  muted: '#6B6B6B',
  border: 'rgba(10,10,10,0.08)',
  borderHover: 'rgba(10,10,10,0.18)',
  cardShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
  cardShadowHover: '0 24px 64px rgba(0,0,0,0.14)',
  fontDisplay: '"Barlow Condensed", sans-serif',
  fontBody: '"DM Sans", sans-serif',
  fontAr: '"Noto Kufi Arabic", "Tajawal", sans-serif',
};

// ─── Global styles ────────────────────────────────────────────────────────────

const injectGlobalStyles = () => {
  if (document.getElementById('offers-page-styles')) return;
  const style = document.createElement('style');
  style.id = 'offers-page-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=DM+Sans:wght@300;400;500;600&family=Noto+Kufi+Arabic:wght@400;500;600;700;800;900&family=Tajawal:wght@400;500;700;800;900&display=swap');
    .offer-card { transition: box-shadow 0.32s ease, transform 0.32s ease; }
    .offer-card:hover { transform: translateY(-4px); }
    .offer-card:hover .offer-img { transform: scale(1.05); }
    .offer-card:hover .offer-overlay { opacity: 1 !important; }
    .offer-card:hover .offer-quick { opacity: 1 !important; transform: translateX(-50%) translateY(0) !important; }
    .offer-img { transition: transform 0.55s cubic-bezier(0.4,0,0.2,1); }
    .offer-overlay { transition: opacity 0.32s ease; }
    .offer-quick { transition: opacity 0.3s ease, transform 0.3s ease; }
    .size-chip-offer { transition: background 0.18s, color 0.18s, border-color 0.18s; }
    .size-chip-offer:hover { background: ${TOKEN.black} !important; color: ${TOKEN.white} !important; }
    .cart-fab-offer { animation: fab-pulse-offer 2.4s ease-in-out infinite; }
    @keyframes fab-pulse-offer { 0%,100% { box-shadow: 0 0 0 0 ${TOKEN.accentGlow}; } 50% { box-shadow: 0 0 0 12px rgba(255,107,43,0); } }
    @keyframes shimmer { 0% { background-position: -600px 0; } 100% { background-position: 600px 0; } }
    .shimmer-bone { background: linear-gradient(90deg, #efefef 25%, #e2e2e2 50%, #efefef 75%); background-size: 600px; animation: shimmer 1.4s infinite linear; }
  `;
  document.head.appendChild(style);
};

// ─── Utility ──────────────────────────────────────────────────────────────────

const formatOfferData = (offer) => ({
  ...offer,
  id: offer._id,
  mainImage: offer.mainImage?.url || 'https://via.placeholder.com/600x600',
  images: offer.images?.map((img) => img.url) || [],
  discountedPrice: offer.discountedPrice || (offer.mainPrice * (1 - offer.discount / 100)).toFixed(2),
  sizes: offer.sizes || [],
});

const getTimeRemaining = (endDate, t) => {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end - now;
  if (diff <= 0) return { text: t('offers.expired', 'Expired'), expired: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return { text: t('offers.timeLeftDH', '{{days}}d {{hours}}h left', { days, hours }), expired: false };
  if (hours > 0) return { text: t('offers.timeLeftHM', '{{hours}}h {{minutes}}m left', { hours, minutes }), expired: false, urgent: hours < 6 };
  return { text: t('offers.timeLeftM', '{{minutes}}m left', { minutes }), expired: false, urgent: true };
};

const initializeDefaultSizes = (offers) => {
  const map = {};
  offers.forEach((o) => { if (o.sizes?.length) map[o.id] = o.sizes[0]; });
  return map;
};

// ─── Custom Hooks ─────────────────────────────────────────────────────────────

const useOfferFetch = (params) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchOffers = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const response = await offerService.getOffers(params);
      if (response.data.success) { const formatted = response.data.data.map(formatOfferData); setOffers(formatted); return formatted; }
      throw new Error(response.data.message || 'Failed to fetch offers');
    } catch (err) { const msg = err.response?.data?.message || err.message || 'Failed to load offers'; setError(msg); return []; }
    finally { setLoading(false); }
  }, [params]);
  return { offers, loading, error, fetchOffers };
};

const useSnackbar = () => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const show = useCallback((message, severity = 'success') => setSnackbar({ open: true, message, severity }), []);
  const hide = useCallback(() => setSnackbar((p) => ({ ...p, open: false })), []);
  return { snackbar, showSnackbar: show, hideSnackbar: hide };
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const PageHeader = ({ t, isRTL }) => (
  <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
    <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: { xs: 4, md: 6 }, pb: 3, borderBottom: `1px solid ${TOKEN.border}`, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
      <Box sx={{ textAlign: isRTL ? 'right' : 'left' }}>
        <Typography component="p" sx={{ fontFamily: isRTL ? TOKEN.fontAr : TOKEN.fontBody, fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: TOKEN.muted, mb: 0.75 }}>
          {t('offers.limitedTime', 'Limited Time')}
        </Typography>
        <Typography component="h1" sx={{ fontFamily: isRTL ? TOKEN.fontAr : TOKEN.fontDisplay, fontWeight: 900, fontSize: { xs: '3rem', sm: '4.5rem', md: '6rem' }, lineHeight: 0.9, letterSpacing: '-0.02em', color: TOKEN.black, textTransform: 'uppercase' }}>
          {t('common:offers.off', 'Offers')}
        </Typography>
      </Box>
      <Box sx={{ bgcolor: TOKEN.accent, px: 2.5, py: 1, borderRadius: '4px', display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 0.75, mb: 0.5 }}>
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: TOKEN.white }} />
        <Typography sx={{ fontFamily: TOKEN.fontDisplay, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: TOKEN.white }}>
          {t('offers.hotDeals', 'Hot Deals')}
        </Typography>
      </Box>
    </Box>
  </motion.div>
);

const ProductSkeleton = ({ index }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: index * 0.06 }}>
    <Box sx={{ borderRadius: '16px', overflow: 'hidden', bgcolor: TOKEN.offWhite }}>
      <Box className="shimmer-bone" sx={{ width: '100%', pt: '110%', borderRadius: '16px 16px 0 0' }} />
      <Box sx={{ p: 2 }}>
        {[80, 55, 40].map((w, i) => <Box key={i} className="shimmer-bone" sx={{ height: 12, width: `${w}%`, borderRadius: 4, mb: 1 }} />)}
        <Box className="shimmer-bone" sx={{ height: 36, borderRadius: 8, mt: 1.5 }} />
      </Box>
    </Box>
  </motion.div>
);

const LoadingSkeleton = () => (
  <Grid container rowSpacing={2} columnSpacing={{ xs: 1.5, sm: 2.5 }} justifyContent="center">
    {[...Array(6)].map((_, i) => <Grid size={{ xs: 6, sm: 6, md: 4 }} key={i}><ProductSkeleton index={i} /></Grid>)}
  </Grid>
);

const DiscountBadge = ({ discount }) => discount > 0 ? (
  <Box sx={{ position: 'absolute', top: 12, left: 12, bgcolor: TOKEN.accent, color: TOKEN.white, fontFamily: TOKEN.fontDisplay, fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.05em', px: 1.25, py: 0.3, borderRadius: '4px', textTransform: 'uppercase' }}>
    -{discount}%
  </Box>
) : null;

const TimerBadge = ({ endDate, t }) => {
  const [time, setTime] = useState(getTimeRemaining(endDate, t));
  useEffect(() => { const timer = setInterval(() => setTime(getTimeRemaining(endDate, t)), 60000); return () => clearInterval(timer); }, [endDate, t]);
  if (time.expired) return <Box sx={{ position: 'absolute', bottom: 12, left: 12, bgcolor: TOKEN.expired, color: TOKEN.white, fontFamily: TOKEN.fontDisplay, fontWeight: 700, fontSize: '0.62rem', letterSpacing: '0.06em', px: 1, py: 0.3, borderRadius: '4px', display: 'flex', alignItems: 'center', gap: 0.5, textTransform: 'uppercase' }}>{t('offers.expired', 'Expired')}</Box>;
  return <Box sx={{ position: 'absolute', bottom: 12, left: 12, bgcolor: time.urgent ? TOKEN.accent : TOKEN.black, color: TOKEN.white, fontFamily: TOKEN.fontDisplay, fontWeight: 700, fontSize: '0.62rem', letterSpacing: '0.04em', px: 1, py: 0.3, borderRadius: '4px', display: 'flex', alignItems: 'center', gap: 0.5 }}><AccessTime sx={{ fontSize: 11 }} />{time.text}</Box>;
};

const ProductRating = ({ rating, salesCount, t }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
    <Rating value={rating || 0} precision={0.5} readOnly size="small" sx={{ color: TOKEN.accent, fontSize: '0.7rem', filter: 'saturate(1.2)' }} />
    <Typography sx={{ fontFamily: TOKEN.fontBody, fontSize: '0.65rem', color: TOKEN.muted, lineHeight: 1 }}>{(rating || 0).toFixed(1)}</Typography>
    {salesCount > 0 && <Typography sx={{ fontFamily: TOKEN.fontBody, fontSize: '0.6rem', color: TOKEN.muted, ml: 'auto' }}>{t('offers.sold', '{{count}} sold', { count: salesCount.toLocaleString() })}</Typography>}
  </Box>
);

const ProductPrice = ({ mainPrice, discountedPrice, discount, t }) => (
  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, mb: 1, flexWrap: 'wrap' }}>
    <Typography sx={{ fontFamily: TOKEN.fontDisplay, fontWeight: 700, fontSize: { xs: '1.05rem', sm: '1.2rem' }, color: TOKEN.accent, letterSpacing: '-0.01em' }}>{discountedPrice}&thinsp;{t('common:currency', 'TND')}</Typography>
    {discount > 0 && <Typography sx={{ fontFamily: TOKEN.fontBody, fontSize: '0.72rem', color: TOKEN.muted, textDecoration: 'line-through' }}>{mainPrice.toFixed(2)} {t('common:currency', 'TND')}</Typography>}
  </Box>
);

const SizeSelector = ({ sizes, selectedSize, onSizeSelect }) => {
  if (!sizes?.length) return null;
  return <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.25 }}>{sizes.map((size) => { const active = selectedSize === size; return <Chip key={size} label={size} size="small" className="size-chip-offer" onClick={onSizeSelect(size)} icon={active ? <Check sx={{ fontSize: 10, '&&': { color: TOKEN.white } }} /> : undefined} sx={{ fontFamily: TOKEN.fontDisplay, fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.06em', height: 24, px: 0.25, bgcolor: active ? TOKEN.black : 'transparent', color: active ? TOKEN.white : TOKEN.black, border: `1px solid ${active ? TOKEN.black : TOKEN.borderHover}`, borderRadius: '4px', cursor: 'pointer' }} />; })}</Box>;
};

const OfferCard = ({ offer, selectedSize, onOfferClick, onAddToCart, onSizeSelect, index, t, isRTL }) => (
  <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.45, delay: (index % 9) * 0.055, ease: [0.16, 1, 0.3, 1] }} style={{ height: '100%' }}>
    <Card className="offer-card" onClick={() => onOfferClick(offer)} elevation={0}
      sx={{ width: '100%', maxWidth: 340, mx: 'auto', display: 'flex', flexDirection: 'column', cursor: 'pointer', borderRadius: '16px', overflow: 'hidden', bgcolor: TOKEN.white, border: `1px solid ${TOKEN.border}`, boxShadow: TOKEN.cardShadow, position: 'relative', '&:hover': { boxShadow: TOKEN.cardShadowHover, borderColor: TOKEN.borderHover } }}>
      <Box sx={{ position: 'relative', overflow: 'hidden', pt: '110%', bgcolor: TOKEN.offWhite }}>
        <CardMedia className="offer-img" component="img" image={offer.mainImage} alt={offer.name} sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <Box className="offer-overlay" sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.1) 45%, transparent 70%)', opacity: 0, pointerEvents: 'none' }} />
        <Button className="offer-quick" variant="contained" size="small" disableElevation onClick={(e) => { e.stopPropagation(); onOfferClick(offer); }}
          endIcon={<ArrowForward sx={{ fontSize: '0.7rem !important', transform: isRTL ? 'rotate(180deg)' : 'none' }} />}
          sx={{ position: 'absolute', bottom: 50, left: '50%', transform: 'translateX(-50%) translateY(8px)', opacity: 0, fontFamily: TOKEN.fontDisplay, fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', bgcolor: TOKEN.accent, color: TOKEN.white, borderRadius: '100px', px: 2.5, py: 0.6, whiteSpace: 'nowrap', '&:hover': { bgcolor: TOKEN.accentDark } }}>
          {t('common:quickView', 'Quick View')}
        </Button>
        <DiscountBadge discount={offer.discount} />
        <TimerBadge endDate={offer.endDate} t={t} />
      </Box>
      <CardContent sx={{ p: { xs: 1.75, sm: 2.25 }, pb: '16px !important', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography sx={{ fontFamily: isRTL ? TOKEN.fontAr : TOKEN.fontBody, fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: TOKEN.muted, mb: 0.4, textAlign: isRTL ? 'right' : 'left' }}>
          {offer.category || t('offers.specialOffer', 'Special Offer')}
        </Typography>
        <Typography sx={{ fontFamily: isRTL ? TOKEN.fontAr : TOKEN.fontDisplay, fontWeight: 700, fontSize: { xs: '0.95rem', sm: '1.05rem' }, lineHeight: 1.25, letterSpacing: '-0.01em', color: TOKEN.black, mb: 0.75, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: 32, textAlign: isRTL ? 'right' : 'left' }}>{offer.name}</Typography>
        <ProductRating rating={offer.review} salesCount={offer.salesCount} t={t} />
        <ProductPrice mainPrice={offer.mainPrice} discountedPrice={offer.discountedPrice} discount={offer.discount} t={t} />
        <SizeSelector sizes={offer.sizes} selectedSize={selectedSize} onSizeSelect={(size) => (e) => { e.stopPropagation(); onSizeSelect(offer.id, size); }} />
        <Button variant="contained" fullWidth disableElevation
          startIcon={isRTL ? null : <ShoppingCart sx={{ fontSize: '1rem !important' }} />}
          endIcon={isRTL ? <ShoppingCart sx={{ fontSize: '1rem !important' }} /> : null}
          onClick={(e) => onAddToCart(offer, selectedSize, e)}
          sx={{ mt: 'auto', fontFamily: isRTL ? TOKEN.fontAr : TOKEN.fontDisplay, fontWeight: 800, fontSize: { xs: '0.72rem', sm: '0.8rem' }, letterSpacing: '0.06em', textTransform: 'uppercase', bgcolor: TOKEN.black, color: TOKEN.white, borderRadius: '10px', py: { xs: 0.85, sm: 1.1 }, transition: 'background 0.2s, transform 0.2s', '&:hover': { bgcolor: '#1f1f1f', transform: 'translateY(-1px)' } }}>
          {t('common:addToCart', 'Add to Cart')}
        </Button>
      </CardContent>
    </Card>
  </motion.div>
);

const EmptyState = ({ t, isRTL }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
    <Box sx={{ textAlign: 'center', py: { xs: 8, md: 14 }, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
      <Typography sx={{ fontFamily: isRTL ? TOKEN.fontAr : TOKEN.fontDisplay, fontWeight: 900, fontSize: { xs: '3.5rem', md: '5rem' }, lineHeight: 1, color: TOKEN.black, textTransform: 'uppercase', letterSpacing: '-0.03em' }}>
        {t('offers.noActive', 'No Active')}<br />{t('common:offers', 'Offers')}
      </Typography>
      <Typography sx={{ fontFamily: isRTL ? TOKEN.fontAr : TOKEN.fontBody, color: TOKEN.muted, fontSize: '0.9rem', maxWidth: 340 }}>
        {t('offers.checkBack', 'Check back soon for new deals and discounts.')}
      </Typography>
    </Box>
  </motion.div>
);

const ErrorState = ({ error, onRetry, t, isRTL }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography sx={{ fontFamily: isRTL ? TOKEN.fontAr : TOKEN.fontDisplay, fontWeight: 800, fontSize: '1.6rem', color: '#c0392b', mb: 1, textTransform: 'uppercase' }}>{t('offers.somethingWrong', 'Something went wrong')}</Typography>
      <Typography sx={{ fontFamily: isRTL ? TOKEN.fontAr : TOKEN.fontBody, color: TOKEN.muted, mb: 3, fontSize: '0.88rem' }}>{error}</Typography>
      <Button onClick={onRetry} variant="contained" disableElevation sx={{ fontFamily: TOKEN.fontDisplay, fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', bgcolor: TOKEN.black, color: TOKEN.white, borderRadius: '10px', px: 4, py: 1.2, '&:hover': { bgcolor: '#1f1f1f' } }}>{t('offers.retry', 'Retry')}</Button>
    </Box>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const Offers = () => {
  const { t, i18n } = useTranslation(['common']);
  const isRTL = i18n.language === 'ar';
  injectGlobalStyles();
  const navigate = useNavigate();
  const { addToCart, cartCount, openCart } = useCart();
  const { offers, loading, error, fetchOffers } = useOfferFetch(FETCH_CONFIG);
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
  const [selectedSize, setSelectedSize] = useState({});

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [isRTL, i18n.language]);

  useEffect(() => {
    const load = async () => { const data = await fetchOffers(); if (data.length > 0) setSelectedSize(initializeDefaultSizes(data)); };
    load();
  }, [fetchOffers]);

  const handleOfferClick = useCallback((offer) => navigate(`/product/${offer.id}`, { state: { product: offer } }), [navigate]);

  const handleAddToCart = useCallback((offer, size, event) => {
    event.stopPropagation();
    const s = size || offer.sizes?.[0];
    if (!s) { showSnackbar(t('offers.selectSize', 'Please select a size'), 'warning'); return; }
    addToCart(offer, 1, s);
    showSnackbar(t('offers.addedToCart', '{{name}} — size {{size}} added', { name: offer.name, size: s }), 'success');
  }, [addToCart, showSnackbar, t]);

  const handleSizeSelect = useCallback((offerId, size) => setSelectedSize((prev) => ({ ...prev, [offerId]: size })), []);

  return (
    <Box sx={{ bgcolor: TOKEN.white, minHeight: '60vh', direction: isRTL ? 'rtl' : 'ltr' }}>
      <Container maxWidth="xl" sx={{ py: { xs: 3, sm: 5 }, px: { xs: 2, sm: 3, md: 4 } }}>
        <PageHeader t={t} isRTL={isRTL} />
        {loading ? <LoadingSkeleton /> : error ? <ErrorState error={error} onRetry={fetchOffers} t={t} isRTL={isRTL} /> : offers.length === 0 ? <EmptyState t={t} isRTL={isRTL} /> : (
          <Grid container rowSpacing={{ xs: 2, sm: 3 }} columnSpacing={{ xs: 1.5, sm: 2.5 }} justifyContent="center">
            <AnimatePresence>
              {offers.map((offer, index) => (
                <Grid size={{ xs: 6, sm: 6, md: 4 }} key={offer.id}>
                  <OfferCard offer={offer} selectedSize={selectedSize[offer.id]} onOfferClick={handleOfferClick} onAddToCart={handleAddToCart} onSizeSelect={handleSizeSelect} index={index} t={t} isRTL={isRTL} />
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>
        )}
      </Container>
      <Zoom in={cartCount > 0}>
        <Fab onClick={openCart} className="cart-fab-offer"
          sx={{ position: 'fixed', bottom: { xs: 20, sm: 28 }, right: isRTL ? 'auto' : { xs: 20, sm: 28 }, left: isRTL ? { xs: 20, sm: 28 } : 'auto', bgcolor: TOKEN.accent, color: TOKEN.white, width: { xs: 50, sm: 58 }, height: { xs: 50, sm: 58 }, '&:hover': { bgcolor: TOKEN.accentDark, transform: 'scale(1.08)' }, transition: 'background 0.2s, transform 0.2s', zIndex: 1200 }}>
          <Badge badgeContent={cartCount} sx={{ '& .MuiBadge-badge': { bgcolor: TOKEN.black, color: TOKEN.white, fontFamily: TOKEN.fontDisplay, fontWeight: 800, fontSize: '0.7rem', minWidth: 18, height: 18 } }}>
            <ShoppingCart sx={{ fontSize: { xs: 22, sm: 26 } }} />
          </Badge>
        </Fab>
      </Zoom>
      <Snackbar open={snackbar.open} autoHideDuration={3200} onClose={hideSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={hideSnackbar} severity={snackbar.severity} icon={snackbar.severity === 'success' ? <Check fontSize="small" /> : undefined}
          sx={{ fontFamily: isRTL ? TOKEN.fontAr : TOKEN.fontBody, fontWeight: 500, fontSize: '0.82rem', borderRadius: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.14)', bgcolor: snackbar.severity === 'success' ? TOKEN.black : undefined, color: snackbar.severity === 'success' ? TOKEN.white : undefined }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Offers;