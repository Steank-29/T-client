import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  Snackbar,
  Link,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  ArrowForward,
  Person,
  CalendarToday,
  Wc,
  Shield,
  Star,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/api';
import { saveAuthData } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [forgotPassword, setForgotPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (forgotPassword) {
      if (!formData.dateOfBirth) {
        setError('Please enter your date of birth for verification');
        setLoading(false);
        return;
      }
    }

    if (isSignUp) {
      if (!formData.name) {
        setError('Please enter your full name');
        setLoading(false);
        return;
      }
      if (!formData.dateOfBirth) {
        setError('Please enter your date of birth');
        setLoading(false);
        return;
      }
      if (!formData.gender) {
        setError('Please select your gender');
        setLoading(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
    }

    try {
      if (forgotPassword) {
        // Forgot Password API call
        const response = await authService.forgotPassword({
          email: formData.email,
          dateOfBirth: formData.dateOfBirth
        });
        setSuccessMessage(response.data.message || 'Reset link sent! Check your email.');
        setSuccess(true);
        setForgotPassword(false);
      } else if (isSignUp) {
        // Sign Up API call
        const response = await authService.signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender
        });
        
        // Use utility function to save auth data
        saveAuthData(response.data.token, response.data.user);
        
        setSuccessMessage(response.data.message || 'Account created! Welcome to Tawakkol!');
        setSuccess(true);
        
        // Redirect to home after short delay
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        // Sign In API call
        const response = await authService.signin({
          email: formData.email,
          password: formData.password
        });
        
        // Use utility function to save auth data
        saveAuthData(response.data.token, response.data.user);
        
        setSuccessMessage(response.data.message || 'Welcome back!');
        setSuccess(true);
        
        // Redirect based on user role
        setTimeout(() => {
          if (response.data.user?.role === 'admin') {
            window.location.href = '/admin';
          } else {
            navigate('/');
          }
        }, 1500);
      }
      
      // Reset form
      setFormData({ 
        name: '', 
        email: '', 
        password: '', 
        confirmPassword: '', 
        dateOfBirth: '', 
        gender: '' 
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setFormData({ 
      name: '', 
      email: '', 
      password: '', 
      confirmPassword: '', 
      dateOfBirth: '', 
      gender: '' 
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        py: { xs: 4, md: 0 },
      }}
    >
      {/* Background Decorations */}
      <Box
        sx={{
          position: 'absolute',
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(195,25,25,0.03) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(20,16,16,0.02) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Typography
              sx={{
                fontFamily: 'Amaranth, sans-serif',
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                fontWeight: 900,
                color: '#141010',
                letterSpacing: { xs: '3px', md: '6px' },
                lineHeight: 1,
                mb: 1,
              }}
            >
              TAWAKKOL
            </Typography>
          </motion.div>
          
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}
          >
            <Box sx={{ width: 60, height: 4, bgcolor: '#c31919', borderRadius: '2px' }} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Typography
              sx={{
                fontFamily: 'Amaranth, sans-serif',
                fontSize: { xs: '0.9rem', md: '1.1rem' },
                fontWeight: 500,
                color: '#888',
                letterSpacing: '1px',
              }}
            >
              WAY OF LIVING NOT JUST BRAND
            </Typography>
          </motion.div>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            style={{ width: '100%', maxWidth: 480 }}
          >
            <AnimatePresence mode="wait">
              {forgotPassword ? (
                <motion.div key="forgot" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
                  <Box sx={{ bgcolor: '#ffffff', borderRadius: '28px', p: { xs: 3, sm: 5 }, boxShadow: '0 20px 60px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #c31919, #e63946, #c31919)' } }}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                      <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} style={{ display: 'inline-block' }}>
                        <Shield sx={{ fontSize: '3rem', color: '#c31919', mb: 1.5 }} />
                      </motion.div>
                      <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '1.6rem', fontWeight: 700, color: '#141010', mb: 0.5 }}>Reset Password</Typography>
                      <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.9rem', color: '#888', lineHeight: 1.6 }}>Verify your identity to reset your password</Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', fontFamily: 'Amaranth, sans-serif' }} onClose={() => setError('')}>{error}</Alert>}

                    <Box component="form" onSubmit={handleSubmit}>
                      <TextField fullWidth label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="your@email.com" sx={textFieldStyle} InputProps={{ startAdornment: (<InputAdornment position="start"><Email sx={{ color: '#aaa' }} /></InputAdornment>) }} />
                      <TextField fullWidth name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required sx={textFieldStyle} InputLabelProps={{ shrink: true }} InputProps={{ startAdornment: (<InputAdornment position="start"><CalendarToday sx={{ color: '#aaa' }} /></InputAdornment>) }} />

                      <Button type="submit" fullWidth disabled={loading} endIcon={<ArrowForward />} sx={submitButtonStyle}>
                        {loading ? 'Verifying...' : 'Verify & Reset Password'}
                      </Button>

                      <Button fullWidth onClick={() => { setForgotPassword(false); setError(''); }} sx={{ mt: 2.5, fontFamily: 'Amaranth, sans-serif', color: '#888', textTransform: 'none', fontWeight: 500, fontSize: '0.9rem', '&:hover': { color: '#141010', bgcolor: 'transparent' } }}>
                        ← Back to Sign In
                      </Button>
                    </Box>
                  </Box>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
                  <Box sx={{ bgcolor: '#ffffff', borderRadius: '28px', p: { xs: 3, sm: 5 }, boxShadow: '0 20px 60px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #c31919, #e63946, #c31919)' } }}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                      <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: '#141010', mb: 0.5 }}>
                        {isSignUp ? 'Create Your Account' : 'Welcome Back'}
                      </Typography>
                      <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.9rem', color: '#888' }}>
                        {isSignUp ? 'Join the premium community' : 'Sign in to continue'}
                      </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', fontFamily: 'Amaranth, sans-serif' }} onClose={() => setError('')}>{error}</Alert>}

                    <Box component="form" onSubmit={handleSubmit}>
                      {isSignUp && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.4 }}>
                          <TextField fullWidth label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" sx={textFieldStyle} InputProps={{ startAdornment: (<InputAdornment position="start"><Person sx={{ color: '#aaa' }} /></InputAdornment>) }} />
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <TextField fullWidth name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} sx={textFieldStyle} InputLabelProps={{ shrink: true }} InputProps={{ startAdornment: (<InputAdornment position="start"><CalendarToday sx={{ color: '#aaa', fontSize: '1.1rem' }} /></InputAdornment>) }} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <FormControl fullWidth sx={{ ...textFieldStyle }}>
                                <InputLabel sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.9rem', '&.Mui-focused': { color: '#c31919' } }}>Gender</InputLabel>
                                <Select name="gender" value={formData.gender} onChange={handleChange} label="Gender" displayEmpty startAdornment={<InputAdornment position="start"><Wc sx={{ color: '#aaa', mr: 1 }} /></InputAdornment>} sx={{ borderRadius: '12px', fontFamily: 'Amaranth, sans-serif', bgcolor: '#fafafa', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e8e8e8' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#c31919' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#c31919', borderWidth: '2px' } }}>
                                  <MenuItem value="" disabled><Typography sx={{ fontFamily: 'Amaranth, sans-serif', color: '#bbb' }}>Select gender</Typography></MenuItem>
                                  <MenuItem value="male"><Typography sx={{ fontFamily: 'Amaranth, sans-serif' }}>Male</Typography></MenuItem>
                                  <MenuItem value="female"><Typography sx={{ fontFamily: 'Amaranth, sans-serif' }}>Female</Typography></MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                          </Grid>
                        </motion.div>
                      )}

                      <TextField fullWidth label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="your@email.com" sx={textFieldStyle} InputProps={{ startAdornment: (<InputAdornment position="start"><Email sx={{ color: '#aaa' }} /></InputAdornment>) }} />

                      <TextField fullWidth label="Password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} required placeholder="••••••••" sx={textFieldStyle} InputProps={{ startAdornment: (<InputAdornment position="start"><Lock sx={{ color: '#aaa' }} /></InputAdornment>), endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />

                      {isSignUp && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.4 }}>
                          <TextField fullWidth label="Confirm Password" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" sx={textFieldStyle} InputProps={{ startAdornment: (<InputAdornment position="start"><Lock sx={{ color: '#aaa' }} /></InputAdornment>), endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small">{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />
                        </motion.div>
                      )}

                      {!isSignUp && (
                        <Box sx={{ textAlign: 'right', mb: 3 }}>
                          <Link component="button" onClick={() => { setForgotPassword(true); setError(''); }} sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.85rem', color: '#c31919', textDecoration: 'none', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
                            Forgot Password?
                          </Link>
                        </Box>
                      )}

                      <Button type="submit" fullWidth disabled={loading} endIcon={<ArrowForward />} sx={submitButtonStyle}>
                        {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
                      </Button>

                      <Box sx={{ textAlign: 'center', mt: 3.5 }}>
                        <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.9rem', color: '#888' }}>
                          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                          <Link component="button" onClick={toggleMode} sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#c31919', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                          </Link>
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 4, pt: 3, borderTop: '1px solid #f0f0f0' }}>
                        {[{ icon: <Shield sx={{ fontSize: '1rem' }} />, text: 'Secure' }, { icon: <Star sx={{ fontSize: '1rem' }} />, text: 'Premium' }, { icon: <Lock sx={{ fontSize: '1rem' }} />, text: 'Encrypted' }].map((badge, idx) => (
                          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#bbb' }}>
                            {badge.icon}
                            <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.75rem', color: '#bbb' }}>{badge.text}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </Box>
      </Container>

      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" sx={{ fontFamily: 'Amaranth, sans-serif', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', fontWeight: 600 }} onClose={() => setSuccess(false)}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const textFieldStyle = {
  mb: 2.5,
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    fontFamily: 'Amaranth, sans-serif',
    bgcolor: '#fafafa',
    transition: 'all 0.3s ease',
    '& fieldset': { borderColor: '#e8e8e8' },
    '&:hover fieldset': { borderColor: '#c31919' },
    '&.Mui-focused': { bgcolor: '#ffffff', '& fieldset': { borderColor: '#c31919', borderWidth: '2px' } },
  },
  '& .MuiInputLabel-root': { fontFamily: 'Amaranth, sans-serif', fontSize: '0.9rem', '&.Mui-focused': { color: '#c31919' } },
  '& .MuiOutlinedInput-input': { '&::placeholder': { color: '#bbb', opacity: 1, fontFamily: 'Amaranth, sans-serif', fontSize: '0.85rem' } },
};

const submitButtonStyle = {
  mt: 1, py: 1.7, bgcolor: '#141010', color: '#ffffff', fontFamily: 'Amaranth, sans-serif', fontWeight: 700, fontSize: '1rem', textTransform: 'none', borderRadius: '14px', letterSpacing: '0.5px', position: 'relative', overflow: 'hidden',
  '&::after': { content: '""', position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)', transition: 'left 0.6s ease' },
  '&:hover': { bgcolor: '#c31919', transform: 'translateY(-2px)', boxShadow: '0 12px 30px rgba(195,25,25,0.35)', '&::after': { left: '200%' } },
  '&:disabled': { bgcolor: '#bbb', color: '#eee' },
  transition: 'all 0.3s ease',
};

export default Login;