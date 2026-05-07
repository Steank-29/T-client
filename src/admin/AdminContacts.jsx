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
  alpha,
  Badge,
} from '@mui/material';
import {
  Search,
  Delete,
  Refresh,
  Close,
  Email,
  Phone,
  Person,
  Subject,
  Message,
  CalendarToday,
  CheckCircle,
  Warning,
  MarkEmailRead,
  MarkEmailUnread,
  Reply,
  Visibility,
  FilterList,
  PictureAsPdf,
  TableChart,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { contactService } from '../services/api';

const AdminContacts = () => {
  // State management
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedContact, setSelectedContact] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    replied: 0,
  });

  // Fetch contacts on mount
  useEffect(() => {
    fetchContacts();
  }, []);

  // Filter contacts when search or status changes
  useEffect(() => {
    filterContacts();
  }, [contacts, searchQuery, statusFilter]);

  // Fetch contacts from API
  const fetchContacts = async () => {
    setTableLoading(true);
    try {
      const response = await contactService.getContacts({ limit: 100 });
      
      if (response.data.success) {
        const contactsData = response.data.data.map((contact) => ({
          ...contact,
          id: contact._id,
        }));
        setContacts(contactsData);
        setFilteredContacts(contactsData);
        calculateStats(contactsData);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      showSnackbar('Failed to load contacts', 'error');
    } finally {
      setTableLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (contactsData) => {
    setStats({
      total: contactsData.length,
      unread: contactsData.filter((c) => c.status === 'unread').length,
      read: contactsData.filter((c) => c.status === 'read').length,
      replied: contactsData.filter((c) => c.status === 'replied').length,
    });
  };

  // Filter contacts
  const filterContacts = () => {
    let filtered = [...contacts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (contact) =>
          contact.name.toLowerCase().includes(query) ||
          contact.email.toLowerCase().includes(query) ||
          contact.subject.toLowerCase().includes(query) ||
          contact.message.toLowerCase().includes(query) ||
          (contact.phone && contact.phone.includes(query))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((contact) => contact.status === statusFilter);
    }

    setFilteredContacts(filtered);
  };

  // Handle view contact
  const handleViewContact = (contact) => {
    setSelectedContact(contact);
    setOpenViewDialog(true);
    
    // Mark as read if unread
    if (contact.status === 'unread') {
      handleStatusChange(contact.id, 'read');
    }
  };

  // Handle status change
  const handleStatusChange = async (contactId, newStatus) => {
    try {
      const response = await contactService.updateContactStatus(contactId, { status: newStatus });
      
      setContacts((prev) =>
        prev.map((c) =>
          c.id === contactId ? { ...c, status: response.data.data.status } : c
        )
      );
      
      if (selectedContact && selectedContact.id === contactId) {
        setSelectedContact((prev) => ({ ...prev, status: newStatus }));
      }
      
      showSnackbar(`Contact marked as ${newStatus}`, 'success');
    } catch (error) {
      showSnackbar('Error updating contact status', 'error');
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (id, name) => {
    setDeleteConfirm({ open: true, id, name });
  };

  // Handle delete
  const handleDelete = async () => {
    setLoading(true);
    try {
      await contactService.deleteContact(deleteConfirm.id);
      setContacts((prev) => prev.filter((c) => c.id !== deleteConfirm.id));
      showSnackbar('Contact deleted successfully!', 'success');
      setDeleteConfirm({ open: false, id: null, name: '' });
      
      if (selectedContact && selectedContact.id === deleteConfirm.id) {
        setOpenViewDialog(false);
        setSelectedContact(null);
      }
    } catch (error) {
      showSnackbar('Error deleting contact.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Snackbar handler
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Export handlers
  const handleExportPDF = () => {
    window.print();
  };

  const handleExportExcel = () => {
    showSnackbar('Excel export will be available soon!', 'info');
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'unread':
        return '#2196f3';
      case 'read':
        return '#4caf50';
      case 'replied':
        return '#9c27b0';
      default:
        return '#999';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'unread':
        return <MarkEmailUnread sx={{ fontSize: 14 }} />;
      case 'read':
        return <MarkEmailRead sx={{ fontSize: 14 }} />;
      case 'replied':
        return <Reply sx={{ fontSize: 14 }} />;
      default:
        return null;
    }
  };

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get avatar color based on name
  const getAvatarColor = (name) => {
    const colors = ['#c31919', '#141010', '#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#e70000'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
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
              Contact Messages
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Amaranth, sans-serif',
                color: '#666',
              }}
            >
              View and manage contact form submissions from customers
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Tooltip title="Refresh Data" arrow>
              <IconButton
                onClick={fetchContacts}
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
          </Box>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'Total Messages', value: stats.total, icon: Email, color: '#141010' },
          { title: 'Unread', value: stats.unread, icon: MarkEmailUnread, color: '#2196f3' },
          { title: 'Read', value: stats.read, icon: MarkEmailRead, color: '#4caf50' },
          { title: 'Replied', value: stats.replied, icon: Reply, color: '#9c27b0' },
        ].map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
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
                    cursor: 'pointer',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' },
                    border: statusFilter === stat.title.toLowerCase() ? '2px solid #141010' : 'none',
                  }}
                  onClick={() => {
                    if (stat.title === 'Total Messages') {
                      setStatusFilter('all');
                    } else {
                      setStatusFilter(stat.title.toLowerCase());
                    }
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
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: '12px',
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <TextField
          placeholder="Search contacts by name, email, subject..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{
            flex: 1,
            minWidth: 250,
            '& .MuiOutlinedInput-root': {
              fontFamily: 'Amaranth, sans-serif',
              borderRadius: '8px',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: '#999' }} />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel sx={{ fontFamily: 'Amaranth, sans-serif' }}>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
            sx={{
              fontFamily: 'Amaranth, sans-serif',
              borderRadius: '8px',
            }}
          >
            <MenuItem value="all" sx={{ fontFamily: 'Amaranth, sans-serif' }}>
              All Messages
            </MenuItem>
            <MenuItem value="unread" sx={{ fontFamily: 'Amaranth, sans-serif' }}>
              Unread
            </MenuItem>
            <MenuItem value="read" sx={{ fontFamily: 'Amaranth, sans-serif' }}>
              Read
            </MenuItem>
            <MenuItem value="replied" sx={{ fontFamily: 'Amaranth, sans-serif' }}>
              Replied
            </MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* Contacts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Paper
          sx={{
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          {tableLoading && <LinearProgress />}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f2f9f1' }}>
                  <TableCell sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#141010', width: 50 }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#141010' }}>
                    Contact
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#141010' }}>
                    Subject
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#141010' }}>
                    Message
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#141010' }}>
                    Date
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#141010' }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredContacts
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((contact) => (
                    <TableRow
                      key={contact.id}
                      sx={{
                        '&:hover': { bgcolor: alpha('#141010', 0.02) },
                        transition: 'background-color 0.2s ease',
                        cursor: 'pointer',
                        bgcolor: contact.status === 'unread' ? alpha('#2196f3', 0.03) : 'transparent',
                        fontWeight: contact.status === 'unread' ? 600 : 400,
                      }}
                      onClick={() => handleViewContact(contact)}
                    >
                      <TableCell>
                        <Tooltip title={contact.status.charAt(0).toUpperCase() + contact.status.slice(1)} arrow>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              bgcolor: alpha(getStatusColor(contact.status), 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {getStatusIcon(contact.status)}
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: getAvatarColor(contact.name),
                              fontFamily: 'Amaranth, sans-serif',
                              fontWeight: 700,
                              fontSize: '0.9rem',
                            }}
                          >
                            {getInitials(contact.name)}
                          </Avatar>
                          <Box>
                            <Typography
                              sx={{
                                fontFamily: 'Amaranth, sans-serif',
                                fontWeight: contact.status === 'unread' ? 700 : 600,
                                color: '#141010',
                              }}
                            >
                              {contact.name}
                            </Typography>
                            <Typography
                              sx={{
                                fontFamily: 'Amaranth, sans-serif',
                                fontSize: '0.75rem',
                                color: '#666',
                              }}
                            >
                              {contact.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontFamily: 'Amaranth, sans-serif',
                            fontWeight: contact.status === 'unread' ? 600 : 400,
                            color: '#141010',
                            maxWidth: 180,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {contact.subject || 'General Inquiry'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontFamily: 'Amaranth, sans-serif',
                            fontSize: '0.85rem',
                            color: '#666',
                            maxWidth: 280,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {contact.message}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarToday sx={{ fontSize: 14, color: '#999' }} />
                          <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.8rem', color: '#666' }}>
                            {formatDate(contact.createdAt)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="View Details" arrow>
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewContact(contact);
                              }}
                              sx={{
                                color: '#141010',
                                '&:hover': { bgcolor: alpha('#141010', 0.05) },
                              }}
                              size="small"
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {contact.status === 'unread' && (
                            <Tooltip title="Mark as Read" arrow>
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(contact.id, 'read');
                                }}
                                sx={{
                                  color: '#4caf50',
                                  '&:hover': { bgcolor: alpha('#4caf50', 0.05) },
                                }}
                                size="small"
                              >
                                <MarkEmailRead fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {contact.status !== 'replied' && (
                            <Tooltip title="Mark as Replied" arrow>
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(contact.id, 'replied');
                                }}
                                sx={{
                                  color: '#9c27b0',
                                  '&:hover': { bgcolor: alpha('#9c27b0', 0.05) },
                                }}
                                size="small"
                              >
                                <Reply fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Delete" arrow>
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteConfirm(contact.id, contact.name);
                              }}
                              sx={{
                                color: '#e70000',
                                '&:hover': { bgcolor: alpha('#e70000', 0.05) },
                              }}
                              size="small"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                {!tableLoading && filteredContacts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Email sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                        <Typography sx={{ fontFamily: 'Amaranth, sans-serif', color: '#999', fontSize: '1.1rem' }}>
                          No contact messages found
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
            count={filteredContacts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              fontFamily: 'Amaranth, sans-serif',
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                fontFamily: 'Amaranth, sans-serif',
              },
            }}
          />
        </Paper>
      </motion.div>

      {/* View Contact Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            fontFamily: 'Amaranth, sans-serif',
          },
        }}
      >
        {selectedContact && (
          <>
            <DialogTitle
              sx={{
                fontFamily: 'Amaranth, sans-serif',
                fontWeight: 700,
                fontSize: '1.3rem',
                color: '#141010',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pb: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  sx={{
                    width: 44,
                    height: 44,
                    bgcolor: getAvatarColor(selectedContact.name),
                    fontFamily: 'Amaranth, sans-serif',
                    fontWeight: 700,
                  }}
                >
                  {getInitials(selectedContact.name)}
                </Avatar>
                <Box>
                  <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, fontSize: '1.1rem' }}>
                    {selectedContact.name}
                  </Typography>
                  <Chip
                    label={selectedContact.status}
                    size="small"
                    icon={getStatusIcon(selectedContact.status)}
                    sx={{
                      fontFamily: 'Amaranth, sans-serif',
                      bgcolor: alpha(getStatusColor(selectedContact.status), 0.1),
                      color: getStatusColor(selectedContact.status),
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      height: 22,
                    }}
                  />
                </Box>
              </Box>
              <IconButton onClick={() => setOpenViewDialog(false)} size="small">
                <Close />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ py: 2.5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Contact Info */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.75rem', color: '#999', mb: 0.5, textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Contact Details
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person sx={{ fontSize: 16, color: '#999' }} />
                        <Box>
                          <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.9rem', color: '#141010', fontWeight: 600 }}>
                            {selectedContact.name}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email sx={{ fontSize: 16, color: '#999' }} />
                        <Typography
                          sx={{
                            fontFamily: 'Amaranth, sans-serif',
                            fontSize: '0.85rem',
                            color: '#2196f3',
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                          onClick={() => window.open(`mailto:${selectedContact.email}`)}
                        >
                          {selectedContact.email}
                        </Typography>
                      </Box>
                      {selectedContact.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Phone sx={{ fontSize: 16, color: '#999' }} />
                          <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.85rem', color: '#141010' }}>
                            {selectedContact.phone}
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday sx={{ fontSize: 16, color: '#999' }} />
                        <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.85rem', color: '#141010' }}>
                          {new Date(selectedContact.createdAt).toLocaleString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Status Actions */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.75rem', color: '#999', mb: 0.5, textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Update Status
                    </Typography>
                    <Button
                      variant={selectedContact.status === 'unread' ? 'contained' : 'outlined'}
                      size="small"
                      startIcon={<MarkEmailUnread />}
                      onClick={() => handleStatusChange(selectedContact.id, 'unread')}
                      sx={{
                        fontFamily: 'Amaranth, sans-serif',
                        bgcolor: selectedContact.status === 'unread' ? '#2196f3' : 'transparent',
                        color: selectedContact.status === 'unread' ? '#fff' : '#2196f3',
                        borderColor: '#2196f3',
                        '&:hover': { bgcolor: selectedContact.status === 'unread' ? '#1976d2' : alpha('#2196f3', 0.05) },
                      }}
                    >
                      Unread
                    </Button>
                    <Button
                      variant={selectedContact.status === 'read' ? 'contained' : 'outlined'}
                      size="small"
                      startIcon={<MarkEmailRead />}
                      onClick={() => handleStatusChange(selectedContact.id, 'read')}
                      sx={{
                        fontFamily: 'Amaranth, sans-serif',
                        bgcolor: selectedContact.status === 'read' ? '#4caf50' : 'transparent',
                        color: selectedContact.status === 'read' ? '#fff' : '#4caf50',
                        borderColor: '#4caf50',
                        '&:hover': { bgcolor: selectedContact.status === 'read' ? '#388e3c' : alpha('#4caf50', 0.05) },
                      }}
                    >
                      Read
                    </Button>
                    <Button
                      variant={selectedContact.status === 'replied' ? 'contained' : 'outlined'}
                      size="small"
                      startIcon={<Reply />}
                      onClick={() => handleStatusChange(selectedContact.id, 'replied')}
                      sx={{
                        fontFamily: 'Amaranth, sans-serif',
                        bgcolor: selectedContact.status === 'replied' ? '#9c27b0' : 'transparent',
                        color: selectedContact.status === 'replied' ? '#fff' : '#9c27b0',
                        borderColor: '#9c27b0',
                        '&:hover': { bgcolor: selectedContact.status === 'replied' ? '#7b1fa2' : alpha('#9c27b0', 0.05) },
                      }}
                    >
                      Replied
                    </Button>
                  </Box>
                </Box>

                {/* Subject */}
                <Box>
                  <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.75rem', color: '#999', mb: 0.5, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Subject
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Subject sx={{ fontSize: 16, color: '#999' }} />
                    <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '1rem', color: '#141010', fontWeight: 600 }}>
                      {selectedContact.subject || 'General Inquiry'}
                    </Typography>
                  </Box>
                </Box>

                {/* Message */}
                <Box>
                  <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.75rem', color: '#999', mb: 0.5, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Message
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: '#f2f9f1',
                      p: 2.5,
                      borderRadius: '12px',
                      border: '1px solid rgba(0,0,0,0.06)',
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Message sx={{ fontSize: 16, color: '#999', mt: 0.3 }} />
                      <Typography
                        sx={{
                          fontFamily: 'Amaranth, sans-serif',
                          fontSize: '0.95rem',
                          color: '#141010',
                          lineHeight: 1.8,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {selectedContact.message}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Quick Reply Button */}
                <Button
                  variant="contained"
                  startIcon={<Reply />}
                  fullWidth
                  onClick={() => window.open(`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject || 'Your Inquiry'}&body=Dear ${selectedContact.name},%0D%0A%0D%0A`)}
                  sx={{
                    fontFamily: 'Amaranth, sans-serif',
                    bgcolor: '#141010',
                    color: '#f2f9f1',
                    '&:hover': { bgcolor: '#2a2a2a' },
                  }}
                >
                  Reply via Email
                </Button>
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, gap: 1 }}>
              <Button
                onClick={() => setOpenViewDialog(false)}
                sx={{ fontFamily: 'Amaranth, sans-serif', color: '#666' }}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setOpenViewDialog(false);
                  handleDeleteConfirm(selectedContact.id, selectedContact.name);
                }}
                variant="contained"
                startIcon={<Delete />}
                sx={{
                  fontFamily: 'Amaranth, sans-serif',
                  bgcolor: '#e70000',
                  color: '#fff',
                  '&:hover': { bgcolor: '#c50000' },
                }}
              >
                Delete Message
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            fontFamily: 'Amaranth, sans-serif',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: 'Amaranth, sans-serif',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Warning sx={{ color: '#ff9800' }} />
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: 'Amaranth, sans-serif' }}>
            Are you sure you want to delete the message from <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => setDeleteConfirm({ open: false, id: null, name: '' })}
            sx={{ fontFamily: 'Amaranth, sans-serif', color: '#666' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            startIcon={<Delete />}
            disabled={loading}
            sx={{
              fontFamily: 'Amaranth, sans-serif',
              bgcolor: '#e70000',
              color: '#fff',
              '&:hover': { bgcolor: '#c50000' },
              '&:disabled': { bgcolor: '#ccc' },
            }}
          >
            {loading ? 'Deleting...' : 'Delete Message'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            fontFamily: 'Amaranth, sans-serif',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            fontWeight: 600,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminContacts;