'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Factory as FactoryIcon,
  CheckCircle as CheckCircleIcon,
  LocationOn as LocationIcon,
  Water as WaterIcon,
  ElectricBolt as ElectricBoltIcon,
  Storage as StorageIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Factory } from '@/lib/types/productProduction';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';

interface FactorySelectorProps {
  factories: Factory[];
  selectedFactory: Factory | null;
  onSelectFactory: (factory: Factory) => void;
  loading?: boolean;
  error?: string | null;
}

export const FactorySelector: React.FC<FactorySelectorProps> = ({
  factories,
  selectedFactory,
  onSelectFactory,
  loading = false,
  error = null
}) => {
  const { t } = useTranslation();
  
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return (
      <Box sx={{ py: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Card variant="outlined" sx={{ mt: 2, p: 4, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Card>
    );
  }

  if (factories.length === 0) {
    return (
      <Card variant="outlined" sx={{ mt: 2, p: 4, textAlign: 'center' }}>
        <FactoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {t('productProduction.noFactoriesAvailable')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('productProduction.noFactoriesDescription')}
        </Typography>
      </Card>
    );
  }

  return (
    <Stack spacing={2}>
      {factories.map((factory) => {
        const isSelected = selectedFactory?.id === factory.id;
        const hasWater = factory.infrastructure?.hasWaterConnection;
        const hasPower = factory.infrastructure?.hasPowerConnection;
        const spaceUsage = factory.space?.totalSpace 
          ? (factory.space.usedSpace / factory.space.totalSpace) * 100 
          : 0;
        
        return (
          <Card
            key={factory.id}
            variant={isSelected ? 'elevation' : 'outlined'}
            sx={{
              cursor: 'pointer',
              border: isSelected ? 2 : 1,
              borderColor: isSelected ? 'primary.main' : 'divider',
              '&:hover': {
                boxShadow: 3,
                borderColor: 'primary.light'
              }
            }}
            onClick={() => onSelectFactory(factory)}
          >
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FactoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">{factory.name}</Typography>
                  </Box>
                  {isSelected && <CheckCircleIcon color="primary" />}
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={t('productProduction.level', { level: factory.level })}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    icon={<LocationIcon />}
                    label={`${factory.location?.landType || 'Unknown'} (${factory.location?.q}, ${factory.location?.r})`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    icon={hasWater ? <CheckIcon /> : <CloseIcon />}
                    label={t('productProduction.water')}
                    size="small"
                    color={hasWater ? 'success' : 'error'}
                    variant="outlined"
                  />
                  <Chip
                    icon={hasPower ? <CheckIcon /> : <CloseIcon />}
                    label={t('productProduction.power')}
                    size="small"
                    color={hasPower ? 'success' : 'error'}
                    variant="outlined"
                  />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <StorageIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {t('productProduction.spaceUsage')}: {formatNumber(factory.space?.usedSpace || 0)} / {formatNumber(factory.space?.totalSpace || 0)}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={spaceUsage} 
                    sx={{ height: 8, borderRadius: 1 }}
                    color={spaceUsage > 80 ? 'warning' : 'primary'}
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('productProduction.infrastructureStatus')}
                  </Typography>
                  <List dense disablePadding>
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <WaterIcon 
                          color={hasWater ? 'primary' : 'disabled'} 
                          fontSize="small" 
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          hasWater 
                            ? factory.infrastructure?.waterProvider?.providerName
                            : t('productProduction.notConnected')
                        }
                      />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <ElectricBoltIcon 
                          color={hasPower ? 'primary' : 'disabled'} 
                          fontSize="small" 
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          hasPower 
                            ? factory.infrastructure?.powerProvider?.providerName
                            : t('productProduction.notConnected')
                        }
                      />
                    </ListItem>
                  </List>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
};