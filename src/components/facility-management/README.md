# Facility Management Module

A comprehensive facility management system built for the Ideomni platform, providing full CRUD operations, statistics dashboard, and configuration management for 18 different facility types across 4 categories.

## Overview

This module implements a complete facility management solution based on the API specifications in `docs/facility/facility-api.md` and `docs/facility/facility-config-api.md`. It provides a modern, intuitive interface for administrators to manage business simulation facilities and their configurations.

## Features

### 🏢 Facility Management
- **Create Facilities**: Full form with validation for creating new facilities with type-category matching
- **Edit Facilities**: Update existing facility information, costs, and settings
- **Delete Facilities**: Soft delete with confirmation dialog (can be restored)
- **Restore Facilities**: Restore soft-deleted facilities
- **Toggle Status**: Activate/deactivate facilities
- **View Details**: Comprehensive facility information display

### 📊 Advanced Search & Filtering
- **Text Search**: Search facilities by name, type, or description with debounced input
- **Category Filtering**: Filter by facility category (Raw Material Production, Functional, Infrastructure, Other)
- **Type Filtering**: Filter by specific facility types (18 types available)
- **Status Filtering**: Filter by active/inactive status
- **Real-time Updates**: Live data updates with automatic refresh
- **Sorting**: Sort by name, type, category, creation date with ascending/descending order

### 📈 Statistics Dashboard
- **Overview Cards**: Total, active, and inactive facility counts with percentages
- **Category Breakdown**: Visual representation of facilities by category with progress bars
- **Type Breakdown**: Detailed breakdown by facility types with sorting
- **Summary Information**: Most popular categories, types, and active rates
- **Interactive Charts**: Color-coded category indicators and progress visualizations

### 🏗️ Facility Types & Categories

#### Raw Material Production Facilities
- **MINE** (矿场) - Mining operations for extracting precious metals and minerals
- **QUARRY** (采石场) - Stone and granite extraction for construction materials  
- **FOREST** (林场) - Sustainable timber harvesting operations
- **FARM** (农场) - Multi-crop farming for grains and vegetables
- **RANCH** (养殖场) - Livestock operations for cattle and poultry
- **FISHERY** (渔场) - Marine fishing operations with processing capabilities

#### Functional Facilities
- **FACTORY** (工厂) - Manufacturing facilities for producing consumer goods
- **MALL** (商场) - Retail complexes with multiple stores and entertainment
- **WAREHOUSE** (仓库) - Large-scale storage and distribution centers
- **MEDIA_BUILDING** (媒体大楼) - Media production and broadcasting facilities

#### Infrastructure
- **WATER_PLANT** (水厂) - Water purification and distribution facilities
- **POWER_PLANT** (电厂) - Clean energy power generation facilities
- **BASE_STATION** (基站) - Telecommunications infrastructure hubs

#### Other Facilities
- **FIRE_STATION** (消防站) - Emergency response and fire safety facilities
- **SCHOOL** (学校) - Educational facilities for secondary education
- **HOSPITAL** (医院) - Full-service medical facilities with emergency care
- **PARK** (公园) - Public recreational spaces with gardens and sports
- **CINEMA** (影院) - Movie theaters with multiple screens and amenities

## Structure

```
src/components/facility-management/
├── FacilityList.tsx           # Facility listing with search, filters, and actions
├── FacilityForm.tsx          # Create/edit facility form with accordion layout
├── FacilityStatistics.tsx   # Statistics dashboard with charts and analytics
├── index.ts                  # Component exports
└── README.md                 # This documentation
```

## API Integration

### Service Layer
All components use the `FacilityService` class which implements the complete API specification:

```typescript
import FacilityService from '@/lib/services/facilityService';

// Facility management
const facilities = await FacilityService.searchFacilities(params);
const newFacility = await FacilityService.createFacility(facilityData);
const updatedFacility = await FacilityService.updateFacility(id, updateData);
await FacilityService.deleteFacility(id);
await FacilityService.restoreFacility(id);
await FacilityService.toggleFacilityStatus(id);

// Statistics and utilities
const stats = await FacilityService.getFacilityStatistics();
const typesByCategory = await FacilityService.getFacilityTypesByCategory();
```

### Configuration Management
Support for facility configuration templates through `FacilityConfigService`:

```typescript
import FacilityConfigService from '@/lib/services/facilityConfigService';

// Configuration management
const configs = await FacilityConfigService.searchFacilityConfigs(params);
const config = await FacilityConfigService.getFacilityConfigByType(type);
await FacilityConfigService.initializeDefaultConfigs();
```

## Data Models

### Facility Interface
```typescript
interface Facility {
  id: string;
  name: string;
  facilityType: FacilityType;
  category: FacilityCategory;
  description?: string;
  capacity?: number;
  maintenanceCost?: number;
  buildCost?: number;
  operationCost?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
```

### Type System
- **FacilityType**: Enum of 18 facility types
- **FacilityCategory**: Enum of 4 categories
- **Type-Category Validation**: Automatic validation ensuring facility types match their designated categories

## Component Usage

### Main Page Implementation
```typescript
import {
  FacilityList,
  FacilityForm,
  FacilityStatistics,
  Facility
} from '@/components/facility-management';

const FacilityManagementPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [facilityFormOpen, setFacilityFormOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);

  return (
    <Box>
      <Tabs value={tabValue} onChange={setTabValue}>
        <Tab label="Facilities" />
        <Tab label="Statistics" />
      </Tabs>

      {tabValue === 0 && (
        <FacilityList
          onCreateFacility={() => setFacilityFormOpen(true)}
          onEditFacility={setEditingFacility}
          onViewFacility={handleViewFacility}
        />
      )}

      {tabValue === 1 && (
        <FacilityStatistics refreshTrigger={refreshTrigger} />
      )}

      <FacilityForm
        open={facilityFormOpen}
        facility={editingFacility}
        onSuccess={handleSuccess}
        onClose={() => setFacilityFormOpen(false)}
      />
    </Box>
  );
};
```

### Individual Component Usage

#### FacilityList
```typescript
<FacilityList
  onCreateFacility={() => void}
  onEditFacility={(facility: Facility) => void}
  onViewFacility={(facility: Facility) => void}
/>
```

**Features:**
- Paginated data table with sorting
- Search across name, type, and description
- Filter by category, type, and status
- Bulk statistics display
- Action buttons for each facility
- Real-time data updates

#### FacilityForm
```typescript
<FacilityForm
  open={boolean}
  onClose={() => void}
  facility={Facility | null}          // null for create, Facility object for edit
  onSuccess={(facility: Facility) => void}
/>
```

**Features:**
- Create and edit modes
- Accordion layout for organized sections
- Form validation with Yup
- Type-category validation
- Cost input fields with currency formatting
- Automatic type filtering based on category

#### FacilityStatistics
```typescript
<FacilityStatistics
  refreshTrigger={number}
  onRefresh={() => void}
/>
```

**Features:**
- Overview cards with key metrics
- Category breakdown with visual progress bars
- Type breakdown with sorting
- Summary information
- Interactive charts and visualizations

## Internationalization (i18n)

### Supported Languages
- **English (en-US)**: Complete translations for all UI elements
- **Chinese (zh-CN)**: Complete translations for all UI elements

### Translation Structure
```typescript
// English example
facilityManagement: {
  FACILITY_MANAGEMENT: 'Facility Management',
  CREATE_FACILITY: 'Create Facility',
  MINE: 'Mining Facility',
  RAW_MATERIAL_PRODUCTION: 'Raw Material Production',
  // ... 300+ translation keys
}

// Chinese example
facilityManagement: {
  FACILITY_MANAGEMENT: '设施管理',
  CREATE_FACILITY: '创建设施',
  MINE: '矿场',
  RAW_MATERIAL_PRODUCTION: '原料生产设施',
  // ... 300+ translation keys
}
```

## Form Validation

### Comprehensive Validation Rules
- **Name**: Required, 2-100 characters
- **Type**: Required, must be valid enum value
- **Category**: Required, must match facility type
- **Type-Category Matching**: Automatic validation ensuring compatibility
- **Capacity**: Optional, must be positive number
- **Costs**: Optional, must be positive numbers
- **Description**: Optional, max 500 characters

### Real-time Validation
- **Debounced Input**: Search inputs debounced to reduce API calls
- **Dynamic Type Filtering**: Available types update based on selected category
- **Error States**: Clear error messaging with field-specific validation

## Performance Features

### Optimizations
- **Pagination**: All lists use pagination to handle large datasets
- **Debounced Search**: Reduces API calls for real-time search
- **Memoization**: Expensive calculations are memoized
- **Lazy Loading**: Components load data only when needed
- **Efficient Rendering**: Optimized re-renders with proper key props

### Caching Strategy
- **Statistics Caching**: Statistics data cached for improved performance
- **Type Validation Caching**: Category-type mappings cached for quick validation
- **Search Results**: Proper pagination and filtering on server side

## Navigation Integration

### Admin Navigation
The facility management page is integrated into the admin navigation system:

**Super Admin (adminType: 1)**
- Full access under "Admin Management" section
- Complete CRUD operations
- Statistics and configuration access

**Limited Admin (adminType: 2)**
- Access under "Admin Management" section
- Basic facility management capabilities
- View and edit permissions

### Navigation Configuration
```typescript
{
  id: 'admin-management.facility-management',
  title: 'Facility Management',
  type: 'item',
  icon: 'heroicons-outline:building-office-2',
  url: '/facility-management',
  translate: 'FACILITY_MANAGEMENT',
  auth: ['admin']
}
```

## API Endpoints Integration

### Facility Management Endpoints
- `POST /api/facilities` - Create facility
- `GET /api/facilities/search` - Search with pagination and filters
- `GET /api/facilities/stats` - Get statistics
- `GET /api/facilities/:id` - Get facility details
- `PUT /api/facilities/:id` - Update facility
- `PUT /api/facilities/:id/toggle-status` - Toggle status
- `PUT /api/facilities/:id/restore` - Restore deleted facility
- `DELETE /api/facilities/:id` - Soft delete facility

### Configuration Endpoints
- `GET /api/facility-configs/search` - Search configurations
- `GET /api/facility-configs/facility-type/:type` - Get config by type
- `POST /api/facility-configs/initialize-defaults` - Initialize defaults

## Error Handling

### Comprehensive Error Management
- **Network Errors**: Graceful handling of API failures with retry logic
- **Validation Errors**: Real-time form validation with clear error messages
- **Business Logic Errors**: Type-category mismatch and constraint violations
- **User Feedback**: Toast notifications and inline error messages
- **Loading States**: Consistent loading indicators across all components

### Error Recovery
- **Retry Mechanisms**: Automatic retry for transient failures
- **Graceful Degradation**: Fallback UI states for error conditions
- **User Guidance**: Clear instructions for resolving validation errors

## Security Features

### Input Validation
- **Client-side Validation**: Comprehensive form validation using Yup schemas
- **Type Safety**: Full TypeScript integration with strict typing
- **Sanitization**: Input sanitization to prevent XSS attacks
- **Authorization**: Proper auth checks for admin-only features

### Audit Trail
- **Operation Logging**: All facility operations are logged
- **Soft Delete**: Facilities are soft-deleted for audit purposes
- **Change Tracking**: Created/updated timestamps for all records
- **User Attribution**: Track which admin performed operations

## Testing Considerations

### Testing Strategy
- **Unit Tests**: Test individual component logic and utility functions
- **Integration Tests**: Test API service integration and data flow
- **E2E Tests**: Test complete user workflows and interactions
- **Validation Tests**: Verify form validation and error handling
- **Performance Tests**: Test pagination and large dataset handling

### Mock Data
- **Development Testing**: Comprehensive seed data for all facility types
- **Error Scenarios**: Mock error conditions for testing error handling
- **Edge Cases**: Test boundary conditions and constraint validation

## Dependencies

### Required Packages
- `@mui/material` - UI components and theming system
- `@mui/icons-material` - Material Design icons
- `formik` - Form handling and state management
- `yup` - Schema validation library
- `react-i18next` - Internationalization framework

### Internal Dependencies
- `@/lib/services/facilityService` - API service layer
- `@/lib/http/api-client` - HTTP client configuration
- `@ideomni/core/IdeomniPageSimple` - Page layout component
- `@i18n/` - Internationalization system

## Future Enhancements

### Planned Features
- **Facility Configuration Management**: UI for managing facility configuration templates
- **Bulk Operations**: Multi-select operations for batch updates
- **Advanced Analytics**: Charts and graphs for facility utilization
- **Export/Import**: CSV/Excel export and import functionality
- **Activity Integration**: Connect facilities with business simulation activities
- **Approval Workflows**: Multi-step approval process for facility changes

### Scalability Considerations
- **Virtual Scrolling**: For handling thousands of facilities
- **Advanced Filtering**: More sophisticated filter combinations
- **Real-time Updates**: WebSocket integration for live updates
- **Caching Strategy**: Enhanced caching for better performance
- **Mobile Optimization**: Responsive design improvements

This facility management system provides a robust, scalable, and user-friendly solution for managing facilities in the Ideomni business simulation platform, with comprehensive features for CRUD operations, analytics, and configuration management. 