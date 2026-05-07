import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import logo from '../assets/MainL.png';

const SplashScreen = ({ onFinish }) => {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out at 2 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2000);

    // Finish loading at 2.5 seconds
    const finishTimer = setTimeout(() => {
      setLoading(false);
      onFinish();
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  if (!loading) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        bgcolor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.5s ease-in-out',
      }}
    >
      {/* Logo as Spinner */}
      <Box
        component="img"
        src={logo}
        alt="Tawakkul"
        sx={{
          width: '160px',
          height: 'auto',
          animation: 'logoSpinner 1.5s ease-in-out infinite',
          '@keyframes logoSpinner': {
            '0%': {
              transform: 'scale(1) rotate(0deg)',
              opacity: 0.7,
            },
            '25%': {
              transform: 'scale(1.1) rotate(5deg)',
              opacity: 1,
            },
            '50%': {
              transform: 'scale(1) rotate(0deg)',
              opacity: 0.7,
            },
            '75%': {
              transform: 'scale(1.1) rotate(-5deg)',
              opacity: 1,
            },
            '100%': {
              transform: 'scale(1) rotate(0deg)',
              opacity: 0.7,
            },
          },
        }}
      />
    </Box>
  );
};

export default SplashScreen;