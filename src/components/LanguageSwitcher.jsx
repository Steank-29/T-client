import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Menu, MenuItem, Box, Typography } from '@mui/material';
import { Language } from '@mui/icons-material';

const languages = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ar', label: 'العربية', flag: '🇹🇳', dir: 'rtl' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const changeLanguage = (code, dir) => {
    i18n.changeLanguage(code);
    document.documentElement.dir = dir || 'ltr';
    document.documentElement.lang = code;
    localStorage.setItem('language', code);
    handleClose();
  };

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  return (
    <Box>
      <Button
        onClick={handleClick}
        startIcon={<Language />}
        sx={{
          fontFamily: 'Amaranth, sans-serif',
          color: '#141010',
          fontSize: '0.8rem',
          textTransform: 'none',
        }}
      >
        {currentLang.flag} {currentLang.label}
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code, lang.dir)}
            selected={i18n.language === lang.code}
            sx={{ fontFamily: 'Amaranth, sans-serif', gap: 1 }}
          >
            <span>{lang.flag}</span> {lang.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default LanguageSwitcher;