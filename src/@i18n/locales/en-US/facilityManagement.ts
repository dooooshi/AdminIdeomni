const facilityManagement = {
  // Page titles and headers
  FACILITY_MANAGEMENT: 'Facility Management',
  FACILITY_MANAGEMENT_SUBTITLE: 'Manage facility types, configurations, and operational settings.',
  FACILITIES: 'Facilities',
  FACILITY_CONFIGURATIONS: 'Facility Configurations',
  FACILITY_STATISTICS: 'Facility Statistics',
  
  // Common actions
  CREATE_FACILITY: 'Create Facility',
  EDIT_FACILITY: 'Edit Facility',
  DELETE_FACILITY: 'Delete Facility',
  RESTORE_FACILITY: 'Restore Facility',
  VIEW_FACILITY: 'View Facility',
  DUPLICATE_FACILITY: 'Duplicate Facility',
  TOGGLE_STATUS: 'Toggle Status',
  REFRESH_DATA: 'Refresh Data',
  EXPORT_DATA: 'Export Data',
  SEARCH_FACILITIES: 'Search Facilities',
  
  // Common UI elements
  EDIT: 'Edit',
  DELETE: 'Delete',
  RESTORE: 'Restore',
  VIEW: 'View',
  SAVE: 'Save',
  CANCEL: 'Cancel',
  CLOSE: 'Close',
  CONFIRM: 'Confirm',
  YES: 'Yes',
  NO: 'No',
  OK: 'OK',
  APPLY: 'Apply',
  RESET: 'Reset',
  CLEAR: 'Clear',
  SEARCH: 'Search',
  FILTER: 'Filter',
  SORT: 'Sort',
  REFRESH: 'Refresh',
  LOAD_MORE: 'Load More',
  SHOW_MORE: 'Show More',
  SHOW_LESS: 'Show Less',
  EXPAND: 'Expand',
  COLLAPSE: 'Collapse',
  
  // Common states
  LOADING: 'Loading',
  SAVING: 'Saving',
  DELETING: 'Deleting',
  RESTORING: 'Restoring',
  UPDATING: 'Updating',
  CREATING: 'Creating',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  SUCCESS: 'Success',
  ERROR: 'Error',
  WARNING: 'Warning',
  INFO: 'Information',
  
  // Data states
  NO_DATA: 'No data available',
  NO_RESULTS: 'No results found',
  EMPTY_LIST: 'List is empty',
  NOT_AVAILABLE: 'N/A',
  UNKNOWN: 'Unknown',
  
  // Facility List Table Headers
  FACILITY_ID: 'Facility ID',
  FACILITY_NAME: 'Facility Name',
  NAME: 'Name',
  FACILITY_TYPE: 'Facility Type',
  TYPE: 'Type',
  CATEGORY: 'Category',
  DESCRIPTION: 'Description',
  CAPACITY: 'Capacity',
  BUILD_COST: 'Build Cost',
  MAINTENANCE_COST: 'Maintenance Cost',
  OPERATION_COST: 'Operation Cost',
  STATUS: 'Status',
  CREATED_AT: 'Created',
  UPDATED_AT: 'Updated',
  ACTIONS: 'Actions',
  
  // Facility Categories
  RAW_MATERIAL_PRODUCTION: 'Raw Material Production',
  FUNCTIONAL: 'Functional Facilities',
  INFRASTRUCTURE: 'Infrastructure',
  OTHER: 'Other Facilities',
  FACILITY_CATEGORY_RAW_MATERIAL_PRODUCTION: 'Raw Material Production',
  FACILITY_CATEGORY_FUNCTIONAL: 'Functional Facilities',
  FACILITY_CATEGORY_INFRASTRUCTURE: 'Infrastructure',
  FACILITY_CATEGORY_OTHER: 'Other Facilities',
  
  // Facility Types - Raw Material Production
  FACILITY_TYPE_MINE: 'Mining Facility',
  FACILITY_TYPE_QUARRY: 'Quarry',
  FACILITY_TYPE_FOREST: 'Forest',
  FACILITY_TYPE_FARM: 'Farm',
  FACILITY_TYPE_RANCH: 'Ranch',
  FACILITY_TYPE_FISHERY: 'Fishery',
  
  // Facility Types - Functional
  FACILITY_TYPE_FACTORY: 'Factory',
  FACILITY_TYPE_MALL: 'Shopping Mall',
  FACILITY_TYPE_WAREHOUSE: 'Warehouse',
  FACILITY_TYPE_MEDIA_BUILDING: 'Media Building',
  
  // Facility Types - Infrastructure
  FACILITY_TYPE_WATER_PLANT: 'Water Treatment Plant',
  FACILITY_TYPE_POWER_PLANT: 'Power Plant',
  FACILITY_TYPE_BASE_STATION: 'Base Station',
  
  // Facility Types - Other
  FACILITY_TYPE_FIRE_STATION: 'Fire Station',
  FACILITY_TYPE_SCHOOL: 'School',
  FACILITY_TYPE_HOSPITAL: 'Hospital',
  FACILITY_TYPE_PARK: 'Park',
  FACILITY_TYPE_CINEMA: 'Cinema',
  
  // Legacy facility type names (for backward compatibility)
  MINE: 'Mining Facility',
  QUARRY: 'Quarry',
  FOREST: 'Forest',
  FARM: 'Farm',
  RANCH: 'Ranch',
  FISHERY: 'Fishery',
  
  // Facility Types - Functional
  FACTORY: 'Factory',
  MALL: 'Shopping Mall',
  WAREHOUSE: 'Warehouse',
  MEDIA_BUILDING: 'Media Building',
  
  // Facility Types - Infrastructure
  WATER_PLANT: 'Water Plant',
  POWER_PLANT: 'Power Plant',
  BASE_STATION: 'Base Station',
  
  // Facility Types - Other
  FIRE_STATION: 'Fire Station',
  SCHOOL: 'School',
  HOSPITAL: 'Hospital',
  PARK: 'Park',
  CINEMA: 'Cinema',
  
  // Facility Type Descriptions
  FACILITY_TYPE_MINE_DESCRIPTION: 'Mining operations for extracting precious metals and minerals from underground deposits',
  FACILITY_TYPE_QUARRY_DESCRIPTION: 'Stone and granite extraction operations for construction materials and aggregates',
  FACILITY_TYPE_FOREST_DESCRIPTION: 'Sustainable timber harvesting operations with environmental conservation practices',
  FACILITY_TYPE_FARM_DESCRIPTION: 'Multi-crop farming operations producing grains, vegetables, and agricultural products',
  FACILITY_TYPE_RANCH_DESCRIPTION: 'Livestock operations for cattle, poultry, and animal husbandry with processing facilities',
  FACILITY_TYPE_FISHERY_DESCRIPTION: 'Marine and freshwater fishing operations with processing and distribution capabilities',
  FACILITY_TYPE_FACTORY_DESCRIPTION: 'Manufacturing facilities producing consumer goods, electronics, and industrial products',
  FACILITY_TYPE_MALL_DESCRIPTION: 'Large retail complexes with multiple stores, restaurants, and entertainment venues',
  FACILITY_TYPE_WAREHOUSE_DESCRIPTION: 'Large-scale storage and distribution centers for logistics and supply chain management',
  FACILITY_TYPE_MEDIA_BUILDING_DESCRIPTION: 'Media production and broadcasting facilities for television, radio, and digital content',
  FACILITY_TYPE_WATER_PLANT_DESCRIPTION: 'Water treatment and purification facilities providing clean water distribution',
  FACILITY_TYPE_POWER_PLANT_DESCRIPTION: 'Clean energy power generation facilities using renewable and sustainable sources',
  FACILITY_TYPE_BASE_STATION_DESCRIPTION: 'Telecommunications infrastructure hubs providing network connectivity and communications',
  FACILITY_TYPE_FIRE_STATION_DESCRIPTION: 'Emergency response facilities providing fire safety, rescue operations, and emergency medical services',
  FACILITY_TYPE_SCHOOL_DESCRIPTION: 'Educational institutions providing primary, secondary, and vocational training programs',
  FACILITY_TYPE_HOSPITAL_DESCRIPTION: 'Full-service medical facilities with emergency care, surgery, and specialized treatments',
  FACILITY_TYPE_PARK_DESCRIPTION: 'Public recreational spaces with gardens, sports facilities, and community gathering areas',
  FACILITY_TYPE_CINEMA_DESCRIPTION: 'Entertainment venues with multiple screens, premium audio-visual systems, and concessions',
  
  // Legacy facility type descriptions (for backward compatibility)
  MINE_DESCRIPTION: 'Mining operations for extracting precious metals and minerals',
  QUARRY_DESCRIPTION: 'Stone and granite extraction for construction materials',
  FOREST_DESCRIPTION: 'Sustainable timber harvesting operations',
  FARM_DESCRIPTION: 'Multi-crop farming for grains and vegetables',
  RANCH_DESCRIPTION: 'Livestock operations for cattle and poultry',
  FISHERY_DESCRIPTION: 'Marine fishing operations with processing capabilities',
  FACTORY_DESCRIPTION: 'Manufacturing facilities for producing consumer goods',
  MALL_DESCRIPTION: 'Retail complexes with multiple stores and entertainment',
  WAREHOUSE_DESCRIPTION: 'Large-scale storage and distribution centers',
  MEDIA_BUILDING_DESCRIPTION: 'Media production and broadcasting facilities',
  WATER_PLANT_DESCRIPTION: 'Water purification and distribution facilities',
  POWER_PLANT_DESCRIPTION: 'Clean energy power generation facilities',
  BASE_STATION_DESCRIPTION: 'Telecommunications infrastructure hubs',
  FIRE_STATION_DESCRIPTION: 'Emergency response and fire safety facilities',
  SCHOOL_DESCRIPTION: 'Educational facilities for secondary education',
  HOSPITAL_DESCRIPTION: 'Full-service medical facilities with emergency care',
  PARK_DESCRIPTION: 'Public recreational spaces with gardens and sports',
  CINEMA_DESCRIPTION: 'Movie theaters with multiple screens and amenities',
  
  // Status
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  ENABLED: 'Enabled',
  DISABLED: 'Disabled',
  DELETED: 'Deleted',
  
  // Filters and Search
  SEARCH_PLACEHOLDER: 'Search facilities by name, type, or description...',
  FILTER_BY_TYPE: 'Filter by Type',
  FILTER_BY_CATEGORY: 'Filter by Category',
  FILTER_BY_STATUS: 'Filter by Status',
  ALL_TYPES: 'All Types',
  ALL_CATEGORIES: 'All Categories',
  ALL_STATUSES: 'All Statuses',
  APPLY_FILTERS: 'Apply Filters',
  CLEAR_FILTERS: 'Clear Filters',
  ADVANCED_FILTERS: 'Advanced Filters',
  
  // Statistics Cards
  TOTAL_FACILITIES: 'Total Facilities',
  ACTIVE_FACILITIES: 'Active Facilities',
  INACTIVE_FACILITIES: 'Inactive Facilities',
  FACILITIES_BY_CATEGORY: 'Facilities by Category',
  FACILITIES_BY_TYPE: 'Facilities by Type',
  CATEGORY_BREAKDOWN: 'Category Breakdown',
  TYPE_BREAKDOWN: 'Type Breakdown',
  
  // Facility Form
  FACILITY_FORM_CREATE_TITLE: 'Create New Facility',
  FACILITY_FORM_EDIT_TITLE: 'Edit Facility',
  FACILITY_FORM_BASIC_INFO: 'Basic Information',
  FACILITY_FORM_COST_INFO: 'Cost Information',
  FACILITY_FORM_ADVANCED_INFO: 'Advanced Settings',
  
  // Form Fields
  NAME_LABEL: 'Facility Name',
  NAME_PLACEHOLDER: 'Enter facility name',
  TYPE_LABEL: 'Facility Type',
  TYPE_PLACEHOLDER: 'Select facility type',
  CATEGORY_LABEL: 'Category',
  CATEGORY_PLACEHOLDER: 'Select category',
  DESCRIPTION_LABEL: 'Description',
  DESCRIPTION_PLACEHOLDER: 'Enter facility description (optional)',
  CAPACITY_LABEL: 'Capacity',
  CAPACITY_PLACEHOLDER: 'Enter capacity',
  BUILD_COST_LABEL: 'Build Cost',
  BUILD_COST_PLACEHOLDER: 'Enter build cost',
  MAINTENANCE_COST_LABEL: 'Maintenance Cost (Monthly)',
  MAINTENANCE_COST_PLACEHOLDER: 'Enter monthly maintenance cost',
  OPERATION_COST_LABEL: 'Operation Cost (Daily)',
  OPERATION_COST_PLACEHOLDER: 'Enter daily operation cost',
  STATUS_LABEL: 'Status',
  ACTIVE_STATUS_LABEL: 'Active',
  INACTIVE_STATUS_LABEL: 'Inactive',
  
  // Validation Messages
  NAME_REQUIRED: 'Facility name is required',
  NAME_MIN_LENGTH: 'Facility name must be at least 2 characters',
  NAME_MAX_LENGTH: 'Facility name cannot exceed 100 characters',
  TYPE_REQUIRED: 'Facility type is required',
  CATEGORY_REQUIRED: 'Category is required',
  TYPE_CATEGORY_MISMATCH: 'Selected facility type does not match the selected category',
  CAPACITY_INVALID: 'Capacity must be a positive number',
  COST_INVALID: 'Cost must be a positive number',
  DESCRIPTION_MAX_LENGTH: 'Description cannot exceed 500 characters',
  
  // Configuration Management
  CONFIG_MANAGEMENT: 'Configuration Management',
  CONFIG_MANAGEMENT_SUBTITLE: 'Manage default configurations and templates for facility types.',
  CREATE_CONFIG: 'Create Configuration',
  EDIT_CONFIG: 'Edit Configuration',
  DELETE_CONFIG: 'Delete Configuration',
  RESTORE_CONFIG: 'Restore Configuration',
  INITIALIZE_DEFAULTS: 'Initialize Default Configurations',
  
  // Configuration Fields
  DEFAULT_CAPACITY: 'Default Capacity',
  DEFAULT_BUILD_COST: 'Default Build Cost',
  DEFAULT_MAINTENANCE_COST: 'Default Maintenance Cost',
  DEFAULT_OPERATION_COST: 'Default Operation Cost',
  MIN_CAPACITY: 'Minimum Capacity',
  MAX_CAPACITY: 'Maximum Capacity',
  CONFIG_DATA: 'Configuration Data',
  CONFIG_TEMPLATE: 'Configuration Template',
  
  // Configuration Statistics
  TOTAL_CONFIGS: 'Total Configurations',
  ACTIVE_CONFIGS: 'Active Configurations',
  INACTIVE_CONFIGS: 'Inactive Configurations',
  CONFIGS_BY_CATEGORY: 'Configurations by Category',
  
  // Actions and Buttons
  SAVE: 'Save',
  CANCEL: 'Cancel',
  DELETE: 'Delete',
  CONFIRM: 'Confirm',
  CREATE: 'Create',
  UPDATE: 'Update',
  CLOSE: 'Close',
  EDIT: 'Edit',
  VIEW: 'View',
  RESTORE: 'Restore',
  DUPLICATE: 'Duplicate',
  EXPORT: 'Export',
  IMPORT: 'Import',
  SELECT_ALL: 'Select All',
  DESELECT_ALL: 'Deselect All',
  
  // Confirmation Messages
  DELETE_FACILITY_CONFIRM: 'Are you sure you want to delete this facility?',
  DELETE_FACILITY_WARNING: 'This action will soft delete the facility. It can be restored later.',
  DELETE_CONFIG_CONFIRM: 'Are you sure you want to delete this configuration?',
  DELETE_CONFIG_WARNING: 'This action will soft delete the configuration. It can be restored later.',
  RESTORE_FACILITY_CONFIRM: 'Are you sure you want to restore this facility?',
  RESTORE_CONFIG_CONFIRM: 'Are you sure you want to restore this configuration?',
  TOGGLE_STATUS_CONFIRM: 'Are you sure you want to change the status of this facility?',
  INITIALIZE_DEFAULTS_CONFIRM: 'This will create default configurations for all facility types. Continue?',
  
  // Success Messages
  FACILITY_CREATED_SUCCESS: 'Facility created successfully',
  FACILITY_UPDATED_SUCCESS: 'Facility updated successfully',
  FACILITY_DELETED_SUCCESS: 'Facility deleted successfully',
  FACILITY_RESTORED_SUCCESS: 'Facility restored successfully',
  FACILITY_STATUS_UPDATED_SUCCESS: 'Facility status updated successfully',
  CONFIG_CREATED_SUCCESS: 'Configuration created successfully',
  CONFIG_UPDATED_SUCCESS: 'Configuration updated successfully',
  CONFIG_DELETED_SUCCESS: 'Configuration deleted successfully',
  CONFIG_RESTORED_SUCCESS: 'Configuration restored successfully',
  DEFAULTS_INITIALIZED_SUCCESS: 'Default configurations initialized successfully',
  
  // Error Messages
  FACILITY_LOAD_ERROR: 'Failed to load facilities',
  FACILITY_CREATE_ERROR: 'Failed to create facility',
  FACILITY_UPDATE_ERROR: 'Failed to update facility',
  FACILITY_DELETE_ERROR: 'Failed to delete facility',
  FACILITY_RESTORE_ERROR: 'Failed to restore facility',
  CONFIG_LOAD_ERROR: 'Failed to load configurations',
  CONFIG_CREATE_ERROR: 'Failed to create configuration',
  CONFIG_UPDATE_ERROR: 'Failed to update configuration',
  CONFIG_DELETE_ERROR: 'Failed to delete configuration',
  CONFIG_RESTORE_ERROR: 'Failed to restore configuration',
  DEFAULTS_INITIALIZE_ERROR: 'Failed to initialize default configurations',
  STATISTICS_LOAD_ERROR: 'Failed to load statistics',
  NETWORK_ERROR: 'Network error occurred',
  PERMISSION_ERROR: 'You do not have permission to perform this action',
  VALIDATION_ERROR: 'Please fix validation errors before proceeding',
  
  // Pagination
  ROWS_PER_PAGE: 'Rows per page',
  PAGE_OF_PAGES: 'Page {{page}} of {{totalPages}}',
  SHOWING_RESULTS: 'Showing {{start}}-{{end}} of {{total}} results',
  NO_RESULTS: 'No facilities found',
  NO_CONFIGS: 'No configurations found',
  
  // Data States
  LOADING: 'Loading...',
  LOADING_FACILITIES: 'Loading facilities...',
  LOADING_CONFIGS: 'Loading configurations...',
  LOADING_STATISTICS: 'Loading statistics...',
  NO_DATA: 'No data available',
  NO_FACILITIES_FOUND: 'No facilities found',
  NO_CONFIGS_FOUND: 'No configurations found',
  EMPTY_STATE_MESSAGE: 'No facilities have been created yet.',
  EMPTY_CONFIG_STATE_MESSAGE: 'No configurations have been created yet.',
  CREATE_FIRST_FACILITY: 'Create your first facility',
  CREATE_FIRST_CONFIG: 'Create your first configuration',
  
  // Sorting
  SORT_BY_NAME: 'Sort by Name',
  SORT_BY_TYPE: 'Sort by Type',
  SORT_BY_CATEGORY: 'Sort by Category',
  SORT_BY_CREATED: 'Sort by Created Date',
  SORT_BY_UPDATED: 'Sort by Updated Date',
  SORT_ASCENDING: 'Sort Ascending',
  SORT_DESCENDING: 'Sort Descending',
  
  // Tooltips and Help
  CAPACITY_TOOLTIP: 'Maximum operational capacity of the facility',
  BUILD_COST_TOOLTIP: 'Initial construction cost in USD',
  MAINTENANCE_COST_TOOLTIP: 'Monthly maintenance cost in USD',
  OPERATION_COST_TOOLTIP: 'Daily operational cost in USD',
  CONFIG_DATA_TOOLTIP: 'Additional configuration parameters in JSON format',
  TYPE_CATEGORY_HELP: 'Facility type must match the selected category',
  COST_HELP: 'All cost fields are optional but must be positive if provided',
  
  // Bulk Operations
  BULK_OPERATIONS: 'Bulk Operations',
  BULK_UPDATE: 'Bulk Update',
  BULK_DELETE: 'Bulk Delete',
  BULK_RESTORE: 'Bulk Restore',
  BULK_EXPORT: 'Bulk Export',
  SELECT_FACILITIES: 'Select facilities to perform bulk operations',
  SELECTED_COUNT: '{{count}} selected',
  
  // Export/Import
  EXPORT_FACILITIES: 'Export Facilities',
  EXPORT_CONFIGS: 'Export Configurations',
  EXPORT_FORMAT: 'Export Format',
  CSV_FORMAT: 'CSV',
  EXCEL_FORMAT: 'Excel',
  JSON_FORMAT: 'JSON',
  IMPORT_FACILITIES: 'Import Facilities',
  IMPORT_CONFIGS: 'Import Configurations',
  
  // Currency and Number Formatting
  CURRENCY_SYMBOL: '$',
  NOT_AVAILABLE: 'N/A',
  UNLIMITED: 'Unlimited',
  
  // Time and Dates
  CREATED: 'Created',
  UPDATED: 'Updated',
  DELETED: 'Deleted',
  NEVER: 'Never',
  TODAY: 'Today',
  YESTERDAY: 'Yesterday',
  DAYS_AGO: '{{count}} days ago',
  
  // Misc
  OPTIONAL: 'Optional',
  REQUIRED: 'Required',
  YES: 'Yes',
  NO: 'No',
  ALL: 'All',
  NONE: 'None',
  DEFAULT: 'Default',
  CUSTOM: 'Custom',
  SETTINGS: 'Settings',
  PREFERENCES: 'Preferences',
  
  // Help and Documentation
  HELP: 'Help',
  DOCUMENTATION: 'Documentation',
  USER_GUIDE: 'User Guide',
  FAQ: 'Frequently Asked Questions',
  SUPPORT: 'Support',
  CONTACT_SUPPORT: 'Contact Support',
  
  // Tabs
  FACILITY_LIST_TAB: 'Facility List',
  CONFIGURATIONS_TAB: 'Configurations',
  STATISTICS_TAB: 'Statistics',
  SETTINGS_TAB: 'Settings',
  
  // Loading and empty states
  LOADING_CONFIGURATIONS: 'Loading configurations...',
  NO_CONFIGURATIONS_FOUND: 'No configurations found',
  CREATE_FIRST_CONFIGURATION: 'Create First Configuration',
  
  // Configuration specific
  CONFIGURATION_STATISTICS: 'Configuration Statistics',
  TOTAL_CONFIGURATIONS: 'Total Configurations',
  ACTIVE_CONFIGURATIONS: 'Active Configurations',
  INACTIVE_CONFIGURATIONS: 'Inactive Configurations',
  DELETED_CONFIGURATIONS: 'Deleted Configurations',
  SEARCH_CONFIGURATIONS_PLACEHOLDER: 'Search configurations...',
  CONFIGURATION_DETAILS: 'Configuration Details',
  
  // Initialize default configurations
  INITIALIZE_DEFAULT_CONFIGURATIONS: 'Initialize Default Configurations',
  INITIALIZE_DEFAULT_CONFIGURATIONS_MESSAGE: 'This will create default configuration templates for all facility types. Existing configurations will not be affected.',
  INITIALIZE_SUCCESS: 'Successfully initialized {{count}} default configurations',
  INITIALIZING: 'Initializing...',
  INITIALIZE: 'Initialize',
  
  // Configuration form specific
  BASIC_INFORMATION: 'Basic Information',
  CAPACITY_CONFIGURATION: 'Capacity Configuration',
  COST_CONFIGURATION: 'Cost Configuration',
  BUILD_COST: 'Build Cost',
  MAINTENANCE_COST: 'Maintenance Cost',
  OPERATION_COST: 'Operation Cost',
  ACTIVE_CONFIGURATION: 'Active Configuration',
  
  // Cost and capacity fields
  MIN_CAPACITY: 'Min Capacity',
  MAX_CAPACITY: 'Max Capacity',
  DEFAULT_CAPACITY: 'Default Capacity',
  MIN_BUILD_COST: 'Min Build Cost',
  MAX_BUILD_COST: 'Max Build Cost',
  DEFAULT_BUILD_COST: 'Default Build Cost',
  MIN_MAINTENANCE_COST: 'Min Maintenance Cost',
  MAX_MAINTENANCE_COST: 'Max Maintenance Cost',
  DEFAULT_MAINTENANCE_COST: 'Default Maintenance Cost',
  MIN_OPERATION_COST: 'Min Operation Cost',
  MAX_OPERATION_COST: 'Max Operation Cost',
  DEFAULT_OPERATION_COST: 'Default Operation Cost',
  
  // Validation messages
  MIN_CAPACITY_REQUIRED: 'Minimum capacity is required',
  MAX_CAPACITY_REQUIRED: 'Maximum capacity is required',
  MIN_BUILD_COST_REQUIRED: 'Minimum build cost is required',
  MAX_BUILD_COST_REQUIRED: 'Maximum build cost is required',
  MIN_MAINTENANCE_COST_REQUIRED: 'Minimum maintenance cost is required',
  MAX_MAINTENANCE_COST_REQUIRED: 'Maximum maintenance cost is required',
  MIN_OPERATION_COST_REQUIRED: 'Minimum operation cost is required',
  MAX_OPERATION_COST_REQUIRED: 'Maximum operation cost is required',
  MAX_CAPACITY_ERROR: 'Maximum capacity must be greater than or equal to minimum capacity',
  MAX_BUILD_COST_ERROR: 'Maximum build cost must be greater than or equal to minimum build cost',
  MAX_MAINTENANCE_COST_ERROR: 'Maximum maintenance cost must be greater than or equal to minimum maintenance cost',
  MAX_OPERATION_COST_ERROR: 'Maximum operation cost must be greater than or equal to minimum operation cost',
  DEFAULT_VALUE_OUT_OF_RANGE: 'Default value must be between {{min}} and {{max}}',
  INVALID_TYPE_CATEGORY_COMBINATION: 'This facility type is not valid for the selected category',
  
  // Configuration actions
  CREATE_CONFIGURATION: 'Create Configuration',
  EDIT_CONFIGURATION: 'Edit Configuration',
  UPDATE_CONFIGURATION: 'Update Configuration',
  DELETE_CONFIGURATION_CONFIRMATION_MESSAGE: 'Are you sure you want to delete the configuration for {{type}}? This action cannot be undone.',
  RESTORE_CONFIGURATION_CONFIRMATION_MESSAGE: 'Are you sure you want to restore the configuration for {{type}}?',
  CONFIRM_DELETE_CONFIGURATION: 'Confirm Delete Configuration',
  CONFIRM_RESTORE_CONFIGURATION: 'Confirm Restore Configuration',
  
  // Error messages
  ERROR_LOADING_CONFIGURATIONS: 'Error loading configurations',
  ERROR_CREATING_CONFIGURATION: 'Error creating configuration',
  ERROR_UPDATING_CONFIGURATION: 'Error updating configuration',
  ERROR_DELETING_CONFIGURATION: 'Error deleting configuration',
  ERROR_RESTORING_CONFIGURATION: 'Error restoring configuration',
  ERROR_INITIALIZING_CONFIGURATIONS: 'Error initializing default configurations',
  ERROR_INVALID_RESPONSE: 'Invalid response from server. Please try again.',
  
  // Table headers
  CAPACITY_RANGE: 'Capacity Range',
  BUILD_COST_RANGE: 'Build Cost Range',
  
  // Tooltips and Help Text
  FACILITY_TYPE_TOOLTIP: 'Select the type of facility you want to create',
  CATEGORY_TOOLTIP: 'Facilities are grouped into categories based on their primary function',
  CAPACITY_TOOLTIP: 'The maximum number of units this facility can handle or produce',
  BUILD_COST_TOOLTIP: 'One-time cost required to construct this facility',
  MAINTENANCE_COST_TOOLTIP: 'Monthly cost required to maintain this facility in operational condition',
  OPERATION_COST_TOOLTIP: 'Daily cost required to operate this facility at full capacity',
  // Advanced features continued
  IMPORT_SUCCESS: 'Successfully imported {{count}} facilities',
  EXPORT_SUCCESS: 'Successfully exported {{count}} facilities',
  
  // Advanced features
  FACILITY_TEMPLATES: 'Facility Templates',
  SAVE_AS_TEMPLATE: 'Save as Template',
  LOAD_FROM_TEMPLATE: 'Load from Template',
  FACILITY_GROUPS: 'Facility Groups',
  CREATE_GROUP: 'Create Group',
  ASSIGN_TO_GROUP: 'Assign to Group',
  
  // Performance metrics
  FACILITY_UTILIZATION: 'Facility Utilization',
  EFFICIENCY_RATING: 'Efficiency Rating',
  MAINTENANCE_SCHEDULE: 'Maintenance Schedule',
  OPERATIONAL_STATUS: 'Operational Status',
  
  // Environmental impact
  ENVIRONMENTAL_IMPACT: 'Environmental Impact',
  ENVIRONMENTAL_IMPACT_HIGH: 'High Impact',
  ENVIRONMENTAL_IMPACT_MEDIUM: 'Medium Impact',
  ENVIRONMENTAL_IMPACT_LOW: 'Low Impact',
  ENVIRONMENTAL_IMPACT_POSITIVE: 'Positive Impact',
  ENVIRONMENTAL_IMPACT_NEUTRAL: 'Neutral Impact',
  
  // Resource requirements
  RESOURCE_REQUIREMENTS: 'Resource Requirements',
  ENERGY_CONSUMPTION: 'Energy Consumption',
  WATER_USAGE: 'Water Usage',
  REQUIRED_WORKERS: 'Required Workers',
  SPECIAL_REQUIREMENTS: 'Special Requirements',
  
  // Upgrade options
  UPGRADE_OPTIONS: 'Upgrade Options',
  AVAILABLE_UPGRADES: 'Available Upgrades',
  UPGRADE_COST: 'Upgrade Cost',
  UPGRADE_BENEFITS: 'Upgrade Benefits',
  
  // Accessibility
  ACCESSIBILITY_FEATURES: 'Accessibility Features',
  WHEELCHAIR_ACCESSIBLE: 'Wheelchair Accessible',
  HEARING_IMPAIRED_SUPPORT: 'Hearing Impaired Support',
  VISUAL_IMPAIRED_SUPPORT: 'Visual Impaired Support',
  
  // Safety and compliance
  SAFETY_RATING: 'Safety Rating',
  COMPLIANCE_STATUS: 'Compliance Status',
  SAFETY_PROTOCOLS: 'Safety Protocols',
  EMERGENCY_PROCEDURES: 'Emergency Procedures',
  
  // Additional form fields
  LOCATION: 'Location',
  COORDINATES: 'Coordinates',
  ADDRESS: 'Address',
  CONTACT_INFORMATION: 'Contact Information',
  MANAGER: 'Manager',
  PHONE_NUMBER: 'Phone Number',
  EMAIL_ADDRESS: 'Email Address',
  
  // Success messages
  FACILITY_CREATED_SUCCESS: 'Facility created successfully',
  FACILITY_UPDATED_SUCCESS: 'Facility updated successfully',
  FACILITY_DELETED_SUCCESS: 'Facility deleted successfully',
  FACILITY_RESTORED_SUCCESS: 'Facility restored successfully',
  CONFIGURATION_CREATED_SUCCESS: 'Configuration created successfully',
  CONFIGURATION_UPDATED_SUCCESS: 'Configuration updated successfully',
  
  // Confirmation dialogs
  UNSAVED_CHANGES_WARNING: 'You have unsaved changes. Are you sure you want to leave?',
  DELETE_CONFIRMATION_TITLE: 'Confirm Deletion',
  RESTORE_CONFIRMATION_TITLE: 'Confirm Restoration',
  
  // Loading states
  LOADING_FACILITIES: 'Loading facilities...',
  SAVING_FACILITY: 'Saving facility...',
  DELETING_FACILITY: 'Deleting facility...',
  RESTORING_FACILITY: 'Restoring facility...',

  // Wizard steps and descriptions
  CAPACITY_SETTINGS: 'Capacity Settings',
  COST_SETTINGS: 'Cost Settings',
  CAPACITY_AND_COSTS: 'Capacity & Costs',
  SELECT_FACILITY_TYPE_DESCRIPTION: 'Choose the category and type of facility you want to configure. This determines the basic properties and constraints.',
  SET_CAPACITY_DESCRIPTION: 'Define the operational capacity for this facility type. This represents the maximum units it can handle.',
  SET_COST_DESCRIPTION: 'Set the financial parameters for building and operating this facility.',
  
  // Advanced options
  ADVANCED_OPTIONS: 'Advanced Options',
  ADVANCED_OPTIONS_TOOLTIP: 'Configure detailed min/max ranges and constraints for advanced users',
  ADVANCED_OPTIONS_DESCRIPTION: 'Define minimum and maximum ranges to provide flexibility when creating facilities of this type.',
  COST_RANGES: 'Cost Ranges',
  BUILD_COST_RANGE: 'Build Cost Range',
  MAINTENANCE_COST_RANGE: 'Maintenance Cost Range',
  OPERATION_COST_RANGE: 'Operation Cost Range',
  
  // Navigation
  BACK: 'Back',
  NEXT: 'Next',
  MIN: 'Min',
  MAX: 'Max',

  // Additional validation messages  
  DEFAULT_CAPACITY_REQUIRED: 'Default capacity is required',
  DEFAULT_BUILD_COST_REQUIRED: 'Default build cost is required',
  DEFAULT_MAINTENANCE_COST_REQUIRED: 'Default maintenance cost is required',
  DEFAULT_OPERATION_COST_REQUIRED: 'Default operation cost is required',
};

export default facilityManagement; 