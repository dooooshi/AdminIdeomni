'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  LinearProgress,
  Button,
  TextField,
  InputAdornment,
  Collapse,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Storage as StorageIcon,
  Block as BlockIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Calculate as CalculateIcon,
  Factory as FactoryIcon,
  Agriculture as AgricultureIcon,
  PowerSettingsNew as PowerIcon,
  School as SchoolIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';

import {
  FacilitySpaceConfig,
  SpaceCalculationResult,
  groupFacilitiesByCategory,
  getFacilityCategory,
  canHaveStorage,
} from '@/types/facilitySpace';
import { FacilityType, FacilityCategory } from '@/types/facilities';
import FacilitySpaceConfigService from '@/lib/services/facilitySpaceConfigService';

interface FacilitySpaceConfigListProps {
  templateId: number;
  onConfigEdit?: (config: FacilitySpaceConfig) => void;
  onConfigDelete?: (config: FacilitySpaceConfig) => void;
}

const FacilitySpaceConfigList: React.FC<FacilitySpaceConfigListProps> = ({
  templateId,
  onConfigEdit,
  onConfigDelete,
}) => {
  const { t } = useTranslation();
  
  // State
  const [configs, setConfigs] = useState<FacilitySpaceConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCalculations, setShowCalculations] = useState<Record<string, boolean>>({});
  const [calculationLevel, setCalculationLevel] = useState(1);
  
  // Load configurations
  const loadConfigs = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await FacilitySpaceConfigService.getFacilitySpaceConfigs(templateId);
      const configsData = Array.isArray(response) ? response : response?.data || [];
      setConfigs(configsData);
    } catch (error) {
      console.error('Failed to load facility space configs:', error);
      // Create default configurations if none exist
      const defaultConfigs: FacilitySpaceConfig[] = Object.values(FacilityType).map(type => ({
        id: `temp-${type}`,
        templateId,
        facilityType: type as FacilityType,
        initialSpace: FacilitySpaceConfigService.getDefaultConfig(type as FacilityType).initialSpace,
        spacePerLevel: FacilitySpaceConfigService.getDefaultConfig(type as FacilityType).spacePerLevel,
        maxSpace: FacilitySpaceConfigService.getDefaultConfig(type as FacilityType).maxSpace,
        isStorageFacility: FacilitySpaceConfigService.getDefaultConfig(type as FacilityType).isStorageFacility || false,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      setConfigs(defaultConfigs);
    } finally {
      setIsLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  // Group configs by category
  const groupedConfigs = groupFacilitiesByCategory(configs);
  
  // Filter configs based on search
  const filteredGroupedConfigs = Object.entries(groupedConfigs).reduce((acc, [category, categoryConfigs]) => {
    const filtered = categoryConfigs.filter(config =>
      config.facilityType.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category as FacilityCategory] = filtered;
    }
    return acc;
  }, {} as Record<FacilityCategory, FacilitySpaceConfig[]>);

  // Toggle calculation display
  const toggleCalculation = (configId: string) => {
    setShowCalculations(prev => ({
      ...prev,
      [configId]: !prev[configId],
    }));
  };

  // Calculate space for a config
  const calculateSpace = (config: FacilitySpaceConfig, level: number): SpaceCalculationResult => {
    return FacilitySpaceConfigService.calculateSpace(config, level);
  };

  // Export configurations
  const handleExport = () => {
    const jsonData = FacilitySpaceConfigService.exportConfigs(configs);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `facility-space-configs-template-${templateId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get category icon
  const getCategoryIcon = (category: FacilityCategory) => {
    switch (category) {
      case FacilityCategory.RAW_MATERIAL_PRODUCTION:
        return <AgricultureIcon />;
      case FacilityCategory.FUNCTIONAL:
        return <FactoryIcon />;
      case FacilityCategory.INFRASTRUCTURE:
        return <PowerIcon />;
      case FacilityCategory.OTHER:
        return <SchoolIcon />;
      default:
        return <StorageIcon />;
    }
  };

  // Get category color
  const getCategoryColor = (category: FacilityCategory) => {
    switch (category) {
      case FacilityCategory.RAW_MATERIAL_PRODUCTION:
        return 'success';
      case FacilityCategory.FUNCTIONAL:
        return 'primary';
      case FacilityCategory.INFRASTRUCTURE:
        return 'warning';
      case FacilityCategory.OTHER:
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Render space calculation display
  const renderSpaceCalculation = (config: FacilitySpaceConfig) => {
    const calculations = [];
    for (let level = 1; level <= 5; level++) {
      const calc = calculateSpace(config, level);
      calculations.push(calc);
    }

    return (
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          {t('facilitySpace.SPACE_CALCULATION_PREVIEW')}
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('facilitySpace.LEVEL')}</TableCell>
              <TableCell align="right">{t('facilitySpace.BASE_SPACE')}</TableCell>
              <TableCell align="right">{t('facilitySpace.ADDITIONAL_SPACE')}</TableCell>
              <TableCell align="right">{t('facilitySpace.TOTAL_SPACE')}</TableCell>
              <TableCell align="right">{t('facilitySpace.EFFECTIVE_SPACE')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {calculations.map((calc) => (
              <TableRow key={calc.level}>
                <TableCell>{calc.level}</TableCell>
                <TableCell align="right">{Number(calc.baseSpace).toFixed(2)}</TableCell>
                <TableCell align="right">{Number(calc.additionalSpace).toFixed(2)}</TableCell>
                <TableCell align="right">{Number(calc.totalSpace).toFixed(2)}</TableCell>
                <TableCell align="right">
                  <Chip
                    label={Number(calc.effectiveSpace).toFixed(2)}
                    size="small"
                    color={Number(calc.totalSpace) > Number(calc.maxSpace) ? 'warning' : 'default'}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    );
  };

  // Render configuration row
  const renderConfigRow = (config: FacilitySpaceConfig) => {
    const isStorage = config.isStorageFacility;
    
    return (
      <React.Fragment key={config.id}>
        <TableRow hover>
          <TableCell>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" fontWeight="medium">
                {t(`facilityManagement:FACILITY_TYPE_${config.facilityType}`)}
              </Typography>
              {!isStorage && (
                <Chip
                  icon={<BlockIcon />}
                  label={t('facilitySpace.NO_STORAGE')}
                  size="small"
                  color="default"
                  variant="outlined"
                />
              )}
            </Box>
          </TableCell>
          <TableCell align="right">
            {isStorage ? Number(config.initialSpace).toFixed(2) : '-'}
          </TableCell>
          <TableCell align="right">
            {isStorage ? Number(config.spacePerLevel).toFixed(2) : '-'}
          </TableCell>
          <TableCell align="right">
            {isStorage ? Number(config.maxSpace).toFixed(2) : '-'}
          </TableCell>
          <TableCell align="center">
            <Chip
              icon={isStorage ? <StorageIcon /> : <BlockIcon />}
              label={isStorage ? t('facilitySpace.HAS_STORAGE') : t('facilitySpace.NO_STORAGE')}
              size="small"
              color={isStorage ? 'success' : 'default'}
              variant={isStorage ? 'filled' : 'outlined'}
            />
          </TableCell>
          <TableCell align="right">
            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
              {isStorage && (
                <Tooltip title={t('facilitySpace.SHOW_CALCULATIONS')}>
                  <IconButton
                    size="small"
                    onClick={() => toggleCalculation(config.id)}
                  >
                    <CalculateIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title={t('common.EDIT')}>
                <IconButton
                  size="small"
                  onClick={() => onConfigEdit?.(config)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('common.DELETE')}>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onConfigDelete?.(config)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </TableCell>
        </TableRow>
        {showCalculations[config.id] && (
          <TableRow>
            <TableCell colSpan={6} sx={{ p: 0 }}>
              <Collapse in={showCalculations[config.id]}>
                {renderSpaceCalculation(config)}
              </Collapse>
            </TableCell>
          </TableRow>
        )}
      </React.Fragment>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {t('facilitySpace.LOADING_CONFIGS')}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title={t('facilitySpace.FACILITY_SPACE_CONFIGURATION')}
        subheader={t('facilitySpace.SPACE_CONFIG_DESCRIPTION')}
        action={
          <Stack direction="row" spacing={1}>
            <Tooltip title={t('facilitySpace.EXPORT_CONFIGS')}>
              <IconButton onClick={handleExport}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('common.REFRESH')}>
              <IconButton onClick={loadConfigs}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        }
      />
      <CardContent>
        {/* Search Bar */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t('facilitySpace.SEARCH_FACILITY_TYPE')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Grouped configurations */}
        {Object.entries(filteredGroupedConfigs).map(([category, categoryConfigs]) => (
          <Accordion key={category} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={2}>
                {getCategoryIcon(category as FacilityCategory)}
                <Typography variant="h6">
                  {t(`facilitySpace.CATEGORY_${category}`)}
                </Typography>
                <Chip
                  label={`${categoryConfigs.length} ${t('facilitySpace.FACILITIES')}`}
                  size="small"
                  color={getCategoryColor(category as FacilityCategory)}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('facilitySpace.FACILITY_TYPE')}</TableCell>
                      <TableCell align="right">{t('facilitySpace.INITIAL_SPACE')}</TableCell>
                      <TableCell align="right">{t('facilitySpace.SPACE_PER_LEVEL')}</TableCell>
                      <TableCell align="right">{t('facilitySpace.MAX_SPACE')}</TableCell>
                      <TableCell align="center">{t('facilitySpace.STORAGE_STATUS')}</TableCell>
                      <TableCell align="right">{t('common.ACTIONS')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categoryConfigs.map(config => renderConfigRow(config))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        ))}
      </CardContent>
    </Card>
  );
};

export default FacilitySpaceConfigList;