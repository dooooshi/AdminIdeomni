import React from 'react';
import { Button, Menu, MenuItem, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';

interface LanguageSwitcherProps {
  variant?: 'button' | 'menu' | 'chip';
  size?: 'small' | 'medium';
}

/**
 * Language switcher component
 */
export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'button',
  size = 'medium'
}) => {
  const { t } = useTranslation('common');
  const { currentLanguage, changeLanguage } = useLanguage();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const languages = [
    { code: 'en-US', label: 'English', flag: '🇺🇸' },
    { code: 'zh-CN', label: '中文', flag: '🇨🇳' }
  ];

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (variant === 'menu') {
      setAnchorEl(event.currentTarget);
    } else {
      // Simple toggle for button/chip variants
      const newLang = currentLanguage === 'en-US' ? 'zh-CN' : 'en-US';
      changeLanguage(newLang);
    }
  };

  const handleMenuItemClick = (langCode: string) => {
    changeLanguage(langCode);
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (variant === 'chip') {
    return (
      <Chip
        label={`${currentLang.flag} ${currentLang.label}`}
        onClick={handleClick}
        size={size}
        clickable
      />
    );
  }

  return (
    <>
      <Button
        onClick={handleClick}
        size={size}
        startIcon={<span>{currentLang.flag}</span>}
      >
        {currentLang.label}
      </Button>
      
      {variant === 'menu' && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {languages.map((lang) => (
            <MenuItem
              key={lang.code}
              onClick={() => handleMenuItemClick(lang.code)}
              selected={lang.code === currentLanguage}
            >
              <span style={{ marginRight: 8 }}>{lang.flag}</span>
              {lang.label}
            </MenuItem>
          ))}
        </Menu>
      )}
    </>
  );
};

/**
 * Flag-only language switcher
 */
export const FlagLanguageSwitcher: React.FC = () => {
  return <LanguageSwitcher variant="chip" size="small" />;
};

/**
 * Compact language switcher
 */
export const CompactLanguageSwitcher: React.FC = () => {
  return <LanguageSwitcher variant="button" size="small" />;
};