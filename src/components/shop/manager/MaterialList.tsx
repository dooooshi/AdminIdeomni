'use client';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Chip,
  Grid,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Skeleton,
  Tooltip,
  Badge,
  Button,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  LocalOffer as PriceIcon,
  Inventory2 as StockIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '@/store/store';
import {
  selectFilteredMaterials,
  updateFilter,
  clearFilters,
  removeMaterial,
  selectMaterial,
} from '@/store/shopSlice';
import { MaterialOrigin } from '@/types/shop';
import UpdatePriceModal from './UpdatePriceModal';
import RemoveMaterialConfirm from './RemoveMaterialConfirm';
import ShopService from '@/lib/services/shopService';

const originColors: Record<MaterialOrigin, string> = {
  [MaterialOrigin.MINE]: '#8B4513',
  [MaterialOrigin.QUARRY]: '#696969',
  [MaterialOrigin.FOREST]: '#228B22',
  [MaterialOrigin.FARM]: '#90EE90',
  [MaterialOrigin.RANCH]: '#FF6347',
  [MaterialOrigin.FISHERY]: '#4682B4',
  [MaterialOrigin.SHOPS]: '#FF69B4',
  [MaterialOrigin.FACTORY]: '#708090',
  [MaterialOrigin.OTHER]: '#808080',
};

export default function MaterialList() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const materials = useSelector(selectFilteredMaterials);
  const { materialsLoading, filters } = useSelector((state: RootState) => state.shop);

  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);

  const handleEditPrice = (materialId: number) => {
    setSelectedMaterialId(materialId);
    setPriceModalOpen(true);
  };

  const handleRemove = (materialId: number) => {
    setSelectedMaterialId(materialId);
    setRemoveConfirmOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (selectedMaterialId) {
      await dispatch(removeMaterial(selectedMaterialId));
      setRemoveConfirmOpen(false);
      setSelectedMaterialId(null);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateFilter({ key: 'searchTerm', value: event.target.value }));
  };

  const handleOriginFilter = (origin: MaterialOrigin | '') => {
    dispatch(updateFilter({ key: 'origin', value: origin || null }));
  };

  const renderMaterialCard = (material: any) => {
    const remainingStock = ShopService.getRemainingStock(material);
    const stockPercentage = material.quantityToSell
      ? ((material.quantityToSell - material.quantitySold) / material.quantityToSell) * 100
      : 100;

    return (
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={material.id}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flexGrow: 1 }}>
            {/* Material Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h6" component="div" gutterBottom>
                  {material.material.nameEn}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {material.material.nameZh}
                </Typography>
              </Box>
              <Chip
                label={t(`shop.ORIGIN_${material.material.origin}`)}
                size="small"
                sx={{
                  backgroundColor: originColors[material.material.origin as MaterialOrigin],
                  color: 'white',
                }}
              />
            </Box>

            {/* Material Details */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {/* Price */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PriceIcon fontSize="small" color="primary" />
                <Typography variant="h5" color="primary" fontWeight="bold">
                  {ShopService.formatPrice(material.unitPrice)} g
                </Typography>
              </Box>

              {/* Stock */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StockIcon fontSize="small" color="action" />
                {material.quantityToSell ? (
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body2" color="textSecondary">
                      {material.quantitySold} / {material.quantityToSell} sold
                    </Typography>
                    <Box
                      sx={{
                        mt: 0.5,
                        height: 4,
                        backgroundColor: 'grey.300',
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          width: `${100 - stockPercentage}%`,
                          backgroundColor: stockPercentage > 20 ? 'success.main' : 'error.main',
                          transition: 'width 0.3s',
                        }}
                      />
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    {t('shop.UNLIMITED')}
                  </Typography>
                )}
              </Box>

              {/* Material Number */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CategoryIcon fontSize="small" color="action" />
                <Typography variant="body2" color="textSecondary">
                  Material #{material.material.materialNumber}
                </Typography>
              </Box>
            </Box>

            {/* Last Updated */}
            {material.lastPriceSetAt && (
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2 }}>
                {t('shop.DATE')}: {new Date(material.lastPriceSetAt).toLocaleDateString()}
              </Typography>
            )}
          </CardContent>

          <CardActions sx={{ justifyContent: 'flex-end' }}>
            <Tooltip title={t('shop.UPDATE_PRICE')}>
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleEditPrice(material.id)}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('shop.REMOVE_MATERIAL')}>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleRemove(material.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </CardActions>
        </Card>
      </Grid>
    );
  };

  return (
    <Box>
      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder={t('shop.SEARCH_MATERIALS')}
          value={filters.searchTerm || ''}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t('shop.ORIGIN')}</InputLabel>
          <Select
            value={filters.origin || ''}
            label={t('shop.ORIGIN')}
            onChange={(e) => handleOriginFilter(e.target.value as MaterialOrigin | '')}
          >
            <MenuItem value="">{t('shop.ALL_ORIGINS')}</MenuItem>
            {Object.values(MaterialOrigin).map((origin) => (
              <MenuItem key={origin} value={origin}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: originColors[origin],
                    }}
                  />
                  {t(`shop.ORIGIN_${origin}`)}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {(filters.searchTerm || filters.origin) && (
          <Button
            size="small"
            onClick={() => dispatch(clearFilters())}
            startIcon={<FilterIcon />}
          >
            {t('shop.CLEAR_FILTERS')}
          </Button>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Typography variant="body2" color="textSecondary">
          {t('shop.SHOWING_RESULTS', { count: materials.length })}
        </Typography>
      </Box>

      {/* Materials Grid */}
      {materialsLoading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={n}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="rectangular" height={60} sx={{ mt: 2 }} />
                  <Skeleton variant="text" width="80%" sx={{ mt: 2 }} />
                </CardContent>
                <CardActions>
                  <Skeleton variant="circular" width={32} height={32} />
                  <Skeleton variant="circular" width={32} height={32} />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : materials.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {t('shop.NO_MATERIALS')}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {filters.searchTerm || filters.origin
                ? t('shop.CLEAR_FILTERS')
                : t('shop.ADD_MATERIAL')}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {materials.map(renderMaterialCard)}
        </Grid>
      )}

      {/* Modals */}
      {selectedMaterialId && (
        <>
          <UpdatePriceModal
            open={priceModalOpen}
            onClose={() => {
              setPriceModalOpen(false);
              setSelectedMaterialId(null);
            }}
            materialId={selectedMaterialId}
          />
          <RemoveMaterialConfirm
            open={removeConfirmOpen}
            onClose={() => {
              setRemoveConfirmOpen(false);
              setSelectedMaterialId(null);
            }}
            onConfirm={handleConfirmRemove}
            material={materials.find((m) => m.id === selectedMaterialId)}
          />
        </>
      )}
    </Box>
  );
}