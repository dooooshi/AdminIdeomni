'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, ChipProps } from '@mui/material';
import {
  Schedule as PendingIcon,
  CheckCircle as SignedIcon,
  Cancel as RejectedIcon
} from '@mui/icons-material';
import { ContractStatus } from '@/types/contract';

interface ContractStatusBadgeProps {
  status: ContractStatus | string; // Accept both enum and string values from API
  size?: 'small' | 'medium';
  showIcon?: boolean;
}

const ContractStatusBadge: React.FC<ContractStatusBadgeProps> = ({ 
  status, 
  size = 'small',
  showIcon = true 
}) => {
  const { t } = useTranslation();

  // Get status configuration
  const getStatusConfig = (): {
    label: string;
    color: ChipProps['color'];
    icon?: React.ReactElement;
  } => {
    // Handle both string status from API and enum values
    const statusStr = String(status).toUpperCase();
    
    if (statusStr === 'PENDING_APPROVAL' || status === ContractStatus.PENDING_APPROVAL) {
      return {
        label: t('contract.STATUS_PENDING_APPROVAL'),
        color: 'warning',
        icon: showIcon ? <PendingIcon /> : undefined
      };
    }

    if (statusStr === 'SIGNED' || status === ContractStatus.SIGNED) {
      return {
        label: t('contract.STATUS_SIGNED'),
        color: 'success',
        icon: showIcon ? <SignedIcon /> : undefined
      };
    }

    if (statusStr === 'REJECTED' || status === ContractStatus.REJECTED) {
      return {
        label: t('contract.STATUS_REJECTED'),
        color: 'error',
        icon: showIcon ? <RejectedIcon /> : undefined
      };
    }
    
    // Default case
    return {
      label: status as string,
      color: 'default',
      icon: undefined
    };
  };

  const config = getStatusConfig();

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      icon={config.icon}
      variant="filled"
    />
  );
};

export default ContractStatusBadge;