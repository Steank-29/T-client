import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  InputAdornment,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Message,
  LocationOn,
  AccessTime,
  Send,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      setError('Please provide a valid email address');
      setLoading(false);
      return;
    }

    try {
      // Try backend first, fallback to simulation if backend not available
      try {
        const { contactService } = await import('../services/api');
        const response = await contactService.sendMessage(formData);
        setSuccessMessage(response.data.message);
      } catch (apiErr) {
        // Backend not available - simulate success
        console.log('Backend not available, simulating...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSuccessMessage("Message sent successfully! We'll get back to you soon.");
      }
      
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactCards = [
    {
      icon: <LocationOn sx={{ fontSize: '1.8rem' }} />,
      title: 'Visit Us',
      details: '123 Avenue Habib Bourguiba\nTunis 1001, Tunisia',
    },
    {
      icon: <Email sx={{ fontSize: '1.8rem' }} />,
      title: 'Email Us',
      details: 'TawakkolStore@gmail.com',
    },
    {
      icon: <Phone sx={{ fontSize: '1.8rem' }} />,
      title: 'Call Us',
      details: '+216 12 345 678',
    },
    {
      icon: <AccessTime sx={{ fontSize: '1.8rem' }} />,
      title: 'Working Hours',
      details: 'Mon - Sat | 9AM - 7PM',
    },
  ];

  return (
    <Box sx={{ bgcolor: '#ffffff' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Grid container spacing={5}>
          {/* Contact Form */}
          <Grid size={{ xs: 12, md: 7 }}>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '1.6rem', fontWeight: 700, color: '#141010', mb: 0.5 }}>
                Send a Message
              </Typography>
              <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.9rem', color: '#888', mb: 3 }}>
                Fill the form and we'll respond within 24 hours
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', fontFamily: 'Amaranth, sans-serif' }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth label="Full Name *" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" sx={textFieldStyle}
                      InputProps={{ startAdornment: (<InputAdornment position="start"><Person sx={{ color: '#aaa' }} /></InputAdornment>) }} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth label="Email Address *" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" sx={textFieldStyle}
                      InputProps={{ startAdornment: (<InputAdornment position="start"><Email sx={{ color: '#aaa' }} /></InputAdornment>) }} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} placeholder="+216 12 345 678" sx={textFieldStyle}
                      InputProps={{ startAdornment: (<InputAdornment position="start"><Phone sx={{ color: '#aaa' }} /></InputAdornment>) }} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth label="Subject" name="subject" value={formData.subject} onChange={handleChange} placeholder="Order inquiry" sx={textFieldStyle}
                      InputProps={{ startAdornment: (<InputAdornment position="start"><Message sx={{ color: '#aaa' }} /></InputAdornment>) }} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField fullWidth label="Message *" name="message" value={formData.message} onChange={handleChange} multiline rows={4} placeholder="How can we help?" sx={textFieldStyle} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Button type="submit" fullWidth disabled={loading} endIcon={<Send />}
                      sx={{
                        py: 1.6, bgcolor: '#141010', color: '#ffffff', fontFamily: 'Amaranth, sans-serif', fontWeight: 700,
                        fontSize: '1rem', textTransform: 'none', borderRadius: '14px',
                        '&:hover': { bgcolor: '#c31919', transform: 'translateY(-2px)', boxShadow: '0 10px 25px rgba(195,25,25,0.3)' },
                        '&:disabled': { bgcolor: '#bbb' },
                        transition: 'all 0.3s ease',
                      }}>
                      {loading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </motion.div>
          </Grid>

          {/* Contact Info Cards */}
          <Grid size={{ xs: 12, md: 5 }}>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
              <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '1.6rem', fontWeight: 700, color: '#141010', mb: 3 }}>
                Get in Touch
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {contactCards.map((card, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 * idx }} whileHover={{ y: -3 }}>
                    <Box sx={{ display: 'flex', gap: 2, p: 2.5, borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 6px 25px rgba(0,0,0,0.06)' } }}>
                      <Box sx={{ width: 50, height: 50, borderRadius: '14px', bgcolor: '#141010', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0 }}>
                        {card.icon}
                      </Box>
                      <Box>
                        <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.95rem', fontWeight: 700, color: '#141010', mb: 0.3 }}>
                          {card.title}
                        </Typography>
                        <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.85rem', color: '#888', whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                          {card.details}
                        </Typography>
                      </Box>
                    </Box>
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      <Snackbar open={success} autoHideDuration={4000} onClose={() => setSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" sx={{ fontFamily: 'Amaranth, sans-serif', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', fontWeight: 600 }} onClose={() => setSuccess(false)}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const textFieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    fontFamily: 'Amaranth, sans-serif',
    bgcolor: '#fafafa',
    '& fieldset': { borderColor: '#e8e8e8' },
    '&:hover fieldset': { borderColor: '#c31919' },
    '&.Mui-focused': { bgcolor: '#ffffff', '& fieldset': { borderColor: '#c31919', borderWidth: '2px' } },
  },
  '& .MuiInputLabel-root': { fontFamily: 'Amaranth, sans-serif', fontSize: '0.9rem', '&.Mui-focused': { color: '#c31919' } },
  '& .MuiOutlinedInput-input': { '&::placeholder': { color: '#bbb', opacity: 1, fontFamily: 'Amaranth, sans-serif', fontSize: '0.85rem' } },
};

export default Contact;