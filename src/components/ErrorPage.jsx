// pages/ErrorPage.jsx - Full i18n Integration
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Container, Typography, Button } from '@mui/material';
import { Home, ArrowBack } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ErrorPage = () => {
  const { t, i18n } = useTranslation(['common']);
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';

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
        direction: isRTL ? 'rtl' : 'ltr',
      }}
    >
      {/* Background Decorations */}
      <Box
        sx={{
          position: 'absolute',
          top: -150,
          right: isRTL ? 'auto' : -150,
          left: isRTL ? -150 : 'auto',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(195,25,25,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -100,
          left: isRTL ? 'auto' : -100,
          right: isRTL ? -100 : 'auto',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(20,16,16,0.03) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Box sx={{ textAlign: 'center' }}>
            {/* 404 Number */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Typography
                sx={{
                  fontFamily: isRTL ? '"Noto Kufi Arabic", "Tajawal", sans-serif' : 'Amaranth, sans-serif',
                  fontSize: { xs: '8rem', md: '12rem' },
                  fontWeight: 900,
                  color: '#141010',
                  lineHeight: 1,
                  mb: 1,
                  position: 'relative',
                  display: 'inline-block',
                }}
              >
                {t('error.code', '404')}
              </Typography>
            </motion.div>

            {/* Red accent line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 4,
                  bgcolor: '#c31919',
                  borderRadius: '2px',
                  mx: 'auto',
                  mb: 3,
                }}
              />
            </motion.div>

            {/* Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Typography
                sx={{
                  fontFamily: isRTL ? '"Noto Kufi Arabic", "Tajawal", sans-serif' : 'Amaranth, sans-serif',
                  fontSize: { xs: '1.4rem', md: '1.8rem' },
                  fontWeight: 700,
                  color: '#141010',
                  mb: 1,
                }}
              >
                {t('error.title', 'Page Not Found')}
              </Typography>

              <Typography
                sx={{
                  fontFamily: isRTL ? '"Noto Kufi Arabic", "Tajawal", sans-serif' : 'Amaranth, sans-serif',
                  fontSize: '1rem',
                  color: '#888',
                  mb: 5,
                  maxWidth: 400,
                  mx: 'auto',
                  lineHeight: 1.6,
                }}
              >
                {t('error.message', "The page you're looking for doesn't exist or has been moved. Let's get you back on track.")}
              </Typography>
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <Button
                variant="contained"
                startIcon={isRTL ? null : <Home />}
                endIcon={isRTL ? <Home /> : null}
                onClick={() => navigate('/')}
                sx={{
                  bgcolor: '#141010',
                  color: '#ffffff',
                  fontFamily: isRTL ? '"Noto Kufi Arabic", "Tajawal", sans-serif' : 'Amaranth, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  px: 4,
                  py: 1.3,
                  borderRadius: '40px',
                  '&:hover': {
                    bgcolor: '#c31919',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(195,25,25,0.3)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {t('error.goHome', 'Go Home')}
              </Button>

              <Button
                variant="outlined"
                startIcon={isRTL ? null : <ArrowBack sx={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />}
                endIcon={isRTL ? <ArrowBack sx={{ transform: 'rotate(180deg)' }} /> : null}
                onClick={() => navigate(-1)}
                sx={{
                  borderColor: '#141010',
                  color: '#141010',
                  fontFamily: isRTL ? '"Noto Kufi Arabic", "Tajawal", sans-serif' : 'Amaranth, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  px: 4,
                  py: 1.3,
                  borderRadius: '40px',
                  borderWidth: '2px',
                  '&:hover': {
                    borderColor: '#c31919',
                    color: '#c31919',
                    borderWidth: '2px',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(195,25,25,0.1)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {t('error.goBack', 'Go Back')}
              </Button>
            </motion.div>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ErrorPage;