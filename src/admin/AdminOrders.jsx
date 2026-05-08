// pages/admin/AdminOrders.jsx - Enterprise Professional Edition
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Typography, Button, TextField, Select, MenuItem, FormControl,
  InputLabel, Grid, Paper, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, Snackbar, Chip, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, InputAdornment, LinearProgress, Card, CardContent,
  alpha, Divider, Tabs, Tab, Stack, Badge, Autocomplete, useTheme,
  useMediaQuery, Skeleton, Zoom, Fade, Collapse, List, ListItem,
  ListItemIcon, ListItemText, Breadcrumbs, Link,
} from '@mui/material';
import {
  Search, Refresh, PictureAsPdf, TableChart, Visibility, Delete,
  LocalShipping, CheckCircle, Cancel, Pending, Inventory, Receipt,
  Print, Download, LocationOn, Phone, Email, Person, ShoppingCart,
  FilterList, Clear, ArrowBack, MoreVert, Schedule, Payment,
  Description, Dashboard, TrendingUp, TrendingDown, AttachMoney,
  ShoppingBag, Storefront, AdminPanelSettings, Notifications,
  ArrowForward, Star, Verified, LocalOffer, FactCheck, Speed,
  Assessment, PointOfSale, Summarize, ContentPaste, Archive,
  Unarchive, Block, TaskAlt, HourglassEmpty, LocalAtm,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { orderService } from '../services/api';

// ==================== ENTERPRISE DESIGN SYSTEM ====================
const DesignSystem = {
  colors: {
    primary: '#0A0E27',
    primaryLight: '#1F2749',
    secondary: '#C8102E',
    accent: '#F4A261',
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    info: '#3B82F6',
    purple: '#7C3AED',
    bg: '#ffffff',
    surface: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
  },
  fonts: {
    display: '"Barlow Condensed", "Arial Black", sans-serif',
    heading: '"Satoshi", "Inter", sans-serif',
    body: '"Inter", -apple-system, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  radius: { xs: 6, sm: 8, md: 12, lg: 16, xl: 20, full: 999 },
  shadows: {
    xs: '0 1px 2px rgba(10,14,39,0.04)',
    sm: '0 2px 4px rgba(10,14,39,0.06), 0 1px 2px rgba(10,14,39,0.04)',
    md: '0 4px 8px rgba(10,14,39,0.08), 0 2px 4px rgba(10,14,39,0.04)',
    lg: '0 8px 24px rgba(10,14,39,0.12), 0 4px 8px rgba(10,14,39,0.06)',
    xl: '0 12px 48px rgba(10,14,39,0.16), 0 8px 16px rgba(10,14,39,0.08)',
  },
};

// ==================== CONSTANTS ====================
const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: '#D97706', icon: HourglassEmpty, bgColor: '#FEF3C7', borderColor: '#FCD34D' },
  { value: 'confirmed', label: 'Confirmed', color: '#3B82F6', icon: FactCheck, bgColor: '#DBEAFE', borderColor: '#93C5FD' },
  { value: 'processing', label: 'Processing', color: '#7C3AED', icon: Inventory, bgColor: '#EDE9FE', borderColor: '#C4B5FD' },
  { value: 'shipped', label: 'Shipped', color: '#059669', icon: LocalShipping, bgColor: '#D1FAE5', borderColor: '#6EE7B7' },
  { value: 'delivered', label: 'Delivered', color: '#059669', icon: CheckCircle, bgColor: '#D1FAE5', borderColor: '#6EE7B7' },
  { value: 'cancelled', label: 'Cancelled', color: '#DC2626', icon: Cancel, bgColor: '#FEE2E2', borderColor: '#FCA5A5' },
];

const PAYMENT_METHODS = {
  cash_on_delivery: { label: 'Cash on Delivery', icon: LocalAtm, color: '#D97706' },
  card: { label: 'Card Payment', icon: Payment, color: '#3B82F6' },
  online: { label: 'Online Payment', icon: Verified, color: '#7C3AED' },
};

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date' },
  { value: 'finalAmount', label: 'Amount' },
  { value: 'status', label: 'Status' },
  { value: 'orderNumber', label: 'Order Number' },
];

// ==================== UTILITIES ====================
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-TN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0) + ' TND';
};

const formatDate = (date, options = {}) => {
  if (!date) return 'N/A';
  const defaultOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const getStatusConfig = (status) => ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];

const getPaymentConfig = (method) => PAYMENT_METHODS[method] || PAYMENT_METHODS.cash_on_delivery;

// ==================== DELIVERY NOTE HTML GENERATOR ====================
const generateDeliveryNoteHTML = (order) => {
  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const statusCfg = getStatusConfig(order.status);
  const paymentCfg = getPaymentConfig(order.paymentMethod);
  const totalItems = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Bon de Livraison - ${order.orderNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Barlow+Condensed:wght@600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; color: #0F172A; padding: 40px; max-width: 210mm; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0A0E27; padding-bottom: 20px; margin-bottom: 28px; }
    .logo h1 { font-family: 'Barlow Condensed', sans-serif; font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em; color: #0A0E27; }
    .logo h1 span { color: #C8102E; }
    .logo p { font-size: 10px; color: #94A3B8; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 2px; }
    .doc-info { text-align: right; }
    .doc-type { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #0A0E27; }
    .doc-number { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; color: #C8102E; margin-top: 4px; }
    .doc-date { font-size: 11px; color: #94A3B8; margin-top: 4px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
    .info-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 18px; }
    .info-card h3 { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #475569; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
    .info-card p { font-size: 12px; line-height: 1.7; color: #0F172A; }
    .info-card .label { font-weight: 600; color: #475569; display: inline-block; width: 60px; }
    .status-badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #0A0E27; color: #FFFFFF; font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 12px 14px; }
    td { padding: 12px 14px; border-bottom: 1px solid #E2E8F0; font-size: 12px; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .summary-box { width: 320px; margin-left: auto; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 18px; }
    .summary-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; color: #475569; }
    .summary-row.total { border-top: 2px solid #0A0E27; margin-top: 8px; padding-top: 12px; font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 900; color: #0A0E27; }
    .signatures { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 40px; padding-top: 20px; border-top: 1px dashed #CBD5E1; }
    .sig-box { text-align: center; }
    .sig-box p { font-weight: 600; font-size: 11px; margin-bottom: 30px; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
    .sig-line { border-bottom: 1px solid #94A3B8; margin: 0 20px; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #E2E8F0; display: flex; justify-content: space-between; font-size: 10px; color: #94A3B8; }
    @media print { body { padding: 20px; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <h1><span>TAW</span>AKKUL</h1>
      <p>Premium Sportswear & Apparel</p>
    </div>
    <div class="doc-info">
      <div class="doc-type">Bon de Livraison</div>
      <div class="doc-number">N° ${order.orderNumber}</div>
      <div class="doc-date">${today}</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-card">
      <h3>👤 Customer Information</h3>
      <p><span class="label">Name:</span> <strong>${order.customer.fullName}</strong></p>
      <p><span class="label">Email:</span> ${order.customer.email}</p>
      <p><span class="label">Phone:</span> ${order.customer.phone}</p>
      <p><span class="label">Address:</span> ${order.customer.address}</p>
      ${order.customer.notes ? `<p style="margin-top:6px;color:#D97706;"><span class="label">Notes:</span> ${order.customer.notes}</p>` : ''}
    </div>
    <div class="info-card">
      <h3>📦 Order Information</h3>
      <p><span class="label">Order:</span> <strong>#${order.orderNumber}</strong></p>
      <p><span class="label">Date:</span> ${formatDate(order.createdAt)}</p>
      <p><span class="label">Payment:</span> ${paymentCfg.label}</p>
      <p><span class="label">Status:</span> <span class="status-badge" style="background:${statusCfg.bgColor};color:${statusCfg.color};border:1px solid ${statusCfg.borderColor};">${statusCfg.label}</span></p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th class="text-center">Size</th>
        <th class="text-center">Qty</th>
        <th class="text-right">Unit Price</th>
        <th class="text-right">Line Total</th>
      </tr>
    </thead>
    <tbody>
      ${order.items.map(item => `
        <tr>
          <td>
            <strong>${item.name}</strong>
            ${item.discount > 0 ? `<br><span style="color:#059669;font-size:10px;">-${item.discount}% OFF</span>` : ''}
          </td>
          <td class="text-center"><span style="background:#F1F5F9;padding:2px 8px;border-radius:4px;font-weight:600;">${item.size}</span></td>
          <td class="text-center">${item.quantity}</td>
          <td class="text-right">${item.discountedPrice.toFixed(2)} TND</td>
          <td class="text-right"><strong>${(item.discountedPrice * item.quantity).toFixed(2)} TND</strong></td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="summary-box">
    <div class="summary-row"><span>Subtotal (${totalItems} items)</span><span>${order.totalAmount.toFixed(2)} TND</span></div>
    ${order.discountAmount > 0 ? `<div class="summary-row" style="color:#059669;"><span>Discount</span><span>-${order.discountAmount.toFixed(2)} TND</span></div>` : ''}
    <div class="summary-row"><span>Shipping</span><span>${order.shippingCost === 0 ? '<span style="color:#059669;">FREE</span>' : order.shippingCost.toFixed(2) + ' TND'}</span></div>
    <div class="summary-row total"><span>TOTAL</span><span style="color:#C8102E;">${order.finalAmount.toFixed(2)} TND</span></div>
  </div>

<div class="signatures">
  <div class="sig-box">
    <p>Prepared by</p>
    <div style="font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 800; color: #0A0E27; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Tawakkol</div>
    <div class="sig-line"></div>
  </div>
  <div class="sig-box">
    <p>Delivered by</p>
    <div style="font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 800; color: #0A0E27; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Fast Delivery</div>
    <div class="sig-line"></div>
  </div>
  <div class="sig-box">
    <p>Sent with</p>
    <div style="font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 800; color: #0A0E27; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Care</div>
    <div class="sig-line"></div>
  </div>
</div>

  <div class="footer">
    <span>Tawakkul © ${new Date().getFullYear()} - Premium Sportswear</span>
    <span>Generated: ${today}</span>
  </div>
</body>
</html>`;
};

// ==================== SUB-COMPONENTS ====================

// Stat Card Component
const StatCard = ({ item, index }) => {
  const Icon = item.icon;
  return (
    <Grid item xs={6} sm={4} md={3} lg={2} xl={2}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06, duration: 0.4, ease: 'easeOut' }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
      >
        <Card
          sx={{
            borderRadius: DesignSystem.radius.lg,
            border: `1px solid ${DesignSystem.colors.border}`,
            boxShadow: DesignSystem.shadows.sm,
            bgcolor: DesignSystem.colors.surface,
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
            '&:hover': {
              boxShadow: DesignSystem.shadows.lg,
              borderColor: alpha(item.color, 0.3),
            },
          }}
        >
          <Box sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: DesignSystem.radius.md,
                  background: `linear-gradient(135deg, ${alpha(item.color, 0.15)} 0%, ${alpha(item.color, 0.08)} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${alpha(item.color, 0.2)}`,
                }}
              >
                <Icon sx={{ color: item.color, fontSize: 20 }} />
              </Box>
              {item.trend && (
                <Chip
                  icon={item.trend > 0 ? <TrendingUp sx={{ fontSize: 14 }} /> : <TrendingDown sx={{ fontSize: 14 }} />}
                  label={`${Math.abs(item.trend)}%`}
                  size="small"
                  sx={{
                    fontFamily: DesignSystem.fonts.body,
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    height: 22,
                    bgcolor: item.trend > 0 ? alpha(DesignSystem.colors.success, 0.1) : alpha(DesignSystem.colors.error, 0.1),
                    color: item.trend > 0 ? DesignSystem.colors.success : DesignSystem.colors.error,
                  }}
                />
              )}
            </Box>
            <Typography sx={{ fontFamily: DesignSystem.fonts.body, fontSize: '0.72rem', fontWeight: 600, color: DesignSystem.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
              {item.label}
            </Typography>
            <Typography sx={{ fontFamily: DesignSystem.fonts.display, fontSize: '1.6rem', fontWeight: 800, color: DesignSystem.colors.text, lineHeight: 1 }}>
              {item.value}
            </Typography>
          </Box>
        </Card>
      </motion.div>
    </Grid>
  );
};

// Order Details Modal
const OrderDetailsModal = ({ open, onClose, order, onPrintNote, onDownloadNote, onStatusChange }) => {
  if (!order) return null;
  
  const statusCfg = getStatusConfig(order.status);
  const paymentCfg = getPaymentConfig(order.paymentMethod);
  const PaymentIcon = paymentCfg.icon;
  const StatusIcon = statusCfg.icon;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth
      PaperProps={{
        sx: {
          borderRadius: DesignSystem.radius.xl,
          overflow: 'hidden',
          boxShadow: DesignSystem.shadows.xl,
        },
      }}
    >
      {/* Header */}
      <Box sx={{
        background: `linear-gradient(135deg, ${DesignSystem.colors.primary} 0%, ${DesignSystem.colors.primaryLight} 100%)`,
        px: 4,
        py: 3,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
      }}>
        <Box>
          <Breadcrumbs sx={{ '& .MuiBreadcrumbs-separator': { color: 'rgba(255,255,255,0.4)' }, mb: 0.5 }}>
            <Link href="/admin/orders" sx={{ fontFamily: DesignSystem.fonts.body, fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
              Orders
            </Link>
            <Typography sx={{ fontFamily: DesignSystem.fonts.body, fontSize: '0.7rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
              {order.orderNumber}
            </Typography>
          </Breadcrumbs>
          <Typography sx={{ fontFamily: DesignSystem.fonts.display, fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Order #{order.orderNumber}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button size="small" startIcon={<Print />} onClick={() => onPrintNote(order)}
            sx={{ fontFamily: DesignSystem.fonts.body, fontWeight: 600, fontSize: '0.75rem', bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
            Print Note
          </Button>
          <Button size="small" startIcon={<Download />} onClick={() => onDownloadNote(order)}
            sx={{ fontFamily: DesignSystem.fonts.body, fontWeight: 600, fontSize: '0.75rem', bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
            Download
          </Button>
          <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
            <Cancel />
          </IconButton>
        </Box>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {/* Status Bar */}
        <Box sx={{ px: 4, py: 2, bgcolor: statusCfg.bgColor, borderBottom: `1px solid ${statusCfg.borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <StatusIcon sx={{ color: statusCfg.color, fontSize: 20 }} />
            <Typography sx={{ fontFamily: DesignSystem.fonts.body, fontWeight: 700, color: statusCfg.color, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {statusCfg.label}
            </Typography>
          </Box>
          <Button size="small" variant="outlined" onClick={() => onStatusChange(order)}
            sx={{ fontFamily: DesignSystem.fonts.body, fontWeight: 600, fontSize: '0.7rem', borderColor: statusCfg.color, color: statusCfg.color, borderRadius: '6px', '&:hover': { bgcolor: alpha(statusCfg.color, 0.08), borderColor: statusCfg.color } }}>
            Update Status
          </Button>
        </Box>

        <Box sx={{ p: 4 }}>
          <Grid container spacing={3}>
            {/* Customer Info */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: DesignSystem.radius.lg, border: `1px solid ${DesignSystem.colors.border}`, bgcolor: DesignSystem.colors.bg, height: '100%' }}>
                <Typography sx={{ fontFamily: DesignSystem.fonts.display, fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 2.5, color: DesignSystem.colors.text }}>
                  👤 Customer
                </Typography>
                <Stack spacing={2}>
                  {[
                    { icon: Person, label: order.customer.fullName, bold: true },
                    { icon: Email, label: order.customer.email },
                    { icon: Phone, label: order.customer.phone },
                    { icon: LocationOn, label: order.customer.address },
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <item.icon sx={{ color: DesignSystem.colors.textMuted, fontSize: 17, mt: 0.2, flexShrink: 0 }} />
                      <Typography sx={{ fontFamily: DesignSystem.fonts.body, fontSize: '0.85rem', color: DesignSystem.colors.text, fontWeight: item.bold ? 600 : 400 }}>
                        {item.label}
                      </Typography>
                    </Box>
                  ))}
                  {order.customer.notes && (
                    <Box sx={{ mt: 1, p: 2, bgcolor: alpha(DesignSystem.colors.warning, 0.08), borderRadius: '8px', border: `1px solid ${alpha(DesignSystem.colors.warning, 0.2)}` }}>
                      <Typography sx={{ fontFamily: DesignSystem.fonts.body, fontSize: '0.8rem', fontWeight: 600, color: DesignSystem.colors.warning }}>
                        📝 {order.customer.notes}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Paper>
            </Grid>

            {/* Order Info */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: DesignSystem.radius.lg, border: `1px solid ${DesignSystem.colors.border}`, bgcolor: DesignSystem.colors.bg, height: '100%' }}>
                <Typography sx={{ fontFamily: DesignSystem.fonts.display, fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 2.5, color: DesignSystem.colors.text }}>
                  📦 Order Details
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontFamily: DesignSystem.fonts.body, fontSize: '0.82rem', color: DesignSystem.colors.textSecondary }}>Date</Typography>
                    <Typography sx={{ fontFamily: DesignSystem.fonts.body, fontSize: '0.82rem', fontWeight: 500 }}>{formatDateTime(order.createdAt)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontFamily: DesignSystem.fonts.body, fontSize: '0.82rem', color: DesignSystem.colors.textSecondary }}>Payment</Typography>
                    <Chip icon={<PaymentIcon sx={{ fontSize: 14 }} />} label={paymentCfg.label} size="small"
                      sx={{ fontFamily: DesignSystem.fonts.body, fontWeight: 600, fontSize: '0.7rem', bgcolor: alpha(paymentCfg.color, 0.08), color: paymentCfg.color }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontFamily: DesignSystem.fonts.body, fontSize: '0.82rem', color: DesignSystem.colors.textSecondary }}>Items</Typography>
                    <Typography sx={{ fontFamily: DesignSystem.fonts.body, fontSize: '0.82rem', fontWeight: 600 }}>{order.items.length} items</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontFamily: DesignSystem.fonts.body, fontSize: '0.82rem', color: DesignSystem.colors.textSecondary }}>Shipping</Typography>
                    <Typography sx={{ fontFamily: DesignSystem.fonts.body, fontSize: '0.82rem', fontWeight: 600, color: order.shippingCost === 0 ? DesignSystem.colors.success : DesignSystem.colors.text }}>
                      {order.shippingCost === 0 ? 'FREE' : formatCurrency(order.shippingCost)}
                    </Typography>
                  </Box>
                  <Divider sx={{ borderColor: DesignSystem.colors.border }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontFamily: DesignSystem.fonts.display, fontWeight: 800, fontSize: '1.1rem', textTransform: 'uppercase' }}>Total</Typography>
                    <Typography sx={{ fontFamily: DesignSystem.fonts.display, fontWeight: 900, fontSize: '1.3rem', color: DesignSystem.colors.secondary }}>
                      {formatCurrency(order.finalAmount)}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            {/* Items Table */}
            <Grid item xs={12}>
              <Paper sx={{ borderRadius: DesignSystem.radius.lg, border: `1px solid ${DesignSystem.colors.border}`, overflow: 'hidden' }}>
                <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${DesignSystem.colors.border}`, bgcolor: DesignSystem.colors.bg }}>
                  <Typography sx={{ fontFamily: DesignSystem.fonts.display, fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: DesignSystem.colors.text }}>
                    🛍️ Order Items ({order.items.length})
                  </Typography>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: DesignSystem.colors.primary }}>
                        {['Item', 'Size', 'Qty', 'Unit Price', 'Discount', 'Total'].map(h => (
                          <TableCell key={h} sx={{ fontFamily: DesignSystem.fonts.display, fontWeight: 700, fontSize: '0.7rem', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.06em', py: 1.5 }}>
                            {h}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.items.map((item, i) => (
                        <TableRow key={i} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {item.image && <Avatar src={item.image} variant="rounded" sx={{ width: 40, height: 40, borderRadius: '8px', border: `1px solid ${DesignSystem.colors.border}` }} />}
                              <Typography sx={{ fontFamily: DesignSystem.fonts.body, fontWeight: 600, fontSize: '0.85rem' }}>{item.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell><Chip label={item.size} size="small" sx={{ fontFamily: DesignSystem.fonts.body, fontWeight: 600, fontSize: '0.7rem', bgcolor: DesignSystem.colors.bg, border: `1px solid ${DesignSystem.colors.border}` }} /></TableCell>
                          <TableCell><Typography sx={{ fontFamily: DesignSystem.fonts.body, fontWeight: 600, textAlign: 'center' }}>{item.quantity}</Typography></TableCell>
                          <TableCell><Typography sx={{ fontFamily: DesignSystem.fonts.mono, fontSize: '0.8rem', textAlign: 'right' }}>{item.discountedPrice.toFixed(2)} TND</Typography></TableCell>
                          <TableCell>{item.discount > 0 ? <Chip label={`-${item.discount}%`} size="small" sx={{ fontFamily: DesignSystem.fonts.body, fontWeight: 700, fontSize: '0.65rem', bgcolor: alpha(DesignSystem.colors.success, 0.1), color: DesignSystem.colors.success }} /> : <Typography sx={{ fontFamily: DesignSystem.fonts.body, fontSize: '0.75rem', color: DesignSystem.colors.textMuted }}>-</Typography>}</TableCell>
                          <TableCell><Typography sx={{ fontFamily: DesignSystem.fonts.body, fontWeight: 700, fontSize: '0.85rem', textAlign: 'right' }}>{(item.discountedPrice * item.quantity).toFixed(2)} TND</Typography></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// ==================== MAIN COMPONENT ====================
const AdminOrders = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0, revenue: 0, avgOrder: 0 });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, order: null });
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Fetch Orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 500, sortBy, sortOrder };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await orderService.getOrders(params);
      if (response.data.success) {
        const data = response.data.data || [];
        setOrders(data);
        setFilteredOrders(data);
        
        setStats({
          total: data.length,
          pending: data.filter(o => o.status === 'pending').length,
          processing: data.filter(o => o.status === 'processing').length,
          shipped: data.filter(o => o.status === 'shipped').length,
          delivered: data.filter(o => o.status === 'delivered').length,
          cancelled: data.filter(o => o.status === 'cancelled').length,
          revenue: data.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.finalAmount || 0), 0),
          avgOrder: data.length > 0 ? data.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.finalAmount || 0), 0) / data.filter(o => o.status !== 'cancelled').length : 0,
        });
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      showSnackbar('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, sortBy, sortOrder, searchQuery]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Handlers
  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const handleViewDetails = useCallback((order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  }, []);

  const handleStatusChange = useCallback(async () => {
    if (!newStatus || !selectedOrder) return;
    try {
      await orderService.updateOrderStatus(selectedOrder._id, newStatus);
      showSnackbar(`Order status updated to ${newStatus}`, 'success');
      setStatusDialogOpen(false);
      setSelectedOrder(null);
      setNewStatus('');
      fetchOrders();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to update status', 'error');
    }
  }, [newStatus, selectedOrder, fetchOrders]);

  const handleDeleteOrder = useCallback(async () => {
    if (!deleteConfirm.order) return;
    try {
      await orderService.deleteOrder(deleteConfirm.order._id);
      showSnackbar('Order deleted successfully', 'success');
      setDeleteConfirm({ open: false, order: null });
      fetchOrders();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to delete order', 'error');
    }
  }, [deleteConfirm.order, fetchOrders]);

  const handlePrintDeliveryNote = useCallback((order) => {
    const html = generateDeliveryNoteHTML(order);
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
    showSnackbar('Delivery note opened for printing', 'success');
  }, []);

  const handleDownloadDeliveryNote = useCallback((order) => {
    const html = generateDeliveryNoteHTML(order);
    const blob = new Blob([html], { type: 'text/html;charset=UTF-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bon_Livraison_${order.orderNumber}.html`;
    link.click();
    URL.revokeObjectURL(url);
    showSnackbar('Delivery note downloaded!', 'success');
  }, []);

  const handleExportCSV = useCallback(() => {
    setIsExporting(true);
    try {
      const headers = ['Order Number', 'Date', 'Customer', 'Email', 'Phone', 'Address', 'Items', 'Subtotal', 'Discount', 'Shipping', 'Total', 'Status', 'Payment', 'Notes'];
      const rows = filteredOrders.map(o => [
        o.orderNumber,
        formatDate(o.createdAt),
        o.customer.fullName,
        o.customer.email,
        o.customer.phone,
        `"${o.customer.address}"`,
        o.items.length,
        o.totalAmount,
        o.discountAmount || 0,
        o.shippingCost || 0,
        o.finalAmount,
        o.status,
        o.paymentMethod,
        `"${o.customer.notes || ''}"`,
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=UTF-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Orders_Export_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      showSnackbar('Orders exported successfully!', 'success');
    } catch (err) {
      showSnackbar('Export failed', 'error');
    } finally {
      setIsExporting(false);
    }
  }, [filteredOrders]);

  // Pagination
  const handleChangePage = (e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };

  // Stats config
  const statsCards = useMemo(() => [
    { label: 'Total Orders', value: stats.total, icon: Receipt, color: DesignSystem.colors.primary, trend: 12 },
    { label: 'Pending', value: stats.pending, icon: HourglassEmpty, color: DesignSystem.colors.warning },
    { label: 'Processing', value: stats.processing, icon: Inventory, color: DesignSystem.colors.purple },
    { label: 'Shipped', value: stats.shipped, icon: LocalShipping, color: DesignSystem.colors.info },
    { label: 'Delivered', value: stats.delivered, icon: CheckCircle, color: DesignSystem.colors.success },
    { label: 'Cancelled', value: stats.cancelled, icon: Cancel, color: DesignSystem.colors.error },
    { label: 'Revenue', value: formatCurrency(stats.revenue), icon: AttachMoney, color: DesignSystem.colors.secondary, isRevenue: true },
    { label: 'Avg Order', value: formatCurrency(stats.avgOrder), icon: Assessment, color: DesignSystem.colors.accent, isRevenue: true },
  ], [stats]);

  const paginatedOrders = useMemo(() => 
    filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredOrders, page, rowsPerPage]
  );

  return (
    <Box sx={{ bgcolor: DesignSystem.colors.bg, minHeight: '100vh' }}>
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1600, mx: 'auto' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Breadcrumbs sx={{ mb: 1 }}>
                <Link href="/admin" sx={{ fontFamily: DesignSystem.fonts.body, fontSize: '0.75rem', color: DesignSystem.colors.textSecondary, textDecoration: 'none', fontWeight: 500 }}>
                  Dashboard
                </Link>
                <Typography sx={{ fontFamily: DesignSystem.fonts.body, fontSize: '0.75rem', color: DesignSystem.colors.text, fontWeight: 600 }}>
                  Orders
                </Typography>
              </Breadcrumbs>
              <Typography sx={{ fontFamily: DesignSystem.fonts.display, fontSize: { xs: '1.8rem', md: '2.4rem' }, fontWeight: 900, color: DesignSystem.colors.text, textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1 }}>
                Order Management
              </Typography>
              <Typography sx={{ fontFamily: DesignSystem.fonts.body, color: DesignSystem.colors.textSecondary, fontSize: '0.9rem', mt: 0.5 }}>
                Track, manage, and process customer orders
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh"><IconButton onClick={fetchOrders} sx={{ border: `1px solid ${DesignSystem.colors.border}`, borderRadius: '8px' }}><Refresh /></IconButton></Tooltip>
              <Button variant="outlined" startIcon={<PictureAsPdf />} disabled={isExporting} onClick={handleExportCSV}
                sx={{ fontFamily: DesignSystem.fonts.body, fontWeight: 600, fontSize: '0.8rem', borderColor: DesignSystem.colors.border, color: DesignSystem.colors.text, borderRadius: '8px', textTransform: 'none', '&:hover': { borderColor: DesignSystem.colors.primary, bgcolor: alpha(DesignSystem.colors.primary, 0.03) } }}>
                Export CSV
              </Button>
            </Stack>
          </Box>
        </motion.div>

        {/* Stats Grid */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {statsCards.map((item, i) => (
            <StatCard key={i} item={item} index={i} />
          ))}
        </Grid>

        {/* Filters Bar */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: DesignSystem.radius.lg, border: `1px solid ${DesignSystem.colors.border}`, boxShadow: DesignSystem.shadows.sm, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search orders, customers, emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ flex: 2, minWidth: 220, '& .MuiOutlinedInput-root': { fontFamily: DesignSystem.fonts.body, borderRadius: '8px', bgcolor: DesignSystem.colors.surface } }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search sx={{ color: DesignSystem.colors.textMuted }} /></InputAdornment>,
              endAdornment: searchQuery ? <InputAdornment position="end"><IconButton size="small" onClick={() => setSearchQuery('')}><Clear sx={{ fontSize: 16 }} /></IconButton></InputAdornment> : null,
            }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel sx={{ fontFamily: DesignSystem.fonts.body }}>Status</InputLabel>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status"
              sx={{ fontFamily: DesignSystem.fonts.body, borderRadius: '8px', bgcolor: DesignSystem.colors.surface, '& .MuiSelect-select': { display: 'flex', alignItems: 'center', gap: 1 } }}>
              <MenuItem value="all">All Statuses</MenuItem>
              {ORDER_STATUSES.map(s => {
                const Icon = s.icon;
                return <MenuItem key={s.value} value={s.value} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontFamily: DesignSystem.fonts.body }}>
                  <Icon sx={{ fontSize: 16, color: s.color }} /> {s.label}
                </MenuItem>;
              })}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel sx={{ fontFamily: DesignSystem.fonts.body }}>Sort</InputLabel>
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} label="Sort"
              sx={{ fontFamily: DesignSystem.fonts.body, borderRadius: '8px', bgcolor: DesignSystem.colors.surface }}>
              {SORT_OPTIONS.map(o => <MenuItem key={o.value} value={o.value} sx={{ fontFamily: DesignSystem.fonts.body }}>{o.label}</MenuItem>)}
            </Select>
          </FormControl>
          <Tooltip title={sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}>
            <IconButton onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              sx={{ border: `1px solid ${DesignSystem.colors.border}`, borderRadius: '8px', color: DesignSystem.colors.text }}>
              {sortOrder === 'desc' ? <TrendingDown /> : <TrendingUp />}
            </IconButton>
          </Tooltip>
        </Paper>

        {/* Orders Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Paper sx={{ borderRadius: DesignSystem.radius.lg, overflow: 'hidden', border: `1px solid ${DesignSystem.colors.border}`, boxShadow: DesignSystem.shadows.sm }}>
            {loading && <LinearProgress sx={{ bgcolor: DesignSystem.colors.bg, '& .MuiLinearProgress-bar': { bgcolor: DesignSystem.colors.primary } }} />}
            <TableContainer sx={{ maxHeight: 'calc(100vh - 480px)' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: DesignSystem.colors.primary }}>
                    {['Order #', 'Date', 'Customer', 'Contact', 'Items', 'Total', 'Payment', 'Status', 'Actions'].map(h => (
                      <TableCell key={h} sx={{ fontFamily: DesignSystem.fonts.display, fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#FFFFFF', py: 1.8, whiteSpace: 'nowrap' }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedOrders.map((order) => {
                    const statusCfg = getStatusConfig(order.status);
                    const paymentCfg = getPaymentConfig(order.paymentMethod);
                    const StatusIcon = statusCfg.icon;
                    const PaymentIcon = paymentCfg.icon;
                    
                    return (
                      <TableRow
                        key={order._id}
                        hover
                        sx={{ cursor: 'pointer', '&:hover': { bgcolor: alpha(DesignSystem.colors.primary, 0.02) }, transition: 'background 0.15s' }}
                      >
                        <TableCell onClick={() => handleViewDetails(order)}>
                          <Typography sx={{ fontFamily: DesignSystem.fonts.mono, fontWeight: 700, fontSize: '0.8rem', color: DesignSystem.colors.primary }}>
                            #{order.orderNumber}
                          </Typography>
                        </TableCell>
                        <TableCell onClick={() => handleViewDetails(order)}>
                          <Typography sx={{ fontFamily: DesignSystem.fonts.body, fontSize: '0.75rem', color: DesignSystem.colors.textSecondary, whiteSpace: 'nowrap' }}>
                            {formatDate(order.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell onClick={() => handleViewDetails(order)}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(DesignSystem.colors.primary, 0.1), color: DesignSystem.colors.primary, fontFamily: DesignSystem.fonts.display, fontWeight: 700, fontSize: '0.75rem' }}>
                              {order.customer.fullName.charAt(0)}
                            </Avatar>
                            <Typography sx={{ fontFamily: DesignSystem.fonts.body, fontWeight: 600, fontSize: '0.82rem', color: DesignSystem.colors.text }}>
                              {order.customer.fullName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell onClick={() => handleViewDetails(order)}>
                          <Stack spacing={0.3}>
                            <Typography sx={{ fontFamily: DesignSystem.fonts.body, fontSize: '0.7rem', color: DesignSystem.colors.textSecondary }}>
                              {order.customer.phone}
                            </Typography>
                            <Typography sx={{ fontFamily: DesignSystem.fonts.body, fontSize: '0.7rem', color: DesignSystem.colors.textMuted }}>
                              {order.customer.email}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell onClick={() => handleViewDetails(order)}>
                          <Chip label={`${order.items.length}`} size="small"
                            sx={{ fontFamily: DesignSystem.fonts.body, fontWeight: 600, fontSize: '0.7rem', bgcolor: DesignSystem.colors.bg, border: `1px solid ${DesignSystem.colors.border}` }} />
                        </TableCell>
                        <TableCell onClick={() => handleViewDetails(order)}>
                          <Typography sx={{ fontFamily: DesignSystem.fonts.body, fontWeight: 700, fontSize: '0.85rem', color: DesignSystem.colors.secondary }}>
                            {formatCurrency(order.finalAmount)}
                          </Typography>
                        </TableCell>
                        <TableCell onClick={() => handleViewDetails(order)}>
                          <Chip icon={<PaymentIcon sx={{ fontSize: 13 }} />} label={paymentCfg.label} size="small"
                            sx={{ fontFamily: DesignSystem.fonts.body, fontWeight: 500, fontSize: '0.65rem', bgcolor: alpha(paymentCfg.color, 0.06), color: paymentCfg.color, border: `1px solid ${alpha(paymentCfg.color, 0.2)}` }} />
                        </TableCell>
                        <TableCell>
                          <Chip icon={<StatusIcon sx={{ fontSize: 14, color: statusCfg.color }} />} label={statusCfg.label} size="small"
                            sx={{ fontFamily: DesignSystem.fonts.body, fontWeight: 700, fontSize: '0.7rem', bgcolor: statusCfg.bgColor, color: statusCfg.color, border: `1px solid ${statusCfg.borderColor}`, borderRadius: '20px' }} />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.3}>
                            <Tooltip title="View Details"><IconButton size="small" onClick={() => handleViewDetails(order)}
                              sx={{ color: DesignSystem.colors.primary, '&:hover': { bgcolor: alpha(DesignSystem.colors.primary, 0.08) } }}><Visibility fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="Delivery Note"><IconButton size="small" onClick={(e) => { e.stopPropagation(); handlePrintDeliveryNote(order); }}
                              sx={{ color: DesignSystem.colors.info, '&:hover': { bgcolor: alpha(DesignSystem.colors.info, 0.08) } }}><Receipt fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="Update Status"><IconButton size="small" onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setNewStatus(order.status); setStatusDialogOpen(true); }}
                              sx={{ color: DesignSystem.colors.warning, '&:hover': { bgcolor: alpha(DesignSystem.colors.warning, 0.08) } }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="Delete"><IconButton size="small" onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ open: true, order }); }}
                              sx={{ color: DesignSystem.colors.error, '&:hover': { bgcolor: alpha(DesignSystem.colors.error, 0.08) } }}><Delete fontSize="small" /></IconButton></Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!loading && filteredOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 10 }}>
                        <Receipt sx={{ fontSize: 56, color: DesignSystem.colors.border, mb: 2 }} />
                        <Typography sx={{ fontFamily: DesignSystem.fonts.body, color: DesignSystem.colors.textMuted, fontSize: '1.1rem', mb: 1 }}>
                          No Orders Found
                        </Typography>
                        <Typography sx={{ fontFamily: DesignSystem.fonts.body, color: DesignSystem.colors.textMuted, fontSize: '0.85rem' }}>
                          {statusFilter !== 'all' ? 'Try changing the status filter' : searchQuery ? 'Try adjusting your search' : 'New orders will appear here'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredOrders.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                fontFamily: DesignSystem.fonts.body,
                borderTop: `1px solid ${DesignSystem.colors.border}`,
                '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { fontFamily: DesignSystem.fonts.body, fontSize: '0.8rem' },
              }}
            />
          </Paper>
        </motion.div>
      </Box>

      {/* Order Details Modal */}
      <OrderDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        order={selectedOrder}
        onPrintNote={handlePrintDeliveryNote}
        onDownloadNote={handleDownloadDeliveryNote}
        onStatusChange={(order) => { setSelectedOrder(order); setNewStatus(order.status); setStatusDialogOpen(true); }}
      />

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: DesignSystem.radius.xl, overflow: 'hidden', boxShadow: DesignSystem.shadows.xl } }}>
        <Box sx={{ px: 4, py: 3, bgcolor: DesignSystem.colors.primary }}>
          <Typography sx={{ fontFamily: DesignSystem.fonts.display, fontWeight: 700, fontSize: '1.2rem', color: '#FFFFFF', textTransform: 'uppercase' }}>
            Update Order Status
          </Typography>
        </Box>
        <DialogContent sx={{ p: 4 }}>
          <Typography sx={{ fontFamily: DesignSystem.fonts.body, color: DesignSystem.colors.textSecondary, mb: 3 }}>
            Select new status for order <strong>{selectedOrder?.orderNumber}</strong>
          </Typography>
          <FormControl fullWidth>
            <InputLabel sx={{ fontFamily: DesignSystem.fonts.body }}>Status</InputLabel>
            <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} label="Status"
              sx={{ fontFamily: DesignSystem.fonts.body, borderRadius: '10px' }}>
              {ORDER_STATUSES.map(s => {
                const Icon = s.icon;
                return <MenuItem key={s.value} value={s.value} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
                  <Icon sx={{ color: s.color, fontSize: 20 }} />
                  <Box>
                    <Typography sx={{ fontFamily: DesignSystem.fonts.body, fontWeight: 600, fontSize: '0.9rem' }}>{s.label}</Typography>
                    <Typography sx={{ fontFamily: DesignSystem.fonts.body, fontSize: '0.7rem', color: DesignSystem.colors.textMuted }}>Order will be marked as {s.label.toLowerCase()}</Typography>
                  </Box>
                </MenuItem>;
              })}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1, borderTop: `1px solid ${DesignSystem.colors.border}` }}>
          <Button onClick={() => setStatusDialogOpen(false)} sx={{ fontFamily: DesignSystem.fonts.body, color: DesignSystem.colors.textSecondary }}>Cancel</Button>
          <Button onClick={handleStatusChange} variant="contained" startIcon={<CheckCircle />}
            sx={{ fontFamily: DesignSystem.fonts.body, fontWeight: 700, bgcolor: DesignSystem.colors.primary, borderRadius: '8px', '&:hover': { bgcolor: DesignSystem.colors.primaryLight } }}>
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, order: null })}
        PaperProps={{ sx: { borderRadius: DesignSystem.radius.xl, overflow: 'hidden' } }}>
        <Box sx={{ px: 4, py: 3, bgcolor: DesignSystem.colors.error }}>
          <Typography sx={{ fontFamily: DesignSystem.fonts.display, fontWeight: 700, fontSize: '1.1rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Delete /> Delete Order
          </Typography>
        </Box>
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography sx={{ fontFamily: DesignSystem.fonts.body, fontSize: '1rem', mb: 1 }}>
            Are you sure you want to delete order <strong>#{deleteConfirm.order?.orderNumber}</strong>?
          </Typography>
          <Typography sx={{ fontFamily: DesignSystem.fonts.body, color: DesignSystem.colors.error, fontSize: '0.85rem', fontWeight: 600 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1, justifyContent: 'center', borderTop: `1px solid ${DesignSystem.colors.border}` }}>
          <Button onClick={() => setDeleteConfirm({ open: false, order: null })} variant="outlined"
            sx={{ fontFamily: DesignSystem.fonts.body, borderRadius: '8px', borderColor: DesignSystem.colors.border }}>Cancel</Button>
          <Button onClick={handleDeleteOrder} variant="contained" color="error" startIcon={<Delete />}
            sx={{ fontFamily: DesignSystem.fonts.body, fontWeight: 700, borderRadius: '8px' }}>Delete Order</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar(p => ({ ...p, open: false }))} severity={snackbar.severity} variant="filled"
          sx={{ fontFamily: DesignSystem.fonts.body, borderRadius: '10px', fontWeight: 600, boxShadow: DesignSystem.shadows.lg }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Fix missing import
const EditIcon = ({ fontSize }) => <svg width={fontSize === 'small' ? 18 : 24} height={fontSize === 'small' ? 18 : 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;

export default AdminOrders;