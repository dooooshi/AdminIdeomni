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
  Grid,
  Divider,
  Chip,
  Stack,
  Paper,
  IconButton,
  Avatar,
} from '@mui/material';
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
  const { t, locale } = useTranslation();
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
          borderRadius: 2,
          backgroundImage: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #37474f 0%, #455a64 100%)'
            : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              bgcolor: theme.palette.mode === 'dark' 
                ? alpha(theme.palette.primary.main, 0.3)
                : theme.palette.primary.main,
              width: 45, 
              height: 45 
            }}>
              {getOriginIcon(material.origin)}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {t('rawMaterial.details')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                #{material.materialNumber} • {locale === 'zh' ? material.nameZh : material.nameEn}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {material.isDeleted && (
              <Chip label={t('common.deleted')} color="error" size="small" />
            )}
            {!material.isDeleted && !material.isActive && (
              <Chip label={t('common.inactive')} color="default" size="small" />
            )}
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Header Section */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ 
              p: 2, 
              bgcolor: theme.palette.mode === 'dark' 
                ? alpha(theme.palette.primary.main, 0.08)
                : alpha(theme.palette.primary.main, 0.04),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h4" gutterBottom>
                    #{material.materialNumber}
                  </Typography>
                  <Typography variant="h5" gutterBottom>
                    {locale === 'zh' ? material.nameZh : material.nameEn}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {locale === 'zh' ? material.nameEn : material.nameZh}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Box sx={{ color: getOriginColor(material.origin), display: 'flex' }}>
                      {getOriginIcon(material.origin)}
                    </Box>
                    <Typography variant="h6">
                      {t(`rawMaterial.origin.${material.origin}`)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Economic Data */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom color="primary">
              {t('rawMaterial.economicData')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ 
              p: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
              border: `1px solid ${theme.palette.divider}`,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <MoneyIcon color="primary" />
                <Typography variant="subtitle2">{t('rawMaterial.totalCost')}</Typography>
              </Box>
              <Typography variant="h4">{material.totalCost}</Typography>
              <Typography variant="caption" color="text.secondary">
                {t('rawMaterial.units')}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ 
              p: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
              border: `1px solid ${theme.palette.divider}`,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <MoneyIcon color="warning" />
                <Typography variant="subtitle2">{t('rawMaterial.goldCost')}</Typography>
              </Box>
              <Typography variant="h4">{material.goldCost}</Typography>
              <Typography variant="caption" color="text.secondary">
                {((material.goldCost / material.totalCost) * 100).toFixed(1)}% {t('rawMaterial.ofTotal')}
              </Typography>
            </Paper>
          </Grid>

          {/* Resource Requirements */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom color="primary">
              {t('rawMaterial.resourceRequirements')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ 
              p: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
              border: `1px solid ${theme.palette.divider}`,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <WaterIcon color="primary" />
                <Typography variant="subtitle2">{t('rawMaterial.waterRequired')}</Typography>
              </Box>
              <Typography variant="h4">{material.waterRequired}</Typography>
              <Typography variant="caption" color="text.secondary">
                {t('rawMaterial.units')}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ 
              p: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
              border: `1px solid ${theme.palette.divider}`,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <BoltIcon color="warning" />
                <Typography variant="subtitle2">{t('rawMaterial.powerRequired')}</Typography>
              </Box>
              <Typography variant="h4">{material.powerRequired}</Typography>
              <Typography variant="caption" color="text.secondary">
                {t('rawMaterial.units')}
              </Typography>
            </Paper>
          </Grid>

          {/* Environmental Impact */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom color="primary">
              {t('rawMaterial.environmentalImpact')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ 
              p: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
              border: `1px solid ${theme.palette.divider}`,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <EcoIcon color="success" />
                <Typography variant="subtitle2">{t('rawMaterial.carbonEmission')}</Typography>
              </Box>
              <Typography variant="h4">{material.carbonEmission}</Typography>
              <Typography variant="caption" color="text.secondary">
                {t('rawMaterial.carbonUnits')}
              </Typography>
            </Paper>
          </Grid>


          {/* Resource Breakdown */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom color="primary">
              {t('rawMaterial.resourceBreakdown')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={0} sx={{ 
              p: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
              border: `1px solid ${theme.palette.divider}`,
            }}>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    {t('rawMaterial.waterCost')}
                  </Typography>
                  <Typography variant="body1">
                    {((material.waterRequired / material.totalCost) * 100).toFixed(1)}%
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    {t('rawMaterial.powerCost')}
                  </Typography>
                  <Typography variant="body1">
                    {((material.powerRequired / material.totalCost) * 100).toFixed(1)}%
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    {t('rawMaterial.goldRatio')}
                  </Typography>
                  <Typography variant="body1">
                    {((material.goldCost / material.totalCost) * 100).toFixed(1)}%
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    {t('rawMaterial.carbonPerCost')}
                  </Typography>
                  <Typography variant="body1">
                    {(material.carbonEmission / material.totalCost).toFixed(4)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Metadata */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom color="primary">
              {t('rawMaterial.metadata')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={0} sx={{ 
              p: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
              border: `1px solid ${theme.palette.divider}`,
            }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TimeIcon fontSize="small" />
                    <Typography variant="caption" color="text.secondary">
                      {t('rawMaterial.createdAt')}
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {new Date(material.createdAt).toLocaleString(locale)}
                  </Typography>
                  {material.createdBy && (
                    <Typography variant="caption" color="text.secondary">
                      {t('common.by')}: {material.createdBy}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TimeIcon fontSize="small" />
                    <Typography variant="caption" color="text.secondary">
                      {t('rawMaterial.updatedAt')}
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {new Date(material.updatedAt).toLocaleString(locale)}
                  </Typography>
                  {material.lastModifiedBy && (
                    <Typography variant="caption" color="text.secondary">
                      {t('common.by')}: {material.lastModifiedBy}
                    </Typography>
                  )}
                </Grid>
                {material.isDeleted && material.deletedAt && (
                  <>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <TimeIcon fontSize="small" color="error" />
                        <Typography variant="caption" color="error">
                          {t('rawMaterial.deletedAt')}
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        {new Date(material.deletedAt).toLocaleString(locale)}
                      </Typography>
                      {material.deletedBy && (
                        <Typography variant="caption" color="text.secondary">
                          {t('common.by')}: {material.deletedBy}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      {material.deletionReason && (
                        <>
                          <Typography variant="caption" color="error">
                            {t('rawMaterial.deletionReason')}
                          </Typography>
                          <Typography variant="body2">
                            {material.deletionReason}
                          </Typography>
                        </>
                      )}
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ 
        p: 3, 
        bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
        borderTop: `1px solid ${theme.palette.divider}`,
      }}>
        {isSuperAdmin && onViewHistory && (
          <Button
            onClick={() => onViewHistory(material)}
            startIcon={<HistoryIcon />}
            sx={{ minWidth: 120 }}
          >
            {t('rawMaterial.viewHistory')}
          </Button>
        )}
        {isSuperAdmin && onEdit && !material.isDeleted && (
          <Button
            onClick={() => onEdit(material)}
            startIcon={<EditIcon />}
            variant="outlined"
            sx={{ minWidth: 100 }}
          >
            {t('common.edit')}
          </Button>
        )}
        <Button 
          onClick={onClose} 
          variant="contained"
          sx={{ 
            minWidth: 100,
            backgroundImage: theme.palette.mode === 'dark'
              ? 'linear-gradient(45deg, #37474f 30%, #455a64 90%)'
              : 'linear-gradient(45deg, #9e9e9e 30%, #757575 90%)',
          }}
        >
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RawMaterialDetailsDialog;