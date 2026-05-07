import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    background: {
      default: '#f2f9f1',
      paper: '#fcfefe',
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
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f2f9f1',
          color: '#141010',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: '#141010',
          color: '#f2f9f1',
          '&:hover': {
            backgroundColor: '#2a2a2a',
          },
        },
      },
    },
  },
});

export default theme;