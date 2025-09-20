'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,

  Divider,
  Chip,
  Stack,
  Paper,
  IconButton,
  Avatar,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { useTheme, alpha } from '@mui/material/styles';
import {
  Close as CloseIcon,
  Factory as FactoryIcon,
  Park as ParkIcon,
  Agriculture as AgricultureIcon,
  Water as WaterIcon,
  Bolt as BoltIcon,
  AttachMoney as MoneyIcon,
  Nature as EcoIcon,
  Science as ScienceIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import {
  RawMaterial,
  RawMaterialOrigin,
} from '@/lib/types/rawMaterial';

interface RawMaterialDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  material: RawMaterial | null;
  onEdit?: (material: RawMaterial) => void;
  onViewHistory?: (material: RawMaterial) => void;
  isSuperAdmin?: boolean;
}

const RawMaterialDetailsDialog: React.FC<RawMaterialDetailsDialogProps> = ({
  open,
  onClose,
  material,
  onEdit,
  onViewHistory,
  isSuperAdmin = false,
}) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const theme = useTheme();

  if (!material) return null;

  // Get origin icon
  const getOriginIcon = (origin: RawMaterialOrigin) => {
    switch (origin) {
      case RawMaterialOrigin.MINE:
        return <FactoryIcon />;
      case RawMaterialOrigin.QUARRY:
        return <ScienceIcon />;
      case RawMaterialOrigin.FOREST:
        return <ParkIcon />;
      case RawMaterialOrigin.FARM:
      case RawMaterialOrigin.RANCH:
        return <AgricultureIcon />;
      case RawMaterialOrigin.FISHERY:
        return <WaterIcon />;
      case RawMaterialOrigin.SHOPS:
        return <MoneyIcon />;
      default:
        return null;
    }
  };


  // Get origin color
  const getOriginColor = (origin: RawMaterialOrigin) => {
    const isDark = theme.palette.mode === 'dark';
    switch (origin) {
      case RawMaterialOrigin.MINE: return isDark ? '#8D6E63' : '#795548';
      case RawMaterialOrigin.QUARRY: return isDark ? '#78909C' : '#607D8B';
      case RawMaterialOrigin.FOREST: return isDark ? '#66BB6A' : '#4CAF50';
      case RawMaterialOrigin.FARM: return isDark ? '#9CCC65' : '#8BC34A';
      case RawMaterialOrigin.RANCH: return isDark ? '#FFA726' : '#FF9800';
      case RawMaterialOrigin.FISHERY: return isDark ? '#26C6DA' : '#00BCD4';
      case RawMaterialOrigin.SHOPS: return isDark ? '#AB47BC' : '#9C27B0';
      default: return isDark ? '#BDBDBD' : '#9E9E9E';
    }
  };


  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 0,
          boxShadow: 'none',
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          px: 3,
          py: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 400, color: theme.palette.text.primary }}>
              {locale === 'zh' ? material.nameZh : material.nameEn}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
              #{material.materialNumber} • {t(`rawMaterial.origin.${material.origin}`)}
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose} 
            size="small"
            sx={{ 
              color: theme.palette.text.secondary,
              '&:hover': { 
                backgroundColor: alpha(theme.palette.text.secondary, 0.1)
              }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {/* Overview Section */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {t('rawMaterial.totalCost')}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 300 }}>
                    {material.totalCost}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {t('rawMaterial.goldCost')}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 300 }}>
                    {material.goldCost} ({((material.goldCost / material.totalCost) * 100).toFixed(0)}%)
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {t('rawMaterial.origin')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                  {getOriginIcon(material.origin)}
                  <Typography variant="body1">
                    {t(`rawMaterial.origin.${material.origin}`)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Resource Details */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
            {t('rawMaterial.resourceRequirements')}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {t('rawMaterial.waterRequired')}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 300 }}>
                  {material.waterRequired}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {t('rawMaterial.powerRequired')}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 300 }}>
                  {material.powerRequired}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Environmental Impact */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
            {t('rawMaterial.environmentalImpact')}
          </Typography>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {t('rawMaterial.carbonEmission')}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 300 }}>
              {material.carbonEmission} {t('rawMaterial.carbonUnits')}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Resource Breakdown */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
            {t('rawMaterial.resourceBreakdown')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {t('rawMaterial.waterCost')}
                </Typography>
                <Typography variant="body1">
                  {((material.waterRequired / material.totalCost) * 100).toFixed(1)}%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {t('rawMaterial.powerCost')}
                </Typography>
                <Typography variant="body1">
                  {((material.powerRequired / material.totalCost) * 100).toFixed(1)}%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {t('rawMaterial.goldRatio')}
                </Typography>
                <Typography variant="body1">
                  {((material.goldCost / material.totalCost) * 100).toFixed(1)}%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {t('rawMaterial.carbonPerCost')}
                </Typography>
                <Typography variant="body1">
                  {(material.carbonEmission / material.totalCost).toFixed(4)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Metadata */}
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
            {t('rawMaterial.metadata')}
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {t('rawMaterial.createdAt')}
              </Typography>
              <Typography variant="body1">
                {new Date(material.createdAt).toLocaleString(locale)}
                {material.createdBy && (
                  <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    · {material.createdBy}
                  </Typography>
                )}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {t('rawMaterial.updatedAt')}
              </Typography>
              <Typography variant="body1">
                {new Date(material.updatedAt).toLocaleString(locale)}
                {material.lastModifiedBy && (
                  <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    · {material.lastModifiedBy}
                  </Typography>
                )}
              </Typography>
            </Box>
            
            {material.isDeleted && material.deletedAt && (
              <Box>
                <Typography variant="body2" color="error" sx={{ mb: 0.5 }}>
                  {t('rawMaterial.deletedAt')}
                </Typography>
                <Typography variant="body1" color="error">
                  {new Date(material.deletedAt).toLocaleString(locale)}
                  {material.deletedBy && (
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      · {material.deletedBy}
                    </Typography>
                  )}
                </Typography>
                {material.deletionReason && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                    "{material.deletionReason}"
                  </Typography>
                )}
              </Box>
            )}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions 
        sx={{ 
          px: 3,
          py: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          gap: 1,
          justifyContent: 'flex-end',
        }}
      >
        {isSuperAdmin && onViewHistory && (
          <Button
            onClick={() => onViewHistory(material)}
            startIcon={<HistoryIcon />}
            variant="text"
            size="small"
            sx={{ 
              color: theme.palette.text.secondary,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: alpha(theme.palette.text.secondary, 0.1),
              }
            }}
          >
            {t('rawMaterial.viewHistory')}
          </Button>
        )}
        {isSuperAdmin && onEdit && !material.isDeleted && (
          <Button
            onClick={() => onEdit(material)}
            startIcon={<EditIcon />}
            variant="text"
            size="small"
            sx={{ 
              color: theme.palette.text.secondary,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: alpha(theme.palette.text.secondary, 0.1),
              }
            }}
          >
            {t('common.edit')}
          </Button>
        )}
        <Button 
          onClick={onClose} 
          variant="contained"
          size="small"
          sx={{ 
            backgroundColor: theme.palette.text.primary,
            color: theme.palette.background.paper,
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: alpha(theme.palette.text.primary, 0.8),
              boxShadow: 'none',
            }
          }}
        >
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RawMaterialDetailsDialog;