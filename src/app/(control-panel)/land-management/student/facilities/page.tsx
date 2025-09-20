'use client';

import React, { useState, useEffect } from 'react';
import {
  Typography,

  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Stack,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  SearchOutlined,
  AddOutlined,
  RefreshOutlined,
  ListAltOutlined,
} from '@mui/icons-material';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import { FacilityTable, BuildFacilityModalSimplified, UpgradeFacilityModal } from '@/components/facilities';
import { StudentFacilityService } from '@/lib/services/studentFacilityService';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';
import type { 
  TileFacilityInstance, 
  TeamFacilitySummary, 
  FacilityInstanceStatus,
  FacilityInstanceQueryParams 
} from '@/types/facilities';
import { FacilityType } from '@/types/facilities';


const StudentFacilitiesPage: React.FC = () => {
  const { t } = useTranslation();

  // State management
  const [facilities, setFacilities] = useState<TileFacilityInstance[]>([]);
  const [summary, setSummary] = useState<TeamFacilitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FacilityInstanceStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<FacilityType | 'ALL'>('ALL');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Modal states
  const [buildModalOpen, setBuildModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedFacilityForUpgrade, setSelectedFacilityForUpgrade] = useState<TileFacilityInstance | null>(null);

  // Load initial data
  useEffect(() => {
    loadFacilityData();
  }, []);

  // Reload when filters change
  useEffect(() => {
    if (!loading) {
      loadFacilities();
    }
  }, [statusFilter, typeFilter, page]);

  const loadFacilityData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load summary and facilities in parallel
      const [summaryData, facilitiesData] = await Promise.all([
        StudentFacilityService.getTeamFacilitySummary(),
        StudentFacilityService.getTeamFacilities({ page: 1, pageSize: 20 })
      ]);

      setSummary(summaryData);
      setFacilities(facilitiesData?.data || []);
      setTotalPages(facilitiesData?.totalPages || 1);
      setHasMore(facilitiesData?.hasNext || false);

    } catch (err) {
      console.error('Failed to load facility data:', err);
      setError(t('facilityManagement.FACILITY_LOAD_ERROR'));
      setFacilities([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const loadFacilities = async () => {
    try {
      const params: FacilityInstanceQueryParams = {
        page,
        pageSize: 20,
      };

      if (statusFilter !== 'ALL') params.status = statusFilter as FacilityInstanceStatus;
      if (typeFilter !== 'ALL') params.facilityType = typeFilter as FacilityType;

      const response = await StudentFacilityService.getTeamFacilities(params);
      setFacilities(response?.data || []);
      setTotalPages(response?.totalPages || 1);
      setHasMore(response?.hasNext || false);

    } catch (err) {
      console.error('Failed to load facilities:', err);
      setError(t('facilityManagement.FACILITY_LOAD_ERROR'));
      setFacilities([]);
    }
  };


  const handleRefresh = () => {
    setPage(1);
    loadFacilityData();
  };

  const handleFacilityClick = (facility: TileFacilityInstance) => {
    console.log('Navigate to facility:', facility.id);
  };

  const handleUpgradeClick = (facility: TileFacilityInstance) => {
    setSelectedFacilityForUpgrade(facility);
    setUpgradeModalOpen(true);
  };

  const handleBuildNewFacility = () => {
    setBuildModalOpen(true);
  };

  const handleCloseBuildModal = () => {
    setBuildModalOpen(false);
  };

  const handleFacilityBuilt = (newFacility: TileFacilityInstance) => {
    setFacilities(prev => [...(prev || []), newFacility]);
    loadFacilityData();
    setBuildModalOpen(false);
  };

  const handleCloseUpgradeModal = () => {
    setUpgradeModalOpen(false);
    setSelectedFacilityForUpgrade(null);
  };

  const handleFacilityUpgraded = (upgradedFacility: TileFacilityInstance) => {
    setFacilities(prev => (prev || []).map(f => 
      f.id === upgradedFacility.id ? upgradedFacility : f
    ));
    loadFacilityData(); // Refresh summary data
    setUpgradeModalOpen(false);
    setSelectedFacilityForUpgrade(null);
  };

  // Filter facilities based on search term
  const filteredFacilities = (facilities && facilities.length > 0) ? facilities.filter(facility => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const facilityName = t(`facilityManagement.FACILITY_TYPE_${facility.facilityType}`).toLowerCase();
    const description = facility.description?.toLowerCase() || '';
    
    return facilityName.includes(searchLower) || 
           description.includes(searchLower) ||
           facility.tileId.toString().includes(searchLower);
  }) : [];

  if (loading && !summary) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-900 flex items-center justify-center">
        <CircularProgress size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Typography variant="h4" className="font-light text-gray-900 dark:text-white mb-2">
            {t('facilityManagement.FACILITY_MANAGEMENT')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('facilityManagement.MANAGE_YOUR_FACILITIES_DESCRIPTION')}
          </Typography>
        </div>

        {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Header Actions */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={500} color="text.primary">
          {t('facilityManagement.MY_FACILITIES')}
        </Typography>
        
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshOutlined />}
            onClick={handleRefresh}
            disabled={loading}
            sx={{ 
              borderColor: 'grey.300',
              color: 'text.secondary',
              '&:hover': { borderColor: 'grey.400' }
            }}
          >
            {t('facilityManagement.REFRESH')}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddOutlined />}
            onClick={handleBuildNewFacility}
            sx={{ 
              backgroundColor: 'primary.main',
              boxShadow: 'none',
              '&:hover': { backgroundColor: 'primary.dark', boxShadow: 'none' }
            }}
          >
            {t('facilityManagement.BUILD_FACILITY')}
          </Button>
        </Stack>
      </Stack>

      {/* Facilities List */}
        <div>
          {/* Search and Filters */}
          <Card variant="outlined" sx={{ mb: 4 }}>
            <CardContent>
              <Grid container spacing={3} alignItems="end">
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={t('facilityManagement.SEARCH_PLACEHOLDER')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchOutlined sx={{ fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label={t('facilityManagement.STATUS')}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as FacilityInstanceStatus | 'ALL')}
                  >
                    <MenuItem value="ALL">{t('facilityManagement.ALL_STATUSES')}</MenuItem>
                    <MenuItem value="ACTIVE">{t('facilityManagement.ACTIVE')}</MenuItem>
                    <MenuItem value="UNDER_CONSTRUCTION">{t('facilityManagement.UNDER_CONSTRUCTION')}</MenuItem>
                    <MenuItem value="MAINTENANCE">{t('facilityManagement.MAINTENANCE')}</MenuItem>
                    <MenuItem value="DAMAGED">{t('facilityManagement.DAMAGED')}</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label={t('facilityManagement.TYPE')}
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as FacilityType | 'ALL')}
                  >
                    <MenuItem value="ALL">{t('facilityManagement.ALL_TYPES')}</MenuItem>
                    {FacilityType && Object.values(FacilityType) ? Object.values(FacilityType).map((type) => (
                      <MenuItem key={type} value={type}>
                        {t(`facilityManagement.FACILITY_TYPE_${type}`)}
                      </MenuItem>
                    )) : null}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('ALL');
                      setTypeFilter('ALL');
                    }}
                    sx={{ minWidth: 'auto', px: 2 }}
                  >
                    {t('facilityManagement.CLEAR_FILTERS')}
                  </Button>
                </Grid>
              </Grid>
              
              {/* Active Filters */}
              {(searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL') && (
                <div className="mt-2">
                  <Divider sx={{ mb: 2 }} />
                  <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      {t('facilityManagement.FILTERS')}:
                    </Typography>
                    {searchTerm && (
                      <Chip
                        label={`"${searchTerm}"`}
                        size="small"
                        onDelete={() => setSearchTerm('')}
                      />
                    )}
                    {statusFilter !== 'ALL' && (
                      <Chip
                        label={t(`facilityManagement.${statusFilter}`)}
                        size="small"
                        onDelete={() => setStatusFilter('ALL')}
                      />
                    )}
                    {typeFilter !== 'ALL' && (
                      <Chip
                        label={t(`facilityManagement.FACILITY_TYPE_${typeFilter}`)}
                        size="small"
                        onDelete={() => setTypeFilter('ALL')}
                      />
                    )}
                  </Stack>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Facilities Grid */}
          {(filteredFacilities?.length || 0) > 0 ? (
            <div>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight={500}>
                  {filteredFacilities?.length || 0} {t('facilityManagement.FACILITIES')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('facilityManagement.TOTAL_VALUE')}: {StudentFacilityService.formatCurrency(
                    (filteredFacilities || []).reduce((sum, f) => {
                      const totalInvestment = StudentFacilityService.calculateTotalInvestment(f);
                      return sum + totalInvestment;
                    }, 0)
                  )}
                </Typography>
              </Stack>
              
              <FacilityTable
                facilities={filteredFacilities || []}
                onClick={handleFacilityClick}
                onUpgrade={handleUpgradeClick}
                onViewDetails={handleFacilityClick}
                showActions={true}
              />
            </div>
          ) : (
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL'
                    ? t('facilityManagement.NO_FACILITIES_MATCH_FILTERS')
                    : t('facilityManagement.NO_FACILITIES_BUILT')
                  }
                </Typography>
                
                <Typography variant="body2" color="text.secondary" mb={3}>
                  {searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL'
                    ? t('facilityManagement.TRY_DIFFERENT_FILTERS')
                    : t('facilityManagement.BUILD_YOUR_FIRST_FACILITY_DESCRIPTION')
                  }
                </Typography>
                
                <Stack direction="row" spacing={2} justifyContent="center">
                  {(searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL') && (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('ALL');
                        setTypeFilter('ALL');
                      }}
                    >
                      {t('facilityManagement.CLEAR_FILTERS')}
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    startIcon={<AddOutlined />}
                    onClick={handleBuildNewFacility}
                    sx={{ boxShadow: 'none' }}
                  >
                    {t('facilityManagement.BUILD_FACILITY')}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Build Facility Modal */}
        <BuildFacilityModalSimplified
          open={buildModalOpen}
          onClose={handleCloseBuildModal}
          onSuccess={handleFacilityBuilt}
        />

        {/* Upgrade Facility Modal */}
        <UpgradeFacilityModal
          open={upgradeModalOpen}
          onClose={handleCloseUpgradeModal}
          onSuccess={handleFacilityUpgraded}
          facility={selectedFacilityForUpgrade}
          teamBalance={summary ? {
            gold: 1000000, // Mock data - should come from team balance API
            carbon: 50000, // Mock data - should come from team balance API
          } : undefined}
        />
      </div>
    </div>
  );
};

export default StudentFacilitiesPage;