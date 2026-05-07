import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
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
  Card,
  CardContent,
  CardMedia,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  LinearProgress,
  Tabs,
  Tab,
  Rating,
  alpha,
  Badge,
  Divider,
} from '@mui/material';
import {
  Search,
  Refresh,
  Visibility,
  Edit,
  Delete,
  Inventory,
  Category,
  AttachMoney,
  Star,
  ShoppingCart,
  LocalOffer,
  CheckCircle,
  Warning,
  Close,
  FilterList,
  SortByAlpha,
  TrendingUp,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { productService } from '../services/api';

const AdminCategories = () => {
  // State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [viewProduct, setViewProduct] = useState({ open: false, product: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });
  const [categoryStats, setCategoryStats] = useState([]);

  // Category colors
  const categoryColors = {
    'Sport': '#2196f3',
    'Streetwear': '#ff9800',
    'Religious': '#9c27b0',
    'Accessories': '#4caf50',
    'Footwear': '#795548',
    'Headwear': '#e91e63',
    'default': '#141010',
  };

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Extract categories and calculate stats when products change
  useEffect(() => {
    if (products.length > 0) {
      extractCategories();
      calculateCategoryStats();
    }
  }, [products]);

  // Fetch products from API
  const fetchProducts = async () => {
    setTableLoading(true);
    try {
      const response = await productService.getProducts({ limit: 1000, sortBy: 'category', sortOrder: 'asc' });
      
      if (response.data.success) {
        const productsData = response.data.data.map((product) => ({
          ...product,
          id: product._id,
          mainImage: product.mainImage?.url || 'https://via.placeholder.com/150',
          images: product.images?.map(img => img.url) || [],
        }));
        setProducts(productsData);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      showSnackbar('Failed to load products', 'error');
      loadSampleData();
    } finally {
      setTableLoading(false);
    }
  };

  // Load sample data as fallback
  const loadSampleData = () => {
    const sampleProducts = [
      { _id: '1', id: '1', name: 'Sports Jersey Pro', description: 'Premium sports jersey', price: 79.99, size: ['M', 'L', 'XL'], review: 4.5, discount: 10, mainImage: 'https://via.placeholder.com/150', images: [], category: 'Sport', createdAt: '2024-01-15', status: 'active', discount: 71.99, salesCount: 120 },
      { _id: '2', id: '2', name: 'Running Shorts', description: 'Lightweight running shorts', price: 49.99, size: ['S', 'M', 'L'], review: 4.2, discount: 0, mainImage: 'https://via.placeholder.com/150', images: [], category: 'Sport', createdAt: '2024-02-10', status: 'active', discount: 49.99, salesCount: 85 },
      { _id: '3', id: '3', name: 'Urban Hoodie', description: 'Street style hoodie', price: 89.99, size: ['M', 'L', 'XL'], review: 4.7, discount: 20, mainImage: 'https://via.placeholder.com/150', images: [], category: 'Streetwear', createdAt: '2024-01-20', status: 'active', discount: 71.99, salesCount: 200 },
      { _id: '4', id: '4', name: 'Denim Jacket', description: 'Classic denim jacket', price: 129.99, size: ['S', 'M', 'L'], review: 4.0, discount: 15, mainImage: 'https://via.placeholder.com/150', images: [], category: 'Streetwear', createdAt: '2024-03-01', status: 'active', discount: 110.49, salesCount: 65 },
      { _id: '5', id: '5', name: 'Prayer Mat Deluxe', description: 'Premium prayer mat', price: 59.99, size: ['One Size'], review: 4.9, discount: 5, mainImage: 'https://via.placeholder.com/150', images: [], category: 'Religious', createdAt: '2024-02-15', status: 'active', discount: 56.99, salesCount: 150 },
      { _id: '6', id: '6', name: 'Quran Stand', description: 'Elegant wooden Quran stand', price: 39.99, size: ['One Size'], review: 4.6, discount: 0, mainImage: 'https://via.placeholder.com/150', images: [], category: 'Religious', createdAt: '2024-03-10', status: 'active', discount: 39.99, salesCount: 90 },
      { _id: '7', id: '7', name: 'Leather Wallet', description: 'Genuine leather wallet', price: 34.99, size: ['One Size'], review: 4.3, discount: 10, mainImage: 'https://via.placeholder.com/150', images: [], category: 'Accessories', createdAt: '2024-01-05', status: 'active', discount: 31.49, salesCount: 300 },
    ];
    setProducts(sampleProducts);
  };

  // Extract unique categories
  const extractCategories = () => {
    const uniqueCategories = [...new Set(products.map(p => p.category))].sort();
    setCategories(uniqueCategories);
  };

  // Calculate category statistics
  const calculateCategoryStats = () => {
    const stats = categories.map((cat) => {
      const catProducts = products.filter(p => p.category === cat);
      const totalProducts = catProducts.length;
      const totalValue = catProducts.reduce((sum, p) => sum + (p.discount || p.price), 0);
      const avgPrice = totalProducts > 0 ? totalValue / totalProducts : 0;
      const avgRating = totalProducts > 0 ? catProducts.reduce((sum, p) => sum + (p.review || 0), 0) / totalProducts : 0;
      const totalSales = catProducts.reduce((sum, p) => sum + (p.salesCount || 0), 0);
      const totalDiscount = catProducts.filter(p => p.discount > 0).length;
      const activeProducts = catProducts.filter(p => p.status === 'active').length;

      return {
        category: cat,
        totalProducts,
        totalValue,
        avgPrice,
        avgRating,
        totalSales,
        totalDiscount,
        activeProducts,
      };
    });
    setCategoryStats(stats);
  };

  // Get filtered products
  const getFilteredProducts = () => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = (a.discount || a.price) - (b.discount || b.price);
          break;
        case 'rating':
          comparison = (a.review || 0) - (b.review || 0);
          break;
        case 'sales':
          comparison = (a.salesCount || 0) - (b.salesCount || 0);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  // Get products count by category
  const getCategoryCount = (category) => {
    if (category === 'all') return products.length;
    return products.filter(p => p.category === category).length;
  };

  // Get category color
  const getCategoryColor = (category) => {
    return categoryColors[category] || categoryColors.default;
  };

  // Handlers
  const handleViewProduct = (product) => {
    setViewProduct({ open: true, product });
  };

  const handleDeleteConfirm = (id, name) => {
    setDeleteConfirm({ open: true, id, name });
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await productService.deleteProduct(deleteConfirm.id);
      setProducts(prev => prev.filter(p => p.id !== deleteConfirm.id));
      showSnackbar('Product deleted successfully!', 'success');
      setDeleteConfirm({ open: false, id: null, name: '' });
    } catch (error) {
      showSnackbar('Error deleting product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#141010', mb: 0.5 }}>
              Categories
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: 'Amaranth, sans-serif', color: '#666' }}>
              Browse products organized by category with detailed statistics
            </Typography>
          </Box>
          <Tooltip title="Refresh Data" arrow>
            <IconButton onClick={fetchProducts} sx={{ border: '1px solid #141010', borderRadius: '8px', color: '#141010', '&:hover': { bgcolor: alpha('#141010', 0.05) } }}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </motion.div>

      {/* Category Overview Cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={4} md={2}>
            <Card
              onClick={() => setSelectedCategory('all')}
              sx={{
                cursor: 'pointer',
                borderRadius: '12px',
                border: selectedCategory === 'all' ? '2px solid #141010' : '2px solid transparent',
                bgcolor: selectedCategory === 'all' ? alpha('#141010', 0.05) : '#fff',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' },
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: alpha('#141010', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1 }}>
                  <Inventory sx={{ color: '#141010', fontSize: 24 }} />
                </Box>
                <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#141010', fontSize: '0.9rem' }}>All</Typography>
                <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '1.3rem', fontWeight: 700, color: '#141010' }}>{products.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          {categories.map((cat) => {
            const color = getCategoryColor(cat);
            const count = getCategoryCount(cat);
            return (
              <Grid item xs={6} sm={4} md={2} key={cat}>
                <Card
                  onClick={() => setSelectedCategory(selectedCategory === cat ? 'all' : cat)}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: '12px',
                    border: selectedCategory === cat ? `2px solid ${color}` : '2px solid transparent',
                    bgcolor: selectedCategory === cat ? alpha(color, 0.05) : '#fff',
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: alpha(color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1 }}>
                      <Category sx={{ color, fontSize: 24 }} />
                    </Box>
                    <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#141010', fontSize: '0.85rem' }}>{cat}</Typography>
                    <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '1.3rem', fontWeight: 700, color }}>{count}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </motion.div>

      {/* Category Stats */}
      {selectedCategory !== 'all' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Paper sx={{ p: 3, mb: 3, borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#141010', mb: 2 }}>
              {selectedCategory} Overview
            </Typography>
            <Grid container spacing={2}>
              {categoryStats.filter(s => s.category === selectedCategory).map((stat) => (
                <React.Fragment key={stat.category}>
                  {[
                    { label: 'Products', value: stat.totalProducts, icon: Inventory, color: '#141010' },
                    { label: 'Active', value: stat.activeProducts, icon: CheckCircle, color: '#4caf50' },
                    { label: 'Avg Price', value: `${stat.avgPrice.toFixed(2)} TND`, icon: AttachMoney, color: '#2196f3' },
                    { label: 'Avg Rating', value: stat.avgRating.toFixed(1), icon: Star, color: '#ff9800' },
                    { label: 'On Sale', value: stat.totalDiscount, icon: LocalOffer, color: '#e70000' },
                    { label: 'Total Sales', value: stat.totalSales, icon: TrendingUp, color: '#9c27b0' },
                  ].map((item, idx) => {
                    const IconComponent = item.icon;
                    return (
                      <Grid item xs={6} sm={4} md={2} key={idx}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: '12px', bgcolor: alpha(item.color, 0.05) }}>
                          <Box sx={{ width: 36, height: 36, borderRadius: '8px', bgcolor: alpha(item.color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IconComponent sx={{ color: item.color, fontSize: 18 }} />
                          </Box>
                          <Box>
                            <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.7rem', color: '#999' }}>{item.label}</Typography>
                            <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#141010' }}>{item.value}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                    );
                  })}
                </React.Fragment>
              ))}
            </Grid>
          </Paper>
        </motion.div>
      )}

      {/* Search and Sort Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '12px', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <TextField
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{ flex: 1, minWidth: 200, '& .MuiOutlinedInput-root': { fontFamily: 'Amaranth, sans-serif', borderRadius: '8px' } }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search sx={{ color: '#999' }} /></InputAdornment>,
          }}
        />
        <Tooltip title="Sort" arrow>
          <IconButton onClick={toggleSortOrder} sx={{ border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            {sortOrder === 'asc' ? <ArrowUpward sx={{ color: '#141010' }} /> : <ArrowDownward sx={{ color: '#141010' }} />}
          </IconButton>
        </Tooltip>
        <Chip
          label={`${filteredProducts.length} products`}
          size="small"
          sx={{ fontFamily: 'Amaranth, sans-serif', bgcolor: alpha('#141010', 0.05), color: '#141010', fontWeight: 600 }}
        />
      </Paper>

      {/* Products Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <Paper sx={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          {tableLoading && <LinearProgress />}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f2f9f1' }}>
                  {['Product', 'Category', 'Sizes', 'Rating', 'Status'].map((header) => (
                    <TableCell key={header} sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#141010' }} align={header === 'Actions' ? 'center' : 'left'}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((product) => (
                    <TableRow key={product.id} sx={{ '&:hover': { bgcolor: alpha('#141010', 0.02) }, transition: 'background-color 0.2s ease' }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src={product.mainImage} variant="rounded" sx={{ width: 44, height: 44, borderRadius: '8px' }} />
                          <Box>
                            <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 600, color: '#141010' }}>{product.name}</Typography>
                            <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.75rem', color: '#999', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {product.description}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={product.category} size="small"
                          sx={{ fontFamily: 'Amaranth, sans-serif', bgcolor: alpha(getCategoryColor(product.category), 0.08), color: getCategoryColor(product.category), fontWeight: 600 }} />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {product.size?.slice(0, 3).map((size) => (
                            <Chip key={size} label={size} size="small"
                              sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.65rem', bgcolor: '#f2f9f1', color: '#141010', height: 20 }} />
                          ))}
                          {product.size?.length > 3 && (
                            <Chip label={`+${product.size.length - 3}`} size="small"
                              sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.65rem', bgcolor: '#e0e0e0', color: '#666', height: 20 }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Rating value={product.review || 0} precision={0.5} readOnly size="small" sx={{ color: '#ff9800' }} />
                          <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.8rem', color: '#666' }}>({product.review || 0})</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={product.status || 'active'} size="small"
                          sx={{ fontFamily: 'Amaranth, sans-serif', bgcolor: product.status === 'active' ? alpha('#4caf50', 0.1) : alpha('#ff9800', 0.1), color: product.status === 'active' ? '#4caf50' : '#ff9800', fontWeight: 600, textTransform: 'capitalize' }} />
                      </TableCell>
                    </TableRow>
                  ))}
                {!tableLoading && filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Category sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                        <Typography sx={{ fontFamily: 'Amaranth, sans-serif', color: '#999', fontSize: '1.1rem' }}>
                          No products found in this category
                        </Typography>
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
            count={filteredProducts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ fontFamily: 'Amaranth, sans-serif', '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { fontFamily: 'Amaranth, sans-serif' } }}
          />
        </Paper>
      </motion.div>

      {/* View Product Dialog */}
      <Dialog open={viewProduct.open} onClose={() => setViewProduct({ open: false, product: null })} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '16px', fontFamily: 'Amaranth, sans-serif' } }}>
        {viewProduct.product && (
          <>
            <DialogTitle sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Product Details
              <IconButton onClick={() => setViewProduct({ open: false, product: null })} size="small"><Close /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                <Avatar src={viewProduct.product.mainImage} variant="rounded" sx={{ width: 120, height: 120, borderRadius: '12px' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#141010' }}>{viewProduct.product.name}</Typography>
                  <Chip label={viewProduct.product.category} size="small"
                    sx={{ fontFamily: 'Amaranth, sans-serif', bgcolor: alpha(getCategoryColor(viewProduct.product.category), 0.08), color: getCategoryColor(viewProduct.product.category), fontWeight: 600, mt: 0.5 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Rating value={viewProduct.product.review || 0} precision={0.5} readOnly size="small" sx={{ color: '#ff9800' }} />
                    <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.85rem', color: '#666' }}>({viewProduct.product.review || 0})</Typography>
                  </Box>
                </Box>
              </Box>
              <Grid container spacing={2}>
                {[
                  { label: 'Discount', value: viewProduct.product.discount > 0 ? `${viewProduct.product.discount}%` : 'None' },
                  { label: 'Sizes', value: viewProduct.product.size?.join(', ') || 'N/A' },
                  { label: 'Sales', value: viewProduct.product.salesCount || 0 },
                  { label: 'Status', value: viewProduct.product.status || 'active' },
                  { label: 'Created', value: viewProduct.product.createdAt ? new Date(viewProduct.product.createdAt).toLocaleDateString() : 'N/A' },
                ].map((item, idx) => (
                  <Grid item xs={6} key={idx}>
                    <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.75rem', color: '#999', mb: 0.3 }}>{item.label}</Typography>
                    <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 600, color: '#141010' }}>{item.value}</Typography>
                  </Grid>
                ))}
              </Grid>
              {viewProduct.product.description && (
                <Box sx={{ mt: 2 }}>
                  <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.85rem', color: '#666', lineHeight: 1.6 }}>
                    {viewProduct.product.description}
                  </Typography>
                </Box>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })}
        PaperProps={{ sx: { borderRadius: '16px', fontFamily: 'Amaranth, sans-serif' } }}>
        <DialogTitle sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning sx={{ color: '#ff9800' }} /> Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: 'Amaranth, sans-serif' }}>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteConfirm({ open: false, id: null, name: '' })} sx={{ fontFamily: 'Amaranth, sans-serif', color: '#666' }}>Cancel</Button>
          <Button variant="contained" onClick={handleDelete} disabled={loading} startIcon={<Delete />}
            sx={{ fontFamily: 'Amaranth, sans-serif', bgcolor: '#e70000', color: '#fff', '&:hover': { bgcolor: '#c50000' } }}>
            {loading ? 'Deleting...' : 'Delete'}
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

export default AdminCategories;