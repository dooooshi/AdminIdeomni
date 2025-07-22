const activityManagement = {
  // Page titles and headers
  ACTIVITY_MANAGEMENT: 'Activity Management',
  ACTIVITY_MANAGEMENT_SUBTITLE: 'Manage business simulation activities and monitor participation.',
  ACTIVITY_LIST: 'Activities',
  ACTIVITY_STATISTICS: 'Statistics',
  UPCOMING_ACTIVITIES: 'Upcoming Activities',
  ONGOING_ACTIVITIES: 'Ongoing Activities',
  
  // Common actions
  CREATE_ACTIVITY: 'Create Activity',
  EDIT_ACTIVITY: 'Edit Activity',
  DELETE_ACTIVITY: 'Delete Activity',
  RESTORE_ACTIVITY: 'Restore Activity',
  VIEW_ACTIVITY: 'View Activity',
  DUPLICATE_ACTIVITY: 'Duplicate Activity',
  REFRESH_DATA: 'Refresh Data',
  
  // Activity List Table Headers
  ACTIVITY_NAME: 'Activity Name',
  ACTIVITY_TYPE: 'Type',
  START_DATE: 'Start Date',
  END_DATE: 'End Date',
  DURATION: 'Duration',
  STATUS: 'Status',
  CREATED_BY: 'Created By',
  CREATED_AT: 'Created',
  UPDATED_AT: 'Updated',
  ACTIONS: 'Actions',
  PARTICIPANTS: 'Participants',
  
  // Activity Types
  BIZSIMULATION2_0: 'Business Simulation 2.0',
  BIZSIMULATION2_2: 'Business Simulation 2.2',
  BIZSIMULATION3_1: 'Business Simulation 3.1',
  ACTIVITY_TYPE_LABEL: 'Activity Type',
  
  // Activity Status
  UPCOMING: 'Upcoming',
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  DELETED: 'Deleted',
  
  // Filters and Search
  SEARCH_ACTIVITIES: 'Search activities...',
  FILTER_BY_TYPE: 'Filter by Type',
  FILTER_BY_STATUS: 'Filter by Status',
  FILTER_BY_CREATOR: 'Filter by Creator',
  FILTER_BY_DATE_RANGE: 'Filter by Date Range',
  ALL_TYPES: 'All Types',
  ALL_STATUSES: 'All Statuses',
  ALL_CREATORS: 'All Creators',
  DATE_FROM: 'From Date',
  DATE_TO: 'To Date',
  INCLUDE_DELETED: 'Include Deleted',
  APPLY_FILTERS: 'Apply Filters',
  CLEAR_FILTERS: 'Clear Filters',
  
  // Statistics Cards
  TOTAL_ACTIVITIES: 'Total Activities',
  ACTIVE_ACTIVITIES: 'Active Activities',
  UPCOMING_COUNT: 'Upcoming',
  ONGOING_COUNT: 'Ongoing',
  COMPLETED_COUNT: 'Completed',
  BY_TYPE_DISTRIBUTION: 'Distribution by Type',
  
  // Activity Form
  ACTIVITY_FORM_CREATE_TITLE: 'Create New Activity',
  ACTIVITY_FORM_EDIT_TITLE: 'Edit Activity',
  ACTIVITY_BASIC_INFO: 'Basic Information',
  ACTIVITY_SCHEDULE: 'Schedule',
  ACTIVITY_SETTINGS: 'Settings',
  
  // Form Fields
  ACTIVITY_NAME_LABEL: 'Activity Name',
  ACTIVITY_NAME_PLACEHOLDER: 'Enter activity name',
  ACTIVITY_TYPE_PLACEHOLDER: 'Select activity type',
  DESCRIPTION_LABEL: 'Description',
  DESCRIPTION_PLACEHOLDER: 'Enter activity description (optional)',
  START_DATE_LABEL: 'Start Date & Time',
  END_DATE_LABEL: 'End Date & Time',
  IS_ACTIVE_LABEL: 'Active Status',
  IS_ACTIVE_HELPER: 'Inactive activities are hidden from participants',
  
  // Map Template Fields
  MAP_TEMPLATE_CONFIGURATION: 'Map Template Configuration',
  MAP_TEMPLATE_LABEL: 'Map Template',
  MAP_TEMPLATE_PLACEHOLDER: 'Select a map template',
  MAP_TEMPLATE_EDIT_DISABLED: 'Map template cannot be changed when editing activities',
  LOADING_TEMPLATES: 'Loading templates...',
  NO_MAP_TEMPLATES_FOUND: 'No map templates available',
  NO_DESCRIPTION: 'No description available',
  
  // Form Validation Messages
  ACTIVITY_NAME_REQUIRED: 'Activity name is required',
  ACTIVITY_NAME_MIN_LENGTH: 'Activity name must be at least 3 characters',
  ACTIVITY_NAME_MAX_LENGTH: 'Activity name must not exceed 200 characters',
  ACTIVITY_TYPE_REQUIRED: 'Activity type is required',
  ACTIVITY_TYPE_INVALID: 'Please select a valid activity type',
  START_DATE_REQUIRED: 'Start date and time is required',
  END_DATE_REQUIRED: 'End date and time is required',
  END_DATE_AFTER_START: 'End date must be after start date',
  DESCRIPTION_MAX_LENGTH: 'Description must not exceed 1000 characters',
  FUTURE_START_DATE: 'Start date must be in the future',
  VALID_DATE_RANGE: 'Please select a valid date range',
  MAP_TEMPLATE_REQUIRED: 'Map template is required',
  MAP_TEMPLATE_INVALID: 'Please select a valid map template',
  
  // Form Actions
  UPDATE_ACTIVITY: 'Update Activity',
  SAVING: 'Saving...',
  CANCEL: 'Cancel',
  SAVE_DRAFT: 'Save as Draft',
  
  // Delete Dialog
  DELETE_ACTIVITY_TITLE: 'Delete Activity',
  DELETE_ACTIVITY_MESSAGE: 'Are you sure you want to delete "{{activityName}}"? This action can be undone by super administrators.',
  DELETE_ACTIVITY_WARNING: 'Participants will no longer have access to this activity.',
  DELETE_CONFIRM: 'Delete',
  DELETE_CANCEL: 'Cancel',
  
  // Restore Dialog
  RESTORE_ACTIVITY_TITLE: 'Restore Activity',
  RESTORE_ACTIVITY_MESSAGE: 'Are you sure you want to restore "{{activityName}}"?',
  RESTORE_CONFIRM: 'Restore',
  RESTORE_CANCEL: 'Cancel',
  
  // Success Messages
  ACTIVITY_CREATED_SUCCESS: 'Activity "{{activityName}}" has been created successfully.',
  ACTIVITY_UPDATED_SUCCESS: 'Activity "{{activityName}}" has been updated successfully.',
  ACTIVITY_DELETED_SUCCESS: 'Activity "{{activityName}}" has been deleted successfully.',
  ACTIVITY_RESTORED_SUCCESS: 'Activity "{{activityName}}" has been restored successfully.',
  
  // Error Messages
  ACTIVITY_LOAD_ERROR: 'Failed to load activities. Please try again.',
  ACTIVITY_CREATE_ERROR: 'Failed to create activity. Please try again.',
  ACTIVITY_UPDATE_ERROR: 'Failed to update activity. Please try again.',
  ACTIVITY_DELETE_ERROR: 'Failed to delete activity. Please try again.',
  ACTIVITY_RESTORE_ERROR: 'Failed to restore activity. Please try again.',
  ACTIVITY_NOT_FOUND: 'Activity not found.',
  STATISTICS_LOAD_ERROR: 'Failed to load activity statistics.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  
  // Loading States
  LOADING_ACTIVITIES: 'Loading activities...',
  LOADING_STATISTICS: 'Loading statistics...',
  CREATING_ACTIVITY: 'Creating activity...',
  UPDATING_ACTIVITY: 'Updating activity...',
  DELETING_ACTIVITY: 'Deleting activity...',
  RESTORING_ACTIVITY: 'Restoring activity...',
  
  // Empty States
  NO_ACTIVITIES_FOUND: 'No activities found',
  NO_ACTIVITIES_MESSAGE: 'There are no activities matching your criteria. Try adjusting your filters or create a new activity.',
  NO_UPCOMING_ACTIVITIES: 'No upcoming activities',
  NO_ONGOING_ACTIVITIES: 'No ongoing activities',
  CREATE_FIRST_ACTIVITY: 'Create your first activity to get started.',
  
  // Pagination
  ACTIVITIES_PER_PAGE: 'Activities per page',
  SHOWING_ACTIVITIES: 'Showing {{start}}-{{end}} of {{total}} activities',
  PAGE_INFO: 'Page {{page}} of {{totalPages}}',
  
  // Date and Time Formatting
  TODAY: 'Today',
  YESTERDAY: 'Yesterday',
  TOMORROW: 'Tomorrow',
  DAYS_AGO: '{{days}} days ago',
  DAYS_FROM_NOW: 'in {{days}} days',
  HOURS_AGO: '{{hours}} hours ago',
  HOURS_FROM_NOW: 'in {{hours}} hours',
  MINUTES_AGO: '{{minutes}} minutes ago',
  MINUTES_FROM_NOW: 'in {{minutes}} minutes',
  
  // Duration Formatting
  DURATION_DAYS: '{{days}} days',
  DURATION_HOURS: '{{hours}} hours',
  DURATION_MINUTES: '{{minutes}} minutes',
  DURATION_MULTI: '{{days}}d {{hours}}h {{minutes}}m',
  
  // Tooltips and Help Text
  ACTIVITY_TYPE_TOOLTIP: 'The type of business simulation activity',
  START_DATE_TOOLTIP: 'When participants can start accessing the activity',
  END_DATE_TOOLTIP: 'When the activity will automatically close',
  ACTIVE_STATUS_TOOLTIP: 'Whether participants can see and access this activity',
  DELETE_TOOLTIP: 'Soft delete this activity (can be restored)',
  RESTORE_TOOLTIP: 'Restore this deleted activity',
  EDIT_TOOLTIP: 'Edit activity details',
  VIEW_TOOLTIP: 'View activity details',
  
  // Accessibility Labels
  ACTIVITY_TABLE_CAPTION: 'List of business simulation activities',
  SEARCH_INPUT_LABEL: 'Search activities by name',
  TYPE_FILTER_LABEL: 'Filter activities by type',
  STATUS_FILTER_LABEL: 'Filter activities by status',
  SORT_BY_NAME: 'Sort by activity name',
  SORT_BY_DATE: 'Sort by date',
  SORT_BY_TYPE: 'Sort by activity type',
  
  // Export and Import
  EXPORT_ACTIVITIES: 'Export Activities',
  IMPORT_ACTIVITIES: 'Import Activities',
  EXPORT_TOOLTIP: 'Export activities to CSV or Excel',
  IMPORT_TOOLTIP: 'Import activities from CSV or Excel file',
  
  // Bulk Actions
  SELECT_ALL: 'Select All',
  DESELECT_ALL: 'Deselect All',
  BULK_DELETE: 'Delete Selected',
  BULK_ACTIVATE: 'Activate Selected',
  BULK_DEACTIVATE: 'Deactivate Selected',
  SELECTED_COUNT: '{{count}} selected',
  
  // Advanced Features
  DUPLICATE_ACTIVITY_TITLE: 'Duplicate Activity',
  DUPLICATE_ACTIVITY_MESSAGE: 'Create a copy of "{{activityName}}" with a new schedule?',
  SCHEDULE_CONFLICTS: 'Schedule Conflicts',
  OVERLAPPING_ACTIVITIES: 'This activity overlaps with existing activities',
  
  // Permissions
  SUPER_ADMIN_ONLY: 'This action is only available to super administrators',
  CREATOR_ONLY: 'You can only modify activities you created',
  READ_ONLY_ACCESS: 'You have read-only access to this activity',
};

export default activityManagement; 