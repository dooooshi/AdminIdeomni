const adminManagement = {
	// Page titles and headers
	ADMIN_MANAGEMENT: 'Administrator Management',
	ADMIN_MANAGEMENT_SUBTITLE: 'Manage administrator accounts and monitor operations.',
	ADMIN_ACCOUNTS: 'Admin Accounts',
	SYSTEM_LOGS: 'System Logs',
	
	// Common actions
	CREATE_ADMIN: 'Create Admin',
	EDIT_ADMIN: 'Edit Admin',
	DELETE_ADMIN: 'Delete Admin',
	VIEW_LOGS: 'View Logs',
	REFRESH_DATA: 'Refresh Data',
	
	// Admin List
	USERNAME: 'Username',
	EMAIL: 'Email',
	FIRST_NAME: 'First Name',
	LAST_NAME: 'Last Name',
	ADMIN_TYPE: 'Admin Type',
	STATUS: 'Status',
	LAST_LOGIN: 'Last Login',
	CREATED_AT: 'Created',
	ACTIONS: 'Actions',
	ADMIN: 'Admin',
	
	// Admin Types
	SUPER_ADMIN: 'Super Admin',
	LIMITED_ADMIN: 'Limited Admin',
	ADMIN_TYPE_1: 'Super Admin',
	ADMIN_TYPE_2: 'Limited Admin',
	
	// Status
	ACTIVE: 'Active',
	INACTIVE: 'Inactive',
	
	// Filters
	SEARCH_PLACEHOLDER: 'Search admins...',
	FILTER_BY_TYPE: 'Filter by Type',
	FILTER_BY_STATUS: 'Filter by Status',
	FILTER_BY_ROLE: 'Filter by Role',
	ALL_TYPES: 'All Types',
	ALL_STATUSES: 'All Statuses',
	ALL_ROLES: 'All Roles',
	
	// Statistics
	TOTAL_ADMINS: 'Total Admins',
	ACTIVE_ADMINS: 'Active Admins',
	SUPER_ADMINS: 'Super Admins',
	LIMITED_ADMINS: 'Limited Admins',
	
	// Admin Form
	ADMIN_FORM_CREATE_TITLE: 'Create New Administrator',
	ADMIN_FORM_EDIT_TITLE: 'Edit Administrator',
	ADMIN_FORM_BASIC_INFO: 'Basic Information',
	ADMIN_FORM_EDITING_INFO: 'Editing: {{username}} ({{email}})',
	USERNAME_LABEL: 'Username',
	USERNAME_PLACEHOLDER: 'Enter username',
	EMAIL_LABEL: 'Email Address',
	EMAIL_PLACEHOLDER: 'Enter email address',
	PASSWORD_LABEL: 'Password',
	PASSWORD_PLACEHOLDER: 'Enter password',
	PASSWORD_EDIT_HINT: '(leave blank to keep current)',
	CONFIRM_PASSWORD_LABEL: 'Confirm Password',
	CONFIRM_PASSWORD_PLACEHOLDER: 'Confirm password',
	FIRST_NAME_LABEL: 'First Name',
	FIRST_NAME_PLACEHOLDER: 'Enter first name',
	LAST_NAME_LABEL: 'Last Name',
	LAST_NAME_PLACEHOLDER: 'Enter last name',
	ADMIN_TYPE_LABEL: 'Administrator Type',
	ADMIN_TYPE_HELP: 'Select the level of administrative access',
	SUPER_ADMIN_DESCRIPTION: 'Full system access with all permissions',
	LIMITED_ADMIN_DESCRIPTION: 'Restricted access with limited permissions',
	IS_ACTIVE_LABEL: 'Active Status',
	IS_ACTIVE_HELP: 'Whether this admin account is currently active',
	
	// Form validation
	USERNAME_REQUIRED: 'Username is required',
	USERNAME_MIN_LENGTH: 'Username must be at least 3 characters',
	USERNAME_MAX_LENGTH: 'Username must be less than 50 characters',
	USERNAME_INVALID_CHARS: 'Username can only contain letters, numbers, and underscores',
	EMAIL_REQUIRED: 'Email is required',
	EMAIL_INVALID: 'Please enter a valid email address',
	PASSWORD_REQUIRED: 'Password is required',
	PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters',
	FIRST_NAME_MAX_LENGTH: 'First name must be less than 100 characters',
	LAST_NAME_MAX_LENGTH: 'Last name must be less than 100 characters',
	ADMIN_TYPE_INVALID: 'Invalid admin type',
	PASSWORDS_MUST_MATCH: 'Passwords must match',
	ADMIN_TYPE_REQUIRED: 'Admin type is required',
	
	// Form actions
	CREATE_ADMIN_BUTTON: 'Create Administrator',
	UPDATE_ADMIN_BUTTON: 'Update Administrator',
	CANCEL_BUTTON: 'Cancel',
	SAVE_BUTTON: 'Save',
	
	// Accessibility labels
	TOGGLE_PASSWORD_VISIBILITY: 'Toggle password visibility',
	
	// Success messages
	ADMIN_CREATED_SUCCESS: 'Administrator created successfully',
	ADMIN_UPDATED_SUCCESS: 'Administrator updated successfully',
	ADMIN_DELETED_SUCCESS: 'Administrator deleted successfully',
	
	// Error messages
	ADMIN_CREATE_ERROR: 'Failed to create administrator',
	ADMIN_UPDATE_ERROR: 'Failed to update administrator',
	ADMIN_DELETE_ERROR: 'Failed to delete administrator',
	ADMIN_LOAD_ERROR: 'Failed to load administrators',
	FAILED_TO_LOAD_ADMINS: 'Failed to load admins',
	FAILED_TO_DELETE_ADMIN: 'Failed to delete admin',
	FAILED_TO_SAVE_ADMIN: 'Failed to save admin',
	
	// Delete confirmation
	DELETE_ADMIN_TITLE: 'Delete Administrator',
	DELETE_ADMIN_MESSAGE: 'Are you sure you want to delete this administrator? This action cannot be undone.',
	DELETE_ADMIN_WARNING: 'This action cannot be undone and will permanently remove the administrator account.',
	DELETE_ADMIN_CONFIRM: 'Delete',
	DELETE_ADMIN_CANCEL: 'Cancel',
	
	// Operation Logs
	OPERATION_LOGS: 'Operation Logs',
	ADMIN_LOGS_TITLE: 'Administrator Logs',
	SYSTEM_LOGS_TITLE: 'System Operation Logs',
	OPERATION_LOGS_SUBTITLE: 'View comprehensive operation logs and audit trails',
	SEARCH_LOGS_PLACEHOLDER: 'Search logs...',
	
	// Log columns
	LOG_ID: 'Log ID',
	ADMIN: 'Admin',
	ACTION: 'Action',
	RESOURCE: 'Resource',
	RESOURCE_ID: 'Resource ID',
	TIMESTAMP: 'Timestamp',
	DURATION: 'Duration',
	SUCCESS: 'Success',
	IP_ADDRESS: 'IP Address',
	USER_AGENT: 'User Agent',
	DESCRIPTION: 'Description',
	
	// Log filters
	FILTER_BY_ACTION: 'Filter by Action',
	FILTER_BY_SUCCESS: 'Filter by Status',
	FILTER_BY_RESOURCE: 'Filter by Resource',
	ALL_ACTIONS: 'All Actions',
	ALL_RESOURCES: 'All Resources',
	SUCCESSFUL_ONLY: 'Successful Only',
	FAILED_ONLY: 'Failed Only',
	DATE_RANGE: 'Date Range',
	START_DATE: 'Start Date',
	END_DATE: 'End Date',
	
	// Log actions
	LOGIN: 'Login',
	LOGOUT: 'Logout',
	CREATE_USER: 'Create User',
	UPDATE_USER: 'Update User',
	DELETE_USER: 'Delete User',
	CREATE_ADMIN: 'Create Admin',
	UPDATE_ADMIN: 'Update Admin',
	DELETE_ADMIN: 'Delete Admin',
	CHANGE_PASSWORD: 'Change Password',
	VIEW_LOGS: 'View Logs',
	
	// Log status
	SUCCEEDED: 'Succeeded',
	FAILED: 'Failed',
	
	// Log details
	LOG_DETAILS: 'Log Details',
	OPERATION_DETAILS: 'Operation Details',
	EXPAND_DETAILS: 'Expand Details',
	COLLAPSE_DETAILS: 'Collapse Details',
	METADATA: 'Metadata',
	REQUEST_BODY: 'Request Body',
	RESPONSE_SIZE: 'Response Size',
	ERROR_MESSAGE: 'Error Message',
	ERROR_CODE: 'Error Code',
	CHANGES: 'Changes',
	
	// Common values
	NOT_AVAILABLE: 'N/A',
	UNKNOWN: 'Unknown',
	
	// Time formatting
	MILLISECONDS: 'ms',
	SECONDS: 's',
	MINUTES_AGO: 'minutes ago',
	HOURS_AGO: 'hours ago',
	DAYS_AGO: 'days ago',
	JUST_NOW: 'Just now',
	
	// Data states
	NO_DATA: 'No data available',
	NO_ADMINS_FOUND: 'No administrators found',
	NO_LOGS_FOUND: 'No operation logs found',
	LOADING_ADMINS: 'Loading administrators...',
	LOADING_LOGS: 'Loading operation logs...',
	
	// Pagination
	ROWS_PER_PAGE: 'Rows per page',
	PAGE_OF: 'of',
	FIRST_PAGE: 'First page',
	PREVIOUS_PAGE: 'Previous page',
	NEXT_PAGE: 'Next page',
	LAST_PAGE: 'Last page',
	
	// Permissions
	INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
	SUPER_ADMIN_REQUIRED: 'Super admin access required',
	PERMISSION_DENIED: 'Permission denied',
	
	// Security warnings
	SECURITY_WARNING: 'Security Warning',
	SUPER_ADMIN_WARNING: 'Creating a super administrator grants full system access. Ensure this is intended.',
	PASSWORD_SECURITY: 'Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and symbols.',
	
	// General
	LOADING: 'Loading...',
	ERROR: 'Error',
	SUCCESS: 'Success',
	WARNING: 'Warning',
	INFO: 'Information',
	UNKNOWN: 'Unknown',
	NEVER: 'Never',
	YES: 'Yes',
	NO: 'No',
	
	// Open System Logs
	OPEN_SYSTEM_LOGS_VIEWER: 'Open System Logs Viewer',
	SYSTEM_LOGS_DESCRIPTION: 'View comprehensive system-wide operation logs and audit trails.',
	
	// Admin management info
	ADMIN_MANAGEMENT_INFO: 'Super Admin Access Required',
	ADMIN_MANAGEMENT_INFO_DESCRIPTION: 'This page provides comprehensive admin management capabilities including account creation, modification, and operation logs monitoring. Some features may be restricted based on your admin type and permissions.'
};

export default adminManagement; 