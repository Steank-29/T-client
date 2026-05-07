import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  LinearProgress,
  Card,
  CardContent,
  Rating,
  alpha,
  FormControlLabel,
  Switch,
  Badge,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  PictureAsPdf,
  TableChart,
  Save,
  Cancel,
  CloudUpload,
  Close,
  CheckCircle,
  Warning,
  Refresh,
  LocalOffer,
  Discount,
  Percent,
  Star,
  CalendarToday,
  Timer,
  Inventory,
  LocationOn,
  AddCircle,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { offerService, createOfferFormData, updateOfferStockHelper } from '../services/api';

// Categories for offers
const offerCategories = [
  'Summer Sale',
  'Winter Sale',
  'Offer Tawakkul',
  'New Arrival',
  'Eid Special',
  'Limited Edition',
];

// Sizes data
const sizesData = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Initial form state
const initialFormState = {
  name: '',
  description: '',
  mainPrice: '',
  discount: '',
  review: 0,
  mainImage: null,
  images: [],
  stockBySize: [], // New: array of {size, quantity, location}
  category: '',
  startDate: '',
  endDate: '',
  isActive: true,
  isFeatured: false,
  promoCode: '',
  maxUsage: '',
  lowStockThreshold: 5,
};

// Validation messages
const validationMessages = {
  name: 'Offer name is required',
  description: 'Offer description is required (min 10 characters)',
  mainPrice: 'Valid original price is required',
  discount: 'Valid discount percentage is required',
  category: 'Category is required',
  mainImage: 'Main image is required',
  startDate: 'Start date is required',
  endDate: 'End date is required',
  stockBySize: 'At least one size with stock quantity is required',
};

const AdminOffers = () => {
  // State management
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [inStockFilter, setInStockFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [stats, setStats] = useState({
    totalOffers: 0,
    activeOffers: 0,
    totalDiscount: 0,
    featuredOffers: 0,
    totalStock: 0,
    lowStockOffers: 0,
  });
  const [stockManagementTab, setStockManagementTab] = useState(0);
  const [selectedOfferForStock, setSelectedOfferForStock] = useState(null);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);

  // Fetch offers on mount
  useEffect(() => {
    fetchOffers();
    fetchStats();
  }, []);

  // Filter offers when filters change
  useEffect(() => {
    filterOffers();
  }, [offers, searchQuery, categoryFilter, statusFilter, sizeFilter, inStockFilter]);

  // Fetch offers from API
  const fetchOffers = async () => {
    setTableLoading(true);
    try {
      const params = {
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
      
      // Add stock filters
      if (inStockFilter === 'true') params.inStock = 'true';
      if (inStockFilter === 'false') params.inStock = 'false';
      if (sizeFilter !== 'all') params.size = sizeFilter;
      
      const response = await offerService.getOffers(params);
      
      if (response.data.success) {
        const offersData = response.data.data.map((offer) => ({
          ...offer,
          id: offer._id,
          mainImage: offer.mainImage?.url || 'https://via.placeholder.com/150',
          images: offer.images?.map(img => img.url) || [],
        }));
        setOffers(offersData);
        setFilteredOffers(offersData);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
      showSnackbar('Failed to load offers', 'error');
    } finally {
      setTableLoading(false);
    }
  };

// Fetch stats from API
const fetchStats = async () => {
  try {
    const response = await offerService.getOfferStats();
    console.log('Offer Stats full response:', response); // Debug log
    console.log('Offer Stats data:', response.data); // Debug log
    
    if (response.data.success) {
      const data = response.data.data;
      console.log('Stats data structure:', data); // Debug log
      
      // Try multiple possible data structures
      setStats({
        totalOffers: data?.overall?.totalOffers || data?.totalOffers || offers.length || 0,
        activeOffers: data?.overall?.activeOffers || data?.activeOffers || offers.filter(o => o.isActive).length || 0,
        totalDiscount: (data?.overall?.averageDiscount || data?.averageDiscount || 0).toFixed(1),
        featuredOffers: data?.overall?.featuredOffers || data?.featuredOffers || offers.filter(o => o.isFeatured).length || 0,
        totalStock: data?.overall?.totalStockUnits || data?.totalStock || calculateTotalStock() || 0,
        lowStockOffers: data?.lowStockOffersCount || data?.lowStockOffers || 0,
      });
    } else {
      // If stats endpoint returns success: false, calculate from offers
      calculateStatsFromOffers();
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
    // Fallback: calculate stats from available offers
    calculateStatsFromOffers();
  }
};

// Helper function to calculate total stock from current offers
const calculateTotalStock = () => {
  return offers.reduce((total, offer) => {
    const offerStock = offer.stockBySize?.reduce((sum, stock) => sum + (stock.quantity || 0), 0) || 0;
    return total + offerStock;
  }, 0);
};

// Fallback: Calculate stats directly from offers array
const calculateStatsFromOffers = () => {
  const activeOffers = offers.filter(o => o.isActive && !isOfferExpired(o.endDate));
  const featuredOffers = offers.filter(o => o.isFeatured);
  const totalDiscount = offers.length > 0 
    ? offers.reduce((sum, o) => sum + (o.discount || 0), 0) / offers.length 
    : 0;
  const totalStock = calculateTotalStock();
  const lowStockOffers = offers.filter(o => {
    return o.stockBySize?.some(stock => {
      const available = stock.quantity - (stock.reserved || 0);
      return available <= (o.lowStockThreshold || 5) && available > 0;
    });
  });

  setStats({
    totalOffers: offers.length,
    activeOffers: activeOffers.length,
    totalDiscount: totalDiscount.toFixed(1),
    featuredOffers: featuredOffers.length,
    totalStock: totalStock,
    lowStockOffers: lowStockOffers.length,
  });
};

  // Filter offers
  const filterOffers = () => {
    let filtered = [...offers];

    if (searchQuery) {
      filtered = filtered.filter(
        (offer) =>
          offer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          offer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          offer.promoCode?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((offer) => offer.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter((offer) => offer.isActive);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter((offer) => !offer.isActive);
      } else if (statusFilter === 'featured') {
        filtered = filtered.filter((offer) => offer.isFeatured);
      }
    }

    setFilteredOffers(filtered);
  };

  // Handle stock by size changes
  const handleStockBySizeChange = (size, field, value) => {
    setFormData((prev) => {
      const existingIndex = prev.stockBySize.findIndex(item => item.size === size);
      let newStockBySize = [...prev.stockBySize];
      
      if (existingIndex >= 0) {
        newStockBySize[existingIndex] = {
          ...newStockBySize[existingIndex],
          [field]: field === 'quantity' ? parseInt(value) || 0 : value,
        };
      } else {
        newStockBySize.push({
          size,
          quantity: field === 'quantity' ? parseInt(value) || 0 : 0,
          location: field === 'location' ? value : '',
        });
      }
      
      // Remove size if quantity is 0 and location is empty
      if (field === 'quantity' && (parseInt(value) === 0 || value === '')) {
        newStockBySize = newStockBySize.filter(item => item.size !== size);
      }
      
      return { ...prev, stockBySize: newStockBySize };
    });
    
    if (errors.stockBySize) {
      setErrors((prev) => ({ ...prev, stockBySize: '' }));
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = validationMessages.name;
    } else if (formData.name.length < 3) {
      newErrors.name = 'Offer name must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = validationMessages.description;
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.mainPrice || isNaN(formData.mainPrice) || parseFloat(formData.mainPrice) <= 0) {
      newErrors.mainPrice = validationMessages.mainPrice;
    }

    if (!formData.discount || isNaN(formData.discount) || formData.discount < 1 || formData.discount > 99) {
      newErrors.discount = 'Discount must be between 1% and 99%';
    }

    if (!formData.category) {
      newErrors.category = validationMessages.category;
    }

    if (!formData.startDate) {
      newErrors.startDate = validationMessages.startDate;
    }

    if (!formData.endDate) {
      newErrors.endDate = validationMessages.endDate;
    } else if (formData.startDate && formData.endDate && formData.endDate <= formData.startDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (dialogMode === 'add' && !formData.mainImage) {
      newErrors.mainImage = validationMessages.mainImage;
    }

    // Validate stock by size
    if (formData.stockBySize.length === 0) {
      newErrors.stockBySize = validationMessages.stockBySize;
    } else {
      const hasPositiveStock = formData.stockBySize.some(item => item.quantity > 0);
      if (!hasPositiveStock) {
        newErrors.stockBySize = 'At least one size must have positive stock quantity';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate discounted price
  const calculateDiscountedPrice = () => {
    if (formData.mainPrice && formData.discount) {
      const price = parseFloat(formData.mainPrice);
      const discount = parseFloat(formData.discount);
      return (price * (1 - discount / 100)).toFixed(2);
    }
    return '0.00';
  };

  // Generate promo code
  const generatePromoCode = () => {
    const prefix = formData.name
      ? formData.name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase()
      : 'OFFER';
    const discount = formData.discount || '00';
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}${discount}${random}`;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = e.target.type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Handle main image upload
  const handleMainImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, mainImage: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      if (errors.mainImage) {
        setErrors((prev) => ({ ...prev, mainImage: '' }));
      }
    }
  };

  // Handle multiple images upload
  const handleImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
    
    const newPreviews = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === files.length) {
          setImagePreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image from preview
  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Auto-generate promo code
  const handleGeneratePromoCode = () => {
    const code = generatePromoCode();
    setFormData((prev) => ({ ...prev, promoCode: code }));
  };

  // Handle form submission with API
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const offerData = {
        name: formData.name,
        description: formData.description,
        mainPrice: formData.mainPrice,
        discount: formData.discount,
        review: formData.review || 0,
        category: formData.category,
        stockBySize: formData.stockBySize,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        promoCode: formData.promoCode || undefined,
        maxUsage: formData.maxUsage || 0,
        lowStockThreshold: formData.lowStockThreshold,
      };

      // Create FormData with files
      const formDataToSend = createOfferFormData(
        offerData,
        formData.mainImage instanceof File ? formData.mainImage : null,
        formData.images.filter(img => img instanceof File)
      );

      if (dialogMode === 'add') {
        const response = await offerService.createOffer(formDataToSend);
        const newOffer = {
          ...response.data.data,
          id: response.data.data._id,
          mainImage: response.data.data.mainImage?.url || mainImagePreview,
          images: response.data.data.images?.map(img => img.url) || imagePreviews,
        };
        setOffers((prev) => [newOffer, ...prev]);
        showSnackbar('Offer created successfully!', 'success');
      } else {
        const response = await offerService.updateOffer(editId, formDataToSend);
        setOffers((prev) =>
          prev.map((o) => 
            o.id === editId 
              ? {
                  ...o,
                  ...response.data.data,
                  id: response.data.data._id,
                  mainImage: response.data.data.mainImage?.url || o.mainImage,
                  images: response.data.data.images?.map(img => img.url) || o.images,
                }
              : o
          )
        );
        showSnackbar('Offer updated successfully!', 'success');
      }

      handleCloseDialog();
      fetchStats();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error saving offer. Please try again.';
      showSnackbar(errorMessage, 'error');
      console.error('Offer save error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (offer) => {
    setDialogMode('edit');
    setEditId(offer.id);
    setFormData({
      name: offer.name,
      description: offer.description,
      mainPrice: offer.mainPrice?.toString() || '',
      discount: offer.discount?.toString() || '',
      review: offer.review || 0,
      mainImage: offer.mainImage,
      images: offer.images || [],
      stockBySize: offer.stockBySize || [],
      category: offer.category,
      startDate: offer.startDate ? new Date(offer.startDate).toISOString().split('T')[0] : '',
      endDate: offer.endDate ? new Date(offer.endDate).toISOString().split('T')[0] : '',
      isActive: offer.isActive,
      isFeatured: offer.isFeatured,
      promoCode: offer.promoCode || '',
      maxUsage: offer.maxUsage?.toString() || '',
      lowStockThreshold: offer.lowStockThreshold || 5,
    });
    setMainImagePreview(typeof offer.mainImage === 'string' ? offer.mainImage : null);
    setImagePreviews(Array.isArray(offer.images) ? offer.images.filter(img => typeof img === 'string') : []);
    setOpenDialog(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (id, name) => {
    setDeleteConfirm({ open: true, id, name });
  };

  // Handle delete with API
  const handleDelete = async () => {
    setLoading(true);
    try {
      await offerService.deleteOffer(deleteConfirm.id);
      setOffers((prev) => prev.filter((o) => o.id !== deleteConfirm.id));
      showSnackbar('Offer deleted successfully!', 'success');
      setDeleteConfirm({ open: false, id: null, name: '' });
      fetchStats();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error deleting offer.';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle offer status with API
  const handleToggleStatus = async (offerId) => {
    try {
      const response = await offerService.toggleOfferStatus(offerId);
      setOffers((prev) =>
        prev.map((o) =>
          o.id === offerId ? { ...o, ...response.data.data, isActive: response.data.data.isActive } : o
        )
      );
      showSnackbar(response.data.message || 'Offer status updated!', 'success');
      fetchStats();
    } catch (error) {
      showSnackbar('Error updating offer status.', 'error');
    }
  };

  // Handle toggle featured with API
  const handleToggleFeatured = async (offerId) => {
    try {
      const response = await offerService.toggleOfferFeatured(offerId);
      setOffers((prev) =>
        prev.map((o) =>
          o.id === offerId ? { ...o, ...response.data.data, isFeatured: response.data.data.isFeatured } : o
        )
      );
      showSnackbar(response.data.message || 'Featured status updated!', 'success');
      fetchStats();
    } catch (error) {
      showSnackbar('Error updating featured status.', 'error');
    }
  };

  // Handle stock management for an offer
  const handleOpenStockDialog = (offer) => {
    setSelectedOfferForStock(offer);
    setStockDialogOpen(true);
  };

  // Handle stock update
  const handleStockUpdate = async (size, quantity, operation) => {
    try {
      const response = await updateOfferStockHelper(selectedOfferForStock.id, size, quantity, operation);
      
      if (response.data.success) {
        // Update local offer data
        setOffers(prev => prev.map(o => 
          o.id === selectedOfferForStock.id
            ? {
                ...o,
                stockBySize: o.stockBySize.map(s => 
                  s.size === size
                    ? { ...s, quantity: operation === 'add' ? s.quantity + parseInt(quantity) : parseInt(quantity) }
                    : s
                ),
              }
            : o
        ));
        
        showSnackbar(`Stock updated for size ${size}`, 'success');
        fetchStats();
      }
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to update stock', 'error');
    }
  };

  // Dialog handlers
  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setFormData(initialFormState);
    setErrors({});
    setMainImagePreview(null);
    setImagePreviews([]);
    setEditId(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData(initialFormState);
    setErrors({});
    setMainImagePreview(null);
    setImagePreviews([]);
    setEditId(null);
    setLoading(false);
  };

  // Snackbar handler
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Export handlers
  const handleExportPDF = () => {
    window.print();
  };

  const handleExportExcel = async () => {
    try {
      const response = await offerService.exportOffers('csv');
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `offers-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showSnackbar('Offers exported successfully!', 'success');
    } catch (error) {
      console.error('Export error:', error);
      showSnackbar('Failed to export offers', 'error');
    }
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Check if offer is expired
  const isOfferExpired = (endDate) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  // Check if offer is upcoming
  const isOfferUpcoming = (startDate) => {
    if (!startDate) return false;
    return new Date(startDate) > new Date();
  };

  // Get offer status text
  const getOfferStatus = (offer) => {
    if (!offer.isActive) return 'Inactive';
    if (isOfferExpired(offer.endDate)) return 'Expired';
    if (isOfferUpcoming(offer.startDate)) return 'Upcoming';
    return 'Active';
  };

  // Get offer status color
  const getOfferStatusColor = (offer) => {
    if (!offer.isActive) return '#ff9800';
    if (isOfferExpired(offer.endDate)) return '#e70000';
    if (isOfferUpcoming(offer.startDate)) return '#2196f3';
    return '#4caf50';
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontFamily: 'Amaranth, sans-serif',
                fontWeight: 700,
                color: '#141010',
                mb: 0.5,
              }}
            >
              Offers Management
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Amaranth, sans-serif',
                color: '#666',
              }}
            >
              Create and manage special offers, discounts, and promotional deals with stock tracking
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Tooltip title="Refresh Data" arrow>
              <IconButton
                onClick={() => { fetchOffers(); fetchStats(); }}
                sx={{
                  border: '1px solid #141010',
                  borderRadius: '8px',
                  color: '#141010',
                  '&:hover': { bgcolor: alpha('#141010', 0.05) },
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>

            <Button
              variant="outlined"
              startIcon={<PictureAsPdf />}
              onClick={handleExportPDF}
              sx={{
                fontFamily: 'Amaranth, sans-serif',
                borderColor: '#141010',
                color: '#141010',
                '&:hover': { borderColor: '#141010', bgcolor: alpha('#141010', 0.05) },
              }}
            >
              Export PDF
            </Button>
            <Button
              variant="outlined"
              startIcon={<TableChart />}
              onClick={handleExportExcel}
              sx={{
                fontFamily: 'Amaranth, sans-serif',
                borderColor: '#141010',
                color: '#141010',
                '&:hover': { borderColor: '#141010', bgcolor: alpha('#141010', 0.05) },
              }}
            >
              Export Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenAddDialog}
              sx={{
                fontFamily: 'Amaranth, sans-serif',
                bgcolor: '#141010',
                color: '#f2f9f1',
                '&:hover': { bgcolor: '#2a2a2a', transform: 'translateY(-2px)', boxShadow: '0 12px 30px rgba(20, 16, 16, 0.35)' },
                transition: 'all 0.3s ease',
              }}
            >
              Add New Offer
            </Button>
          </Box>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'Total Offers', value: stats.totalOffers, icon: LocalOffer, color: '#141010' },
          { title: 'Active Offers', value: stats.activeOffers, icon: CheckCircle, color: '#4caf50' },
          { title: 'Avg Discount', value: `${stats.totalDiscount}%`, icon: Discount, color: '#e70000' },
          { title: 'Featured', value: stats.featuredOffers, icon: Star, color: '#ff9800' },
          { title: 'Total Stock Units', value: stats.totalStock, icon: Inventory, color: '#9c27b0' },
          { title: 'Low Stock Alerts', value: stats.lowStockOffers, icon: Warning, color: '#ff9800' },
        ].map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    borderRadius: '12px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' },
                  }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        bgcolor: alpha(stat.color, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComponent sx={{ color: stat.color, fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.85rem', color: '#666', mb: 0.5 }}>
                        {stat.title}
                      </Typography>
                      <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: '#141010' }}>
                        {stat.value}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>

      {/* Search and Filter Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '12px', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <TextField
          placeholder="Search offers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{ flex: 1, minWidth: 200, '& .MuiOutlinedInput-root': { fontFamily: 'Amaranth, sans-serif', borderRadius: '8px' } }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search sx={{ color: '#999' }} /></InputAdornment>,
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel sx={{ fontFamily: 'Amaranth, sans-serif' }}>Category</InputLabel>
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} label="Category" sx={{ fontFamily: 'Amaranth, sans-serif', borderRadius: '8px' }}>
            <MenuItem value="all" sx={{ fontFamily: 'Amaranth, sans-serif' }}>All Categories</MenuItem>
            {offerCategories.map((cat) => (
              <MenuItem key={cat} value={cat} sx={{ fontFamily: 'Amaranth, sans-serif' }}>{cat}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel sx={{ fontFamily: 'Amaranth, sans-serif' }}>Status</InputLabel>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status" sx={{ fontFamily: 'Amaranth, sans-serif', borderRadius: '8px' }}>
            <MenuItem value="all" sx={{ fontFamily: 'Amaranth, sans-serif' }}>All Status</MenuItem>
            <MenuItem value="active" sx={{ fontFamily: 'Amaranth, sans-serif' }}>Active</MenuItem>
            <MenuItem value="inactive" sx={{ fontFamily: 'Amaranth, sans-serif' }}>Inactive</MenuItem>
            <MenuItem value="featured" sx={{ fontFamily: 'Amaranth, sans-serif' }}>Featured</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel sx={{ fontFamily: 'Amaranth, sans-serif' }}>Size</InputLabel>
          <Select value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)} label="Size" sx={{ fontFamily: 'Amaranth, sans-serif', borderRadius: '8px' }}>
            <MenuItem value="all" sx={{ fontFamily: 'Amaranth, sans-serif' }}>All Sizes</MenuItem>
            {sizesData.map((size) => (
              <MenuItem key={size} value={size} sx={{ fontFamily: 'Amaranth, sans-serif' }}>{size}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel sx={{ fontFamily: 'Amaranth, sans-serif' }}>Stock Status</InputLabel>
          <Select value={inStockFilter} onChange={(e) => setInStockFilter(e.target.value)} label="Stock Status" sx={{ fontFamily: 'Amaranth, sans-serif', borderRadius: '8px' }}>
            <MenuItem value="all" sx={{ fontFamily: 'Amaranth, sans-serif' }}>All Offers</MenuItem>
            <MenuItem value="true" sx={{ fontFamily: 'Amaranth, sans-serif' }}>In Stock</MenuItem>
            <MenuItem value="false" sx={{ fontFamily: 'Amaranth, sans-serif' }}>Out of Stock</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* Offers Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <Paper sx={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          {tableLoading && <LinearProgress />}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f2f9f1' }}>
                  {['Offer', 'Category', 'Original Price', 'Discount', 'Final Price', 'Stock by Size', 'Total Stock', 'Duration', 'Status', 'Actions'].map((header) => (
                    <TableCell key={header} sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#141010' }} align={header === 'Actions' ? 'center' : 'left'}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOffers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((offer) => {
                  const status = getOfferStatus(offer);
                  const statusColor = getOfferStatusColor(offer);
                  
                  return (
                    <TableRow key={offer.id} sx={{ '&:hover': { bgcolor: alpha('#141010', 0.02) }, transition: 'background-color 0.2s ease', opacity: offer.isActive && !isOfferExpired(offer.endDate) ? 1 : 0.7 }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Badge badgeContent={offer.isFeatured ? '★' : 0} color="warning" invisible={!offer.isFeatured}>
                            <Avatar src={offer.mainImage} variant="rounded" sx={{ width: 48, height: 48, borderRadius: '8px' }} />
                          </Badge>
                          <Box>
                            <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 600, color: '#141010' }}>{offer.name}</Typography>
                            <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.8rem', color: '#666', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{offer.description}</Typography>
                            {offer.promoCode && (
                              <Chip label={`Code: ${offer.promoCode}`} size="small" sx={{ mt: 0.5, fontSize: '0.7rem', bgcolor: alpha('#141010', 0.05) }} />
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={offer.category} size="small" sx={{ fontFamily: 'Amaranth, sans-serif', bgcolor: alpha('#141010', 0.05), color: '#141010', fontWeight: 500 }} />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontFamily: 'Amaranth, sans-serif', color: '#999', textDecoration: 'line-through', fontSize: '0.9rem' }}>
                          {offer.mainPrice?.toFixed(2)} TND
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={`-${offer.discount}%`} size="small" icon={<Percent sx={{ fontSize: 14 }} />} sx={{ fontFamily: 'Amaranth, sans-serif', bgcolor: alpha('#e70000', 0.1), color: '#e70000', fontWeight: 700 }} />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#4caf50', fontSize: '1.1rem' }}>
                          {offer.discountedPrice?.toFixed(2)} TND
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {offer.stockBySize?.map((stock) => (
                            <Tooltip key={stock.size} title={`Location: ${stock.location || 'N/A'}`} arrow>
                              <Chip
                                label={`${stock.size}: ${stock.quantity - (stock.reserved || 0)}`}
                                size="small"
                                sx={{
                                  fontFamily: 'Amaranth, sans-serif',
                                  fontSize: '0.7rem',
                                  bgcolor: (stock.quantity - (stock.reserved || 0)) <= (offer.lowStockThreshold || 5) 
                                    ? alpha('#ff9800', 0.2) 
                                    : '#f2f9f1',
                                  color: '#141010',
                                  borderLeft: `3px solid ${(stock.quantity - (stock.reserved || 0)) <= 0 ? '#e70000' : '#4caf50'}`,
                                }}
                              />
                            </Tooltip>
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${offer.totalStock || 0} units`}
                          size="small"
                          sx={{
                            fontFamily: 'Amaranth, sans-serif',
                            bgcolor: (offer.totalStock || 0) === 0 ? alpha('#e70000', 0.1) : alpha('#4caf50', 0.1),
                            color: (offer.totalStock || 0) === 0 ? '#e70000' : '#4caf50',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarToday sx={{ fontSize: 14, color: '#999' }} />
                          <Box>
                            <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.75rem', color: '#666' }}>
                              {offer.startDate ? new Date(offer.startDate).toLocaleDateString() : 'N/A'}
                            </Typography>
                            <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.75rem', color: '#666' }}>
                              to {offer.endDate ? new Date(offer.endDate).toLocaleDateString() : 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Chip label={status} size="small" sx={{ fontFamily: 'Amaranth, sans-serif', bgcolor: alpha(statusColor, 0.1), color: statusColor, fontWeight: 600, fontSize: '0.75rem' }} />
                          {offer.isFeatured && (
                            <Chip label="Featured" size="small" sx={{ fontFamily: 'Amaranth, sans-serif', bgcolor: alpha('#ff9800', 0.1), color: '#ff9800', fontWeight: 600, fontSize: '0.7rem' }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                          <Tooltip title="Manage Stock" arrow>
                            <IconButton onClick={() => handleOpenStockDialog(offer)} sx={{ color: '#4caf50' }} size="small">
                              <Inventory fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={offer.isActive ? 'Deactivate' : 'Activate'} arrow>
                            <IconButton onClick={() => handleToggleStatus(offer.id)} sx={{ color: offer.isActive ? '#4caf50' : '#ff9800' }} size="small">
                              {offer.isActive ? <CheckCircle fontSize="small" /> : <Warning fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={offer.isFeatured ? 'Remove Featured' : 'Make Featured'} arrow>
                            <IconButton onClick={() => handleToggleFeatured(offer.id)} sx={{ color: offer.isFeatured ? '#ff9800' : '#999' }} size="small">
                              <Star fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Offer" arrow>
                            <IconButton onClick={() => handleEdit(offer)} sx={{ color: '#141010' }} size="small">
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Offer" arrow>
                            <IconButton onClick={() => handleDeleteConfirm(offer.id, offer.name)} sx={{ color: '#e70000' }} size="small">
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!tableLoading && filteredOffers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <LocalOffer sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                        <Typography sx={{ fontFamily: 'Amaranth, sans-serif', color: '#999', fontSize: '1.1rem' }}>No offers found</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredOffers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ fontFamily: 'Amaranth, sans-serif', '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { fontFamily: 'Amaranth, sans-serif' } }}
          />
        </Paper>
      </motion.div>

      {/* Add/Edit Offer Dialog with Stock by Size */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '16px', fontFamily: 'Amaranth, sans-serif' } }}>
        <DialogTitle sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#141010', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {dialogMode === 'add' ? 'Add New Offer' : 'Edit Offer'}
          <IconButton onClick={handleCloseDialog} size="small"><Close /></IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Tabs value={stockManagementTab} onChange={(e, v) => setStockManagementTab(v)} sx={{ mb: 2 }}>
            <Tab label="Basic Info" sx={{ fontFamily: 'Amaranth, sans-serif' }} />
            <Tab label="Stock Management" sx={{ fontFamily: 'Amaranth, sans-serif' }} />
            <Tab label="Images" sx={{ fontFamily: 'Amaranth, sans-serif' }} />
          </Tabs>

          {stockManagementTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField fullWidth label="Offer Name" name="name" value={formData.name} onChange={handleInputChange} error={!!errors.name} helperText={errors.name} placeholder="e.g., Summer Sports Bundle" required sx={textFieldStyle}
                  InputProps={{ startAdornment: <InputAdornment position="start"><LocalOffer sx={{ color: '#999' }} /></InputAdornment> }} />
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth label="Description" name="description" value={formData.description} onChange={handleInputChange} error={!!errors.description} helperText={errors.description} placeholder="Describe the offer (min 10 characters)" multiline rows={3} required sx={textFieldStyle} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Original Price (TND)" name="mainPrice" type="number" value={formData.mainPrice} onChange={handleInputChange} error={!!errors.mainPrice} helperText={errors.mainPrice} placeholder="0.00" required sx={textFieldStyle}
                  InputProps={{ startAdornment: <InputAdornment position="start">TND</InputAdornment> }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Discount (%)" name="discount" type="number" value={formData.discount} onChange={handleInputChange} error={!!errors.discount} helperText={errors.discount || 'Between 1% and 99%'} placeholder="e.g., 30" required sx={textFieldStyle}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Discount sx={{ color: '#999' }} /></InputAdornment>,
                    endAdornment: formData.mainPrice && formData.discount && (
                      <InputAdornment position="end">
                        <Chip label={`Final: ${calculateDiscountedPrice()} TND`} size="small" sx={{ fontFamily: 'Amaranth, sans-serif', bgcolor: alpha('#4caf50', 0.1), color: '#4caf50', fontWeight: 700 }} />
                      </InputAdornment>
                    ),
                  }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.category} required>
                  <InputLabel sx={{ fontFamily: 'Amaranth, sans-serif' }}>Offer Category</InputLabel>
                  <Select name="category" value={formData.category} onChange={handleInputChange} label="Offer Category" sx={{ fontFamily: 'Amaranth, sans-serif', borderRadius: '12px' }}>
                    {offerCategories.map((cat) => (
                      <MenuItem key={cat} value={cat} sx={{ fontFamily: 'Amaranth, sans-serif' }}>{cat}</MenuItem>
                    ))}
                  </Select>
                  {errors.category && <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.75rem', color: '#e70000', mt: 0.5, ml: 1.5 }}>{errors.category}</Typography>}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Promo Code" name="promoCode" value={formData.promoCode} onChange={handleInputChange} placeholder="Auto-generated or custom" sx={textFieldStyle}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Generate Promo Code" arrow>
                          <IconButton onClick={handleGeneratePromoCode} size="small"><Refresh sx={{ fontSize: 16 }} /></IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth name="startDate" type="date" value={formData.startDate} onChange={handleInputChange} error={!!errors.startDate} helperText={errors.startDate} required sx={textFieldStyle} InputLabelProps={{ shrink: true }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><CalendarToday sx={{ color: '#999' }} /></InputAdornment> }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth name="endDate" type="date" value={formData.endDate} onChange={handleInputChange} error={!!errors.endDate} helperText={errors.endDate} required sx={textFieldStyle} InputLabelProps={{ shrink: true }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Timer sx={{ color: '#999' }} /></InputAdornment> }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Max Usage (0 = unlimited)" name="maxUsage" type="number" value={formData.maxUsage} onChange={handleInputChange} placeholder="0" sx={textFieldStyle} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Low Stock Threshold" name="lowStockThreshold" type="number" value={formData.lowStockThreshold} onChange={handleInputChange} helperText="Alert when stock falls below this number" sx={textFieldStyle} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.9rem', color: '#666', mb: 1 }}>Initial Rating</Typography>
                  <Rating name="review" value={parseFloat(formData.review) || 0} onChange={(event, newValue) => { setFormData((prev) => ({ ...prev, review: newValue })); }} precision={0.5} sx={{ color: '#ff9800', fontSize: '2rem' }} />
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel control={<Switch checked={formData.isActive} onChange={handleInputChange} name="isActive" sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#4caf50' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#4caf50' } }} />}
                    label={<Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 600 }}>Active</Typography>} />
                  <FormControlLabel control={<Switch checked={formData.isFeatured} onChange={handleInputChange} name="isFeatured" sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#ff9800' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#ff9800' } }} />}
                    label={<Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 600 }}>Featured</Typography>} />
                </Box>
              </Grid>
            </Grid>
          )}

          {stockManagementTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 600, color: '#141010' }}>
                  Stock by Size
                </Typography>
                {errors.stockBySize && (
                  <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.75rem', color: '#e70000' }}>
                    {errors.stockBySize}
                  </Typography>
                )}
              </Box>
              
              <Grid container spacing={2}>
                {sizesData.map((size) => {
                  const stockItem = formData.stockBySize.find(item => item.size === size);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={size}>
                      <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#fafafa' }}>
                        <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 600, mb: 1 }}>
                          Size {size}
                        </Typography>
                        <TextField
                          fullWidth
                          label="Quantity"
                          type="number"
                          size="small"
                          value={stockItem?.quantity || ''}
                          onChange={(e) => handleStockBySizeChange(size, 'quantity', e.target.value)}
                          placeholder="Enter quantity"
                          sx={{ mb: 1 }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Inventory sx={{ color: '#999', fontSize: 18 }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <TextField
                          fullWidth
                          label="Location (Optional)"
                          size="small"
                          value={stockItem?.location || ''}
                          onChange={(e) => handleStockBySizeChange(size, 'location', e.target.value)}
                          placeholder="Shelf, warehouse, etc."
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationOn sx={{ color: '#999', fontSize: 18 }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}

          {stockManagementTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box>
                  <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.9rem', color: '#666', mb: 1 }}>Main Image {dialogMode === 'add' && '*'}</Typography>
                  <Button variant="outlined" component="label" startIcon={<CloudUpload />} sx={{ fontFamily: 'Amaranth, sans-serif', borderColor: errors.mainImage ? '#e70000' : '#141010', color: '#141010', '&:hover': { borderColor: '#141010', bgcolor: alpha('#141010', 0.05) } }}>
                    Upload Main Image
                    <input type="file" hidden accept="image/*" onChange={handleMainImageUpload} />
                  </Button>
                  {errors.mainImage && <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.75rem', color: '#e70000', mt: 0.5 }}>{errors.mainImage}</Typography>}
                  {mainImagePreview && <Box component="img" src={mainImagePreview} alt="Main preview" sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '8px', mt: 1 }} />}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box>
                  <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.9rem', color: '#666', mb: 1 }}>Additional Images</Typography>
                  <Button variant="outlined" component="label" startIcon={<CloudUpload />} sx={{ fontFamily: 'Amaranth, sans-serif', borderColor: '#141010', color: '#141010', '&:hover': { borderColor: '#141010', bgcolor: alpha('#141010', 0.05) } }}>
                    Upload Images
                    <input type="file" hidden accept="image/*" multiple onChange={handleImagesUpload} />
                  </Button>
                  {imagePreviews.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                      {imagePreviews.map((preview, index) => (
                        <Box key={index} sx={{ position: 'relative' }}>
                          <Box component="img" src={preview} alt={`Preview ${index + 1}`} sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '8px' }} />
                          <IconButton size="small" onClick={() => handleRemoveImage(index)} sx={{ position: 'absolute', top: -8, right: -8, bgcolor: '#e70000', color: '#fff', width: 20, height: 20, '&:hover': { bgcolor: '#c50000' } }}>
                            <Close sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={handleCloseDialog} startIcon={<Cancel />} sx={{ fontFamily: 'Amaranth, sans-serif', color: '#666' }}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" startIcon={dialogMode === 'add' ? <Add /> : <Save />} disabled={loading}
            sx={{ fontFamily: 'Amaranth, sans-serif', bgcolor: '#141010', color: '#f2f9f1', '&:hover': { bgcolor: '#2a2a2a' }, '&:disabled': { bgcolor: '#ccc' } }}>
            {loading ? 'Saving...' : dialogMode === 'add' ? 'Create Offer' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stock Management Dialog */}
      <Dialog open={stockDialogOpen} onClose={() => setStockDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px', fontFamily: 'Amaranth, sans-serif' } }}>
        <DialogTitle sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#141010' }}>
          Manage Stock: {selectedOfferForStock?.name}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {selectedOfferForStock?.stockBySize?.map((stock) => (
              <Grid item xs={12} key={stock.size}>
                <Paper sx={{ p: 2, borderRadius: '12px' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 600, fontSize: '1.1rem' }}>
                      Size {stock.size}
                    </Typography>
                    <Chip
                      label={`Available: ${stock.quantity - (stock.reserved || 0)}`}
                      size="small"
                      sx={{
                        bgcolor: (stock.quantity - (stock.reserved || 0)) <= 0 ? alpha('#e70000', 0.1) : alpha('#4caf50', 0.1),
                        color: (stock.quantity - (stock.reserved || 0)) <= 0 ? '#e70000' : '#4caf50',
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <TextField
                      label="Current Stock"
                      type="number"
                      size="small"
                      value={stock.quantity}
                      disabled
                      sx={{ width: 120 }}
                    />
                    <TextField
                      label="Quantity"
                      type="number"
                      size="small"
                      id={`stock-input-${stock.size}`}
                      placeholder="Enter quantity"
                      sx={{ width: 120 }}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddCircle />}
                      onClick={() => {
                        const input = document.getElementById(`stock-input-${stock.size}`);
                        const qty = input.value;
                        if (qty && qty > 0) {
                          handleStockUpdate(stock.size, qty, 'add');
                          input.value = '';
                        }
                      }}
                      sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#45a049' } }}
                    >
                      Add
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => {
                        const input = document.getElementById(`stock-input-${stock.size}`);
                        const qty = input.value;
                        if (qty && qty >= 0) {
                          handleStockUpdate(stock.size, qty, 'set');
                          input.value = '';
                        }
                      }}
                      sx={{ borderColor: '#141010', color: '#141010' }}
                    >
                      Set
                    </Button>
                  </Box>
                  {stock.location && (
                    <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.8rem', color: '#666', mt: 1 }}>
                      <LocationOn sx={{ fontSize: 14, verticalAlign: 'middle' }} /> Location: {stock.location}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            ))}
            {(!selectedOfferForStock?.stockBySize || selectedOfferForStock.stockBySize.length === 0) && (
              <Grid item xs={12}>
                <Typography sx={{ textAlign: 'center', color: '#999', py: 4 }}>
                  No stock information available for this offer.
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setStockDialogOpen(false)} sx={{ fontFamily: 'Amaranth, sans-serif', color: '#666' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })} PaperProps={{ sx: { borderRadius: '16px', fontFamily: 'Amaranth, sans-serif' } }}>
        <DialogTitle sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning sx={{ color: '#ff9800' }} /> Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: 'Amaranth, sans-serif' }}>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteConfirm({ open: false, id: null, name: '' })} sx={{ fontFamily: 'Amaranth, sans-serif', color: '#666' }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" startIcon={<Delete />} disabled={loading}
            sx={{ fontFamily: 'Amaranth, sans-serif', bgcolor: '#e70000', color: '#fff', '&:hover': { bgcolor: '#c50000' }, '&:disabled': { bgcolor: '#ccc' } }}>
            {loading ? 'Deleting...' : 'Delete Offer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}
          sx={{ fontFamily: 'Amaranth, sans-serif', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Shared text field style
const textFieldStyle = {
  '& .MuiOutlinedInput-root': {
    fontFamily: 'Amaranth, sans-serif',
    borderRadius: '12px',
    '& fieldset': { borderColor: '#e0e0e0' },
    '&:hover fieldset': { borderColor: '#141010' },
    '&.Mui-focused fieldset': { borderColor: '#141010', borderWidth: '2px' },
  },
  '& .MuiInputLabel-root': { fontFamily: 'Amaranth, sans-serif', '&.Mui-focused': { color: '#141010' } },
  '& .MuiFormHelperText-root': { fontFamily: 'Amaranth, sans-serif' },
};

export default AdminOffers;