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
  Button,
  Chip,
  Grid,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  GridView as GridViewIcon,
  ViewList as ListViewIcon,
  ShoppingCart as CartIcon,
  LocalOffer as PriceIcon,
  Inventory2 as StockIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '@/store/store';
import {
  selectFilteredMaterials,
  updateFilter,
  clearFilters,
  selectMaterial,
} from '@/store/shopSlice';
import { MaterialOrigin } from '@/types/shop';
import PurchaseDialog from './PurchaseDialog';
import ShopService from '@/lib/services/shopService';

interface ShopCatalogProps {}

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

export default function ShopCatalog({}: ShopCatalogProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const materials = useSelector(selectFilteredMaterials);
  const { materialsLoading, filters } = useSelector((state: RootState) => state.shop);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);

  const handlePurchase = (materialId: number) => {
    const material = materials.find(m => m.id === materialId);
    if (material) {
      dispatch(selectMaterial(material));
      setSelectedMaterialId(materialId);
      setPurchaseDialogOpen(true);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateFilter({ key: 'searchTerm', value: event.target.value }));
  };

  const handleOriginFilter = (origin: MaterialOrigin | '') => {
    dispatch(updateFilter({ key: 'origin', value: origin || null }));
  };

  const handlePriceFilter = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseFloat(value) : null;
    dispatch(updateFilter({ key: type === 'min' ? 'minPrice' : 'maxPrice', value: numValue }));
  };

  const renderMaterialCard = (material: any) => {
    const remainingStock = ShopService.getRemainingStock(material);
    const isInStock = remainingStock === null || remainingStock > 0;

    return (
      <Grid size={viewMode === 'grid' ? { xs: 12, sm: 6, md: 4, lg: 3 } : { xs: 12 }} key={material.id}>
        <Card sx={{
          height: viewMode === 'grid' ? '100%' : 'auto',
          display: 'flex',
          flexDirection: viewMode === 'grid' ? 'column' : 'row',
          opacity: isInStock ? 1 : 0.6,
        }}>
          <CardContent sx={{
            flexGrow: 1,
            display: viewMode === 'list' ? 'flex' : 'block',
            alignItems: viewMode === 'list' ? 'center' : 'normal',
            gap: viewMode === 'list' ? 3 : 0,
          }}>
            {/* Material Header */}
            <Box sx={{ flex: viewMode === 'list' ? '0 0 250px' : 'auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: viewMode === 'grid' ? 2 : 0 }}>
                <Box>
                  <Typography variant="h6" component="div" gutterBottom={viewMode === 'grid'}>
                    {material.material.nameEn}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {material.material.nameZh}
                  </Typography>
                </Box>
                {viewMode === 'grid' && (
                  <Chip
                    label={t(`shop.ORIGIN_${material.material.origin}`)}
                    size="small"
                    sx={{
                      backgroundColor: originColors[material.material.origin as MaterialOrigin],
                      color: 'white',
                    }}
                  />
                )}
              </Box>
            </Box>

            {/* Material Details */}
            <Box sx={{
              display: 'flex',
              flexDirection: viewMode === 'list' ? 'row' : 'column',
              gap: viewMode === 'list' ? 4 : 1.5,
              flex: viewMode === 'list' ? 1 : 'auto',
            }}>
              {/* Origin (List View) */}
              {viewMode === 'list' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={t(`shop.ORIGIN_${material.material.origin}`)}
                    size="small"
                    sx={{
                      backgroundColor: originColors[material.material.origin as MaterialOrigin],
                      color: 'white',
                    }}
                  />
                </Box>
              )}

              {/* Price */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PriceIcon fontSize="small" color="primary" />
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {ShopService.formatPrice(material.unitPrice)} g
                </Typography>
              </Box>

              {/* Stock */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StockIcon fontSize="small" color="action" />
                {material.quantityToSell ? (
                  <Box>
                    <Typography variant="body2" color={isInStock ? 'textSecondary' : 'error'}>
                      {remainingStock} / {material.quantityToSell} {t('shop.AVAILABLE')}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="success.main">
                    {t('shop.IN_STOCK')}
                  </Typography>
                )}
              </Box>

              {/* Material Number */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CategoryIcon fontSize="small" color="action" />
                <Typography variant="body2" color="textSecondary">
                  {t('shop.MATERIAL_NUMBER', { number: material.material.materialNumber })}
                </Typography>
              </Box>
            </Box>
          </CardContent>

          <CardActions sx={{
            justifyContent: viewMode === 'list' ? 'flex-end' : 'center',
            px: viewMode === 'list' ? 3 : 2,
          }}>
            <Button
              variant="contained"
              startIcon={<CartIcon />}
              onClick={() => handlePurchase(material.id)}
              disabled={!isInStock}
              fullWidth={viewMode === 'grid'}
            >
              {!isInStock ? t('shop.OUT_OF_STOCK') : t('shop.PURCHASE')}
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  };

  return (
    <Box>
      {/* Filters and View Mode */}
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

        <TextField
          size="small"
          type="number"
          placeholder={t('shop.MIN_PRICE')}
          value={filters.minPrice || ''}
          onChange={(e) => handlePriceFilter('min', e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start">≥</InputAdornment>,
          }}
          sx={{ width: 120 }}
        />

        <TextField
          size="small"
          type="number"
          placeholder={t('shop.MAX_PRICE')}
          value={filters.maxPrice || ''}
          onChange={(e) => handlePriceFilter('max', e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start">≤</InputAdornment>,
          }}
          sx={{ width: 120 }}
        />

        {(filters.searchTerm || filters.origin || filters.minPrice || filters.maxPrice) && (
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
          {t('shop.MATERIALS_AVAILABLE', { count: materials.length, plural: materials.length !== 1 ? 's' : '' })}
        </Typography>

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, newMode) => newMode && setViewMode(newMode)}
          size="small"
        >
          <ToggleButton value="grid">
            <GridViewIcon />
          </ToggleButton>
          <ToggleButton value="list">
            <ListViewIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Materials Display */}
      {materialsLoading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Grid size={viewMode === 'grid' ? { xs: 12, sm: 6, md: 4, lg: 3 } : { xs: 12 }} key={n}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="rectangular" height={60} sx={{ mt: 2 }} />
                </CardContent>
                <CardActions>
                  <Skeleton variant="rectangular" width="100%" height={36} />
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
              {filters.searchTerm || filters.origin || filters.minPrice || filters.maxPrice
                ? t('shop.TRY_ADJUSTING_FILTERS')
                : t('shop.CHECK_BACK_LATER')}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {materials.map(renderMaterialCard)}
        </Grid>
      )}

      {/* Purchase Dialog */}
      <PurchaseDialog
        open={purchaseDialogOpen}
        onClose={() => {
          setPurchaseDialogOpen(false);
          setSelectedMaterialId(null);
        }}
      />
    </Box>
  );
}