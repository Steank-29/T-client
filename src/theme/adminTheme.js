import { createTheme } from '@mui/material/styles';

const adminTheme = (mode = 'light') =>
  createTheme({
    palette: {
      mode,
      background: {
        default: mode === 'light' ? '#f2f9f1' : '#141010',
        paper: mode === 'light' ? '#fcfefe' : '#1a1a1a',
      },
      text: {
        primary: '#141010',
        secondary: '#141010',
      },
      primary: {
        main: '#141010',
        light: '#f2f9f1',
        contrastText: '#f2f9f1',
      },
      secondary: {
        main: '#fcfefe',
        contrastText: '#141010',
      },
      error: {
        main: '#e70000',
      },
    },
    typography: {
      fontFamily: 'Amaranth, sans-serif',
      allVariants: {
        color: '#141010',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: mode === 'light' ? '#f2f9f1' : '#141010',
            color: '#141010',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          contained: {
            backgroundColor: '#141010',
            color: '#f2f9f1',
            borderRadius: 12,
            padding: '8px 20px',
            fontWeight: 600,
            textTransform: 'none',
            fontFamily: 'Amaranth, sans-serif',
            '&:hover': {
              backgroundColor: '#2a2a2a',
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 30px rgba(20, 16, 16, 0.35)',
            },
          },
          outlined: {
            borderRadius: 12,
            padding: '8px 20px',
            fontWeight: 600,
            textTransform: 'none',
            fontFamily: 'Amaranth, sans-serif',
          },
          text: {
            fontFamily: 'Amaranth, sans-serif',
            textTransform: 'none',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            border: 'none',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            marginBottom: 4,
            transition: 'all 0.2s ease',
            fontFamily: 'Amaranth, sans-serif',
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          primary: {
            fontFamily: 'Amaranth, sans-serif',
          },
          secondary: {
            fontFamily: 'Amaranth, sans-serif',
          },
        },
      },
      MuiBadge: {
        styleOverrides: {
          badge: {
            fontWeight: 700,
            fontFamily: 'Amaranth, sans-serif',
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            fontFamily: 'Amaranth, sans-serif',
            fontWeight: 700,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontFamily: 'Amaranth, sans-serif',
            fontSize: '0.8rem',
            backgroundColor: '#141010',
            color: '#f2f9f1',
          },
          arrow: {
            color: '#141010',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            fontFamily: 'Amaranth, sans-serif',
            '& .MuiInputLabel-root': {
              fontFamily: 'Amaranth, sans-serif',
            },
            '& .MuiOutlinedInput-root': {
              fontFamily: 'Amaranth, sans-serif',
              borderRadius: 12,
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            fontFamily: 'Amaranth, sans-serif',
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontFamily: 'Amaranth, sans-serif',
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            fontFamily: 'Amaranth, sans-serif',
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            fontFamily: 'Amaranth, sans-serif',
            borderRadius: 12,
          },
        },
      },
      MuiSnackbar: {
        styleOverrides: {
          root: {
            fontFamily: 'Amaranth, sans-serif',
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: 'all 0.2s ease',
          },
        },
      },
    },
  });

export default adminTheme;