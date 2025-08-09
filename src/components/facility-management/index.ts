// Main Components
export { default as FacilityList } from './FacilityList';
export { default as FacilityForm } from './FacilityForm';
export { default as FacilityStatistics } from './FacilityStatistics';

// Configuration Components
export { default as FacilityConfigList } from './FacilityConfigList';
export { default as FacilityConfigForm } from './FacilityConfigForm';

// i18n Helper removed - use centralized @i18n module instead

// Types
export type {
  Facility,
  FacilityType,
  FacilityCategory,
  CreateFacilityRequest,
  UpdateFacilityRequest,
  FacilitySearchParams,
  FacilitySearchResponse,
  FacilityStatistics as FacilityStatsType,
} from '@/lib/services/facilityService';

export type {
  FacilityConfig,
  CreateFacilityConfigRequest,
  UpdateFacilityConfigRequest,
  FacilityConfigSearchParams,
  FacilityConfigSearchResponse,
  FacilityConfigStatistics,
} from '@/lib/services/facilityConfigService'; 