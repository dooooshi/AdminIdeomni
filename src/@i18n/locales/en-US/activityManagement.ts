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
  BASIC_DURATION: 'Duration',
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
  ACTIVITY_STATUS_COMPLETED: 'Completed',
  ACTIVE: 'Active',
  ACTIVITY_STATUS_INACTIVE: 'Inactive',
  DELETED: 'Deleted',
  
  // Filters and Search
  SEARCH_ACTIVITIES: 'Search activities...',
  FILTER_BY_TYPE: 'Filter by Type',
  FILTER_BY_STATUS: 'Filter by Status',
  FILTER_BY_CREATOR: 'Filter by Creator',
  FILTER_BY_DATE_RANGE: 'Filter by Date Range',
  FILTER_ALL_TYPES: 'All Types',
  FILTER_ALL_STATUSES: 'All Statuses',
  ALL_CREATORS: 'All Creators',
  DATE_FROM: 'From Date',
  DATE_TO: 'To Date',
  INCLUDE_DELETED: 'Include Deleted',
  APPLY_FILTERS: 'Apply Filters',
  BASIC_CLEAR_FILTERS: 'Clear Filters',
  
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
  MAP_NO_DESCRIPTION: 'No description available',
  
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
  ACTIVITY_STATISTICS_LOAD_ERROR: 'Failed to load activity statistics.',
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

  // User-Activity Relationship Management
  PARTICIPANTS_MANAGEMENT: 'Participants Management',
  ACTIVITY_PARTICIPANTS: 'Activity Participants',
  PARTICIPANTS_LOAD_ERROR: 'Failed to load participants',
  NO_PARTICIPANTS_FOUND: 'No participants found',
  NO_PARTICIPANTS_MESSAGE: 'This activity has no participants yet.',
  ADD_FIRST_PARTICIPANTS: 'Add First Participants',
  
  // User Management Actions
  ADD_USERS: 'Add Users',
  REMOVE_USERS: 'Remove Users',
  ADD_USERS_TO_ACTIVITY: 'Add Users to Activity',
  REMOVE_USERS_FROM_ACTIVITY: 'Remove Users from Activity',
  REMOVE_SELECTED: 'Remove Selected',
  UPDATE_STATUS: 'Update Status',
  BULK_UPDATE_STATUS: 'Bulk Update Status',
  
  // User Status Management
  ENROLLED: 'Enrolled',
  PARTICIPANT_COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No Show',
  UPDATE_PARTICIPANT_STATUS: 'Update Participant Status',
  NEW_STATUS: 'New Status',
  CURRENT_STATUS: 'Current Status',
  STATUS_UPDATE_ERROR: 'Failed to update status',
  BULK_STATUS_UPDATE_ERROR: 'Failed to update statuses',
  
  // User Information
  USER: 'User',
  USER_TYPE: 'User Type',
  MANAGER: 'Manager',
  WORKER: 'Worker',
  STUDENT: 'Student',
  UNKNOWN: 'Unknown',
  ENROLLED_AT: 'Enrolled At',
  ADDED_BY: 'Added By',
  SYSTEM: 'System',
  USER_INACTIVE: 'Inactive',
  
  // Search and Filters
  SEARCH_PARTICIPANTS: 'Search Participants',
  SEARCH_BY_NAME_EMAIL: 'Search by name or email',
  PARTICIPANT_ALL_TYPES: 'All Types',
  PARTICIPANT_ALL_STATUSES: 'All Statuses',
  INCLUDE_INACTIVE_USERS: 'Include Inactive Users',
  FILTERS: 'Filters',
  
  // Statistics
  TOTAL_PARTICIPANTS: 'Total Participants',
  
  // User Operations
  SEARCH_USERS: 'Search Users',
  SEARCH_USERS_BY_NAME_EMAIL: 'Search users by name or email',
  TYPE_TO_SEARCH: 'Type to search...',
  SEARCHING_USERS: 'Searching users...',
  OPERATION_NO_USERS_FOUND: 'No users found',
  START_TYPING_TO_SEARCH: 'Start typing to search users',
  SELECTED_USERS: 'Selected Users',
  USERS_TO_REMOVE: 'Users to Remove',
  NO_USERS_SELECTED: 'No users selected',
  NO_USERS_SELECTED_ADD: 'Search and select users to add to this activity',
  NO_USERS_SELECTED_REMOVE: 'Select users from the participants list to remove',
  FAILED_TO_LOAD_USERS: 'Failed to load users',
  
  // Operation Details
  OPERATION_DETAILS: 'Operation Details',
  REASON: 'Reason',
  REASON_PLACEHOLDER: 'Enter reason for this operation (optional)',
  REASON_FOR_ADDING_USERS: 'Why are you adding these users to the activity?',
  REASON_FOR_REMOVING_USERS: 'Why are you removing these users from the activity?',
  BULK_REASON_PLACEHOLDER: 'Enter reason for bulk status update (optional)',
  SEND_EMAIL_NOTIFICATION: 'Send Email Notification',
  
  // Operation Results
  OPERATION_RESULTS: 'Operation Results',
  OPERATION_COMPLETED_AT: 'Operation completed at',
  TOTAL_PROCESSED: 'Total Processed',
  SUCCESSFUL: 'Successful',
  FAILED: 'Failed',
  DETAILED_RESULTS: 'Detailed Results',
  OPERATION_SUCCESSFUL: 'Operation successful',
  OPERATION_FAILED: 'Operation failed',
  PROCESSING: 'Processing...',
  CLOSE: 'Close',
  
  // User Activity History
  USER_ACTIVITY_HISTORY: 'User Activity History',
  LOADING_USER_INFO: 'Loading user information...',
  FAILED_TO_LOAD_USER: 'Failed to load user information',
  NO_ACTIVITY_HISTORY: 'No activity history',
  NO_ACTIVITY_HISTORY_MESSAGE: 'This user has no activity participation history.',
  HISTORY_LOADING_ACTIVITY_HISTORY: 'Loading activity history...',
  HISTORY_LOAD_ERROR: 'Failed to load activity history',
  
  // History Filters
  INCLUDE_UPCOMING: 'Include Upcoming',
  INCLUDE_PAST: 'Include Past',
  CANCELLED_NO_SHOW: 'Cancelled/No Show',
  
  // Time Status
  TIME_STATUS: 'Time Status',
  COMPLETED_TIME: 'Completed',
  ACTIVITY_DURATION: 'Duration',
  MINUTES: 'minutes',
  HOURS: 'hours',
  DAYS: 'days',
  
  // Activity Selection
  NO_ACTIVITY_SELECTED: 'No Activity Selected',
  SELECT_ACTIVITY_TO_MANAGE_PARTICIPANTS: 'Select an activity from the list to manage its participants',
  GO_TO_ACTIVITIES: 'Go to Activities',
  
  // Actions
  VIEW_PARTICIPANTS: 'View Participants',
  VIEW_USER_HISTORY: 'View User History',
  SEND_EMAIL: 'Send Email',
  ACTIONS_UPDATE_ALL: 'Update All',
  REFRESH: 'Refresh',
  
  // Participant Actions
  PARTICIPANTS_LOWERCASE: 'participants',

  // ============= COMPREHENSIVE ADMIN USER-ACTIVITY MANAGEMENT =============
  
  // Dashboard
  ADMIN_USER_ACTIVITY_DASHBOARD: 'Admin User-Activity Management Dashboard',
  COMPREHENSIVE_ADMIN_MANAGEMENT_DESCRIPTION: 'Comprehensive management system for user-activity relationships, team assignments, and analytics',
  LOADING_DASHBOARD: 'Loading dashboard...',
  REFRESH_DASHBOARD: 'Refresh Dashboard',
  SETTINGS: 'Settings',
  
  // Statistics Cards
  TOTAL_USERS: 'Total Users',
  REGISTERED_USERS: 'Registered Users',
  USERS_WITH_ACTIVITY: 'Users with Activity',
  USERS_WITHOUT_ACTIVITY: 'Users without Activity',
  ASSIGNED: 'Assigned',
  UNASSIGNED: 'Unassigned',
  TOTAL_TEAMS: 'Total Teams',
  STATS_AVERAGE_SIZE: 'Average Size',
  ASSIGNMENTS_TODAY: 'Assignments Today',
  ASSIGNMENTS_THIS_WEEK: 'This Week',
  ASSIGNMENTS_THIS_MONTH: 'This Month',
  RECENT_ACTIVITY: 'Recent Activity',
  
  // Tab Navigation
  USER_SEARCH_ASSIGNMENT: 'User Search & Assignment',
  TEAM_MANAGEMENT: 'Team Management',
  STATISTICS_ANALYTICS: 'Statistics & Analytics',
  EXPORT_REPORTS: 'Export & Reports',
  
  // Advanced User Search
  ADVANCED_USER_SEARCH: 'Advanced User Search',
  SEARCH_BY_NAME_EMAIL_USERNAME: 'Search by name, email, or username...',
  USER_TYPE_FILTER: 'User Type Filter',
  ALL_USER_TYPES: 'All User Types',
  MANAGERS_ONLY: 'Managers Only',
  WORKERS_ONLY: 'Workers Only',
  STUDENTS_ONLY: 'Students Only',
  ACTIVITY_STATUS: 'Activity Status',
  ALL_USERS: 'All Users',
  ASSIGNED_USERS: 'Assigned Users',
  UNASSIGNED_USERS: 'Unassigned Users',
  INCLUDE_INACTIVE: 'Include Inactive',
  CLEAR_ALL_FILTERS: 'Clear Filters',
  
  // User Table
  LOADING_USERS: 'Loading users...',
  USERS_LOAD_ERROR: 'Failed to load users',
  ADMIN_NO_USERS_FOUND: 'No users found',
  TRY_ADJUSTING_FILTERS: 'Try adjusting your search filters',
  CURRENT_ACTIVITY: 'Current Activity',
  CURRENT_TEAM: 'Current Team',
  ASSIGNED_AT: 'Assigned At',
  NO_TEAM: 'No Team',
  TEAM_LEADER: 'Team Leader',
  TEAM_MEMBER: 'Team Member',
  N_A: 'N/A',
  
  // User Actions
  ASSIGN_TO_ACTIVITY: 'Assign to Activity',
  TRANSFER_TO_ANOTHER_ACTIVITY: 'Transfer to Another Activity',
  REMOVE_FROM_ACTIVITY: 'Remove from Activity',
  BULK_ASSIGN: 'Bulk Assign',
  
  // Assignment Dialog
  ASSIGN_USER_TO_ACTIVITY: 'Assign User to Activity',
  SELECT_ACTIVITY: 'Select Activity',
  ASSIGNMENT_REASON_PLACEHOLDER: 'Enter reason for assignment (optional)',
  FORCE_ASSIGNMENT: 'Force Assignment (Override Constraints)',
  ASSIGN: 'Assign',
  ASSIGNMENT_ERROR: 'Failed to assign user to activity',
  
  // Transfer Dialog
  TRANSFER_USER_ACTIVITY: 'Transfer User to Another Activity',
  SELECT_NEW_ACTIVITY: 'Select New Activity',
  TRANSFER_REASON_PLACEHOLDER: 'Enter reason for transfer (optional)',
  TRANSFER: 'Transfer',
  TRANSFER_ERROR: 'Failed to transfer user',
  
  // Bulk Operations
  BULK_ASSIGNMENT: 'Bulk Assignment',
  BULK_ASSIGN_USERS: 'Bulk Assign Users',
  BULK_ASSIGN_DESCRIPTION: 'Assign multiple selected users to the same activity at once.',
  BULK_ASSIGNMENT_REASON_PLACEHOLDER: 'Enter reason for bulk assignment (optional)',
  BULK_ASSIGNMENT_ERROR: 'Failed to perform bulk assignment',
  BULK_OPERATION_RESULTS: 'Bulk Operation Results',
  USERS_SUCCESSFULLY_ASSIGNED: 'users successfully assigned',
  FAILED_ASSIGNMENTS: 'Failed Assignments',
  SKIPPED_ASSIGNMENTS: 'Skipped Assignments',
  SKIPPED: 'Skipped',
  REMOVE_USER_ERROR: 'Failed to remove user from activity',
  
  // Team Management Panel
  LOADING_TEAMS: 'Loading teams...',
  TEAMS_LOAD_ERROR: 'Failed to load teams',
  NO_TEAMS_FOUND: 'No teams found',
  NO_TEAMS_MESSAGE: 'No teams match your search criteria',
  TEAM_SEARCH_FILTERS: 'Team Search & Filters',
  SEARCH_TEAMS: 'Search Teams',
  SEARCH_BY_TEAM_NAME: 'Search by team name...',
  ALL_ACTIVITIES: 'All Activities',
  SORT_BY: 'Sort By',
  TEAM_NAME: 'Team Name',
  CREATED_DATE: 'Created Date',
  MEMBER_COUNT: 'Member Count',
  CLEAR: 'Clear',
  
  // Team Table
  TEAM: 'Team',
  ACTIVITY: 'Activity',
  LEADER: 'Leader',
  MEMBERS: 'Members',
  CREATED: 'Created',
  FULL: 'Full',
  OPEN: 'Open',
  CLOSED: 'Closed',
  VIEW_MEMBERS: 'View Members',
  
  // Team Actions
  VIEW_TEAM_DETAILS: 'View Team Details',
  ASSIGN_USER_TO_TEAM: 'Assign User to Team',
  DISBAND_TEAM: 'Disband Team',
  
  // Team Details Dialog
  TEAM_DETAILS: 'Team Details',
  DESCRIPTION: 'Description',
  TEAM_NO_DESCRIPTION: 'No description available',
  NO_TEAM_MEMBERS: 'No team members yet',
  TEAM_MEMBERS_LOADING: 'Loading team members...',
  IMPLEMENT_TEAM_MEMBERS_API: 'Team members API implementation needed',
  
  // Team Assignment Dialog
  CURRENT_MEMBERS: 'Current Members',
  SELECT_USER: 'Select User',
  TEAM_ASSIGNMENT_REASON_PLACEHOLDER: 'Enter reason for team assignment (optional)',
  TEAM_ASSIGNMENT_ERROR: 'Failed to assign user to team',
  
  // Team Disbanding
  DISBAND_TEAM_WARNING: 'This will permanently disband the team and remove all members.',
  DISBAND_REASON_PLACEHOLDER: 'Enter reason for disbanding team (required)',
  DISBAND: 'Disband',
  TEAM_DISBAND_ERROR: 'Failed to disband team',
  
  // Team Statistics
  USERS_IN_TEAMS: 'Users in Teams',
  USERS_WITHOUT_TEAMS: 'Users without Teams',
  AVERAGE_TEAM_SIZE: 'Average Team Size',
  TEAMS_BY_ACTIVITY: 'Teams by Activity',
  TOTAL_MEMBERS: 'Total Members',
  TEAM_AVERAGE_SIZE: 'Average Size',
  
  // Statistics Panel
  COMPREHENSIVE_STATISTICS: 'Comprehensive Statistics & Analytics',
  LOADING_COMPREHENSIVE_STATISTICS: 'Loading statistics...',
  NO_STATISTICS_AVAILABLE: 'No statistics available',
  REFRESH_STATISTICS: 'Refresh Statistics',
  EXPORT_REPORT: 'Export Report',
  
  // Overall Participation
  OVERALL_PARTICIPATION: 'Overall Participation',
  PARTICIPATION_RATE: 'Participation Rate',
  OF_TOTAL_USERS: 'of total users',
  
  // User Type Breakdown
  USER_TYPE_BREAKDOWN: 'User Type Breakdown',
  WITH_ACTIVITY: 'With Activity',
  WITHOUT_ACTIVITY: 'Without Activity',
  
  // Activity Statistics Table
  COMPLETION_RATE: 'Completion Rate',
  NO_ACTIVITIES_WITH_PARTICIPANTS: 'No activities with participants',
  
  // Recent Activity Trends
  RECENT_ACTIVITY_TRENDS: 'Recent Activity Trends',
  
  // Export Panel
  DATA_EXPORT_REPORTS: 'Data Export & Reports',
  EXPORT_CONFIGURATION: 'Export Configuration',
  EXPORT_FORMAT: 'Export Format',
  CSV_DESCRIPTION: 'Comma-separated values format, compatible with Excel and other spreadsheet applications',
  EXCEL_DESCRIPTION: 'Native Excel format with rich formatting and multiple sheets support',
  JSON_DESCRIPTION: 'JavaScript Object Notation format, ideal for data processing and APIs',
  INCLUDE_OPTIONS: 'Include Options',
  INCLUDE_UNASSIGNED_USERS: 'Include Unassigned Users',
  EXPORT_INCLUDE_INACTIVE_USERS: 'Include Inactive Users',
  EXPORT_FIELDS: 'Export Fields',
  OPTIONAL: 'Optional',
  EXPORT_FIELDS_DESCRIPTION: 'Select specific fields to include in the export. If none selected, all fields will be included.',
  SELECTED_FIELDS: 'Selected Fields',
  
  // Export Fields
  USERNAME: 'Username',
  EMAIL: 'Email',
  FIRST_NAME: 'First Name',
  LAST_NAME: 'Last Name',
  ACTIVE_STATUS: 'Active Status',
  TEAM_ROLE: 'Team Role',
  
  // Export Actions
  RESET: 'Reset',
  START_EXPORT: 'Start Export',
  EXPORTING: 'Exporting...',
  EXPORT_COMPLETED_SUCCESSFULLY: 'Export completed successfully',
  EXPORT_FAILED: 'Export failed',
  
  // Export History
  EXPORT_HISTORY: 'Export History',
  REFRESH_HISTORY: 'Refresh History',
  NO_EXPORT_HISTORY: 'No export history available',
  RECORDS: 'records',
  EXPIRES: 'Expires',
  EXPIRED: 'Expired',
  DOWNLOAD: 'Download',
  
  // Export Result Dialog
  EXPORT_COMPLETED: 'Export Completed',
  EXPORT_DETAILS: 'Export Details',
  FILENAME: 'Filename',
  FORMAT: 'Format',
  RECORD_COUNT: 'Record Count',
  EXPIRES_AT: 'Expires At',
  DOWNLOAD_NOW: 'Download Now',
  
  
  // Misc
  VIEW_DETAILS: 'View Details',
  PARTICIPANTS_COUNT: 'Participants Count',
  NO_EMAIL: 'No Email',

  // ============= ERROR HANDLING AND VALIDATION =============
  
  // Enhanced Error Display
  ERROR_OCCURRED: 'An Error Occurred',
  TRY_AGAIN: 'Try Again',
  HIDE_DETAILS: 'Hide Details',
  SHOW_DETAILS: 'Show Details',
  REPORT_ISSUE: 'Report Issue',
  ERROR_REPORT: 'Error Report',
  COPY_ERROR_REPORT: 'Copy Error Report',
  ERROR_COPIED: 'Copied!',
  TECHNICAL_DETAILS: 'Technical Details:',
  ADDITIONAL_DETAILS: 'Additional Details:',
  ERROR_CONTEXT: 'Context',
  TECHNICAL_MESSAGE: 'Technical Message',
  
  // Error Types
  INPUT_VALIDATION_ERROR: 'Input Validation Error',
  ERROR_PERMISSION_DENIED: 'Permission Denied',
  OPERATION_NOT_ALLOWED: 'Operation Not Allowed',
  RESOURCE_NOT_FOUND: 'Resource Not Found',
  ERROR_NETWORK_ERROR: 'Network Error',
  SERVER_ERROR: 'Server Error',
  REQUEST_TIMEOUT: 'Request Timeout',
  RATE_LIMIT_EXCEEDED: 'Rate Limit Exceeded',
  DATA_CONFLICT: 'Data Conflict',
  
  // Validation Messages
  FIELD_REQUIRED: 'This field is required',
  INVALID_FORMAT: 'Invalid format',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_UUID: 'Invalid ID format',
  INVALID_DATE_RANGE: 'End date must be after start date',
  INVALID_USER_TYPE: 'Please select a valid user type',
  INVALID_STATUS: 'Please select a valid status',
  TEXT_TOO_LONG: 'Text is too long (maximum {{max}} characters)',
  TEXT_TOO_SHORT: 'Text is too short (minimum {{min}} characters)',
  INVALID_PAGE_SIZE: 'Page size must be between 1 and 100',
  TOO_MANY_ITEMS: 'Cannot process more than {{max}} items at once',
  
  // Business Logic Errors
  USER_ALREADY_ASSIGNED: 'This user is already assigned to an activity',
  ACTIVITY_CAPACITY_EXCEEDED: 'The activity has reached its maximum capacity',
  ACTIVITY_NOT_ACTIVE: 'This activity is not currently active',
  ACTIVITY_ENDED: 'This activity has ended',
  TEAM_FULL: 'This team is full',
  TEAM_DISBANDED: 'This team has been disbanded',
  CANNOT_REMOVE_TEAM_LEADER: 'Cannot remove team leader',
  ONE_ACTIVITY_CONSTRAINT: 'Users can only be assigned to one activity at a time',
  ASSIGNMENT_DEADLINE_PASSED: 'The assignment deadline has passed',
  
  // Network and Server Errors
  CONNECTION_ERROR: 'Connection error. Please check your internet connection.',
  SERVER_UNAVAILABLE: 'Server is temporarily unavailable. Please try again later.',
  REQUEST_TIMEOUT_ERROR: 'Request timed out. Please try again.',
  SERVICE_ERROR: 'Service error. Please contact support if this persists.',
  
  // Retry Messages
  RETRYING: 'Retrying...',
  RETRY_ATTEMPT: 'Retry attempt {{attempt}} of {{max}}',
  RETRY_IN_SECONDS: 'Retrying in {{seconds}} seconds...',
  MAX_RETRIES_REACHED: 'Maximum retry attempts reached',
  RETRY_FAILED: 'Retry failed',
  
  // Batch Operation Messages
  BATCH_PROCESSING: 'Processing batch {{current}} of {{total}}...',
  PARTIAL_SUCCESS: 'Operation partially completed',
  BATCH_COMPLETE: 'Batch operation completed',
  ITEMS_PROCESSED: '{{completed}} of {{total}} items processed successfully',
  ITEMS_FAILED: '{{failed}} items failed to process',
  
  // Help and Support
  CONTACT_SUPPORT: 'Contact Support',
  ERROR_CODE: 'Error Code',
  REPORT_BUG: 'Report Bug',
  HELP_IMPROVE: 'Help us improve by reporting this issue',
  
  // Recovery Actions
  REFRESH_PAGE: 'Refresh Page',
  GO_BACK: 'Go Back',
  TRY_DIFFERENT_ACTION: 'Try a different action',
  CHECK_CONNECTION: 'Check your internet connection',
  
  // Progress and Status
  VALIDATING_INPUT: 'Validating input...',
  CHECKING_PERMISSIONS: 'Checking permissions...',
  PROCESSING_REQUEST: 'Processing request...',
  OPERATION_IN_PROGRESS: 'Operation in progress...',
  PLEASE_WAIT: 'Please wait...',
};

export default activityManagement; 