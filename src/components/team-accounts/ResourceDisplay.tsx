'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import TeamAccountService from '@/lib/services/teamAccountService';

interface ResourceDisplayProps {
  gold: number;
  carbon: number;
  layout?: 'horizontal' | 'vertical' | 'compact';
  showLabels?: boolean;
  showIcons?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'chip' | 'card';
  className?: string;
}

/**
 * Reusable Resource Display Component
 * Shows gold and carbon resources in various layouts and styles
 */
function ResourceDisplay({
  gold,
  carbon,
  layout = 'horizontal',
  showLabels = true,
  showIcons = true,
  size = 'medium',
  variant = 'default',
  className = ''
}: ResourceDisplayProps) {
  const { t } = useTranslation();

  const sizeClasses = {
    small: {
      container: 'gap-2',
      icon: 'text-lg',
      text: 'text-sm',
      label: 'text-xs'
    },
    medium: {
      container: 'gap-3',
      icon: 'text-xl',
      text: 'text-base',
      label: 'text-sm'
    },
    large: {
      container: 'gap-4',
      icon: 'text-2xl',
      text: 'text-lg',
      label: 'text-base'
    }
  };

  const classes = sizeClasses[size];

  const ResourceItem = ({ 
    amount, 
    type, 
    icon 
  }: { 
    amount: number; 
    type: 'gold' | 'carbon'; 
    icon: string; 
  }) => {
    const color = TeamAccountService.getResourceColor(amount, type);
    const formattedAmount = TeamAccountService.formatResourceAmount(amount);
    const label = t(`teamAccounts.${type.toUpperCase()}`);

    if (variant === 'chip') {
      return (
        <Chip
          icon={showIcons ? <IdeomniSvgIcon className={`${classes.icon} ${color}`}>{icon}</IdeomniSvgIcon> : undefined}
          label={
            <Box className="flex items-center gap-1">
              {showLabels && (
                <Typography variant="caption" className={classes.label}>
                  {label}:
                </Typography>
              )}
              <Typography variant="body2" className={`font-mono font-bold ${color}`}>
                {formattedAmount}
              </Typography>
            </Box>
          }
          variant="outlined"
          size={size === 'large' ? 'medium' : 'small'}
        />
      );
    }

    if (variant === 'card') {
      return (
        <Box className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
          {showIcons && (
            <IdeomniSvgIcon className={`${classes.icon} ${color} mb-2`}>
              {icon}
            </IdeomniSvgIcon>
          )}
          {showLabels && (
            <Typography variant="caption" color="textSecondary" className={`block ${classes.label}`}>
              {label}
            </Typography>
          )}
          <Typography variant={size === 'large' ? 'h6' : 'body1'} className={`font-mono font-bold ${color}`}>
            {formattedAmount}
          </Typography>
        </Box>
      );
    }

    // Default variant
    const containerClass = layout === 'vertical' ? 'flex-col items-center' : 'flex-row items-center';
    
    return (
      <Box className={`flex ${containerClass} ${classes.container}`}>
        {showIcons && (
          <IdeomniSvgIcon className={`${classes.icon} ${color}`}>
            {icon}
          </IdeomniSvgIcon>
        )}
        <Box className={layout === 'vertical' ? 'text-center' : 'flex-1'}>
          {showLabels && (
            <Typography variant="caption" color="textSecondary" className={`block ${classes.label}`}>
              {label}
            </Typography>
          )}
          <Typography variant={classes.text} className={`font-mono font-bold ${color}`}>
            {formattedAmount}
          </Typography>
        </Box>
      </Box>
    );
  };

  const containerClass = layout === 'horizontal' ? 'flex-row' : 
                         layout === 'vertical' ? 'flex-col' : 
                         'flex-row flex-wrap';

  return (
    <Box className={`flex ${containerClass} ${classes.container} ${className}`}>
      <ResourceItem 
        amount={gold} 
        type="gold" 
        icon="heroicons-solid:currency-dollar" 
      />
      <ResourceItem 
        amount={carbon} 
        type="carbon" 
        icon="heroicons-solid:leaf" 
      />
    </Box>
  );
}

export default ResourceDisplay;