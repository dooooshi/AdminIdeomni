import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Button,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Divider,
  LinearProgress,
  Stack,
  Fade,
  Skeleton
} from '@mui/material';
import {
  Close as CloseIcon,
  Science as FormulaIcon,
  Map as MapIcon,
  AccountBalance as BudgetIcon,
  CalendarToday as DateIcon,
  Inventory as MaterialIcon,
  Store as StoreIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { MtoType2Service } from '@/lib/services/mtoType2Service';
import { MtoType2RequirementDetails } from '@/lib/types/mtoType2';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`requirement-tabpanel-${index}`}
      aria-labelledby={`requirement-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

interface MtoType2RequirementDetailsModalProps {
  open: boolean;
  requirementId: number | null;
  onClose: () => void;
}

export const MtoType2RequirementDetailsModal: React.FC<MtoType2RequirementDetailsModalProps> = ({
  open,
  requirementId,
  onClose
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<MtoType2RequirementDetails | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (open && requirementId) {
      loadRequirementDetails();
    }
  }, [open, requirementId]);

  const loadRequirementDetails = async () => {
    if (!requirementId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await MtoType2Service.getRequirementDetailsForStudent(requirementId);
      setDetails(data);
    } catch (error) {
      console.error('Error loading requirement details:', error);
      setError(t('mto.type2.student.errorLoadingDetails'));
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatCurrency = (amount: string | number) => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RELEASED':
        return 'info';
      case 'IN_PROGRESS':
        return 'primary';
      case 'SETTLING':
        return 'warning';
      case 'SETTLED':
        return 'success';
      default:
        return 'default';
    }
  };

  const getComplexityColor = (complexity?: string) => {
    switch (complexity) {
      case 'LOW':
        return 'success';
      case 'MEDIUM':
        return 'warning';
      case 'HIGH':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 'none',
          border: '1px solid',
          borderColor: 'divider'
        }
      }}
    >
      {/* Minimalist Header */}
      <Box sx={{
        p: 3,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.default'
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="h5" fontWeight={500}>
              {t('mto.type2.student.requirementDetails')}
            </Typography>
            {details && (
              <Chip
                label={details.status}
                color={getStatusColor(details.status)}
                size="small"
                sx={{
                  borderRadius: 1,
                  fontWeight: 500,
                  letterSpacing: 0.5
                }}
              />
            )}
          </Stack>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {loading && (
          <Box sx={{ p: 6 }}>
            <Stack spacing={3} alignItems="center">
              <Skeleton variant="circular" width={60} height={60} />
              <Skeleton variant="text" width={200} height={32} />
              <Stack spacing={2} width="100%">
                <Skeleton variant="rectangular" height={100} />
                <Skeleton variant="rectangular" height={100} />
              </Stack>
            </Stack>
          </Box>
        )}

        {error && (
          <Box sx={{ p: 3 }}>
            <Alert severity="error" variant="outlined">
              {error}
            </Alert>
          </Box>
        )}

        {!loading && !error && details && (
          <Fade in={true}>
            <Box>
              {/* Minimalist Overview Cards */}
              <Box sx={{ p: 3, bgcolor: 'background.default' }}>
                <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
                  {/* Budget Card */}
                  <Box sx={{
                    flex: 1,
                    p: 2.5,
                    bgcolor: 'background.paper',
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <BudgetIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          {t('mto.type2.student.overallBudget')}
                        </Typography>
                      </Stack>
                      <Typography variant="h5" fontWeight={600}>
                        {formatCurrency(details.overallPurchaseBudget)}
                      </Typography>
                    </Stack>
                  </Box>

                  {/* Date Cards */}
                  <Box sx={{
                    flex: 1,
                    p: 2.5,
                    bgcolor: 'background.paper',
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <DateIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          {t('mto.type2.student.releaseTime')}
                        </Typography>
                      </Stack>
                      <Typography variant="body1" fontWeight={500}>
                        {new Date(details.releaseTime).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(details.releaseTime).toLocaleTimeString()}
                      </Typography>
                    </Stack>
                  </Box>

                  <Box sx={{
                    flex: 1,
                    p: 2.5,
                    bgcolor: 'background.paper',
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <DateIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          {t('mto.type2.student.settlementTime')}
                        </Typography>
                      </Stack>
                      <Typography variant="body1" fontWeight={500}>
                        {new Date(details.settlementTime).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(details.settlementTime).toLocaleTimeString()}
                      </Typography>
                    </Stack>
                  </Box>

                  {/* Tiles Card */}
                  <Box sx={{
                    flex: 1,
                    p: 2.5,
                    bgcolor: 'background.paper',
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <MapIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          {t('mto.type2.student.totalTiles')}
                        </Typography>
                      </Stack>
                      <Typography variant="h5" fontWeight={600}>
                        {details.tileBudgetAllocations.length}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Box>

              {/* Minimalist Tabs */}
              <Box sx={{ px: 3, bgcolor: 'background.paper' }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  sx={{
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 500,
                      fontSize: '0.95rem',
                      minHeight: 56,
                      color: 'text.secondary',
                      '&.Mui-selected': {
                        color: 'text.primary'
                      }
                    },
                    '& .MuiTabs-indicator': {
                      height: 3,
                      borderRadius: '3px 3px 0 0'
                    }
                  }}
                >
                  <Tab
                    label={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <FormulaIcon sx={{ fontSize: 20 }} />
                        <span>{t('mto.type2.student.productFormula')}</span>
                      </Stack>
                    }
                  />
                  <Tab
                    label={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <MapIcon sx={{ fontSize: 20 }} />
                        <span>{t('mto.type2.student.tileBudgets')}</span>
                      </Stack>
                    }
                  />
                </Tabs>
              </Box>

              {/* Product Formula Tab - Minimalist */}
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ p: 3 }}>
                  {/* Formula Header */}
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="h6" fontWeight={500} gutterBottom>
                        {details.productFormula.name}
                      </Typography>
                      {details.productFormula.description && (
                        <Typography variant="body2" color="text.secondary">
                          {details.productFormula.description}
                        </Typography>
                      )}
                    </Box>

                    {/* Craft Categories - Minimalist */}
                    {details.productFormula.craftCategories.length > 0 && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1.5 }}>
                          {t('mto.type2.student.craftCategories')}
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {details.productFormula.craftCategories.map((category) => (
                            <Chip
                              key={category.id}
                              label={category.name}
                              size="small"
                              sx={{
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: 'background.default',
                                '&:hover': { bgcolor: 'action.hover' }
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {/* Raw Materials - Clean Table */}
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <MaterialIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          {t('mto.type2.student.rawMaterials')}
                        </Typography>
                      </Stack>
                      <TableContainer sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        overflow: 'hidden'
                      }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: 'background.default' }}>
                              <TableCell sx={{ fontWeight: 500, border: 'none' }}>
                                {t('mto.type2.student.materialName')}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 500, border: 'none' }}>
                                {t('mto.type2.student.quantity')}
                              </TableCell>
                              <TableCell sx={{ fontWeight: 500, border: 'none' }}>
                                {t('mto.type2.student.unit')}
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {details.productFormula.rawMaterials.map((material, index) => (
                              <TableRow
                                key={material.id}
                                sx={{
                                  '&:last-child td': { border: 0 },
                                  '&:hover': { bgcolor: 'action.hover' }
                                }}
                              >
                                <TableCell sx={{ border: 'none', borderTop: index > 0 ? '1px solid' : 'none', borderColor: 'divider' }}>
                                  {material.name}
                                </TableCell>
                                <TableCell align="right" sx={{ border: 'none', borderTop: index > 0 ? '1px solid' : 'none', borderColor: 'divider', fontWeight: 500 }}>
                                  {material.quantity}
                                </TableCell>
                                <TableCell sx={{ border: 'none', borderTop: index > 0 ? '1px solid' : 'none', borderColor: 'divider', color: 'text.secondary' }}>
                                  {material.unit}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Stack>
                </Box>
              </TabPanel>

              {/* Tile Budgets Tab - Minimalist */}
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ p: 3 }}>
                  {/* Summary Stats */}
                  <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                    <Box sx={{
                      flex: 1,
                      p: 2,
                      bgcolor: 'background.default',
                      borderRadius: 1,
                      textAlign: 'center'
                    }}>
                      <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                        <PeopleIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="h6" fontWeight={500}>
                          {details.tileBudgetAllocations
                            .reduce((sum, tile) => sum + tile.tilePopulation, 0)
                            .toLocaleString()}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {t('mto.type2.student.totalPopulation')}
                      </Typography>
                    </Box>
                    <Box sx={{
                      flex: 1,
                      p: 2,
                      bgcolor: 'background.default',
                      borderRadius: 1,
                      textAlign: 'center'
                    }}>
                      <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                        <StoreIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="h6" fontWeight={500}>
                          {details.tileBudgetAllocations
                            .reduce((sum, tile) => sum + tile.mallsInTile.length, 0)}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {t('mto.type2.student.totalMalls')}
                      </Typography>
                    </Box>
                    <Box sx={{
                      flex: 1,
                      p: 2,
                      bgcolor: 'background.default',
                      borderRadius: 1,
                      textAlign: 'center'
                    }}>
                      <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                        <BudgetIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="h6" fontWeight={500}>
                          {formatCurrency(
                            parseFloat(details.overallPurchaseBudget) / details.tileBudgetAllocations.length
                          )}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {t('mto.type2.student.avgBudgetPerTile')}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Clean Table */}
                  <TableContainer sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    overflow: 'hidden'
                  }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'background.default' }}>
                          <TableCell sx={{ fontWeight: 500, border: 'none' }}>
                            {t('mto.type2.student.tileName')}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500, border: 'none' }}>
                            {t('mto.type2.student.coordinates')}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500, border: 'none' }}>
                            {t('mto.type2.student.population')}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500, border: 'none' }}>
                            {t('mto.type2.student.populationRatio')}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500, border: 'none' }}>
                            {t('mto.type2.student.allocatedBudget')}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500, border: 'none' }}>
                            {t('mto.type2.student.malls')}
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {details.tileBudgetAllocations.map((tile, index) => (
                          <TableRow key={tile.tileId} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                            <TableCell sx={{ border: 'none', borderTop: index > 0 ? '1px solid' : 'none', borderColor: 'divider' }}>
                              <Typography variant="body2" fontWeight={500}>
                                {tile.tileName}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ border: 'none', borderTop: index > 0 ? '1px solid' : 'none', borderColor: 'divider' }}>
                              <Typography variant="caption" color="text.secondary">
                                ({tile.axialQ}, {tile.axialR})
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ border: 'none', borderTop: index > 0 ? '1px solid' : 'none', borderColor: 'divider' }}>
                              <Typography variant="body2">
                                {tile.tilePopulation.toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ border: 'none', borderTop: index > 0 ? '1px solid' : 'none', borderColor: 'divider' }}>
                              <Typography variant="body2" color="text.secondary">
                                {formatPercentage(tile.populationRatio)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ border: 'none', borderTop: index > 0 ? '1px solid' : 'none', borderColor: 'divider' }}>
                              <Typography variant="body2" fontWeight={500}>
                                {formatCurrency(tile.allocatedBudget)}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ border: 'none', borderTop: index > 0 ? '1px solid' : 'none', borderColor: 'divider' }}>
                              {tile.mallsInTile.length > 0 ? (
                                <Stack spacing={0.5}>
                                  {tile.mallsInTile.slice(0, 1).map((mall) => (
                                    <Box key={mall.mallId}>
                                      <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <Chip
                                          label={`Lv.${mall.mallLevel}`}
                                          size="small"
                                          sx={{
                                            height: 20,
                                            fontSize: '0.7rem',
                                            bgcolor: 'primary.main',
                                            color: 'primary.contrastText'
                                          }}
                                        />
                                        <Typography variant="caption">
                                          {mall.mallName}
                                        </Typography>
                                      </Stack>
                                    </Box>
                                  ))}
                                  {tile.mallsInTile.length > 1 && (
                                    <Typography variant="caption" color="text.secondary">
                                      +{tile.mallsInTile.length - 1} more
                                    </Typography>
                                  )}
                                </Stack>
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  —
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </TabPanel>
        </Box>
      </Fade>
    )}
  </DialogContent>

  {/* Minimalist Footer */}
  <Box sx={{
    p: 2,
    borderTop: 1,
    borderColor: 'divider',
    bgcolor: 'background.default'
  }}>
    <Stack direction="row" justifyContent="flex-end">
      <Button
        onClick={onClose}
        variant="text"
        sx={{
          textTransform: 'none',
          fontWeight: 500
        }}
      >
        {t('common.close')}
      </Button>
    </Stack>
  </Box>
</Dialog>
  );
};

export default MtoType2RequirementDetailsModal;
