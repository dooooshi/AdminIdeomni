'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  InputAdornment,
  FormControlLabel,
  Switch,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  TablePagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Collapse,
  Grid,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Category as CategoryIcon,
  AttachMoney as PriceIcon,
  Inventory as StockIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '@/store/store';
import { addMaterial, fetchMaterials, fetchAvailableRawMaterials } from '@/store/shopSlice';
import { MaterialOrigin, RawMaterial } from '@/types/shop';
import ShopService from '@/lib/services/shopService';

interface AddMaterialDialogProps {
  open: boolean;
  onClose: () => void;
}

interface MaterialRowData {
  material: RawMaterial;
  unitPrice: string;
  hasQuantityLimit: boolean;
  quantityToSell: string;
  expanded: boolean;
}

const originColors: Record<string, string> = {
  MINE: '#8B4513',
  QUARRY: '#696969',
  FOREST: '#228B22',
  FARM: '#90EE90',
  RANCH: '#FF6347',
  FISHERY: '#4682B4',
  SHOPS: '#FF69B4',
  FACTORY: '#708090',
  OTHER: '#808080',
};

export default function AddMaterialDialog({ open, onClose }: AddMaterialDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { availableRawMaterials, rawMaterialsLoading, rawMaterialsError } = useSelector(
    (state: RootState) => state.shop || {}
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [originFilter, setOriginFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Material data state
  const [materialsData, setMaterialsData] = useState<Map<number, MaterialRowData>>(new Map());

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setSearchTerm('');
      setOriginFilter('');
      setPage(0);
      setError(null);
      setSuccessMessage(null);
      setMaterialsData(new Map());
    } else {
      // Fetch available raw materials when dialog opens
      dispatch(fetchAvailableRawMaterials());
    }
  }, [open, dispatch]);

  useEffect(() => {
    // Initialize materials data when raw materials are loaded
    if (availableRawMaterials && availableRawMaterials.length > 0) {
      const initialData = new Map<number, MaterialRowData>();
      availableRawMaterials.forEach(material => {
        initialData.set(material.id, {
          material,
          unitPrice: '',
          hasQuantityLimit: false,
          quantityToSell: '',
          expanded: false,
        });
      });
      setMaterialsData(initialData);
    }
  }, [availableRawMaterials]);

  // Filter materials
  const filteredMaterials = useMemo(() => {
    let filtered = Array.from(materialsData.values());

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(({ material }) =>
        material.name.toLowerCase().includes(term) ||
        material.nameZh?.toLowerCase().includes(term) ||
        material.nameEn?.toLowerCase().includes(term) ||
        material.materialNumber.toString().includes(term)
      );
    }

    if (originFilter) {
      filtered = filtered.filter(({ material }) => material.origin === originFilter);
    }

    return filtered;
  }, [materialsData, searchTerm, originFilter]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const updateMaterialData = (id: number, updates: Partial<MaterialRowData>) => {
    setMaterialsData(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(id);
      if (existing) {
        newMap.set(id, { ...existing, ...updates });
      }
      return newMap;
    });
  };

  const handleAddMaterial = async (data: MaterialRowData) => {
    // Get the material name (handle both formats)
    const materialName = data.material.name || data.material.nameZh || data.material.nameEn || 'Material';

    // Validation
    const price = parseFloat(data.unitPrice);
    if (isNaN(price) || price <= 0) {
      setError(`Invalid price for ${materialName}`);
      return;
    }

    if (data.hasQuantityLimit) {
      const quantity = parseInt(data.quantityToSell);
      if (isNaN(quantity) || quantity <= 0) {
        setError(`Invalid quantity for ${materialName}`);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Adding material:', {
        materialNumber: data.material.materialNumber,
        name: materialName,
        unitPrice: price,
        quantityToSell: data.hasQuantityLimit ? parseInt(data.quantityToSell) : null,
      });

      const payload = {
        rawMaterialId: data.material.materialNumber,
        unitPrice: price,
        quantityToSell: data.hasQuantityLimit ? parseInt(data.quantityToSell) : undefined,
      };

      await dispatch(addMaterial(payload)).unwrap();

      // Clear the data for this material
      updateMaterialData(data.material.id, {
        unitPrice: '',
        quantityToSell: '',
        hasQuantityLimit: false,
        expanded: false,
      });

      setSuccessMessage(`${materialName} added to shop successfully!`);

      // Refresh materials list
      await dispatch(fetchMaterials());

      // Auto-close success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Failed to add material:', err);
      setError(err.message || 'Failed to add material');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (id: number) => {
    setMaterialsData(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(id);
      if (existing) {
        newMap.set(id, { ...existing, expanded: !existing.expanded });
      }
      return newMap;
    });
  };

  const paginatedMaterials = filteredMaterials.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Add Materials to Shop</Typography>
          <Typography variant="body2" color="textSecondary">
            {filteredMaterials.length} materials available
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Alerts */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" onClose={() => setSuccessMessage(null)}>
              {successMessage}
            </Alert>
          )}

          {/* Search and Filters */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1, maxWidth: 400 }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Origin</InputLabel>
              <Select
                value={originFilter}
                label="Origin"
                onChange={(e) => setOriginFilter(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="">All Origins</MenuItem>
                {['MINE', 'QUARRY', 'FOREST', 'FARM', 'RANCH', 'FISHERY', 'SHOPS'].map((origin) => (
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
                      {origin}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Loading State */}
          {rawMaterialsLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Typography variant="body1" color="textSecondary">
                Loading available materials...
              </Typography>
            </Box>
          )}

          {/* Error State */}
          {rawMaterialsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to load materials: {rawMaterialsError}
            </Alert>
          )}

          {/* Materials Table */}
          {!rawMaterialsLoading && (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width={50} />
                  <TableCell>Material</TableCell>
                  <TableCell align="center">Origin</TableCell>
                  <TableCell align="center">Material #</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="center">Stock Limit</TableCell>
                  <TableCell align="center" width={120}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedMaterials.map((data) => {
                  const { material, unitPrice, hasQuantityLimit, quantityToSell, expanded } = data;
                  const isReady = unitPrice && parseFloat(unitPrice) > 0;

                  return (
                    <React.Fragment key={material.id}>
                      <TableRow hover>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => toggleExpanded(material.id)}
                          >
                            {expanded ? <CollapseIcon /> : <ExpandIcon />}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {material.name || material.nameZh}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Material #{material.materialNumber}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={material.origin}
                            size="small"
                            sx={{
                              backgroundColor: originColors[material.origin],
                              color: 'white',
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <CategoryIcon fontSize="small" color="action" />
                            <Typography variant="body2">#{material.materialNumber}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {unitPrice ? (
                            <Typography variant="body2" color="primary" fontWeight="bold">
                              {ShopService.formatPrice(unitPrice)}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              Not set
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {hasQuantityLimit && quantityToSell ? (
                            <Chip label={`${quantityToSell} units`} size="small" variant="outlined" />
                          ) : (
                            <Chip label="Unlimited" size="small" variant="outlined" color="success" />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleAddMaterial(data)}
                            disabled={!isReady || loading}
                          >
                            Add
                          </Button>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Configuration Row */}
                      <TableRow>
                        <TableCell colSpan={7} sx={{ py: 0 }}>
                          <Collapse in={expanded} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 3, backgroundColor: 'grey.50' }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Configure {material.name || material.nameZh}
                              </Typography>
                              <Divider sx={{ mb: 2 }} />

                              <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label="Unit Price"
                                    type="number"
                                    value={unitPrice}
                                    onChange={(e) => updateMaterialData(material.id, { unitPrice: e.target.value })}
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <PriceIcon color="action" />
                                        </InputAdornment>
                                      ),
                                      endAdornment: <InputAdornment position="end"></InputAdornment>,
                                      inputProps: { min: 0.01, step: 0.01 },
                                    }}
                                    helperText="Set the price per unit"
                                  />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <FormControlLabel
                                      control={
                                        <Switch
                                          checked={hasQuantityLimit}
                                          onChange={(e) => updateMaterialData(material.id, {
                                            hasQuantityLimit: e.target.checked,
                                            quantityToSell: e.target.checked ? quantityToSell : '',
                                          })}
                                        />
                                      }
                                      label="Set quantity limit"
                                    />

                                    {hasQuantityLimit && (
                                      <TextField
                                        fullWidth
                                        size="small"
                                        label="Maximum Quantity"
                                        type="number"
                                        value={quantityToSell}
                                        onChange={(e) => updateMaterialData(material.id, { quantityToSell: e.target.value })}
                                        InputProps={{
                                          startAdornment: (
                                            <InputAdornment position="start">
                                              <StockIcon color="action" />
                                            </InputAdornment>
                                          ),
                                          endAdornment: <InputAdornment position="end">units</InputAdornment>,
                                          inputProps: { min: 1, step: 1 },
                                        }}
                                        helperText="Leave blank for unlimited stock"
                                      />
                                    )}
                                  </Box>
                                </Grid>
                              </Grid>

                              {/* Preview */}
                              {unitPrice && (
                                <Box
                                  sx={{
                                    mt: 3,
                                    p: 2,
                                    backgroundColor: 'background.paper',
                                    borderRadius: 1,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                  }}
                                >
                                  <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Preview
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>{material.name || material.nameZh}</strong> (#{material.materialNumber})
                                  </Typography>
                                  <Typography variant="body2" color="primary">
                                    Price: {ShopService.formatPrice(unitPrice)} per unit
                                  </Typography>
                                  {hasQuantityLimit && quantityToSell && (
                                    <Typography variant="body2">
                                      Stock limit: {quantityToSell} units
                                    </Typography>
                                  )}
                                </Box>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })}

                {filteredMaterials.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        No materials found
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Try adjusting your search criteria
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          )}

          {/* Pagination */}
          {filteredMaterials.length > 0 && (
            <TablePagination
              component="div"
              count={filteredMaterials.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}