import React from 'react';
import { Button, IconButton, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface LanguageSwitcherProps {
  variant?: 'button' | 'icon';
  size?: 'small' | 'medium';
}

const languages = [
  { code: 'en-US', label: 'English', flag: '🇺🇸' },
  { code: 'zh-CN', label: '中文', flag: '🇨🇳' }
];

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'button',
  size = 'medium'
}) => {
  const { i18n } = useTranslation();
  
  const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0];
  
  const handleClick = () => {
    const newLang = i18n.language === 'en-US' ? 'zh-CN' : 'en-US';
    i18n.changeLanguage(newLang);
    // Explicitly save to localStorage to ensure persistence
    localStorage.setItem('language', newLang);
  };

  if (variant === 'icon') {
    return (
      <Tooltip title={`Switch to ${i18n.language === 'en-US' ? '中文' : 'English'}`}>
        <IconButton onClick={handleClick} size={size}>
          {currentLang.flag}
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Button
      onClick={handleClick}
      size={size}
      startIcon={<span>{currentLang.flag}</span>}
    >
      {currentLang.label}
    </Button>
  );
};