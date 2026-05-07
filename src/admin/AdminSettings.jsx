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
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  alpha,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Save,
  Refresh,
  Person,
  Email,
  Lock,
  CalendarToday,
  Wc,
  Phone,
  Settings,
  People,
  AdminPanelSettings,
  Edit,
  Delete,
  Search,
  Warning,
  Close,
  CheckCircle,
  Security,
  VpnKey,
  Badge,
  Shield,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { authService } from '../services/api';
import { getCurrentUser, getAdminData } from '../utils/auth';

const AdminSettings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });
  const [editUserDialog, setEditUserDialog] = useState({ open: false, user: null });
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    role: '',
    dateOfBirth: '',
    gender: '',
  });
  const [profileErrors, setProfileErrors] = useState({});

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  // Edit user form state
  const [editUserForm, setEditUserForm] = useState({
    name: '',
    email: '',
    role: '',
    isActive: true,
  });

  useEffect(() => {
    loadCurrentUser();
    if (tabValue === 1) {
      fetchUsers();
    }
  }, [tabValue]);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery]);

  const loadCurrentUser = () => {
    const user = getAdminData();
    setCurrentUser(user);
    setProfileForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || '',
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      gender: user.gender || '',
    });
  };

  const fetchUsers = async () => {
    setTableLoading(true);
    try {
      const response = await authService.getUsers({ limit: 100 });
      if (response.data.success) {
        const usersData = response.data.data.map((user) => ({
          ...user,
          id: user._id,
        }));
        setUsers(usersData);
        setFilteredUsers(usersData);
      }
    } catch (error) {
      showSnackbar('Failed to load users', 'error');
    } finally {
      setTableLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.role.toLowerCase().includes(query)
      );
    }
    setFilteredUsers(filtered);
  };

  // Profile update
  const handleProfileSubmit = async () => {
    const newErrors = {};
    if (!profileForm.name.trim()) newErrors.name = 'Name is required';
    if (!profileForm.email.trim()) newErrors.email = 'Email is required';
    
    setProfileErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const response = await authService.updateProfile(profileForm);
      if (response.data.success) {
        const updatedUser = response.data.user;
        localStorage.setItem('tawakkul_user', JSON.stringify({
          ...JSON.parse(localStorage.getItem('tawakkul_user') || '{}'),
          ...updatedUser,
        }));
        setCurrentUser((prev) => ({ ...prev, ...updatedUser }));
        showSnackbar('Profile updated successfully!', 'success');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Error updating profile';
      showSnackbar(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Password change
  const handlePasswordSubmit = async () => {
    const newErrors = {};
    if (!passwordForm.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) newErrors.newPassword = 'Min 6 characters';
    if (passwordForm.newPassword !== passwordForm.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setPasswordErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const response = await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (response.data.success) {
        localStorage.setItem('tawakkul_token', response.data.token);
        showSnackbar('Password changed successfully!', 'success');
        setChangePasswordDialog(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordErrors({});
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Error changing password';
      showSnackbar(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Edit user
  const handleEditUser = (user) => {
    setEditUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive !== false,
    });
    setEditUserDialog({ open: true, user });
  };

  const handleUpdateUser = async () => {
    setLoading(true);
    try {
      const response = await authService.updateUser(editUserDialog.user.id, editUserForm);
      if (response.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === editUserDialog.user.id ? { ...u, ...response.data.data } : u))
        );
        showSnackbar('User updated successfully!', 'success');
        setEditUserDialog({ open: false, user: null });
      }
    } catch (error) {
      showSnackbar('Error updating user', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDeleteConfirm = (id, name) => {
    setDeleteConfirm({ open: true, id, name });
  };

  const handleDeleteUser = async () => {
    setLoading(true);
    try {
      await authService.deleteUser(deleteConfirm.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteConfirm.id));
      showSnackbar('User deleted successfully!', 'success');
      setDeleteConfirm({ open: false, id: null, name: '' });
    } catch (error) {
      const msg = error.response?.data?.message || 'Error deleting user';
      showSnackbar(msg, 'error');
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

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#c31919';
      case 'moderator': return '#ff9800';
      default: return '#2196f3';
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Typography variant="h4" sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#141010', mb: 0.5 }}>
          Settings
        </Typography>
        <Typography variant="body1" sx={{ fontFamily: 'Amaranth, sans-serif', color: '#666', mb: 3 }}>
          Manage your profile, security, and system settings
        </Typography>
      </motion.div>

      <Paper sx={{ borderRadius: '16px', overflow: 'hidden', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          sx={{
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            '& .MuiTab-root': { fontFamily: 'Amaranth, sans-serif', fontWeight: 600, textTransform: 'none', fontSize: '0.95rem' },
            '& .Mui-selected': { color: '#141010 !important' },
            '& .MuiTabs-indicator': { backgroundColor: '#141010' },
          }}
        >
          <Tab icon={<Person />} iconPosition="start" label="My Profile" />
          <Tab icon={<Badge />} iconPosition="start" label="Change Password" />
          {currentUser?.role === 'admin' && (
            <Tab icon={<People />} iconPosition="start" label="User Management" />
          )}
        </Tabs>
      </Paper>

      {/* Tab 0: My Profile */}
      {tabValue === 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Paper sx={{ p: 4, borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
              <Avatar sx={{ width: 72, height: 72, bgcolor: '#141010', fontFamily: 'Amaranth, sans-serif', fontWeight: 700, fontSize: '1.5rem' }}>
                {getInitials(currentUser?.name)}
              </Avatar>
              <Box>
                <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, fontSize: '1.3rem', color: '#141010' }}>
                  {currentUser?.name || 'Admin'}
                </Typography>
                <Chip
                  label={currentUser?.role === 'admin' ? 'Administrator' : 'User'}
                  size="small"
                  icon={currentUser?.role === 'admin' ? <AdminPanelSettings /> : <Person />}
                  sx={{ fontFamily: 'Amaranth, sans-serif', bgcolor: alpha(getRoleColor(currentUser?.role), 0.1), color: getRoleColor(currentUser?.role), fontWeight: 600, mt: 0.5 }}
                />
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Full Name" name="name" value={profileForm.name}
                  onChange={(e) => { setProfileForm((p) => ({ ...p, name: e.target.value })); setProfileErrors((p) => ({ ...p, name: '' })); }}
                  error={!!profileErrors.name} helperText={profileErrors.name}
                  sx={textFieldStyle}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: '#999' }} /></InputAdornment> }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Email" name="email" type="email" value={profileForm.email}
                  onChange={(e) => { setProfileForm((p) => ({ ...p, email: e.target.value })); setProfileErrors((p) => ({ ...p, email: '' })); }}
                  error={!!profileErrors.email} helperText={profileErrors.email}
                  sx={textFieldStyle}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#999' }} /></InputAdornment> }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField disabled fullWidth label="Role" name="role" value={profileForm.role}
                  onChange={(e) => setProfileForm((p) => ({ ...p, role: e.target.value }))}
                  sx={textFieldStyle}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#999' }} /></InputAdornment> }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Date of Birth" name="dateOfBirth" type="date" value={profileForm.dateOfBirth}
                  onChange={(e) => setProfileForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                  sx={textFieldStyle} InputLabelProps={{ shrink: true }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><CalendarToday sx={{ color: '#999' }} /></InputAdornment> }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ fontFamily: 'Amaranth, sans-serif' }}>Gender</InputLabel>
                  <Select name="gender" value={profileForm.gender}
                    onChange={(e) => setProfileForm((p) => ({ ...p, gender: e.target.value }))}
                    label="Gender" sx={{ fontFamily: 'Amaranth, sans-serif', borderRadius: '12px' }}
                    startAdornment={<InputAdornment position="start"><Wc sx={{ color: '#999', ml: 1 }} /></InputAdornment>}>
                    <MenuItem value="" sx={{ fontFamily: 'Amaranth, sans-serif' }}>Select gender</MenuItem>
                    <MenuItem value="male" sx={{ fontFamily: 'Amaranth, sans-serif' }}>Male</MenuItem>
                    <MenuItem value="female" sx={{ fontFamily: 'Amaranth, sans-serif' }}>Female</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" startIcon={<Save />} onClick={handleProfileSubmit} disabled={loading}
                sx={{ fontFamily: 'Amaranth, sans-serif', bgcolor: '#141010', color: '#f2f9f1', '&:hover': { bgcolor: '#2a2a2a' } }}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Paper>
        </motion.div>
      )}

      {/* Tab 1: Change Password */}
      {tabValue === 1 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Paper sx={{ p: 4, borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', maxWidth: 500 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: alpha('#141010', 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <VpnKey sx={{ color: '#141010', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#141010' }}>Change Password</Typography>
                <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.85rem', color: '#666' }}>Update your account password</Typography>
              </Box>
            </Box>

            <TextField fullWidth label="Current Password" type="password" value={passwordForm.currentPassword}
              onChange={(e) => { setPasswordForm((p) => ({ ...p, currentPassword: e.target.value })); setPasswordErrors((p) => ({ ...p, currentPassword: '' })); }}
              error={!!passwordErrors.currentPassword} helperText={passwordErrors.currentPassword}
              sx={textFieldStyle} InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#999' }} /></InputAdornment> }} />
            <TextField fullWidth label="New Password" type="password" value={passwordForm.newPassword}
              onChange={(e) => { setPasswordForm((p) => ({ ...p, newPassword: e.target.value })); setPasswordErrors((p) => ({ ...p, newPassword: '' })); }}
              error={!!passwordErrors.newPassword} helperText={passwordErrors.newPassword || 'Min 6 characters'}
              sx={textFieldStyle} InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#999' }} /></InputAdornment> }} />
            <TextField fullWidth label="Confirm New Password" type="password" value={passwordForm.confirmPassword}
              onChange={(e) => { setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value })); setPasswordErrors((p) => ({ ...p, confirmPassword: '' })); }}
              error={!!passwordErrors.confirmPassword} helperText={passwordErrors.confirmPassword}
              sx={textFieldStyle} InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#999' }} /></InputAdornment> }} />

            <Button variant="contained" startIcon={<Security />} onClick={handlePasswordSubmit} disabled={loading} fullWidth
              sx={{ mt: 2, fontFamily: 'Amaranth, sans-serif', bgcolor: '#141010', color: '#f2f9f1', '&:hover': { bgcolor: '#2a2a2a' } }}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </Paper>
        </motion.div>
      )}

      {/* Tab 2: User Management (Admin only) */}
      {tabValue === 2 && currentUser?.role === 'admin' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Paper sx={{ p: 2, mb: 3, borderRadius: '12px', display: 'flex', gap: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <TextField placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} size="small"
              sx={{ flex: 1, minWidth: 200, '& .MuiOutlinedInput-root': { fontFamily: 'Amaranth, sans-serif', borderRadius: '8px' } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: '#999' }} /></InputAdornment> }} />
            <Tooltip title="Refresh" arrow>
              <IconButton onClick={fetchUsers} sx={{ border: '1px solid #141010', borderRadius: '8px', color: '#141010' }}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Paper>

          <Paper sx={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            {tableLoading && <LinearProgress />}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f2f9f1' }}>
                    {['User', 'Email', 'Role', 'Gender', 'Status', 'Actions'].map((h) => (
                      <TableCell key={h} sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#141010' }} align={h === 'Actions' ? 'center' : 'left'}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                    <TableRow key={user.id} sx={{ '&:hover': { bgcolor: alpha('#141010', 0.02) } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: getRoleColor(user.role), fontFamily: 'Amaranth, sans-serif', fontWeight: 700, fontSize: '0.8rem' }}>
                            {getInitials(user.name)}
                          </Avatar>
                          <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 600, color: '#141010' }}>{user.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.85rem', color: '#666' }}>{user.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={user.role} size="small" icon={user.role === 'admin' ? <Shield /> : <Person />}
                          sx={{ fontFamily: 'Amaranth, sans-serif', bgcolor: alpha(getRoleColor(user.role), 0.1), color: getRoleColor(user.role), fontWeight: 600 }} />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.85rem', color: '#666', textTransform: 'capitalize' }}>{user.gender || 'N/A'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={user.isActive !== false ? 'Active' : 'Inactive'} size="small"
                          sx={{ fontFamily: 'Amaranth, sans-serif', bgcolor: user.isActive !== false ? alpha('#4caf50', 0.1) : alpha('#e70000', 0.1), color: user.isActive !== false ? '#4caf50' : '#e70000', fontWeight: 600 }} />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="Edit User"><IconButton onClick={() => handleEditUser(user)} size="small" sx={{ color: '#141010' }}><Edit fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Delete User"><IconButton onClick={() => handleDeleteConfirm(user.id, user.name)} size="small" sx={{ color: '#e70000' }}><Delete fontSize="small" /></IconButton></Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={filteredUsers.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ fontFamily: 'Amaranth, sans-serif', '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { fontFamily: 'Amaranth, sans-serif' } }} />
          </Paper>
        </motion.div>
      )}

      {/* Edit User Dialog */}
      <Dialog open={editUserDialog.open} onClose={() => setEditUserDialog({ open: false, user: null })} PaperProps={{ sx: { borderRadius: '16px', fontFamily: 'Amaranth, sans-serif' } }}>
        <DialogTitle sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Edit User
          <IconButton onClick={() => setEditUserDialog({ open: false, user: null })} size="small"><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Name" value={editUserForm.name} onChange={(e) => setEditUserForm((p) => ({ ...p, name: e.target.value }))} sx={textFieldStyle} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Email" type="email" value={editUserForm.email} onChange={(e) => setEditUserForm((p) => ({ ...p, email: e.target.value }))} sx={textFieldStyle} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontFamily: 'Amaranth, sans-serif' }}>Role</InputLabel>
                <Select value={editUserForm.role} onChange={(e) => setEditUserForm((p) => ({ ...p, role: e.target.value }))} label="Role" sx={{ fontFamily: 'Amaranth, sans-serif', borderRadius: '12px' }}>
                  <MenuItem value="user" sx={{ fontFamily: 'Amaranth, sans-serif' }}>User</MenuItem>
                  <MenuItem value="admin" sx={{ fontFamily: 'Amaranth, sans-serif' }}>Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel control={<Switch checked={editUserForm.isActive} onChange={(e) => setEditUserForm((p) => ({ ...p, isActive: e.target.checked }))} />}
                label={<Typography sx={{ fontFamily: 'Amaranth, sans-serif' }}>Active</Typography>} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setEditUserDialog({ open: false, user: null })} sx={{ fontFamily: 'Amaranth, sans-serif', color: '#666' }}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateUser} disabled={loading}
            sx={{ fontFamily: 'Amaranth, sans-serif', bgcolor: '#141010', color: '#f2f9f1', '&:hover': { bgcolor: '#2a2a2a' } }}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })} PaperProps={{ sx: { borderRadius: '16px', fontFamily: 'Amaranth, sans-serif' } }}>
        <DialogTitle sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning sx={{ color: '#ff9800' }} /> Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: 'Amaranth, sans-serif' }}>Are you sure you want to delete user <strong>{deleteConfirm.name}</strong>?</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteConfirm({ open: false, id: null, name: '' })} sx={{ fontFamily: 'Amaranth, sans-serif', color: '#666' }}>Cancel</Button>
          <Button variant="contained" onClick={handleDeleteUser} disabled={loading} startIcon={<Delete />}
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

const textFieldStyle = {
  mb: 2.5,
  '& .MuiOutlinedInput-root': {
    fontFamily: 'Amaranth, sans-serif', borderRadius: '12px',
    '& fieldset': { borderColor: '#e0e0e0' },
    '&:hover fieldset': { borderColor: '#141010' },
    '&.Mui-focused fieldset': { borderColor: '#141010', borderWidth: '2px' },
  },
  '& .MuiInputLabel-root': { fontFamily: 'Amaranth, sans-serif', '&.Mui-focused': { color: '#141010' } },
  '& .MuiFormHelperText-root': { fontFamily: 'Amaranth, sans-serif' },
};

export default AdminSettings;